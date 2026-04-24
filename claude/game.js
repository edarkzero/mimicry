// Enemyskin: Last Shape Standing — prototype
// Single-file game module. See index.html for DOM structure.

// ---------- canvas & viewport ----------
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let VW = 0, VH = 0;
function resize() {
  VW = canvas.width = window.innerWidth;
  VH = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// ---------- input detection ----------
const isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
if (isTouch) {
  document.getElementById('mobile-ui').classList.remove('hidden');
  document.getElementById('help-panel').classList.add('hidden');
}

// ---------- archetype definitions ----------
// Stat profiles are intentionally distinct so forms feel meaningfully different.
const ARCHETYPES = {
  human:    { color: '#f0d8b0', label: 'Human Shell', hp: 80,  str: 10, agi: 1.0, mob: 190, jump: 200, def: 4, parryBias: 0.5, ability: 'focus' },
  duelist:  { color: '#cfe88a', label: 'Duelist',     hp: 70,  str: 12, agi: 1.15, mob: 200, jump: 200, def: 4, parryBias: 0.85, ability: 'riposte' },
  brute:    { color: '#a8554e', label: 'Brute',       hp: 160, str: 22, agi: 0.6,  mob: 115, jump: 130, def: 9, parryBias: 0.15, ability: 'slam' },
  stalker:  { color: '#ff8a3d', label: 'Stalker',     hp: 65,  str: 13, agi: 1.4,  mob: 250, jump: 220, def: 3, parryBias: 0.35, ability: 'rend' },
  hopper:   { color: '#8fd0ff', label: 'Hopper',      hp: 75,  str: 11, agi: 1.1,  mob: 170, jump: 420, def: 3, parryBias: 0.3,  ability: 'pounce' },
  shade:    { color: '#c08aff', label: 'Shade',       hp: 55,  str: 14, agi: 1.5,  mob: 210, jump: 280, def: 2, parryBias: 0.5,  ability: 'blink' },
  sentinel: { color: '#d6d8e0', label: 'Sentinel',    hp: 200, str: 13, agi: 0.7,  mob: 130, jump: 140, def: 14, parryBias: 0.55, ability: 'bulwark' },
};
const ENEMY_POOL = ['duelist','brute','stalker','hopper','shade','sentinel'];

// ---------- world ----------
const WORLD = {
  // Expanding bounds. Start square around origin.
  minX: -1500, maxX: 1500, minY: -1500, maxY: 1500,
  expandMargin: 400,   // if player gets this close to a bound, expand it
  expandStep: 1500,
};

function maybeExpandWorld(p) {
  // Keep expanding outward so the player never hits a wall. (Tweak #5)
  if (p.x - WORLD.minX < WORLD.expandMargin) WORLD.minX -= WORLD.expandStep;
  if (WORLD.maxX - p.x < WORLD.expandMargin) WORLD.maxX += WORLD.expandStep;
  if (p.y - WORLD.minY < WORLD.expandMargin) WORLD.minY -= WORLD.expandStep;
  if (WORLD.maxY - p.y < WORLD.expandMargin) WORLD.maxY += WORLD.expandStep;
}

// ---------- state ----------
let entities = [];      // all creatures (player + enemies)
let pickups = [];
let floatingTexts = [];
let particles = [];
let combatLog = [];
let player = null;

let wave = 1;
let threat = 1;
let timeSinceLastPickup = 0;
let nextPickupIn = randRange(30, 120);
let waveCooldown = 0;
let gameOver = false;

// ---------- utility ----------
function rand(a, b) { return a + Math.random() * (b - a); }
function randRange(a, b) { return a + Math.random() * (b - a); }
function randInt(a, b) { return Math.floor(a + Math.random() * (b - a + 1)); }
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function dist2(ax, ay, bx, by) { const dx=ax-bx, dy=ay-by; return dx*dx+dy*dy; }
function dist(ax, ay, bx, by) { return Math.sqrt(dist2(ax,ay,bx,by)); }
function angleTo(ax, ay, bx, by) { return Math.atan2(by-ay, bx-ax); }
function pick(arr) { return arr[Math.floor(Math.random()*arr.length)]; }

function log(msg, tone='') {
  combatLog.push({ msg, tone, t: 0 });
  if (combatLog.length > 6) combatLog.shift();
  renderLog();
}
function renderLog() {
  const el = document.getElementById('combat-log');
  el.innerHTML = combatLog.map((e,i)=>{
    const cls = i < combatLog.length-3 ? 'fade' : '';
    const col = e.tone === 'good' ? '#8ee27a' : e.tone === 'bad' ? '#ff8a6b' : e.tone === 'neutral' ? '#ffd46b' : '';
    return `<div class="log-entry ${cls}" style="${col?'color:'+col:''}">${e.msg}</div>`;
  }).join('');
}

// ---------- entity factory ----------
function makeEntity(archetype, x, y, team, scale=1) {
  const a = ARCHETYPES[archetype];
  const hp = Math.round(a.hp * scale);
  const str = a.str * scale;
  const def = a.def * scale;
  return {
    team, archetype,
    label: a.label, color: a.color,
    x, y,
    r: archetype === 'brute' ? 22 : archetype === 'sentinel' ? 21 : archetype === 'shade' ? 14 : 16,
    hp, maxHp: hp,
    energy: 100, maxEnergy: 100,
    strength: str,
    agility: a.agi,
    mobility: a.mob,
    jumpPower: a.jump,
    defense: def,
    parryBias: a.parryBias,
    ability: a.ability,
    abilityCd: 0,
    facing: 0,
    vx: 0, vy: 0,
    state: 'idle',     // idle | windup | swing | block | parry | evade | morph | stun | dash
    stateT: 0,
    swingArc: 0,       // weapon angle animation
    hitFlash: 0,
    hitIds: new Set(), // who's already been hit by the current swing
    parryCd: 0,
    evadeCd: 0,
    attackCd: 0,
    blockHeld: false,
    morphToIdx: -1,
    morphTimer: 0,
    dashVx: 0, dashVy: 0, dashT: 0,
    iFrames: 0,
    aiThink: 0,
    targetId: null,
    id: nextId(),
  };
}
let _id = 0;
function nextId() { return ++_id; }

function makePlayer() {
  const e = makeEntity('human', 0, 0, 'player', 1);
  e.forms = [{ archetype: 'human', hp: e.maxHp, str: e.strength, agi: e.agility, mob: e.mobility, jump: e.jumpPower, def: e.defense, label: ARCHETYPES.human.label, color: ARCHETYPES.human.color, ability: 'focus' }];
  e.formIdx = 0;
  e.sprint = false;
  return e;
}

// ---------- input ----------
const keys = Object.create(null);
window.addEventListener('keydown', (ev) => {
  keys[ev.code] = true;
  if (ev.code === 'Tab') ev.preventDefault();
  if (ev.code === 'Space') ev.preventDefault();
  if (ev.code === 'KeyQ' || ev.code === 'Tab') cycleForm();
  if (ev.code === 'KeyE') tryParry(player);
  if (ev.code === 'KeyF') tryEvade(player);
});
window.addEventListener('keyup', (ev) => { keys[ev.code] = false; });

const mouse = { x: VW/2, y: VH/2, downL: false, downR: false };
canvas.addEventListener('mousemove', (ev) => {
  const r = canvas.getBoundingClientRect();
  mouse.x = ev.clientX - r.left;
  mouse.y = ev.clientY - r.top;
});
canvas.addEventListener('mousedown', (ev) => {
  if (ev.button === 0) mouse.downL = true;
  if (ev.button === 2) { mouse.downR = true; tryParry(player); }
});
canvas.addEventListener('mouseup', (ev) => {
  if (ev.button === 0) mouse.downL = false;
  if (ev.button === 2) mouse.downR = false;
});
canvas.addEventListener('contextmenu', (ev) => ev.preventDefault());

// Mobile controls (Tweak #6)
const touch = { mx: 0, my: 0, mActive: false, attack: false, block: false, parry: false, evade: false, sprint: false };
function setupMobile() {
  const joy = document.getElementById('joystick');
  const stick = document.getElementById('joy-stick');
  let joyId = null, cx = 0, cy = 0;
  joy.addEventListener('pointerdown', (ev) => {
    joyId = ev.pointerId;
    const r = joy.getBoundingClientRect();
    cx = r.left + r.width/2;
    cy = r.top + r.height/2;
    joy.setPointerCapture(ev.pointerId);
    updateStick(ev);
  });
  joy.addEventListener('pointermove', (ev) => {
    if (ev.pointerId !== joyId) return;
    updateStick(ev);
  });
  const end = (ev) => {
    if (ev.pointerId !== joyId) return;
    joyId = null;
    touch.mActive = false;
    touch.mx = touch.my = 0;
    stick.style.transform = 'translate(0, 0)';
  };
  joy.addEventListener('pointerup', end);
  joy.addEventListener('pointercancel', end);

  function updateStick(ev) {
    const dx = ev.clientX - cx;
    const dy = ev.clientY - cy;
    const d = Math.sqrt(dx*dx + dy*dy);
    const max = 50;
    const clampedD = Math.min(d, max);
    const nx = d > 0 ? dx / d : 0;
    const ny = d > 0 ? dy / d : 0;
    stick.style.transform = `translate(${nx*clampedD}px, ${ny*clampedD}px)`;
    touch.mActive = d > 10;
    touch.mx = nx * (clampedD / max);
    touch.my = ny * (clampedD / max);
  }

  document.querySelectorAll('.m-btn').forEach(btn => {
    const act = btn.dataset.act;
    btn.addEventListener('pointerdown', (ev) => {
      ev.preventDefault();
      btn.classList.add('active');
      btn.setPointerCapture(ev.pointerId);
      if (act === 'attack') touch.attack = true;
      if (act === 'block') touch.block = true;
      if (act === 'parry') { touch.parry = true; tryParry(player); }
      if (act === 'evade') { touch.evade = true; tryEvade(player); }
      if (act === 'sprint') touch.sprint = true;
      if (act === 'morph') cycleForm();
    });
    const up = (ev) => {
      btn.classList.remove('active');
      if (act === 'attack') touch.attack = false;
      if (act === 'block') touch.block = false;
      if (act === 'parry') touch.parry = false;
      if (act === 'evade') touch.evade = false;
      if (act === 'sprint') touch.sprint = false;
    };
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);
    btn.addEventListener('pointerleave', up);
  });
}
if (isTouch) setupMobile();

