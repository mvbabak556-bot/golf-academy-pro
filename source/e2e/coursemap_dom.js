/* E2E بدون مرورگر (jsdom) — تست صفحهٔ نقشهٔ زمین گلف مسجدسلیمان (course-map.html)
 *
 * اسکریپتِ داخل صفحه را واقعاً اجرا می‌کند و رفتار زوم/پن/انتخاب هول/تول‌گل‌ها/خروجی SVG را می‌سنجد.
 *
 * اجرا (نیاز به jsdom — یک بار):
 *   npm i jsdom        # در هر دایرکتوری، یا همین‌جا
 *   node source/e2e/coursemap_dom.js
 *
 * صفحهٔ مورد آزمون: متغیر محیطی PAGE یا به‌صورت پیش‌فرض course-map.html ریشهٔ مخزن.
 */
'use strict';
const { readFileSync } = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const file = process.env.PAGE || path.join(__dirname, '..', '..', 'course-map.html');
const VW = 900, VH = 620;
let pass = 0, fail = 0;
const ok = (c, msg) => { c ? pass++ : fail++; console.log((c ? 'PASS' : 'FAIL') + ' | ' + msg); };

const vc = new VirtualConsole();
vc.on('jsdomError', e => { fail++; console.log('FAIL | pageerror: ' + e.message); });
vc.on('error', (...a) => { fail++; console.log('FAIL | console.error: ' + a.join(' ')); });

const dom = new JSDOM(readFileSync(file, 'utf8'), {
  runScripts: 'dangerously', pretendToBeVisual: true, url: 'file://' + file, virtualConsole: vc,
  // jsdom موتور چیدمان ندارد: پیش از اجرای اسکریپت صفحه، اندازهٔ viewport را می‌دهیم
  beforeParse(w) {
    Object.defineProperty(w.HTMLElement.prototype, 'clientWidth', { get() { return this.id === 'map-viewport' ? VW : 0; } });
    Object.defineProperty(w.HTMLElement.prototype, 'clientHeight', { get() { return this.id === 'map-viewport' ? VH : 0; } });
  },
});
const { window } = dom;
const doc = window.document;
const $ = s => doc.querySelector(s);
const $$ = s => [...doc.querySelectorAll(s)];

const CM = window.CourseMap;
ok(!!CM, 'اسکریپت داخل صفحه اجرا شد و window.CourseMap را ساخت');
ok(!!CM && CM.HOLES.length === 18, 'HOLES هجده رکورد دارد');
ok(!!CM && CM.HOLES.reduce((a, h) => a + h.yards, 0) === 4325, 'جمع یارد = 4325');
ok(!!CM && CM.HOLES.reduce((a, h) => a + h.par, 0) === 71, 'جمع پار = 71');

ok($('#map-svg') && $('#map-svg').getAttribute('viewBox') === '0 0 1123 794', 'viewBox نقشه 0 0 1123 794');
ok($$('#map-svg .hole').length === 18, '۱۸ گروه هول روی نقشه');
ok($$('#map-svg .tee').length === 18, '۱۸ تی‌باکس روی نقشه');
ok($$('#map-svg .teelabel').length === 18, '۱۸ برچسب تی‌باکس روی نقشه');
ok($('#route').getAttribute('points').split(/\s+/).length === 36, 'مسیر پیمایش ۳۶ نقطه دارد (۱۸ تی + ۱۸ گرین)');
ok($$('#scorecard tbody tr[data-n]').length === 18, 'جدول کارت امتیاز ۱۸ سطر کلیکی دارد');
const foot = $('#scorecard tfoot').textContent;
ok(foot.includes('۴٬۳۲۵') && foot.includes('۷۱'), 'پانوشت جدول TOTAL ۴٬۳۲۵ یارد / پار ۷۱ را نشان می‌دهد');

// کلیک روی سطر → همان هول روی نقشه و کارت فعال می‌شود
$$('tbody tr[data-n]')[6].dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
ok(CM.state().active === 7, 'کلیک روی سطر ۷ هول ۷ را انتخاب می‌کند');
ok($('#hole-7').classList.contains('on'), 'گروه نقشهٔ #hole-7 هایلایت شد');
ok(!$('#hole-8').classList.contains('on'), 'هول‌های دیگر هایلایت نشدند');
ok($('#tee-7').classList.contains('on') && $('#fw-7').classList.contains('on'), 'تی و فیروی هول ۷ هم هایلایت شدند');
ok($('#hole-card').textContent.includes('۱۵۰'), 'کارت هول، ۱۵۰ یارد هول ۷ را نشان می‌دهد');
ok(doc.body.classList.contains('dimmed'), 'بقیهٔ نقشه هنگام انتخاب هول کم‌رنگ شد');

