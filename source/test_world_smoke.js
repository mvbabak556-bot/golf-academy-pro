/* Smoke test: login → enter 3D world → click zone → cinematic flyTo → activate → enter page
   Run: node test_world_smoke.js   (needs: npm i jsdom) */
const fs = require('fs');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync(process.env.TARGET || 'index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'http://localhost/' });
const w = dom.window, d = w.document;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const results = [];
const check = (cond, label, extra='') => { results.push([cond, label, extra]); if (!cond) console.log('  ✗ FAIL:', label, extra); };

(async () => {
  /* ── stubs ── */
  w.requestAnimationFrame = cb => setTimeout(() => cb(w.performance.now()), 16);
  w.cancelAnimationFrame = id => clearTimeout(id);
  w.matchMedia = () => ({ matches:false, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){}, dispatchEvent(){ return false; } });
  w.scrollTo = () => {};
  w.IntersectionObserver = class { constructor(){} observe(){} unobserve(){} disconnect(){} };
  const grad = { addColorStop(){} };
  function makeCtx(cv){
    return new Proxy({}, {
      get(t, p){
        if (p === 'canvas') return cv;
        if (p === 'createLinearGradient' || p === 'createRadialGradient' || p === 'createPattern') return () => grad;
        if (p === 'measureText') return () => ({ width: 8 });
        return () => {};
      },
      set(){ return true; },
    });
  }
  w.HTMLCanvasElement.prototype.getContext = function(){ return makeCtx(this); };
  w.Element.prototype.getBoundingClientRect = function(){ return { left:0, top:0, width:800, height:600, right:800, bottom:600, x:0, y:0 }; };
  w.Image = class { constructor(){ this.done = false; } set src(v){ this._src = v; this.done = true; } get src(){ return this._src; } };

  /* ── load app (single eval scope = browser shared globals) ── */
  const errors = [];
  w.addEventListener('error', e => errors.push(e.message || String(e)));
  const all = ['js/data.js','js/charts.js','js/world3d.js','js/app.js'].map(f => fs.readFileSync(f,'utf8')).join('\n;\n');
  w.eval(all);
  d.dispatchEvent(new w.Event('DOMContentLoaded'));
  await sleep(120);

  check(!!w.Data, 'data.js loads (window.Data)', '');
  check(!!w.World3D, 'world3d.js loads (window.World3D)', '');
  check(errors.length === 0, 'no window errors during load', errors.join(' | '));

  /* ── login ── */
  d.querySelector('#login-user').value = 'admin';
  d.querySelector('#login-pass').value = 'golf1405';
  d.querySelector('#login-form').dispatchEvent(new w.Event('submit', { bubbles:true, cancelable:true }));
  await sleep(250);
  check(d.querySelector('#app').classList.contains('on'), 'login: app entered');
  check(!d.querySelector('#login').style.display || d.querySelector('#login').style.display === 'none', 'login: form hidden');

  /* ── enter world via nav ── */
  d.querySelector('.nav-item[data-page="world"]').dispatchEvent(new w.MouseEvent('click', { bubbles:true }));
  await sleep(350);
  const worldEl = d.querySelector('#world');
  check(worldEl.classList.contains('on'), 'world overlay .on after nav click');
  check(w.World3D.getActive() === null, 'world starts in hub (active=null)');

  /* ── wrap flyToZone / activateZone to record ── */
  const fly = [], act = [];
  const origFly = w.World3D.flyToZone, origAct = w.World3D.activateZone;
  w.World3D.flyToZone = function(id, cb){ fly.push(id); return origFly.call(this, id, cb); };
  w.World3D.activateZone = function(id){ act.push(id); return origAct.call(this, id); };

  /* ── scan clicks until a zone is picked (hub view) ── */
  const cv = d.querySelector('#world-canvas');
  function clickAt(x, y){
    const o = { clientX:x, clientY:y, bubbles:true, cancelable:true, view:w };
    cv.dispatchEvent(new w.MouseEvent('pointerdown', o));
    cv.dispatchEvent(new w.MouseEvent('pointerup', o));
  }
  // sanity: engine pick works (debug handle)
  check(!!w.__W3D && !!w.__W3D.pick(400,220), 'engine pick() reachable', w.__W3D && JSON.stringify(w.__W3D.pick(400,220)));
  let zoneHit = null;
  outer:
  for (let sweep = 0; sweep < 60 && !zoneHit; sweep++){
    for (let y = 40; y < 580; y += 18){
      for (let x = 40; x < 780; x += 18){
        clickAt(x, y);
        if (fly.length){ zoneHit = { x, y }; break outer; }
      }
      await sleep(4); if (fly.length) break;
    }
    await sleep(40); // let auto-orbit sweep the camera
  }
  check(!!zoneHit, 'zone click detected (flyToZone scheduled)', zoneHit ? `at ${zoneHit.x},${zoneHit.y}` : '');
  await sleep(2600); // 480ms caption delay + 1500ms flight + slack
  check(act.length > 0, 'activateZone called after flight', act.join(','));
  check(fly.length > 0 && act.length > 0 && fly[fly.length-1] === act[act.length-1], 'last flown == last activated', `fly=${fly.join(',')} act=${act.join(',')}`);
  check(worldEl.classList.contains('on'), 'world still on after zone activate');

  const actions = d.querySelector('#world-actions');
  check(actions.classList.contains('show'), '#world-actions.show visible');
  const enterBtn = d.querySelector('#world-enter');
  check(enterBtn.textContent.includes('ورود'), '#world-enter has entry label', enterBtn.textContent.trim());

  /* ── click enter → exit to that zone's page ── */
  enterBtn.dispatchEvent(new w.MouseEvent('click', { bubbles:true }));
  await sleep(650);
  check(!worldEl.classList.contains('on'), 'world hidden after entering page');
  await sleep(450); // exitWorldTo has a 300ms transition before go(page)
  const crumb = d.querySelector('#top-crumb').textContent;
  check(crumb.startsWith('داشبورد / ') || crumb.startsWith('ابزار طراح / '), 'page breadcrumb set', crumb);
  check(d.querySelector('#view').innerHTML.length > 50, 'page rendered (#view non-empty)', '');

  /* ── re-enter, fly to a zone, then click a sub-scene object (3D profile → player page) ── */
  d.querySelector('.nav-item[data-page="world"]').dispatchEvent(new w.MouseEvent('click', { bubbles:true }));
  await sleep(350);
  check(worldEl.classList.contains('on'), 're-entered world');
  fly.length = 0; act.length = 0;
  let zoneHit2 = null;
  outer2:
  for (let sweep = 0; sweep < 60 && !zoneHit2; sweep++){
    for (let y = 40; y < 580; y += 18){
      for (let x = 40; x < 780; x += 18){
        clickAt(x, y);
        if (fly.length){ zoneHit2 = { x, y }; break outer2; }
      }
      await sleep(4); if (fly.length) break;
    }
    await sleep(40);
  }
  check(!!zoneHit2, '2nd zone click detected', zoneHit2 ? `zone=${fly[0]||'?'}` : '');
  await sleep(2600);
  check(act.length > 0 && w.World3D.getActive() === act[0], '2nd zone active', `active=${w.World3D.getActive()}`);
  // object scan: in active zone, clicking a sub-scene item (sprite/panel) → onObject → exitWorldTo
  let objExitTitle = null;
  outer3:
  for (let sweep = 0; sweep < 80 && !objExitTitle; sweep++){
    for (let y = 40; y < 580; y += 18){
      for (let x = 40; x < 780; x += 18){
        clickAt(x, y);
        if (!worldEl.classList.contains('on')){ await sleep(450); objExitTitle = d.querySelector('#top-title').textContent; break outer3; }
      }
      await sleep(4); if (!worldEl.classList.contains('on')) break;
    }
    await sleep(40);
  }
  check(!!objExitTitle && !objExitTitle.includes('دنیای سه'), 'sub-scene object click exited to a page', objExitTitle || '');

  /* ── third entry: test #world-hub back + #world-exit ── */
  d.querySelector('.nav-item[data-page="world"]').dispatchEvent(new w.MouseEvent('click', { bubbles:true }));
  await sleep(350);
  fly.length = 0; act.length = 0;
  let zoneHit3 = null;
  outer4:
  for (let sweep = 0; sweep < 60 && !zoneHit3; sweep++){
    for (let y = 40; y < 580; y += 18){
      for (let x = 40; x < 780; x += 18){
        clickAt(x, y);
        if (fly.length){ zoneHit3 = { x, y }; break outer4; }
      }
      await sleep(4); if (fly.length) break;
    }
    await sleep(40);
  }
  await sleep(2600);
  const hubBtn = d.querySelector('#world-hub');
  hubBtn.dispatchEvent(new w.MouseEvent('click', { bubbles:true }));
  await sleep(200);
  check(!actions.classList.contains('show'), 'hub button clears zone actions');
  check(w.World3D.getActive() === null, 'backToHub: active=null');
  d.querySelector('#world-exit').dispatchEvent(new w.MouseEvent('click', { bubbles:true }));
  await sleep(500);
  check(!worldEl.classList.contains('on'), 'world-exit hides world');
  check(d.querySelector('#top-title').textContent.includes('فرماندهی'), 'exit lands on command page', d.querySelector('#top-title').textContent);

  /* ── report ── */
  const fails = results.filter(r => !r[0]);
  console.log('\n══════════ SMOKE RESULT ══════════');
  results.forEach(([ok, label, extra]) => console.log((ok ? '  ✓ ' : '  ✗ ') + label + (extra ? `  [${extra}]` : '')));
  console.log('══════════════════════════════════');
  console.log(fails.length === 0 ? 'ALL PASSED ✅' : `${fails.length} FAILED ❌`);
  process.exit(fails.length === 0 ? 0 : 1);
})().catch(err => { console.error('TEST CRASH:', err); process.exit(2); });