// ---------- help + restart wiring ----------
document.getElementById('help-close').addEventListener('click', () => {
  document.getElementById('help-panel').classList.add('hidden');
});
document.getElementById('restart-btn').addEventListener('click', () => {
  resetRun();
});

// ---------- combat actions ----------
function tryAttack(e) {
  if (e.state !== 'idle' && e.state !== 'dash') return;
  if (e.attackCd > 0) return;
  e.state = 'windup';
  e.stateT = 0.18 / e.agility;  // telegraph
  e.hitIds.clear();
}

function tryBlock(e, held) {
  if (held) {
    if (e.state === 'idle' && e.energy > 5) { e.state = 'block'; e.blockHeld = true; }
    else if (e.state === 'block') e.blockHeld = true;
  } else if (e.state === 'block') {
    e.state = 'idle';
    e.blockHeld = false;
  }
}

function tryParry(e) {
  if (!e) return;
  if (e.state !== 'idle' && e.state !== 'block') return;
  if (e.parryCd > 0) return;
  // Parry is a timed window; cost is only paid on success (Tweak #2).
  e.state = 'parry';
  e.stateT = 0.35;
  e.parryCd = 0.8;
}

function tryEvade(e) {
  if (!e) return;
  if (e.state === 'evade' || e.state === 'morph') return;
  if (e.evadeCd > 0) return;
  // Evade costs 50% of max energy upfront. (Tweak #2)
  const cost = e.maxEnergy * 0.5;
  if (e.energy < cost) return;
  e.energy -= cost;
  e.state = 'evade';
  e.stateT = 0.32;
  e.iFrames = 0.22;
  e.evadeCd = 0.8;
  // dash in move direction (or facing if stationary)
  let ax, ay;
  if (e.team === 'player') {
    const md = playerMoveDir();
    if (md.x || md.y) { ax = md.x; ay = md.y; }
    else { ax = Math.cos(e.facing); ay = Math.sin(e.facing); }
  } else {
    ax = Math.cos(e.facing + Math.PI);
    ay = Math.sin(e.facing + Math.PI);
  }
  e.dashVx = ax * (320 + e.mobility * 0.6);
  e.dashVy = ay * (320 + e.mobility * 0.6);
}

