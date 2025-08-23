/* =========================================================
   GRID + LEVEL
   ========================================================= */
const COLS = 16, ROWS = 10, GAP = 8;
document.documentElement.style.setProperty('--cols', COLS);
document.documentElement.style.setProperty('--rows', ROWS);
const boardEl = document.getElementById('board');
const gridEl  = document.getElementById('grid');
const wallsEl = document.getElementById('walls');
const coinsEl = document.getElementById('coins');
const marbleEl= document.getElementById('marble');
const endzoneEl = document.getElementById('endzone');
const gateEl = document.getElementById('gate');
const gateTitleEl = gateEl.querySelector('.gate_title');
const gateTextEl = gateEl.querySelector('.gate_text');
const playBtnEl = document.getElementById('playBtn');

let gameState = 'pre-game'; // pre-game, playing, game-over

for (let i = 0; i < COLS*ROWS; i++){
  const c = document.createElement('div');
  c.className = 'cell';
  gridEl.appendChild(c);
}
let metrics = null;
function measure(){
  const rect = gridEl.getBoundingClientRect();
  const boardRect = boardEl.getBoundingClientRect();
  const cw = (rect.width - (COLS-1)*GAP) / COLS;
  const ch = (rect.height - (ROWS-1)*GAP) / ROWS;
  metrics = {
    rect, boardRect, cw, ch,
    originX: rect.left - boardRect.left,
    originY: rect.top - boardRect.top,
    width: rect.width, height: rect.height
  };
  // size marble as 70% of cell
  MARBLE.R = Math.min(cw, ch) * 0.35;
  marbleEl.style.width = (MARBLE.R*2) + 'px';
  marbleEl.style.height= (MARBLE.R*2) + 'px';
  // reposition overlays
  wallsEl.style.inset = coinsEl.style.inset = `0`;
}
measure();
window.addEventListener('resize', measure);
/* Level: 2D array with 0 empty, 1 wall, 2 start, 3 end; keep borders solid */
const level = Array.from({length: ROWS}, (_,r) =>
  Array.from({length: COLS}, (_,c) => (r===0||c===0||r===ROWS-1||c===COLS-1)?1:0)
);

level[ROWS-2][1] = 2; // Start
level[1][COLS-2] = 3; // End

// Add a few interior walls (rect blocks)
function addBlock(r0,c0,rh,ch){
  for (let r=r0; r<r0+rh; r++) for (let c=c0; c<c0+ch; c++){
    if (r>0 && r<ROWS-1 && c>0 && c<COLS-1 && level[r][c] === 0) level[r][c] = 1;
  }
}
// Simple layout: corridors with a few obstacles
addBlock(2, 3, 1, 6);
addBlock(3, 8, 3, 1);
addBlock(6, 4, 1, 7);
addBlock(4, 12, 4, 1);
addBlock(7, 2, 2, 2);
// Render walls
function renderWalls(){
  wallsEl.innerHTML = '';
  for (let r=0; r<ROWS; r++){
    for (let c=0; c<COLS; c++){
      if (level[r][c] === 1){ // Wall
        const wall = document.createElement('div');
        wall.className = 'wall';
        const x = metrics.originX + c*(metrics.cw + GAP);
        const y = metrics.originY + r*(metrics.ch + GAP);
        wall.style.left = x + 'px';
        wall.style.top  = y + 'px';
        wall.style.width = metrics.cw + 'px';
        wall.style.height= metrics.ch + 'px';
        wallsEl.appendChild(wall);
      } else if (level[r][c] === 3){ // End zone
        const x = metrics.originX + c*(metrics.cw + GAP);
        const y = metrics.originY + r*(metrics.ch + GAP);
        endzoneEl.style.left = x + 'px';
        endzoneEl.style.top  = y + 'px';
        endzoneEl.style.width = metrics.cw + 'px';
        endzoneEl.style.height= metrics.ch + 'px';
      }
    }
  }
}
renderWalls();
/* Coins placed on empty tiles */
let coins = [];
function placeCoins(){
  coins = [];
  coinsEl.innerHTML = '';
  const spots = [];
  for (let r=1; r<ROWS-1; r++){
    for (let c=1; c<COLS-1; c++){
      if (level[r][c] === 0) spots.push({r,c});
    }
  }
  // pick 8 spaced coins
  spots.sort(()=>Math.random()-0.5);
  const pick = spots.slice(0, 8);
  for (const s of pick){
    const el = document.createElement('div');
    el.className = 'coin';
    const x = metrics.originX + s.c*(metrics.cw+GAP);
    const y = metrics.originY + s.r*(metrics.ch+GAP);
    el.style.left = x + 'px';
    el.style.top  = y + 'px';
    el.style.width = metrics.cw + 'px';
    el.style.height= metrics.ch + 'px';
    coinsEl.appendChild(el);
    coins.push({r:s.r, c:s.c, el, taken:false});
  }
}
placeCoins();
/* =========================================================
   MARBLE PHYSICS
   ========================================================= */
