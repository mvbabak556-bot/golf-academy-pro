/* ═══════════════════════════════════════════════════════════════════════
   Landing 3D World — آکادمی گلف GolfAcademy.sa
   صفحهٔ ورودی سه‌بعدی قبل از ورود اعضا (فقط همین بخش؛ هیچ تغییری در سایر بخش‌ها)
   لابی فوتورئالیستی + Reception + ۴ دروازهٔ سه‌بعدی + صدا + حرکت سینمایی
   ═══════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  if (!window.THREE) return;
  try { if (localStorage.getItem('ga_session')) return; } catch(e){}
  const D = window.Data; if (!D) return;

  /* اگر WebGL در دسترس نبود (تست/jsdom) بی‌صدا خارج شو */
  let probe;
  try {
    const pc = document.createElement('canvas');
    probe = pc.getContext('webgl') || pc.getContext('experimental-webgl');
  } catch(e){ probe = null; }
  if (!probe) return;

  /* ════════ CSS (تزریق شده — هیچ فایل استایلی تغییر نمی‌کند) ════════ */
  const css = `
  #l3d{position:fixed;inset:0;z-index:150;background:#05070b;overflow:hidden;font-family:inherit}
  #l3d canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
  #l3d .l3d-vignette{position:absolute;inset:0;pointer-events:none;
    background:radial-gradient(ellipse at 50% 42%, transparent 62%, rgba(0,0,0,.38) 100%)}
  #l3d .l3d-enter{position:absolute;top:26px;right:26px;z-index:5;cursor:pointer;user-select:none;
    padding:15px 30px;border-radius:60px;font-size:17px;font-weight:900;letter-spacing:.4px;
    color:#f8fafc;text-shadow:0 1px 6px rgba(0,0,0,.5);
    background:linear-gradient(135deg, rgba(30,187,138,.22), rgba(212,175,55,.18));
    border:1px solid rgba(212,175,55,.55);
    backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
    box-shadow:0 10px 40px rgba(0,0,0,.45), 0 0 24px rgba(30,187,138,.25), inset 0 1px 0 rgba(255,255,255,.18);
    animation:l3dFloat 4.5s ease-in-out infinite;
  }
  #l3d .l3d-enter:hover{box-shadow:0 10px 46px rgba(0,0,0,.5), 0 0 42px rgba(212,175,55,.4), inset 0 1px 0 rgba(255,255,255,.25)}
  #l3d .l3d-enter small{display:block;font-size:10px;font-weight:600;color:#b9e7d4;margin-top:3px;letter-spacing:2px}
  #l3d .l3d-hint{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);z-index:4;
    font-size:11.5px;color:rgba(248,250,252,.55);background:rgba(11,15,20,.35);border:1px solid rgba(255,255,255,.08);
    padding:7px 16px;border-radius:40px;backdrop-filter:blur(8px);white-space:nowrap;direction:rtl}
  #l3d .l3d-panel{position:absolute;left:26px;top:50%;transform:translateY(-50%);z-index:5;width:min(390px,88vw);
    max-height:78vh;overflow:auto;border-radius:20px;padding:20px;
    background:linear-gradient(160deg, rgba(13,21,32,.78), rgba(8,12,18,.86));
    border:1px solid rgba(212,175,55,.35);
    box-shadow:0 24px 80px rgba(0,0,0,.55), 0 0 40px rgba(30,187,138,.12), inset 0 1px 0 rgba(255,255,255,.1);
    backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);
    opacity:0;transform:translateY(-50%) scale(.92);pointer-events:none;transition:.45s cubic-bezier(.2,.9,.25,1.2);direction:rtl}
  #l3d .l3d-panel.on{opacity:1;transform:translateY(-50%) scale(1);pointer-events:auto}
  #l3d .l3d-panel h3{margin:0 0 4px;font-size:17px;color:#f0d989;display:flex;align-items:center;gap:8px}
  #l3d .l3d-panel .tag{font-size:10.5px;color:var(--muted,#9fb0c3);margin-bottom:12px;display:block}
  #l3d .l3d-panel .l3d-close{position:absolute;top:10px;left:12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);
    color:#cfe;border-radius:50%;width:28px;height:28px;cursor:pointer;font-size:13px}
  #l3d .l3d-nav{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}
  #l3d .l3d-nav button{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:#dfe8f2;
    padding:6px 12px;border-radius:30px;font-size:11.5px;cursor:pointer;transition:.2s}
  #l3d .l3d-nav button.on,#l3d .l3d-nav button:hover{border-color:rgba(212,175,55,.6);color:#f0d989;background:rgba(212,175,55,.1)}
  #l3d .l3d-content{font-size:12.5px;line-height:2;color:#dfe8f2}
  #l3d .l3d-content b{color:#f0d989}
  #l3d .l3d-row{display:flex;justify-content:space-between;align-items:center;padding:6px 10px;border-radius:10px;margin:3px 0;background:rgba(255,255,255,.03)}
  #l3d .l3d-row.rank1{background:rgba(212,175,55,.12);border:1px solid rgba(212,175,55,.35)}
  #l3d .l3d-row.rank2{background:rgba(200,210,225,.08);border:1px solid rgba(200,210,225,.22)}
  #l3d .l3d-row.rank3{background:rgba(205,127,50,.1);border:1px solid rgba(205,127,50,.3)}
  #l3d .l3d-months{display:flex;flex-wrap:wrap;gap:6px}
  #l3d .l3d-months button{background:rgba(30,187,138,.08);border:1px solid rgba(30,187,138,.3);color:#c9f3e2;
    padding:5px 10px;border-radius:8px;font-size:11px;cursor:pointer;transition:.15s}
  #l3d .l3d-months button:hover{background:rgba(30,187,138,.2)}
  #l3d .l3d-cards{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  #l3d .l3d-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:10px;cursor:pointer;transition:.2s}
  #l3d .l3d-card:hover{border-color:rgba(212,175,55,.5);transform:translateY(-2px)}
  #l3d .l3d-card .nm{font-size:12.5px;font-weight:800;color:#fff}
  #l3d .l3d-card .sm{font-size:10px;color:#9fb0c3;margin-top:2px}
  #l3d .l3d-trophy{cursor:pointer;background:rgba(212,175,55,.07);border:1px solid rgba(212,175,55,.3);border-radius:12px;padding:10px 12px;margin:5px 0;transition:.2s}
  #l3d .l3d-trophy:hover{border-color:rgba(212,175,55,.7);background:rgba(212,175,55,.14)}
  #l3d .l3d-empty{color:#8fa2b6;font-size:12px;padding:10px;text-align:center}
  #l3d .l3d-chips{display:flex;gap:5px;flex-wrap:wrap;margin-top:6px}
  #l3d .l3d-chips span{font-size:10px;background:rgba(30,187,138,.12);border:1px solid rgba(30,187,138,.3);color:#c9f3e2;padding:2px 8px;border-radius:20px}
  #l3d .l3d-note{position:absolute;top:26px;left:26px;z-index:4;font-size:10.5px;color:rgba(248,250,252,.5);
    background:rgba(11,15,20,.3);border:1px solid rgba(255,255,255,.07);padding:6px 12px;border-radius:30px;backdrop-filter:blur(6px)}
  @keyframes l3dFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
  @media (max-width:760px){#l3d .l3d-enter{top:16px;right:16px;padding:12px 22px;font-size:14px}#l3d .l3d-panel{left:12px;width:calc(100vw - 24px)}#l3d .l3d-note{display:none}#l3d .l3d-hint{font-size:10px}}
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ════════ DOM ════════ */
  const wrap = document.createElement('div');
  wrap.id = 'l3d';
  wrap.innerHTML = `
    <canvas id="l3d-canvas"></canvas>
    <div class="l3d-vignette"></div>
    <div class="l3d-note">GolfAcademy.sa — آکادمی گلف ۱۴۰۵</div>
    <div class="l3d-enter" id="l3d-enter">ورود اعضا<small>MEMBER LOGIN</small></div>
    <div class="l3d-hint">🖱 حرکت: کاوش &nbsp;•&nbsp; اسکرول: زوم &nbsp;•&nbsp; دبل‌کلیک فضای خالی: بازگشت به لابی</div>
    <div class="l3d-panel" id="l3d-panel"></div>
  `;
  document.body.appendChild(wrap);
  const canvas = wrap.querySelector('#l3d-canvas');
  const panel = wrap.querySelector('#l3d-panel');
  const enterBtn = wrap.querySelector('#l3d-enter');
  const STATE = { room: 'lobby', selMonth: null, selPlayer: null, selTrophy: null };

  /* ════════ صحنه ════════ */
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070b10);
  scene.fog = new THREE.Fog(0x0a1018, 55, 150);

  const camera = new THREE.PerspectiveCamera(55, innerWidth/innerHeight, .1, 300);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  renderer.outputEncoding = THREE.sRGBEncoding;

  /* ════════ texture های procedural ════════ */
  function makeCanvas(w, h, draw){
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    return c;
  }
  function tex(w, h, draw, repX, repY){
    const t = new THREE.CanvasTexture(makeCanvas(w, h, draw));
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repX || 1, repY || 1);
    t.anisotropy = 4;
    return t;
  }
  const marbleTex = tex(512, 512, (g) => {
    const gr = g.createLinearGradient(0, 0, 512, 512);
    gr.addColorStop(0, '#e9e6df'); gr.addColorStop(.5, '#d8d5cd'); gr.addColorStop(1, '#c9c6bd');
    g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 60; i++){
      g.strokeStyle = 'rgba(120,118,108,' + (0.04 + Math.random()*0.06) + ')';
      g.lineWidth = 1 + Math.random()*2;
      g.beginPath();
      const x = Math.random()*512, y = Math.random()*512;
      g.moveTo(x, y);
      g.bezierCurveTo(x + Math.random()*120 - 60, y + Math.random()*80 - 40, x + Math.random()*120 - 60, y + Math.random()*80 - 40, x + Math.random()*200 - 100, y + Math.random()*160 - 80);
      g.stroke();
    }
  }, 3, 3);
  const woodTex = tex(256, 256, (g) => {
    g.fillStyle = '#6b4a2e'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 14; i++){
      const y = Math.random()*256;
      g.strokeStyle = 'rgba(30,16,6,' + (0.25 + Math.random()*0.2) + ')';
      g.lineWidth = 3 + Math.random()*6;
      g.beginPath(); g.moveTo(0, y);
      g.bezierCurveTo(90, y + Math.random()*10 - 5, 170, y + Math.random()*10 - 5, 256, y);
      g.stroke();
    }
  }, 4, 1);
  const stoneTex = tex(256, 256, (g) => {
    g.fillStyle = '#5a5f68'; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 400; i++){
      g.fillStyle = 'rgba(' + (80 + Math.random()*40) + ',' + (85 + Math.random()*40) + ',' + (95 + Math.random()*40) + ',' + (0.05 + Math.random()*0.1) + ')';
      g.fillRect(Math.random()*256, Math.random()*256, 4 + Math.random()*10, 4 + Math.random()*10);
    }
    for (let i = 0; i < 26; i++){
      g.strokeStyle = 'rgba(30,32,38,.35)'; g.lineWidth = 2;
      const x = Math.random()*256;
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 256); g.stroke();
    }
  }, 6, 2);
  function makeEnv(){
    const faces = [];
    for (let i = 0; i < 6; i++){
      const c = makeCanvas(128, 128, (g) => {
        const warm = i === 2;
        const gr = g.createLinearGradient(0, 0, 0, 128);
        if (warm){ gr.addColorStop(0, '#ffe2b0'); gr.addColorStop(.4, '#f0bc7c'); gr.addColorStop(1, '#6a4426'); }
        else { gr.addColorStop(0, '#3d4f74'); gr.addColorStop(.5, '#1d2838'); gr.addColorStop(1, '#10161f'); }
        g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
        if (warm){
          const sg = g.createRadialGradient(90, 30, 8, 90, 30, 46);
          sg.addColorStop(0, 'rgba(255,214,150,.9)'); sg.addColorStop(1, 'rgba(255,214,150,0)');
          g.fillStyle = sg; g.fillRect(0, 0, 128, 128);
        }
      });
      faces.push(c);
    }
    const ct = new THREE.CubeTexture(faces);
    ct.needsUpdate = true;
    return ct;
  }
  const envMap = makeEnv();
  scene.environment = envMap;

  /* ════════ نور ════════ */
  scene.add(new THREE.HemisphereLight(0xcfe0ff, 0x4a423a, .95));
  const sun = new THREE.DirectionalLight(0xffb36b, 2.3);
  sun.position.set(24, 18, -30);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 2; sun.shadow.camera.far = 90;
  sun.shadow.camera.left = -45; sun.shadow.camera.right = 45;
  sun.shadow.camera.top = 45; sun.shadow.camera.bottom = -45;
  sun.shadow.bias = -0.0004;
  scene.add(sun);
  const warmL = new THREE.PointLight(0xffb066, .9, 60); warmL.position.set(-8, 7, -14); scene.add(warmL);
  const goldL = new THREE.PointLight(0xd4af37, .7, 45); goldL.position.set(8, 6, 4); scene.add(goldL);
  const greenL = new THREE.PointLight(0x1ebb8a, .5, 40); greenL.position.set(-6, 5, 12); scene.add(greenL);
  const fillL = new THREE.DirectionalLight(0xe8f0ff, .55); fillL.position.set(-10, 12, 24); scene.add(fillL);

  /* ════════ متریال‌های پایه ════════ */
  const M = {
    marble: new THREE.MeshStandardMaterial({ map: marbleTex, roughness: .22, metalness: .25, envMapIntensity: 1.5 }),
    wood:   new THREE.MeshStandardMaterial({ map: woodTex, roughness: .55, metalness: .08 }),
    stone:  new THREE.MeshStandardMaterial({ map: stoneTex, roughness: .85, metalness: .05 }),
    metal:  new THREE.MeshStandardMaterial({ color: 0x2b3440, roughness: .28, metalness: .92, envMapIntensity: 1.4 }),
    gold:   new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: .22, metalness: 1, envMapIntensity: 1.6 }),
    glass:  new THREE.MeshPhysicalMaterial({ color: 0x9fc4e8, roughness: .06, metalness: .1, transparent: true, opacity: .18, envMapIntensity: 1.6 }),
    glassDark: new THREE.MeshPhysicalMaterial({ color: 0x88aacc, roughness: .12, metalness: .2, transparent: true, opacity: .32, envMapIntensity: 1.3 }),
    white:  new THREE.MeshStandardMaterial({ color: 0xf2f5f8, roughness: .5, metalness: .05 }),
    dark:   new THREE.MeshStandardMaterial({ color: 0x151b24, roughness: .7, metalness: .2 }),
    green:  new THREE.MeshStandardMaterial({ color: 0x1e7a4f, roughness: .6, metalness: .1 }),
    grass:  new THREE.MeshStandardMaterial({ color: 0x3f8f52, roughness: .9, metalness: 0 }),
  };

  /* ════════ helpers ════════ */
  function mesh(geo, mat, x, y, z, ry, rx){ const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); if (ry) o.rotation.y = ry; if (rx) o.rotation.x = rx; o.castShadow = true; o.receiveShadow = true; return o; }
  function spriteText(txt, opts){
    opts = opts || {};
    const c = makeCanvas(512, 160, (g) => {
      g.clearRect(0, 0, 512, 160);
      g.font = (opts.font || '800 44px Vazirmatn, Tahoma, sans-serif');
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.shadowColor = 'rgba(0,0,0,.7)'; g.shadowBlur = 12;
      g.fillStyle = opts.color || '#f8fafc';
      g.fillText(txt, 256, 82);
    });
    const t = new THREE.CanvasTexture(c);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false }));
    sp.scale.set(opts.scale || 6, (opts.scale || 6) * 160 / 512, 1);
    return sp;
  }
  function pillar(x, z){
    const g = new THREE.Group();
    const base = mesh(new THREE.CylinderGeometry(1.05, 1.15, .3, 24), M.stone, 0, .15, 0);
    const col = mesh(new THREE.CylinderGeometry(.55, .6, 10.5, 24), M.metal, 0, 5.6, 0);
    const cap = mesh(new THREE.CylinderGeometry(.85, .9, .35, 24), M.gold, 0, 11.2, 0);
    g.add(base, col, cap);
    g.position.set(x, 0, z);
    scene.add(g);
  }

  /* ════════ لابی ════════ */
  // کف مرمر
  const floor = mesh(new THREE.PlaneGeometry(110, 80), M.marble, 0, 0, 0, -Math.PI/2);
  floor.receiveShadow = true; scene.add(floor);
  // کف‌پوش‌های طلایی
  for (let i = -2; i <= 2; i++){
    const strip = mesh(new THREE.PlaneGeometry(1.2, 80), new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: .3, metalness: .8 }), i * 9, .015, 0, -Math.PI/2);
    scene.add(strip);
  }
  // سقف شیشه‌ای + قاب
  const roof = mesh(new THREE.PlaneGeometry(70, 50), M.glass, 0, 13, 0, Math.PI/2);
  scene.add(roof);
  for (let i = -4; i <= 4; i++){
    const beam = mesh(new THREE.BoxGeometry(.5, .6, 50), M.metal, i * 7, 12.8, 0);
    scene.add(beam);
  }
  for (let i = -3; i <= 3; i++){
    const beam = mesh(new THREE.BoxGeometry(70, .6, .5), M.metal, 0, 12.8, i * 7);
    scene.add(beam);
  }
  // دیوارها
  const wallL = mesh(new THREE.PlaneGeometry(50, 12), M.wood, -36, 6, 0, Math.PI/2); scene.add(wallL);
  const wallR = mesh(new THREE.PlaneGeometry(50, 12), M.wood, 36, 6, 0, -Math.PI/2); scene.add(wallR);
  const wallBack = mesh(new THREE.PlaneGeometry(72, 12), M.stone, 0, 6, -26, 0); scene.add(wallBack);
  const wallFront = mesh(new THREE.PlaneGeometry(72, 12), M.stone, 0, 6, 26, Math.PI); scene.add(wallFront);
  // ستون‌ها
  [[-16, -20], [16, -20], [-16, 20], [16, 20], [-31, -6], [31, -6], [-31, 6], [31, 6]].forEach(([x, z]) => pillar(x, z));
  // نیم‌طبقهٔ طلایی دور تا دور
  for (let i = -4; i <= 4; i++){
    const r1 = mesh(new THREE.BoxGeometry(.18, .22, 1.6), M.gold, i * 7, 11.35, -25.5); scene.add(r1);
    const r2 = mesh(new THREE.BoxGeometry(.18, .22, 1.6), M.gold, i * 7, 11.35, 25.5); scene.add(r2);
  }

  /* ── پنجره‌های قدی با نمای زمین گلف (دیوار پشتی) ── */
  const OUTDOOR = new THREE.Group();
  OUTDOOR.position.set(0, 0, -60);
  scene.add(OUTDOOR);
  // چمن بیرونی
  const outGrass = mesh(new THREE.PlaneGeometry(90, 60), M.grass, 0, .05, 0, -Math.PI/2);
  outGrass.receiveShadow = true; OUTDOOR.add(outGrass);
  // درختان
  const trees = [];
  for (let i = 0; i < 10; i++){
    const tg = new THREE.Group();
    const tr = mesh(new THREE.CylinderGeometry(.35, .55, 4, 8), M.wood, 0, 2, 0);
    const c1 = mesh(new THREE.SphereGeometry(2, 10, 8), M.green, 0, 5.4, 0);
    const c2 = mesh(new THREE.SphereGeometry(1.4, 10, 8), new THREE.MeshStandardMaterial({ color: 0x2e7d46, roughness: .95 }), 1.1, 6.6, .4);
    c1.castShadow = true;
    tg.add(tr, c1, c2);
    tg.position.set(-38 + i * 8.5, 0, -6 + ((i * 37) % 16));
    tg.rotation.y = (i * 53) % 360 * Math.PI/180;
    OUTDOOR.add(tg);
    trees.push(tg);
  }
  // پرچم گلف
  const flagPole = mesh(new THREE.CylinderGeometry(.06, .06, 5, 6), M.white, -20, 2.5, 4);
  OUTDOOR.add(flagPole);
  const flagMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, side: THREE.DoubleSide });
  const flag = mesh(new THREE.PlaneGeometry(1.6, 1), flagMat, -20, 5.2, 4, 0);
  OUTDOOR.add(flag);
  const flagPole2 = mesh(new THREE.CylinderGeometry(.06, .06, 5, 6), M.white, 24, 2.5, -2);
  OUTDOOR.add(flagPole2);
  const flag2 = mesh(new THREE.PlaneGeometry(1.6, 1), new THREE.MeshStandardMaterial({ color: 0x1ebb8a, side: THREE.DoubleSide }), 24, 5.2, -2);
  OUTDOOR.add(flag2);
  // آبنما
  const fountain = new THREE.Group();
  const basin = mesh(new THREE.CylinderGeometry(5, 5.6, .5, 32), M.stone, 0, .25, -16);
  fountain.add(basin);
  const waterMat = new THREE.MeshStandardMaterial({ color: 0x2f6f8f, roughness: .12, metalness: .35, transparent: true, opacity: .9 });
  const water = mesh(new THREE.CircleGeometry(4.6, 32), waterMat, 0, .55, -16, -Math.PI/2);
  fountain.add(water);
  const fCol = mesh(new THREE.CylinderGeometry(.5, .8, 2.2, 12), M.stone, 0, 1.7, -16);
  fountain.add(fCol);
  OUTDOOR.add(fountain);
  const waterParticles = new THREE.Points(
    new THREE.BufferGeometry(),
    new THREE.PointsMaterial({ color: 0xbfe8ff, size: .18, transparent: true, opacity: .8 })
  );
  const wpPos = new Float32Array(90 * 3);
  for (let i = 0; i < 90; i++){
    wpPos[i*3] = (Math.random() - .5) * 8;
    wpPos[i*3+1] = Math.random() * 4;
    wpPos[i*3+2] = -16 + (Math.random() - .5) * 8;
  }
  waterParticles.geometry.setAttribute('position', new THREE.BufferAttribute(wpPos, 3));
  OUTDOOR.add(waterParticles);
  // پنجره‌ها (شیشه روی دیوار پشتی)
  for (let i = -2; i <= 2; i++){
    const fw = 9, gap = 1.2;
    const win = mesh(new THREE.PlaneGeometry(fw, 9), M.glassDark, i * (fw + gap), 6.5, -25.4);
    scene.add(win);
    const frame = mesh(new THREE.BoxGeometry(fw + .4, 9.4, .25), M.metal, i * (fw + gap), 6.5, -25.3);
    scene.add(frame);
  }

  /* ── Reception: میز + خانم ── */
  const RECEPTION = new THREE.Group();
  RECEPTION.position.set(0, 0, 18.5);
  scene.add(RECEPTION);
  const desk = mesh(new THREE.BoxGeometry(7, 1.05, 2.6), M.marble, 0, .52, 0);
  desk.receiveShadow = true; RECEPTION.add(desk);
  const deskFront = mesh(new THREE.BoxGeometry(7, .9, .12), M.metal, 0, .45, -1.26);
  RECEPTION.add(deskFront);
  const deskGold = mesh(new THREE.BoxGeometry(7.2, .12, 2.8), M.gold, 0, 1.05, 0);
  RECEPTION.add(deskGold);
  const deskLbl = spriteText('GolfAcademy.sa', { color: '#f0d989', scale: 3.4, font: '800 60px Tahoma, sans-serif' });
  deskLbl.position.set(0, 1.6, 1.05);
  RECEPTION.add(deskLbl);
  // خانم
  const WOMAN = new THREE.Group();
  WOMAN.position.set(0, 0, .4);
  RECEPTION.add(WOMAN);
  const skin = new THREE.MeshStandardMaterial({ color: 0xe8b89a, roughness: .5 });
  const hairM = new THREE.MeshStandardMaterial({ color: 0x241409, roughness: .7 });
  const uniM = new THREE.MeshStandardMaterial({ color: 0x0f5c3c, roughness: .6, metalness: .15 });
  const goldTrim = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: .3, metalness: .9 });
  // بدن
  const body = mesh(new THREE.CylinderGeometry(.75, .95, 1.5, 16), uniM, 0, 1.3, 0);
  WOMAN.add(body);
  const collar = mesh(new THREE.CylinderGeometry(.78, .72, .18, 16), goldTrim, 0, 2.02, 0);
  WOMAN.add(collar);
  const torso = mesh(new THREE.CylinderGeometry(.6, .72, .9, 16), uniM, 0, 2.15, 0);
  WOMAN.add(torso);
  // سر
  const head = mesh(new THREE.SphereGeometry(.52, 24, 20), skin, 0, 3.0, 0);
  WOMAN.add(head);
  const hair = mesh(new THREE.SphereGeometry(.55, 20, 16, 0, Math.PI*2, 0, Math.PI*.55), hairM, 0, 3.05, .02);
  WOMAN.add(hair);
  const bun = mesh(new THREE.SphereGeometry(.18, 12, 10), hairM, 0, 3.62, -.05);
  WOMAN.add(bun);
  // چشم‌ها (پلک سفید + مردمک)
  const eyeL = new THREE.Group(), eyeR = new THREE.Group();
  const whiteM = new THREE.MeshStandardMaterial({ color: 0xf6f4ef, roughness: .2 });
  const irisM = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: .1 });
  eyeL.add(mesh(new THREE.SphereGeometry(.115, 12, 10), whiteM, 0, 0, 0));
  eyeL.add(mesh(new THREE.SphereGeometry(.055, 10, 8), irisM, 0, 0, .075));
  eyeR.add(mesh(new THREE.SphereGeometry(.115, 12, 10), whiteM, 0, 0, 0));
  eyeR.add(mesh(new THREE.SphereGeometry(.055, 10, 8), irisM, 0, 0, .075));
  eyeL.position.set(-.2, 3.08, .45); eyeR.position.set(.2, 3.08, .45);
  WOMAN.add(eyeL, eyeR);
  // لبخند (کمان باریک طلایی)
  const smile = mesh(new THREE.TorusGeometry(.11, .012, 6, 12, Math.PI), goldTrim, 0, 2.78, .48);
  smile.rotation.z = Math.PI; smile.rotation.x = Math.PI * .06;
  WOMAN.add(smile);
  // موی کناری
  const hairSide = mesh(new THREE.SphereGeometry(.12, 10, 8), hairM, -.48, 2.9, .12);
  WOMAN.add(hairSide);
  const hairSide2 = mesh(new THREE.SphereGeometry(.12, 10, 8), hairM, .48, 2.9, .12);
  WOMAN.add(hairSide2);
  // دست‌ها (روی میز)
  const armL = mesh(new THREE.CylinderGeometry(.09, .09, .7, 8), uniM, -.55, 1.62, .42);
  armL.rotation.z = .5; WOMAN.add(armL);
  const armR = mesh(new THREE.CylinderGeometry(.09, .09, .7, 8), uniM, .55, 1.62, .42);
  armR.rotation.z = -.5; WOMAN.add(armR);
  RECEPTION.userData.id = 'reception';

  /* ── چهار دروازهٔ سه‌بعدی ── */
  function portal(x, z, ry, label, icon, color, id){
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    // قاب
    const l = mesh(new THREE.BoxGeometry(1.1, 8.4, 1.1), M.metal, -4.4, 4.2, 0); g.add(l);
    const r = mesh(new THREE.BoxGeometry(1.1, 8.4, 1.1), M.metal, 4.4, 4.2, 0); g.add(r);
    const top = mesh(new THREE.BoxGeometry(10.8, 1.1, 1.1), M.gold, 0, 8.4, 0); g.add(top);
    // قوس
    const arch = mesh(new THREE.TorusGeometry(2.6, .28, 10, 22, Math.PI), M.gold, 0, 5.7, 0);
    arch.rotation.x = Math.PI/2; arch.rotation.z = Math.PI;
    g.add(arch);
    // سطح نورانی درگاه
    const glow = mesh(new THREE.PlaneGeometry(8.2, 7.4),
      new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: .16, side: THREE.DoubleSide }), 0, 4.2, 0);
    g.add(glow);
    const ring = mesh(new THREE.RingGeometry(3.6, 3.85, 40),
      new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: .55, side: THREE.DoubleSide }), 0, 4.2, .05);
    g.add(ring);
    // نور درگاهی
    const pl = new THREE.PointLight(color, 1.2, 18); pl.position.set(0, 4.4, 2);
    g.add(pl);
    // برچسب
    const lbl = spriteText(icon + ' ' + label, { color: '#f8fafc', scale: 3.6 });
    lbl.position.set(0, 10.6, 0);
    g.add(lbl);
    // نیمکت‌های تزئینی
    const bench = mesh(new THREE.BoxGeometry(3.6, .5, 1.4), M.wood, 0, .25, -1.6); g.add(bench);
    g.userData.id = id;
    scene.add(g);
    return g;
  }
  const P_COMP = portal(24.5, -6, -Math.PI/2, 'مسابقات', '🏆', 0xd4af37, 'portal-comp');
  const P_CAL  = portal(-24.5, -6, Math.PI/2, 'تقویم', '📅', 0x1ebb8a, 'portal-cal');
  const P_REC  = portal(-24.5, 6, Math.PI/2, 'رکوردها', '🎖️', 0x8ab4f8, 'portal-rec');
  const P_MEM  = portal(24.5, 6, -Math.PI/2, 'اعضا', '👥', 0xf0d989, 'portal-mem');

  /* ════════ ذرات نور/غبار ════════ */
  const dustGeo = new THREE.BufferGeometry();
  const dustN = 420;
  const dustPos = new Float32Array(dustN * 3);
  const dustSeed = [];
  for (let i = 0; i < dustN; i++){
    dustPos[i*3] = (Math.random()-.5) * 60;
    dustPos[i*3+1] = Math.random() * 11;
    dustPos[i*3+2] = (Math.random()-.5) * 40;
    dustSeed.push({ s: Math.random()*Math.PI*2, sp: .15 + Math.random()*.35 });
  }
  const dustPos0 = new Float32Array(dustN * 3);
  for (let i = 0; i < dustN; i++) dustPos0[i*3+1] = dustPos[i*3+1];
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({ color: 0xffd9a0, size: .08, transparent: true, opacity: .65, depthWrite: false });
  const dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);

  /* ════════ داده‌های فعلی سیستم ════════ */
  function liveState(){
    try {
      const st = D.loadState();
      return D.compute(st);
    } catch(e){ return null; }
  }
  const ANALYTICS = liveState();
  // بازیکنان: پایه + سفارشی (MGMT بعد از لود شدن قابل دسترس است → محاسبهٔ lazy در اولین استفاده)
  let _PLAYERS = null;
  function getPlayers(){
    if (_PLAYERS) return _PLAYERS;
    let list = (D.PLAYERS || []).filter(p => p[5]).map(p => [p[0], p[1], p[2], +p[3], p[4], p[5]]);
    try {
      if (window.MGMT && MGMT.customPlayers){
        list = list.concat(MGMT.customPlayers().filter(p => p.active !== false).map(p => [9000 + p.id, (p.name + ' ' + (p.family||'')).trim(), p.gender, +p.hcp, '2026-01-01', 1]));
      }
    } catch(e){}
    _PLAYERS = list;
    return list;
  }
  function dispName(r){
    if (r && r.name && r.name !== 'undefined' && String(r.name).trim()) return String(r.name);
    const hit = getPlayers().find(p => +p[0] === +(r && r.pid));
    return hit ? hit[1] : '—';
  }
  function prizeOf(tour){
    try { const pr = D.prizesOf(tour); return pr; } catch(e){ return [15,10,7,3]; }
  }

  /* ════════ اتاق‌های Portal (محتوا — در مکان‌های خودشان) ════════ */
  const ROOMS = {};

  /* ── سالن مسابقات (شرق) ── */
  (function(){
    const g = new THREE.Group();
    g.position.set(24.5, 0, -6);
    g.visible = false;
    // جام طلایی بزرگ
    const trophy = new THREE.Group();
    const base = mesh(new THREE.CylinderGeometry(1.5, 1.8, .5, 24), M.gold, 0, .25, 0);
    const stem = mesh(new THREE.CylinderGeometry(.5, .65, 1.6, 20), M.gold, 0, 1.3, 0);
    const cup = mesh(new THREE.CylinderGeometry(1.15, .8, 1.4, 24), M.gold, 0, 2.75, 0);
    const rim = mesh(new THREE.TorusGeometry(1.15, .09, 12, 26), M.gold, 0, 3.5, 0);
    rim.rotation.x = Math.PI/2;
    const h1 = mesh(new THREE.TorusGeometry(.55, .12, 8, 14, Math.PI*1.2), M.gold, -.85, 2.1, 0);
    const h2 = mesh(new THREE.TorusGeometry(.55, .12, 8, 14, Math.PI*1.2), M.gold, .85, 2.1, 0);
    h1.rotation.z = -Math.PI/2.6; h2.rotation.z = Math.PI/2.6;
    trophy.add(base, stem, cup, rim, h1, h2);
    trophy.position.set(-3, 0, 0);
    trophy.scale.set(1.6, 1.6, 1.6);
    trophy.userData.id = 'comp-trophy';
    g.add(trophy);
    // نور بالای جام
    const spot = new THREE.SpotLight(0xd4af37, 1.6, 30, .5, .5);
    spot.position.set(-3, 11, 3);
    g.add(spot);
    // سکو
    const podium = mesh(new THREE.CylinderGeometry(2.6, 2.9, .6, 32), M.dark, -3, .3, 0);
    g.add(podium);
    // لوح‌های هولوگرافیک سمت راست (Leaderboard)
    const lbSprite = makeCanvas(640, 420, (ctx) => {
      ctx.fillStyle = 'rgba(8,16,24,.82)'; ctx.fillRect(0, 0, 640, 420);
      ctx.strokeStyle = 'rgba(212,175,55,.8)'; ctx.lineWidth = 2; ctx.strokeRect(4, 4, 632, 412);
      ctx.fillStyle = '#f0d989'; ctx.font = '700 30px Tahoma, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('🏆 صدر جدول فصل ۱۴۰۵', 320, 46);
      const lb = ANALYTICS ? ANALYTICS.LB.slice(0, 8) : [];
      ctx.textAlign = 'right';
      lb.forEach((r, i) => {
        const y = 86 + i * 40;
        ctx.fillStyle = i === 0 ? '#ffd76a' : i === 1 ? '#dfe8f2' : i === 2 ? '#d9a066' : '#9fb0c3';
        ctx.font = '600 22px Tahoma, sans-serif';
        ctx.fillText(D.fa(r.rank) + '  ' + dispName(r), 600, y);
        ctx.fillStyle = '#eaf6ef';
        ctx.fillText(D.fa(r.pts) + ' امتیاز', 80, y);
      });
      if (!lb.length){ ctx.fillStyle = '#8fa2b6'; ctx.textAlign = 'center'; ctx.fillText('داده‌ای موجود نیست', 320, 200); }
    });
    const lbPlane = new THREE.Mesh(new THREE.PlaneGeometry(7.4, 4.9), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(lbSprite), transparent: true, side: THREE.DoubleSide }));
    lbPlane.position.set(3.2, 4.4, -1.5);
    lbPlane.rotation.y = -Math.PI / 2;
    g.add(lbPlane);
    // نبرد صدر جدول سمت چپ (دو بازیکن برتر)
    if (ANALYTICS && ANALYTICS.LB.length >= 2){
      const t1 = ANALYTICS.LB[0], t2 = ANALYTICS.LB[1];
      const duel = makeCanvas(560, 300, (ctx) => {
        ctx.fillStyle = 'rgba(8,16,24,.82)'; ctx.fillRect(0, 0, 560, 300);
        ctx.strokeStyle = 'rgba(30,187,138,.7)'; ctx.lineWidth = 2; ctx.strokeRect(4, 4, 552, 292);
        ctx.fillStyle = '#c9f3e2'; ctx.font = '700 26px Tahoma, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('⚔️ نبرد صدر جدول', 280, 44);
        ctx.textAlign = 'center'; ctx.font = '700 30px Tahoma, sans-serif';
        ctx.fillStyle = '#ffd76a'; ctx.fillText(dispName(t1), 140, 150);
        ctx.fillStyle = '#9fb0c3'; ctx.fillText('vs', 280, 150);
        ctx.fillStyle = '#dfe8f2'; ctx.fillText(dispName(t2), 420, 150);
        ctx.fillStyle = '#8fa2b6'; ctx.font = '600 18px Tahoma, sans-serif';
        ctx.fillText(D.fa(t1.pts) + ' — ' + D.fa(t2.pts) + ' امتیاز', 280, 200);
      });
      const dPlane = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 3.4), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(duel), transparent: true, side: THREE.DoubleSide }));
      dPlane.position.set(-3.4, 4.6, -1.5);
      dPlane.rotation.y = -Math.PI / 2;
      g.add(dPlane);
    }
    scene.add(g);
    ROOMS.comp = g;
  })();

  /* ── اتاق تقویم (غرب) ── */
  (function(){
    const g = new THREE.Group();
    g.position.set(-24.5, 0, -6);
    g.visible = false;
    // کرهٔ تقویم
    const globe = new THREE.Mesh(new THREE.SphereGeometry(2.6, 40, 30),
      new THREE.MeshStandardMaterial({ color: 0x0f3a5f, roughness: .25, metalness: .55, transparent: true, opacity: .92, envMapIntensity: 1.5 }));
    globe.position.set(0, 4.6, 0);
    globe.userData.id = 'cal-globe';
    g.add(globe);
    const gRing1 = mesh(new THREE.TorusGeometry(3.3, .07, 10, 40), M.gold, 0, 4.6, 0); gRing1.rotation.x = Math.PI/2.4; g.add(gRing1);
    const gRing2 = mesh(new THREE.TorusGeometry(3.6, .05, 10, 40), M.gold, 0, 4.6, 0); gRing2.rotation.x = Math.PI/1.7; g.add(gRing2);
    // ماه‌های شناور دور کره
    const months = D.MONTHS_FA || [];
    const monthSprites = [];
    months.forEach((mn, i) => {
      const a = i / 12 * Math.PI * 2;
      const sp = spriteText(mn, { color: '#c9f3e2', scale: 1.7, font: '700 40px Tahoma, sans-serif' });
      const r = 5.2, y = 4.6 + Math.sin(i * 1.9) * 2.2;
      sp.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
      sp.userData = { id: 'cal-month', month: i };
      g.add(sp);
      monthSprites.push(sp);
    });
    g.userData.id = 'cal-room';
    scene.add(g);
    ROOMS.cal = g;
    ROOMS.calSprites = monthSprites;
  })();

  /* ── تالار رکوردها (غرب-جنوب) ── */
  (function(){
    const g = new THREE.Group();
    g.position.set(-24.5, 0, 6);
    g.visible = false;
    // دیوار جام‌ها
    const shelf = mesh(new THREE.BoxGeometry(13, .4, .9), M.gold, 0, 3.2, 0);
    g.add(shelf);
    const shelf2 = mesh(new THREE.BoxGeometry(13, .4, .9), M.metal, 0, 5.6, 0);
    g.add(shelf2);
    // جام‌های کوچک روی قفسه
    const trophies = [];
    [[-4.6, 3.55], [-2.2, 3.55], [0, 3.62], [2.2, 3.55], [4.6, 3.55], [-3.4, 5.95], [0, 6.02], [3.4, 5.95]].forEach(([x, y], i) => {
      const t = new THREE.Group();
      t.add(mesh(new THREE.CylinderGeometry(.28, .36, .12, 14), M.gold, 0, .06, 0));
      t.add(mesh(new THREE.CylinderGeometry(.12, .16, .34, 12), M.gold, 0, .32, 0));
      t.add(mesh(new THREE.CylinderGeometry(.26, .18, .32, 14), M.gold, 0, .66, 0));
      const rimT = mesh(new THREE.TorusGeometry(.26, .025, 8, 16), M.gold, 0, .84, 0);
      rimT.rotation.x = Math.PI/2;
      t.add(rimT);
      t.position.set(x, y, 0);
      t.userData = { id: 'rec-trophy', idx: i };
      g.add(t);
      trophies.push(t);
    });
    // رکوردهای برجسته (هولوگرام)
    const recCanvas = makeCanvas(560, 380, (ctx) => {
      ctx.fillStyle = 'rgba(8,16,24,.85)'; ctx.fillRect(0, 0, 560, 380);
      ctx.strokeStyle = 'rgba(138,180,248,.7)'; ctx.lineWidth = 2; ctx.strokeRect(4, 4, 552, 372);
      ctx.fillStyle = '#bcd4fb'; ctx.font = '700 28px Tahoma, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('🎖️ تالار افتخارات', 280, 46);
      ctx.textAlign = 'right';
      const rows = [];
      if (ANALYTICS){
        const lb = ANALYTICS.LB;
        if (lb.length){ rows.push(['🥇 صدر جدول', dispName(lb[0]) + ' — ' + D.fa(lb[0].pts) + ' امتیاز']); }
        const best = ANALYTICS.BEST_ROUNDS && ANALYTICS.BEST_ROUNDS[0];
        if (best){ rows.push(['🏌️ بهترین راند', dispName(best) + ' — ' + D.fa(best.total) + ' (' + D.fa(best.vspar) + ')']); }
      }
      rows.forEach((r, i) => {
        ctx.fillStyle = i === 0 ? '#ffd76a' : '#dfe8f2';
        ctx.font = '600 22px Tahoma, sans-serif';
        ctx.fillText(r[0], 520, 100 + i * 44);
        ctx.fillStyle = '#9fb0c3'; ctx.font = '500 19px Tahoma, sans-serif';
        ctx.fillText(r[1], 140, 100 + i * 44);
      });
      if (!rows.length){ ctx.fillStyle = '#8fa2b6'; ctx.textAlign = 'center'; ctx.fillText('داده‌ای موجود نیست', 280, 200); }
    });
    const recPlane = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 4.5), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(recCanvas), transparent: true, side: THREE.DoubleSide }));
    recPlane.position.set(3.4, 4.4, 1.2);
    g.add(recPlane);
    // مدال‌ها
    for (let i = 0; i < 6; i++){
      const medal = mesh(new THREE.TorusGeometry(.5, .14, 10, 20), M.gold, -5.6 + i * 2.2, 6.9, 0);
      g.add(medal);
    }
    scene.add(g);
    ROOMS.rec = g;
  })();

  /* ── سالن اعضا (شرق-جنوب) ── */
  (function(){
    const g = new THREE.Group();
    g.position.set(24.5, 0, 6);
    g.visible = false;
    const cards = [];
    function build(){
      cards.forEach(c => { g.remove(c); });
      cards.length = 0;
      getPlayers().slice(0, 8).forEach((p, i) => {
      const col = i % 4, row = Math.floor(i / 4);
      const cg = new THREE.Group();
      const card = mesh(new THREE.BoxGeometry(2.9, 3.9, .14),
        new THREE.MeshStandardMaterial({ color: 0x101b26, roughness: .35, metalness: .4, transparent: true, opacity: .95 }), 0, 0, 0);
      const border = mesh(new THREE.BoxGeometry(3.05, 4.05, .05),
        new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: .3, metalness: .9, transparent: true, opacity: .8 }), 0, 0, -.08);
      const avatar = spriteText(p[2] === 'زن' ? '👩‍💼' : '👨‍💼', { scale: 1.4 });
      avatar.position.set(0, 1.15, .12);
      const nm = spriteText(p[1], { scale: 2.6, font: '700 44px Tahoma, sans-serif' });
      nm.position.set(0, -.35, .12);
      const hcp = spriteText('HCP ' + D.fa(p[3]), { color: '#c9f3e2', scale: 1.6, font: '600 34px Tahoma, sans-serif' });
      hcp.position.set(0, -.95, .12);
      cg.add(card, border, avatar, nm, hcp);
      cg.position.set((col - 1.5) * 4, 4.4 + Math.sin(i * 1.7) * .6, row * 1.2);
        cg.userData = { id: 'mem-card', pid: p[0], name: p[1], hcp: p[3], gender: p[2] };
        g.add(cg);
        cards.push(cg);
      });
      if (!cards.length){
        if (!g.userData.empty){ g.userData.empty = spriteText('هنوز عضوی ثبت نشده است', { color: '#8fa2b6', scale: 4 }); g.userData.empty.position.set(0, 4.6, 0); g.add(g.userData.empty); }
      } else if (g.userData.empty){
        g.remove(g.userData.empty);
        g.userData.empty = null;
      }
    }
    build();
    scene.add(g);
    ROOMS.mem = g;
    ROOMS.memCards = cards;
    ROOMS.rebuildMem = build;
  })();

  /* ════════ کنترل دوربین و حرکت ════════ */
  const CTRL = {
    theta: 0, phi: .42, dist: 26,
    tTheta: 0, tPhi: .42, tDist: 26,
    target: new THREE.Vector3(0, 2.7, 0),
    parallaxX: 0, parallaxY: 0, tParX: 0, tParY: 0,
    mode: 'lobby',
    fly: null,
    frozen: false,
  };
  camera.position.set(0, 5, 26);
  camera.lookAt(0, 2.7, 0);

  function setRoom(room){
    CTRL.mode = room;
    Object.keys(ROOMS).forEach(k => { ROOMS[k].visible = false; });
    if (room !== 'lobby' && ROOMS[room]) ROOMS[room].visible = true;
  }
  const CAM_SPOTS = {
    comp:  { pos: [13, 4.8, -2], look: [28.5, 3.6, -6] },
    cal:   { pos: [-13, 4.8, -2], look: [-29.5, 4.6, -6] },
    rec:   { pos: [-13, 4.8, 9], look: [-29, 4.2, 6.5] },
    mem:   { pos: [13, 4.8, 9], look: [29.5, 4.4, 6.8] },
    lobby: { pos: [0, 5, 26], look: [0, 2.7, 0] },
  };
  function flyTo(spot, onDone){
    const s = CAM_SPOTS[spot];
    if (!s) return;
    CTRL.fly = {
      t: 0,
      fromPos: camera.position.clone(),
      fromLook: CTRL.target.clone(),
      toPos: new THREE.Vector3(...s.pos),
      toLook: new THREE.Vector3(...s.look),
      onDone
    };
  }

  /* ════════ تعامل ════════ */
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let lastClickT = 0, lastClickXY = { x: 0, y: 0 };
  function pick(e){
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    return raycaster.intersectObjects(scene.children, true);
  }
  canvas.addEventListener('pointerdown', (e) => {
    initAudio();          // اولین لمس کاربر → صداهای محیط
    CTRL.frozen = false;  // هر تعامل → ادامهٔ گردش عادی دوربین
    const now = Date.now();
    const dbl = (now - lastClickT < 350) && Math.abs(e.clientX - lastClickXY.x) < 8 && Math.abs(e.clientY - lastClickXY.y) < 8;
    lastClickT = now; lastClickXY = { x: e.clientX, y: e.clientY };
    if (dbl && CTRL.mode !== 'lobby'){
      // دبل‌کلیک: فقط روی فضای خالی → بازگشت به لابی
      const h2 = pick(e);
      let id2 = null;
      for (const h of h2){
        let o = h.object;
        while (o && !o.userData.id) o = o.parent;
        if (o && o.userData.id){ id2 = o.userData.id; break; }
      }
      if (id2 === null){
        setRoom('lobby');
        panel.classList.remove('on');
        flyTo('lobby');
        sfxClick();
        return;
      }
    }
    const hits = pick(e);
    // بالا رفتن از والدها: شناسه روی گروه‌های والد است (درگاه/رسپشن/کارت/جام)
    let id = null, hitObj = null;
    for (const h of hits){
      let o = h.object;
      while (o && !o.userData.id) o = o.parent;
      if (o && o.userData.id){ id = o.userData.id; hitObj = h; break; }
    }
    handleClick(id, hitObj, e);
  });
  let lastPtrMove = 0;
  canvas.addEventListener('mousemove', (e) => {
    lastPtrMove = Date.now();
    const nx = (e.clientX / innerWidth) * 2 - 1;
    const ny = (e.clientY / innerHeight) * 2 - 1;
    CTRL.tTheta = nx * .9;
    CTRL.tPhi = .42 + ny * .3;
    CTRL.tParX = nx; CTRL.tParY = ny;
  });
  window.addEventListener('wheel', (e) => {
    if (CTRL.mode !== 'lobby') return;
    e.preventDefault();
    CTRL.tDist = Math.max(14, Math.min(46, CTRL.tDist + e.deltaY * .018));
  }, { passive: false });

  function handleClick(id, hit, e){
    if (id === 'reception'){
      flyToSpot('reception');
      return;
    }
    if (id === 'portal-comp'){ enterRoom('comp', '🏆 مسابقات'); return; }
    if (id === 'portal-cal'){ enterRoom('cal', '📅 تقویم فصل'); return; }
    if (id === 'portal-rec'){ enterRoom('rec', '🎖️ رکوردها'); return; }
    if (id === 'portal-mem'){ enterRoom('mem', '👥 اعضا'); return; }
    if (id === 'cal-month' && hit.object.userData.month !== undefined){
      const m = hit.object.userData.month;
      STATE.selMonth = m;
      showMonthPanel(m);
      return;
    }
    if (id === 'rec-trophy'){
      showTrophyPanel(hit.object.userData.idx);
      return;
    }
    if (id === 'mem-card'){
      showMemberPanel(hit.object.userData);
      return;
    }
    if (id === 'comp-trophy'){
      showTrophyPanel(0);
      return;
    }
  }
  function enterRoom(room, title){
    setRoom(room);
    if (room === 'mem' && ROOMS.rebuildMem) ROOMS.rebuildMem();
    flyTo(room);
    sfxHolo();
    setTimeout(() => { if (CTRL.mode === room) showRoomPanel(room, title); }, 900);
  }
  function flyToSpot(spot){
    sfxHolo();
    if (spot === 'reception'){
      setRoom('lobby');
      CTRL.fly = {
        t: 0,
        fromPos: camera.position.clone(), fromLook: CTRL.target.clone(),
        toPos: new THREE.Vector3(0, 3.4, 8.5), toLook: new THREE.Vector3(0, 3.1, 18.5),
        onDone: () => { CTRL.frozen = true; showReceptionPanel(); }
      };
    }
  }

  /* هوک تست/دیباگ — بدون تأثیر بر رابط کاربری */
  try {
    window.__L3D = {
      goto: r => enterRoom(r, ''),
      reception: () => flyToSpot('reception'),
      back: () => { setRoom('lobby'); panel.classList.remove('on'); CTRL.frozen = false; flyTo('lobby'); },
      month: m => showMonthPanel(m),
      trophy: i => showTrophyPanel(i),
      member: p => showMemberPanel(p),
      pickAt: (x, y) => {
        const rect = canvas.getBoundingClientRect();
        pointer.x = ((x - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((y - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(scene.children, true);
        for (const h of hits){
          let o = h.object;
          while (o && !o.userData.id) o = o.parent;
          if (o && o.userData.id) return o.userData.id;
        }
        return null;
      },
      state: () => ({ mode: CTRL.mode, frozen: CTRL.frozen, theta: +CTRL.theta.toFixed(3), phi: +CTRL.phi.toFixed(3), dist: +CTRL.dist.toFixed(1), panelOn: panel.classList.contains('on') }),
    };
  } catch(e){}

  /* ════════ پنل‌ها ════════ */
  function openPanel(html){
    panel.innerHTML = '<button class="l3d-close" id="l3d-pclose">✕</button>' + html;
    panel.classList.add('on');
    const c = panel.querySelector('#l3d-pclose');
    if (c) c.addEventListener('click', () => panel.classList.remove('on'));
  }
  function navBtns(items, active){
    return '<div class="l3d-nav">' + items.map(([k, t]) => `<button data-nav="${k}" class="${k === active ? 'on' : ''}">${t}</button>`).join('') + '</div>';
  }
  function wireNav(){
    panel.querySelectorAll('.l3d-nav button').forEach(b => b.addEventListener('click', () => {
      const k = b.dataset.nav;
      const map = panel._navMap || {};
      if (map[k]) map[k]();
    }));
  }
  function showReceptionPanel(){
    const items = [
      ['reg', '📝 ثبت‌نام آکادمی'],
      ['about', '🏛 معرفی آکادمی'],
      ['courses', '🎓 دوره‌ها'],
      ['rules', '📜 قوانین'],
      ['contact', '📞 ارتباط با آکادمی'],
    ];
    const programs = (D.loadPrograms ? D.loadPrograms() : []).filter(p => p.type === 'کلاس').slice(0, 5);
    const content = {
      reg: `<b>ثبت‌نام آکادمی گلف GolfAcademy.sa</b><br>برای عضویت در آکادمی، از پنل مدیریت وارد شوید و از بخش «بازیکنان» فرم ثبت‌نام را تکمیل کنید.<div class="l3d-chips"><span>یوزر و رمز ورود فعال می‌شود</span><span>کارت عضویت فصل ۱۴۰۵</span><span>دسترسی به همهٔ امکانات</span></div>`,
      about: `<b>معرفی آکادمی</b><br>آکادمی گلف GolfAcademy.sa، مجموعهٔ تخصصی آموزش و مسابقات گلف با استانداردهای بین‌المللی است؛ با زمین ۱۸ حفره، آکادمی آموزش، و امکانات تمرینی حرفه‌ای. فصل ۱۴۰۵ با برنامهٔ کامل مسابقات، دوره‌ها و اردوهای آماده‌سازی در جریان است.`,
      courses: programs.length
        ? programs.map(p => `<div class="l3d-row"><span>${p.name}</span><span class="chip" style="color:#f0d989">${D.fa(+p.entry||0)} امتیاز</span></div>`).join('')
        : '<div class="l3d-empty">دوره‌ای ثبت نشده — در پنل مدیریت «دوره‌ها» ثبت کنید.</div>',
      rules: `<b>قوانین آکادمی</b><br>۱. حضور به‌موقع در تمرین‌ها و مسابقات<br>۲. رعایت آداب و اخلاق گلف<br>۳. استفاده از تجهیزات استاندارد<br>۴. ثبت ضربات و رعایت قوانین مسابقه<br>۵. احترام به مربیان و سایر اعضا`,
      contact: `<b>ارتباط با آکادمی</b><br>آدرس: زمین گلف GolfAcademy.sa<br>ساعات کاری: همه‌روزه ۷ صبح تا ۹ شب<br>تلفن: ۰۲۱-۱۲۳۴۵۶۷۸<br>پست الکترونیک: info@GolfAcademy.sa`,
    };
    openPanel(`
      <h3>🤝 رسپشن — خوش آمدید</h3><span class="tag">GolfAcademy.sa • لابی اصلی</span>
      ${navBtns(items, 'reg')}
      <div class="l3d-content" id="l3d-c">${content.reg}</div>`);
    const map = {};
    items.forEach(([k]) => map[k] = () => { panel.querySelector('#l3d-c').innerHTML = content[k]; panel.querySelectorAll('.l3d-nav button').forEach(b => b.classList.toggle('on', b.dataset.nav === k)); });
    panel._navMap = map;
    wireNav();
    sfxHolo();
  }
  function showRoomPanel(room, title){
    if (room === 'comp'){
      const lb = ANALYTICS ? ANALYTICS.LB.slice(0, 10) : [];
      openPanel(`
        <h3>🏆 سالن مسابقات</h3><span class="tag">صدر جدول فصل ۱۴۰۵</span>
        <div class="l3d-content">
          ${lb.length ? lb.map((r, i) => `<div class="l3d-row ${'rank' + Math.min(i+1, 3)}"><span><b>${D.fa(r.rank)}.</b> ${r.name}</span><b style="color:#f0d989">${D.fa(r.pts)}</b></div>`).join('')
            : '<div class="l3d-empty">داده‌ای موجود نیست</div>'}
        </div>`);
    }
    if (room === 'cal'){
      openPanel(`
        <h3>📅 اتاق تقویم</h3><span class="tag">روی یک ماه در کره کلیک کنید</span>
        <div class="l3d-months" id="l3d-months">${(D.MONTHS_FA||[]).map((m, i) => `<button data-m="${i}">${m}</button>`).join('')}</div>
        <div class="l3d-content" id="l3d-cal-out" style="margin-top:10px"></div>`);
      panel.querySelectorAll('#l3d-months button').forEach(b => b.addEventListener('click', () => showMonthPanel(+b.dataset.m)));
      if (STATE.selMonth !== null) showMonthPanel(STATE.selMonth);
    }
    if (room === 'rec'){
      openPanel(`
        <h3>🎖️ تالار افتخارات</h3><span class="tag">روی جام‌های قفسه کلیک کنید</span>
        <div class="l3d-content" id="l3d-rec-out"><div class="l3d-empty">برای مشاهدهٔ رکورد، روی یک جام کلیک کنید</div></div>`);
    }
    if (room === 'mem'){
      const pl = getPlayers();
      openPanel(`
        <h3>👥 سالن اعضا</h3><span class="tag">${D.fa(pl.length)} عضو — روی کارت‌ها کلیک کنید</span>
        <div class="l3d-cards" id="l3d-mem-cards">${pl.slice(0, 12).map(p => `<div class="l3d-card" data-pid="${p[0]}" data-name="${escA(p[1])}" data-hcp="${p[3]}" data-gender="${p[2]}"><div class="nm">${p[2] === 'زن' ? '👩‍💼' : '👨‍💼'} ${escL(p[1])}</div><div class="sm">HCP ${D.fa(p[3])}</div></div>`).join('')}</div>`);
      panel.querySelectorAll('#l3d-mem-cards .l3d-card').forEach(c => c.addEventListener('click', () => showMemberPanel({ pid: +c.dataset.pid, name: c.dataset.name, hcp: +c.dataset.hcp, gender: c.dataset.gender })));
    }
  }
  function showMonthPanel(m){
    STATE.selMonth = m;
    const month = (D.MONTHS_FA||[])[m];
    if (!month) return;
    const holis = (D.IR_HOLIDAYS||[]).filter(h => h[0] === m + 1);
    let tourAll = [];
    try { tourAll = D.loadState().tournaments || []; } catch(e){ tourAll = D.TOURNAMENTS || []; }
    const tours = tourAll.filter(t => {
      try { const j = D.jalaliInfo(D.dateFrom(t[5])); return j.mm === m + 1 && j.yy === 1405; } catch(e){ return false; }
    });
    const evs = (window.MGMT && MGMT.customEvents ? MGMT.customEvents() : []).filter(e => {
      try { const j = D.jalaliInfo(D.dateFrom(e.start || e.date)); return j.mm === m + 1; } catch(e){ return false; }
    });
    const prg = (D.loadPrograms ? D.loadPrograms() : []).filter(p => {
      try { const j = D.jalaliInfo(D.dateFrom(p.start)); return j.mm === m + 1; } catch(e){ return false; }
    });
    openPanel(`
      <h3>📅 ${month} ۱۴۰۵</h3><span class="tag">تقویم رسمی + رویدادهای آکادمی</span>
      <div class="l3d-content">
        <b>تعطیلات و مناسبت‌ها (${D.fa(holis.length)})</b>
        ${holis.length ? holis.map(h => `<div class="l3d-row"><span>${D.fa(h[1])} ${month}</span><span>${h[2]}</span></div>`).join('') : '<div class="l3d-empty">موردی نیست</div>'}
        <b style="display:block;margin-top:10px">مسابقات (${D.fa(tours.length)})</b>
        ${tours.length ? tours.map(t => `<div class="l3d-row"><span>🏆 ${t[1]}</span><span style="color:#f0d989">${D.fa(t[4])} حفره</span></div>`).join('') : '<div class="l3d-empty">مسابقه‌ای نیست</div>'}
        ${(evs.length || prg.length) ? `<b style="display:block;margin-top:10px">رویدادهای آکادمی (${D.fa(evs.length + prg.length)})</b>
        ${evs.map(e => `<div class="l3d-row"><span>📌 ${e.name}</span></div>`).join('')}
        ${prg.map(p => `<div class="l3d-row"><span>${p.type === 'تمرین' ? '🏌️' : p.type === 'اردو' ? '🏕️' : '📚'} ${p.name}</span></div>`).join('')}` : ''}
      </div>`);
  }
  function showTrophyPanel(idx){
    const labels = ['جام صدر جدول', 'جام بهترین راند', 'جام قهرمان فصل', 'جام حرفه‌ای‌ها', 'جام امیدها', 'جام خوش‌اخلاقی', 'جام ماه', 'جام ویژه'];
    const lb = ANALYTICS ? ANALYTICS.LB : [];
    const best = ANALYTICS && ANALYTICS.BEST_ROUNDS && ANALYTICS.BEST_ROUNDS[0];
    const data = [
      lb[0] ? ('قهرمان صدر جدول: ' + dispName(lb[0]) + ' — ' + D.fa(lb[0].pts) + ' امتیاز') : 'هنوز ثبت نشده',
      best ? ('بهترین راند فصل: ' + dispName(best) + ' — ' + D.fa(best.total) + ' ضربه') : 'هنوز ثبت نشده',
      (lb[0] && lb[0].win) ? (dispName(lb[0]) + ' با ' + D.fa(lb[0].win) + ' قهرمانی') : 'هنوز ثبت نشده',
      lb[1] ? (dispName(lb[1]) + ' — ' + D.fa(lb[1].pts) + ' امتیاز') : 'هنوز ثبت نشده',
      lb[2] ? (dispName(lb[2]) + ' — ' + D.fa(lb[2].pts) + ' امتیاز') : 'هنوز ثبت نشده',
      'برای فصل ۱۴۰۵ در نظر گرفته شده است',
      lb[0] ? ('قهرمان ماه: ' + dispName(lb[0])) : 'هنوز ثبت نشده',
      'جام ویژهٔ رویدادهای خاص',
    ];
    openPanel(`
      <h3>🏆 ${labels[idx % labels.length]}</h3><span class="tag">تالار افتخارات</span>
      <div class="l3d-content">${data[idx % data.length]}</div>`);
    sfxHolo();
  }
  function showMemberPanel(p){
    let pid = p.pid, name = p.name, hcp = p.hcp;
    let custom = null;
    try { custom = (window.MGMT && MGMT.customPlayers ? MGMT.customPlayers() : []).find(c => c.id === pid - 9000); } catch(e){}
    let lbRow = null;
    if (ANALYTICS) lbRow = ANALYTICS.LB.find(r => r.pid === +pid) || null;
    const stats = lbRow ? [
      ['امتیاز فصل', D.fa(lbRow.pts) + ' امتیاز'],
      ['رنک', D.fa(lbRow.rank)],
      ['مسابقات', D.fa(lbRow.matches)],
      ['قهرمانی', D.fa(lbRow.win)],
      ['بهترین راند', lbRow.best_total ? D.fa(lbRow.best_total) + ' (' + D.fa(lbRow.best_vspar) + ')' : '—'],
      ['میانگین ضربات', D.fa(lbRow.scoring_avg)],
    ] : [['امتیاز فصل', '—'], ['رنک', '—']];
    openPanel(`
      <h3>${p.gender === 'زن' ? '👩‍💼' : '👨‍💼'} ${escL(name)}</h3><span class="tag">پروفایل عضو • HCP ${D.fa(hcp)}</span>
      <div class="l3d-content">${stats.map(([k, v]) => `<div class="l3d-row"><span>${k}</span><b style="color:#f0d989">${v}</b></div>`).join('')}</div>`);
    sfxHolo();
  }
  function escL(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
  function escA(s){ return String(s == null ? '' : s).replace(/"/g, '&quot;'); }

  /* ════════ صدا (WebAudio procedural) ════════ */
  let AC = null, ambGain = null, birdTimer = null;
  function initAudio(){
    if (AC) return;
    try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){ return; }
    ambGain = AC.createGain(); ambGain.gain.value = .12; ambGain.connect(AC.destination);
    // باد
    const len = AC.sampleRate * 2;
    const buf = AC.createBuffer(1, len, AC.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++){ const w = Math.random() * 2 - 1; last = (last + .02 * w) / 1.02; d[i] = last * 3; }
    const src = AC.createBufferSource(); src.buffer = buf; src.loop = true;
    const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 420; bp.Q.value = .6;
    const g = AC.createGain(); g.gain.value = .5;
    const lfo = AC.createOscillator(); lfo.frequency.value = .13;
    const lfoG = AC.createGain(); lfoG.gain.value = .22;
    lfo.connect(lfoG); lfoG.connect(g.gain);
    src.connect(bp); bp.connect(g); g.connect(ambGain);
    src.start(); lfo.start();
    // آبنما (نویز فیلتر پایین)
    const nb = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate);
    const nd = nb.getChannelData(0);
    for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    const nsrc = AC.createBufferSource(); nsrc.buffer = nb; nsrc.loop = true;
    const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700;
    const ng = AC.createGain(); ng.gain.value = .5;
    nsrc.connect(lp); lp.connect(ng); ng.connect(ambGain);
    nsrc.start();
    // پرندگان
    birdTimer = setInterval(() => {
      try {
        const o = AC.createOscillator(); const g2 = AC.createGain();
        o.frequency.value = 2200 + Math.random() * 1800;
        g2.gain.setValueAtTime(.0001, AC.currentTime);
        g2.gain.exponentialRampToValueAtTime(.05, AC.currentTime + .01);
        g2.gain.exponentialRampToValueAtTime(.0001, AC.currentTime + .12 + Math.random() * .1);
        o.connect(g2); g2.connect(ambGain);
        o.start(); o.stop(AC.currentTime + .25);
      } catch(e){}
    }, 3500 + Math.random() * 2500);
  }
  function sfxClick(){
    if (!AC) return;
    const o = AC.createOscillator(); const g = AC.createGain();
    o.type = 'sine'; o.frequency.value = 1500;
    g.gain.setValueAtTime(.09, AC.currentTime);
    g.gain.exponentialRampToValueAtTime(.0001, AC.currentTime + .09);
    o.connect(g); g.connect(AC.destination);
    o.start(); o.stop(AC.currentTime + .1);
  }
  function sfxHolo(){
    if (!AC) return;
    const o = AC.createOscillator(); const g = AC.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(320, AC.currentTime);
    o.frequency.exponentialRampToValueAtTime(880, AC.currentTime + .35);
    g.gain.setValueAtTime(.05, AC.currentTime);
    g.gain.exponentialRampToValueAtTime(.0001, AC.currentTime + .42);
    o.connect(g); g.connect(AC.destination);
    o.start(); o.stop(AC.currentTime + .45);
  }

  /* ════════ ورود اعضا (بدون تغییر در login) ════════ */
  enterBtn.addEventListener('click', () => {
    initAudio();
    sfxClick();
    // login فعلی را نشان بده
    const login = document.getElementById('login');
    if (login){
      wrap.style.transition = 'opacity .8s ease, transform .8s ease';
      wrap.style.opacity = '0';
      wrap.style.transform = 'scale(1.04)';
      login.style.display = 'flex';
      setTimeout(() => { wrap.style.display = 'none'; }, 850);
    }
  });
  const loginForm = document.getElementById('login-form');
  if (loginForm){
    loginForm.addEventListener('submit', () => {
      // بعد از ورود، دنیای ورودی را کاملاً حذف کن
      cleanup();
    });
  }
  function cleanup(){
    try { if (birdTimer) clearInterval(birdTimer); } catch(e){}
    if (AC) { try { AC.close(); } catch(e){} }
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', onResize);
    try { renderer.dispose(); } catch(e){}
    if (wrap.parentNode) wrap.parentNode.removeChild(wrap);
    try { if (styleEl.parentNode) styleEl.parentNode.removeChild(styleEl); } catch(e){}
  }

  /* ════════ لوپ ════════ */
  let rafId = 0;
  let clock = new THREE.Clock();
  let _lastT = 0;
  function onResize(){
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  }
  window.addEventListener('resize', onResize);

  function anim(){
    const t = clock.getElapsedTime();
    const dt = Math.min(.1, t - _lastT); _lastT = t;
    // دوربین
    if (CTRL.fly){
      CTRL.fly.t += dt / 1.1;
      const k = Math.min(1, CTRL.fly.t);
      const e = 1 - Math.pow(1 - k, 3);
      camera.position.lerpVectors(CTRL.fly.fromPos, CTRL.fly.toPos, e);
      CTRL.target.lerpVectors(CTRL.fly.fromLook, CTRL.fly.toLook, e);
      if (k >= 1){ const cb = CTRL.fly.onDone; CTRL.fly = null; if (cb) cb(); }
    } else if (CTRL.mode === 'lobby' && !CTRL.frozen){
      // چرخش آهستهٔ خودکار (سینمایی) وقتی موس مدتی دست‌نخورده است
      if (Date.now() - lastPtrMove > 6000){
        const drift = Math.sin(t * .05) * .95;
        CTRL.tTheta += (drift - CTRL.tTheta) * .002;
      }
      CTRL.tTheta = THREE.MathUtils.clamp(CTRL.tTheta, -1.05, 1.05);
      CTRL.tPhi = THREE.MathUtils.clamp(CTRL.tPhi, .12, .75);
      CTRL.theta += (CTRL.tTheta - CTRL.theta) * .045;
      CTRL.phi += (CTRL.tPhi - CTRL.phi) * .045;
      CTRL.dist += (CTRL.tDist - CTRL.dist) * .05;
      const px = CTRL.parallaxX + (CTRL.tParX - CTRL.parallaxX) * .03;
      const py = CTRL.parallaxY + (CTRL.tParY - CTRL.parallaxY) * .03;
      const rH = CTRL.dist * Math.cos(CTRL.phi);
      camera.position.set(
        CTRL.target.x + rH * Math.sin(CTRL.theta) + px * .9,
        CTRL.target.y + CTRL.dist * Math.sin(CTRL.phi) * .42 + py * .35,
        CTRL.target.z + rH * Math.cos(CTRL.theta)
      );
    }
    camera.lookAt(CTRL.target);

    // انیمیشن‌های محیط
    // خانم: تنفس + سر/نگاه
    const breath = 1 + Math.sin(t * 1.7) * .012;
    WOMAN.scale.set(breath, 1 / (1.018) + Math.sin(t * 1.7) * .012, breath);
    WOMAN.rotation.y = Math.sin(t * .5) * .05;
    const lookT = (Math.sin(t * .35) * .5 + .5) * .16 - .08;
    head.rotation.y = lookT;
    head.rotation.x = Math.sin(t * .4) * .03;
    // مردمک‌ها به سمت دوربین
    eyeL.children[1].position.x = .04 + Math.sin(t * .6) * .015;
    eyeR.children[1].position.x = -.04 + Math.sin(t * .6) * .015;
    // درختان sway
    trees.forEach((tg, i) => { tg.rotation.z = Math.sin(t * .7 + i) * .015; });
    // پرچم
    flag.rotation.y = Math.sin(t * 2.2) * .18;
    flag2.rotation.y = Math.sin(t * 1.9 + 2) * .16;
    // آب
    const wp = waterParticles.geometry.attributes.position.array;
    for (let i = 0; i < 90; i++){
      wp[i*3+1] = .6 + Math.sin(t * 2 + i * 1.3) * .25 + ((i * 37) % 10) * .1;
      if (wp[i*3+1] > 4.2) wp[i*3+1] = .5;
    }
    waterParticles.geometry.attributes.position.needsUpdate = true;
    // ذرات غبار
    const dp = dust.geometry.attributes.position.array;
    for (let i = 0; i < dustN; i++){
      const s = dustSeed[i];
      dp[i*3+1] = dustPos0[i*3+1] + Math.sin(t * s.sp + s.s) * .25;
    }
    dust.geometry.attributes.position.needsUpdate = true;
    // کرهٔ تقویم + ماه‌ها
    if (ROOMS.cal.visible){
      ROOMS.cal.children[0].rotation.y += .0025;
      ROOMS.cal.children[0].rotation.x = Math.sin(t * .2) * .08;
      (ROOMS.calSprites||[]).forEach((sp, i) => {
        const a = i / 12 * Math.PI * 2 + t * .08;
        sp.position.x = Math.cos(a) * 5.2;
        sp.position.z = Math.sin(a) * 5.2;
      });
    }
    // کارت‌های اعضا float
    if (ROOMS.mem.visible){
      (ROOMS.memCards||[]).forEach((cg, i) => {
        cg.position.y = 4.4 + Math.sin(i * 1.7) * .6 + Math.sin(t * 1.4 + i) * .18;
        cg.rotation.y = Math.sin(t * .9 + i) * .06;
      });
    }
    // درگاه‌ها: حلقه‌های نورانی تنفس
    if (CTRL.mode === 'lobby'){
      const pulse = .5 + Math.sin(t * 1.6) * .18;
      [P_COMP, P_CAL, P_REC, P_MEM].forEach((p, i) => {
        const ring = p.children.find(c => c.isMesh && c.geometry && c.geometry.type === 'RingGeometry');
        if (ring) ring.material.opacity = pulse + Math.sin(t + i * 1.5) * .1;
      });
    }

    renderer.render(scene, camera);
    rafId = requestAnimationFrame(anim);
  }
  rafId = requestAnimationFrame(anim);
})();
