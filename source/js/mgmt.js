/* ═══════════════════════════════════════════════════════════════════
   GolfAcademy PRO — پلن مدیریت جامع + تنظیمات نمایش
   CRUD کامل: بازیکن (فرم جامع + عکس + یوزر/پسورد + اکتیو/دیاکتیو)،
   زمین (لوکیشن + نقشهٔ ماهواره‌ای)، مسابقات، نتایج، رویداد تقویم
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  const W = window;
  let D = window.Data;
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function gstate(){
    if (!D) D = window.Data;
    return (window.APP && window.APP.state) ? window.APP.state() : { S:null, A:null };
  }

  /* ── تنظیمات نمایش نمودارها (localStorage) ── */
  const DEFAULTS = {
    chCmd: true, chMonthly: true, chRace: true, chRaceBars: true,
    chPlayer: true, chPlayerRadar: true, chMatch: true, chCourse: true,
    chRecords: true, chCal: true, chTv: true, chBattle: true,
  };
  function getSettings(){
    try { return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem('ga_ui') || '{}')); }
    catch(e){ return Object.assign({}, DEFAULTS); }
  }
  function saveSettings(s){
    try { localStorage.setItem('ga_ui', JSON.stringify(s)); } catch(e){}
  }

  /* ── رویدادهای سفارشی تقویم ── */
  function customEvents(){ try { return JSON.parse(localStorage.getItem('ga_events') || '[]'); } catch(e){ return []; } }
  function saveEvents(a){ try { localStorage.setItem('ga_events', JSON.stringify(a)); } catch(e){} }

  /* ── بازیکنان سفارشی (فرم جامع) ── */
  function customPlayers(){ try { return JSON.parse(localStorage.getItem('ga_custom_players') || '[]'); } catch(e){ return []; } }
  function saveCustomPlayers(a){ try { localStorage.setItem('ga_custom_players', JSON.stringify(a)); } catch(e){} }

  /* ── ویرایش بازیکنان پایه ── */
  function playerEdits(){ try { return JSON.parse(localStorage.getItem('ga_players') || '{}'); } catch(e){ return {}; } }
  function savePlayerEdits(e){ try { localStorage.setItem('ga_players', JSON.stringify(e)); } catch(e){} }

  /* ── یوزر/پسورد سایت بازیکنان ── */
  function playerUsers(){ return D ? D.loadPlayerUsers() : {}; }
  function savePlayerUsers(u){ try { localStorage.setItem('ga_player_users', JSON.stringify(u)); } catch(e){} }

  /* ── کمکی: مشخصات کامل یک بازیکن ── */
  function playerFull(pid){
    const { S } = gstate();
    const p = S.players.find(x => x[0] === pid);
    if (!p) return null;
    const isCustom = pid >= 9000;
    const cu = isCustom ? customPlayers().find(c => c.id === pid - 9000) : null;
    const ed = !isCustom ? playerEdits()[pid] : null;
    const u = playerUsers()[pid] || {};
    return {
      pid, isCustom,
      name: isCustom ? (cu ? cu.name : p[1]) : (ed && ed.name ? ed.name : p[1]),
      family: isCustom ? (cu ? cu.family || '' : '') : (ed && ed.family ? ed.family : ''),
      gender: isCustom ? (cu ? cu.gender : p[2]) : (ed && ed.gender ? ed.gender : p[2]),
      hcp: isCustom ? (cu ? cu.hcp : p[3]) : (ed && ed.hcp !== undefined ? ed.hcp : p[3]),
      active: isCustom ? (cu ? cu.active !== false : true) : (ed && ed.active !== undefined ? ed.active : !!p[5]),
      join: isCustom ? (cu ? cu.join || '' : '') : (ed && ed.join ? ed.join : ''),
      birth: isCustom ? (cu ? cu.birth || '' : '') : (ed && ed.birth ? ed.birth : ''),
      phone: isCustom ? (cu ? cu.phone || '' : '') : (ed && ed.phone ? ed.phone : ''),
      national: isCustom ? (cu ? cu.national || '' : '') : (ed && ed.national ? ed.national : ''),
      email: isCustom ? (cu ? cu.email || '' : '') : (ed && ed.email ? ed.email : ''),
      address: isCustom ? (cu ? cu.address || '' : '') : (ed && ed.address ? ed.address : ''),
      father: isCustom ? (cu ? cu.father || '' : '') : (ed && ed.father ? ed.father : ''),
      fatherPhone: isCustom ? (cu ? cu.fatherPhone || '' : '') : (ed && ed.fatherPhone ? ed.fatherPhone : ''),
      mother: isCustom ? (cu ? cu.mother || '' : '') : (ed && ed.mother ? ed.mother : ''),
      motherPhone: isCustom ? (cu ? cu.motherPhone || '' : '') : (ed && ed.motherPhone ? ed.motherPhone : ''),
      photo: isCustom ? (cu ? cu.photo || '' : '') : (ed && ed.photo ? ed.photo : ''),
      user: u.user || '',
      pass: u.pass || '',
      hasUser: !!u.user,
    };
  }

  /* ═══════════════ صفحه: تنظیمات نمایش ═══════════════ */
  function pageSettings(){
    const v = $('#view');
    const s = getSettings();
    const groups = [
      { t:'داشبورد و فرماندهی', items:[
        ['chCmd','🏠 کارت‌های آمار فرماندهی','نمایش ۸ کارت کلیدی در صفحهٔ فرماندهی'],
        ['chMonthly','📈 نمودار امتیاز ماهانه','نمودار خطی امتیاز ماه‌ها + انتخاب ماه'],
      ]},
      { t:'صفحات تحلیلی', items:[
        ['chRace','🏁 نمودار رقابت فصل','بارها و خطوط رقابت در صفحهٔ رقابت فصل'],
        ['chPlayer','🏌️ نمودارهای مرکز بازیکن','رادار مهارت + دونات فرم'],
        ['chMatch','🥇 نمودار فرماندهی مسابقه','تحلیل مسابقه و امتیازات'],
        ['chCourse','🗺️ نمودار هوش زمین','سختی حفره‌ها و کارنامه بازیکن'],
        ['chRecords','🎖️ نمودار رکوردها','آمار رکوردها و بهترین‌ها'],
        ['chTv','📺 گرافیک نمایش تلویزیونی','گرافیک پخش و نمایشگرها'],
        ['chBattle','⚔️ نمودار میدان نبرد','مقایسه دو تیم'],
      ]},
      { t:'تقویم', items:[
        ['chCal','📅 تقویم و تعطیلات','نمایش تقویم + تعطیلات رسمی ایران ۱۴۰۵'],
      ]},
    ];
    v.innerHTML = `
    <div class="glass gold-border" style="margin-bottom:18px">
      <div class="card-head"><span class="ic">🛠️</span><h3>تنظیمات نمایش — هر چیزی را فعال/غیرفعال کنید</h3><span class="tag">UI Controls</span></div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:10px">
        <button class="btn sm" id="st-all-on">همه فعال</button>
        <button class="btn sm ghost" id="st-all-off">همه غیرفعال</button>
        <span style="color:var(--muted);font-size:11.5px;align-self:center">تغییرات فوراً در همهٔ صفحات اعمال می‌شود</span>
      </div>
    </div>
    ${groups.map(g => `
      <div class="glass" style="margin-bottom:16px">
        <div class="card-head"><span class="ic">⚙️</span><h3>${g.t}</h3><span class="tag">${g.items.filter(i=>s[i[0]]).length}/${g.items.length} فعال</span></div>
        <div style="margin-top:10px">
        ${g.items.map(([k, name, desc]) => `
          <div class="set-row ${s[k] ? '' : 'off'}" data-k="${k}">
            <span style="font-size:20px">${name.split(' ')[0]}</span>
            <div class="info"><b>${name.replace(/^[^ ]+ /,'')}</b><small>${desc}</small></div>
            <label class="switch"><input type="checkbox" data-set="${k}" ${s[k]?'checked':''}><span class="trk"></span></label>
          </div>`).join('')}
        </div>
      </div>`).join('')}`;
    $$('[data-set]').forEach(inp => inp.addEventListener('change', () => {
      const k = inp.dataset.set;
      s[k] = inp.checked;
      saveSettings(s);
      APP.toast('تنظیم نمایش ذخیره شد ✓', 'green');
    }));
    $('#st-all-on').addEventListener('click', () => { Object.keys(DEFAULTS).forEach(k => s[k]=true); saveSettings(s); APP.go('settings'); APP.toast('همهٔ نمودارها فعال شدند ✓', 'green'); });
    $('#st-all-off').addEventListener('click', () => { Object.keys(DEFAULTS).forEach(k => s[k]=false); saveSettings(s); APP.go('settings'); APP.toast('همهٔ نمودارها غیرفعال شدند', 'orange'); });
  }

  /* ═══════════════ صفحه: پلن مدیریت (تب‌ها) ═══════════════ */
  let mgmtTab = 'players';
  function pageMgmt(){
    const v = $('#view');
    const tabs = [
      ['players','👥','بازیکنان'], ['courses','🗺️','زمین‌ها'], ['tournaments','🏆','مسابقات'],
      ['results','⛳','نتایج'], ['calendar','📅','تقویم'],
    ];
    v.innerHTML = `
    <div class="glass gold-border" style="margin-bottom:18px">
      <div class="card-head"><span class="ic">⚙️</span><h3>پلن مدیریت — ساخت، ویرایش، حذف</h3><span class="tag">Admin PRO</span></div>
      <div class="mgmt-tabs">
        ${tabs.map(([id,ic,n]) => `<div class="mgmt-tab ${mgmtTab===id?'on':''}" data-tab="${id}">${ic} ${n}</div>`).join('')}
      </div>
    </div>
    <div id="mgmt-body"></div>`;
    $$('.mgmt-tab').forEach(t => t.addEventListener('click', () => { mgmtTab = t.dataset.tab; APP.go('mgmt'); }));
    renderMgmtTab();
  }

  function renderMgmtTab(){
    const body = $('#mgmt-body'); if (!body) return;
    if (mgmtTab === 'players') mgmtPlayers(body);
    else if (mgmtTab === 'courses') mgmtCourses(body);
    else if (mgmtTab === 'tournaments') mgmtTournaments(body);
    else if (mgmtTab === 'results') mgmtResults(body);
    else if (mgmtTab === 'calendar') mgmtCalendar(body);
  }

  /* ───────── فرم جامع بازیکن (مشترک ساخت/ویرایش) ───────── */
  function playerFormHTML(p){
    p = p || { name:'', family:'', gender:'مرد', hcp:'10', join:'', birth:'', phone:'', national:'', email:'', address:'', father:'', fatherPhone:'', mother:'', motherPhone:'', photo:'', user:'', pass:'' };
    const today = new Date().toISOString().slice(0,10);
    return `
    <div class="form-section">🪪 مشخصات اصلی</div>
    <div class="field-grid">
      <div class="photo-upload span2">
        <img id="pf-photo" class="ph-prev ${p.photo?'':'empty'}" src="${p.photo || ''}" alt="" ${p.photo?'':'data-empty="1"'}>
        <div style="flex:1">
          <label>عکس بازیکن (آپلود یا لمس برای انتخاب)</label>
          <input class="input" type="file" id="pf-file" accept="image/*" style="width:100%;margin-top:5px;font-size:11.5px">
          <div style="font-size:10.5px;color:var(--muted);margin-top:4px">فرمت‌های PNG / JPG — حداکثر ~۲ مگابایت</div>
        </div>
      </div>
      <div><label>نام</label><input class="input" id="pf-name" value="${esc(p.name)}" style="width:100%" placeholder="مثلاً علی"></div>
      <div><label>نام خانوادگی</label><input class="input" id="pf-family" value="${esc(p.family)}" style="width:100%" placeholder="مثلاً محمدی"></div>
      <div><label>جنسیت</label><select class="sel" id="pf-gender" style="width:100%"><option ${p.gender==='مرد'?'selected':''}>مرد</option><option ${p.gender==='زن'?'selected':''}>زن</option></select></div>
      <div><label>تاریخ تولد <small style="color:var(--dim)">(شمسی خودکار)</small></label>
        <input class="input" type="date" id="pf-birth" value="${p.birth}" style="width:100%;direction:ltr">
        <div id="pf-birth-fa" style="font-size:11px;color:var(--gold-l);margin-top:3px"></div></div>
      <div><label>تاریخ عضویت</label><input class="input" type="date" id="pf-join" value="${p.join || today}" style="width:100%;direction:ltr"></div>
      <div><label>هندیکپ</label><input class="input" type="number" id="pf-hcp" min="0" max="36" value="${p.hcp}" style="width:100%"></div>
    </div>
    <div class="form-section">📞 اطلاعات تماس</div>
    <div class="field-grid">
      <div><label>شماره موبایل</label><input class="input" id="pf-phone" value="${esc(p.phone)}" style="width:100%" placeholder="۰۹۱۲..."></div>
      <div><label>کد ملی</label><input class="input" id="pf-national" value="${esc(p.national)}" style="width:100%"></div>
      <div><label>ایمیل</label><input class="input" id="pf-email" value="${esc(p.email)}" style="width:100%" placeholder="example@mail.com"></div>
      <div class="span2"><label>آدرس</label><input class="input" id="pf-address" value="${esc(p.address)}" style="width:100%" placeholder="آدرس محل سکونت"></div>
    </div>
    <div class="form-section">👨‍👩‍👧 والدین / سرپرست</div>
    <div class="field-grid">
      <div><label>نام پدر</label><input class="input" id="pf-father" value="${esc(p.father)}" style="width:100%"></div>
      <div><label>شماره پدر</label><input class="input" id="pf-fatherPhone" value="${esc(p.fatherPhone)}" style="width:100%" placeholder="۰۹۱۲..."></div>
      <div><label>نام مادر</label><input class="input" id="pf-mother" value="${esc(p.mother)}" style="width:100%"></div>
      <div><label>شماره مادر</label><input class="input" id="pf-motherPhone" value="${esc(p.motherPhone)}" style="width:100%" placeholder="۰۹۱۲..."></div>
    </div>
    <div class="form-section">🔐 یوزر و پسورد ورود به سایت</div>
    <div class="field-grid">
      <div><label>نام کاربری (login)</label><input class="input" id="pf-user" value="${esc(p.user)}" style="width:100%;direction:ltr" placeholder="player123"></div>
      <div><label>رمز عبور</label>
        <input class="input" id="pf-pass" value="${esc(p.pass)}" style="width:100%;direction:ltr">
        <span class="gen-pass" id="pf-gen">⚡ تولید خودکار رمز</span>
      </div>
    </div>`;
  }
  function readPlayerForm(){
    return {
      name: $('#pf-name').value.trim(),
      family: $('#pf-family').value.trim(),
      gender: $('#pf-gender').value,
      birth: $('#pf-birth').value,
      join: $('#pf-join').value,
      hcp: Math.max(0, Math.min(36, +$('#pf-hcp').value || 10)),
      phone: $('#pf-phone').value.trim(),
      national: $('#pf-national').value.trim(),
      email: $('#pf-email').value.trim(),
      address: $('#pf-address').value.trim(),
      father: $('#pf-father').value.trim(),
      fatherPhone: $('#pf-fatherPhone').value.trim(),
      mother: $('#pf-mother').value.trim(),
      motherPhone: $('#pf-motherPhone').value.trim(),
      user: $('#pf-user').value.trim(),
      pass: $('#pf-pass').value,
    };
  }
  function wirePlayerForm(){
    // عکس
    const file = $('#pf-file');
    if (file) file.addEventListener('change', () => {
      const f = file.files && file.files[0];
      if (!f) return;
      if (f.size > 2.5*1024*1024){ APP.toast('حجم عکس زیاد است (حداکثر ۲.۵MB)', 'red'); return; }
      const rd = new FileReader();
      rd.onload = () => {
        const img = $('#pf-photo');
        img.src = rd.result; img.classList.remove('empty');
      };
      rd.readAsDataURL(f);
    });
    // تاریخ تولد → شمسی زنده
    const birth = $('#pf-birth'), fa = $('#pf-birth-fa');
    const updFa = () => {
      if (!birth.value || !fa) return;
      try {
        const j = D.jalaliInfo(D.dateFrom(birth.value));
        fa.textContent = `${D.fa(j.dd)} ${j.monthFa} ${D.fa(j.yy)} (${j.wd})`;
      } catch(e){}
    };
    if (birth){ updFa(); birth.addEventListener('change', updFa); }
    // تولید رمز
    const gen = $('#pf-gen');
    if (gen) gen.addEventListener('click', () => {
      const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
      let pw = '';
      for (let i=0;i<8;i++) pw += chars[Math.floor(Math.random()*chars.length)];
      $('#pf-pass').value = pw;
      APP.toast('رمز تصادفی ساخته شد — حتماً ذخیره کنید', 'gold');
    });
  }

  /* ── تب بازیکنان ── */
  function mgmtPlayers(body){
    const S = gstate().S, A = gstate().A;
    const players = S.players;
    body.innerHTML = `
    <div class="glass gold-border" style="margin-bottom:16px">
      <div class="card-head"><span class="ic">➕</span><h3>ثبت بازیکن جدید</h3><span class="tag">فرم جامع</span></div>
      <div id="np-form" style="margin-top:8px">${playerFormHTML()}</div>
      <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap">
        <button class="btn sm" id="np-add">+ ثبت بازیکن در آکادمی</button>
        <span style="color:var(--muted);font-size:11.5px;align-self:center">با ثبت، یوزر/پسورد برای ورود به سایت فعال می‌شود</span>
      </div>
    </div>
    <div class="glass">
      <div class="card-head"><span class="ic">👥</span><h3>بازیکنان آکادمی</h3><span class="tag">${D.fa(players.length)} نفر</span></div>
      <div class="toolbar" style="margin:10px 0">
        <input class="input" id="pl-search" placeholder="🔍 جستجو در نام / موبایل / کد ملی..." style="width:260px">
        <select class="sel" id="pl-filter"><option value="">همه</option><option value="active">فعال</option><option value="inactive">غیرفعال</option></select>
      </div>
      <div style="overflow-x:auto"><table class="tbl"><thead><tr>
        <th>عکس</th><th>بازیکن</th><th>تولد</th><th>موبایل</th><th>یوزر سایت</th><th>وضعیت</th><th>رنک</th><th>عملیات</th>
      </tr></thead><tbody id="pl-rows"></tbody></table></div>
    </div>`;
    wirePlayerForm();

    function renderRows(){
      const q = ($('#pl-search').value || '').trim().toLowerCase();
      const f = $('#pl-filter').value;
      const rows = players.filter(p => {
        if (f === 'active' && !p[5]) return false;
        if (f === 'inactive' && p[5]) return false;
        if (q){
          const full = playerFull(p[0]);
          const hay = (p[1] + ' ' + (full ? full.phone + ' ' + full.national + ' ' + full.user : '')).toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      });
      $('#pl-rows').innerHTML = rows.map(p => {
        const full = playerFull(p[0]);
        const rankRow = A.LB.find(r => r.pid === p[0]);
        const rank = rankRow ? rankRow.color : 'White';
        const col = D.RANK_DEF.find(r=>r[0]===rank)[3];
        const isCustom = p[0] >= 9000;
        const photo = full.photo || (p[2] === 'زن' ? (W.__AV_F || 'assets/avatar_f.png') : (W.__AV_M || 'assets/avatar_m.png'));
        const birthFa = full.birth ? (() => { try { const j = D.jalaliInfo(D.dateFrom(full.birth)); return `${D.fa(j.dd)} ${j.monthFa} ${D.fa(j.yy)}`; } catch(e){ return ''; } })() : '—';
        return `<tr data-pid="${p[0]}" class="${p[5]?'':'off-row'}">
          <td><img src="${photo}" style="width:38px;height:38px;border-radius:10px;object-fit:cover;border:1px solid ${col}66" alt=""></td>
          <td><b>${esc(p[1])}</b><br><small style="color:var(--muted)">${isCustom?'جدید':'پایه'} • HCP ${D.fa(full.hcp)}</small></td>
          <td style="font-size:11.5px;color:var(--muted)">${birthFa}</td>
          <td style="font-size:11.5px;direction:ltr" class="num">${esc(full.phone || '—')}</td>
          <td style="font-size:11.5px">${full.user ? `<span class="chip green">${esc(full.user)}</span>` : '<span class="chip dim">—</span>'}</td>
          <td><span class="chip ${p[5]?'green':'red'}">${p[5]?'فعال':'غیرفعال'}</span></td>
          <td><span class="rank-pill" style="background:${col}22;color:${col};border:1px solid ${col}55">${D.RANK_TEXT[rank]}</span></td>
          <td><div class="row-actions">
            <button class="btn sm ghost" data-act="edit" data-p="${p[0]}">✏️ ویرایش</button>
            ${p[5] ? `<button class="btn sm danger" data-act="deact" data-p="${p[0]}">⛔ غیرفعال</button>` : `<button class="btn sm green-ghost" data-act="act" data-p="${p[0]}">✔ فعال</button>`}
            ${isCustom ? `<button class="btn sm danger" data-act="del" data-p="${p[0]}">🗑 حذف</button>` : ''}
          </div></td>
        </tr>`;
      }).join('') || '<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:18px">بازیکنی یافت نشد</td></tr>';
    }
    renderRows();
    $('#pl-search').addEventListener('input', renderRows);
    $('#pl-filter').addEventListener('change', renderRows);

    $('#np-add').addEventListener('click', () => {
      const d = readPlayerForm();
      if (!d.name){ APP.toast('نام بازیکن را وارد کنید', 'red'); return; }
      const fullName = (d.name + ' ' + d.family).trim();
      // یوزر پیشنهادی اگر خالی بود
      let user = d.user;
      if (!user) user = 'player' + (9000 + customPlayers().length);
      let pass = d.pass;
      if (!pass) pass = 'golf' + String(Math.floor(1000 + Math.random()*9000));
      const lst = customPlayers();
      const pid = 9000 + (lst.length ? Math.max(...lst.map(p=>p.id)) - 9000 + 1 : 0);
      lst.push({ id: pid - 9000, name: d.name, family: d.family, gender: d.gender, hcp: d.hcp,
        join: d.join, birth: d.birth, phone: d.phone, national: d.national, email: d.email,
        address: d.address, father: d.father, fatherPhone: d.fatherPhone, mother: d.mother,
        motherPhone: d.motherPhone, photo: ($('#pf-photo').src && !$('#pf-photo').hasAttribute('data-empty')) ? $('#pf-photo').src : '',
        active: true });
      saveCustomPlayers(lst);
      const pu = playerUsers();
      pu[pid] = { user, pass, name: d.name, family: d.family, active: true };
      savePlayerUsers(pu);
      APP.reloadData(); APP.go('mgmt');
      APP.toast('بازیکن «' + fullName + '» ثبت شد — یوزر: ' + user + ' / رمز: ' + pass, 'green');
    });

    body.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => {
      const pid = +b.dataset.p, act = b.dataset.act;
      const p = S.players.find(x => x[0] === pid);
      if (!p) return;
      const isCustom = pid >= 9000;
      if (act === 'deact' || act === 'act'){
        const activeNow = act === 'act';
        if (isCustom){
          const lst = customPlayers();
          const c = lst.find(x => x.id === pid - 9000);
          if (c) c.active = activeNow;
          saveCustomPlayers(lst);
        } else {
          const ed = playerEdits();
          ed[pid] = Object.assign({}, ed[pid], { active: activeNow });
          savePlayerEdits(ed);
        }
        const pu = playerUsers();
        if (pu[pid]){ pu[pid].active = activeNow; savePlayerUsers(pu); }
        APP.reloadData(); APP.go('mgmt');
        APP.toast(activeNow ? 'بازیکن فعال شد ✓ — همهٔ امتیازها برگشت' : 'بازیکن غیرفعال شد ⛔ — امتیازها و کارت‌ها حذف شدند', activeNow ? 'green' : 'orange');
      }
      if (act === 'del'){
        if (isCustom){
          const lst = customPlayers().filter(x => x.id !== pid - 9000);
          saveCustomPlayers(lst);
          const pu = playerUsers(); delete pu[pid]; savePlayerUsers(pu);
          APP.reloadData(); APP.go('mgmt');
          APP.toast('بازیکن حذف شد 🗑', 'orange');
        } else {
          APP.toast('بازیکنان پایه حذف نمی‌شوند — می‌توانید غیرفعال کنید', 'gold');
        }
      }
      if (act === 'edit') editPlayerModal(pid);
    }));
  }

  function editPlayerModal(pid){
    const full = playerFull(pid);
    if (!full) return;
    let m = $('#modal-edit');
    if (!m){
      m = document.createElement('div');
      m.id = 'modal-edit';
      m.style.cssText = 'position:fixed;inset:0;z-index:200;display:none;align-items:center;justify-content:center;background:rgba(4,8,14,.72);backdrop-filter:blur(6px)';
      document.body.appendChild(m);
      m.addEventListener('click', e => { if (e.target === m) m.style.display = 'none'; });
    }
    m.innerHTML = `
    <div class="glass gold-border" style="width:min(760px,94vw);padding:22px;max-height:92vh;overflow:auto">
      <div class="card-head"><span class="ic">✏️</span><h3>ویرایش بازیکن</h3><span class="tag">${full.isCustom?'جدید':'پایه'}</span></div>
      <div style="margin-top:6px">${playerFormHTML(full)}</div>
      <div style="display:flex;gap:10px;margin-top:20px;justify-content:flex-end;flex-wrap:wrap">
        <button class="btn sm danger" id="ep-cancel">بستن</button>
        <button class="btn sm" id="ep-save">💾 ذخیره تغییرات</button>
      </div>
    </div>`;
    m.style.display = 'flex';
    wirePlayerForm();
    $('#ep-cancel').addEventListener('click', () => m.style.display = 'none');
    $('#ep-save').addEventListener('click', () => {
      const d = readPlayerForm();
      if (!d.name){ APP.toast('نام نمی‌تواند خالی باشد', 'red'); return; }
      const fullName = (d.name + ' ' + d.family).trim();
      const photo = $('#pf-photo').src && !$('#pf-photo').hasAttribute('data-empty') ? $('#pf-photo').src : full.photo;
      if (full.isCustom){
        const lst = customPlayers();
        const c = lst.find(x => x.id === pid - 9000);
        if (c) Object.assign(c, { name:d.name, family:d.family, gender:d.gender, hcp:d.hcp, join:d.join,
          birth:d.birth, phone:d.phone, national:d.national, email:d.email, address:d.address,
          father:d.father, fatherPhone:d.fatherPhone, mother:d.mother, motherPhone:d.motherPhone, photo });
        saveCustomPlayers(lst);
      } else {
        const ed = playerEdits();
        ed[pid] = Object.assign({}, ed[pid], { name: d.name, family: d.family, gender: d.gender, hcp: d.hcp, join: d.join,
          birth: d.birth, phone: d.phone, national: d.national, email: d.email, address: d.address,
          father: d.father, fatherPhone: d.fatherPhone, mother: d.mother, motherPhone: d.motherPhone, photo });
        savePlayerEdits(ed);
      }
      // یوزر/پسورد
      const pu = playerUsers();
      const prev = pu[pid] || { active: true };
      if (d.user || d.pass){
        pu[pid] = { user: d.user || prev.user || 'player' + pid, pass: d.pass || prev.pass, name: d.name, family: d.family, active: prev.active !== false };
        savePlayerUsers(pu);
      }
      APP.reloadData(); APP.go('mgmt');
      m.style.display = 'none';
      APP.toast('مشخصات «' + fullName + '» ذخیره شد ✓', 'green');
    });
  }

  /* ───────── نقشهٔ ماهواره‌ای (نمای شماتیک گوگل‌ارث) ───────── */
  function drawSatellite(cv, course, holes){
    const ctx = cv.getContext('2d');
    const W = cv.width = 680, H = cv.height = 380;
    const rnd = mulberry(course.id * 97 + (holes||18));
    // پس‌زمینهٔ زمین
    const g = ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,'#223e22'); g.addColorStop(0.5,'#2d552d'); g.addColorStop(1,'#3a6b34');
    ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
    // خطوط چمن (mowing stripes)
    ctx.fillStyle = 'rgba(255,255,255,0.035)';
    for (let i=0;i<14;i++){ ctx.fillRect((i%2?0:18)+i*46, 0, 22, H); }
    // فیروی (مسیر منحنی)
    ctx.save();
    ctx.strokeStyle = 'rgba(180,220,120,.9)'; ctx.lineWidth = 58; ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(60, H-40);
    ctx.bezierCurveTo(W*0.25, H*0.5, W*0.5, H*0.8, W*0.62, H*0.42);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(205,240,150,.85)'; ctx.lineWidth = 36; ctx.stroke();
    ctx.strokeStyle = 'rgba(225,250,180,.5)'; ctx.lineWidth = 16; ctx.stroke();
    ctx.restore();
    // بونکرها
    for (let i=0;i<5;i++){
      const bx = 120 + rnd()*(W-240), by = 60 + rnd()*(H-160);
      ctx.fillStyle = 'rgba(226,205,150,.9)';
      ctx.beginPath(); ctx.ellipse(bx, by, 22+rnd()*16, 14+rnd()*10, rnd()*3, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(255,244,200,.55)';
      ctx.beginPath(); ctx.ellipse(bx-4, by-4, 12, 7, 0, 0, 7); ctx.fill();
    }
    // دریاچه
    ctx.fillStyle = 'rgba(58,123,213,.85)';
    ctx.beginPath(); ctx.ellipse(W*0.86, H*0.2, 52, 30, -0.4, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(120,180,240,.4)';
    ctx.beginPath(); ctx.ellipse(W*0.86-10, H*0.2-8, 30, 14, -0.4, 0, 7); ctx.fill();
    // سبزه‌ها و پرچم‌ها
    const n = Math.min(holes||18, 18);
    for (let i=0;i<n;i++){
      const t = 0.08 + 0.84*(i/(n-1 || 1));
      const x = 70 + t*(W*0.55) + Math.sin(i*2.7)*16;
      const y = (H-44) + (0.5 - t)*(H*0.6) + Math.cos(i*1.9)*12;
      ctx.fillStyle = 'rgba(120,200,90,.95)';
      ctx.beginPath(); ctx.arc(x, y, 13, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(x, y, 13, 0, 7); ctx.stroke();
      // پرچم
      ctx.fillStyle = '#F8FAFC'; ctx.fillRect(x-1, y-30, 2, 30);
      ctx.fillStyle = '#E74C3C';
      ctx.beginPath(); ctx.moveTo(x+1, y-30); ctx.lineTo(x+13, y-26); ctx.lineTo(x+1, y-22); ctx.fill();
    }
    // سایهٔ دور (vignette)
    const vg = ctx.createRadialGradient(W/2, H/2, H*0.3, W/2, H/2, H*0.85);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.5)');
    ctx.fillStyle = vg; ctx.fillRect(0,0,W,H);
    // مختصات گوشه
    ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.font = '12px Consolas, monospace';
    ctx.textAlign = 'left'; ctx.fillText('LAT ' + course.lat.toFixed(5), 14, 24);
    ctx.fillText('LNG ' + course.lng.toFixed(5), 14, 40);
    ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,255,255,.4)';
    ctx.fillText('© Satellite view — GolfAcademy 1405', W-14, H-12);
  }
  function mulberry(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }

  /* ── انتخاب لوکیشن روی نقشه (map picker) ── */
  function openMapPicker(cb, initial){
    initial = initial || { lat: 24.7136, lng: 46.6753 };
    let m = $('#modal-map');
    if (!m){
      m = document.createElement('div');
      m.id = 'modal-map';
      m.style.cssText = 'position:fixed;inset:0;z-index:210;display:none;align-items:center;justify-content:center;background:rgba(4,8,14,.75);backdrop-filter:blur(6px)';
      document.body.appendChild(m);
      m.addEventListener('click', e => { if (e.target === m) m.style.display = 'none'; });
    }
    m.innerHTML = `
    <div class="glass gold-border" style="width:min(640px,94vw);padding:20px">
      <div class="card-head"><span class="ic">📍</span><h3>انتخاب موقعیت زمین روی نقشه</h3><span class="tag">کلیک = انتخاب</span></div>
      <div class="map-picker" id="mp-canvas-wrap" style="margin-top:12px">
        <canvas id="mp-canvas" width="600" height="340"></canvas>
        <div class="mk" id="mp-mk"></div>
      </div>
      <div style="display:flex;gap:10px;margin-top:14px;align-items:center;flex-wrap:wrap">
        <span style="font-size:12px;color:var(--muted)">مختصات:</span>
        <input class="input" id="mp-lat" value="${initial.lat}" style="width:110px;direction:ltr">
        <input class="input" id="mp-lng" value="${initial.lng}" style="width:110px;direction:ltr">
        <span class="chip blue" id="mp-name"></span>
        <div style="flex:1"></div>
        <button class="btn sm ghost" id="mp-cancel">انصراف</button>
        <button class="btn sm" id="mp-ok">✓ انتخاب</button>
      </div>
    </div>`;
    m.style.display = 'flex';
    const cv = $('#mp-canvas'), wrap = $('#mp-canvas-wrap'), mk = $('#mp-mk');
    const LATS = [29.2, 24.7, 26.4, 21.5, 25.9, 27.5];  // شهرهای عربستان (ریاض، جده...)
    const LNGS = [47.9, 46.7, 45.2, 39.2, 43.8, 41.7];
    const NAMES = ['ریاض','ریاض','قصیم','جده','حائل','مدینه'];
    function redraw(lat, lng){
      const ctx = cv.getContext('2d');
      ctx.clearRect(0,0,600,340);
      // پس‌زمینهٔ نقشه
      const g = ctx.createLinearGradient(0,0,600,340);
      g.addColorStop(0,'#16242e'); g.addColorStop(1,'#1d3138');
      ctx.fillStyle = g; ctx.fillRect(0,0,600,340);
      // شبکه
      ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.lineWidth = 1;
      for (let i=0;i<13;i++){ ctx.beginPath(); ctx.moveTo(i*50,0); ctx.lineTo(i*50,340); ctx.stroke(); }
      for (let i=0;i<8;i++){ ctx.beginPath(); ctx.moveTo(0,i*48); ctx.lineTo(600,i*48); ctx.stroke(); }
      // بلوک‌های شهری
      ctx.fillStyle = 'rgba(212,175,55,.12)';
      [[60,40],[420,90],[180,220],[480,240],[90,270],[330,120],[540,40]].forEach(([x,y]) => {
        ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x,y,70+ (x%3)*20, 50+(y%2)*16, 8) : ctx.rect(x,y,70,50); ctx.fill();
      });
      // جاده‌ها
      ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(0,200); ctx.lineTo(600,140); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(300,0); ctx.lineTo(240,340); ctx.stroke();
      // شهرها
      ctx.fillStyle = 'rgba(248,250,252,.85)'; ctx.font = '11px Tahoma';
      ctx.textAlign = 'center';
      LATS.forEach((la,i) => {
        const x = 30 + (LNGS[i]-39)*45, y = 320 - (la-21)*34;
        ctx.fillStyle = 'rgba(248,250,252,.6)';
        ctx.beginPath(); ctx.arc(x,y,4,0,7); ctx.fill();
        ctx.fillText(NAMES[i], x, y-8);
      });
      // مارکر انتخاب
      const x = 30 + (lng-39)*45, y = 320 - (lat-21)*34;
      mk.style.left = (x-9) + 'px'; mk.style.top = (y-18) + 'px';
      ctx.fillStyle = 'rgba(231,76,60,.9)';
      ctx.beginPath(); ctx.arc(x,y,7,0,7); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x,y,12,0,7); ctx.stroke();
    }
    redraw(+$('#mp-lat').value, +$('#mp-lng').value);
    wrap.addEventListener('click', e => {
      const r = wrap.getBoundingClientRect();
      const x = (e.clientX - r.left) * (600 / r.width);
      const y = (e.clientY - r.top) * (340 / r.height);
      const lat = +(21 + (320-y)/34).toFixed(4);
      const lng = +(39 + (x-30)/45).toFixed(4);
      $('#mp-lat').value = lat; $('#mp-lng').value = lng;
      redraw(lat, lng);
    });
    $('#mp-lat').addEventListener('input', () => redraw(+$('#mp-lat').value||0, +$('#mp-lng').value||0));
    $('#mp-lng').addEventListener('input', () => redraw(+$('#mp-lat').value||0, +$('#mp-lng').value||0));
    $('#mp-cancel').addEventListener('click', () => m.style.display = 'none');
    $('#mp-ok').addEventListener('click', () => {
      cb({ lat: +$('#mp-lat').value || initial.lat, lng: +$('#mp-lng').value || initial.lng });
      m.style.display = 'none';
    });
  }

  /* ── تب زمین‌ها ── */
  function mgmtCourses(body){
    const S = gstate().S;
    const extra = extraCourses();
    const rows = D.COURSES.map((c,i) => ({ id:c[0], name:c[1], loc:c[2], holes:c[3], pars:D.COURSE_PARS[c[0]], base:true, lat:24.7136, lng:46.6753 }))
      .concat(extra.map((c,i) => ({ id:1000+i, name:c.name, loc:c.loc||'ریاض', holes:c.holes, pars:c.pars, base:false, idx:i, lat:c.lat, lng:c.lng })));
    body.innerHTML = `
    <div class="glass gold-border" style="margin-bottom:16px">
      <div class="card-head"><span class="ic">➕</span><h3>طراح زمین — ثبت زمین جدید</h3><span class="tag">3 / 9 / 18</span></div>
      <div class="field-grid" style="margin-top:10px">
        <div><label>نام زمین</label><input class="input" id="mc-name" style="width:100%" placeholder="زمین جدید"></div>
        <div><label>محل / شهر</label><input class="input" id="mc-loc" style="width:100%" value="ریاض"></div>
        <div><label>تعداد میدان</label><select class="sel" id="mc-holes" style="width:100%"><option>3</option><option>9</option><option selected>18</option></select></div>
        <div><label>مختصات (lat, lng)</label>
          <div style="display:flex;gap:6px"><input class="input" id="mc-lat" value="24.7136" style="width:50%;direction:ltr"><input class="input" id="mc-lng" value="46.6753" style="width:50%;direction:ltr"></div>
        </div>
      </div>
      <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <button class="btn sm ghost" id="mc-pick">📍 انتخاب روی نقشه</button>
        <button class="btn sm ghost" id="mc-map">🛰 پیش‌نمایش ماهواره‌ای</button>
      </div>
      <div id="mc-pars" style="margin-top:14px;display:flex;gap:7px;flex-wrap:wrap"></div>
      <button class="btn sm" id="mc-add" style="margin-top:14px">+ ثبت زمین</button>
    </div>
    <div class="glass">
      <div class="card-head"><span class="ic">🗺️</span><h3>زمین‌های آکادمی</h3><span class="tag">${D.fa(S.courses.length)} زمین</span></div>
      <div style="overflow-x:auto"><table class="tbl"><thead><tr>
        <th>#</th><th>نام</th><th>محل</th><th>میدان</th><th>پار کل</th><th>موقعیت</th><th>عملیات</th>
      </tr></thead><tbody id="mc-rows"></tbody></table></div>
    </div>`;
    let parVals = [];
    function drawPars(){
      const n = +$('#mc-holes').value;
      if (parVals.length !== n) parVals = Array.from({length:n}, () => 4);
      $('#mc-pars').innerHTML = parVals.map((p,i) => `
        <div style="text-align:center">
          <div style="font-size:10px;color:var(--muted)">ح${D.fa(i+1)}</div>
          <input class="input" type="number" min="3" max="6" value="${p}" data-i="${i}" style="width:58px;text-align:center;direction:ltr">
        </div>`).join('');
      $$('#mc-pars input').forEach(inp => inp.addEventListener('change', () => { parVals[+inp.dataset.i] = Math.max(3, Math.min(6, +inp.value || 4)); }));
    }
    drawPars();
    $('#mc-holes').addEventListener('change', drawPars);
    $('#mc-pick').addEventListener('click', () => openMapPicker(c => {
      $('#mc-lat').value = c.lat; $('#mc-lng').value = c.lng;
      APP.toast('موقعیت انتخاب شد: ' + c.lat + ' , ' + c.lng, 'green');
    }, { lat:+$('#mc-lat').value, lng:+$('#mc-lng').value }));
    $('#mc-map').addEventListener('click', () => showSatelliteModal({ id:999, name:$('#mc-name').value||'زمین جدید', lat:+$('#mc-lat').value, lng:+$('#mc-lng').value }, +$('#mc-holes').value));
    $('#mc-add').addEventListener('click', () => {
      const name = $('#mc-name').value.trim();
      if (!name){ APP.toast('نام زمین را وارد کنید', 'red'); return; }
      const holes = +$('#mc-holes').value;
      const pars = parVals.slice(0, holes);
      extra.push({ name, loc: $('#mc-loc').value.trim() || 'ریاض', holes, pars, lat:+$('#mc-lat').value, lng:+$('#mc-lng').value });
      saveCourses(extra); APP.reloadData(); APP.go('mgmt'); mgmtTab='courses';
      APP.toast('زمین «' + name + '» ثبت شد ✓', 'green');
    });
    $('#mc-rows').innerHTML = rows.map(r => `<tr class="${r.base?'':'custom-row'}">
      <td class="num">${D.fa(r.id)}</td><td><b>${esc(r.name)}</b> ${r.base?'<span class="chip dim">پایه</span>':'<span class="chip purple">سفارشی</span>'}</td>
      <td>${esc(r.loc)}</td><td class="num">${D.fa(r.holes)}</td>
      <td class="num" style="color:var(--gold-l)">${D.fa(r.pars.reduce((a,b)=>a+b,0))}</td>
      <td><button class="btn sm ghost" data-act="sat" data-idx="${rows.indexOf(r)}">🛰 نقشه</button></td>
      <td><div class="row-actions">
        <button class="btn sm ghost" data-act="editc" data-idx="${rows.indexOf(r)}">✏️ ویرایش</button>
        ${r.base ? '' : `<button class="btn sm danger" data-act="delc" data-idx="${r.idx}">🗑 حذف</button>`}
      </div></td></tr>`).join('');
    body.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => {
      const act = b.dataset.act, idx = +b.dataset.idx;
      const r = rows[idx];
      if (act === 'sat') showSatelliteModal(r, r.holes);
      if (act === 'delc'){
        const lst = extraCourses(); lst.splice(r.idx,1); saveCourses(lst); APP.reloadData(); APP.go('mgmt'); mgmtTab='courses'; APP.toast('زمین حذف شد 🗑','orange');
      }
      if (act === 'editc') editCourseModal(r);
    }));
  }

  function showSatelliteModal(course, holes){
    let m = $('#modal-sat');
    if (!m){
      m = document.createElement('div');
      m.id = 'modal-sat';
      m.style.cssText = 'position:fixed;inset:0;z-index:210;display:none;align-items:center;justify-content:center;background:rgba(4,8,14,.75);backdrop-filter:blur(6px)';
      document.body.appendChild(m);
      m.addEventListener('click', e => { if (e.target === m) m.style.display = 'none'; });
    }
    m.innerHTML = `
    <div class="glass gold-border" style="width:min(720px,94vw);padding:18px">
      <div class="card-head"><span class="ic">🛰</span><h3>نمای ماهواره‌ای — ${esc(course.name)}</h3><span class="tag">${D.fa(holes)} حفره</span></div>
      <div class="sat-wrap" style="margin-top:12px">
        <canvas id="sat-canvas"></canvas>
        <div class="sat-overlay">${esc(course.name)} • ${esc(course.loc||'')}</div>
        <div class="sat-coords">${(course.lat||24.7136).toFixed(5)}, ${(course.lng||46.6753).toFixed(5)}</div>
      </div>
      <div style="display:flex;gap:10px;margin-top:14px;justify-content:flex-end;flex-wrap:wrap">
        <button class="btn sm ghost" id="sat-gmaps">🗺 باز کردن در Google Maps</button>
        <button class="btn sm" id="sat-close">بستن</button>
      </div>
    </div>`;
    m.style.display = 'flex';
    drawSatellite($('#sat-canvas'), { id: course.id||1, lat: course.lat||24.7136, lng: course.lng||46.6753 }, holes);
    $('#sat-close').addEventListener('click', () => m.style.display = 'none');
    $('#sat-gmaps').addEventListener('click', () => {
      window.open('https://www.google.com/maps?q=' + (course.lat||24.7136) + ',' + (course.lng||46.6753), '_blank');
    });
  }

  function editCourseModal(r){
    let m = $('#modal-edit');
    if (!m){
      m = document.createElement('div');
      m.id = 'modal-edit';
      m.style.cssText = 'position:fixed;inset:0;z-index:200;display:none;align-items:center;justify-content:center;background:rgba(4,8,14,.72);backdrop-filter:blur(6px)';
      document.body.appendChild(m);
      m.addEventListener('click', e => { if (e.target === m) m.style.display = 'none'; });
    }
    m.innerHTML = `
    <div class="glass gold-border" style="width:min(640px,94vw);padding:22px;max-height:92vh;overflow:auto">
      <div class="card-head"><span class="ic">✏️</span><h3>ویرایش زمین — ${esc(r.name)}</h3><span class="tag">${r.base?'پایه':'سفارشی'}</span></div>
      <div class="field-grid" style="margin-top:12px">
        <div><label>نام</label><input class="input" id="ec-name" style="width:100%" value="${esc(r.name)}"></div>
        <div><label>محل</label><input class="input" id="ec-loc" style="width:100%" value="${esc(r.loc)}"></div>
        <div><label>مختصات lat</label><input class="input" id="ec-lat" style="width:100%;direction:ltr" value="${r.lat||24.7136}"></div>
        <div><label>مختصات lng</label><input class="input" id="ec-lng" style="width:100%;direction:ltr" value="${r.lng||46.6753}"></div>
      </div>
      <div style="margin-top:10px"><button class="btn sm ghost" id="ec-pick">📍 انتخاب روی نقشه</button></div>
      <div style="margin-top:12px;display:flex;gap:7px;flex-wrap:wrap" id="ec-pars">
        ${r.pars.map((p,i) => `<div style="text-align:center">
          <div style="font-size:10px;color:var(--muted)">ح${D.fa(i+1)}</div>
          <input class="input" type="number" min="3" max="6" value="${p}" data-i="${i}" style="width:58px;text-align:center;direction:ltr">
        </div>`).join('')}
      </div>
      <div style="display:flex;gap:10px;margin-top:18px;justify-content:flex-end">
        <button class="btn sm ghost" id="ec-cancel">انصراف</button>
        <button class="btn sm" id="ec-save">💾 ذخیره</button>
      </div>
    </div>`;
    m.style.display = 'flex';
    $('#ec-pick').addEventListener('click', () => openMapPicker(c => { $('#ec-lat').value = c.lat; $('#ec-lng').value = c.lng; }, { lat:+$('#ec-lat').value, lng:+$('#ec-lng').value }));
    $('#ec-cancel').addEventListener('click', () => m.style.display = 'none');
    $('#ec-save').addEventListener('click', () => {
      const name = $('#ec-name').value.trim();
      if (!name){ APP.toast('نام زمین را وارد کنید','red'); return; }
      const pars = $$('#ec-pars input').map(inp => Math.max(3, Math.min(6, +inp.value || 4)));
      const lat = +$('#ec-lat').value || 24.7136, lng = +$('#ec-lng').value || 46.6753;
      if (r.base){
        let ov = {};
        try { ov = JSON.parse(localStorage.getItem('ga_course_override') || '{}'); } catch(e){}
        ov[r.id] = { name, loc: $('#ec-loc').value.trim(), pars, lat, lng };
        localStorage.setItem('ga_course_override', JSON.stringify(ov));
        if (D.PAR_MAP) D.PAR_MAP[r.id] = pars;
      } else {
        const lst = extraCourses();
        const c = lst[r.idx];
        if (c){ c.name = name; c.loc = $('#ec-loc').value.trim(); c.pars = pars; c.lat = lat; c.lng = lng; }
        saveCourses(lst);
      }
      APP.reloadData(); APP.go('mgmt'); mgmtTab='courses';
      m.style.display = 'none';
      APP.toast('زمین ذخیره شد ✓', 'green');
    });
  }

  /* ── تب مسابقات ── */
  function mgmtTournaments(body){
    const S = gstate().S;
    const base = D.TOURNAMENTS.map((t,i) => ({ t, base:true }));
    const extra = extraTours().map((t,i) => ({ t: [1000+i, t.name, +t.lvl, +t.course, +t.holes, t.date], base:false, idx:i }));
    const rows = base.concat(extra);
    body.innerHTML = `
    <div class="glass gold-border" style="margin-bottom:16px">
      <div class="card-head"><span class="ic">➕</span><h3>طراح مسابقه — ثبت مسابقه جدید</h3><span class="tag">زمین + حفره + سطح</span></div>
      <div class="field-grid" style="margin-top:10px">
        <div class="span2"><label>نام مسابقه</label><input class="input" id="mt-name" style="width:100%" placeholder="جام جدید"></div>
        <div><label>سطح</label><select class="sel" id="mt-lvl" style="width:100%"><option value="1">سطح ۱ (حرفه‌ای)</option><option value="2" selected>سطح ۲ (نیمه‌حرفه‌ای)</option><option value="3">سطح ۳ (آماتور)</option></select></div>
        <div><label>زمین</label><select class="sel" id="mt-crs" style="width:100%">${S.courses.map(c=>`<option value="${c[0]}">${esc(c[1])}</option>`).join('')}</select></div>
        <div><label>حفره</label><select class="sel" id="mt-holes" style="width:100%"><option>9</option><option selected>18</option></select></div>
        <div><label>تاریخ شروع</label><input class="input" id="mt-date" type="date" value="2026-09-25" style="width:100%;direction:ltr"></div>
        <div><label>ساعت شروع</label><input class="input" id="mt-time" type="time" value="08:00" style="width:100%;direction:ltr"></div>
        <div><label>جایزهٔ نفر اول (امتیاز)</label><input class="input" id="mt-prize" type="number" value="20" style="width:100%"></div>
      </div>
      <button class="btn sm" id="mt-add" style="margin-top:14px">+ ثبت مسابقه</button>
    </div>
    <div class="glass">
      <div class="card-head"><span class="ic">📅</span><h3>مسابقات فصل</h3><span class="tag">${D.fa(S.tournaments.length)} رویداد</span></div>
      <div style="overflow-x:auto"><table class="tbl"><thead><tr>
        <th>#</th><th>نام</th><th>سطح</th><th>زمین</th><th>حفره</th><th>تاریخ</th><th>وضعیت</th><th>عملیات</th>
      </tr></thead><tbody id="mt-rows"></tbody></table></div>
    </div>`;
    $('#mt-rows').innerHTML = rows.map(({t, base, idx}) => {
      const past = D.dateFrom(t[5]) < D.TODAY;
      const j = D.jalaliInfo(D.dateFrom(t[5]));
      return `<tr>
        <td class="num">${D.fa(t[0])}</td><td><b>${esc(t[1])}</b> ${base?'<span class="chip dim">پایه</span>':'<span class="chip purple">سفارشی</span>'}</td>
        <td><span class="chip ${t[2]===1?'gold':t[2]===2?'green':'blue'}">سطح ${D.fa(t[2])}</span></td>
        <td style="color:var(--muted)">${esc(D.COURSE_NAME[t[3]]||'—')}</td>
        <td class="num">${D.fa(t[4])}</td>
        <td class="ltr" style="color:var(--muted);font-size:11.5px">${D.fa(j.dd)} ${j.monthFa}</td>
        <td><span class="chip ${past?'dim':'green'}">${past?'برگزار شده':'آینده'}</span></td>
        <td><div class="row-actions">
          <button class="btn sm ghost" data-act="editt" data-idx="${rows.indexOf(rows.find(r=>r.t[0]===t[0]))}">✏️</button>
          ${base ? '' : `<button class="btn sm danger" data-act="delt" data-idx="${idx}">🗑</button>`}
        </div></td></tr>`;
    }).join('');
    $('#mt-add').addEventListener('click', () => {
      const name = $('#mt-name').value.trim();
      const date = $('#mt-date').value;
      if (!name || !date){ APP.toast('نام و تاریخ را وارد کنید', 'red'); return; }
      extra.push({ name, lvl: +$('#mt-lvl').value, course: +$('#mt-crs').value, holes: +$('#mt-holes').value, date, time: $('#mt-time').value, prize: +$('#mt-prize').value });
      saveTours(extra); APP.reloadData(); APP.go('mgmt'); mgmtTab='tournaments';
      APP.toast('مسابقه «' + name + '» ثبت شد ✓', 'green');
    });
    body.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => {
      const act = b.dataset.act, idx = +b.dataset.idx;
      const row = rows[idx];
      if (act === 'delt'){
        const lst = extraTours(); lst.splice(row.idx,1); saveTours(lst); APP.reloadData(); APP.go('mgmt'); mgmtTab='tournaments'; APP.toast('مسابقه حذف شد 🗑','orange');
      }
      if (act === 'editt') editTourModal(row.t, row.base, row.idx);
    }));
  }

  function editTourModal(t, base, idx){
    const S = gstate().S;
    let m = $('#modal-edit');
    if (!m){
      m = document.createElement('div');
      m.id = 'modal-edit';
      m.style.cssText = 'position:fixed;inset:0;z-index:200;display:none;align-items:center;justify-content:center;background:rgba(4,8,14,.72);backdrop-filter:blur(6px)';
      document.body.appendChild(m);
      m.addEventListener('click', e => { if (e.target === m) m.style.display = 'none'; });
    }
    m.innerHTML = `
    <div class="glass gold-border" style="width:min(560px,94vw);padding:22px">
      <div class="card-head"><span class="ic">✏️</span><h3>ویرایش مسابقه — ${esc(t[1])}</h3><span class="tag">${base?'پایه':'سفارشی'}</span></div>
      <div class="field-grid" style="margin-top:12px">
        <div class="span2"><label>نام</label><input class="input" id="et-name" style="width:100%" value="${esc(t[1])}"></div>
        <div><label>تاریخ</label><input class="input" id="et-date" type="date" value="${t[5]}" style="width:100%;direction:ltr"></div>
        <div><label>سطح</label><select class="sel" id="et-lvl" style="width:100%"><option value="1" ${t[2]===1?'selected':''}>سطح ۱</option><option value="2" ${t[2]===2?'selected':''}>سطح ۲</option><option value="3" ${t[2]===3?'selected':''}>سطح ۳</option></select></div>
        <div><label>زمین</label><select class="sel" id="et-crs" style="width:100%">${S.courses.map(c=>`<option value="${c[0]}" ${c[0]===t[3]?'selected':''}>${esc(c[1])}</option>`).join('')}</select></div>
        <div><label>حفره</label><select class="sel" id="et-holes" style="width:100%"><option ${t[4]===9?'selected':''}>9</option><option ${t[4]===18?'selected':''}>18</option></select></div>
      </div>
      <div style="display:flex;gap:10px;margin-top:18px;justify-content:flex-end">
        <button class="btn sm ghost" id="et-cancel">انصراف</button>
        <button class="btn sm" id="et-save">💾 ذخیره</button>
      </div>
    </div>`;
    m.style.display = 'flex';
    $('#et-cancel').addEventListener('click', () => m.style.display = 'none');
    $('#et-save').addEventListener('click', () => {
      const name = $('#et-name').value.trim();
      if (!name){ APP.toast('نام مسابقه را وارد کنید','red'); return; }
      const data = { name, date: $('#et-date').value, lvl: +$('#et-lvl').value, course: +$('#et-crs').value, holes: +$('#et-holes').value };
      if (base){
        let ov = {};
        try { ov = JSON.parse(localStorage.getItem('ga_tour_override') || '{}'); } catch(e){}
        ov[t[0]] = data;
        localStorage.setItem('ga_tour_override', JSON.stringify(ov));
      } else {
        const lst = extraTours();
        if (lst[idx]) Object.assign(lst[idx], data);
        saveTours(lst);
      }
      APP.reloadData(); APP.go('mgmt'); mgmtTab='tournaments';
      m.style.display = 'none';
      APP.toast('مسابقه ذخیره شد ✓', 'green');
    });
  }

  /* ── تب نتایج ── */
  function mgmtResults(body){
    const S = gstate().S;
    const pastTours = S.tournaments.filter(t => D.dateFrom(t[5]) < D.TODAY);
    body.innerHTML = `
    <div class="glass gold-border" style="margin-bottom:16px">
      <div class="card-head"><span class="ic">⛳</span><h3>ثبت نتیجه — ضربات هر میدان</h3><span class="tag">رتبه و امتیاز خودکار</span></div>
      <div class="toolbar" style="margin-top:10px">
        <span class="lbl">مسابقه:</span>
        <select class="sel" id="mr-tour">${pastTours.map(t=>`<option value="${t[0]}">${esc(t[1])}</option>`).join('')}</select>
        <span class="lbl">بازیکن:</span>
        <select class="sel" id="mr-pl">${S.players.filter(p=>p[5]).map(p=>`<option value="${p[0]}">${esc(p[1])}</option>`).join('')}</select>
      </div>
      <div id="mr-holes" style="display:flex;gap:7px;flex-wrap:wrap;margin:14px 0"></div>
      <button class="btn sm" id="mr-add">+ ثبت کارت امتیاز</button>
    </div>
    <div class="glass">
      <div class="card-head"><span class="ic">📋</span><h3>کارت‌های ثبت‌شده</h3><span class="tag">${D.fa(extraCards().length)} کارت</span></div>
      <div id="mr-list"></div>
    </div>`;
    let holeVals = [];
    function drawHoles(){
      const t = S.tournaments.find(x => x[0] === +$('#mr-tour').value);
      const n = t ? t[4] : 9;
      const pars = t ? D.parsOf(t[3]) : [];
      holeVals = Array.from({length:n}, () => '');
      $('#mr-holes').innerHTML = Array.from({length:n}, (_,i) => `
        <div style="text-align:center">
          <div style="font-size:10px;color:var(--muted)">ح${D.fa(i+1)} <small style="color:var(--gold-l)">پ${D.fa(pars[i])}</small></div>
          <input class="input" type="number" min="1" max="12" data-i="${i}" style="width:52px;text-align:center;direction:ltr" placeholder="—">
        </div>`).join('');
      $$('#mr-holes input').forEach(inp => inp.addEventListener('input', () => { holeVals[+inp.dataset.i] = +inp.value || null; }));
    }
    drawHoles();
    $('#mr-tour').addEventListener('change', drawHoles);
    $('#mr-add').addEventListener('click', () => {
      const tour = +$('#mr-tour').value, pid = +$('#mr-pl').value;
      const t = S.tournaments.find(x => x[0] === tour);
      const strokes = {};
      let ok = 0;
      for (let h = 1; h <= t[4]; h++){
        const val = holeVals[h-1];
        if (val !== null && val > 0){ strokes[h] = val; ok++; }
      }
      if (ok < t[4]){ APP.toast('همهٔ میدان‌ها را پر کنید', 'red'); return; }
      const lst = extraCards();
      lst.push({ tour, pid, strokes });
      saveCards(lst); APP.reloadData(); APP.go('mgmt'); mgmtTab='results';
      APP.toast('کارت ثبت شد — رتبه و امتیاز خودکار محاسبه شد ✓', 'green');
    });
    const lst = extraCards();
    $('#mr-list').innerHTML = lst.length ? `<table class="tbl"><thead><tr><th>مسابقه</th><th>بازیکن</th><th>ضربات</th><th>عملیات</th></tr></thead><tbody>
      ${lst.map((c,i) => {
        const t = S.tournaments.find(x=>x[0]===c.tour);
        const total = Object.values(c.strokes).reduce((a,b)=>a+b,0);
        return `<tr><td>${esc(t?t[1]:'—')}</td><td><b>${esc(D.PLAYER_NAME[c.pid]||'—')}</b></td>
        <td class="num" style="color:var(--gold-l)">${D.fa(total)}</td>
        <td><div class="row-actions"><button class="btn sm ghost" data-act="editr" data-i="${i}">✏️</button><button class="btn sm danger" data-act="delr" data-i="${i}">🗑</button></div></td></tr>`;
      }).join('')}</tbody></table>` : '<div style="color:var(--muted);font-size:12.5px;padding:8px">هنوز کارتی ثبت نشده است.</div>';
    body.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => {
      const i = +b.dataset.i, act = b.dataset.act;
      if (act === 'delr'){ const a = extraCards(); a.splice(i,1); saveCards(a); APP.reloadData(); APP.go('mgmt'); mgmtTab='results'; APP.toast('کارت حذف شد 🗑','orange'); }
      if (act === 'editr'){
        const c = lst[i];
        $('#mr-tour').value = String(c.tour);
        $('#mr-pl').value = String(c.pid);
        drawHoles();
        $$('#mr-holes input').forEach(inp => {
          const h = +inp.dataset.i + 1;
          inp.value = c.strokes[h] || '';
          holeVals[+inp.dataset.i] = c.strokes[h] || null;
        });
        const a = extraCards(); a.splice(i,1); saveCards(a);
        APP.toast('کارت برای ویرایش باز شد — دوباره ثبت کنید', 'gold');
      }
    }));
  }

  /* ── تب تقویم ── */
  function mgmtCalendar(body){
    body.innerHTML = `
    <div class="glass gold-border" style="margin-bottom:16px">
      <div class="card-head"><span class="ic">➕</span><h3>افزودن رویداد به تقویم</h3><span class="tag">Custom Event</span></div>
      <div class="ev-form" style="margin-top:10px">
        <div><label style="font-size:11px;color:var(--muted)">نام رویداد</label><input class="input" id="me-name" style="width:100%" placeholder="مثلاً: اردوی هفتگی"></div>
        <div><label style="font-size:11px;color:var(--muted)">تاریخ</label><input class="input" id="me-date" type="date" style="width:100%;direction:ltr"></div>
        <div><label style="font-size:11px;color:var(--muted)">نوع</label><select class="sel" id="me-type" style="width:100%">
          <option value="مسابقه">🏆 مسابقه</option><option value="تمرین">🏌️ تمرین</option><option value="کلاس">📚 کلاس</option><option value="اردو">⛺ اردو</option><option value="دیگر">📌 دیگر</option>
        </select></div>
        <button class="btn sm" id="me-add" style="align-self:end">+ افزودن</button>
      </div>
    </div>
    <div class="glass">
      <div class="card-head"><span class="ic">🗓️</span><h3>رویدادهای سفارشی تقویم</h3><span class="tag">${D.fa(customEvents().length)} رویداد</span></div>
      <div id="me-list" style="margin-top:8px"></div>
    </div>
    <div class="glass" style="margin-top:16px">
      <div class="card-head"><span class="ic">🇮🇷</span><h3>تعطیلات رسمی و مناسبت‌های ایران ۱۴۰۵ (منبع: time.ir)</h3><span class="tag">${D.fa(D.IR_HOLIDAYS.filter(h=>h[3]==='holiday').length)} تعطیل</span></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px;margin-top:10px">
        ${['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'].map((m,mi) => {
          const list = D.IR_HOLIDAYS.filter(h => h[0] === mi+1);
          if (!list.length) return '';
          return `<div style="background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:12px">
            <b style="color:var(--gold-l);font-size:13px">${m}</b>
            <div class="holi-list" style="margin-top:8px">${list.map(h => `
              <div class="h-item"><span class="h-day">${D.fa(h[1])}</span><span style="flex:1">${esc(h[2])}</span><span class="chip ${h[3]==='holiday'?'red':'blue'}">${h[3]==='holiday'?'تعطیل':'مناسبت'}</span></div>`).join('')}
            </div></div>`;
        }).join('')}
      </div>
    </div>`;
    $('#me-add').addEventListener('click', () => {
      const name = $('#me-name').value.trim();
      const date = $('#me-date').value;
      if (!name || !date){ APP.toast('نام و تاریخ رویداد را وارد کنید', 'red'); return; }
      const lst = customEvents();
      lst.push({ name, date, type: $('#me-type').value });
      saveEvents(lst); APP.go('mgmt'); mgmtTab='calendar';
      APP.toast('رویداد «' + name + '» به تقویم اضافه شد ✓', 'green');
    });
    const lst = customEvents();
    $('#me-list').innerHTML = lst.length ? `<div class="holi-list">
      ${lst.map((e,i) => {
        const j = D.jalaliInfo(D.dateFrom(e.date));
        return `<div class="h-item"><span class="h-day">${D.fa(j.dd)} ${j.monthFa}</span>
          <span style="flex:1"><b>${esc(e.name)}</b> <span class="chip blue">${esc(e.type)}</span></span>
          <button class="btn sm danger" data-delme="${i}">🗑</button></div>`;
      }).join('')}</div>` : '<div style="color:var(--muted);font-size:12.5px;padding:8px">رویداد سفارشی ثبت نشده است.</div>';
    $$('#me-list [data-delme]').forEach(b => b.addEventListener('click', () => {
      const a = customEvents(); a.splice(+b.dataset.delme,1); saveEvents(a); APP.go('mgmt'); mgmtTab='calendar'; APP.toast('رویداد حذف شد 🗑','orange');
    }));
  }

  /* ── ابزارهای مشترک ── */
  function extraCourses(){ try{ return JSON.parse(localStorage.getItem('ga_courses')||'[]'); }catch(e){ return []; } }
  function extraTours(){ try{ return JSON.parse(localStorage.getItem('ga_tournaments')||'[]'); }catch(e){ return []; } }
  function extraCards(){ try{ return JSON.parse(localStorage.getItem('ga_scorecards')||'[]'); }catch(e){ return []; } }
  function saveCourses(a){ try{ localStorage.setItem('ga_courses', JSON.stringify(a)); }catch(e){} }
  function saveTours(a){ try{ localStorage.setItem('ga_tournaments', JSON.stringify(a)); }catch(e){} }
  function saveCards(a){ try{ localStorage.setItem('ga_scorecards', JSON.stringify(a)); }catch(e){} }

  /* ═══════════════ API ═══════════════ */
  window.MGMT = {
    pageSettings, pageMgmt, renderMgmtTab, customEvents, saveEvents,
    customPlayers, saveCustomPlayers, playerEdits, savePlayerEdits,
    playerUsers, savePlayerUsers, playerFull,
    getSettings, saveSettings, DEFAULTS,
    drawSatellite, openMapPicker,
  };
})();