const MARBLE = {
  x: 0, y: 0, vx: 0, vy: 0, R: 16
};
function resetMarble(){
  let startPos = {r: ROWS-2, c: 1};
  for (let r=0; r<ROWS; r++){
    for (let c=0; c<COLS; c++){
      if (level[r][c] === 2) startPos = {r,c};
    }
  }
  MARBLE.x = metrics.originX + startPos.c*(metrics.cw+GAP) + metrics.cw/2;
  MARBLE.y = metrics.originY + startPos.r*(metrics.ch+GAP) + metrics.ch/2;
  MARBLE.vx = MARBLE.vy = 0;
  drawMarble();
}
function drawMarble(){
  gsap.set(marbleEl, { x: MARBLE.x, y: MARBLE.y });
}
resetMarble();
/* Helpers: tile query */
function worldToRC(x,y){
  const gx = x - metrics.originX;
  const gy = y - metrics.originY;
  const c = Math.floor(gx / (metrics.cw + GAP));
  const r = Math.floor(gy / (metrics.ch + GAP));
  return { r: Math.max(0, Math.min(ROWS-1, r)), c: Math.max(0, Math.min(COLS-1, c)) };
}
function tileRect(r,c){
  return {
    x: metrics.originX + c*(metrics.cw+GAP),
    y: metrics.originY + r*(metrics.ch+GAP),
    w: metrics.cw, h: metrics.ch
  };
}
/* Physics params */
let sensitivity = 1.4; // accel scale
let friction = 0.94;   // per-tick multiplier
const MAX_V = 1400;    // px/s cap
let ax = 0, ay = 0;    // tilt acceleration (px/s^2)
let zero = {alpha:0,beta:0,gamma:0}; // calibration
/* Collision with walls: circle vs AABB tiles around marble */
function collideAndResolve(nx, ny, vx, vy){
  // Predict circle bounds
  const r = MARBLE.R;
  // Check surrounding tiles (±2 tiles is plenty)
  const rc = worldToRC(nx, ny);
  for (let rr = rc.r-2; rr <= rc.r+2; rr++){
    for (let cc = rc.c-2; cc <= rc.c+2; cc++){
      if (rr<0||cc<0||rr>=ROWS||cc>=COLS) continue;
      if (level[rr][cc] !== 1) continue; // Only collide with walls
      const T = tileRect(rr,cc);
      // Find closest point on tile to the circle center
      const cx = Math.max(T.x, Math.min(nx, T.x + T.w));
      const cy = Math.max(T.y, Math.min(ny, T.y + T.h));
      const dx = nx - cx, dy = ny - cy;
      const dist2 = dx*dx + dy*dy;
      if (dist2 < r*r){ // collision
        const dist = Math.sqrt(Math.max(0.0001, dist2));
        // push marble out along normal
        const nxn = dx / dist, nyn = dy / dist;
        const pen = r - dist;
        nx += nxn * pen;
        ny += nyn * pen;
        // reflect velocity
        const dot = vx*nxn + vy*nyn;
        vx = vx - 2*dot*nxn;
        vy = vy - 2*dot*nyn;
        // damp on bounce
        vx *= 0.6; vy *= 0.6;
      }
    }
  }
  return {x:nx, y:ny, vx, vy};
}
/* Coins and Endzone */
const coinCountEl = document.getElementById('coinCount');
function checkGameObjects(){
  const rc = worldToRC(MARBLE.x, MARBLE.y);
  // Coins
  for (const coin of coins){
    if (!coin.taken && coin.r === rc.r && coin.c === rc.c){
      coin.taken = true;
      gsap.to(coin.el, { scale: 0, autoAlpha: 0, duration: 0.25, ease: "back.in(1.4)" });
      updateCoinsUI();
    }
  }
  // End zone
  if (level[rc.r][rc.c] === 3){
    const allCoinsTaken = coins.every(c => c.taken);
    if (allCoinsTaken) endRun(true);
  }
}
function updateCoinsUI(){
  const got = coins.filter(c=>c.taken).length;
  coinCountEl.textContent = `${got}/${coins.length}`;
  if (got === coins.length){
    // Visual cue that endzone is active
    gsap.to(endzoneEl, {
      duration: .5,
      autoAlpha: .75,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut'
    });
  }
}
/* Timer */
let runStart = performance.now();
let finished = false;
const timeEl = document.getElementById('time');
function resetRun(){
  finished = false;
  runStart = performance.now();
  timeEl.textContent = '0.0s';
  gameState = 'playing';
}
function endRun(won){
  finished = true;
  gameState = 'game-over';
  const t = ((performance.now() - runStart)/1000).toFixed(1);
  timeEl.textContent = `${t}s`;
  const msg = won ? `You collected all the coins in ${t}s!` : `Game Over`;
  const title = won ? `You Won!` : `Try Again!`;
  gsap.to(boardEl, { boxShadow: won ? '0 0 40px rgba(124,255,178,.45)' : '0 0 40px rgba(255,107,107,.35)', duration: .4, yoyo: true, repeat: 1 });
  showGate(title, msg, 'Play Again');
}