function cycleForm() {
  if (!player || player.state === 'morph') return;
  if (player.forms.length < 2) return;
  const next = (player.formIdx + 1) % player.forms.length;
  if (next === player.formIdx) return;
  player.morphToIdx = next;
  player.morphTimer = 0.9;  // vulnerable animation length
  player.state = 'morph';
  player.stateT = 0.9;
  log(`Morphing into ${player.forms[next].label}…`, 'neutral');
}

function applyForm(p, idx) {
  const f = p.forms[idx];
  const ratioHp = p.hp / p.maxHp;
  const ratioEn = p.energy / p.maxEnergy;
  p.archetype = f.archetype;
  p.label = f.label;
  p.color = f.color;
  p.maxHp = f.hp;
  p.hp = Math.max(1, Math.round(f.hp * ratioHp));
  p.strength = f.str;
  p.agility = f.agi;
  p.mobility = f.mob;
  p.jumpPower = f.jump;
  p.defense = f.def;
  p.ability = f.ability;
  p.maxEnergy = 100;
  p.energy = p.maxEnergy * ratioEn;
  p.r = ARCHETYPES[f.archetype] ? (f.archetype === 'brute' ? 22 : f.archetype === 'sentinel' ? 21 : f.archetype === 'shade' ? 14 : 16) : 16;
  p.formIdx = idx;
  log(`Now: ${f.label}`, 'good');
}

// ---------- damage resolution ----------
function dealDamage(attacker, defender) {
  if (!defender || defender.hp <= 0) return;

  // iFrames (during evade, morph start-up)
  if (defender.iFrames > 0) {
    spawnText(defender.x, defender.y - defender.r, 'miss', '#aaa');
    return;
  }

  // Parry window: successful parry stuns attacker and punishes.
  if (defender.state === 'parry' && defender.stateT > 0) {
    const parryCost = defender.maxEnergy * 0.2; // 20% on successful parry (Tweak #2)
    if (defender.energy >= parryCost) {
      defender.energy -= parryCost;
      attacker.state = 'stun';
      attacker.stateT = 0.7;
      attacker.attackCd = 0.5;
      spawnText(defender.x, defender.y - defender.r, 'PARRY!', '#ffd46b');
      log(`${ownName(defender)} parried ${ownName(attacker)}!`, defender.team === 'player' ? 'good' : 'bad');
      spawnParticles(defender.x, defender.y, '#ffd46b', 14);
      // punish: small riposte damage
      const punish = Math.max(1, defender.strength * 0.6 - attacker.defense * 0.3);
      attacker.hp -= punish;
      attacker.hitFlash = 0.18;
      spawnText(attacker.x, attacker.y - attacker.r, Math.round(punish), '#8ee27a');
      if (attacker.hp <= 0) kill(attacker, defender);
      return;
    }
    // not enough energy to parry: fall through as ordinary hit
    spawnText(defender.x, defender.y - defender.r - 10, 'no energy', '#9aa3b8');
  }

  let dmg = Math.max(1, attacker.strength - defender.defense * 0.5);
  let blocked = false;

  // Block: reduces damage, but each blocked hit costs 30% + attacker.strength as a percent. (Tweak #2)
  if (defender.state === 'block') {
    const cost = defender.maxEnergy * 0.30 + attacker.strength;
    if (defender.energy >= cost) {
      defender.energy -= cost;
      dmg *= 0.25;
      blocked = true;
      spawnText(defender.x, defender.y - defender.r, 'BLOCK', '#3fcf6b');
      spawnParticles(defender.x, defender.y, '#3fcf6b', 6);
    } else {
      // energy broken: block fails, stagger briefly
      defender.state = 'stun';
      defender.stateT = 0.4;
      defender.blockHeld = false;
      spawnText(defender.x, defender.y - defender.r, 'guard broken', '#ff8a6b');
    }
  }

  defender.hp -= dmg;
  defender.hitFlash = 0.18;
  spawnText(defender.x, defender.y - defender.r, Math.round(dmg), blocked ? '#c9cfe0' : '#ff8a6b');
  spawnParticles(defender.x, defender.y, blocked ? '#6cd3ff' : '#ff8a6b', blocked ? 4 : 8);

  // Knockback a little
  const ang = angleTo(attacker.x, attacker.y, defender.x, defender.y);
  defender.vx += Math.cos(ang) * (blocked ? 40 : 120);
  defender.vy += Math.sin(ang) * (blocked ? 40 : 120);

  if (defender.hp <= 0) kill(defender, attacker);
}

