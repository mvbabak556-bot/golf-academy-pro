/* ═══════════════ GolfAcademy PRO — Data engine (seeded, live) ═══════════════ */
(function(){
  /* ── PRNG seeded (همان seed نسخه اکسل) ── */
  function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  function makeRNG(seed){
    const rnd = mulberry32(seed);
    const randInt = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));
    function gauss(){
      let u = 0, v = 0;
      while (u === 0) u = rnd();
      while (v === 0) v = rnd();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }
    function pickN(arr, n){
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--){
        const j = Math.floor(rnd() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a.slice(0, n);
    }
    return { rnd, randInt, gauss, pickN };
  }

  /* ── تبدیل تاریخ شمسی (jalaali-js — الگوریتم استاندارد) ── */
  function div(a,b){return ~~(a/b)}
  function jalCal(jy){
    const breaks = [-61,9,38,199,426,686,756,818,1111,1181,1210,1635,2060,2097,2192,2262,2324,2394,2456,3178];
    const bl = breaks.length;
    const gy = jy + 621;
    let leapJ = -14, jp = breaks[0], jm, jump = 0, leap, leapG, march, n, i;
    for (i = 1; i < bl; i += 1){
      jm = breaks[i];
      jump = jm - jp;
      if (jy < jm) break;
      leapJ = leapJ + div(jump, 33) * 8 + div(jump % 33, 4);
      jp = jm;
    }
    n = jy - jp;
    leapJ = leapJ + div(n, 33) * 8 + div((n % 33) + 3, 4);
    if (jump % 33 === 4 && jump % 4 === 0) leapJ += 1;
    leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
    march = 20 + leapJ - leapG;
    if (jump - n < 6) n = n - jump + div(jump + 4, 33) * 33;
    leap = ((((n + 1) % 33) - 1) % 4) === -1;
    if (leap) leap = ((n + 1) % 33) === 4;
    return { leap, gy, march };
  }
  function g2d(gy, gm, gd){
    let d = div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * ((gm + 9) % 12) + 2, 5) + gd - 34840408;
    d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
    return d;
  }
  function d2g(jdn){
    let j = 4 * jdn + 139361631;
    j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
    const i = div((j % 1461), 4) * 5 + 308;
    const gd = div(i % 153, 5) + 1;
    const gm = div(i, 153) % 12 + 1;
    const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
    return [gy, gm, gd];
  }
  function d2j(jdn){
    const gy = d2g(jdn)[0];
    let jy = gy - 621;
    const r = jalCal(jy);
    const jdn1f = g2d(gy, 3, r.march);
    let k = jdn - jdn1f;
    let jm, jd;
    if (k >= 0){
      if (k <= 185){ jm = div(k, 31) + 1; jd = k % 31 + 1; }
      else { k -= 186; jm = 7 + div(k, 30); jd = k % 30 + 1; }
    } else {
      jy -= 1; k += 179;
      if (r.leap) k += 1;
      jm = 7 + div(k, 30); jd = k % 30 + 1;
    }
    return [jy, jm, jd];
  }
  function toJalaali(gy, gm, gd){
    return d2j(g2d(gy, gm, gd));
  }
  const dateFrom = s => new Date(s + 'T00:00:00Z');
  const TODAY = dateFrom('2026-08-31');
  const SEASON_START = dateFrom('2026-03-21');

  const FA_DIG = {0:'۰',1:'۱',2:'۲',3:'۳',4:'۴',5:'۵',6:'۶',7:'۷',8:'۸',9:'۹'};
  const fa = v => String(v).replace(/[0-9]/g, d => FA_DIG[d]);
  const faNum = (v, d=0) => fa(Number(v).toLocaleString('en-US', {maximumFractionDigits:d, minimumFractionDigits:d}));

  const WEEKDAYS = ['یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه','شنبه'];
  const MONTHS_FA = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
  function jalaliInfo(d){
    const [yy, mm, dd] = toJalaali(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
    const wd = d.getUTCDay();
    return { yy, mm, dd, wd: WEEKDAYS[wd], monthFa: MONTHS_FA[mm-1], season:
      mm <= 3 ? 'بهار' : mm <= 6 ? 'تابستان' : mm <= 9 ? 'پاییز' : 'زمستان' };
  }
  const weekOf = d => Math.floor((d - SEASON_START) / 86400000 / 7) + 1;
  const dayFmt = d => d.toISOString().slice(0,10);

  /* ── داده پایه ── */
  const PLAYERS = [
    [1,'آرش محمدی','مرد',4,'2024-02-10',1],[2,'سارا احمدی','زن',6,'2023-09-01',1],
    [3,'مهدی کریمی','مرد',8,'2024-05-15',1],[4,'نگار رضایی','زن',7,'2024-01-20',1],
    [5,'امیر حسینی','مرد',5,'2022-11-03',1],[6,'رضا نادری','مرد',12,'2024-03-12',1],
    [7,'الهام موسوی','زن',9,'2024-07-08',1],[8,'علی شریفی','مرد',3,'2023-04-25',1],
    [9,'حسین قاسمی','مرد',11,'2025-01-30',1],[10,'مریم کاظمی','زن',10,'2024-08-19',1],
    [11,'بهرام صادقی','مرد',14,'2025-03-05',1],[12,'کاوه توکلی','مرد',6,'2023-12-02',1],
    [13,'نیلوفر جعفری','زن',8,'2025-05-22',1],[14,'فرهاد عباسی','مرد',13,'2024-10-14',1],
    [15,'سینا رحیمی','مرد',5,'2024-04-07',1],[16,'پویا نعمتی','مرد',16,'2025-02-18',1],
    [17,'شایان اکبری','مرد',7,'2025-06-09',1],[18,'درسا سلطانی','زن',12,'2025-04-26',1],
    [19,'پارسا عظیمی','مرد',9,'2024-12-30',1],[20,'تارا یزدانی','زن',11,'2025-08-11',1],
    [21,'کیان فرهمند','مرد',15,'2025-09-20',1],[22,'سامان رستمی','مرد',10,'2025-10-02',1],
    [23,'مونا قربانی','زن',14,'2026-01-15',1],[24,'بنیامین شمس','مرد',18,'2026-02-08',0],
  ];
  const PLAYER_NAME = {}; PLAYERS.forEach(p => PLAYER_NAME[p[0]] = p[1]);
  const ACTIVE = PLAYERS.filter(p => p[5]);

  const COURSES = [
    [1,'زمین اصلی آکادمی','ریاض',18],
    [2,'زمین ۹ سوراخ','ریاض',9],
    [3,'زمین آموزشی (۳ میدان)','ریاض',3],
    [4,'زمین چشمانداز','جده',18],
    [5,'زمین شب','ریاض',9],
  ];
  const COURSE_PARS = {
    1:[4,4,3,5,4,3,4,5,4,4,3,4,5,4,3,5,4,4],
    2:[4,3,5,4,4,3,5,4,3],
    3:[3,4,3],
    4:[5,4,4,3,4,5,3,4,4,4,3,5,4,4,3,5,4,4],
    5:[3,4,5,3,4,4,5,3,4],
  };
  const COURSE_NAME = {}; COURSES.forEach(c => COURSE_NAME[c[0]] = c[1]);
  /* رجیستری پار (شامل زمینهای سفارشی طراح) */
  const PAR_MAP = {};
  Object.keys(COURSE_PARS).forEach(k => PAR_MAP[k] = COURSE_PARS[k]);
  const parsOf = id => PAR_MAP[id] || COURSE_PARS[id] || [4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4];

  const TOURNAMENTS = [
    [1,'جام بهارانه',1,1,18,'2026-04-10'],[2,'آزاد فروردین',3,2,9,'2026-04-24'],
    [3,'جام اردیبهشت',2,1,18,'2026-05-08'],[4,'کاپ هفته',3,5,9,'2026-05-22'],
    [5,'جام خرداد',1,4,18,'2026-06-05'],[6,'آزاد خرداد',3,2,9,'2026-06-19'],
    [7,'جام تابستانه',2,1,18,'2026-07-03'],[8,'کاپ هفته',3,5,9,'2026-07-17'],
    [9,'جام تیر',1,1,18,'2026-07-31'],[10,'آزاد مرداد',3,2,9,'2026-08-14'],
    [11,'جام بزرگ مرداد',2,4,18,'2026-08-21'],
    [12,'جام پاییزه',1,1,18,'2026-09-25'],[13,'آزاد مهر',3,5,9,'2026-10-09'],
    [14,'جام بزرگ فصل',1,1,18,'2026-11-06'],
  ];
  const PTS_RULE = {1:[20,15,10,5], 2:[15,10,7,3], 3:[10,7,5,2]};
  const RESULT_LABEL = ['اول','دوم','سوم','شرکت‌کننده'];

  /* ── تولید کارت امتیاز (قطعی: هر بار با RNG تازه) ── */
  function genScorecards(){
    const { gauss } = makeRNG(1405);
    const cards = [];
    TOURNAMENTS.forEach(t => {
      const [code, name, lvl, cid, holes, dstr] = t;
      const d = dateFrom(dstr);
      if (d >= TODAY) return;
      const pars = parsOf(cid);
      const field = ACTIVE.filter(p => dateFrom(p[4]) <= d).slice(0, 20);
      const rows = field.map(p => {
        const off = (p[3] - 9) * 0.22;
        const strokes = {};
        for (let h = 1; h <= holes; h++){
          strokes[h] = Math.max(2, Math.round(pars[h-1] + gauss() * 1.15 + off));
        }
        const total = Object.values(strokes).reduce((a,b)=>a+b,0);
        return { pid: p[0], total, strokes };
      });
      rows.sort((a,b) => a.total - b.total);
      rows.forEach(r => cards.push({ tour: code, pid: r.pid, strokes: r.strokes, total: r.total }));
    });
    return cards;
  }

  /* ── فعالیتها: تمرین و آموزش (قطعی) ── */
  function genActivities(){
    const { randInt, pickN } = makeRNG(77);
    const acts = [];
    const span = Math.floor((TODAY - SEASON_START) / 86400000);
    for (let i = 0; i < 26; i++){
      const d = new Date(SEASON_START.getTime() + randInt(0, span) * 86400000);
      pickN(ACTIVE, randInt(7, 12)).forEach(p => acts.push({ date: d, pid: p[0], type: 'تمرین', points: 1 }));
    }
    for (let i = 0; i < 12; i++){
      const d = new Date(SEASON_START.getTime() + randInt(0, span) * 86400000);
      pickN(ACTIVE, randInt(6, 10)).forEach(p => acts.push({ date: d, pid: p[0], type: 'آموزش', points: 5 }));
    }
    return acts;
  }

  /* ── ذخیره تنظیمات مدیر (بازیکن فعال/غیرفعال + نمایش نمودارها) ── */
  function loadPlayers(){
    // بازیکنان پایه + تغییرات مدیر (فعال/غیرفعال، ویرایش مشخصات)
    let edits = {};
    try { edits = JSON.parse(localStorage.getItem('ga_players') || '{}'); } catch(e){}
    return PLAYERS.map(p => {
      const e = edits[p[0]];
      if (!e) return p;
      const np = p.slice();
      if (e.active !== undefined) np[5] = e.active ? 1 : 0;
      if (e.name) np[1] = e.name;
      if (e.hcp !== undefined) np[3] = +e.hcp;
      if (e.gender) np[2] = e.gender;
      return np;
    });
  }
  function loadCustomPlayers(){
    try { return JSON.parse(localStorage.getItem('ga_custom_players') || '[]'); } catch(e){ return []; }
  }

  /* ── رتبه و رنگ ── */
  const GOLD_ELITE = 120;
  const RANK_DEF = [
    ['White','سفید',0,'#8A93A6'], ['Green','سبز',50,'#1EBB8A'], ['Blue','آبی',75,'#2E86DE'],
    ['Red','قرمز',100,'#E74C3C'], ['Gold Elite','طلایی',GOLD_ELITE,'#D4AF37'],
  ];
  const RANK_TEXT = {}; RANK_DEF.forEach(r => RANK_TEXT[r[0]] = r[1]);
  function rankOf(pts){
    let r = RANK_DEF[0];
    RANK_DEF.forEach(rk => { if (pts >= rk[2]) r = rk; });
    return r;
  }
  const FORM_META = { 'اول': {c:'w', t:'ق'}, 'دوم': {c:'p2', t:'۲'}, 'سوم': {c:'p3', t:'۳'}, 'شرکت‌کننده': {c:'p4', t:'ش'} };

  /* ── محاسبه کامل ── */
  function compute(state){
    const { scorecards, activities, tournaments, players } = state;
    const PTS = {}; players.forEach(p => PTS[p[0]] = 0);
    const MONTH_PTS = {}; const CARDS = {};
    let TOTAL_BIRDIES = 0;
    const info = {};
    tournaments.forEach(t => info[t[0]] = t);

    scorecards.forEach(c => {
      const t = info[c.tour];
      if (!t) return;
      const ptsRule = PTS_RULE[t[2]];
      const group = scorecards.filter(x => x.tour === c.tour).sort((a,b) => a.total - b.total);
      const rank = group.indexOf(c) + 1;
      const place = Math.min(rank, 4);
      const pts = ptsRule[place - 1];
      PTS[c.pid] += pts;
      const j = jalaliInfo(dateFrom(t[5]));
      MONTH_PTS[j.monthFa] = MONTH_PTS[j.monthFa] || {};
      MONTH_PTS[j.monthFa][c.pid] = (MONTH_PTS[j.monthFa][c.pid] || 0) + pts;
      const pars = parsOf(t[3]);
      const holes = t[4];
      let birdies = 0, parsN = 0, bogeys = 0, dbog = 0;
      for (let h = 1; h <= holes; h++){
        const s = c.strokes[h], p = pars[h-1];
        if (s === p - 1) birdies++;
        else if (s === p) parsN++;
        else if (s === p + 1) bogeys++;
        else if (s > p + 1) dbog++;
      }
      TOTAL_BIRDIES += birdies;
      const parTotal = pars.slice(0, holes).reduce((a,b)=>a+b,0);
      const vspar = c.total - parTotal;
      CARDS[c.pid] = CARDS[c.pid] || [];
      CARDS[c.pid].push({
        tour: c.tour, name: t[1], date: t[5], lvl: t[2], course: t[3],
        total: c.total, par: parTotal, vspar, rank, result: RESULT_LABEL[place-1],
        birdies, pars: parsN, bogeys, dbog, strokes: c.strokes,
      });
    });
    const ST = {};
    players.forEach(p => ST[p[0]] = { win:0, second:0, third:0, matches:0, practices:0, courses:0, points:0, attend:0 });
    activities.forEach(a => {
      const s = ST[a.pid];
      if (!s) return;
      s.attend++;
      if (a.type === 'تمرین') s.practices++;
      else if (a.type === 'آموزش') s.courses++;
    });
    Object.entries(CARDS).forEach(([pid, arr]) => {
      const s = ST[pid];
      arr.forEach(c => {
        s.matches++;
        if (c.result === 'اول') s.win++;
        else if (c.result === 'دوم') s.second++;
        else if (c.result === 'سوم') s.third++;
        s.points += PTS[pid];
      });
    });
    const LB = Object.keys(PTS).map(pid => {
      const cards = CARDS[pid] || [];
      const total = cards.reduce((a,c)=>a+c.total,0);
      const avg = cards.length ? Math.round(total / cards.length * 10) / 10 : 0;
      const bird = cards.reduce((a,c)=>a+c.birdies,0);
      const best = cards.length ? cards.reduce((a,c)=>c.vspar < a.vspar ? c : a, cards[0]) : null;
      const form = cards.slice(-5).map(c => c.result);
      let streak = 0;
      for (let i = cards.length-1; i >= 0; i--){
        if (cards[i].rank <= 3) streak++; else break;
      }
      const holesPlayed = cards.reduce((a,c)=>a+Object.keys(c.strokes).length,0);
      const scoringAvg = cards.length ? Math.round(total / holesPlayed * 18 * 10) / 10 : 0;
      const p = players.find(x => x[0] === +pid) || players[0];
      return {
        pid: +pid, name: PLAYER_NAME[pid], hcp: p[3], gender: p[2],
        pts: PTS[pid], color: rankOf(PTS[pid])[0], colorHex: rankOf(PTS[pid])[3],
        rank: 0, change: 0, win: ST[pid].win, matches: ST[pid].matches,
        prac: ST[pid].practices, course: ST[pid].courses, attend: ST[pid].attend,
        avg, bird, form, streak, top3: ST[pid].win + ST[pid].second + ST[pid].third,
        rounds: cards.length, best_vspar: best ? best.vspar : null,
        best_tour: best ? best.name : null, best_total: best ? best.total : null,
        scoring_avg: scoringAvg,
      };
    });
    LB.sort((a,b) => b.pts - a.pts || a.hcp - b.hcp);
    LB.forEach((r,i) => {
      r.rank = i + 1;
      r.change = ((r.pid % 3) - 1) * ((r.pid * 7 + 3) % 5 > 1 ? 1 : 0);
    });
    const norm = (vals, rev) => {
      const lo = Math.min(...vals), hi = Math.max(...vals);
      const span = (hi - lo) || 1;
      return vals.map(v => Math.round(rev ? (100 - (v - lo)/span*100) : (v - lo)/span*100));
    };
    const scA = LB.map(r => r.scoring_avg);
    const bdA = LB.map(r => r.bird / Math.max(1, r.rounds));
    const csA = LB.map(r => {
      const arr = (CARDS[r.pid]||[]).map(c => c.total);
      if (!arr.length) return 0;
      const m = arr.reduce((a,b)=>a+b,0)/arr.length;
      return Math.sqrt(arr.reduce((a,b)=>a+(b-m)*(b-m),0)/arr.length);
    });
    const prA = LB.map(r => r.prac);
    const exA = LB.map(r => r.rounds + r.course);
    const SKILLS = {};
    LB.forEach((r, i) => {
      SKILLS[r.pid] = {
        scoring: norm(scA, true)[i],
        birdie: norm(bdA, false)[i],
        consistency: norm(csA, true)[i],
        practice: norm(prA, false)[i],
        experience: norm(exA, false)[i],
      };
    });
    const PHASES = { 'بهار': ['فروردین','اردیبهشت','خرداد'], 'تابستان': ['تیر','مرداد','شهریور'] };
    const PHASE_PTS = {}; const PHASE_CHAMP = {};
    Object.keys(PHASES).forEach(ph => {
      const acc = {};
      PHASES[ph].forEach(m => {
        Object.entries(MONTH_PTS[m] || {}).forEach(([pid, v]) => acc[pid] = (acc[pid]||0) + v);
      });
      PHASE_PTS[ph] = acc;
      const best = Object.entries(acc).sort((a,b) => b[1] - a[1])[0];
      PHASE_CHAMP[ph] = best ? { pid: +best[0], name: PLAYER_NAME[best[0]], pts: best[1] } : { pid: null, name: '—', pts: 0 };
    });
    const MONTHS_SEASON = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور'];
    const MONTHLY_TOT = MONTHS_SEASON.map(m => Object.values(MONTH_PTS[m]||{}).reduce((a,b)=>a+b,0));
    let champM = null, champMpts = -1, champName = '—';
    MONTHS_SEASON.forEach(m => {
      const ent = Object.entries(MONTH_PTS[m]||{});
      if (ent.length){
        ent.sort((a,b)=>b[1]-a[1]);
        if (ent[0][1] > champMpts){ champMpts = ent[0][1]; champM = m; champName = PLAYER_NAME[+ent[0][0]]; }
      }
    });
    const BEST_ROUNDS = [];
    LB.forEach(r => (CARDS[r.pid]||[]).forEach(c => BEST_ROUNDS.push({ name: r.name, tour: c.name, total: c.total, vspar: c.vspar, bird: c.birdies, hcp: r.hcp })));
    BEST_ROUNDS.sort((a,b) => a.vspar - b.vspar);
    const HOLE_DIFF = {};
    scorecards.forEach(c => {
      const t = info[c.tour];
      if (!t) return;
      HOLE_DIFF[c.tour] = HOLE_DIFF[c.tour] || {};
      const pars = parsOf(t[3]);
      for (let h = 1; h <= t[4]; h++){
        HOLE_DIFF[c.tour][h] = HOLE_DIFF[c.tour][h] || [];
        HOLE_DIFF[c.tour][h].push(c.strokes[h] - pars[h-1]);
      }
    });
    Object.keys(HOLE_DIFF).forEach(t => {
      Object.keys(HOLE_DIFF[t]).forEach(h => {
        const arr = HOLE_DIFF[t][h];
        HOLE_DIFF[t][h] = Math.round(arr.reduce((a,b)=>a+b,0)/arr.length * 100) / 100;
      });
    });
    const COURSE_STATS = {};
    COURSES.forEach(c => {
      const acc = {};
      scorecards.forEach(sc => {
        const t = info[sc.tour];
        if (!t || t[3] !== c[0]) return;
        const pars = parsOf(c[0]);
        for (let h = 1; h <= t[4]; h++){
          acc[h] = acc[h] || [];
          acc[h].push(sc.strokes[h] - pars[h-1]);
        }
      });
      COURSE_STATS[c[0]] = {};
      Object.keys(acc).forEach(h => {
        const arr = acc[h];
        COURSE_STATS[c[0]][h] = Math.round(arr.reduce((a,b)=>a+b,0)/arr.length * 100) / 100;
      });
    });
    const PLAYER_COURSE = {};
    LB.forEach(r => {
      const pc = {};
      (CARDS[r.pid]||[]).forEach(c => {
        pc[c.course] = pc[c.course] || [];
        pc[c.course].push(c.vspar);
      });
      PLAYER_COURSE[r.pid] = {};
      Object.keys(pc).forEach(c => PLAYER_COURSE[r.pid][c] = Math.round(pc[c].reduce((a,b)=>a+b,0)/pc[c].length*100)/100);
    });
    const PAR_TYPE = {};
    LB.forEach(r => {
      const acc = {3:[],4:[],5:[]};
      (CARDS[r.pid]||[]).forEach(c => {
        const pars = parsOf(c.course);
        Object.entries(c.strokes).forEach(([h,s]) => acc[pars[h-1]].push(+s));
      });
      PAR_TYPE[r.pid] = {
        p3: acc[3].length ? Math.round(acc[3].reduce((a,b)=>a+b,0)/acc[3].length*100)/100 : null,
        p4: acc[4].length ? Math.round(acc[4].reduce((a,b)=>a+b,0)/acc[4].length*100)/100 : null,
        p5: acc[5].length ? Math.round(acc[5].reduce((a,b)=>a+b,0)/acc[5].length*100)/100 : null,
      };
    });
    const TOT_PTS = Object.values(PTS).reduce((a,b)=>a+b,0);
    const MATCHES_HELD = scorecards.length ? [...new Set(scorecards.map(c=>c.tour))].length : 0;
    const GOLD_COUNT = Object.values(PTS).filter(v => v >= GOLD_ELITE).length;
    const activePlayers = players.filter(p => p[5]);
    const AVG_HCP = activePlayers.length ? Math.round(activePlayers.reduce((a,p)=>a+p[3],0)/activePlayers.length*10)/10 : 0;
    const future = tournaments.filter(t => dateFrom(t[5]) >= TODAY).sort((a,b) => dateFrom(a[5]) - dateFrom(b[5]));
    const NEXT_T = future[0] || null;
    const COUNTDOWN = NEXT_T ? Math.ceil((dateFrom(NEXT_T[5]) - TODAY)/86400000) : 0;
    const RANK_COUNT = {};
    RANK_DEF.forEach(rk => RANK_COUNT[rk[0]] = Object.values(PTS).filter(v => rankOf(v)[0] === rk[0]).length);
    const PRACTICE_DAYS = new Set(activities.filter(a=>a.type==='تمرین').map(a=>dayFmt(a.date))).size;
    const COURSE_DAYS = new Set(activities.filter(a=>a.type==='آموزش').map(a=>dayFmt(a.date))).size;

    return {
      PTS, CARDS, ST, LB, SKILLS, PHASE_PTS, PHASE_CHAMP, MONTH_PTS, MONTHLY_TOT,
      MONTHS_SEASON, champM, champName, BEST_ROUNDS, HOLE_DIFF, COURSE_STATS,
      PLAYER_COURSE, PAR_TYPE, TOT_PTS, MATCHES_HELD, GOLD_COUNT, AVG_HCP, NEXT_T,
      COUNTDOWN, RANK_COUNT, TOTAL_BIRD: TOTAL_BIRDIES, PRACTICE_DAYS, COURSE_DAYS,
    };
  }

  /* ── State با ذخیره localStorage (ابزار طراح) ── */
  function loadState(){
    let extra = { courses: [], tournaments: [], scorecards: [] };
    try {
      extra.courses = JSON.parse(localStorage.getItem('ga_courses') || '[]');
      extra.tournaments = JSON.parse(localStorage.getItem('ga_tournaments') || '[]');
      extra.scorecards = JSON.parse(localStorage.getItem('ga_scorecards') || '[]');
    } catch(e) {}
    extra.courses.forEach((c, i) => {
      const cid = 1000 + i;
      PAR_MAP[cid] = c.pars;
    });
    const players = loadPlayers().concat(loadCustomPlayers().map((p, i) => [9000+i, p.name, p.gender, +p.hcp, p.join || '2026-01-01', p.active ? 1 : 0]));
    const PLAYER_NAME_EXT = {}; players.forEach(p => PLAYER_NAME_EXT[p[0]] = p[1]);
    const ACTIVE_EXT = players.filter(p => p[5]);
    return {
      players, active: ACTIVE_EXT,
      courses: COURSES.concat(extra.courses.map((c, i) => [1000+i, c.name, c.loc, c.holes])),
      tournaments: TOURNAMENTS.concat(extra.tournaments.map((t, i) => [1000+i, t.name, +t.lvl, +t.course, +t.holes, t.date])),
      scorecards: genScorecards().concat(extra.scorecards.map(s => ({
        tour: +s.tour, pid: +s.pid,
        strokes: Object.fromEntries(Object.entries(s.strokes).map(([h,v]) => [+h, +v])),
        total: Object.values(s.strokes).reduce((a,b)=>a+(+b),0),
      }))),
      activities: genActivities(),
    };
  }

  const IR_HOLIDAYS = (typeof IR_HOLIDAYS_1405 !== 'undefined' && IR_HOLIDAYS_1405) ? IR_HOLIDAYS_1405 : ((typeof window.IR_HOLIDAYS_1405 !== 'undefined') ? window.IR_HOLIDAYS_1405 : []);
  function holidaysOf(jy, jm, jd){
    if (jy !== 1405) return [];
    return IR_HOLIDAYS.filter(h => h[0] === jm && h[1] === jd);
  }
  function isHoliday(d){
    const j = jalaliInfo(d);
    return holidaysOf(j.yy, j.mm, j.dd).some(h => h[3] === 'holiday');
  }

  window.Data = {
    fa, faNum, jalaliInfo, weekOf, dayFmt, dateFrom, TODAY, SEASON_START,
    PLAYERS, PLAYER_NAME, ACTIVE, COURSES, COURSE_PARS, COURSE_NAME, TOURNAMENTS,
    PTS_RULE, RESULT_LABEL, MONTHS_FA, RANK_DEF, RANK_TEXT, rankOf, FORM_META, GOLD_ELITE,
    parsOf, compute, loadState, loadPlayers, loadCustomPlayers,
    IR_HOLIDAYS, holidaysOf, isHoliday,
  };
})();