function showGate(title, text, buttonText){
  gateTitleEl.textContent = title;
  gateTextEl.textContent = text;
  playBtnEl.textContent = buttonText;
  gateEl.hidden = false;
  gsap.fromTo(gateEl, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 });
}

function startGame(){
  gsap.killTweensOf(endzoneEl);
  gsap.set(endzoneEl, { autoAlpha: 0 });
  resetMarble();
  placeCoins();
  updateCoinsUI();
  resetRun();
  gateEl.hidden = true;
}

playBtnEl.addEventListener('click', startGame);

function toast(txt){
  const div = document.createElement('div');
  div.textContent = txt;
  Object.assign(div.style, {
    position:'absolute', left:'50%', top:'10px', transform:'translateX(-50%)',
    background:'#101223', border:'1px solid #2a2d46', padding:'8px 12px', borderRadius:'10px',
    boxShadow:'0 10px 24px rgba(0,0,0,.35)', fontSize:'14px', opacity:'0'
  });
  boardEl.appendChild(div);
  gsap.to(div, { autoAlpha:1, y:8, duration:.2, ease:'power2.out',
    onComplete(){ gsap.to(div, { autoAlpha:0, y:-4, delay:1.3, duration:.25, onComplete(){ div.remove(); } }) }
  });
}
/* Main loop (fixed dt) */
let last = performance.now();
gsap.ticker.add(()=> {
  if (gameState !== 'playing') return;
  const now = performance.now();
  let dt = (now - last)/1000; // seconds
  last = now;
  if (dt > 0.05) dt = 0.05; // avoid spikes
  if (finished) return;
  // Integrate acceleration -> velocity
  MARBLE.vx += ax * dt;
  MARBLE.vy += ay * dt;
  // Cap speed (px/s)
  const v = Math.hypot(MARBLE.vx, MARBLE.vy);
  if (v > MAX_V){ const s = MAX_V / v; MARBLE.vx *= s; MARBLE.vy *= s; }
  // Apply friction
  MARBLE.vx *= friction;
  MARBLE.vy *= friction;
  // Predict position
  let nx = MARBLE.x + MARBLE.vx * dt;
  let ny = MARBLE.y + MARBLE.vy * dt;
  // Keep inside grid bounds (soft bounce)
  const minX = metrics.originX + MARBLE.R, maxX = metrics.originX + metrics.width  - MARBLE.R;
  const minY = metrics.originY + MARBLE.R, maxY = metrics.originY + metrics.height - MARBLE.R;
  if (nx < minX){ nx = minX; MARBLE.vx = -Math.abs(MARBLE.vx)*0.6; }
  if (nx > maxX){ nx = maxX; MARBLE.vx =  Math.abs(MARBLE.vx)*-0.6; }
  if (ny < minY){ ny = minY; MARBLE.vy = -Math.abs(MARBLE.vy)*0.6; }
  if (ny > maxY){ ny = maxY; MARBLE.vy =  Math.abs(MARBLE.vy)*-0.6; }
  // Collide with walls
  const res = collideAndResolve(nx, ny, MARBLE.vx, MARBLE.vy);
  MARBLE.x = res.x; MARBLE.y = res.y; MARBLE.vx = res.vx; MARBLE.vy = res.vy;
  // Render
  drawMarble();
  // Coins & End Zone
  checkGameObjects();
});
/* =========================================================
   INPUTS: Gyro / Mouse drag / Keys
   ========================================================= */
