/* ═══════════════ GolfAcademy PRO — App ═══════════════ */
(function(){
  const D = window.Data;
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  /* ذخیره‌سازی امن — در پیش‌نمایش sandbox شده، localStorage در دسترس نیست */
  const store = (() => {
    try {
      localStorage.setItem('__ga_t', '1'); localStorage.removeItem('__ga_t');
      return { get: k => localStorage.getItem(k), set: (k,v) => localStorage.setItem(k, String(v)), remove: k => localStorage.removeItem(k), persistent: true };
    } catch(e) {
      const m = {};
      return { get: k => (k in m ? m[k] : null), set: (k,v) => { m[k] = String(v); }, remove: k => { delete m[k]; }, persistent: false };
    }
  })();

  /* ── احراز هویت (hash محلی) ── */
  function cyrb53(str, seed=0){
    let h1 = 0xdeadbeef^seed, h2 = 0x41c6ce57^seed;
    for (let i=0, ch; i<str.length; i++){
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1^ch, 2654435761);
      h2 = Math.imul(h2^ch, 1597334677);
    }
    h1 = Math.imul(h1^(h1>>>16), 2246822507) ^ Math.imul(h2^(h2>>>13), 3266489909);
    h2 = Math.imul(h2^(h2>>>16), 2246822507) ^ Math.imul(h1^(h1>>>13), 3266489909);
    return (4294967296*(2097151&h2)+(h1>>>0)).toString(36);
  }
  const USERS = { admin: cyrb53('golf1405'), coach: cyrb53('golf1405'), manager: cyrb53('golf1405') };
  const USER_LABEL = { admin: 'مدیر آکادمی', coach: 'مربی ارشد', manager: 'مدیریت' };
  /* یوزر/پسورد بازیکنان (ساختهشده در پلن مدیریت) — فقط بازیکن فعال اجازهٔ ورود دارد */
  function playerUsers(){
    try { return JSON.parse(localStorage.getItem('ga_player_users') || '{}'); } catch(e){ return {}; }
  }
  function buildUsers(){
    const u = Object.assign({}, USERS);
    try {
      const pusers = playerUsers();
      Object.values(pusers).forEach(p => {
        if (p && p.user && p.pass && p.active !== false) u[String(p.user).toLowerCase()] = cyrb53(p.pass);
      });
    } catch(e){}
    return u;
  }
  function userLabelFor(u){
    if (USER_LABEL[u]) return USER_LABEL[u];
    try {
      const pusers = playerUsers();
      const hit = Object.values(pusers).find(p => p && p.user === u);
      if (hit) return 'بازیکن — ' + ((hit.name + ' ' + (hit.family||'')).trim() || u);
    } catch(e){}
    return 'کاربر';
  }

  /* ── State ── */
  let S = null;      // raw state (courses/tournaments/scorecards/activities)
  let A = null;      // analytics
  let currentUser = 'admin';

  function recompute(){
    A = D.compute(S);
    applyStateToForms();
  }

  /* ── ابزارهای کمکی UI ── */
  const avatar = pid => pid % 2 ? 'assets/avatar_m.png' : 'assets/avatar_f.png';
  const ringColor = rk => rk === 'Gold Elite' ? 'gold' : rk === 'Red' ? 'red' : rk === 'Blue' ? 'blue' : rk === 'Green' ? 'green' : 'dim';
  function rankPill(rk){ return `<span class="rank-pill" style="background:${D.RANK_DEF.find(r=>r[0]===rk)[3]}22;color:${D.RANK_DEF.find(r=>r[0]===rk)[3]};border:1px solid ${D.RANK_DEF.find(r=>r[0]===rk)[3]}55">${D.RANK_TEXT[rk]}</span>`; }
  function formChips(form){
    return `<div class="form-chips">${(form||[]).map(f => {
      const m = D.FORM_META[f];
      return m ? `<span class="${m.c}" title="${f}">${m.t}</span>` : `<span>—</span>`;
    }).join('')}</div>`;
  }
  function changeBadge(ch){
    if (ch > 0) return `<span class="chip green">▲ ${D.fa(ch)}</span>`;
    if (ch < 0) return `<span class="chip red">▼ ${D.fa(Math.abs(ch))}</span>`;
    return `<span class="chip dim">—</span>`;
  }
  const medal = r => r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : '';
  function pbar(pct, cls='', w=0){
    return `<div class="pbar ${cls}"><i data-w="${Math.min(100, Math.round(w || pct))}"></i></div>`;
  }

  /* ═══════════ تیلت سه‌بعدی ═══════════ */
  function initTilt(){
    $$('.tilt').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `perspective(900px) rotateY(${x*9}deg) rotateX(${-y*9}deg) translateZ(0)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ═══════════ ذرات شناور ═══════════ */
  function initParticles(){
    const cv = $('#particles'); if (!cv) return;
    const ctx = cv.getContext('2d');
    let W, H, parts = [];
    function resize(){ W = cv.width = innerWidth; H = cv.height = innerHeight; }
    resize(); window.addEventListener('resize', resize);
    const colors = ['212,175,55', '30,187,138', '248,250,252'];
    for (let i = 0; i < 42; i++){
      parts.push({ x: Math.random()*W, y: Math.random()*H, r: Math.random()*2.4+0.6,
        vy: -(Math.random()*0.35+0.08), vx: (Math.random()-0.5)*0.15,
        c: colors[i%3], a: Math.random()*0.5+0.2, tw: Math.random()*0.02+0.005 });
    }
    (function loop(){
      ctx.clearRect(0,0,W,H);
      parts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        p.a += (Math.random()-0.5) * 0.02;
        if (p.a < 0.08) p.a = 0.08; if (p.a > 0.75) p.a = 0.75;
        if (p.y < -10){ p.y = H+10; p.x = Math.random()*W; }
        if (p.x < -10) p.x = W+10; if (p.x > W+10) p.x = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 7);
        ctx.fillStyle = `rgba(${p.c},${p.a})`;
        ctx.shadowColor = `rgba(${p.c},.9)`; ctx.shadowBlur = 10;
        ctx.fill(); ctx.shadowBlur = 0;
      });
      requestAnimationFrame(loop);
    })();
  }

  /* ═══════════ ساعت و تاریخ ═══════════ */
  function tickClock(){
    const now = new Date();
    const j = D.jalaliInfo(now);
    const hh = String(now.getHours()).padStart(2,'0');
    const mm = String(now.getMinutes()).padStart(2,'0');
    const ss = String(now.getSeconds()).padStart(2,'0');
    const el = $('#hud-clock');
    if (el) el.textContent = `${D.fa(hh)}:${D.fa(mm)}:${D.fa(ss)}`;
    const dt = $('#hud-date');
    if (dt) dt.textContent = `${D.fa(j.dd)} ${j.monthFa} ${D.fa(j.yy)}`;
  }

  /* ═══════════ روتر ═══════════ */
  const PAGES = {
    world: { t:'دنیای سه‌بعدی', i:'🌍' },
    cmd: { t:'فرماندهی', i:'🎯' }, race: { t:'رقابت فصل', i:'🏁' },
    player: { t:'مرکز بازیکن', i:'🏌️' }, match: { t:'فرماندهی مسابقه', i:'🥇' },
    course: { t:'هوش زمین', i:'🗺️' }, records: { t:'رکوردها', i:'🎖️' },
    cal: { t:'تقویم فصل', i:'📅' }, tv: { t:'نمایش تلویزیونی', i:'📺' },
    battle: { t:'میدان نبرد', i:'⚔️' }, academy: { t:'پنل آکادمی', i:'🏫' },
    acourses: { t:'طراح زمین', i:'🛠️' }, atournaments: { t:'طراح مسابقه', i:'🛠️' },
    ascorecards: { t:'ثبت نتایج', i:'🛠️' },
    mgmt: { t:'پلن مدیریت', i:'⚙️' }, settings: { t:'تنظیمات نمایش', i:'🛠️' },
  };
  let currentPage = 'cmd';
  let playerSel = 8, matchSel = 11, courseSel = 1, coursePlayerSel = 8;

  function go(page){
    if (!PAGES[page]) page = 'cmd';
    currentPage = page;
    $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page));
    $$('.mob-nav a').forEach(n => n.classList.toggle('on', n.dataset.page === page));
    if (page === 'world'){
      $('#view').innerHTML = '';
      $('#top-title').textContent = '🌍 دنیای سه‌بعدی';
      $('#top-crumb').textContent = 'داشبورد / دنیای سه‌بعدی';
      enterWorld();
      return;
    }
    hideWorld();
    $('#view').innerHTML = '';
    const p = PAGES[page];
    $('#top-title').textContent = `${p.i} ${p.t}`;
    $('#top-crumb').textContent = page.startsWith('a') ? 'ابزار طراح / ' + p.t : 'داشبورد / ' + p.t;
    RENDERERS[page]();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => { initTilt(); runCountups(); growBars(); }, 40);
  }

  function runCountups(){
    $$('.countup').forEach(el => {
      const t = parseFloat(el.dataset.target);
      if (isNaN(t)) return;
      Charts.countUp(el, t, { fmt: v => el.dataset.fmt === 'fa' ? D.faNum(v, 0) : v.toLocaleString('en-US') });
    });
  }
  function growBars(){ $$('.pbar > i').forEach(el => { el.style.width = el.dataset.w + '%'; }); }

  /* ═══════════ صفحه: فرماندهی ═══════════ */
  function pageCmd(){
    const v = $('#view');
    const g = A.GOLD_COUNT;
    const top = A.LB.slice(0, 3);
    v.innerHTML = `
    <div class="glass gold-border" style="padding:0;overflow:hidden;margin-bottom:18px">
      <img src="assets/hero_main.png" class="hero-pano" alt="">
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 30%,rgba(11,15,20,.92));display:flex;flex-direction:column;justify-content:flex-end;padding:26px">
        <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
          <div>
            <h1 style="font-size:26px;font-weight:900" class="gold-text">آکادمی گلف ۱۴۰۵ — فرماندهی</h1>
            <div style="color:var(--muted);font-size:12.5px;margin-top:4px">فصل قهرمانی ۱۴۰۵ • ${D.fa(A.MATCHES_HELD)} مسابقه برگزار شده • ${D.fa(A.LB.length)} بازیکن فعال</div>
          </div>
          <div style="margin-right:auto;display:flex;gap:10px;flex-wrap:wrap;align-items:center">
            <button class="btn sm" onclick="APP.go('mgmt')" style="box-shadow:0 0 16px rgba(212,175,55,.25)">⚙️ پلن مدیریت</button>
            <button class="btn sm ghost" onclick="APP.go('settings')">🛠️ تنظیمات نمایش</button>
            <span class="chip gold">⏳ مسابقه بعدی: ${esc(A.NEXT_T ? A.NEXT_T[1] : '—')} — ${D.fa(A.COUNTDOWN)} روز</span>
            <span class="chip green">🔴 فصل در جریان است</span>
          </div>
        </div>
      </div>
    </div>
    <div class="grid cols-4" id="cmd-stats"></div>
    <div class="grid cols-3" style="margin-top:18px">
      <div class="glass tilt" style="grid-column:span 2">
        <div class="card-head"><span class="ic">🏆</span><h3>سکوی قهرمانی فصل</h3><span class="tag">FedEx Style</span></div>
        <div class="podium">
          ${[1,0,2].map(k => {
            const r = top[k];
            if (!r) return '';
            const hs = [1,0,2].indexOf(k) === 1 ? 100 : [1,0,2].indexOf(k) === 0 ? 62 : 40;
            return `<div class="step">
              <div class="medal">${['🥇','🥈','🥉'][k]}</div>
              <img src="${avatar(r.pid)}" class="avatar" style="border-color:${r.colorHex}" alt="">
              <div class="base ${k===1?'h2':k===2?'h3':''}" style="height:${hs+46}px">
                <div class="pname">${esc(r.name)}</div>
                <div class="ppts">${D.faNum(r.pts,0)} امتیاز</div>
                <div style="margin-top:4px">${rankPill(r.color)}</div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
      <div class="glass tilt">
        <div class="card-head"><span class="ic">⚡</span><h3>قهرمانان فازها</h3><span class="tag">Phase</span></div>
        ${['بهار','تابستان'].map(ph => {
          const c = A.PHASE_CHAMP[ph];
          const maxP = Math.max(...Object.values(A.PHASE_PTS[ph]||{}), 1);
          return `<div style="margin-bottom:14px">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px">
              <b>🌸 فاز ${ph}</b><span style="color:var(--gold-l)">${esc(c.name)} — ${D.faNum(c.pts,0)} امتیاز</span>
            </div>
            ${pbar(c.pts/maxP*100, 'gold')}
          </div>`;
        }).join('')}
        <div style="margin-top:8px;display:flex;gap:8px;align-items:center;font-size:12px;color:var(--muted)">
          <span>🔥 فرم قهرمان:</span>${formChips((A.CARDS[A.LB[0].pid]||[]).slice(-5).map(c=>c.result))}
        </div>
      </div>
    </div>
    <div class="grid cols-2" style="margin-top:18px">
      <div class="glass tilt">
        <div class="card-head"><span class="ic">📈</span><h3>امتیاز ماهانه فصل</h3><span class="tag">Monthly</span>
          <span style="margin-right:auto;display:flex;gap:6px;align-items:center">
            <select class="sel" id="cm-month" style="width:auto;padding:5px 10px;font-size:12px">
              ${['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'].map((m,i)=>`<option value="${i}">${m}</option>`).join('')}
            </select>
            <button class="btn sm ghost" id="cm-apply" style="padding:5px 12px">نمایش</button>
          </span>
        </div>
        <div class="chart-box short" id="cm-chart"><canvas id="ch-cmd-line"></canvas></div>
      </div>
      <div class="glass">
        <div class="card-head"><span class="ic">🏁</span><h3>رقابت زنده — ده نفر برتر</h3><span class="tag">Live</span></div>
        <table class="tbl"><thead><tr><th>#</th><th>بازیکن</th><th>رنک</th><th>امتیاز</th><th>تغییر</th><th>فرم</th></tr></thead><tbody>
        ${A.LB.slice(0,10).map(r => `<tr class="top${r.rank<=3?r.rank:0}">
          <td>${medal(r.rank)} ${D.fa(r.rank)}</td>
          <td><b>${esc(r.name)}</b>${r.streak>=2?' 🔥':''}</td>
          <td>${rankPill(r.color)}</td>
          <td class="num" style="color:var(--gold-l);font-weight:800">${D.faNum(r.pts,0)}</td>
          <td>${changeBadge(r.change)}</td>
          <td>${formChips(r.form)}</td>
        </tr>`).join('')}
        </tbody></table>
      </div>
    </div>`;
    const statsEl = $('#cmd-stats');
    const cards = [
      { ic:'🏌️', lbl:'بازیکنان فعال', val: A.LB.length, sub:'عضو آکادمی', col:'var(--gold-l)', fmt:'fa' },
      { ic:'🏆', lbl:'مجموع امتیاز فصل', val: A.TOT_PTS, sub:'ماهها: ' + A.MONTHLY_TOT.join('، '), col:'var(--green-l)', fmt:'fa' },
      { ic:'🥇', lbl:'مسابقات برگزار', val: A.MATCHES_HELD, sub:'در ' + D.COURSES.length + ' زمین', col:'var(--blue)', fmt:'fa' },
      { ic:'🎯', lbl:'جلسات تمرین', val: A.PRACTICE_DAYS, sub:'روز تمرین گروهی', col:'var(--purple)', fmt:'fa' },
      { ic:'📚', lbl:'دورههای آموزشی', val: A.COURSE_DAYS, sub:'کلاس و کارگاه', col:'var(--orange)', fmt:'fa' },
      { ic:'💎', lbl:'بازیکنان Gold Elite', val: g, sub:'بالای ' + D.fa(D.GOLD_ELITE) + ' امتیاز', col:'var(--gold)', fmt:'fa' },
      { ic:'⭐', lbl:'قهرمان ماه', val: 0, sub: A.champM ? `${A.champM} — ${esc(A.champName)}` : '—', col:'var(--teal)', fmt:'fa' },
      { ic:'🎖️', lbl:'میانگین هندیکپ', val: A.AVG_HCP, sub:'کل اعضا', col:'var(--red)', fmt:'num1' },
    ];
    if (!MGMT.getSettings().chCmd){ statsEl.innerHTML = '<div class="glass" style="grid-column:span 4;padding:14px;text-align:center;color:var(--muted)">نمودارهای فرماندهی غیرفعال شده‌اند — از «تنظیمات نمایش» فعال کنید</div>'; }
    else statsEl.innerHTML = cards.map((c,i) => `
      <div class="glass tilt stat">
        <span class="accent-bar" style="background:linear-gradient(90deg,${c.col},transparent)"></span>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span class="ic">${c.ic}</span>
          ${i===1 ? `<canvas id="sp-${i}" style="width:74px;height:30px"></canvas>` : ''}
        </div>
        <div class="val"><span class="countup" data-target="${c.val}" data-fmt="${c.fmt}">0</span></div>
        <div class="lbl">${c.lbl} — <span style="color:var(--dim)">${c.sub}</span></div>
      </div>`).join('');
    setTimeout(() => {
      if (MGMT.getSettings().chMonthly){
        drawMonthlyChart();
      } else {
        const c = $('#cm-chart');
        if (c) c.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--muted);font-size:12.5px">نمودار ماهانه غیرفعال است — از تنظیمات نمایش فعال کنید</div>';
      }
      A.MONTHLY_TOT.forEach((v,i) => Charts.spark($(`#sp-1`), A.MONTHLY_TOT.slice(0,i+1), '#1EBB8A'));
      const apply = $('#cm-apply');
      if (apply){
        apply.addEventListener('click', () => drawMonthlyChart());
      }
    }, 60);
  }

  function drawMonthlyChart(){
    const cv = $('#ch-cmd-line');
    if (!cv) return;
    const mi = +($('#cm-month') ? $('#cm-month').value : 0);
    const m = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'][mi];
    const A2 = A;
    // دادهٔ همان ماه از MONTH_PTS
    const mp = A2.MONTH_PTS[m] || {};
    const arr = Object.entries(mp).sort((a,b)=>b[1]-a[1]).slice(0,10);
    const hasData = arr.length > 0;
    if (!hasData){
      cv.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--muted);font-size:12.5px">برای ماه ' + m + ' هنوز امتیازی ثبت نشده است.</div>';
      return;
    }
    const labels = arr.map(([pid,v]) => (A2.LB.find(r=>r.pid===+pid)||{}).name || '—');
    const vals = arr.map(([pid,v]) => v);
    Charts.barsV(cv, labels, vals, { color:'#E9C766', fmt:v=>D.faNum(v,0), title:'امتیاز ' + m });
  }

  /* ═══════════ صفحه: رقابت فصل ═══════════ */
  function pageRace(){
    const v = $('#view');
    if (!MGMT.getSettings().chRace){
      v.innerHTML = `<div class="glass" style="padding:30px;text-align:center;color:var(--muted)">🏁 نمودار رقابت فصل غیرفعال است — از «تنظیمات نمایش» فعال کنید</div>`;
      return;
    }
    const gold = A.LB.filter(r => r.rank <= 3).length;
    const play = A.LB.filter(r => r.rank > 3 && r.rank <= 8).length;
    const dev = A.LB.length - gold - play;
    v.innerHTML = `
    <div class="toolbar">
      <span class="lbl">🔍 جستجوی بازیکن:</span>
      <input class="input" id="race-q" placeholder="نام بازیکن…" style="min-width:220px">
      <div style="flex:1"></div>
      <span class="chip gold">🥇 قهرمانی (۱–۳) — ${D.fa(gold)}</span>
      <span class="chip blue">🎯 پلیآف (۴–۸) — ${D.fa(play)}</span>
      <span class="chip dim">🌱 توسعه (۹+) — ${D.fa(dev)}</span>
    </div>
    <div class="grid cols-3">
      <div class="glass tilt" style="grid-column:span 2">
        <div class="card-head"><span class="ic">🏁</span><h3>جدول رقابت فصل ۱۴۰۵</h3><span class="tag">FedEx Cup</span></div>
        <div style="overflow-x:auto"><table class="tbl" id="race-tbl"><thead><tr>
          <th>#</th><th>بازیکن</th><th>رنک</th><th>امتیاز</th><th>پیشرفت طلایی</th><th>تغییر</th><th>برد</th><th>میانگین</th><th>پرنده</th><th>فرم</th>
        </tr></thead><tbody></tbody></table></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:18px">
        <div class="glass">
          <div class="card-head"><span class="ic">💎</span><h3>مناطق واجد شرایط</h3><span class="tag">Lock / Open</span></div>
          ${[
            {n:'منطقه قهرمانی', c:'gold', v:gold, mx:3},
            {n:'منطقه پلیآف', c:'blue', v:play, mx:5},
            {n:'منطقه توسعه', c:'', v:dev, mx:A.LB.length-8},
          ].map(z => `<div style="margin-bottom:12px">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px"><b>${z.n}</b><b>${D.fa(z.v)}</b></div>
            ${pbar(z.v/z.mx*100, z.c)}
          </div>`).join('')}
          <div style="font-size:11px;color:var(--muted);margin-top:6px">سه نفر اول به جام بزرگ فصل راه دارند؛ رتبه ۴ تا ۸ در رقابت پلیآف.</div>
        </div>
        <div class="glass">
          <div class="card-head"><span class="ic">⚔️</span><h3>نبرد صدر جدول</h3><span class="tag">Top Race</span></div>
          <div style="display:flex;align-items:flex-end;gap:16px;justify-content:center;padding-top:8px">
            ${A.LB.slice(0,3).map(r => `
              <div style="text-align:center;flex:1">
                <img src="${avatar(r.pid)}" class="floaty" style="width:52px;height:52px;border-radius:50%;border:2px solid ${r.colorHex};box-shadow:0 0 18px ${r.colorHex}66;object-fit:cover">
                <div style="font-size:11.5px;font-weight:800;margin-top:6px">${esc(r.name)}</div>
                <div style="font-size:11px;color:var(--gold-l)">${D.faNum(r.pts,0)} امتیاز</div>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </div>`;
    const tbody = $('#race-tbl tbody');
    const rows = A.LB.map(r => {
      const maxPts = A.LB[0].pts;
      return `<tr class="top${r.rank<=3?r.rank:0}" data-name="${esc(r.name)}">
        <td>${medal(r.rank)} ${D.fa(r.rank)}</td>
        <td><b>${esc(r.name)}</b>${r.streak>=2?' 🔥':''}</td>
        <td>${rankPill(r.color)}</td>
        <td class="num" style="color:var(--gold-l);font-weight:800">${D.faNum(r.pts,0)}</td>
        <td style="min-width:120px">${pbar(r.pts/maxPts*100, 'gold')}</td>
        <td>${changeBadge(r.change)}</td>
        <td class="num">${D.fa(r.win)}</td>
        <td class="num">${r.avg.toFixed(1)}</td>
        <td class="num" style="color:var(--green-l)">${D.fa(r.bird)}</td>
        <td>${formChips(r.form)}</td>
      </tr>`;
    }).join('');
    tbody.innerHTML = rows;
    $('#race-q').addEventListener('input', e => {
      const q = e.target.value.trim();
      $$('#race-tbl tbody tr').forEach(tr => {
        tr.style.display = !q || tr.dataset.name.includes(q) ? '' : 'none';
      });
    });
  }

  /* ═══════════ صفحه: مرکز بازیکن ═══════════ */
  function pagePlayer(){

  if (!MGMT.getSettings().chPlayer){
      v.innerHTML = `<div class="glass" style="padding:30px;text-align:center;color:var(--muted)">🏌️ نمودارهای مرکز بازیکن غیرفعال است — از «تنظیمات نمایش» فعال کنید</div>`;
      return;
    }    const v = $('#view');
    const p = A.LB.find(r => r.pid === playerSel) || A.LB[0];
    const cards = A.CARDS[playerSel] || [];
    const sk = A.SKILLS[playerSel] || {scoring:0,birdie:0,consistency:0,practice:0,experience:0};
    const pt = A.PAR_TYPE[playerSel] || {};
    const dist = { w:0, p:0, b:0, d:0 };
    cards.forEach(c => { dist.w += c.birdies; dist.p += c.pars; dist.b += c.bogeys; dist.d += c.dbog; });
    const tot = Math.max(1, dist.w + dist.p + dist.b + dist.d);
    const goldP = Math.min(100, p.pts / D.GOLD_ELITE * 100);
    v.innerHTML = `
    <div class="toolbar">
      <span class="lbl">🏌️ بازیکن:</span>
      <select class="sel" id="pl-sel">${A.LB.map(r => `<option value="${r.pid}" ${r.pid===playerSel?'selected':''}>${esc(r.name)}</option>`).join('')}</select>
      <span class="lbl">⛳ مسابقه:</span>
      <select class="sel" id="pl-tour">${S.tournaments.filter(t => D.dateFrom(t[5]) < D.TODAY).map(t => `<option value="${t[0]}" ${t[0]===matchSel?'selected':''}>${esc(t[1])}</option>`).join('')}</select>
      <div style="flex:1"></div>
      ${rankPill(p.color)}
    </div>
    <div class="grid cols-4" id="pl-stats" style="margin-bottom:18px"></div>
    <div class="grid cols-3">
      <div class="glass tilt">
        <div class="card-head"><span class="ic">🕸️</span><h3>رادار مهارت</h3><span class="tag">۰–۱۰۰</span></div>
        <div class="chart-box"><canvas id="pl-radar"></canvas></div>
      </div>
      <div class="glass">
        <div class="card-head"><span class="ic">🍩</span><h3>توزیع اسکور</h3><span class="tag">Per Hole</span></div>
        <div style="display:flex;align-items:center;gap:16px">
          <div class="chart-box short" style="flex:1"><canvas id="pl-donut"></canvas></div>
          <div style="font-size:12px;display:flex;flex-direction:column;gap:7px">
            ${[['پرنده','#1EBB8A',dist.w],['پار','#2E86DE',dist.p],['بوگی','#E67E22',dist.b],['دو بوگی','#E74C3C',dist.d]].map(([n,c,val]) =>
              `<div><span class="chip" style="background:${c}22;color:${c};border:1px solid ${c}55">${n}</span> <b>${D.fa(val)}</b> <small style="color:var(--dim)">${D.fa(Math.round(val/tot*100))}٪</small></div>`).join('')}
          </div>
        </div>
      </div>
      <div class="glass">
        <div class="card-head"><span class="ic">💎</span><h3>پیشرفت Gold Elite</h3><span class="tag">${D.faNum(p.pts,0)} / ${D.fa(D.GOLD_ELITE)}</span></div>
        <div class="chart-box short"><canvas id="pl-gold"></canvas></div>
        <div style="text-align:center;font-size:12px;color:var(--muted)">${D.faNum(p.pts,0)} امتیاز — فاصله تا طلایی: ${D.fa(Math.max(0, D.GOLD_ELITE - p.pts))} امتیاز</div>
      </div>
      <div class="glass" style="grid-column:span 2">
        <div class="card-head"><span class="ic">📊</span><h3>امتیاز ماهانه</h3><span class="tag">Monthly</span></div>
        <div class="chart-box short"><canvas id="pl-month"></canvas></div>
      </div>
      <div class="glass">
        <div class="card-head"><span class="ic">📈</span><h3>تجمعی فصل</h3><span class="tag">Cumulative</span></div>
        <div class="chart-box short"><canvas id="pl-cum"></canvas></div>
      </div>
      <div class="glass" style="grid-column:span 3">
        <div class="card-head"><span class="ic">⛳</span><h3>ضربات حفرهبهحفره — مسابقه انتخابی</h3><span class="tag">Hole by Hole</span></div>
        <div class="chart-box"><canvas id="pl-holes"></canvas></div>
        <div id="pl-holes-tbl" style="margin-top:10px"></div>
      </div>
    </div>`;
    const stats = [
      ['🏆','امتیاز', p.pts, 'col:var(--gold-l)'], ['👑','برد', p.win, 'col:var(--gold)'],
      ['🥈','سکو', p.top3, 'col:var(--silver,var(--muted))'], ['⛳','مسابقات', p.matches, 'col:var(--blue)'],
      ['🎯','تمرین', p.prac, 'col:var(--purple)'], ['📚','آموزش', p.course, 'col:var(--orange)'],
      ['🐦','پرنده', p.bird, 'col:var(--green-l)'], ['📉','میانگین', p.avg, 'col:var(--red)'],
    ];
    $('#pl-stats').innerHTML = stats.map(([ic,lbl,val,col]) => `
      <div class="glass stat" style="min-height:92px">
        <div style="display:flex;align-items:center;gap:8px"><span class="ic" style="font-size:18px">${ic}</span><span class="lbl">${lbl}</span></div>
        <div class="val" style="font-size:22px"><span class="countup" data-target="${val}" data-fmt="fa">0</span></div>
      </div>`).join('');
    setTimeout(() => {
      Charts.radar($('#pl-radar'), ['اسکورینگ','پرندهسازی','ثبات','تمرین','تجربه'],
        [sk.scoring, sk.birdie, sk.consistency, sk.practice, sk.experience], { color:'#D4AF37' });
      Charts.donut($('#pl-donut'), [
        { value: dist.w, color:'#1EBB8A' }, { value: dist.p, color:'#2E86DE' },
        { value: dist.b, color:'#E67E22' }, { value: dist.d, color:'#E74C3C' },
      ], { glow:true });
      Charts.donut($('#pl-gold'), [{ value: goldP, color:'#D4AF37', glow:true }, { value: 100-goldP, color:'#18202D' }], { inner:0.7 });
      const mp = A.MONTHS_SEASON.map(m => (A.MONTH_PTS[m]||{})[p.pid] || 0);
      Charts.barsV($('#pl-month'), A.MONTHS_SEASON, mp, { color:'#1EBB8A', showVal:true, fmt:v=>D.faNum(v,0) });
      let acc = 0; const cum = mp.map(v => acc += v);
      Charts.line($('#pl-cum'), [cum], A.MONTHS_SEASON, { colors:['#E9C766'], fill:true, points:true, fmt:v=>D.faNum(v,0) });
      renderHoles(p);
    }, 80);
    $('#pl-sel').addEventListener('change', e => { playerSel = +e.target.value; go('player'); });
    $('#pl-tour').addEventListener('change', e => { matchSel = +e.target.value; go('player'); });
  }
  function renderHoles(p){
    const card = (A.CARDS[p.pid]||[]).find(c => c.tour === matchSel);
    const t = S.tournaments.find(t => t[0] === matchSel);
    const cv = $('#pl-holes'); if (!cv) return;
    if (!card || !t){
      cv.parentElement.innerHTML = '<div style="color:var(--muted);padding:20px">برای این بازیکن در این مسابقه کارتی ثبت نشده است.</div>';
      return;
    }
    const pars = D.parsOf(t[3]);
    const strokes = [], parsArr = [];
    for (let h = 1; h <= t[4]; h++){ strokes.push(card.strokes[h]); parsArr.push(pars[h-1]); }
    Charts.line(cv, [strokes, parsArr], parsArr.map((_,i)=>'ح'+D.fa(i+1)), {
      colors:['#E9C766','#2E86DE'], fill:true, points:true, min: Math.min(...parsArr)-2, max: Math.max(...strokes)+2,
    });
    $('#pl-holes-tbl').innerHTML = `
    <table class="tbl"><thead><tr><th>حفره</th>${parsArr.map((_,i)=>`<th>${D.fa(i+1)}</th>`).join('')}</tr></thead>
    <tbody><tr><td><b>پار</b></td>${parsArr.map(p2=>`<td class="num" style="color:var(--gold-l)">${D.fa(p2)}</td>`).join('')}</tr>
    <tr><td><b>ضربات</b></td>${strokes.map((s,i)=>{
      const c = s < parsArr[i] ? 'color:var(--green-l);font-weight:800' : s === parsArr[i] ? 'color:var(--white)' : 'color:#ff8f82;font-weight:800';
      return `<td class="num" style="${c}">${D.fa(s)}</td>`;
    }).join('')}</tr></tbody></table>
    <div style="margin-top:8px;font-size:11.5px;color:var(--muted)">
      مجموع: <b style="color:var(--white)">${D.fa(card.total)}</b> • در برابر پار: <b style="color:${card.vspar<=0?'var(--green-l)':'#ff8f82'}">${card.vspar>0?'+':''}${D.fa(card.vspar)}</b> • رتبه ${D.fa(card.rank)} • ${esc(card.result)}
    </div>`;
  }

  /* ═══════════ صفحه: فرماندهی مسابقه ═══════════ */
  function pageMatch(){

  if (!MGMT.getSettings().chMatch){
      v.innerHTML = `<div class="glass" style="padding:30px;text-align:center;color:var(--muted)">🥇 فرماندهی مسابقه غیرفعال است — از «تنظیمات نمایش» فعال کنید</div>`;
      return;
    }    const v = $('#view');
    const t = S.tournaments.find(x => x[0] === matchSel) || S.tournaments[0];
    const cards = S.scorecards.filter(c => c.tour === matchSel).map(c => {
      const pars = D.parsOf(t[3]);
      let bird = 0;
      for (let h = 1; h <= t[4]; h++) if (c.strokes[h] === pars[h-1]-1) bird++;
      const parTotal = pars.slice(0, t[4]).reduce((a,b)=>a+b,0);
      return { ...c, bird, par: parTotal, vspar: c.total - parTotal };
    }).sort((a,b) => a.total - b.total);
    const info = D.jalaliInfo(D.dateFrom(t[5]));
    const winner = cards[0];
    const totalBird = cards.reduce((a,c)=>a+c.bird,0);
    const avgVspar = cards.length ? Math.round(cards.reduce((a,c)=>a+c.vspar,0)/cards.length*100)/100 : 0;
    let hardest = null;
    const diff = A.HOLE_DIFF[matchSel] || {};
    Object.entries(diff).forEach(([h, d]) => { if (!hardest || d > hardest.d) hardest = { h: +h, d }; });
    v.innerHTML = `
    <div class="toolbar">
      <span class="lbl">🥇 مسابقه:</span>
      <select class="sel" id="mt-sel">${S.tournaments.map(x => `<option value="${x[0]}" ${x[0]===matchSel?'selected':''}>${esc(x[1])}</option>`).join('')}</select>
      <span class="chip gold">⛳ ${esc(D.COURSE_NAME[t[3]])}</span>
      <span class="chip blue">${D.fa(t[4])} حفره</span>
      <span class="chip purple">سطح ${D.fa(t[2])}</span>
      <span class="chip dim">${D.fa(info.dd)} ${info.monthFa} ${D.fa(info.yy)}</span>
      <div style="flex:1"></div>
      <span class="chip ${D.dateFrom(t[5]) >= D.TODAY ? 'blue' : 'green'}">${D.dateFrom(t[5]) >= D.TODAY ? 'آینده' : 'برگزار شده'}</span>
    </div>
    <div class="grid cols-4" id="mt-stats" style="margin-bottom:18px"></div>
    <div class="grid cols-3">
      <div class="glass tilt" style="grid-column:span 2">
        <div class="card-head"><span class="ic">📋</span><h3>نتایج بازیکنان</h3><span class="tag">${esc(t[1])}</span></div>
        <div style="overflow-x:auto"><table class="tbl"><thead><tr><th>رتبه</th><th>بازیکن</th><th>ضربات</th><th>پار</th><th>در برابر پار</th><th>پرنده</th><th>نتیجه</th><th>امتیاز</th></tr></thead><tbody>
        ${cards.map((c, i) => {
          const pl = A.LB.find(r => r.pid === c.pid) || { name: D.PLAYER_NAME[c.pid], color:'White' };
          const rank = i+1;
          const pts = D.PTS_RULE[t[2]][Math.min(rank,4)-1];
          return `<tr class="top${rank<=3?rank:0}">
            <td>${medal(rank)} ${D.fa(rank)}</td>
            <td><b>${esc(pl.name)}</b></td>
            <td class="num" style="font-weight:800">${D.fa(c.total)}</td>
            <td class="num" style="color:var(--gold-l)">${D.fa(c.par)}</td>
            <td class="num" style="color:${c.vspar<=0?'var(--green-l)':'#ff8f82'};font-weight:800">${c.vspar>0?'+':''}${D.fa(c.vspar)}</td>
            <td class="num" style="color:var(--green-l)">${D.fa(c.bird)}</td>
            <td>${rank===1?'<span class="chip gold">قهرمان</span>':rank===2?'<span class="chip dim">دوم</span>':rank===3?'<span class="chip dim">سوم</span>':'<span class="chip dim">شرکتکننده</span>'}</td>
            <td class="num" style="color:var(--gold-l)">${D.fa(pts)}</td>
          </tr>`;
        }).join('') || '<tr><td colspan="8" style="color:var(--muted)">هنوز نتیجه ثبت نشده است.</td></tr>'}
        </tbody></table></div>
      </div>
      <div style="display:flex;flex-direction:column;gap:18px">
        <div class="glass">
          <div class="card-head"><span class="ic">🐦</span><h3>پرندههای هر بازیکن</h3><span class="tag">Birdies</span></div>
          <div class="chart-box short"><canvas id="mt-bird"></canvas></div>
        </div>
        <div class="glass">
          <div class="card-head"><span class="ic">🌋</span><h3>سختترین حفرهها</h3><span class="tag">Avg vs Par</span></div>
          <div class="chart-box short"><canvas id="mt-hard"></canvas></div>
          ${hardest ? `<div style="margin-top:8px;font-size:12px;color:var(--muted)">سختترین: <b style="color:#ff8f82">حفره ${D.fa(hardest.h)}</b> — میانگین ${hardest.d>0?'+':''}${D.fa(hardest.d.toFixed(2))} نسبت به پار</div>` : ''}
        </div>
      </div>
    </div>`;
    const st = [
      ['👥','شرکتکنندگان', cards.length, 'var(--purple)'], ['👑','قهرمان', winner ? esc(A.LB.find(r=>r.pid===winner.pid)?.name || D.PLAYER_NAME[winner.pid]) : '—', 'var(--gold)'],
      ['🏆','اسکور قهرمان', winner ? D.fa(winner.total) + ' ضربه' : '—', 'var(--gold-l)'], ['⛳','پار', D.fa(cards[0] ? cards[0].par : ''), 'var(--teal)'],
      ['🐦','کل پرندهها', totalBird, 'var(--green-l)'], ['🌋','سختترین حفره', hardest ? 'ح' + D.fa(hardest.h) : '—', 'var(--red)'],
      ['📉','میانگین vs پار', (avgVspar>0?'+':'') + D.fa(avgVspar.toFixed(2)), 'var(--blue)'], ['🏌️','میدان', D.fa(t[4]) + ' حفره', 'var(--orange)'],
    ];
    $('#mt-stats').innerHTML = st.map(([ic,lbl,val,col]) => `
      <div class="glass stat" style="min-height:88px">
        <div style="display:flex;align-items:center;gap:8px"><span class="ic" style="font-size:18px">${ic}</span><span class="lbl">${lbl}</span></div>
        <div class="val" style="font-size:21px;color:${col}">${val}</div>
      </div>`).join('');
    setTimeout(() => {
      const top8 = cards.slice(0, 8);
      Charts.barsH($('#mt-bird'), top8.map(c => D.PLAYER_NAME[c.pid].slice(0,12)), top8.map(c => c.bird), { color:'#1EBB8A', showVal:true });
      const hs = Object.keys(diff).map(Number).sort((a,b)=>a-b);
      Charts.barsV($('#mt-hard'), hs.map(h=>'ح'+D.fa(h)), hs.map(h => diff[h]), {
        color:'#E74C3C', showVal:true, fmt:v=>(v>0?'+':'')+v.toFixed(1),
        max: Math.max(...hs.map(h=>diff[h]), 0.5) * 1.3,
      });
    }, 80);
    $('#mt-sel').addEventListener('change', e => { matchSel = +e.target.value; go('match'); });
  }

  /* ═══════════ صفحه: هوش زمین ═══════════ */
  function pageCourse(){

  if (!MGMT.getSettings().chCourse){
      v.innerHTML = `<div class="glass" style="padding:30px;text-align:center;color:var(--muted)">🗺️ نمودار هوش زمین غیرفعال است — از «تنظیمات نمایش» فعال کنید</div>`;
      return;
    }    const v = $('#view');
    const crs = S.courses.find(c => c[0] === courseSel) || S.courses[0];
    const pars = D.parsOf(crs[0]);
    const holes = crs[3];
    const stats = A.COURSE_STATS[crs[0]] || {};
    const pc = A.PLAYER_COURSE[coursePlayerSel] || {};
    const rounds = S.scorecards.filter(c => (S.tournaments.find(t=>t[0]===c.tour)||{}).course === crs[0]).length;
    const recs = (A.CARDS[coursePlayerSel]||[]).filter(c => c.course === crs[0]);
    const pl = A.LB.find(r => r.pid === coursePlayerSel);
    v.innerHTML = `
    <div class="toolbar">
      <span class="lbl">🗺️ زمین:</span>
      <select class="sel" id="cs-sel">${S.courses.map(c => `<option value="${c[0]}" ${c[0]===courseSel?'selected':''}>${esc(c[1])}</option>`).join('')}</select>
      <span class="lbl">🏌️ بازیکن:</span>
      <select class="sel" id="cs-pl">${A.LB.map(r => `<option value="${r.pid}" ${r.pid===coursePlayerSel?'selected':''}>${esc(r.name)}</option>`).join('')}</select>
      <div style="flex:1"></div>
      <span class="chip gold">${esc(crs[1])} — ${esc(crs[2])}</span>
      <span class="chip blue">${D.fa(holes)} حفره • پار ${D.fa(pars.slice(0,holes).reduce((a,b)=>a+b,0))}</span>
    </div>
    <div class="grid cols-4" id="cs-stats" style="margin-bottom:18px"></div>
    <div class="grid cols-3">
      <div class="glass" style="grid-column:span 2">
        <div class="card-head"><span class="ic">🌋</span><h3>سختی حفرهها در این زمین</h3><span class="tag">${esc(crs[1])}</span></div>
        <div class="chart-box tall"><canvas id="cs-hard"></canvas></div>
        <div style="margin-top:6px;font-size:11.5px;color:var(--muted)">قرمز = میانگین ضربات نسبت به پار در همه مسابقات این زمین • آبی = پار حفره</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:18px">
        <div class="glass">
          <div class="card-head"><span class="ic">🏌️</span><h3>کارنامه ${pl ? esc(pl.name) : ''}</h3><span class="tag">Course Record</span></div>
          ${recs.length ? `<table class="tbl"><thead><tr><th>مسابقه</th><th>ضربات</th><th>vs پار</th><th>رتبه</th><th>نتیجه</th></tr></thead><tbody>
          ${recs.map(r => `<tr>
            <td>${esc(r.name)}</td><td class="num">${D.fa(r.total)}</td>
            <td class="num" style="color:${r.vspar<=0?'var(--green-l)':'#ff8f82'}">${r.vspar>0?'+':''}${D.fa(r.vspar)}</td>
            <td class="num">${D.fa(r.rank)}</td><td>${r.rank===1?'<span class="chip gold">قهرمان</span>':'<span class="chip dim">'+esc(r.result)+'</span>'}</td>
          </tr>`).join('')}</tbody></table>` : '<div style="color:var(--muted);font-size:12.5px">این بازیکن هنوز در این زمین مسابقهای نداشته است.</div>'}
        </div>
        <div class="glass">
          <div class="card-head"><span class="ic">🗺️</span><h3>میانگین بازیکن در زمینها</h3><span class="tag">Course Fit</span></div>
          <div class="chart-box short"><canvas id="cs-fit"></canvas></div>
        </div>
      </div>
    </div>`;
    const avgAll = rounds ? (() => {
      let s = 0, n = 0;
      S.scorecards.forEach(c => {
        const t = S.tournaments.find(x => x[0] === c.tour);
        if (t && t[3] === crs[0]){ s += c.total - pars.slice(0, t[4]).reduce((a,b)=>a+b,0); n++; }
      });
      return n ? Math.round(s/n*100)/100 : null;
    })() : null;
    const st = [
      ['⛳','پار کل', D.fa(pars.slice(0,holes).reduce((a,b)=>a+b,0)), 'var(--gold)'], ['🏌️','میدانها', D.fa(holes), 'var(--blue)'],
      ['👥','دورهای برگزار', D.fa(rounds), 'var(--orange)'], ['📉','میانگین vs پار', avgAll===null?'—':(avgAll>0?'+':'')+D.fa(avgAll.toFixed(2)), 'var(--green-l)'],
    ];
    $('#cs-stats').innerHTML = st.map(([ic,lbl,val,col]) => `
      <div class="glass stat" style="min-height:88px">
        <div style="display:flex;align-items:center;gap:8px"><span class="ic" style="font-size:18px">${ic}</span><span class="lbl">${lbl}</span></div>
        <div class="val" style="font-size:21px;color:${col}">${val}</div>
      </div>`).join('');
    setTimeout(() => {
      const hs = [];
      for (let h = 1; h <= holes; h++) hs.push(h);
      Charts.barsV($('#cs-hard'), hs.map(h=>'ح'+D.fa(h)), hs.map(h => stats[h] ?? 0), {
        color:'#E74C3C', showVal:true, fmt:v=>(v>0?'+':'')+v.toFixed(1), max: Math.max(1.2, ...hs.map(h=>stats[h]??0)) * 1.25,
      });
      const allCrs = S.courses.map(c => c[0]);
      Charts.barsH($('#cs-fit'), allCrs.map(c => esc(D.COURSE_NAME[c])), allCrs.map(c => pc[c] ?? 0), {
        color:'#9B59B6', showVal:true, valFmt:v=>(v>0?'+':'')+v.toFixed(1),
      });
    }, 80);
    $('#cs-sel').addEventListener('change', e => { courseSel = +e.target.value; go('course'); });
    $('#cs-pl').addEventListener('change', e => { coursePlayerSel = +e.target.value; go('course'); });
  }

  /* ═══════════ صفحه: رکوردها ═══════════ */
  function pageRecords(){

  if (!MGMT.getSettings().chRecords){
      v.innerHTML = `<div class="glass" style="padding:30px;text-align:center;color:var(--muted)">🎖️ رکوردها غیرفعال است — از «تنظیمات نمایش» فعال کنید</div>`;
      return;
    }    const v = $('#view');
    const bestPrac = A.LB.reduce((a,b) => b.prac > a.prac ? b : a);
    const bestCourse = A.LB.reduce((a,b) => b.course > a.course ? b : a);
    const mostWin = A.LB.reduce((a,b) => b.win > a.win ? b : a);
    const champs = [
      ['👑','قهرمان فصل', A.LB[0].name, D.faNum(A.LB[0].pts,0) + ' امتیاز', 'var(--gold)'],
      ['⭐','قهرمان ماه', A.champM ? (() => { const e = Object.entries(A.MONTH_PTS[A.champM]||{}).sort((a,b)=>b[1]-a[1])[0]; return e ? D.PLAYER_NAME[+e[0]] : '—'; })() : '—', A.champM ? A.champM : '—', 'var(--green-l)'],
      ['🌸','فاز بهار', A.PHASE_CHAMP['بهار'].name, D.faNum(A.PHASE_CHAMP['بهار'].pts,0) + ' امتیاز', 'var(--blue)'],
      ['☀️','فاز تابستان', A.PHASE_CHAMP['تابستان'].name, D.faNum(A.PHASE_CHAMP['تابستان'].pts,0) + ' امتیاز', 'var(--orange)'],
      ['🥇','بیشترین برد', mostWin.name, D.fa(mostWin.win) + ' عنوان', 'var(--purple)'],
      ['🎯','بیشترین تمرین', bestPrac.name, D.fa(bestPrac.prac) + ' جلسه', 'var(--teal)'],
      ['📚','بیشترین آموزش', bestCourse.name, D.fa(bestCourse.course) + ' دوره', 'var(--gold-l)'],
      ['🔒','منطقه واجد شرایط', 'رتبههای ۱ تا ۳', 'جام بزرگ فصل', 'var(--red)'],
    ];
    v.innerHTML = `
    <div style="display:flex;align-items:center;gap:18px;margin-bottom:18px">
      <img src="assets/trophy_3d.png" class="floaty glow-img" style="width:110px;height:110px;border-radius:16px;object-fit:cover" alt="">
      <div>
        <h2 class="gold-text" style="font-size:24px;font-weight:900">تالار افتخارات ۱۴۰۵</h2>
        <div style="color:var(--muted);font-size:12.5px;margin-top:4px">رکوردها و قهرمانان فصل — Hall of Fame</div>
      </div>
    </div>
    <div class="grid cols-4" id="rec-champs" style="margin-bottom:18px"></div>
    <div class="grid cols-3">
      <div class="glass tilt" style="grid-column:span 2">
        <div class="card-head"><span class="ic">🏅</span><h3>بهترین دورهای فصل</h3><span class="tag">Best Rounds</span></div>
        <div style="overflow-x:auto"><table class="tbl"><thead><tr><th>#</th><th>بازیکن</th><th>مسابقه</th><th>مجموع</th><th>در برابر پار</th><th>پرنده</th></tr></thead><tbody>
        ${A.BEST_ROUNDS.slice(0,12).map((r,i) => `<tr class="${i===0?'top1':i===1?'top2':i===2?'top3':''}">
          <td>${medal(i+1)} ${D.fa(i+1)}</td><td><b>${esc(r.name)}</b></td><td style="color:var(--muted)">${esc(r.tour)}</td>
          <td class="num" style="font-weight:800">${D.fa(r.total)}</td>
          <td class="num" style="color:${r.vspar<=0?'var(--green-l)':'#ff8f82'};font-weight:800">${r.vspar>0?'+':''}${D.fa(r.vspar)}</td>
          <td class="num" style="color:var(--green-l)">${D.fa(r.bird)}</td>
        </tr>`).join('')}</tbody></table></div>
      </div>
      <div class="glass">
        <div class="card-head"><span class="ic">🏆</span><h3>سکوی فصل</h3><span class="tag">Champions</span></div>
        <div class="podium" style="transform:scale(.85);transform-origin:top center;padding:8px 0 0">
          ${[1,0,2].map(k => {
            const r = A.LB[k];
            const hs = k===0?70:46;
            return `<div class="step">
              <div class="medal">${['🥇','🥈','🥉'][k]}</div>
              <img src="${avatar(r.pid)}" class="avatar" style="border-color:${r.colorHex}">
              <div class="base ${k===1?'h2':k===2?'h3':''}" style="height:${hs}px">
                <div class="pname">${esc(r.name)}</div><div class="ppts">${D.faNum(r.pts,0)}</div>
              </div>
            </div>`;
          }).join('')}
        </div>
        <div style="text-align:center;font-size:11.5px;color:var(--dim);margin-top:6px">🥇🥈🥉 — مدالهای فصل</div>
      </div>
    </div>`;
    $('#rec-champs').innerHTML = champs.map(([ic,lbl,val,sub,col]) => `
      <div class="glass tilt" style="text-align:center;padding:18px">
        <div class="ic" style="font-size:26px;animation:float 5s ease-in-out infinite">${ic}</div>
        <div style="font-size:11px;color:var(--muted);margin:8px 0 4px;font-weight:700">${lbl}</div>
        <div style="font-size:15px;font-weight:900;color:${col}">${esc(val)}</div>
        <div style="font-size:10.5px;color:var(--dim)">${esc(sub)}</div>
      </div>`).join('');
  }

  /* ═══════════ صفحه: تقویم ═══════════ */
  function pageCal(){
    const v = $('#view');
    const MONTHS = D.MONTHS_FA;
    const DAYS_IN = [31,31,31,31,31,31,30,30,30,30,30,29];
    const WD = ['ش','ی','د','س','چ','پ','ج'];
    const TYPE_ICON = { 'مسابقه':'🏆', 'کلاس':'📚', 'تمرین':'🏌️', 'اردو':'🏕️' };
    const TYPES = ['مسابقه','کلاس','تمرین','اردو'];

    // ── ساخت رویدادها (فقط: مسابقه، کلاس، تمرین، اردو) ──
    const events = [];
    let eid = 0;
    const ev = o => events.push(Object.assign({ id: ++eid }, o));

    S.tournaments.forEach(t => {
      const d = D.dateFrom(t[5]);
      ev({ d, end: d, name: t[1], type: 'مسابقه', col: t[2]===1?'gold':t[2]===2?'green':'blue',
           kind: 'مسابقه', icon: '🏆', extra: `${esc(D.COURSE_NAME[t[3]]||'—')} • ${D.fa(t[4])} حفره` });
    });
    // کلاس‌های آکادمی (هر هفته یک‌بار، شهریور تا بهمن)
    [['کلاس مقدماتی گلف'],['کلاس پوتینگ'],['کلاس شورت گیم'],['کارگاه ذهنی'],['کلاس چوب‌های بلند'],['کلاس قوانین و آداب']].forEach(([n],i) => {
      const d = new Date(D.TODAY.getTime() + (7 + i*10)*86400000);
      ev({ d, end: d, name: n, type: 'کلاس', col: 'purple', kind: 'کلاس', icon: '📚', extra: 'کلاس آکادمی' });
    });
    // تمرین‌های هفتگی
    [['تمرین روز سه‌شنبه'],['تمرین پایان هفته'],['تمرین تخصصی چوب بلند']].forEach(([n],i) => {
      const d = new Date(D.TODAY.getTime() + (5 + i*7)*86400000);
      ev({ d, end: d, name: n, type: 'تمرین', col: 'green', kind: 'تمرین', icon: '🏌️', extra: 'تمرین هفتگی' });
    });
    // اردوهای فصل
    [[10,16,'اردوی آماده‌سازی جام بزرگ'],[11,2,'اردوی فنی پایان فصل']].forEach(([m,d2,n]) => {
      const d = new Date(Date.UTC(2026, m-1, d2));
      ev({ d, end: d, name: n, type: 'اردو', col: 'orange', kind: 'اردو', icon: '🏕️', extra: '' });
    });
    // دوره‌های آموزشی / تمرین / اردو (از پنل مدیریت)
    (window.Data.loadPrograms ? Data.loadPrograms() : []).forEach(p => {
      const d = D.dateFrom(p.start || p.date || '');
      if (!d || isNaN(d)) return;
      const end = p.end ? D.dateFrom(p.end) : d;
      const type = TYPES.includes(p.type) ? p.type : 'کلاس';
      ev({ d, end, name: p.name || 'دوره', type, col: type==='تمرین'?'green':type==='اردو'?'orange':'purple', kind: type,
           icon: TYPE_ICON[type] || '📌', extra: p.info ? esc(String(p.info)).slice(0,50) : 'دورهٔ فصل' });
    });
    // رویدادهای سفارشی (فقط ۴ نوع مجاز — بقیه نمایش داده نمی‌شوند)
    (MGMT.customEvents()||[]).forEach(e => {
      const type = e.type || '';
      if (!TYPES.includes(type)) return;
      const d = D.dateFrom(e.date || e.start || '');
      if (!d || isNaN(d)) return;
      const end = e.end ? D.dateFrom(e.end) : d;
      ev({ d, end, name: e.name, type, col: 'blue', kind: type, icon: TYPE_ICON[type] || '📌',
           extra: 'رویداد سفارشی', schedule: e.schedule || null });
    });
    events.sort((a,b) => a.d - b.d);

    const nextIdx = Math.max(0, events.findIndex(e => e.d >= D.TODAY));
    let selIdx = nextIdx;
    let viewMonth = D.jalaliInfo(events[selIdx].d).mm;
    let filter = 'all';

    function jalMonthStart(mm){
      const base = new Date(Date.UTC(2026, 2, 21));
      const off = mm <= 6 ? (mm-1)*31 : 186 + (mm-7)*30;
      return new Date(base.getTime() + off*86400000);
    }
    function dstr(d){ return d.toISOString().slice(0,10); }
    function daysBetween(a, b){
      return Math.round((b - a) / 86400000) + 1;
    }

    v.innerHTML = `
    <div class="glass gold-border" style="margin-bottom:16px;display:flex;align-items:center;gap:16px;flex-wrap:wrap">
      <img src="assets/ball_3d.png" class="floaty fast glow-img green" style="width:64px;height:64px;border-radius:14px;object-fit:cover" alt="">
      <div>
        <div style="font-size:12px;color:var(--muted)">رویداد بعدی</div>
        <div style="font-size:19px;font-weight:900" class="gold-text">${TYPE_ICON[events[nextIdx].type]||'📌'} ${esc(events[nextIdx].name)}</div>
        <div style="font-size:11.5px;color:var(--muted);margin-top:3px">${events[nextIdx].type} • ${D.fa(D.jalaliInfo(events[nextIdx].d).dd)} ${MONTHS[D.jalaliInfo(events[nextIdx].d).mm-1]}</div>
      </div>
      <div style="margin-right:auto;text-align:center">
        <div class="big-num gold-text">${D.fa(Math.max(0, Math.ceil((events[nextIdx].d - D.TODAY)/86400000)))}</div>
        <div style="font-size:11px;color:var(--muted)">روز تا شروع</div>
      </div>
      <div style="text-align:center;padding:0 16px">
        <div style="font-size:11px;color:var(--muted)">رویدادهای فصل</div>
        <div style="font-size:16px;font-weight:800" class="gold-text">${D.fa(events.length)} رویداد</div>
      </div>
      <button class="btn sm ghost" onclick="APP.go('mgmt')">⚙️ مدیریت تقویم</button>
    </div>

    <div class="cal-main">
      <!-- لیست رویدادها -->
      <div class="glass cal-list-pane">
        <div class="card-head"><span class="ic">📋</span><h3>رویدادها</h3>
          <span style="margin-right:auto;display:flex;gap:5px;flex-wrap:wrap">
            ${['all', ...TYPES].map(f => `<button class="btn sm ghost cal-f ${f==='all'?'on':''}" data-f="${f}" style="padding:3px 8px;font-size:10.5px">${f==='all'?'همه':(TYPE_ICON[f]||'') + f}</button>`).join('')}
          </span>
        </div>
        <div id="cal-events-list" class="cal-events-list"></div>
      </div>
      <!-- تقویم ماه -->
      <div class="glass cal-grid-pane">
        <div class="card-head"><span class="ic">🇮🇷</span>
          <h3>تقویم <span id="cal-month-name"></span></h3>
          <span class="tag">فصل ۱۴۰۵</span>
          <div style="margin-right:auto;display:flex;gap:6px;align-items:center">
            <button class="btn sm ghost" id="cal-prev">▶</button>
            <button class="btn sm" id="cal-today" style="padding:4px 10px;font-size:11px">امروز</button>
            <button class="btn sm ghost" id="cal-next">◀</button>
          </div>
        </div>
        <div class="cal-legend">
          ${TYPES.map(t => `<span>${TYPE_ICON[t]} ${t}</span>`).join('')}
          <span class="hol-sel" style="border:1.5px dashed #D4AF37;border-radius:6px;padding:0 6px">رویداد انتخابی</span>
        </div>
        <div id="cal-grid" class="cal-grid-big" style="margin-top:10px"></div>
        <div id="cal-month-hols" class="cal-month-hols"></div>
      </div>
    </div>`;

    // ── لیست رویدادها ──
    function renderList(){
      const wrap = $('#cal-events-list'); if (!wrap) return;
      const list = events.filter(e => filter === 'all' || e.kind === filter);
      const future = list.filter(e => e.end >= D.TODAY);
      const past = list.filter(e => e.end < D.TODAY);
      const rows = [];
      const mk = (e, pastFlag) => {
        const j = D.jalaliInfo(e.d);
        const isSel = events[selIdx].id === e.id;
        const days = daysBetween(e.d, e.end);
        const range = days > 1 ? ` (${D.fa(days)} روز)` : '';
        return `<div class="cal-ev-item ${isSel?'sel':''} ${pastFlag?'past':''}" data-id="${e.id}">
          <div class="cal-ev-date">
            <div class="cal-ev-d">${D.fa(j.dd)}</div>
            <div class="cal-ev-m">${MONTHS[j.mm-1]}</div>
          </div>
          <div class="cal-ev-body">
            <b>${e.icon} ${esc(e.name)}</b>
            <div class="cal-ev-sub">${e.type}${range}${e.extra ? ' — ' + e.extra : ''}</div>
            ${e.schedule ? `<div class="cal-ev-sch">${e.schedule.map(s => `<span>${esc(s.label)}</span>`).join('')}</div>` : ''}
          </div>
          <span class="chip ${e.col}">${e.icon} ${e.kind}</span>
        </div>`;
      };
      future.slice(0, 60).forEach(e => rows.push(mk(e, false)));
      if (past.length) rows.push('<div class="cal-ev-group">برگزار شده</div>');
      past.slice(-30).forEach(e => rows.push(mk(e, true)));
      wrap.innerHTML = rows.join('') || '<div style="color:var(--muted);font-size:12px;padding:10px">رویدادی نیست.</div>';
      $$('#cal-events-list .cal-ev-item').forEach(it => it.addEventListener('click', () => {
        selIdx = events.findIndex(e => e.id === +it.dataset.id);
        if (selIdx < 0) selIdx = nextIdx;
        const e = events[selIdx];
        viewMonth = D.jalaliInfo(e.d).mm;
        renderList(); renderGrid(); renderMonthStats();
        const gp = document.querySelector('.cal-grid-pane');
        if (gp && gp.scrollIntoView) gp.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }));
    }

    // ── تقویم ماه ──
    function renderGrid(){
      const mm = viewMonth;
      $('#cal-month-name').textContent = MONTHS[mm-1] + ' ۱۴۰۵';
      const grid = $('#cal-grid'); if (!grid) return;
      const sel = events[selIdx];
      const selDays = new Set();
      if (sel){
        const j0 = D.jalaliInfo(sel.d), j1 = D.jalaliInfo(sel.end);
        if (j0.mm === mm && j0.yy === 1405){
          const n = daysBetween(sel.d, sel.end);
          for (let i=0;i<n;i++) selDays.add(j0.dd + i);
        }
      }
      const first = jalMonthStart(mm);
      const dow = first.getUTCDay();
      const daysInMonth = DAYS_IN[mm-1];
      let html = `<div class="cal-grid-big-row">${WD.map(w=>`<div class="cal-wd">${w}</div>`).join('')}</div>`;
      html += '<div class="cal-grid-big-row">';
      for (let i=0;i<dow;i++) html += '<div class="cal-cell empty"></div>';
      for (let d=1; d<=daysInMonth; d++){
        const isToday = (mm === D.jalaliInfo(D.TODAY).mm && d === D.jalaliInfo(D.TODAY).dd);
        const isSelDay = selDays.has(d);
        const dayEvs = events.filter(e => {
          const j0 = D.jalaliInfo(e.d);
          if (j0.yy !== 1405 || j0.mm !== mm) return false;
          const n = daysBetween(e.d, e.end);
          for (let i=0;i<n;i++){ if (j0.dd + i === d) return true; }
          return false;
        });
        const labels = dayEvs.map(e => `${e.icon} ${esc(e.name)}`);
        html += `<div class="cal-cell ${dayEvs.length?'has-ev':''} ${isSelDay?'sel':''} ${isToday?'today':''}" title="${esc(labels.join(' • '))}">
          <div class="cal-num">${D.fa(d)}</div>
          ${dayEvs.length ? `<div class="cal-ev-mini">${dayEvs.slice(0,3).map(e=>`<span class="cal-mini-ev ${e.kind}">${e.icon} ${esc(e.name)}</span>`).join('')}${dayEvs.length>3?'<span class="cal-mini-more">+'+D.fa(dayEvs.length-3)+'</span>':''}</div>` : ''}
        </div>`;
      }
      html += '</div>';
      grid.innerHTML = html;
    }

    // ── آمار ماه ──
    function renderMonthStats(){
      const mm = viewMonth;
      const cnt = events.filter(e => {
        const j0 = D.jalaliInfo(e.d);
        if (j0.yy !== 1405 || j0.mm !== mm) return false;
        const n = daysBetween(e.d, e.end);
        for (let i=0;i<n;i++){ if (j0.dd + i >= 1 && j0.dd + i <= DAYS_IN[mm-1]) return true; }
        return false;
      }).length;
      const hc = $('#cal-month-hols');
      if (hc) hc.innerHTML = `📅 رویدادهای این ماه: <b>${D.fa(cnt)}</b>`;
    }

    renderList(); renderGrid(); renderMonthStats();

    $('#cal-prev').addEventListener('click', () => {
      viewMonth = viewMonth === 1 ? 12 : viewMonth - 1;
      renderGrid(); renderMonthStats();
    });
    $('#cal-next').addEventListener('click', () => {
      viewMonth = viewMonth === 12 ? 1 : viewMonth + 1;
      renderGrid(); renderMonthStats();
    });
    $('#cal-today').addEventListener('click', () => {
      viewMonth = D.jalaliInfo(D.TODAY).mm;
      selIdx = nextIdx;
      renderList(); renderGrid(); renderMonthStats();
    });
    $$('#cal-events-list').forEach(()=>{});
    v.querySelectorAll('.cal-f').forEach(b => b.addEventListener('click', () => {
      filter = b.dataset.f;
      v.querySelectorAll('.cal-f').forEach(x => x.classList.toggle('on', x === b));
      renderList();
    }));
  }

  function pageTv(){

  if (!MGMT.getSettings().chTv){
      v.innerHTML = `<div class="glass" style="padding:30px;text-align:center;color:var(--muted)">📺 گرافیک نمایش تلویزیونی غیرفعال است — از «تنظیمات نمایش» فعال کنید</div>`;
      return;
    }    const v = $('#view');
    const next = A.NEXT_T;
    v.innerHTML = `
    <div class="tv-wrap">
      <div class="glass" style="border-color:var(--line)">
        <div class="tv-screen">
          <img src="assets/course_pano.png" class="bg" alt="">
          <div class="overlay"></div>
          <div class="content">
            <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
              <span class="live-badge">● LIVE</span>
              <span style="font-size:13px;color:var(--muted)">GolfAcademy 1405 • Season Broadcast</span>
              <div style="margin-right:auto;display:flex;gap:14px;flex-wrap:wrap">
                <span style="color:var(--muted);font-size:12px">🌬️ باد <b style="color:var(--white)">۱۲ km/h</b></span>
                <span style="color:var(--muted);font-size:12px">🌡️ دما <b style="color:var(--white)">۲۸°</b></span>
                <span style="color:var(--muted);font-size:12px">⛳ حفره <b style="color:var(--white)">۱۴</b></span>
              </div>
            </div>
            <div style="text-align:center;margin:26px 0 6px">
              <div style="font-size:34px;font-weight:900" class="gold-text">${next ? esc(next[1]) : 'جام بزرگ فصل'}</div>
              <div style="color:var(--muted);font-size:13px;margin-top:4px">${next ? esc(D.COURSE_NAME[next[3]]) + ' • ' + D.fa(next[4]) + ' حفره' : ''}</div>
            </div>
            <table class="tbl" style="font-size:14px">
              <thead><tr><th>رتبه</th><th>بازیکن</th><th>رنک</th><th>امتیاز</th><th>بهترین دور</th><th>پرنده</th><th>فرم</th></tr></thead>
              <tbody>
              ${A.LB.slice(0,10).map(r => `<tr class="top${r.rank<=3?r.rank:0}" style="font-size:14px">
                <td style="font-size:17px;font-weight:900">${medal(r.rank)} ${D.fa(r.rank)}</td>
                <td><b style="font-size:15px">${esc(r.name)}</b>${r.streak>=2?' 🔥':''}</td>
                <td>${rankPill(r.color)}</td>
                <td class="num" style="color:var(--gold-l);font-weight:900;font-size:16px">${D.faNum(r.pts,0)}</td>
                <td class="num">${r.best_vspar===null?'—':(r.best_vspar>0?'+':'')+D.fa(r.best_vspar)}</td>
                <td class="num" style="color:var(--green-l)">${D.fa(r.bird)}</td>
                <td>${formChips(r.form)}</td>
              </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="ticker" style="margin-top:16px">
        <div class="track">
          ⚡ اخبار آکادمی: &nbsp; ${next ? esc(next[1]) + ' ' + D.fa(A.COUNTDOWN) + ' روز دیگر •' : ''} &nbsp; کلاس پوتینگ چهارشنبه • &nbsp; اردوی آمادهسازی جام بزرگ ۱۶ مهر • &nbsp; پرندهساز هفته: ${esc(A.LB[0].name)} • &nbsp; ${esc(A.LB[1].name)} با روند صعودی به صدر نزدیک میشود • &nbsp; فصل ۱۴۰۵ — رقابت تا جام بزرگ فصل ادامه دارد
        </div>
      </div>
      <div style="text-align:center;margin-top:14px;font-size:11px;color:var(--dim)">📺 این صفحه برای نمایش روی تلویزیون آکادمی طراحی شده است — برای حالت تمامصفحه F11 را بزنید</div>
    </div>`;
  }

  /* ═══════════ صفحه: میدان نبرد ═══════════ */
  function pageBattle(){

  if (!MGMT.getSettings().chBattle){
      v.innerHTML = `<div class="glass" style="padding:30px;text-align:center;color:var(--muted)">⚔️ میدان نبرد غیرفعال است — از «تنظیمات نمایش» فعال کنید</div>`;
      return;
    }    const v = $('#view');
    const teams = [
      ['🦅','عقابهای طلایی', [1,2,3,4], '#D4AF37'],
      ['🐆','یوزهای سبز', [5,6,7,8], '#1EBB8A'],
      ['🦈','کوسههای آبی', [9,10,11,12], '#2E86DE'],
      ['🐺','گرگهای شب', [13,14,15,16], '#9B59B6'],
    ].map(([ic,n,ids,c]) => ({
      ic, n, c, ids,
      pts: ids.reduce((a,pid)=>a+(A.PTS[pid]||0),0),
      members: ids.map(pid => A.LB.find(r=>r.pid===pid) || { name: D.PLAYER_NAME[pid], pts:0, color:'White' }),
    }));
    teams.sort((a,b) => b.pts - a.pts);
    const maxT = Math.max(...teams.map(t=>t.pts), 1);
    v.innerHTML = `
    <div class="glass gold-border" style="display:flex;align-items:center;gap:16px;margin-bottom:18px;flex-wrap:wrap">
      <img src="assets/flag_3d.png" class="floaty glow-img" style="width:70px;height:70px;border-radius:14px;object-fit:cover" alt="">
      <div>
        <h2 style="font-size:21px;font-weight:900" class="gold-text">میدان نبرد — جدال تیمها</h2>
        <div style="color:var(--muted);font-size:12px;margin-top:3px">سبک لیگ جهانی LIV • ${D.fa(teams.length)} تیم × ${D.fa(teams[0].members.length)} بازیکن</div>
      </div>
      <div style="margin-right:auto" class="chip green">🔴 فصل در جریان</div>
    </div>
    <div class="grid cols-2" style="margin-bottom:18px">
      ${teams.map(t => `
        <div class="glass tilt" style="border-color:${t.c}44">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
            <span style="font-size:32px;animation:float 5s ease-in-out infinite">${t.ic}</span>
            <div>
              <div style="font-size:16px;font-weight:900;color:${t.c}">${esc(t.n)}</div>
              <div style="font-size:11px;color:var(--muted)">امتیاز تیم: <b style="color:var(--white)">${D.faNum(t.pts,0)}</b></div>
            </div>
            <div style="margin-right:auto;font-size:12px;color:var(--muted)">رتبه ${D.fa(teams.indexOf(t)+1)}</div>
          </div>
          ${pbar(t.pts/maxT*100, 'gold')}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px">
            ${t.members.map(m => `
              <div style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.03);border:1px solid var(--line-soft);border-radius:11px;padding:7px 9px">
                <img src="${avatar(m.pid)}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;border:1px solid ${t.c}" alt="">
                <div style="min-width:0">
                  <div style="font-size:11.5px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(m.name)}</div>
                  <div style="font-size:10px;color:${t.c}">${D.faNum(m.pts,0)} امتیاز</div>
                </div>
              </div>`).join('')}
          </div>
        </div>`).join('')}
    </div>
    <div class="grid cols-2">
      <div class="glass">
        <div class="card-head"><span class="ic">🏆</span><h3>امتیاز تیمها</h3><span class="tag">Team Race</span></div>
        <div class="chart-box"><canvas id="bt-chart"></canvas></div>
      </div>
      <div class="glass">
        <div class="card-head"><span class="ic">🔥</span><h3>جدالهای هفته — ۱ به ۱</h3><span class="tag">Lock Zone</span></div>
        ${[
          ['سینا رحیمی','مهدی کریمی','۱۷:۰۰', true],
          ['شایان اکبری','درسا سلطانی','۱۷:۱۲', true],
          ['حسین قاسمی','مریم کاظمی','۱۷:۲۴', false],
          ['پارسا عظیمی','تارا یزدانی','۱۷:۳۶', false],
        ].map(([a,b,tm,live]) => `
          <div style="display:flex;align-items:center;gap:10px;padding:11px 13px;border-radius:13px;margin-bottom:9px;background:rgba(255,255,255,.03);border:1px solid ${live?'rgba(231,76,60,.4)':'var(--line-soft)'}">
            <b style="flex:1;font-size:12.5px">${esc(a)}</b>
            <span class="chip gold" style="flex:0 0 auto">VS</span>
            <b style="flex:1;text-align:right;font-size:12.5px">${esc(b)}</b>
            <span style="font-size:11px;color:var(--dim);direction:ltr">${tm}</span>
            <span class="chip ${live?'red':'dim'}">${live?'زنده':'برنامه'}</span>
          </div>`).join('')}
      </div>
    </div>`;
    setTimeout(() => {
      Charts.barsH($('#bt-chart'), teams.map(t=>t.n), teams.map(t=>t.pts), { color:'#E9C766', showVal:true, valFmt:v=>D.faNum(v,0) });
    }, 80);
  }

  /* ═══════════ صفحه: آکادمی ═══════════ */
  function pageAcademy(){
    const v = $('#view');
    const remain = S.tournaments.filter(t => D.dateFrom(t[5]) >= D.TODAY).length + 6;
    const kpis = [
      ['👥','بازیکنان فعال', A.LB.length, 'var(--gold)'], ['🏌️','مسابقات برگزار', A.MATCHES_HELD, 'var(--green-l)'],
      ['🎯','روزهای تمرین', A.PRACTICE_DAYS, 'var(--blue)'], ['📚','دورههای آموزشی', A.COURSE_DAYS, 'var(--purple)'],
      ['🐦','کل پرندهها', A.TOTAL_BIRD, 'var(--green-l)'], ['📅','رویدادهای باقیمانده', remain, 'var(--orange)'],
      ['💎','بازیکنان Gold Elite', A.GOLD_COUNT, 'var(--gold-l)'], ['📈','میانگین هندیکپ', A.AVG_HCP, 'var(--teal)'],
    ];
    const rc = D.RANK_DEF.slice().reverse();
    v.innerHTML = `
    <div class="grid cols-4" id="ac-kpis" style="margin-bottom:18px"></div>
    <div class="grid cols-3">
      <div class="glass">
        <div class="card-head"><span class="ic">🏅</span><h3>ترکیب رنکهای فصل</h3><span class="tag">Distribution</span></div>
        ${rc.map(rk => `
          <div style="margin-bottom:13px">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px">
              <b style="color:${rk[3]}">${rk[1]} ${rk[0]==='Gold Elite'?'💎':''}</b><b>${D.fa(A.RANK_COUNT[rk[0]])} نفر</b>
            </div>
            ${pbar(A.RANK_COUNT[rk[0]]/A.LB.length*100, rk[0]==='Gold Elite'?'gold':rk[0]==='Red'?'red':rk[0]==='Blue'?'blue':'')}
          </div>`).join('')}
      </div>
      <div class="glass" style="grid-column:span 2">
        <div class="card-head"><span class="ic">🚀</span><h3>آکادمی در یک نگاه — پیام سرپرست</h3><span class="tag">Coach Desk</span></div>
        ${[
          `✅ فصل ۱۴۰۵ با ${D.fa(A.MATCHES_HELD)} مسابقه، ${D.fa(A.COURSE_DAYS)} کلاس و اردو در جریان است.`,
          `🏆 سه بازیکن برتر در منطقه قهرمانی هستند و به جام بزرگ فصل راه دارند.`,
          `🐦 میانگین پرنده در هر دور بازیکنان برتر به عدد قابل توجهی رسیده است — روند صعودی.`,
          `📌 پیشنهاد: دو جلسه تمرین شورت گیم برای بازیکنان سطح ۳ اضافه شود.`,
          `🎯 قهرمان ماه: ${esc(A.champM || '—')} — عملکرد برجسته در ${esc(A.champM || '')} ثبت شد.`,
        ].map((n,i) => `<div style="display:flex;gap:10px;padding:11px 14px;border-radius:13px;margin-bottom:9px;background:rgba(255,255,255,.03);border:1px solid var(--line-soft)">
          <div style="flex:1">${n}</div>${i===0?'<span class="chip green">بهروز</span>':''}
        </div>`).join('')}
      </div>
    </div>`;
    $('#ac-kpis').innerHTML = kpis.map(([ic,lbl,val,col]) => `
      <div class="glass tilt stat" style="min-height:100px">
        <span class="accent-bar" style="background:linear-gradient(90deg,${col},transparent)"></span>
        <span class="ic" style="font-size:22px">${ic}</span>
        <div class="val" style="color:${col};font-size:24px"><span class="countup" data-target="${val}" data-fmt="fa">0</span></div>
        <div class="lbl">${lbl}</div>
      </div>`).join('');
  }

  /* ═══════════ ابزار طراح ═══════════ */
  function extraCourses(){ try{ return JSON.parse(store.get('ga_courses')||'[]'); }catch(e){ return []; } }
  function extraTours(){ try{ return JSON.parse(store.get('ga_tournaments')||'[]'); }catch(e){ return []; } }
  function extraCards(){ try{ return JSON.parse(store.get('ga_scorecards')||'[]'); }catch(e){ return []; } }
  function saveCourses(a){ try{ store.set('ga_courses', JSON.stringify(a)); }catch(e){} }
  function saveTours(a){ try{ store.set('ga_tournaments', JSON.stringify(a)); }catch(e){} }
  function saveCards(a){ try{ store.set('ga_scorecards', JSON.stringify(a)); }catch(e){} }

  function pageACourses(){
    const v = $('#view');
    v.innerHTML = `
    <div class="glass gold-border" style="margin-bottom:18px">
      <div class="card-head"><span class="ic">🛠️</span><h3>طراح زمین — ثبت زمین جدید</h3><span class="tag">3 / 9 / 18</span></div>
      <div class="grid cols-4">
        <div><label style="font-size:11px;color:var(--muted)">نام زمین</label><input class="input" id="ac-name" style="width:100%;margin-top:5px" placeholder="زمین جدید"></div>
        <div><label style="font-size:11px;color:var(--muted)">محل</label><input class="input" id="ac-loc" style="width:100%;margin-top:5px" value="ریاض"></div>
        <div><label style="font-size:11px;color:var(--muted)">تعداد میدان</label>
          <select class="sel" id="ac-holes" style="width:100%;margin-top:5px"><option>3</option><option>9</option><option selected>18</option></select></div>
        <div style="display:flex;align-items:flex-end"><button class="btn sm" id="ac-add">+ ثبت زمین</button></div>
      </div>
      <div id="ac-pars" style="margin-top:14px;display:flex;gap:7px;flex-wrap:wrap"></div>
    </div>
    <div class="glass">
      <div class="card-head"><span class="ic">🗺️</span><h3>زمینهای موجود</h3><span class="tag">${D.fa(S.courses.length)} زمین</span></div>
      <div id="ac-list"></div>
    </div>`;
    let parVals = [];
    function drawPars(){
      const n = +$('#ac-holes').value;
      if (parVals.length !== n) parVals = Array.from({length:n}, (_,i) => [3,4,5][i%3] === 4 ? 4 : 4);
      $('#ac-pars').innerHTML = parVals.map((p,i) => `
        <div style="text-align:center">
          <div style="font-size:10px;color:var(--muted)">ح${D.fa(i+1)}</div>
          <input class="input" type="number" min="3" max="6" value="${p}" data-i="${i}" style="width:58px;text-align:center;direction:ltr">
        </div>`).join('');
      $$('#ac-pars input').forEach(inp => inp.addEventListener('change', () => {
        parVals[+inp.dataset.i] = Math.max(3, Math.min(6, +inp.value || 4));
      }));
    }
    drawPars();
    $('#ac-holes').addEventListener('change', drawPars);
    $('#ac-add').addEventListener('click', () => {
      const name = $('#ac-name').value.trim();
      const loc = $('#ac-loc').value.trim();
      if (!name){ toast('نام زمین را وارد کنید', 'red'); return; }
      const holes = +$('#ac-holes').value;
      const pars = parVals.slice(0, holes).map(v => Math.max(3, Math.min(6, v)));
      const lst = extraCourses();
      lst.push({ name, loc, holes, pars });
      saveCourses(lst);
      reloadData(); go('acourses');
      toast('زمین «' + name + '» ثبت شد ✓', 'green');
    });
    renderCourseList();
  }
  function renderCourseList(){
    const wrap = $('#ac-list'); if (!wrap) return;
    const rows = [];
    D.COURSES.forEach((c,i) => rows.push({ type:'پایه', name:c[1], loc:c[2], holes:c[3], pars:D.COURSE_PARS[c[0]], del:null }));
    extraCourses().forEach((c,i) => rows.push({ type:'سفارشی', name:c.name, loc:c.loc, holes:c.holes, pars:c.pars, del:i }));
    wrap.innerHTML = `
    <table class="tbl"><thead><tr><th>#</th><th>نام</th><th>محل</th><th>میدان</th><th>پار هر میدان</th><th>پار کل</th><th></th></tr></thead><tbody>
    ${rows.map((r,i) => `<tr>
      <td class="num">${D.fa(i+1)}</td><td><b>${esc(r.name)}</b> ${r.type==='سفارشی'?'<span class="chip purple">سفارشی</span>':''}</td>
      <td>${esc(r.loc)}</td><td class="num">${D.fa(r.holes)}</td>
      <td class="ltr" style="color:var(--muted);font-size:11px">${r.pars.join('، ')}</td>
      <td class="num" style="color:var(--gold-l)">${D.fa(r.pars.reduce((a,b)=>a+b,0))}</td>
      <td>${r.del !== null ? `<button class="btn ghost sm" data-del="${r.del}">حذف</button>` : ''}</td>
    </tr>`).join('')}</tbody></table>`;
    $$('#ac-list [data-del]').forEach(b => b.addEventListener('click', () => {
      const lst = extraCourses(); lst.splice(+b.dataset.del, 1); saveCourses(lst); reloadData(); go('acourses'); toast('زمین حذف شد', 'orange');
    }));
  }

  function pageATours(){
    const v = $('#view');
    v.innerHTML = `
    <div class="glass gold-border" style="margin-bottom:18px">
      <div class="card-head"><span class="ic">🏆</span><h3>طراح مسابقه — ثبت مسابقه جدید</h3><span class="tag">زمین + حفره + سطح</span></div>
      <div class="grid cols-6">
        <div style="grid-column:span 2"><label style="font-size:11px;color:var(--muted)">نام مسابقه</label><input class="input" id="at-name" style="width:100%;margin-top:5px" placeholder="جام جدید"></div>
        <div><label style="font-size:11px;color:var(--muted)">سطح</label><select class="sel" id="at-lvl" style="width:100%;margin-top:5px"><option value="1">سطح ۱</option><option value="2" selected>سطح ۲</option><option value="3">سطح ۳</option></select></div>
        <div><label style="font-size:11px;color:var(--muted)">زمین</label><select class="sel" id="at-crs" style="width:100%;margin-top:5px">${S.courses.map(c=>`<option value="${c[0]}">${esc(c[1])}</option>`).join('')}</select></div>
        <div><label style="font-size:11px;color:var(--muted)">حفره</label><select class="sel" id="at-holes" style="width:100%;margin-top:5px"><option>9</option><option selected>18</option></select></div>
        <div style="grid-column:span 2"><label style="font-size:11px;color:var(--muted)">تاریخ</label><div class="jdate" id="at-date" data-iso="2026-09-25" style="margin-top:5px"></div></div>
      </div>
      <button class="btn sm" id="at-add" style="margin-top:14px">+ ثبت مسابقه</button>
    </div>
    <div class="glass">
      <div class="card-head"><span class="ic">📅</span><h3>مسابقات فصل</h3><span class="tag">${D.fa(S.tournaments.length)} رویداد</span></div>
      <div style="overflow-x:auto"><table class="tbl"><thead><tr><th>#</th><th>نام</th><th>سطح</th><th>زمین</th><th>حفره</th><th>تاریخ</th><th>وضعیت</th><th></th></tr></thead><tbody>
      ${S.tournaments.map((t,i) => {
        const past = D.dateFrom(t[5]) < D.TODAY;
        const j = D.jalaliInfo(D.dateFrom(t[5]));
        return `<tr>
          <td class="num">${D.fa(t[0])}</td><td><b>${esc(t[1])}</b></td>
          <td><span class="chip ${t[2]===1?'gold':t[2]===2?'green':'blue'}">سطح ${D.fa(t[2])}</span></td>
          <td style="color:var(--muted)">${esc(D.COURSE_NAME[t[3]]||'—')}</td>
          <td class="num">${D.fa(t[4])}</td>
          <td class="ltr" style="color:var(--muted);font-size:11.5px">${D.fa(j.dd)} ${j.monthFa} ${D.fa(j.yy)}</td>
          <td><span class="chip ${past?'dim':'green'}">${past?'برگزار شده':'آینده'}</span></td>
          <td>${i >= 14 ? `<button class="btn ghost sm" data-del="${i-14}">حذف</button>` : ''}</td>
        </tr>`;
      }).join('')}</tbody></table></div>
    </div>`;
    if (window.JDate && $('#at-date')) JDate.render($('#at-date'));
    $('#at-add').addEventListener('click', () => {
      const name = $('#at-name').value.trim();
      const date = $('#at-date')._value();
      if (!name || !date){ toast('نام و تاریخ را وارد کنید', 'red'); return; }
      const lst = extraTours();
      lst.push({ name, lvl: +$('#at-lvl').value, course: +$('#at-crs').value, holes: +$('#at-holes').value, date });
      saveTours(lst); reloadData(); go('atournaments');
      toast('مسابقه «' + name + '» ثبت شد ✓', 'green');
    });
    $$('#at-list [data-del]').forEach(b => b.addEventListener('click', () => {
      const lst = extraTours(); lst.splice(+b.dataset.del,1); saveTours(lst); reloadData(); go('atournaments');
    }));
  }

  function pageAScorecards(){
    const v = $('#view');
    const pastTours = S.tournaments.filter(t => D.dateFrom(t[5]) < D.TODAY);
    v.innerHTML = `
    <div class="glass gold-border" style="margin-bottom:18px">
      <div class="card-head"><span class="ic">⛳</span><h3>ثبت نتایج — ضربات هر میدان</h3><span class="tag">امتیاز و رتبه خودکار</span></div>
      <div class="toolbar" style="margin-bottom:12px">
        <span class="lbl">مسابقه:</span>
        <select class="sel" id="as-tour">${pastTours.map(t=>`<option value="${t[0]}">${esc(t[1])}</option>`).join('')}</select>
        <span class="lbl">بازیکن:</span>
        <select class="sel" id="as-pl">${A.LB.map(r=>`<option value="${r.pid}">${esc(r.name)}</option>`).join('')}</select>
      </div>
      <div id="as-holes" style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:14px"></div>
      <button class="btn sm" id="as-add">+ ثبت کارت امتیاز</button>
    </div>
    <div class="glass">
      <div class="card-head"><span class="ic">📋</span><h3>کارتهای ثبتشده (سفارشی)</h3><span class="tag">${D.fa(extraCards().length)} کارت</span></div>
      <div id="as-list"></div>
    </div>`;
    let holeVals = [];
    function drawHoles(){
      const t = S.tournaments.find(x => x[0] === +$('#as-tour').value);
      const n = t ? t[4] : 9;
      const pars = t ? D.parsOf(t[3]) : [];
      holeVals = Array.from({length:n}, () => '');
      $('#as-holes').innerHTML = Array.from({length:n}, (_,i) => `
        <div style="text-align:center">
          <div style="font-size:10px;color:var(--muted)">ح${D.fa(i+1)} <small style="color:var(--gold-l)">پ${D.fa(pars[i])}</small></div>
          <input class="input" type="number" min="1" max="12" value="" data-i="${i}" style="width:52px;text-align:center;direction:ltr" placeholder="—">
        </div>`).join('');
      $$('#as-holes input').forEach(inp => inp.addEventListener('input', () => { holeVals[+inp.dataset.i] = +inp.value || null; }));
    }
    drawHoles();
    $('#as-tour').addEventListener('change', drawHoles);
    $('#as-add').addEventListener('click', () => {
      const tour = +$('#as-tour').value, pid = +$('#as-pl').value;
      const t = S.tournaments.find(x => x[0] === tour);
      const strokes = {};
      let ok = 0;
      for (let h = 1; h <= t[4]; h++){
        const val = holeVals[h-1];
        if (val !== null && val > 0){ strokes[h] = val; ok++; }
      }
      if (ok < t[4]){ toast('همه میدانها را پر کنید', 'red'); return; }
      const lst = extraCards();
      lst.push({ tour, pid, strokes });
      saveCards(lst); reloadData(); go('ascorecards');
      toast('کارت امتیاز ثبت شد — رتبه و امتیاز خودکار محاسبه شد ✓', 'green');
    });
    const lst = extraCards();
    $('#as-list').innerHTML = lst.length ? `<table class="tbl"><thead><tr><th>مسابقه</th><th>بازیکن</th><th>ضربات</th><th></th></tr></thead><tbody>
      ${lst.map((c,i) => {
        const t = S.tournaments.find(x=>x[0]===c.tour);
        const total = Object.values(c.strokes).reduce((a,b)=>a+b,0);
        return `<tr><td>${esc(t?t[1]:'—')}</td><td><b>${esc(D.PLAYER_NAME[c.pid])}</b></td><td class="num" style="color:var(--gold-l)">${D.fa(total)}</td>
        <td><button class="btn ghost sm" data-del="${i}">حذف</button></td></tr>`;
      }).join('')}</tbody></table>` : '<div style="color:var(--muted);font-size:12.5px">هنوز کارتی ثبت نشده است.</div>';
    $$('#as-list [data-del]').forEach(b => b.addEventListener('click', () => {
      const a = extraCards(); a.splice(+b.dataset.del,1); saveCards(a); reloadData(); go('ascorecards'); toast('کارت حذف شد', 'orange');
    }));
  }

  /* ═══════════ دنیای سه‌بعدی (World3D) ═══════════ */
  let worldActive = false;
  let worldZone = null;   // منطقه فعال در جهان
  function enterWorld(){
    worldActive = true;
    worldZone = null;
    const w = $('#world');
    w.classList.add('on');
    hideCaption(); hideWorldActions();
    setTimeout(() => {
      const cv = $('#world-canvas');
      if (!window.World3D) return;
      World3D.init(cv, { A, S, D });
      World3D.reset();
      World3D.start();
      World3D.onZone = zone => {
        if (worldZone === zone.id){ exitWorldTo(zone.page); return; }
        showCaption(zone);
        setTimeout(() => {
          World3D.flyToZone(zone.id, () => {
            worldZone = zone.id;
            World3D.activateZone(zone.id);
            hideCaption();
            showWorldActions(zone);
          });
        }, 480);
      };
      World3D.onObject = obj => {
        if (!obj || !obj.page) return;
        if (obj.sel){
          if (obj.sel.playerSel !== undefined) playerSel = obj.sel.playerSel;
          if (obj.sel.matchSel !== undefined) matchSel = obj.sel.matchSel;
          if (obj.sel.courseSel !== undefined) courseSel = obj.sel.courseSel;
        }
        exitWorldTo(obj.page);
      };
    }, 40);
  }
  function exitWorldTo(page){
    hideWorld();
    const overlay = $('#world-overlay');
    overlay.classList.add('show');
    setTimeout(() => {
      if (page === 'workshop'){
        go('acourses');
        setTimeout(() => { $('#wshop-modal').classList.add('open'); }, 240);
      } else {
        go(page);
      }
      setTimeout(() => overlay.classList.remove('show'), 160);
    }, 300);
  }
  function hideWorld(){
    if (worldActive){
      worldActive = false; worldZone = null;
      $('#world').classList.remove('on');
      hideWorldActions();
      if (window.World3D) World3D.stop();
    }
  }
  let captionTimer = null;
  function showCaption(z){
    clearTimeout(captionTimer);
    const cap = $('#world-caption');
    const ic = cap.querySelector('.c-icon'), nm = cap.querySelector('.c-name'), sub = cap.querySelector('.c-sub');
    if (!ic || !nm || !sub) return;
    ic.textContent = z.icon;
    nm.textContent = z.name;
    sub.textContent = 'در حال ورود...';
    cap.classList.add('show');
    captionTimer = setTimeout(() => {
      const s2 = cap.querySelector('.c-sub');
      if (s2) s2.textContent = 'دوربین در حال پرواز به مقصد';
    }, 600);
  }
  function hideCaption(){ clearTimeout(captionTimer); $('#world-caption').classList.remove('show'); }
  function showWorldActions(zone){
    const wa = $('#world-actions');
    $('#world-enter').textContent = `🚀 ورود به صفحهٔ ${zone.name}`;
    wa.classList.add('show');
  }
  function hideWorldActions(){ $('#world-actions').classList.remove('show'); }
  function initWorldUI(){
    $('#world-exit').addEventListener('click', () => exitWorldTo('cmd'));
    $('#world-enter').addEventListener('click', () => {
      if (worldZone){
        const z = { cmd:'cmd', race:'race', player:'player', match:'match', course:'course',
          records:'records', cal:'cal', tv:'tv', battle:'battle', academy:'academy', workshop:'workshop' }[worldZone];
        exitWorldTo(z);
      }
    });
    $('#world-hub').addEventListener('click', () => {
      if (window.World3D) World3D.backToHub();
      worldZone = null; hideWorldActions();
    });
    $('#back-world').addEventListener('click', () => go('world'));
    $('#wshop-close').addEventListener('click', () => $('#wshop-modal').classList.remove('open'));
    $$('#wshop-btns [data-w]').forEach(b => {
      b.addEventListener('click', () => { $('#wshop-modal').classList.remove('open'); go(b.dataset.w); });
    });
    $('#wshop-modal').addEventListener('click', e => {
      if (e.target === $('#wshop-modal')) $('#wshop-modal').classList.remove('open');
    });
  }

  /* ═══════════ Toast ═══════════ */
  let toastBox = null;
  function toast(msg, type='gold'){
    if (!toastBox){
      toastBox = document.createElement('div');
      toastBox.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:400;display:flex;flex-direction:column;gap:8px;align-items:center';
      document.body.appendChild(toastBox);
    }
    const el = document.createElement('div');
    el.style.cssText = 'background:linear-gradient(135deg,#1a2433,#101722);border:1px solid var(--line);border-radius:13px;padding:12px 22px;font-size:13px;font-weight:700;box-shadow:0 12px 34px rgba(0,0,0,.6);animation:toastIn .3s cubic-bezier(.2,.9,.3,1.2)';
    el.textContent = msg;
    if (type === 'green') el.style.borderColor = 'rgba(30,187,138,.5)';
    if (type === 'red') el.style.borderColor = 'rgba(231,76,60,.5)';
    toastBox.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = '.4s'; setTimeout(()=>el.remove(), 400); }, 2600);
  }
  const stStyle = document.createElement('style');
  stStyle.textContent = '@keyframes toastIn{from{opacity:0;transform:translateY(14px) scale(.95)}to{opacity:1;transform:none}}';
  document.head.appendChild(stStyle);

  /* ═══════════ RENDERERS ═══════════ */
  const RENDERERS = {
    world: () => {}, cmd: pageCmd, race: pageRace, player: pagePlayer, match: pageMatch,
    course: pageCourse, records: pageRecords, cal: pageCal, tv: pageTv,
    battle: pageBattle, academy: pageAcademy,
    acourses: pageACourses, atournaments: pageATours, ascorecards: pageAScorecards,
    mgmt: () => MGMT.pageMgmt(), settings: () => MGMT.pageSettings(),
  };

  /* ═══════════ بارگذاری مجدد ═══════════ */
  function reloadData(){
    S = D.loadState();
    recompute();
  }
  function applyStateToForms(){}

  /* ═══════════ ورود ═══════════ */
  function initAuth(){
    const form = $('#login-form');
    const user = $('#login-user'), pass = $('#login-pass'), err = $('#login-err');
    $('#toggle-pass').addEventListener('click', () => {
      pass.type = pass.type === 'password' ? 'text' : 'password';
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const u = user.value.trim().toLowerCase();
      const h = cyrb53(pass.value);
      if (buildUsers()[u] === h){
        store.set('ga_session', u);
        store.set('ga_user_label', userLabelFor(u));
        enterApp(u);
      } else {
        err.classList.add('show');
        err.textContent = 'نام کاربری یا رمز عبور اشتباه است — دوباره تلاش کنید';
        setTimeout(() => err.classList.remove('show'), 2600);
      }
    });
  }

  function enterApp(u){
    currentUser = u;
    $('#login').style.display = 'none';
    $('#app').classList.add('on');
    $('#user-label').textContent = USER_LABEL[u] || 'کاربر';
    $('#user-name').textContent = u;
    reloadData();
    go('cmd');
    tickClock(); setInterval(tickClock, 1000);
  }

  function logout(){
    store.remove('ga_session');
    location.reload();
  }

  /* ═══════════ راهاندازی ═══════════ */
  function initNav(){
    $$('.nav-item').forEach(n => n.addEventListener('click', () => go(n.dataset.page)));
    $$('.mob-nav a').forEach(n => n.addEventListener('click', e => { e.preventDefault(); go(n.dataset.page); }));
    $('#logout-btn').addEventListener('click', logout);
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('#world').classList.contains('on')){
      go('world');
    }
  });
  document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initAuth();
    initNav();
    initWorldUI();
    const sess = store.get('ga_session');
    if (sess && buildUsers()[sess] !== undefined){
      enterApp(sess);
    }
  });

  window.APP = { go, reloadData, recompute, state: () => ({ S, A }), toast };
})();