function kill(dead, killer) {
  dead.hp = 0;
  spawnParticles(dead.x, dead.y, dead.color, 22);

  if (dead.team === 'player') {
    onPlayerDeath();
    return;
  }

  log(`${ownName(killer)} killed a ${dead.label}.`, killer && killer.team === 'player' ? 'good' : 'bad');

  // Player captures the defeated enemy's essence.
  if (killer && killer === player) {
    if (!player.forms.find(f => f.archetype === dead.archetype)) {
      const a = ARCHETYPES[dead.archetype];
      player.forms.push({
        archetype: dead.archetype,
        hp: a.hp, str: a.str, agi: a.agi, mob: a.mob, jump: a.jump, def: a.def,
        label: a.label, color: a.color, ability: a.ability,
      });
      log(`Captured essence: ${dead.label} (press Q/Tab to morph)`, 'good');
    }
  }
}

function ownName(e) {
  if (!e) return 'Something';
  return e === player ? 'You' : e.label;
}

// ---------- hit detection for swings ----------
function updateSwing(e, dt) {
  if (e.state === 'windup') {
    e.stateT -= dt;
    e.swingArc = -0.7; // ready position
    if (e.stateT <= 0) {
      e.state = 'swing';
      e.stateT = 0.16 / e.agility;
      e.hitIds.clear();
    }
  }
  if (e.state === 'swing') {
    e.stateT -= dt;
    e.swingArc += dt * 12 * e.agility;
    // Deal damage to anything in the arc we haven't hit yet.
    // Players never hit other players. Enemies can hit the player and other enemies of a different species.
    const reach = e.r + 34;
    for (const t of entities) {
      if (t === e || t.hp <= 0) continue;
      if (e.team === 'player' && t.team === 'player') continue;
      if (e.team === 'enemy' && t.team === 'enemy' && t.archetype === e.archetype) continue;
      if (e.hitIds.has(t.id)) continue;
      const d = dist(e.x, e.y, t.x, t.y);
      if (d > reach + t.r) continue;
      const ang = angleTo(e.x, e.y, t.x, t.y);
      const diff = Math.atan2(Math.sin(ang - e.facing), Math.cos(ang - e.facing));
      if (Math.abs(diff) < 0.9) {
        e.hitIds.add(t.id);
        dealDamage(e, t);
      }
    }
    if (e.stateT <= 0) {
      e.state = 'idle';
      e.attackCd = 0.5 / e.agility;
      e.swingArc = 0;
    }
  }
}

// ---------- AI ----------
// Enemies pick the nearest valid combat target, which may be the player OR another enemy. (Tweak #1)
function pickNearestTarget(e) {
  let best = null, bestD = Infinity;
  for (const o of entities) {
    if (o === e || o.hp <= 0) continue;
    // Enemies prefer the player strongly but will attack nearer enemies too.
    if (o.team === e.team) continue;
    // Allow friendly-fire between enemies only when they're actually nearby, so the map doesn't devolve into pure infighting.
    const d2 = dist2(e.x, e.y, o.x, o.y);
    let score = d2;
    if (o === player) score *= 0.6;      // slight bias toward the player
    if (score < bestD) { bestD = score; best = o; }
  }
  // Also let enemies notice other enemies that are very close (within ~240px) even if the player is far.
  for (const o of entities) {
    if (o === e || o.hp <= 0) continue;
    if (o.team !== 'enemy') continue;
    if (o === e) continue;
    if (o.archetype === e.archetype) continue; // same species ignores each other
    const d2 = dist2(e.x, e.y, o.x, o.y);
    if (d2 < 240*240 && d2 * 0.7 < bestD) { bestD = d2 * 0.7; best = o; }
  }
  return best;
}

function updateAI(e, dt) {
  if (e.team !== 'enemy' || e.hp <= 0) return;
  e.aiThink -= dt;
  if (e.aiThink <= 0) {
    e.target = pickNearestTarget(e);
    e.aiThink = rand(0.25, 0.55);
  }
  const tgt = e.target;
  if (!tgt || tgt.hp <= 0) return;
  const d = dist(e.x, e.y, tgt.x, tgt.y);
  e.facing = angleTo(e.x, e.y, tgt.x, tgt.y);

  // Movement: approach until in range; strafe if too close.
  const idealRange = e.r + tgt.r + 26;
  let mvx = 0, mvy = 0;
  if (e.state === 'idle' || e.state === 'block') {
    if (d > idealRange + 8) {
      mvx = Math.cos(e.facing);
      mvy = Math.sin(e.facing);
    } else if (d < idealRange - 16) {
      mvx = -Math.cos(e.facing);
      mvy = -Math.sin(e.facing);
    } else {
      // orbit a bit so they aren't sitting targets
      mvx = Math.cos(e.facing + Math.PI/2) * 0.5;
      mvy = Math.sin(e.facing + Math.PI/2) * 0.5;
    }
    const speed = e.mobility * (e.state === 'block' ? 0.35 : 1.0);
    e.vx = mvx * speed;
    e.vy = mvy * speed;
  }

  // Decision making.
  if (d < idealRange + 10 && e.state === 'idle' && e.attackCd <= 0) {
    // Pick an offensive action.
    tryAttack(e);
  }
  // Reactive defense: when a hostile is mid-swing close, sometimes parry/block/evade.
  if (e.state === 'idle' && d < idealRange + 40) {
    if (tgt.state === 'swing' || tgt.state === 'windup') {
      const roll = Math.random();
      if (roll < e.parryBias * 0.55 && e.parryCd <= 0) {
        tryParry(e);
      } else if (roll < 0.5 && e.energy > e.maxEnergy * 0.5) {
        tryEvade(e);
      } else if (roll < 0.75) {
        e.state = 'block';
        e.blockHeld = true;
      }
    }
  } else if (e.state === 'block' && tgt.state !== 'swing' && tgt.state !== 'windup') {
    // stop blocking when danger passes
    if (Math.random() < 0.04) { e.state = 'idle'; e.blockHeld = false; }
  }

  // Recovery behavior.
  if (e.hp < e.maxHp * 0.4 && e.energy > 55 && e.evadeCd <= 0 && Math.random() < 0.01) {
    tryEvade(e);
  }
}