// کلیدهای جهت‌دار بین هول‌ها حرکت می‌کنند
const key = k => doc.dispatchEvent(new window.KeyboardEvent('keydown', { key: k, bubbles: true }));
key('ArrowLeft');
ok(CM.state().active === 8, 'ArrowLeft از ۷ به ۸ می‌رود');
key('ArrowRight'); key('ArrowRight');
ok(CM.state().active === 6, 'ArrowRight از ۸ به ۷ و ۶ برمی‌گردد');
key('Escape');
ok(CM.state().active === 0 && !doc.body.classList.contains('dimmed'), 'Escape انتخاب را پاک می‌کند');

// کلیک روی خود نقشه، هول زیر اشاره‌گر را انتخاب می‌کند
$('#hole-12 .grn').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
ok(CM.state().active === 12, 'کلیک روی گرین ۱۲ هول ۱۲ را انتخاب می‌کند');

// تول‌گل‌های نوار ابزار
const tg = id => { const c = $('#' + id); c.checked = !c.checked; c.dispatchEvent(new window.Event('change', { bubbles: true })); };
tg('tg-labels'); ok(doc.body.classList.contains('no-labels'), 'کلید برچسب‌ها کلاس .no-labels را می‌افزاید');
tg('tg-labels'); ok(!doc.body.classList.contains('no-labels'), 'کلید برچسب‌ها آن را برمی‌دارد');
tg('tg-route'); ok(doc.body.classList.contains('show-route'), 'کلید مسیر کلاس .show-route را می‌افزاید');
tg('tg-card'); ok(doc.body.classList.contains('no-card'), 'کلید کارت امتیاز، کارتِ داخل نقشه را پنهان می‌کند');
tg('tg-legend'); ok(doc.body.classList.contains('no-legend'), 'کلید راهنما، راهنمای داخل نقشه را پنهان می‌کند');
['tg-labels', 'tg-card', 'tg-legend', 'tg-route'].forEach(tg); // برگشت به پیش‌فرض

// ریاضی زوم / فیت / پن
CM.fit();
const fitted = CM.state();
ok(Math.abs(fitted.k - Math.min(VW / 1123, VH / 794) * 0.98) < 1e-9,
   `fit() ورق ۱۱۲۳×۷۹۴ را در ${VW}×${VH} جا می‌دهد (k=${fitted.k.toFixed(3)})`);
ok(Math.abs(fitted.tx - (VW - 1123 * fitted.k) / 2) < 1e-6 && Math.abs(fitted.ty - (VH - 794 * fitted.k) / 2) < 1e-6,
   'fit() ورق را وسط viewport می‌گذارد');
CM.zoom(4);
ok(Math.abs(CM.state().k - 4) < 1e-9, 'zoom(4) ضریب ۴ می‌دهد');
CM.zoom(999); ok(CM.state().k === 6, 'زوم در ۶x سقف دارد');
CM.zoom(0.001); ok(CM.state().k === 0.2, 'زوم در 0.2x کف دارد');

// «زوم روی هول» باید گرین همان هول را وسط viewport بگذارد
CM.setActive(18, true);
const s = CM.state();
ok(Math.abs(s.k - 3) < 1e-9, 'زوم روی هول ضریب ۳ دارد');
ok(Math.abs(s.tx + 3 * 209.8 - VW / 2) < 1e-6 && Math.abs(s.ty + 3 * 249 - VH / 2) < 1e-6,
   `گرین هول ۱۸ (209.8, 249) وسط viewport نشست (tx=${s.tx.toFixed(1)}, ty=${s.ty.toFixed(1)})`);
const tr = $('#map-stage').style.transform;
ok(/^translate\(-?[\d.]+px, ?-?[\d.]+px\) scale\([\d.]+\)$/.test(tr), 'ترنسفورم صحنه خوش‌ساخت است: ' + tr);

// خروجی SVG خوش‌ساخت است و لایه‌های تعاملی را حذف می‌کند
const src = CM.svgSource();
ok(src.startsWith('<?xml') && src.includes('xmlns="http://www.w3.org/2000/svg"'), 'خروجی با اعلان XML و xmlns شروع می‌شود');
ok(!src.includes('class="halo"'), 'خروجی هالهٔ هایلایت را حذف می‌کند');
ok((src.match(/<g id="hole-/g) || []).length === 18, 'خروجی هر ۱۸ هول را نگه می‌دارد');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