let drag = {active:false, sx:0, sy:0};
const sensEl = document.getElementById('sens'), sensVal = document.getElementById('sensVal');
const fricEl = document.getElementById('fric'), fricVal = document.getElementById('fricVal');
sensEl.addEventListener('input', ()=>{ sensitivity = +sensEl.value; sensVal.textContent = sensitivity.toFixed(1)+'×'; });
fricEl.addEventListener('input', ()=>{ friction = +fricEl.value; fricVal.textContent = friction.toFixed(2); });
/* Desktop drag = tilt */
boardEl.addEventListener('pointerdown', (e)=>{ drag.active = true; drag.sx = e.clientX; drag.sy = e.clientY; });
window.addEventListener('pointermove', (e)=>{
  if (!drag.active || gameState !== 'playing') return;
  const dx = (e.clientX - drag.sx), dy = (e.clientY - drag.sy);
  ax =  900 * (dx / window.innerWidth) * sensitivity;
  ay =  900 * (dy / window.innerHeight) * sensitivity;
});
window.addEventListener('pointerup', ()=>{ drag.active = false; });
/* Keyboard tilt */
const keys = new Set();
window.addEventListener('keydown', (e)=>{
  const k = e.key.toLowerCase();
  if (['arrowleft','a','arrowright','d','arrowup','w','arrowdown','s'].includes(k)) keys.add(k);
});
window.addEventListener('keyup', (e)=>{ keys.delete(e.key.toLowerCase()); });
function pollKeys(){
  if (gameState === 'playing'){
    let tx = 0, ty = 0, k = keys;
    if (k.has('arrowleft') || k.has('a')) tx -= 1;
    if (k.has('arrowright')|| k.has('d')) tx += 1;
    if (k.has('arrowup')   || k.has('w')) ty -= 1;
    if (k.has('arrowdown') || k.has('s')) ty += 1;
    if (tx || ty){
      const mag = 1000 * sensitivity;
      ax = tx * mag;
      ay = ty * mag;
    }
  }
  requestAnimationFrame(pollKeys);
}
pollKeys();
/* Gyro / device motion */
const gate = document.getElementById('motionGate');
const enableBtn = document.getElementById('enableMotion');
function hasiOSPermissionAPI(){
  return typeof DeviceMotionEvent !== 'undefined' &&
         typeof DeviceMotionEvent.requestPermission === 'function';
}
async function enableMotion(){
  try{
    if (hasiOSPermissionAPI()){
      const res = await DeviceMotionEvent.requestPermission();
      if (res !== 'granted') { toast('Motion permission denied'); return; }
    }
    startMotion();
    gate.hidden = true;
  }catch(e){ console.warn(e); toast('Motion unavailable'); }
}
enableBtn.addEventListener('click', enableMotion);
// Show gate on mobile/iOS; try silently otherwise
(function tryMotionGate(){
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (hasiOSPermissionAPI() && isTouch){ gate.hidden = false; }
  else { startMotion(); }
})();
let useOrientation = false;
function startMotion(){
  // Prefer DeviceMotion (acceleration including gravity) -> compute tilt
  if ('DeviceOrientationEvent' in window){
    useOrientation = true;
    window.addEventListener('deviceorientation', handleOrientation, true);
  }
  if ('DeviceMotionEvent' in window){
    window.addEventListener('devicemotion', handleMotion, true);
  }
}
function handleOrientation(ev){
  // beta (front-back), gamma (left-right), alpha (compass)
  const beta  = (ev.beta  || 0) - zero.beta;
  const gamma = (ev.gamma || 0) - zero.gamma;
  // Map degrees to px/s^2; tune constants:
  const K = 25 * sensitivity; // base accel per deg
  ax =  K * (gamma / 10) * 100; // left/right tilt
  ay =  K * (beta  / 10) * 100; // forward/back tilt
}
function handleMotion(ev){
  // Some devices provide accelerationIncludingGravity
  const g = ev.accelerationIncludingGravity;
  if (!g) return;
  // Normalize to portrait up; values are m/s^2 ~= 9.81g
  const K = 80 * sensitivity;
  ax = K * (g.x || 0);
  ay = K * (g.y || 0);
}
/* Calibration = set current orientation as zero */
document.getElementById('calibrate').addEventListener('click', ()=>{
  zero = {alpha:0,beta:0,gamma:0};
  // Take last known orientation if available
  // (We can't read it here directly without event; this simply recentres by freezing current ax/ay)
  ax = 0; ay = 0;
  toast('Calibrated');
});
/* Reset */
document.getElementById('reset').addEventListener('click', ()=>{
  resetMarble();
  placeCoins();
  updateCoinsUI();
  resetRun();
});
/* =========================================================
   UX polish
   ========================================================= */
function wiggleBall(){
  const tilt = Math.min(1, Math.hypot(ax,ay)/1500);
  gsap.to(marbleEl.querySelector('.ball'), {
    duration: 0.12,
    xPercent: gsap.utils.clamp(-6, 6, (ax/1200)*10),
    yPercent: gsap.utils.clamp(-6, 6, (ay/1200)*10),
    ease: 'power2.out'
  });
}
gsap.ticker.add(wiggleBall);
// Start the run timer UI
(function tickTime(){
  if (!finished && gameState === 'playing'){
    const t = ((performance.now() - runStart)/1000).toFixed(1);
    timeEl.textContent = `${t}s`;
  }
  requestAnimationFrame(tickTime);
})();

showGate('GSAP Marble Game', 'Use your mouse or device tilt to navigate the maze, collect all the coins and get to the end zone.', 'Start Game');