// ---------- player movement input ----------
function playerMoveDir() {
  let mx = 0, my = 0;
  if (isTouch && touch.mActive) {
    mx = touch.mx; my = touch.my;
  } else {
    if (keys['KeyW'] || keys['ArrowUp']) my -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) my += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) mx -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) mx += 1;
  }
  const m = Math.sqrt(mx*mx + my*my);
  if (m > 0) { mx /= m; my /= m; }
  return { x: mx, y: my };
}

// ---------- pickups (Tweak #4) ----------
function trySpawnPickup(dt) {
  timeSinceLastPickup += dt;
  if (timeSinceLastPickup < nextPickupIn) return;
  // Try up to 12 times to find a spot away from other pickups and entities.
  for (let attempt = 0; attempt < 12; attempt++) {
    const ang = Math.random() * Math.PI * 2;
    const r = rand(220, 650);
    const x = player.x + Math.cos(ang) * r;
    const y = player.y + Math.sin(ang) * r;
    if (x < WORLD.minX + 80 || x > WORLD.maxX - 80) continue;
    if (y < WORLD.minY + 80 || y > WORLD.maxY - 80) continue;
    let ok = true;
    for (const p of pickups) {
      if (dist2(x, y, p.x, p.y) < 320*320) { ok = false; break; }
    }
    if (!ok) continue;
    for (const e of entities) {
      if (e.hp <= 0) continue;
      if (dist2(x, y, e.x, e.y) < 200*200) { ok = false; break; }
    }
    if (!ok) continue;

    const type = pick(['life','energy','both']);
    pickups.push({ x, y, type, bob: Math.random() * Math.PI * 2, life: 45 }); // despawns after 45s if not picked
    timeSinceLastPickup = 0;
    nextPickupIn = rand(30, 120); // 30–120s between drops
    log(`A ${type === 'both' ? 'mixed' : type} cache materialized.`, 'neutral');
    return;
  }
  // no valid spot; try again next second
  timeSinceLastPickup = nextPickupIn - 1;
}

function applyPickup(p) {
  if (p.type === 'life' || p.type === 'both') {
    const amt = p.type === 'both' ? player.maxHp * 0.35 : player.maxHp * 0.55;
    player.hp = Math.min(player.maxHp, player.hp + amt);
  }
  if (p.type === 'energy' || p.type === 'both') {
    const amt = p.type === 'both' ? 50 : 80;
    player.energy = Math.min(player.maxEnergy, player.energy + amt);
  }
  spawnParticles(p.x, p.y, p.type === 'life' ? '#3fcf6b' : p.type === 'energy' ? '#6cd3ff' : '#ffd46b', 16);
  log(`Picked up ${p.type}.`, 'good');
}

// ---------- waves & scaling ----------
function spawnWave(extra = 0) {
  const count = 2 + Math.min(8, Math.floor(wave * 0.5)) + extra;
  const scale = 1 + (threat - 1) * 0.12 + (player ? (player.forms.length - 1) * 0.08 : 0);
  for (let i = 0; i < count; i++) {
    const arche = pick(ENEMY_POOL);
    const ang = Math.random() * Math.PI * 2;
    const dist = rand(550, 900);
    const x = player.x + Math.cos(ang) * dist;
    const y = player.y + Math.sin(ang) * dist;
    entities.push(makeEntity(arche, x, y, 'enemy', scale));
  }
  log(`Wave ${wave} — threat ${threat}. ${count} enemies incoming.`, 'bad');
}

function checkWaveClear(dt) {
  const enemiesAlive = entities.some(e => e.team === 'enemy' && e.hp > 0);
  if (!enemiesAlive) {
    if (waveCooldown <= 0) waveCooldown = 2.5;
    waveCooldown -= dt;
    if (waveCooldown <= 0) {
      entities = entities.filter(e => e.hp > 0);
      wave += 1;
      threat += 1;
      spawnWave();
      waveCooldown = 999; // reset until next clear
    }
  } else {
    waveCooldown = 0;
  }
}

// ---------- player death / reset ----------
function onPlayerDeath() {
  gameOver = true;
  document.getElementById('death-wave').textContent = wave;
  document.getElementById('death-forms').textContent = (player.forms.length - 1);
  document.getElementById('death-overlay').classList.remove('hidden');
}

function resetRun() {
  entities = [];
  pickups = [];
  floatingTexts = [];
  particles = [];
  combatLog = [];
  wave = 1;
  threat = 1;
  timeSinceLastPickup = 0;
  nextPickupIn = rand(30, 120);
  waveCooldown = 0;
  gameOver = false;
  WORLD.minX = -1500; WORLD.maxX = 1500; WORLD.minY = -1500; WORLD.maxY = 1500;
  player = makePlayer();
  entities.push(player);
  spawnWave();
  document.getElementById('death-overlay').classList.add('hidden');
  log('A new shape takes form.', 'neutral');
}

// ---------- particles & floating text ----------
function spawnParticles(x, y, color, n) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = rand(60, 220);
    particles.push({ x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s, t: rand(0.3, 0.6), color, size: rand(2, 4) });
  }
}
function spawnText(x, y, text, color) {
  floatingTexts.push({ x, y, text: String(text), color, t: 0.9, vy: -40 });
}

