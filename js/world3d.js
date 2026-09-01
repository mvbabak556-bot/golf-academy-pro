/* ═══════════════ GolfAcademy PRO — World3D 2040 (custom software 3D engine) ═══════════════
   آکادمی را از بیرون می‌بینید؛ هر بخش، صحنه سه‌بعدی مخصوص خودش را دارد:
   آواتارهای سه‌بعدی بازیکنان، سکوی قهرمانی، تابلوهای مسابقات، رادار مهارت،
   نوارهای رده‌بندی، برج تلویزیون، لیزر، پهپاد، رینگ مداری و افکت‌های هولوگرام.
   بدون هیچ وابستگی خارجی — رندر نرم‌افزاری پرسپکتیو با سایه‌زنی، مه و ذرات.
*/
(function(){
  const TAU = Math.PI * 2;
  const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
  const lerp = (a,b,t) => a + (b-a)*t;
  const easeInOut = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
  const hexRGB = h => { const n = parseInt(h.replace('#',''),16); return [(n>>16)&255,(n>>8)&255,n&255]; };
  const mix = (h1,h2,t) => { const a=hexRGB(h1),b=hexRGB(h2); return `rgb(${a.map((v,i)=>Math.round(lerp(v,b[i],t))).join(',')})`; };
  const shade = (h,f) => { const a=hexRGB(h); return `rgb(${a.map(v=>clamp(Math.round(v*f),0,255)).join(',')})`; };
  const rgba = (h,a) => { const c=hexRGB(h); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; };
  const V = {
    add:(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]], sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],
    scale:(a,s)=>[a[0]*s,a[1]*s,a[2]*s], len:a=>Math.hypot(a[0],a[1],a[2]),
    norm:a=>{const l=V.len(a)||1;return[a[0]/l,a[1]/l,a[2]/l]},
    cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
    dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
  };
  const rotY = (p,a) => { const c=Math.cos(a),s=Math.sin(a); return [p[0]*c+p[2]*s, p[1], -p[0]*s+p[2]*c]; };

  /* ───────── مناطق ───────── */
  const ZONES = [
    {id:'academy', name:'آکادمی و باشگاه', icon:'🏫', x:0,    z:0,    page:'academy', color:'#D4AF37'},
    {id:'cmd',     name:'فرماندهی',        icon:'🎯', x:-130, z:-150, page:'cmd',     color:'#1EBB8A'},
    {id:'race',    name:'رقابت فصل',       icon:'🏁', x:130,  z:-150, page:'race',    color:'#2E86DE'},
    {id:'player',  name:'مرکز بازیکن',     icon:'🏌️', x:-195, z:-55,  page:'player',  color:'#E9C766'},
    {id:'match',   name:'مسابقات',         icon:'🥇', x:195,  z:-55,  page:'match',   color:'#F1C40F'},
    {id:'course',  name:'هوش زمین',        icon:'🗺️', x:-195, z:55,   page:'course',  color:'#9B59B6'},
    {id:'records', name:'سکوی قهرمانی',    icon:'🎖️', x:195,  z:55,   page:'records', color:'#E67E22'},
    {id:'cal',     name:'تقویم فصل',       icon:'📅', x:-130, z:150,  page:'cal',     color:'#1ABC9C'},
    {id:'tv',      name:'نمایش تلویزیونی', icon:'📺', x:130,  z:150,  page:'tv',      color:'#E74C3C'},
    {id:'battle',  name:'میدان نبرد',      icon:'⚔️', x:0,    z:205,  page:'battle',  color:'#8E44AD'},
    {id:'workshop',name:'کارگاه طراح',     icon:'🛠️', x:0,    z:-90,  page:'workshop',color:'#5DADE2'},
  ];
  const W = { A:null, S:null, D:null };

  /* ───────── هندسه ───────── */
  function box(w,h,d,color){
    const x=w/2, z=d/2;
    return [
      {pts:[[-x,0,-z],[x,0,-z],[x,h,-z],[-x,h,-z]], c:color},
      {pts:[[-x,0,z],[x,0,z],[x,h,z],[-x,h,z]], c:color},
      {pts:[[-x,0,-z],[-x,0,z],[-x,h,z],[-x,h,-z]], c:color},
      {pts:[[x,0,-z],[x,0,z],[x,h,z],[x,h,-z]], c:color},
      {pts:[[-x,h,-z],[x,h,-z],[x,h,z],[-x,h,z]], c:color},
      {pts:[[-x,0,-z],[x,0,-z],[x,0,z],[-x,0,z]], c:color},
    ];
  }
  function prism(n,r,h,color){
    const fs=[], top=[], bot=[];
    for(let i=0;i<n;i++){ const a=i/n*TAU+Math.PI/2; top.push([Math.cos(a)*r,h,Math.sin(a)*r]); bot.push([Math.cos(a)*r,0,Math.sin(a)*r]); }
    for(let i=0;i<n;i++){ const j=(i+1)%n; fs.push({pts:[bot[i],bot[j],top[j],top[i]], c:color}); }
    fs.push({pts:top,c:color}); return fs;
  }
  function pyramid(w,h,d,color){
    const x=w/2,z=d/2, ap=[0,h,0];
    return [
      {pts:[[-x,0,-z],[x,0,-z],ap],c:color},{pts:[[x,0,-z],[x,0,z],ap],c:color},
      {pts:[[x,0,z],[-x,0,z],ap],c:color},{pts:[[-x,0,z],[-x,0,-z],ap],c:color},
    ];
  }
  function ringF(r1,r2,color,n=20){
    const fs=[];
    for(let i=0;i<n;i++){ const a0=i/n*TAU,a1=(i+1)/n*TAU;
      fs.push({pts:[[Math.cos(a0)*r1,0,Math.sin(a0)*r1],[Math.cos(a1)*r1,0,Math.sin(a1)*r1],[Math.cos(a1)*r2,0,Math.sin(a1)*r2],[Math.cos(a0)*r2,0,Math.sin(a0)*r2]], c:color}); }
    return fs;
  }
  function discF(r,color,n=20){
    const p=[]; for(let i=0;i<n;i++) p.push([Math.cos(i/n*TAU)*r,0,Math.sin(i/n*TAU)*r]);
    return [{pts:p,c:color}];
  }
  function trophyF(){
    return [...prism(10,4.6,6.4,'#d4af37'), ...prism(6,2.4,5,'#e9c766'), ...prism(5,3,3,'#b8962e'), ...prism(4,2,2.6,'#8c6e1d')];
  }
  function poleF(color){
    return [...box(0.7,15,0.7,'#93a3b5'), {pts:[[0,15,0],[4.8,17.4,0],[0,19,0]],c:color,wave:true}];
  }

  /* ───────── اشیاء همیشگی هر منطقه (ساختمان‌ها) ───────── */
  function zoneBuildings(z){
    const objs=[], X=z.x, Z=z.z;
    const add=(o)=>objs.push(o);
    switch(z.id){
      case 'academy':
        add({pos:[X,0,Z],f:box(56,22,44,'#1d2c3e')}); add({pos:[X,22,Z],f:pyramid(64,18,50,'#253a52')});
        add({pos:[X-28,22,Z],f:box(13,13,15,'#17232f')}); add({pos:[X+28,22,Z],f:box(13,13,15,'#17232f')});
        add({pos:[X,1,Z-22.3],f:box(16,13,0.7,'#d4af37')}); add({win:{x:X,w:44,h:10,rows:3,cols:8,face:'front'}});
        add({pos:[X-32,0,Z-14],f:poleF('#1EBB8A')}); add({pos:[X+32,0,Z-14],f:poleF('#d4af37')});
        break;
      case 'cmd':
        add({pos:[X,0,Z],f:box(30,66,20,'#15212e')}); add({pos:[X,66,Z],f:box(34,6,24,'#223244')});
        add({pos:[X,68,Z],f:prism(4,3,15,'#2c4056')});
        add({pos:[X,32,Z-10.4],f:box(22,16,0.5,'#0a1a2e')});
        add({pos:[X,40,Z-10.35],f:box(19,12,0.2,'#1EBB8A')}); // صفحه زنده
        add({win:{x:X,w:24,h:16,rows:4,cols:6,face:'front'}});
        break;
      case 'race':
        add({pos:[X,0,Z],f:discF(46,'#0f1c28')}); add({pos:[X,0,Z],f:ringF(34,42,'#1EBB8A')});
        add({pos:[X,0,Z],f:ringF(42,44,'#d4af37')});
        add({pos:[X-10,0,Z-44],f:box(2.4,17,2.4,'#e8e8e8')}); add({pos:[X+10,0,Z-44],f:box(2.4,17,2.4,'#e8e8e8')});
        add({pos:[X,15,Z-44],f:box(24,2,2.4,'#222')});
        break;
      case 'player':
        add({pos:[X-8,0,Z+8],f:box(28,2,13,'#1d3a2c')}); add({pos:[X+6,0,Z+16],f:prism(8,6,3,'#e9c766')});
        add({pos:[X-26,0,Z-10],f:poleF('#1EBB8A')}); add({pos:[X+26,0,Z-10],f:poleF('#E9C766')});
        add({pos:[X,0,Z-26],f:box(44,0.5,0.7,'#f4d03f')});
        break;
      case 'match':
        add({pos:[X,0,Z],f:box(48,6,36,'#1a2634')});
        add({pos:[X-13,6,Z-6],f:box(14,9,12,'#7f8c8d')}); add({pos:[X,6,Z-6],f:box(16,12,13,'#d4af37')}); add({pos:[X+13,6,Z-6],f:box(14,9,12,'#b97a3e')});
        add({pos:[X,24,Z],f:trophyF()});
        break;
      case 'course':
        add({pos:[X,0,Z],f:box(48,2,48,'#11452e')});
        [[-14,-14],[14,-14],[-14,14],[14,14],[0,0]].forEach(([dx,dz],i)=>add({pos:[X+dx,0,Z+dz],f:poleF(i%2?'#E9C766':'#1EBB8A')}));
        add({pos:[X+25,0,Z+9],f:discF(6,'#c9a86a')}); add({pos:[X-25,0,Z-9],f:discF(7,'#1a5a7a')});
        break;
      case 'records':
        add({pos:[X,0,Z],f:box(44,11,30,'#1d2c3e')}); add({pos:[X,11,Z],f:pyramid(48,11,34,'#253a52')});
        [[-17,11],[17,11],[-17,-11],[17,-11]].forEach(([dx,dz])=>add({pos:[X+dx,0,Z+dz],f:prism(6,2.5,10,'#d4af37')}));
        break;
      case 'cal':
        add({pos:[X,0,Z],f:box(13,36,13,'#15212e')}); add({pos:[X,36,Z],f:pyramid(17,9,17,'#24384e')});
        add({pos:[X,26,Z-6.7],f:box(9,9,0.5,'#f8fafc')});
        for(let i=0;i<4;i++){ const a=i/4*TAU+0.6; add({pos:[X+Math.cos(a)*23,0,Z+Math.sin(a)*23],f:ringF(4,5.6,['#1EBB8A','#2E86DE','#E9C766','#E74C3C'][i])}); }
        break;
      case 'tv':
        add({pos:[X,0,Z],f:box(2.4,72,2.4,'#2c4056')}); add({pos:[X+5.4,0,Z],f:box(2.4,60,2.4,'#2c4056')}); add({pos:[X-5.4,0,Z],f:box(2.4,60,2.4,'#2c4056')});
        for(let i=1;i<6;i++) add({pos:[X, i*10, Z], f:box(13,1.2,13,'#223244')});
        add({pos:[X,76,Z],f:prism(6,1.7,5,'#E74C3C')});
        add({pos:[X,32,Z+9.2],f:box(28,19,0.6,'#0a1a2e')});
        break;
      case 'battle':
        add({pos:[X,0,Z],f:discF(42,'#170f1a')}); add({pos:[X,0,Z],f:ringF(40,42,'#8E44AD')});
        add({pos:[X-15,0,Z],f:poleF('#1EBB8A')}); add({pos:[X+15,0,Z],f:poleF('#E74C3C')});
        break;
      case 'workshop':
        add({pos:[X,0,Z],f:box(36,17,28,'#17232f')}); add({pos:[X,17,Z],f:box(42,3.4,34,'#223244')});
        add({pos:[X-15,1,Z+14.3],f:box(13,11,0.7,'#d4af37')});
        add({pos:[X,0,Z-9],f:box(19,4.5,9,'#3a4a28')}); add({pos:[X,4.8,Z-9],f:box(6,1.5,1.5,'#d4af37')});
        add({pos:[X+8,0,Z+5],f:box(9,10,3.4,'#5DADE2')});
        add({win:{x:X,w:22,h:8,rows:3,cols:6,face:'front'}});
        break;
    }
    return objs;
  }

  /* ───────── صحنه‌های سه‌بعدی هر منطقه (با داده واقعی) ───────── */
  function subScene(z){
    const items=[], X=z.x, Z=z.z, A=W.A, S=W.S, D=W.D;
    if (!A || !S || !D) return items;
    const avatar = pid => (pid % 2 ? (window.__AV_M || 'assets/avatar_m.png') : (window.__AV_F || 'assets/avatar_f.png'));
    switch(z.id){
      case 'academy':
        items.push({t:'text', x:X, y:34, z:Z, text:'آکادمی گلف ۱۴۰۵', size:30, color:'#E9C766', glow:true});
        items.push({t:'orb', x:X, y:14, z:Z, color:'#d4af37', r:7});
        items.push({t:'text', x:X-34, y:16, z:Z+10, text:`مسابقات: ${D.fa(A.MATCHES_HELD)}`, size:15, color:'#1EBB8A'});
        items.push({t:'text', x:X+34, y:16, z:Z+10, text:`Gold Elite: ${D.fa(A.GOLD_COUNT)}`, size:15, color:'#d4af37'});
        items.push({t:'text', x:X, y:8, z:Z+24, text:'کلیک برای ورود', size:13, color:'#8A93A6'});
        items.push({t:'hit', x:X, y:0, z:Z, page:'academy', color:'#d4af37'});
        break;
      case 'cmd':
        items.push({t:'panel', x:X, y:36, z:Z+9.5, w:210, h:130, title:'فرماندهی', color:'#1EBB8A',
          lines:[`۱۰ نفر برتر فصل`, ...A.LB.slice(0,4).map((r,i)=>`${i+1}. ${r.name} — ${D.faNum(r.pts,0)}`), `مسابقه بعدی: ${A.NEXT_T?A.NEXT_T[1]:'—'} ${D.fa(A.COUNTDOWN)} روز`],
          page:'cmd', color2:'#1EBB8A'});
        items.push({t:'text', x:X+20, y:20, z:Z, text:`#۱ ${A.LB[0]?A.LB[0].name:'—'}`, size:20, color:'#E9C766', glow:true});
        items.push({t:'text', x:X-20, y:16, z:Z, text:`${D.faNum(A.TOT_PTS,0)} امتیاز کل`, size:15, color:'#1EBB8A'});
        break;
      case 'race':
        A.LB.slice(0,10).forEach((r,i)=>{
          const a = -0.5 + i*0.11;
          items.push({t:'bar', x:X+Math.sin(a)*30, z:Z+Math.cos(a)*30, val:r.pts, max:A.LB[0].pts, name:r.name, color: r.rank<=3?'#d4af37':r.rank<=8?'#2E86DE':'#1EBB8A', page:'race'});
        });
        items.push({t:'text', x:X, y:2, z:Z-32, text:'🥇🥈🥉 مناطق قهرمانی', size:14, color:'#d4af37'});
        break;
      case 'player':
        A.LB.slice(0,8).forEach((r,i)=>{
          const a = -0.9 + i*0.26;
          items.push({t:'sprite', x:X+Math.sin(a)*30, z:Z+Math.cos(a)*30-6, img:avatar(r.pid), label:r.name, sub:`هندیکپ ${D.fa(r.hcp)} • ${D.faNum(r.pts,0)} امتیاز`, page:'player', sel:{playerSel:r.pid}, color:r.colorHex});
        });
        items.push({t:'ring', x:X, z:Z-2, r:26, color:'#E9C766'});
        items.push({t:'text', x:X, y:16, z:Z-26, text:'بازیکن را لمس کن — پروفایل سه‌بعدی', size:13, color:'#8A93A6'});
        break;
      case 'match':
        (S.tournaments||[]).slice(0,8).forEach((t,i)=>{
          const a = -1.1 + i*0.32;
          const past = D.dateFrom(t[5]) < D.TODAY;
          const j = D.jalaliInfo(D.dateFrom(t[5]));
          items.push({t:'panel', x:X+Math.sin(a)*34, z:Z+Math.cos(a)*34, y:18, w:150, h:74,
            title:t[1], color: past ? '#1EBB8A' : '#2E86DE',
            lines:[`${D.fa(j.dd)} ${j.monthFa} • ${D.fa(t[4])} حفره`, past?`برگزار شد`:`${D.fa(Math.max(0,Math.ceil((D.dateFrom(t[5])-D.TODAY)/86400000)))} روز دیگر`],
            page:'match', sel:{matchSel:t[0]}});
        });
        items.push({t:'text', x:X, y:34, z:Z, text:'مسابقات فصل — کلیک کن', size:15, color:'#E9C766', glow:true});
        break;
      case 'course':
        (S.courses||[]).forEach((c,i)=>{
          const a = -1.0 + i*0.5;
          items.push({t:'sprite', x:X+Math.sin(a)*26, z:Z+Math.cos(a)*26, img:'assets/flag_3d.png', label:c[1], sub:`پار ${D.fa(D.parsOf(c[0]).slice(0,c[3]).reduce((x,y)=>x+y,0))}`, page:'course', sel:{courseSel:c[0]}, color:'#1EBB8A', sq:false});
        });
        items.push({t:'text', x:X, y:8, z:Z+24, text:'سختی حفره‌ها + کارنامه بازیکن', size:13, color:'#8A93A6'});
        break;
      case 'records':
        items.push({t:'podium', x:X, z:Z, names:A.LB.slice(0,3).map(r=>r.name), avatars:A.LB.slice(0,3).map(r=>avatar(r.pid)), pts:A.LB.slice(0,3).map(r=>D.faNum(r.pts,0)), colors:['#b7bcc4','#d4af37','#c98a4b'], page:'records'});
        items.push({t:'trophy2', x:X+22, y:0, z:Z-12, s:1});
        items.push({t:'trophy2', x:X-22, y:0, z:Z-12, s:0.8});
        items.push({t:'text', x:X, y:20, z:Z+12, text:'🏆 قهرمانان فصل', size:18, color:'#E9C766', glow:true});
        break;
      case 'cal':
        ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور'].forEach((m,i)=>{
          items.push({t:'text', x:X, y:30-i*4.6, z:Z+6, text:m, size:14, color:'#1ABC9C'});
        });
        items.push({t:'ring', x:X, z:Z+6, r:10, color:'#1ABC9C'});
        items.push({t:'hit', x:X, y:0, z:Z, page:'cal', color:'#1ABC9C'});
        break;
      case 'tv':
        items.push({t:'ticker', x:X, y:36, z:Z+9, w:260, h:110, title:'🔴 LIVE — پخش زنده',
          lines:[`${A.LB[0].name} صدرنشین`, `${A.NEXT_T?A.NEXT_T[1]:'جام بزرگ فصل'} در ${D.fa(A.COUNTDOWN)} روز`, `پرنده‌ساز هفته: ${A.LB[0].name}`], page:'tv'});
        break;
      case 'battle':
        [0,1,2,3].forEach((m,i)=>{
          const p = A.LB[i] || {name:'—', pid:1, colorHex:'#1EBB8A'};
          items.push({t:'sprite', x:X-14+ (i%2)*6, z:Z+8 - Math.floor(i/2)*8, img:avatar(p.pid), label:p.name, sub:'تیم ۱', page:'battle', color:'#1EBB8A'});
        });
        [4,5,6,7].forEach((m,i)=>{
          const p = A.LB[i+4] || {name:'—', pid:2, colorHex:'#E74C3C'};
          items.push({t:'sprite', x:X+14- (i%2)*6, z:Z+8 - Math.floor(i/2)*8, img:avatar(p.pid), label:p.name, sub:'تیم ۲', page:'battle', color:'#E74C3C'});
        });
        items.push({t:'orb', x:X, y:14, z:Z, color:'#8E44AD', r:6});
        items.push({t:'text', x:X, y:24, z:Z, text:'جدال تیم‌ها ⚔', size:16, color:'#c39bd3', glow:true});
        break;
      case 'workshop':
        items.push({t:'text', x:X, y:22, z:Z+6, text:'🛠 کارگاه طراح', size:18, color:'#5DADE2', glow:true});
        items.push({t:'text', x:X-16, y:8, z:Z+8, text:'🗺 زمین', size:13, color:'#d4af37'});
        items.push({t:'text', x:X, y:8, z:Z+8, text:'🏆 مسابقه', size:13, color:'#d4af37'});
        items.push({t:'text', x:X+16, y:8, z:Z+8, text:'⛳ نتایج', size:13, color:'#d4af37'});
        items.push({t:'hit', x:X, y:0, z:Z, page:'workshop', color:'#5DADE2'});
        break;
    }
    return items;
  }

  /* ───────── وضعیت موتور ───────── */
  const M = {
    canvas:null, ctx:null, running:false, raf:0, t:0, inited:false,
    cam:{ yaw:0.7, pitch:0.5, dist:470, target:[0,30,0] },
    flight:null, active:null, dragging:null, hover:null, hoverObj:null,
    introT:0, introDone:false, errShown:false, imgCache:{},
  };

  function imgFor(src){
    if (M.imgCache[src] && M.imgCache[src].done) return M.imgCache[src];
    if (!M.imgCache[src]){
      const im = new Image();
      im.onload = () => { im.done = true; };
      im.src = src;
      M.imgCache[src] = im;
    }
    return M.imgCache[src];
  }

  /* ───────── پروجکشن ───────── */
  function camView(){
    const c = M.cam;
    const cp = [c.target[0]+Math.sin(c.yaw)*Math.cos(c.pitch)*c.dist,
                c.target[1]+Math.sin(c.pitch)*c.dist,
                c.target[2]+Math.cos(c.yaw)*Math.cos(c.pitch)*c.dist];
    const fwd = V.norm(V.sub(c.target, cp));
    const right = V.norm(V.cross(fwd, [0,1,0]));
    const upv = V.cross(right, fwd);
    const H = M.canvas.clientHeight||600, W2 = M.canvas.clientWidth||800;
    const f = (H/2)/Math.tan(0.95/2);
    return { cx:W2/2, cy:H/2, f, fwd, right, upv, pos:cp };
  }
  function proj(p, v){
    const d = V.sub(p, v.pos);
    const z = V.dot(d, v.fwd);
    if (z <= 0.5) return null;
    const x = V.dot(d, v.right), y = V.dot(d, v.upv);
    return { x: v.cx + x/z*v.f, y: v.cy - y/z*v.f, z, xr:x, yr:y };
  }

  /* ───────── رندر ───────── */
  function render(){
    if (!M.canvas || !M.ctx) return;
    const cv = M.canvas, ctx = M.ctx;
    const Wpx = cv.clientWidth, Hpx = cv.clientHeight;
    if (!Wpx || !Hpx) return;
    const dpr = Math.min(window.devicePixelRatio||1, 1.4);
    if (cv.width !== Math.round(Wpx*dpr) || cv.height !== Math.round(Hpx*dpr)){
      cv.width = Math.round(Wpx*dpr); cv.height = Math.round(Hpx*dpr);
    }
    ctx.setTransform(dpr,0,0,dpr,0,0);
    M.t += 0.016;
    const t = M.t, v = camView();
    ctx.clearRect(0,0,Wpx,Hpx);

    /* آسمان */
    const sky = ctx.createLinearGradient(0,0,0,Hpx);
    sky.addColorStop(0,'#05090f'); sky.addColorStop(0.5,'#0a1522'); sky.addColorStop(1,'#0e2331');
    ctx.fillStyle = sky; ctx.fillRect(0,0,Wpx,Hpx);
    ctx.fillStyle = 'rgba(248,250,252,.6)';
    for(let i=0;i<44;i++){
      const sx=(i*127.7)%Wpx, sy=(i*73.3)%(Hpx*0.65);
      ctx.globalAlpha = 0.25+0.55*Math.abs(Math.sin(t*0.7+i));
      ctx.fillRect(sx,sy,1.3,1.3);
    }
    ctx.globalAlpha = 1;
    // شهاب
    if ((t*0.7)%9 < 0.35){
      const p0 = {x:(Wpx*0.2+(t*137)%(Wpx*0.7)), y:(Hpx*0.1+(t*37)%(Hpx*0.3))};
      ctx.strokeStyle='rgba(233,199,102,.9)'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(p0.x,p0.y); ctx.lineTo(p0.x-40,p0.y+30); ctx.stroke();
    }
    // ماه
    const mp = proj(V.add(v.pos,[150,140,-60]), v);
    if (mp){
      const g = ctx.createRadialGradient(mp.x,mp.y,2,mp.x,mp.y,80);
      g.addColorStop(0,'rgba(212,175,55,.5)'); g.addColorStop(.4,'rgba(212,175,55,.12)'); g.addColorStop(1,'rgba(212,175,55,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(mp.x,mp.y,80,0,TAU); ctx.fill();
      ctx.fillStyle='#e9c766'; ctx.beginPath(); ctx.arc(mp.x,mp.y,26,0,TAU); ctx.fill();
    }

    drawGround(ctx, v, Wpx, Hpx, t);

    /* جمع‌آوری چهره‌ها */
    const faces = [];
    ZONES.forEach(z => {
      // پد
      discF(26, z.color, 16).forEach(f => {
        faces.push({ pts: f.pts.map(p=>[p[0]+z.x, 0.04, p[2]+z.z]), c:z.color, pad:true, glow:true });
      });
      zoneBuildings(z).forEach(o => {
        if (o.win){
          windowsFaces(o.win, z, t).forEach(f => faces.push(f));
          return;
        }
        o.f.forEach(f => {
          let pts = f.pts.map(p => [p[0]+o.pos[0], p[1]+o.pos[1], p[2]+o.pos[2]]);
          faces.push({ pts, c:f.c, wave:f.wave, glow:false });
        });
      });
    });
    /* صحنه فعال */
    let sub = [];
    if (M.active){
      sub = subScene(ZONES.find(z=>z.id===M.active));
      sub.forEach(it => subSolids(it, t).forEach(f => faces.push(f)));
    }

    const light = V.norm([-0.45,0.85,0.35]);
    const drawn = [];
    faces.forEach(f => {
      const pr = f.pts.map(p=>proj(p, v));
      if (pr.some(p=>!p)) return;
      const s0=pr[0],s1=pr[1],s2=pr[2];
      const area=(s1.x-s0.x)*(s2.y-s0.y)-(s1.y-s0.y)*(s2.x-s0.x);
      if (area>=0 && !f.pad) return;
      drawn.push({f, pr, z:(pr[0].z+pr[1].z+pr[2].z+pr[3]?pr[3].z:pr[2].z)/4});
    });
    drawn.sort((a,b)=>b.z-a.z);
    drawn.forEach(({f, pr}) => {
      const a=f.pts[0],b=f.pts[1],c=f.pts[2];
      let n=V.norm(V.cross(V.sub(b,a),V.sub(c,a)));
      let lum=0.62+0.5*Math.max(0,V.dot(n,light));
      const fog=clamp((f.z-260)/1050,0,0.85);
      if (f.wave){ lum=1; }
      let col=shade(f.c,lum);
      if (fog>0) col=mix(col,'#08101a',fog);
      ctx.save();
      if (f.glow){ ctx.shadowColor=f.c; ctx.shadowBlur=18; }
      ctx.fillStyle=col;
      ctx.beginPath(); ctx.moveTo(pr[0].x,pr[0].y);
      for(let i=1;i<pr.length;i++) ctx.lineTo(pr[i].x,pr[i].y);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    });

    /* افکت‌های صحنه فعال */
    if (M.active){
      sub.forEach(it => drawSubFx(it, ctx, v, t));
    }
    /* افکت‌های سراسری */
    drawGlobalFx(ctx, v, t, Wpx, Hpx);

    /* اسپرایت‌ها و پنل‌های صحنه فعال (بیلبورد) */
    if (M.active){
      const bs = sub.filter(it=>it.t==='sprite'||it.t==='panel'||it.t==='ticker').map(it=>({it, p:proj([it.x, it.y||12, it.z], v)}))
        .filter(x=>x.p && x.p.z>1).sort((a,b)=>b.p.z-a.p.z);
      bs.forEach(({it,p}) => drawBillboard(it, ctx, p, v, t));
      // متن‌های شناور
      sub.filter(it=>it.t==='text').forEach(it=>{
        const p=proj([it.x,it.y,it.z],v); if(!p||p.z>700)return;
        const k=clamp(300/p.z,0.5,1.5);
        ctx.save(); ctx.textAlign='center';
        if (it.glow){ ctx.shadowColor=it.color; ctx.shadowBlur=14; }
        ctx.font=`bold ${Math.round(it.size*k)}px Vazirmatn, Tahoma, sans-serif`;
        ctx.fillStyle=it.color||'#F8FAFC';
        ctx.fillText(it.text, p.x, p.y);
        ctx.restore();
      });
    }

    /* برچسب مناطق در نمای اصلی */
    if (!M.active){
      ctx.textAlign='center';
      ZONES.forEach(z => {
        const p = proj([z.x, 26, z.z], v);
        if (!p || p.z>640) return;
        const k = clamp(340/p.z, 0.55, 1.5);
        const bob = Math.sin(t*1.5 + z.x*0.05)*3;
        const hover = M.hover === z.id;
        const y = p.y - 6 - bob*k;
        ctx.save();
        ctx.globalAlpha = hover?1:0.8;
        ctx.shadowColor = z.color; ctx.shadowBlur = hover?26:12;
        ctx.font = `${Math.round(28*k)}px "Segoe UI Emoji", sans-serif`;
        ctx.fillText(z.icon, p.x, y);
        ctx.restore();
        ctx.font = `bold ${Math.round(15*k)}px Vazirmatn, Tahoma, sans-serif`;
        ctx.shadowColor='#000'; ctx.shadowBlur=6;
        ctx.fillStyle = hover?'#fff':'rgba(248,250,252,.93)';
        ctx.fillText(z.name, p.x, y+20*k);
        ctx.strokeStyle = rgba(z.color, hover?0.95:0.5);
        ctx.lineWidth=1.3*k;
        ctx.beginPath(); ctx.moveTo(p.x-26*k,y+30*k); ctx.lineTo(p.x+26*k,y+30*k); ctx.stroke();
        ctx.shadowBlur=0;
      });
    } else {
      // عنوان منطقه فعال + راهنما
      const z = ZONES.find(x=>x.id===M.active);
      if (z){
        ctx.textAlign='center';
        ctx.font='bold 20px Vazirmatn, Tahoma, sans-serif';
        ctx.fillStyle='rgba(248,250,252,.95)'; ctx.shadowColor='#000'; ctx.shadowBlur=8;
        ctx.fillText(`${z.icon} ${z.name}`, Wpx/2, Hpx*0.86);
        ctx.font='12.5px Vazirmatn, Tahoma, sans-serif';
        ctx.fillStyle='rgba(248,250,252,.6)';
        ctx.fillText('روی آیتم‌ها کلیک کن یا دکمه «ورود به صفحه» را بزن', Wpx/2, Hpx*0.86+22);
        ctx.shadowBlur=0;
      }
    }

    /* پیام خوش‌آمد */
    if (!M.introDone){
      ctx.textAlign='center';
      ctx.font='bold 24px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle='rgba(248,250,252,.96)'; ctx.shadowColor='#000'; ctx.shadowBlur=10;
      ctx.fillText('🌍 آکادمی گلف — سال ۱۴۰۵', Wpx/2, Hpx*0.18);
      ctx.font='14px Vazirmatn, Tahoma, sans-serif';
      ctx.fillStyle='rgba(248,250,252,.72)';
      ctx.fillText('هر ساختمان یک بخش است؛ بچرخان، زوم کن، کلیک کن و وارد شو', Wpx/2, Hpx*0.18+28);
      ctx.shadowBlur=0;
      M.introT+=0.016;
      if (M.introT>3.4) M.introDone=true;
    }
  }

  /* پنجره‌های روشن ساختمان */
  function windowsFaces(win, z, t){
    const fs=[], cols=win.cols||6, rows=win.rows||3, ww=win.w, hh=win.h;
    const x0=win.x-ww/2, y0=5, zf = z.z-1; // جلو
    for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
      if ((r*cols+c)%5===2 && Math.sin(t*3+r*7+c)>0.3) continue; // چشمک
      const w0=ww/cols, h0=hh/rows;
      const px=x0+c*w0+w0*0.12, pz=zf, py=y0+r*h0+h0*0.12;
      const w1=w0*0.76, h1=h0*0.76;
      const lit = 0.55+0.45*Math.abs(Math.sin(t*1.3+c*2.1+r));
      fs.push({ pts:[[px,py,pz],[px+w1,py,pz],[px+w1,py+h1,pz],[px,py+h1,pz]],
                c: rgba('#f2d16b', lit*0.9), glow:true });
    }
    return fs;
  }

  /* اجسام جامد صحنه فعال */
  function subSolids(it, t){
    if (it.t==='bar'){
      const h = Math.max(2, 30 * it.val / Math.max(1, it.max));
      return box(3.4, h, 3.4, it.color).map(f=>({...f}));
    }
    if (it.t==='podium'){
      const fs=[];
      const hs=[16,24,19], cols=[it.colors[0],it.colors[1],it.colors[2]];
      for(let i=0;i<3;i++){
        const dx=(i-1)*13;
        fs.push(...box(12, hs[i], 12, cols[i]).map(f=>({...f, off:[it.x+dx,0,it.z]})));
      }
      return fs;
    }
    if (it.t==='trophy2'){
      return trophyF().map(f=>({...f, off:[it.x, it.y+ (Math.sin(t*1.2+it.x)*1.5), it.z], scl:it.s||1}));
    }
    return [];
  }
  function withOff(faces){
    return faces.map(f=>({...f, pts:f.pts.map(p=>p.slice())}));
  }

  /* افکت‌های صحنه فعال (حلقه، توپ نورانی، رادار) */
  function drawSubFx(it, ctx, v, t){
    if (it.t==='ring'){
      const p=proj([it.x,0.2,it.z],v); if(!p)return;
      const k=clamp(340/p.z,0.3,1.6);
      const r=it.r*k;
      ctx.save();
      ctx.strokeStyle=rgba(it.color,0.8); ctx.lineWidth=1.6*k;
      ctx.shadowColor=it.color; ctx.shadowBlur=14;
      ctx.beginPath(); ctx.ellipse(p.x,p.y,r,r*0.4,0,0,TAU); ctx.stroke();
      const a2=t*1.2;
      ctx.strokeStyle=rgba(it.color,0.45);
      ctx.beginPath(); ctx.ellipse(p.x+Math.cos(a2)*4, p.y+Math.sin(a2)*2, r*0.86, r*0.34, 0, 0, TAU); ctx.stroke();
      // نقطه‌های چرخان
      for(let i=0;i<3;i++){
        const a=t*1.4+i*2.1;
        ctx.fillStyle='#fff';
        ctx.beginPath(); ctx.arc(p.x+Math.cos(a)*r, p.y+Math.sin(a)*r*0.4, 2.4*k, 0, TAU); ctx.fill();
      }
      ctx.restore();
    }
    if (it.t==='orb'){
      const p=proj([it.x, it.y+Math.sin(t*1.3)*1.5, it.z], v); if(!p)return;
      const k=clamp(300/p.z,0.4,1.8);
      const r=it.r*k;
      const g=ctx.createRadialGradient(p.x,p.y,1,p.x,p.y,r*2.2);
      g.addColorStop(0,'rgba(255,255,255,.95)'); g.addColorStop(.25,rgba(it.color,.85)); g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.save(); ctx.shadowColor=it.color; ctx.shadowBlur=20;
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x,p.y,r*1.6,0,TAU); ctx.fill();
      ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(p.x,p.y,r*0.62,0,TAU); ctx.fill();
      ctx.restore();
    }
  }

  /* بیلبوردها: اسپرایت آواتار / پنل / تیکر */
  function drawBillboard(it, ctx, p, v, t){
    const k = clamp(290/p.z, 0.34, 1.4);
    if (it.t==='sprite'){
      const rad = (it.sq!==false? 30:26) * k;
      const yBase = p.y - rad; // بالای حلقه
      const hover = M.hoverObj === it;
      // حلقه نور زیر
      ctx.save();
      ctx.globalCompositeOperation='lighter';
      ctx.fillStyle=rgba(it.color||'#1EBB8A', hover?0.7:0.4);
      ctx.beginPath(); ctx.ellipse(p.x, p.y+rad*0.25, rad*1.15, rad*0.5, 0, 0, TAU); ctx.fill();
      ctx.restore();
      const img = imgFor(it.img);
      ctx.save();
      if (img && img.done){
        ctx.beginPath(); ctx.arc(p.x, yBase, rad, 0, TAU); ctx.clip();
        ctx.drawImage(img, p.x-rad, yBase-rad, rad*2, rad*2);
      } else {
        ctx.fillStyle='#223244'; ctx.beginPath(); ctx.arc(p.x,yBase,rad,0,TAU); ctx.fill();
        ctx.fillStyle=it.color; ctx.font=`bold ${rad}px Tahoma`; ctx.textAlign='center';
        ctx.fillText('🏌️', p.x, yBase+rad*0.35);
      }
      ctx.restore();
      ctx.save();
      ctx.strokeStyle=it.color||'#d4af37'; ctx.lineWidth=2;
      ctx.shadowColor=it.color; ctx.shadowBlur=hover?22:10;
      ctx.beginPath(); ctx.arc(p.x, yBase, rad, 0, TAU); ctx.stroke();
      ctx.restore();
      ctx.textAlign='center';
      ctx.font=`bold ${Math.round(13*k)}px Vazirmatn, Tahoma, sans-serif`;
      ctx.shadowColor='#000'; ctx.shadowBlur=5;
      ctx.fillStyle=hover?'#fff':'rgba(248,250,252,.95)';
      ctx.fillText(it.label, p.x, yBase+rad+16*k);
      ctx.font=`${Math.round(11*k)}px Vazirmatn, Tahoma, sans-serif`;
      ctx.fillStyle='rgba(138,147,166,.95)';
      ctx.fillText(it.sub||'', p.x, yBase+rad+30*k);
      ctx.shadowBlur=0;
    }
    if (it.t==='panel' || it.t==='ticker'){
      const w = (it.w||160)*k, h = (it.h||80)*k;
      const x0 = p.x-w/2, y0 = p.y-h/2;
      ctx.save();
      ctx.fillStyle='rgba(8,14,22,.82)';
      ctx.strokeStyle=rgba(it.color||'#1EBB8A',0.9); ctx.lineWidth=1.6*k;
      ctx.shadowColor=it.color; ctx.shadowBlur=16;
      ctx.beginPath(); ctx.rect(x0,y0,w,h); ctx.fill(); ctx.stroke();
      ctx.restore();
      ctx.save();
      ctx.beginPath(); ctx.rect(x0,y0,w,h); ctx.clip();
      ctx.textAlign='center';
      ctx.font=`bold ${Math.round(13*k)}px Vazirmatn, Tahoma, sans-serif`;
      ctx.fillStyle=it.color||'#E9C766';
      ctx.fillText(it.title||'', p.x, y0+20*k);
      ctx.strokeStyle=rgba(it.color,0.4); ctx.beginPath(); ctx.moveTo(x0+8,y0+24*k); ctx.lineTo(x0+w-8,y0+24*k); ctx.stroke();
      ctx.font=`${Math.round(11.5*k)}px Vazirmatn, Tahoma, sans-serif`;
      ctx.fillStyle='rgba(248,250,252,.92)';
      if (it.t==='ticker'){
        // متن متحرک
        const off = (t*22) % (w+260*k);
        ctx.save(); ctx.beginPath(); ctx.rect(x0,y0+30*k,w,h-30*k); ctx.clip();
        ctx.textAlign='left';
        ctx.fillStyle=it.color;
        const txt = (it.lines||[]).join('   •   ');
        ctx.fillText('🔴 '+txt, x0+w-off, y0+50*k);
        ctx.fillText('🔴 '+txt, x0+w-off+(w+260*k), y0+50*k);
        ctx.restore();
      } else {
        (it.lines||[]).forEach((ln,i)=>{
          ctx.fillText(ln, p.x, y0+44*k + i*19*k);
        });
      }
      ctx.restore();
    }
  }

  /* افکت‌های سراسری: رینگ مداری، پهپادها، لیزر */
  function drawGlobalFx(ctx, v, t, Wpx, Hpx){
    // رینگ طلایی دور آکادمی
    const R = 250, yR = 1.2;
    ctx.save();
    ctx.strokeStyle='rgba(212,175,55,.5)'; ctx.lineWidth=2;
    ctx.shadowColor='#d4af37'; ctx.shadowBlur=18;
    ctx.beginPath();
    const steps=72;
    let started=false;
    for(let i=0;i<=steps;i++){
      const a=i/steps*TAU;
      const p=proj([Math.cos(a)*R, yR, Math.sin(a)*R], v);
      if(!p){ started=false; continue; }
      if(!started){ ctx.moveTo(p.x,p.y); started=true; } else ctx.lineTo(p.x,p.y);
    }
    ctx.stroke(); ctx.restore();
    // ماهواره‌های روی رینگ
    for(let i=0;i<3;i++){
      const a=t*0.25+i*2.1;
      const p=proj([Math.cos(a)*R, yR+0.5, Math.sin(a)*R], v);
      if(!p)continue;
      ctx.save(); ctx.shadowColor='#fff'; ctx.shadowBlur=12;
      ctx.fillStyle=i===1?'#d4af37':'#1EBB8A';
      ctx.beginPath(); ctx.arc(p.x,p.y,3.2,0,TAU); ctx.fill(); ctx.restore();
    }
    // پهپادها
    for(let i=0;i<2;i++){
      const cyc=t*0.5+i*3.2;
      const r=110+i*40, y=55+Math.sin(t*0.8+i*2)*8;
      const a=cyc;
      const p=proj([Math.cos(a)*r, y, Math.sin(a)*r], v);
      if(!p)continue;
      // دنباله
      ctx.save(); ctx.globalCompositeOperation='lighter';
      for(let j=0;j<10;j++){
        const a2=a-j*0.05;
        const pp=proj([Math.cos(a2)*r, y, Math.sin(a2)*r], v);
        if(!pp)continue;
        ctx.fillStyle=`rgba(233,199,102,${0.45-j*0.04})`;
        ctx.beginPath(); ctx.arc(pp.x,pp.y,3-j*0.2,0,TAU); ctx.fill();
      }
      ctx.fillStyle='#ffe9a8'; ctx.beginPath(); ctx.arc(p.x,p.y,3.4,0,TAU); ctx.fill();
      ctx.restore();
    }
    // لیزر برج تلویزیون
    const tvz = ZONES.find(z=>z.id==='tv');
    if (tvz){
      const base=proj([tvz.x, 78, tvz.z], v), sky2=proj([tvz.x, 300, tvz.z], v);
      if (base && sky2){
        const al=0.3+0.25*Math.sin(t*3);
        ctx.save(); ctx.globalCompositeOperation='lighter';
        ctx.strokeStyle=`rgba(231,76,60,${al})`; ctx.lineWidth=3;
        ctx.shadowColor='#E74C3C'; ctx.shadowBlur=16;
        ctx.beginPath(); ctx.moveTo(base.x,base.y); ctx.lineTo(sky2.x,sky2.y); ctx.stroke();
        ctx.restore();
      }
    }
    // ذرات شناور زمینی
    ctx.save();
    for(let i=0;i<18;i++){
      const a=i*0.37+t*0.1, rr=60+i*14;
      const p=proj([Math.cos(a)*rr, 0.6+Math.abs(Math.sin(t+i))*2, Math.sin(a)*rr], v);
      if(!p)continue;
      ctx.globalAlpha=0.25+0.2*Math.sin(t*2+i);
      ctx.fillStyle=i%2?'#1EBB8A':'#d4af37';
      ctx.beginPath(); ctx.arc(p.x,p.y,1.6,0,TAU); ctx.fill();
    }
    ctx.restore();
  }

  function drawGround(ctx, v, Wpx, Hpx, t){
    const g=ctx.createRadialGradient(Wpx*0.5,Hpx*0.6,60,Wpx*0.5,Hpx*0.6,Math.max(Wpx,Hpx)*0.85);
    g.addColorStop(0,'#0d3527'); g.addColorStop(.5,'#0a2a1f'); g.addColorStop(1,'#08101a');
    const q=[proj([-300,0,-300],v),proj([300,0,-300],v),proj([300,0,300],v),proj([-300,0,300],v)];
    if(q.every(x=>x)){
      ctx.fillStyle=g;
      ctx.beginPath(); ctx.moveTo(q[0].x,q[0].y); q.forEach(x=>ctx.lineTo(x.x,x.y)); ctx.closePath(); ctx.fill();
    }
    ctx.strokeStyle='rgba(30,187,138,.07)'; ctx.lineWidth=1;
    for(let z=-300;z<=300;z+=15){
      const a=proj([-300,0,z],v),b=proj([300,0,z],v);
      if(a&&b){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
    }
    for(let x=-300;x<=300;x+=15){
      const a=proj([x,0,-300],v),b=proj([x,0,300],v);
      if(a&&b){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
    }
    // موج نورانی از مرکز
    for(let i=0;i<4;i++){
      const rr=(t*26 + i*55) % 240;
      const a=proj([rr,0.1,0],v), b2=proj([-rr,0.1,0],v), c1=proj([0,0.1,rr],v), d1=proj([0,0.1,-rr],v);
      if(!a||!b2||!c1||!d1)continue;
      ctx.save(); ctx.globalCompositeOperation='lighter';
      ctx.strokeStyle=`rgba(30,187,138,${0.5*(1-rr/240)})`; ctx.lineWidth=1.6;
      ctx.beginPath(); ctx.ellipse(Wpx/2, a.y, Math.abs(a.x-Wpx/2), Math.abs(a.y-Hpx/2), 0, 0, TAU); ctx.stroke();
      ctx.restore();
    }
    ZONES.forEach(z=>{
      const p=proj([z.x,0.05,z.z],v); if(!p)return;
      const k=clamp(420/p.z,0.3,2);
      const r=30*k;
      ctx.save();
      ctx.strokeStyle=rgba(z.color,0.75); ctx.lineWidth=1.6*k;
      ctx.shadowColor=z.color; ctx.shadowBlur=16;
      ctx.beginPath(); ctx.ellipse(p.x,p.y,r,r*0.42,0,0,TAU); ctx.stroke();
      ctx.strokeStyle=rgba(z.color,0.4); ctx.lineWidth=1.1*k;
      ctx.beginPath(); ctx.ellipse(p.x,p.y,r*1.16,r*0.5,0,0,TAU); ctx.stroke();
      ctx.restore();
    });
  }

  /* ───────── پیکینگ ───────── */
  function pick(px, py){
    const v = camView();
    const sub = M.active ? subScene(ZONES.find(z=>z.id===M.active)) : [];
    // اشیاء صحنه فعال
    let best=null;
    sub.forEach(it=>{
      if (it.t!=='sprite' && it.t!=='panel' && it.t!=='ticker' && it.t!=='bar' && it.t!=='hit') return;
      const p = proj([it.x, it.y||(it.t==='bar'?10:12), it.z], v);
      if (!p) return;
      const k=clamp(290/p.z,0.34,1.4);
      const rad = it.t==='sprite' ? 40*k : it.t==='bar' ? 24*k : (Math.max(it.w||150,it.h||70)/2)*k;
      const d=Math.hypot(px-p.x, py-p.y);
      if (d<rad && (!best || d<best.d)) best={it, d};
    });
    if (best) return best.it;
    // مناطق (در نمای اصلی)
    if (!M.active){
      let bz=null;
      ZONES.forEach(z=>{
        const p=proj([z.x,26,z.z],v); if(!p)return;
        const k=clamp(340/p.z,0.55,1.5);
        const d=Math.hypot(px-p.x, py-(p.y-6-Math.sin(M.t*1.5+z.x*0.05)*3*k));
        if (d<46*k && (!bz||d<bz.d)) bz={z,d};
      });
      if (bz){ const zo = Object.assign({}, bz.z); zo._zone = true; return zo; }
    }
    return null;
  }

  /* ───────── کنترل ───────── */
  function bind(){
    const cv = M.canvas;
    let down=null;
    cv.addEventListener('pointerdown', e=>{
      down={x:e.clientX,y:e.clientY,moved:0};
      cv.setPointerCapture&&cv.setPointerCapture(e.pointerId);
    });
    cv.addEventListener('pointermove', e=>{
      const r=cv.getBoundingClientRect();
      const px=e.clientX-r.left, py=e.clientY-r.top;
      M.hoverObj = pick(px,py);
      M.hover = M.hoverObj ? (M.hoverObj.id||null) : null;
      if (!M.hover && !M.active) M.hover = null;
      cv.style.cursor = M.hoverObj ? 'pointer' : 'grab';
      if (down && !M.flight){
        const dx=e.clientX-down.x, dy=e.clientY-down.y;
        down.moved=Math.max(down.moved,Math.abs(dx)+Math.abs(dy));
        if (!M.active){
          M.cam.yaw += dx*0.0042;
          M.cam.pitch = clamp(M.cam.pitch + dy*0.0035, 0.22, 1.05);
        }
        down.x=e.clientX; down.y=e.clientY;
      }
    });
    cv.addEventListener('pointerup', e=>{
      if (down && down.moved<8 && !M.flight){
        const r=cv.getBoundingClientRect();
        const obj = pick(e.clientX-r.left, e.clientY-r.top);
        if (obj){
          if (obj._zone){ if (W.onZone) W.onZone(obj); return; }
          if (obj.page) { if (W.onObject) W.onObject(obj); return; }
          if (obj.id && W.onZone) { W.onZone(obj); return; }
        }
      }
      down=null;
    });
    cv.addEventListener('wheel', e=>{ e.preventDefault(); if(!M.flight) M.cam.dist=clamp(M.cam.dist+e.deltaY*0.3, 60, 560); }, {passive:false});
    let pinch=0;
    cv.addEventListener('touchmove', e=>{
      if(e.touches.length===2){
        const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
        if(pinch) M.cam.dist=clamp(M.cam.dist+(pinch-d)*0.5,60,560);
        pinch=d;
      }
    },{passive:true});
    cv.addEventListener('touchend',()=>{pinch=0;});
  }

  function loop(){
    if (!M.running) return;
    try { render(); } catch(err){
      if (!M.errShown){ M.errShown=true; console.error('World3D render error:', err); }
    }
    // پیشروی پرواز سینماتیک (easeInOutQuad)
    if (M.flight){
      const fl = M.flight;
      const p = Math.min(1, (performance.now() - fl.t0) / fl.dur);
      const e = p < 0.5 ? 2*p*p : 1 - Math.pow(-2*p+2, 2)/2;
      const c = M.cam;
      c.yaw   = fl.s.yaw   + (fl.e.yaw   - fl.s.yaw)   * e;
      c.pitch = fl.s.pitch + (fl.e.pitch - fl.s.pitch) * e;
      c.dist  = fl.s.dist  + (fl.e.dist  - fl.s.dist)  * e;
      c.target[0] = fl.s.tx + (fl.e.tx - fl.s.tx) * e;
      c.target[1] = fl.s.ty + (fl.e.ty - fl.s.ty) * e;
      c.target[2] = fl.s.tz + (fl.e.tz - fl.s.tz) * e;
      if (p >= 1){
        const cb = fl.cb;
        M.flight = null;
        if (cb) cb();
      }
    }
    // حرکت خودکار دوربین
    if (!M.flight && !M.dragging){
      if (!M.active) M.cam.yaw += 0.00055;
      else M.cam.yaw += 0.0009;
    }
    M.raf = requestAnimationFrame(loop);
  }

  /* ───────── پرواز سینماتیک ───────── */
  function flyToZone(z, cb){
    const c=M.cam, s={yaw:c.yaw,pitch:c.pitch,dist:c.dist,tx:c.target[0],ty:c.target[1],tz:c.target[2]};
    let ang = Math.atan2(z.x, z.z) + Math.PI;
    let dy = ang - s.yaw;
    dy = ((dy + Math.PI) % (2*Math.PI) + 2*Math.PI) % (2*Math.PI) - Math.PI;
    ang = s.yaw + dy;
    const e={yaw:ang, pitch:0.34, dist:74, tx:z.x, ty:12, tz:z.z};
    M.flight={s,e,t0:performance.now(),dur:1500,cb};
  }

  /* ───────── API ───────── */
  window.World3D = {
    init(canvas, data){
      M.canvas = canvas;
      M.ctx = canvas.getContext('2d');
      if (data){ W.A=data.A; W.S=data.S; W.D=data.D; }
      window.__AV_M = W.D ? (window.__AV_M || undefined) : undefined;
      if (!M.inited){
        bind();
        M.inited=true;
      }
      M.errShown=false;
    },
    start(){ if(!M.running){ M.running=true; M.raf=requestAnimationFrame(loop); } },
    stop(){ M.running=false; if(M.raf) cancelAnimationFrame(M.raf); M.raf=0; },
    reset(){ const c=M.cam; c.yaw=0.7; c.pitch=0.5; c.dist=470; c.target=[0,30,0]; M.active=null; M.flight=null; M.introDone=false; M.introT=0; },
    flyToZone(id, cb){ const z=ZONES.find(x=>x.id===id); if(z) flyToZone(z, cb); else if(cb) cb(); },
    activateZone(id){ M.active=id; },
    backToHub(){ M.active=null; const c=M.cam; c.dist=470; c.target=[0,30,0]; c.pitch=0.5; },
    getActive(){ return M.active; },
    get onZone(){ return W.onZone; }, set onZone(v){ W.onZone = v; },
    get onObject(){ return W.onObject; }, set onObject(v){ W.onObject = v; },
  };
  window.__W3D = { M, pick, camView, subScene, ZONES };
})();
