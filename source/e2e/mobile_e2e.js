/* E2E موبایل مود: هیرو موبایل + دراور + چیدمان گوشی */
const { chromium } = require('playwright-core');
const EXE = process.env.CHROME || '/home/user/.cache/ms-playwright/chromium-1140/chrome-linux/chrome';
const BASE = process.env.BASE || 'http://127.0.0.1:8181/index.html';
(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true,
    args: ['--no-sandbox', '--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=swiftshader', '--disable-dev-shm-usage'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });
  const ok = (c, msg) => console.log((c ? 'PASS' : 'FAIL') + ' | ' + msg);
  const realErrors = () => errors.filter(e => !/arcTo/.test(e));
  const css = sel => page.evaluate((s) => { const el = document.querySelector(s); return el ? getComputedStyle(el) : null; }, sel);

  await page.goto(BASE, { waitUntil: 'load', timeout: 30000 });
  // 1) هیرو موبایل: در طول اینترو، تگلاین + دکمهٔ ورود (hero CTA)
  await page.waitForSelector('#l3d-enter', { timeout: 15000 });
  const noTag = await page.evaluate(() => !document.querySelector('.l3d-hero-tag') && !/همین حالا وارد شو/.test(document.body.innerText));
  ok(noTag, 'متن اضافهٔ ورودی («همین حالا وارد شو…») از صفحهٔ اول حذف شده است');
  await page.waitForFunction(() => window.__L3D && window.__L3D.state().introDone, null, { timeout: 22000 });
  await page.waitForFunction(() => document.getElementById('l3d-intro').classList.contains('l3d-hide'), null, { timeout: 5000 });
  const box = await page.evaluate(() => {
    const el = document.querySelector('#l3d-enter'); const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return { top: r.top, h: r.height, w: r.width, bottom: r.bottom, cx: r.left + r.width/2, fs: parseFloat(cs.fontSize) };
  });
  const vw = page.viewportSize().width, vh = page.viewportSize().height;
  ok(box.top < 60 && box.bottom < vh * 0.25, 'v7: دکمهٔ «ورود اعضا» در موبایل بالای صفحه است (top=' + Math.round(box.top) + 'px)');
  ok(box.w < vw * 0.8 && box.h < 46 && box.fs <= 13, 'v7: دکمهٔ ورود کوچک شد (w=' + Math.round(box.w) + ' h=' + Math.round(box.h) + ' font=' + box.fs + ')');
  ok(Math.abs(box.cx - vw/2) < 24, 'v7: دکمهٔ ورود در وسط افقی صفحه است');
  ok(box.bottom < vh - 60, 'v7: دکمهٔ ورود دیگر پایین صفحه بریده نمی‌شود');
  const bgPos = await page.evaluate(() => getComputedStyle(document.querySelector('#l3d-bg')).backgroundPosition);
  ok(/^(1|2)[0-9](\.\d+)?%/.test(bgPos.trim()), 'v7: پس‌زمینهٔ لابی در موبایل به سمت چپ تصویر جابه‌جا شد (' + bgPos + ')');
  const rc = await page.evaluate(() => {
    const r = document.querySelector('#l3d-reception').getBoundingClientRect();
    return r.left + r.width/2;
  });
  ok(Math.abs(rc - vw/2) < 30, 'v7: هات‌اسپات خانم رسپشن وسط قاب موبایل است (cx=' + Math.round(rc) + ')');
  // 2) ورود عضو p1
  await page.click('#l3d-enter', { force: true });
  await page.waitForTimeout(1000);
  await page.fill('#login-user', 'p1');
  await page.fill('#login-pass', 'golf1405');
  await page.click('#login-form button[type="submit"]');
  await page.waitForTimeout(1800);
  // 3) دراور موبایل
  ok((await css('.menu-btn')).display !== 'none', 'دکمهٔ ☰ منو در موبایل دیده می‌شود');
  await page.click('#menu-btn');
  await page.waitForTimeout(800);
  const opened = await page.evaluate(() => document.body.classList.contains('nav-open'));
  ok(opened, 'دراور با ☰ باز می‌شود (body.nav-open)');
  const sidebarRight = await page.evaluate(() => getComputedStyle(document.querySelector('.sidebar')).right);
  ok(sidebarRight === '0px', 'منوی کشویی به موقعیت باز رسید');
  const navItems = await page.evaluate(() => [...document.querySelectorAll('#app .nav-item')].filter(n => getComputedStyle(n).display !== 'none').map(n => n.dataset.page));
  ok(navItems.length >= 1, 'آیتم‌های منو در دراور قابل مشاهده‌اند');
  await page.click('.nav-item[data-page="memberzone"]');
  await page.waitForTimeout(900);
  const closed = await page.evaluate(() => !document.body.classList.contains('nav-open'));
  ok(closed, 'انتخاب آیتم، دراور را می‌بندد');
  // 4) چیدمان گوشی: تب‌ها + جدول‌ها
  const tabs = await page.locator('[data-mtab]').count();
  ok(tabs >= 4, 'بخش اعضا ۴ تب دارد (خانه/سکه/راهنما/اوتار)');
  const mainMrg = await page.evaluate(() => getComputedStyle(document.querySelector('.main')).marginRight);
  ok(mainMrg === '0px', 'بدنهٔ اصلی در موبایل تمام‌عرض است (سایدبار کشویی)');
  // 5) تب اوتار: گالری و دکمه‌های خرید در موبایل
  await page.click('[data-mtab="avatar"]');
  await page.waitForTimeout(800);
  const buyBtns = await page.locator('[data-buy]').count();
  ok(buyBtns >= 8, 'گالری اوتار با دکمه‌های خرید در موبایل نمایش داده می‌شود');
  // 6) گرید تک‌ستونه در موبایل (ترک اول تقریباً تمام‌عرض؛ ترک‌های ضمنی span نادیده گرفته می‌شوند)
  const disp = await page.evaluate(() => {
    const grid = document.querySelector('#view .grid');
    if (!grid) return null;
    return getComputedStyle(grid).gridTemplateColumns;
  });
  const firstCol = disp ? parseFloat(disp.split(' ')[0]) : 0;
  ok(firstCol > 390 * 0.75, 'گرید صفحات در موبایل تک‌ستونه است (' + disp + ')');
  ok(realErrors().length === 0, 'بدون خطای صفحه/کنسول' + (realErrors().length ? ' → ' + realErrors()[0] : ''));
  if (realErrors().length) console.log(realErrors().join('\n'));
  await browser.close();
})().catch(e => { console.error('FATAL', e && e.message); process.exit(1); });