// ---------- per-entity tick ----------
function stepEntity(e, dt) {
  if (e.hp <= 0) return;

  // Timers
  e.hitFlash = Math.max(0, e.hitFlash - dt);
  e.parryCd = Math.max(0, e.parryCd - dt);
  e.evadeCd = Math.max(0, e.evadeCd - dt);
  e.attackCd = Math.max(0, e.attackCd - dt);
  e.iFrames = Math.max(0, e.iFrames - dt);
  e.abilityCd = Math.max(0, e.abilityCd - dt);

  // State machines
  if (e.state === 'evade') {
    e.stateT -= dt;
    // dash drift
    e.x += e.dashVx * dt;
    e.y += e.dashVy * dt;
    e.dashVx *= 0.9; e.dashVy *= 0.9;
    if (e.stateT <= 0) { e.state = 'idle'; }
  } else if (e.state === 'morph') {
    e.stateT -= dt;
    e.morphTimer = e.stateT;
    // Vulnerable: no iFrames. Slow movement.
    if (e.stateT <= 0) {
      if (e === player && player.morphToIdx >= 0) {
        applyForm(player, player.morphToIdx);
        player.morphToIdx = -1;
      }
      e.state = 'idle';
    }
  } else if (e.state === 'stun') {
    e.stateT -= dt;
    if (e.stateT <= 0) e.state = 'idle';
  } else if (e.state === 'windup' || e.state === 'swing') {
    updateSwing(e, dt);
  } else if (e.state === 'parry') {
    e.stateT -= dt;
    if (e.stateT <= 0) e.state = 'idle';
  } else if (e.state === 'block') {
    // Held as long as blockHeld; drains a trickle of energy so holding forever isn't free.
    e.energy = Math.max(0, e.energy - 4 * dt);
    if (!e.blockHeld) e.state = 'idle';
    if (e.energy <= 0) { e.state = 'stun'; e.stateT = 0.4; e.blockHeld = false; }
  }

  // Passive energy regen when not spending it.
  if (e.state === 'idle' || e.state === 'stun') {
    e.energy = Math.min(e.maxEnergy, e.energy + 18 * dt);
  }
  if (e.state === 'parry' || e.state === 'evade') {
    // no regen
  }

  // Apply movement
  if (e === player) {
    handlePlayerMovement(dt);
  } else {
    // apply enemy velocity (mild friction for knockback)
    if (e.state !== 'evade') {
      e.x += e.vx * dt;
      e.y += e.vy * dt;
      e.vx *= 0.88; e.vy *= 0.88;
    }
  }

  // Clamp to world bounds.
  e.x = clamp(e.x, WORLD.minX + e.r, WORLD.maxX - e.r);
  e.y = clamp(e.y, WORLD.minY + e.r, WORLD.maxY - e.r);
}

function handlePlayerMovement(dt) {
  const p = player;
  // During morph, movement is slow. During swing, slower. During evade, dash velocity already applied.
  if (p.state === 'evade') return;
  const dir = playerMoveDir();
  let mul = 1.0;
  if (p.state === 'morph') mul = 0.4;
  if (p.state === 'windup' || p.state === 'swing') mul = 0.45;
  if (p.state === 'block') mul = 0.55;

  // Sprint (Tweak #3): C or Ctrl, or the mobile sprint button.
  const sprint = (keys['KeyC'] || keys['ControlLeft'] || keys['ControlRight'] || touch.sprint);
  if (sprint && p.energy > 0 && (dir.x || dir.y) && p.state === 'idle') {
    mul *= 1.55;
    p.energy = Math.max(0, p.energy - 10 * dt);
    p.sprint = true;
  } else {
    p.sprint = false;
  }

  const speed = p.mobility * mul;
  p.x += dir.x * speed * dt;
  p.y += dir.y * speed * dt;

  // Facing: follow mouse on desktop, follow movement on mobile.
  if (!isTouch) {
    const wx = mouse.x + cam.x - VW/2;
    const wy = mouse.y + cam.y - VH/2;
    p.facing = angleTo(p.x, p.y, wx, wy);
  } else if (dir.x || dir.y) {
    p.facing = Math.atan2(dir.y, dir.x);
  }

  // Input-driven combat
  const wantAttack = (mouse.downL || keys['Space'] || touch.attack);
  const wantBlock  = (keys['ShiftLeft'] || keys['ShiftRight'] || touch.block);
  if (wantAttack) tryAttack(p);
  tryBlock(p, wantBlock);

  maybeExpandWorld(p);
}

// ---------- rendering ----------
const cam = { x: 0, y: 0 };
function updateCamera() {
  if (!player) return;
  cam.x += (player.x - cam.x) * 0.12;
  cam.y += (player.y - cam.y) * 0.12;
}

function render() {
  ctx.fillStyle = '#0a0b12';
  ctx.fillRect(0, 0, VW, VH);

  // Grid floor
  ctx.save();
  ctx.translate(VW/2 - cam.x, VH/2 - cam.y);
  drawGrid();

  // world bounds
  ctx.strokeStyle = '#1a1d2a';
  ctx.lineWidth = 4;
  ctx.strokeRect(WORLD.minX, WORLD.minY, WORLD.maxX - WORLD.minX, WORLD.maxY - WORLD.minY);

  // pickups
  for (const p of pickups) drawPickup(p);

  // entities sorted by y for crude depth
  const drawable = entities.filter(e => e.hp > 0).slice().sort((a,b)=>a.y-b.y);
  for (const e of drawable) drawEntity(e);

  // particles
  for (const p of particles) {
    ctx.globalAlpha = Math.max(0, p.t / 0.6);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
  }
  ctx.globalAlpha = 1;

  // floating text
  ctx.textAlign = 'center';
  ctx.font = '600 13px system-ui, sans-serif';
  for (const t of floatingTexts) {
    ctx.globalAlpha = Math.max(0, t.t / 0.9);
    ctx.fillStyle = t.color;
    ctx.fillText(t.text, t.x, t.y);
  }
  ctx.globalAlpha = 1;

  ctx.restore();
}

