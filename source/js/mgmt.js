/* ═══════════════════════════════════════════════════════════════════
   GolfAcademy PRO — پنل مدیریت جامع + تنظیمات نمایش
   CRUD کامل: بازیکن، زمین، مسابقه، نتایج، رویداد تقویم، نمایش نمودارها
   ═══════════════════════════════════════════════════════════════════ */
(function(){
  const W = window;
  const D = window.Data;
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];

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
    if (W.MGMT) W.MGMT.reloadUI();
  }

  /* ── رویدادهای سفارشی تقویم ── */
  function customEvents(){
    try { return JSON.parse(localStorage.getItem('ga_events') || '[]'); } catch(e){ return []; }
  }
  function saveEvents(a){ try { localStorage.setItem('ga_events', JSON.stringify(a)); } catch(e){} }

  /* ── بازیکنان سفارشی (مدیر اضافه میکند) ── */
  function customPlayers(){
    try { return JSON.parse(localStorage.getItem('ga_custom_players') || '[]'); } catch(e){ return []; }
  }
  function saveCustomPlayers(a){ try { localStorage.setItem('ga_custom_players', JSON.stringify(a)); } catch(e){} }

  /* ── ویرایش بازیکنان پایه ── */
  function playerEdits(){
    try { return JSON.parse(localStorage.getItem('ga_players') || '{}'); } catch(e){ return {}; }
  }
  function savePlayerEdits(e){ try { localStorage.setItem('ga_players', JSON.stringify(e)); } catch(e){} }

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function gstate(){
    return (window.APP && window.APP.state) ? window.APP.state() : { S:null, A:null };
  }

  /* ═══════════════ صفحه: تنظیمات نمایش ═══════════════ */
  function pageSettings(){
    const v = $('#view');
    const s = getSettings();
    const groups = [
      { t:'داشبورد و فرماندهی', items:[
        ['chCmd','🏠 کارتهای آمار فرماندهی','نمایش ۸ کارت کلیدی در صفحهٔ فرماندهی'],
        ['chMonthly','📈 نمودار امتیاز ماهانه','نمودار خطی امتیاز ماهها + انتخاب ماه'],
      ]},
      { t:'صفحات تحلیلی', items:[
        ['chRace','🏁 نمودار رقابت فصل','بارها و خطوط رقابت در صفحهٔ رقابت فصل'],
        ['chPlayer','🏌️ نمودارهای مرکز بازیکن','رادار مهارت + دونات فرم'],
        ['chMatch','🥇 نمودار فرماندهی مسابقه','تحلیل مسابقه و امتیازات'],
        ['chCourse','🗺️ نمودار هوش زمین','سختی حفرهها و کارنامه بازیکن'],
        ['chRecords','🎖️ نمودار رکوردها','آمار رکوردها و بهترینها'],
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
        <span style="color:var(--muted);font-size:11.5px;align-self:center">تغییرات فوراً در همهٔ صفحات اعمال میشود</span>
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

  /* ═══════════════ صفحه: پلن مدیریت (تبها) ═══════════════ */
  let mgmtTab = 'players';
  function pageMgmt(){
    const v = $('#view');
    const tabs = [
      ['players','👥','بازیکنان'], ['courses','🗺️','زمینها'], ['tournaments','🏆','مسابقات'],
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

  /* ── تب بازیکنان ── */
  function mgmtPlayers(body){
    const edits = playerEdits();
    const S = gstate().S, A = gstate().A;
    const players = S.players; // includes custom + edits applied
    body.innerHTML = `
    <div class="glass gold-border" style="margin-bottom:16px">
      <div class="card-head"><span class="ic">➕</span><h3>ثبت بازیکن جدید</h3><span class="tag">Custom</span></div>
      <div class="edit-grid" style="margin-top:10px">
        <div><label>نام و نام خانوادگی</label><input class="input" id="np-name" style="width:100%" placeholder="نام بازیکن"></div>
        <div><label>جنسیت</label><select class="sel" id="np-gender" style="width:100%"><option>مرد</option><option>زن</option></select></div>
        <div><label>هندیکپ</label><input class="input" type="number" id="np-hcp" value="10" min="0" max="36" style="width:100%"></div>
        <div><label>تاریخ عضویت</label><input class="input" id="np-join" type="date" value="${new Date().toISOString().slice(0,10)}" style="width:100%;direction:ltr"></div>
      </div>
      <button class="btn sm" id="np-add" style="margin-top:12px">+ ثبت بازیکن</button>
    </div>
    <div class="glass">
      <div class="card-head"><span class="ic">👥</span><h3>بازیکنان آکادمی</h3><span class="tag">${D.fa(players.length)} نفر</span></div>
      <div class="toolbar" style="margin:10px 0">
        <input class="input" id="pl-search" placeholder="🔍 جستجو در نام..." style="width:220px">
        <select class="sel" id="pl-filter"><option value="">همه</option><option value="active">فعال</option><option value="inactive">غیرفعال</option></select>
      </div>
      <div style="overflow-x:auto"><table class="tbl"><thead><tr><th>#</th><th>بازیکن</th><th>هندیکپ</th><th>وضعیت</th><th>رنک</th><th>عملیات</th></tr></thead><tbody id="pl-rows"></tbody></table></div>
    </div>`;

    function renderRows(){
      const q = ($('#pl-search').value || '').trim();
      const f = $('#pl-filter').value;
      const rows = players.filter(p => {
        if (f === 'active' && !p[5]) return false;
        if (f === 'inactive' && p[5]) return false;
        if (q && !p[1].includes(q)) return false;
        return true;
      });
      $('#pl-rows').innerHTML = rows.map((p,i) => {
        const rankRow = A.LB.find(r => r.pid === p[0]);
        const rank = rankRow ? rankRow.color : 'White';
        const col = D.RANK_DEF.find(r=>r[0]===rank)[3];
        const isCustom = p[0] >= 9000;
        const ed = edits[p[0]];
        return `<tr data-pid="${p[0]}" ${p[5]?'':'style="opacity:.55"'}>
          <td class="num">${D.fa(p[0])}</td>
          <td><b>${esc(p[1])}</b> ${isCustom?'<span class="chip purple">جدید</span>':(ed?'<span class="chip blue">ویرایش</span>':'')}</td>
          <td class="num">${D.fa(p[3])}</td>
          <td><span class="chip ${p[5]?'green':'dim'}">${p[5]?'فعال':'غیرفعال'}</span></td>
          <td><span class="rank-pill" style="background:${col}22;color:${col};border:1px solid ${col}55">${D.RANK_TEXT[rank]}</span></td>
          <td><div class="row-actions">
            <button class="btn sm ghost" data-act="edit" data-p="${p[0]}">✏️ ویرایش</button>
            ${p[5] ? `<button class="btn sm ghost" data-act="deact" data-p="${p[0]}">⛔ غیرفعال</button>` : `<button class="btn sm green-ghost" data-act="act" data-p="${p[0]}">✔ فعال</button>`}
            ${isCustom ? `<button class="btn sm danger" data-act="del" data-p="${p[0]}">🗑 حذف</button>` : ''}
          </div></td>
        </tr>`;
      }).join('') || '<tr><td colspan="6" style="text-align:center;color:var(--muted)">بازیکنی یافت نشد</td></tr>';
    }
    renderRows();
    $('#pl-search').addEventListener('input', renderRows);
    $('#pl-filter').addEventListener('change', renderRows);

    $('#np-add').addEventListener('click', () => {
      const name = $('#np-name').value.trim();
      if (!name){ APP.toast('نام بازیکن را وارد کنید', 'red'); return; }
      const lst = customPlayers();
      const id = 9000 + (lst.length ? Math.max(...lst.map(p=>p.id)) - 9000 + 1 : 0);
      lst.push({ id, name, gender: $('#np-gender').value, hcp: +$('#np-hcp').value || 10, join: $('#np-join').value, active: true });
      saveCustomPlayers(lst);
      APP.reloadData(); APP.go('mgmt');
      APP.toast('بازیکن «' + name + '» ثبت شد ✓', 'green');
    });

    body.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => {
      const pid = +b.dataset.p, act = b.dataset.act;
      const p = S.players.find(x => x[0] === pid);
      if (act === 'deact' || act === 'act'){
        if (p[0] >= 9000){
          const lst = customPlayers();
          const c = lst.find(x => x.id === p[0] - 9000);
          if (c) c.active = act === 'act';
          saveCustomPlayers(lst);
        } else {
          edits[p[0]] = edits[p[0]] || {};
          edits[p[0]].active = act === 'act';
          savePlayerEdits(edits);
        }
        APP.reloadData(); APP.go('mgmt');
        APP.toast(act === 'deact' ? 'بازیکن غیرفعال شد ⛔' : 'بازیکن فعال شد ✓', act === 'deact' ? 'orange' : 'green');
      }
      if (act === 'del'){
        const lst = customPlayers().filter(x => x.id !== p[0] - 9000);
        saveCustomPlayers(lst);
        APP.reloadData(); APP.go('mgmt');
        APP.toast('بازیکن حذف شد 🗑', 'orange');
      }
      if (act === 'edit'){
        editPlayerModal(pid);
      }
    }));
  }

  function editPlayerModal(pid){
    const p = S.players.find(x => x[0] === pid);
    const S = gstate().S, A = gstate().A;
    if (!p) return;
    const edits = playerEdits();
    const ed = edits[pid] || {};
    const isCustom = pid >= 9000;
    const cur = {
      name: isCustom ? customPlayers().find(x=>x.id===pid-9000)?.name : (ed.name || p[1]),
      gender: isCustom ? customPlayers().find(x=>x.id===pid-9000)?.gender : (ed.gender || p[2]),
      hcp: ed.hcp !== undefined ? ed.hcp : p[3],
    };
    // modal overlay
    let m = $('#modal-edit');
    if (!m){
      m = document.createElement('div');
      m.id = 'modal-edit';
      m.style.cssText = 'position:fixed;inset:0;z-index:200;display:none;align-items:center;justify-content:center;background:rgba(4,8,14,.7);backdrop-filter:blur(6px)';
      document.body.appendChild(m);
      m.addEventListener('click', e => { if (e.target === m) m.style.display = 'none'; });
    }
    m.innerHTML = `
    <div class="glass gold-border" style="width:min(520px,92vw);padding:22px">
      <div class="card-head"><span class="ic">✏️</span><h3>ویرایش بازیکن — ${esc(cur.name)}</h3><span class="tag">${isCustom?'جدید':'پایه'}</span></div>
      <div class="edit-grid" style="margin-top:12px">
        <div style="grid-column:span 2"><label>نام و نام خانوادگی</label><input class="input" id="ep-name" style="width:100%" value="${esc(cur.name)}"></div>
        <div><label>جنسیت</label><select class="sel" id="ep-gender" style="width:100%"><option ${cur.gender==='مرد'?'selected':''}>مرد</option><option ${cur.gender==='زن'?'selected':''}>زن</option></select></div>
        <div><label>هندیکپ</label><input class="input" id="ep-hcp" type="number" min="0" max="36" value="${esc(cur.hcp)}" style="width:100%"></div>
      </div>
      <div style="display:flex;gap:10px;margin-top:18px;justify-content:flex-end">
        <button class="btn sm ghost" id="ep-cancel">انصراف</button>
        <button class="btn sm" id="ep-save">💾 ذخیره تغییرات</button>
      </div>
    </div>`;
    m.style.display = 'flex';
    $('#ep-cancel').addEventListener('click', () => m.style.display = 'none');
    $('#ep-save').addEventListener('click', () => {
      const name = $('#ep-name').value.trim();
      if (!name){ APP.toast('نام نمیتواند خالی باشد', 'red'); return; }
      const hcp = Math.max(0, Math.min(36, +$('#ep-hcp').value || 10));
      const gender = $('#ep-gender').value;
      if (isCustom){
        const lst = customPlayers();
        const c = lst.find(x => x.id === pid - 9000);
        if (c){ c.name = name; c.hcp = hcp; c.gender = gender; }
        saveCustomPlayers(lst);
      } else {
        edits[pid] = Object.assign({}, edits[pid], { name, hcp, gender });
        savePlayerEdits(edits);
      }
      APP.reloadData(); APP.go('mgmt');
      APP.toast('مشخصات بازیکن ذخیره شد ✓', 'green');
    });
  }

  /* ── تب زمینها ── */
  function mgmtCourses(body){
    body.innerHTML = `
    const S = gstate().S;
    <div class="glass gold-border" style="margin-bottom:16px">
      <div class="card-head"><span class="ic">➕</span><h3>طراح زمین — ثبت زمین جدید</h3><span class="tag">3 / 9 / 18</span></div>
      <div class="grid cols-4" style="margin-top:10px">
        <div><label style="font-size:11px;color:var(--muted)">نام زمین</label><input class="input" id="mc-name" style="width:100%;margin-top:5px" placeholder="زمین جدید"></div>
        <div><label style="font-size:11px;color:var(--muted)">محل</label><input class="input" id="mc-loc" style="width:100%;margin-top:5px" value="ریاض"></div>
        <div><label style="font-size:11px;color:var(--muted)">تعداد میدان</label>
          <select class="sel" id="mc-holes" style="width:100%;margin-top:5px"><option>3</option><option>9</option><option selected>18</option></select></div>
        <div style="display:flex;align-items:flex-end"><button class="btn sm" id="mc-add">+ ثبت زمین</button></div>
      </div>
      <div id="mc-pars" style="margin-top:14px;display:flex;gap:7px;flex-wrap:wrap"></div>
    </div>
    <div class="glass">
      <div class="card-head"><span class="ic">🗺️</span><h3>زمینهای آکادمی</h3><span class="tag">${D.fa(S.courses.length)} زمین</span></div>
      <div style="overflow-x:auto"><table class="tbl"><thead><tr><th>#</th><th>نام</th><th>محل</th><th>میدان</th><th>پار کل</th><th>عملیات</th></tr></thead><tbody id="mc-rows"></tbody></table></div>
    </div>`;
    const baseCourses = D.COURSES.map((c,i) => ({ id:c[0], name:c[1], loc:c[2], holes:c[3], pars:D.COURSE_PARS[c[0]], base:true }));
    const extra = extraCourses();
    const rows = baseCourses.concat(extra.map((c,i) => ({ id:1000+i, name:c.name, loc:c.loc, holes:c.holes, pars:c.pars, base:false, idx:i })));
    $('#mc-rows').innerHTML = rows.map((r,i) => `<tr>
      <td class="num">${D.fa(r.id)}</td><td><b>${esc(r.name)}</b> ${r.base?'<span class="chip dim">پایه</span>':'<span class="chip purple">سفارشی</span>'}</td>
      <td>${esc(r.loc)}</td><td class="num">${D.fa(r.holes)}</td>
      <td class="num" style="color:var(--gold-l)">${D.fa(r.pars.reduce((a,b)=>a+b,0))}</td>
      <td><div class="row-actions">
        <button class="btn sm ghost" data-act="editc" data-idx="${i}">✏️ ویرایش</button>
        ${r.base ? '' : `<button class="btn sm danger" data-act="delc" data-idx="${r.idx}">🗑 حذف</button>`}
      </div></td></tr>`).join('');
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
    $('#mc-add').addEventListener('click', () => {
      const name = $('#mc-name').value.trim();
      if (!name){ APP.toast('نام زمین را وارد کنید', 'red'); return; }
      const holes = +$('#mc-holes').value;
      const pars = parVals.slice(0, holes);
      extra.push({ name, loc: $('#mc-loc').value.trim() || 'ریاض', holes, pars });
      saveCourses(extra); APP.reloadData(); APP.go('mgmt'); mgmtTab = 'courses'; APP.toast('زمین «' + name + '» ثبت شد ✓', 'green');
    });
    body.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => {
      const act = b.dataset.act, idx = +b.dataset.idx;
      if (act === 'delc'){
        const lst = extraCourses(); lst.splice(idx,1); saveCourses(lst); APP.reloadData(); APP.go('mgmt'); mgmtTab='courses'; APP.toast('زمین حذف شد 🗑','orange');
      }
      if (act === 'editc') editCourseModal(rows[idx]);
    }));
  }

  function editCourseModal(r){
    let m = $('#modal-edit');
    if (!m){
      m = document.createElement('div');
      m.id = 'modal-edit';
      m.style.cssText = 'position:fixed;inset:0;z-index:200;display:none;align-items:center;justify-content:center;background:rgba(4,8,14,.7);backdrop-filter:blur(6px)';
      document.body.appendChild(m);
      m.addEventListener('click', e => { if (e.target === m) m.style.display = 'none'; });
    }
    m.innerHTML = `
    <div class="glass gold-border" style="width:min(600px,94vw);padding:22px;max-height:90vh;overflow:auto">
      <div class="card-head"><span class="ic">✏️</span><h3>ویرایش زمین — ${esc(r.name)}</h3><span class="tag">${r.base?'پایه':'سفارشی'}</span></div>
      <div class="edit-grid" style="margin-top:12px">
        <div><label>نام</label><input class="input" id="ec-name" style="width:100%" value="${esc(r.name)}"></div>
        <div><label>محل</label><input class="input" id="ec-loc" style="width:100%" value="${esc(r.loc)}"></div>
      </div>
      <div style="margin-top:12px;display:flex;gap:7px;flex-wrap:wrap" id="ec-pars">
        ${r.pars.map((p,i) => `
          <div style="text-align:center">
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
    $('#ec-cancel').addEventListener('click', () => m.style.display = 'none');
    $('#ec-save').addEventListener('click', () => {
      const name = $('#ec-name').value.trim();
      if (!name){ APP.toast('نام زمین را وارد کنید','red'); return; }
      const pars = $$('#ec-pars input').map(inp => Math.max(3, Math.min(6, +inp.value || 4)));
      if (r.base){
        // برای زمین پایه: نسخهٔ سفارشی جایگزین در PAR_MAP ذخیره میشود
        let overrides = {};
        try { overrides = JSON.parse(localStorage.getItem('ga_course_override') || '{}'); } catch(e){}
        overrides[r.id] = { name, loc, pars };
        localStorage.setItem('ga_course_override', JSON.stringify(overrides));
        // به PAR_MAP اضافه کن
        if (window.Data) D.PAR_MAP && (D.PAR_MAP[r.id] = pars);
      } else {
        const lst = extraCourses();
        const c = lst[r.idx];
        if (c){ c.name = name; c.loc = $('#ec-loc').value.trim(); c.pars = pars; }
        saveCourses(lst);
      }
      APP.reloadData(); APP.go('mgmt'); mgmtTab='courses';
      APP.toast('زمین ذخیره شد ✓', 'green');
    });
  }

  /* ── تب مسابقات ── */
  function mgmtTournaments(body){
    body.innerHTML = `
    const S = gstate().S;
    <div class="glass gold-border" style="margin-bottom:16px">
      <div class="card-head"><span class="ic">➕</span><h3>طراح مسابقه — ثبت مسابقه جدید</h3><span class="tag">زمین + حفره + سطح</span></div>
      <div class="grid cols-6" style="margin-top:10px">
        <div style="grid-column:span 2"><label style="font-size:11px;color:var(--muted)">نام مسابقه</label><input class="input" id="mt-name" style="width:100%;margin-top:5px" placeholder="جام جدید"></div>
        <div><label style="font-size:11px;color:var(--muted)">سطح</label><select class="sel" id="mt-lvl" style="width:100%;margin-top:5px"><option value="1">سطح ۱</option><option value="2" selected>سطح ۲</option><option value="3">سطح ۳</option></select></div>
        <div><label style="font-size:11px;color:var(--muted)">زمین</label><select class="sel" id="mt-crs" style="width:100%;margin-top:5px">${S.courses.map(c=>`<option value="${c[0]}">${esc(c[1])}</option>`).join('')}</select></div>
        <div><label style="font-size:11px;color:var(--muted)">حفره</label><select class="sel" id="mt-holes" style="width:100%;margin-top:5px"><option>9</option><option selected>18</option></select></div>
        <div><label style="font-size:11px;color:var(--muted)">تاریخ</label><input class="input" id="mt-date" type="date" value="2026-09-25" style="width:100%;margin-top:5px;direction:ltr"></div>
      </div>
      <button class="btn sm" id="mt-add" style="margin-top:14px">+ ثبت مسابقه</button>
    </div>
    <div class="glass">
      <div class="card-head"><span class="ic">📅</span><h3>مسابقات فصل</h3><span class="tag">${D.fa(S.tournaments.length)} رویداد</span></div>
      <div style="overflow-x:auto"><table class="tbl"><thead><tr><th>#</th><th>نام</th><th>سطح</th><th>زمین</th><th>تاریخ</th><th>وضعیت</th><th>عملیات</th></tr></thead><tbody id="mt-rows"></tbody></table></div>
    </div>`;
    const base = D.TOURNAMENTS.map((t,i) => ({ t, base:true }));
    const extra = extraTours().map((t,i) => ({ t: [1000+i, t.name, +t.lvl, +t.course, +t.holes, t.date], base:false, idx:i }));
    const rows = base.concat(extra);
    $('#mt-rows').innerHTML = rows.map(({t, base, idx}) => {
      const past = D.dateFrom(t[5]) < D.TODAY;
      const j = D.jalaliInfo(D.dateFrom(t[5]));
      return `<tr>
        <td class="num">${D.fa(t[0])}</td><td><b>${esc(t[1])}</b> ${base?'<span class="chip dim">پایه</span>':'<span class="chip purple">سفارشی</span>'}</td>
        <td><span class="chip ${t[2]===1?'gold':t[2]===2?'green':'blue'}">سطح ${D.fa(t[2])}</span></td>
        <td style="color:var(--muted)">${esc(D.COURSE_NAME[t[3]]||'—')}</td>
        <td class="ltr" style="color:var(--muted);font-size:11.5px">${D.fa(j.dd)} ${j.monthFa}</td>
        <td><span class="chip ${past?'dim':'green'}">${past?'برگزار شده':'آینده'}</span></td>
        <td><div class="row-actions">
          <button class="btn sm ghost" data-act="editt" data-idx="${idx}">✏️</button>
          ${base ? '' : `<button class="btn sm danger" data-act="delt" data-idx="${idx}">🗑</button>`}
        </div></td></tr>`;
    }).join('');
    $('#mt-add').addEventListener('click', () => {
      const name = $('#mt-name').value.trim();
      const date = $('#mt-date').value;
      if (!name || !date){ APP.toast('نام و تاریخ را وارد کنید', 'red'); return; }
      extra.push({ name, lvl: +$('#mt-lvl').value, course: +$('#mt-crs').value, holes: +$('#mt-holes').value, date });
      saveTours(extra); APP.reloadData(); APP.go('mgmt'); mgmtTab='tournaments';
      APP.toast('مسابقه «' + name + '» ثبت شد ✓', 'green');
    });
    body.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => {
      const act = b.dataset.act, idx = +b.dataset.idx;
      if (act === 'delt'){
        const lst = extraTours(); lst.splice(idx,1); saveTours(lst); APP.reloadData(); APP.go('mgmt'); mgmtTab='tournaments'; APP.toast('مسابقه حذف شد 🗑','orange');
      }
      if (act === 'editt'){
        const { t, base, idx } = rows.find((r,i) => i === idx);
        editTourModal(t, base, idx);
      }
    }));
  }

  function editTourModal(t, base, idx){
    const S = gstate().S;
    let m = $('#modal-edit');
    if (!m){
      m = document.createElement('div');
      m.id = 'modal-edit';
      m.style.cssText = 'position:fixed;inset:0;z-index:200;display:none;align-items:center;justify-content:center;background:rgba(4,8,14,.7);backdrop-filter:blur(6px)';
      document.body.appendChild(m);
      m.addEventListener('click', e => { if (e.target === m) m.style.display = 'none'; });
    }
    m.innerHTML = `
    <div class="glass gold-border" style="width:min(560px,94vw);padding:22px">
      <div class="card-head"><span class="ic">✏️</span><h3>ویرایش مسابقه — ${esc(t[1])}</h3><span class="tag">${base?'پایه':'سفارشی'}</span></div>
      <div class="edit-grid" style="margin-top:12px">
        <div><label>نام</label><input class="input" id="et-name" style="width:100%" value="${esc(t[1])}"></div>
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
      APP.toast('مسابقه ذخیره شد ✓', 'green');
    });
  }

  /* ── تب نتایج ── */
  function mgmtResults(body){
    const pastTours = S.tournaments.filter(t => D.dateFrom(t[5]) < D.TODAY);
    const S = gstate().S;
    body.innerHTML = `
    <div class="glass gold-border" style="margin-bottom:16px">
      <div class="card-head"><span class="ic">⛳</span><h3>ثبت نتیجه — ضربات هر میدان</h3><span class="tag">امتیاز و رتبه خودکار</span></div>
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
      <div class="card-head"><span class="ic">📋</span><h3>کارتهای ثبتشده</h3><span class="tag">${D.fa(extraCards().length)} کارت</span></div>
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
      if (ok < t[4]){ APP.toast('همهٔ میدانها را پر کنید', 'red'); return; }
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
    const S = gstate().S;
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
      <div class="card-head"><span class="ic">🇮🇷</span><h3>تعطیلات رسمی و مناسبتهای ایران ۱۴۰۵ (منبع: time.ir)</h3><span class="tag">${D.fa(D.IR_HOLIDAYS.filter(h=>h[3]==='holiday').length)} تعطیل</span></div>
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

  /* ═══════════════ ابزارهای مشترک (پلن مدیریت) ═══════════════ */
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
    getSettings, saveSettings, DEFAULTS,
    reloadUI(){ if (window.APP) window.APP.recompute(); },
  };
})();