function drawGrid() {
  const gridSize = 80;
  const left = cam.x - VW/2 - gridSize, right = cam.x + VW/2 + gridSize;
  const top = cam.y - VH/2 - gridSize, bot = cam.y + VH/2 + gridSize;
  ctx.strokeStyle = '#13161f';
  ctx.lineWidth = 1;
  ctx.beginPath();
  const startX = Math.floor(left / gridSize) * gridSize;
  const startY = Math.floor(top / gridSize) * gridSize;
  for (let x = startX; x < right; x += gridSize) {
    ctx.moveTo(x, top); ctx.lineTo(x, bot);
  }
  for (let y = startY; y < bot; y += gridSize) {
    ctx.moveTo(left, y); ctx.lineTo(right, y);
  }
  ctx.stroke();
}

function drawPickup(p) {
  const y = p.y + Math.sin(p.bob) * 4;
  ctx.save();
  const col = p.type === 'life' ? '#3fcf6b' : p.type === 'energy' ? '#6cd3ff' : '#ffd46b';
  // halo
  const grad = ctx.createRadialGradient(p.x, y, 2, p.x, y, 28);
  grad.addColorStop(0, col + 'cc');
  grad.addColorStop(1, col + '00');
  ctx.fillStyle = grad;
  ctx.fillRect(p.x - 32, y - 32, 64, 64);

  ctx.translate(p.x, y);
  ctx.rotate(p.bob * 0.6);
  ctx.fillStyle = col;
  if (p.type === 'life') {
    ctx.fillRect(-3, -10, 6, 20);
    ctx.fillRect(-10, -3, 20, 6);
  } else if (p.type === 'energy') {
    ctx.beginPath();
    ctx.moveTo(0, -11); ctx.lineTo(8, 0); ctx.lineTo(0, 11); ctx.lineTo(-8, 0);
    ctx.closePath(); ctx.fill();
  } else {
    // both — diamond + cross
    ctx.beginPath();
    ctx.moveTo(0, -11); ctx.lineTo(8, 0); ctx.lineTo(0, 11); ctx.lineTo(-8, 0);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#0a0b12';
    ctx.fillRect(-1.5, -6, 3, 12);
    ctx.fillRect(-6, -1.5, 12, 3);
  }
  ctx.restore();
}

function drawEntity(e) {
  ctx.save();
  ctx.translate(e.x, e.y);

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(0, e.r * 0.7, e.r * 0.85, e.r * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body
  let bodyColor = e.color;
  if (e.hitFlash > 0) bodyColor = '#ffffff';
  if (e.state === 'morph') {
    // flicker through capture colors
    const t = (performance.now() / 60) | 0;
    bodyColor = pickMorphColor(t);
  }
  ctx.fillStyle = bodyColor;
  ctx.strokeStyle = e === player ? '#ffd46b' : '#0a0b12';
  ctx.lineWidth = e === player ? 3 : 2;
  ctx.beginPath();
  ctx.arc(0, 0, e.r, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  // Archetype decoration
  ctx.rotate(e.facing);
  drawArchetypeDeco(e);

  // Weapon during windup/swing
  if (e.state === 'windup') {
    drawWeapon(e, -0.6);
  } else if (e.state === 'swing') {
    // swingArc progresses from -0.7 to ~1.2
    drawWeapon(e, e.swingArc);
  }
  // Parry/Block/Evade indicators
  if (e.state === 'parry') {
    ctx.strokeStyle = '#ffd46b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(e.r + 4, 0, 6, -1, 1);
    ctx.stroke();
  }
  if (e.state === 'block') {
    ctx.strokeStyle = '#3fcf6b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(e.r + 2, 0, 10, -1.1, 1.1);
    ctx.stroke();
  }
  ctx.restore();

  // Facing direction tick (small dot where the player is aiming)
  if (e === player && !isTouch) {
    ctx.fillStyle = 'rgba(255,212,107,0.5)';
    const tx = e.x + Math.cos(e.facing) * (e.r + 20);
    const ty = e.y + Math.sin(e.facing) * (e.r + 20);
    ctx.beginPath();
    ctx.arc(tx, ty, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // HP bar above head (not for player — HUD handles it)
  if (e !== player) {
    const w = 36, h = 4;
    ctx.fillStyle = '#1a1d2a';
    ctx.fillRect(e.x - w/2, e.y - e.r - 12, w, h);
    ctx.fillStyle = e.hp < e.maxHp * 0.3 ? '#ff8a6b' : '#8ee27a';
    ctx.fillRect(e.x - w/2, e.y - e.r - 12, w * (e.hp / e.maxHp), h);
    // energy bar
    ctx.fillStyle = '#1a1d2a';
    ctx.fillRect(e.x - w/2, e.y - e.r - 6, w, 2);
    ctx.fillStyle = '#6cd3ff';
    ctx.fillRect(e.x - w/2, e.y - e.r - 6, w * (e.energy / e.maxEnergy), 2);
  }

  // Evade trail
  if (e.state === 'evade') {
    ctx.fillStyle = 'rgba(184, 136, 255, 0.25)';
    ctx.beginPath();
    ctx.arc(e.x - e.dashVx*0.05, e.y - e.dashVy*0.05, e.r, 0, Math.PI*2);
    ctx.fill();
  }
}

const MORPH_COLORS = ['#f0d8b0','#cfe88a','#a8554e','#ff8a3d','#8fd0ff','#c08aff','#d6d8e0'];
function pickMorphColor(t) { return MORPH_COLORS[t % MORPH_COLORS.length]; }

function drawArchetypeDeco(e) {
  ctx.save();
  switch (e.archetype) {
    case 'duelist':
      ctx.strokeStyle = '#0a0b12';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-e.r*0.4, -e.r*0.2);
      ctx.lineTo(e.r*0.8, 0);
      ctx.stroke();
      break;
    case 'brute':
      ctx.fillStyle = '#0a0b12';
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(Math.cos(a)*e.r*0.7, Math.sin(a)*e.r*0.7, 3, 0, Math.PI*2);
        ctx.fill();
      }
      break;
    case 'stalker':
      ctx.fillStyle = '#0a0b12';
      ctx.beginPath();
      ctx.moveTo(e.r*0.3, -e.r*0.6);
      ctx.lineTo(e.r*0.9, 0);
      ctx.lineTo(e.r*0.3, e.r*0.6);
      ctx.closePath();
      ctx.fill();
      break;
    case 'hopper':
      ctx.strokeStyle = '#0a0b12';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-e.r*0.3, -e.r*0.8); ctx.lineTo(-e.r*0.7, -e.r*1.2);
      ctx.moveTo(e.r*0.3, -e.r*0.8); ctx.lineTo(e.r*0.7, -e.r*1.2);
      ctx.stroke();
      break;
    case 'shade':
      ctx.fillStyle = 'rgba(192, 138, 255, 0.4)';
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(-i*6, 0, e.r * (1 - i*0.18), 0, Math.PI*2);
        ctx.fill();
      }
      break;
    case 'sentinel':
      ctx.fillStyle = '#0a0b12';
      ctx.fillRect(-e.r*0.4, -e.r*0.5, e.r*0.8, e.r*1.0);
      ctx.strokeStyle = '#d6d8e0';
      ctx.lineWidth = 2;
      ctx.strokeRect(-e.r*0.4, -e.r*0.5, e.r*0.8, e.r*1.0);
      break;
    case 'human':
    default:
      ctx.strokeStyle = '#0a0b12';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(e.r*0.35, 0, 3, 0, Math.PI*2);
      ctx.stroke();
      break;
  }
  ctx.restore();
}

function drawWeapon(e, arc) {
  ctx.save();
  ctx.rotate(arc);
  ctx.strokeStyle = e.state === 'swing' ? '#fff' : '#ffe3a8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(e.r, 0);
  ctx.lineTo(e.r + 30, 0);
  ctx.stroke();
  // swoosh
  if (e.state === 'swing') {
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, e.r + 20, arc - 1.2, arc);
    ctx.stroke();
  }
  ctx.restore();
}

// ---------- HUD updates ----------
function updateHUD() {
  if (!player) return;
  const hpPct = (player.hp / player.maxHp) * 100;
  const enPct = (player.energy / player.maxEnergy) * 100;
  document.getElementById('hp-fill').style.width = hpPct + '%';
  document.getElementById('en-fill').style.width = enPct + '%';
  document.getElementById('hp-text').textContent = Math.round(player.hp) + ' / ' + Math.round(player.maxHp);
  document.getElementById('en-text').textContent = Math.round(player.energy) + ' / ' + Math.round(player.maxEnergy);
  document.getElementById('form-name').textContent = player.label;
  document.getElementById('form-stats').textContent =
    `STR ${player.strength.toFixed(0)} · AGI ${player.agility.toFixed(2)} · MOB ${player.mobility.toFixed(0)} · DEF ${player.defense.toFixed(1)}`;
  document.getElementById('wave-num').textContent = wave;
  document.getElementById('threat-num').textContent = threat;

  const rack = document.getElementById('forms-rack');
  // Only re-render rack when form count or active index changes.
  if (rack._sig !== player.forms.length + ':' + player.formIdx) {
    rack._sig = player.forms.length + ':' + player.formIdx;
    rack.innerHTML = player.forms.map((f, i) =>
      `<div class="form-chip ${i === player.formIdx ? 'active' : ''}" style="background:${f.color}">${f.label[0]}<span class="idx">${i+1}</span></div>`
    ).join('');
  }
}

// ---------- main loop ----------
let lastT = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - lastT) / 1000);
  lastT = now;

  if (!gameOver) {
    // step everything
    for (const e of entities) stepEntity(e, dt);
    for (const e of entities) updateAI(e, dt);

    // pickups
    for (const p of pickups) p.bob += dt * 2.5;
    for (let i = pickups.length - 1; i >= 0; i--) {
      const p = pickups[i];
      p.life -= dt;
      if (dist2(player.x, player.y, p.x, p.y) < (player.r + 18) * (player.r + 18)) {
        applyPickup(p);
        pickups.splice(i, 1);
      } else if (p.life <= 0) {
        pickups.splice(i, 1);
      }
    }
    trySpawnPickup(dt);

    // sweep dead (keep player even at 0 hp briefly so death screen shows)
    entities = entities.filter(e => e === player || e.hp > 0);

    checkWaveClear(dt);
  }

  // particles/text always tick
  for (const p of particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.92; p.vy *= 0.92; p.t -= dt; }
  particles = particles.filter(p => p.t > 0);
  for (const t of floatingTexts) { t.y += t.vy * dt; t.t -= dt; }
  floatingTexts = floatingTexts.filter(t => t.t > 0);
  for (const c of combatLog) c.t += dt;

  updateCamera();
  render();
  updateHUD();

  requestAnimationFrame(loop);
}

// ---------- boot ----------
resetRun();
requestAnimationFrame((t) => { lastT = t; loop(t); });
