"use strict";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const ui = {
  shell: document.getElementById("gameShell"),
  runState: document.getElementById("runState"),
  waveLabel: document.getElementById("waveLabel"),
  enemiesLabel: document.getElementById("enemiesLabel"),
  threatLabel: document.getElementById("threatLabel"),
  essenceCountLabel: document.getElementById("essenceCountLabel"),
  killsLabel: document.getElementById("killsLabel"),
  hpFill: document.getElementById("hpFill"),
  hpText: document.getElementById("hpText"),
  energyFill: document.getElementById("energyFill"),
  energyText: document.getElementById("energyText"),
  essenceName: document.getElementById("essenceName"),
  essenceTags: document.getElementById("essenceTags"),
  specialName: document.getElementById("specialName"),
  specialText: document.getElementById("specialText"),
  powerLabel: document.getElementById("powerLabel"),
  morphList: document.getElementById("morphList"),
  log: document.getElementById("log"),
  deathOverlay: document.getElementById("deathOverlay"),
  banner: document.getElementById("messageBanner"),
  mobileControls: document.getElementById("mobileControls"),
  restartButton: document.getElementById("restartButton"),
  fullscreenButton: document.getElementById("fullscreenButton"),
  canvasOnlyButton: document.getElementById("canvasOnlyButton"),
};

const statFields = {
  strength: {
    fill: document.getElementById("strengthFill"),
    value: document.getElementById("strengthValue"),
  },
  agility: {
    fill: document.getElementById("agilityFill"),
    value: document.getElementById("agilityValue"),
  },
  mobility: {
    fill: document.getElementById("mobilityFill"),
    value: document.getElementById("mobilityValue"),
  },
  jump: {
    fill: document.getElementById("jumpFill"),
    value: document.getElementById("jumpValue"),
  },
  guard: {
    fill: document.getElementById("guardFill"),
    value: document.getElementById("guardValue"),
  },
};

const TAU = Math.PI * 2;
const STAT_KEYS = ["strength", "agility", "mobility", "jump", "guard"];
const WORLD = { left: 0, top: 0, width: 2400, height: 1600, right: 2400, bottom: 1600 };
const EVENT_CAP = 7;
const MAX_STAT = 12;
const WORLD_EXPAND_MARGIN = 140;
const WORLD_EXPAND_CHUNK = 760;
const MAX_PICKUPS = 4;

const OBSTACLES = [
  { x: 520, y: 430, r: 72, hue: "#233449" },
  { x: 860, y: 1020, r: 84, hue: "#1e3546" },
  { x: 1220, y: 620, r: 90, hue: "#2a3751" },
  { x: 1710, y: 460, r: 76, hue: "#22334a" },
  { x: 1780, y: 1120, r: 92, hue: "#273b56" },
  { x: 960, y: 1320, r: 74, hue: "#1f3246" },
];

const ARCHETYPES = [
  {
    id: "duelist",
    species: "Human",
    baseName: "Duelist",
    shape: "duelist",
    palette: { body: "#f2d67a", accent: "#ff764c", trail: "#ffe6b2" },
    stats: { strength: 4, agility: 7, mobility: 5, jump: 4, guard: 5 },
    ai: { aggression: 0.78, defense: 0.56, strafe: 0.95 },
  },
  {
    id: "brute",
    species: "Monster",
    baseName: "Ogre Brute",
    shape: "brute",
    palette: { body: "#d96f56", accent: "#fff0aa", trail: "#f58b70" },
    stats: { strength: 8, agility: 2, mobility: 3, jump: 2, guard: 8 },
    ai: { aggression: 0.62, defense: 0.34, strafe: 0.2 },
  },
  {
    id: "stalker",
    species: "Beast",
    baseName: "Stalker Raptor",
    shape: "stalker",
    palette: { body: "#7cf4c9", accent: "#efffff", trail: "#b8ffe9" },
    stats: { strength: 5, agility: 6, mobility: 8, jump: 6, guard: 3 },
    ai: { aggression: 0.84, defense: 0.42, strafe: 0.78 },
  },
  {
    id: "hopper",
    species: "Creature",
    baseName: "Bog Hopper",
    shape: "hopper",
    palette: { body: "#86a8ff", accent: "#f4f6ff", trail: "#acc2ff" },
    stats: { strength: 4, agility: 5, mobility: 6, jump: 9, guard: 3 },
    ai: { aggression: 0.74, defense: 0.46, strafe: 0.58 },
  },
  {
    id: "shade",
    species: "Specter",
    baseName: "Umbral Shade",
    shape: "shade",
    palette: { body: "#9e8cff", accent: "#fff0fe", trail: "#c9bdff" },
    stats: { strength: 3, agility: 8, mobility: 8, jump: 5, guard: 2 },
    ai: { aggression: 0.68, defense: 0.72, strafe: 1.05 },
  },
  {
    id: "sentinel",
    species: "Construct",
    baseName: "Crystal Sentinel",
    shape: "sentinel",
    palette: { body: "#7fe1f5", accent: "#fef4d5", trail: "#d2f6ff" },
    stats: { strength: 6, agility: 4, mobility: 4, jump: 4, guard: 9 },
    ai: { aggression: 0.58, defense: 0.68, strafe: 0.24 },
  },
];

const MUTATIONS = [
  {
    id: "feral",
    prefix: "Feral",
    special: "frenzy",
    specialName: "Predator Fever",
    specialText: "Attacks and movement accelerate as health drops.",
    statMods: { strength: 1, agility: 2, mobility: 1, jump: 0, guard: -1 },
    powerBonus: 0.6,
  },
  {
    id: "ironhide",
    prefix: "Ironhide",
    special: "thorns",
    specialName: "Thorn Guard",
    specialText: "Returns chip damage when struck or pressured into a block.",
    statMods: { strength: 1, agility: -1, mobility: -1, jump: 0, guard: 3 },
    powerBonus: 0.7,
  },
  {
    id: "blink",
    prefix: "Blink",
    special: "blink",
    specialName: "Blinkstep",
    specialText: "Evades snap through space in a fast, dangerous burst.",
    statMods: { strength: 0, agility: 2, mobility: 2, jump: 1, guard: -1 },
    powerBonus: 0.75,
  },
  {
    id: "vampiric",
    prefix: "Vampiric",
    special: "leech",
    specialName: "Blood Draw",
    specialText: "A portion of damage dealt returns as health.",
    statMods: { strength: 1, agility: 0, mobility: 1, jump: 0, guard: 0 },
    powerBonus: 0.72,
  },
  {
    id: "storm",
    prefix: "Stormbound",
    special: "shock",
    specialName: "Stormwake",
    specialText: "Evades end in a short shockwave that punishes nearby foes.",
    statMods: { strength: 0, agility: 1, mobility: 1, jump: 2, guard: 0 },
    powerBonus: 0.68,
  },
  {
    id: "titan",
    prefix: "Titan",
    special: "titan",
    specialName: "Titan Frame",
    specialText: "A heavier frame hits harder, blocks better, and moves slower.",
    statMods: { strength: 2, agility: -2, mobility: -1, jump: 0, guard: 2 },
    powerBonus: 0.85,
  },
  {
    id: "venom",
    prefix: "Venom",
    special: "poison",
    specialName: "Venom Fang",
    specialText: "Successful attacks inject poison that lingers over time.",
    statMods: { strength: 0, agility: 1, mobility: 1, jump: 0, guard: 0 },
    powerBonus: 0.66,
  },
];

const input = {
  keys: new Set(),
  touchDirections: new Set(),
  attackQueued: false,
  attackHeld: false,
  evadeQueued: false,
  blockHeld: false,
  sprintHeld: false,
  touchBlockHeld: false,
  touchSprintHeld: false,
  mouse: {
    x: 0,
    y: 0,
    worldX: 0,
    worldY: 0,
    left: false,
    right: false,
    inside: false,
  },
};

let essenceCounter = 0;
let game = null;
const displayState = {
  canvasOnly: false,
};

function clamp(min, value, max) {
  return Math.max(min, Math.min(value, max));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpAngle(a, b, t) {
  let diff = ((b - a + Math.PI) % TAU) - Math.PI;
  if (diff < -Math.PI) {
    diff += TAU;
  }
  return a + diff * t;
}

function angleDiff(a, b) {
  let diff = ((a - b + Math.PI) % TAU) - Math.PI;
  if (diff < -Math.PI) {
    diff += TAU;
  }
  return diff;
}

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function magnitude(x, y) {
  return Math.hypot(x, y);
}

function normalize(x, y) {
  const len = Math.hypot(x, y);
  if (!len) {
    return { x: 0, y: 0 };
  }
  return { x: x / len, y: y / len };
}

function syncWorldBounds() {
  WORLD.width = WORLD.right - WORLD.left;
  WORLD.height = WORLD.bottom - WORLD.top;
}

function resetWorldBounds() {
  WORLD.left = 0;
  WORLD.top = 0;
  WORLD.right = 2400;
  WORLD.bottom = 1600;
  syncWorldBounds();
}

function randomDropDelay() {
  const wave = game ? game.wave : 1;
  const intensity = clamp(0, (wave - 1) / 12, 1);
  const minDelay = lerp(24, 52, intensity);
  const maxDelay = lerp(60, 120, intensity);
  return rand(minDelay, maxDelay);
}

function spendEnergy(entity, fraction) {
  const cost = entity.maxEnergy * fraction;
  if (entity.energy + 0.001 < cost) {
    return false;
  }
  entity.energy = Math.max(0, entity.energy - cost);
  return true;
}

function getAllLivingEntities() {
  if (!game) {
    return [];
  }
  return [game.player, ...game.enemies].filter((entity) => entity && !entity.dead);
}

function getCombatTargets(attacker) {
  return getAllLivingEntities().filter((entity) => entity !== attacker);
}

function findNearestTarget(entity) {
  let best = null;
  let bestDistance = Infinity;

  for (const candidate of getCombatTargets(entity)) {
    const distance = magnitude(candidate.x - entity.x, candidate.y - entity.y);
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }

  return { target: best, distance: bestDistance };
}

function expandWorldAround(entity) {
  let expanded = false;

  if (entity.x > WORLD.right - WORLD_EXPAND_MARGIN) {
    WORLD.right += WORLD_EXPAND_CHUNK;
    expanded = true;
  }
  if (entity.x < WORLD.left + WORLD_EXPAND_MARGIN) {
    WORLD.left -= WORLD_EXPAND_CHUNK;
    expanded = true;
  }
  if (entity.y > WORLD.bottom - WORLD_EXPAND_MARGIN) {
    WORLD.bottom += WORLD_EXPAND_CHUNK;
    expanded = true;
  }
  if (entity.y < WORLD.top + WORLD_EXPAND_MARGIN) {
    WORLD.top -= WORLD_EXPAND_CHUNK;
    expanded = true;
  }

  if (expanded) {
    syncWorldBounds();
  }
}

function cloneEssence(essence) {
  return {
    ...essence,
    stats: { ...essence.stats },
    palette: { ...essence.palette },
    tags: [...essence.tags],
  };
}

function createBaseEssence() {
  const essence = {
    id: `essence-${++essenceCounter}`,
    name: "Runebound Drifter",
    species: "Human",
    baseName: "Drifter",
    shape: "duelist",
    palette: { body: "#82f0d0", accent: "#f6bc67", trail: "#d8fff3" },
    stats: { strength: 5, agility: 5, mobility: 5, jump: 4, guard: 5 },
    special: "resolve",
    specialName: "Blank Core",
    specialText: "A balanced shell with no mutation yet. Steal stronger bodies to evolve.",
    tags: ["Starter", "Balanced"],
    scale: 1,
  };
  essence.power = computeEssencePower(essence);
  return essence;
}

function computeEssencePower(essence) {
  const stats = essence.stats;
  const average = STAT_KEYS.reduce((sum, key) => sum + stats[key], 0) / STAT_KEYS.length;
  const special = MUTATIONS.find((mutation) => mutation.special === essence.special);
  const bonus = special ? special.powerBonus : 0;
  return Number((average * essence.scale + bonus).toFixed(1));
}

function getWaveProfile(wave) {
  if (wave % 5 === 0) {
    return {
      kind: "boss",
      count: 1,
      scaleBoost: 0.85,
      label: `Boss Wave ${wave}`,
      banner: `Boss wave ${wave}. A champion enters the field.`,
      log: `Boss wave ${wave} begins. A champion stalks the arena.`,
    };
  }

  if (wave % 3 === 0) {
    return {
      kind: "elite",
      count: Math.min(6, 2 + Math.floor(wave / 6)),
      scaleBoost: 0.45,
      label: `Elite Wave ${wave}`,
      banner: `Elite wave ${wave}. Dangerous hunters arrive.`,
      log: `Elite wave ${wave} begins. Enhanced enemies enter the fight.`,
    };
  }

  return {
    kind: "normal",
    count: Math.min(18, 4 + wave * 2),
    scaleBoost: 0,
    label: `Wave ${wave}`,
    banner: `Wave ${wave} repopulates. Threat ${getThreatLevel().toFixed(1)}x`,
    log: `Wave ${wave} repopulates the arena.`,
  };
}

function applyVariantToEssence(essence, variant, wave) {
  essence.variant = variant;
  essence.variantLabel = variant === "boss" ? "Boss" : variant === "elite" ? "Elite" : "Normal";

  if (variant === "elite") {
    for (const key of STAT_KEYS) {
      essence.stats[key] = clamp(1, essence.stats[key] + (key === "strength" || key === "guard" ? 2 : 1), MAX_STAT + 3);
    }
    essence.scale = Number((essence.scale + 0.34 + Math.min(0.18, wave * 0.01)).toFixed(2));
    essence.name = `Elite ${essence.name}`;
    essence.tags.push("Elite");
    essence.palette.accent = "#ffd27c";
    essence.palette.trail = "#ffe4a6";
  } else if (variant === "boss") {
    for (const key of STAT_KEYS) {
      essence.stats[key] = clamp(1, essence.stats[key] + (key === "strength" || key === "guard" ? 3 : 2), MAX_STAT + 4);
    }
    essence.scale = Number((essence.scale + 0.72 + Math.min(0.28, wave * 0.014)).toFixed(2));
    essence.name = `${essence.name} Prime`;
    essence.tags.push("Boss");
    essence.palette.accent = "#ff9c7c";
    essence.palette.trail = "#ffd0a3";
  } else {
    essence.palette.accent = essence.palette.accent;
  }

  essence.power = computeEssencePower(essence);
  return essence;
}

function deriveCombat(essence) {
  const stats = essence.stats;
  const scale = essence.scale || 1;
  const derived = {
    maxHp: (48 + stats.strength * 8 + stats.guard * 7 + stats.jump * 2) * scale,
    damage: (6 + stats.strength * 2.45 + stats.agility * 0.5) * (0.76 + scale * 0.24),
    moveSpeed: (112 + stats.mobility * 16 + stats.jump * 4) * (0.94 + scale * 0.1),
    attackCooldown: Math.max(0.28, 1.02 - stats.agility * 0.055) / (0.95 + (scale - 1) * 0.17),
    windup: Math.max(0.08, 0.24 - stats.agility * 0.01),
    range: 40 + stats.jump * 6 + stats.mobility * 2,
    arc: Math.PI * clamp(0.36, 0.56 + stats.agility * 0.016, 0.84),
    knockback: (130 + stats.strength * 18 + stats.jump * 8) * (0.82 + scale * 0.18),
    blockMitigation: clamp(0.38, 0.38 + stats.guard * 0.04 + stats.agility * 0.01, 0.84),
    parryWindow: 0.1 + stats.agility * 0.011,
    evadeDistance: (68 + stats.mobility * 11 + stats.jump * 14) * (0.9 + scale * 0.1),
    evadeDuration: Math.max(0.15, 0.29 - stats.agility * 0.008),
    evadeCooldown: Math.max(0.46, 1.55 - stats.agility * 0.07),
    size: 16 + stats.guard * 0.7 + stats.strength * 0.55,
    blockMoveMultiplier: 0.34 + stats.agility * 0.04,
    maxEnergy: (76 + stats.agility * 8 + stats.mobility * 7 + stats.guard * 4) * (0.92 + scale * 0.08),
    energyRegen: (9 + stats.agility * 1.1 + stats.mobility * 0.95 + stats.guard * 0.45) * (0.94 + scale * 0.05),
    sprintMultiplier: 1.38 + stats.mobility * 0.015,
  };

  switch (essence.special) {
    case "titan":
      derived.maxHp *= 1.24;
      derived.damage *= 1.14;
      derived.moveSpeed *= 0.84;
      derived.size += 6;
      derived.blockMitigation = clamp(0.38, derived.blockMitigation + 0.05, 0.88);
      derived.range += 10;
      break;
    case "blink":
      derived.evadeDistance *= 1.22;
      derived.evadeCooldown *= 0.86;
      break;
    case "shock":
      derived.evadeDistance *= 1.08;
      break;
    case "thorns":
      derived.blockMitigation = clamp(0.38, derived.blockMitigation + 0.04, 0.88);
      break;
    default:
      break;
  }

  return derived;
}

function createEnemyEssence(scale, wave, options = {}) {
  const archetype = pick(ARCHETYPES);
  const mutation = pick(MUTATIONS);
  const stats = {};

  for (const key of STAT_KEYS) {
    const waveBias = key === "guard" || key === "strength"
      ? Math.floor((wave - 1) / 4)
      : Math.floor((wave - 1) / 5);
    stats[key] = clamp(1, archetype.stats[key] + mutation.statMods[key] + randInt(-1, 1) + waveBias, MAX_STAT);
  }

  const essence = {
    id: `essence-${++essenceCounter}`,
    name: `${mutation.prefix} ${archetype.baseName}`,
    species: archetype.species,
    baseName: archetype.baseName,
    archetypeId: archetype.id,
    shape: archetype.shape,
    palette: { ...archetype.palette },
    stats,
    special: mutation.special,
    specialName: mutation.specialName,
    specialText: mutation.specialText,
    tags: [archetype.species, mutation.prefix],
    scale: Number(scale.toFixed(2)),
    ai: { ...archetype.ai },
  };
  return applyVariantToEssence(essence, options.variant || "normal", wave);
}

function createEntity(team, essence, x, y) {
  const entity = {
    id: `${team}-${Math.random().toString(36).slice(2, 9)}`,
    team,
    x,
    y,
    vx: 0,
    vy: 0,
    radius: 18,
    facing: 0,
    desiredFacing: 0,
    hp: 1,
    maxHp: 1,
    stats: null,
    essence: cloneEssence(essence),
    attackState: null,
    attackCooldown: 0,
    blockTimer: 0,
    blocking: false,
    parryTimer: 0,
    evadeTimer: 0,
    evadeCooldown: 0,
    evadeDir: { x: 0, y: 0 },
    invulnTimer: 0,
    stunTimer: 0,
    poisonTimer: 0,
    poisonTick: 0,
    poisonSource: null,
    morphTimer: 0,
    morphTotal: 0,
    pendingFormIndex: null,
    reactionCooldown: 0,
    moveIntent: { x: 0, y: 0 },
    hitFlash: 0,
    aiStrafeDir: Math.random() > 0.5 ? 1 : -1,
    energy: 1,
    maxEnergy: 1,
    sprinting: false,
    dead: false,
    tags: essence.tags ? [...essence.tags] : [],
  };

  applyEssence(entity, essence, true);
  entity.facing = rand(0, TAU);
  entity.desiredFacing = entity.facing;
  return entity;
}

function applyEssence(entity, essence, refill) {
  const ratio = entity.maxHp > 0 ? entity.hp / entity.maxHp : 1;
  const energyRatio = entity.maxEnergy > 0 ? entity.energy / entity.maxEnergy : 1;
  entity.essence = cloneEssence(essence);
  entity.stats = deriveCombat(entity.essence);
  entity.radius = entity.stats.size;
  entity.maxHp = entity.stats.maxHp;
  entity.maxEnergy = entity.stats.maxEnergy;
  entity.hp = refill ? entity.maxHp : Math.max(1, entity.maxHp * ratio);
  entity.energy = refill ? entity.maxEnergy : clamp(0, entity.maxEnergy * energyRatio, entity.maxEnergy);
}

function getThreatLevel() {
  if (!game || !game.forms || !game.forms.length) {
    return 1;
  }

  const bestPower = Math.max(...game.forms.map((essence) => essence.power));
  return 1 + (game.wave - 1) * 0.16 + (game.forms.length - 1) * 0.08 + Math.max(0, bestPower - 6) * 0.045;
}

function randomSpawnPoint() {
  const anchor = game.player || { x: WORLD.left + WORLD.width / 2, y: WORLD.top + WORLD.height / 2 };

  for (let attempts = 0; attempts < 80; attempts += 1) {
    const angle = rand(0, TAU);
    const distance = rand(360, 760);
    const x = clamp(WORLD.left + 80, anchor.x + Math.cos(angle) * distance, WORLD.right - 80);
    const y = clamp(WORLD.top + 80, anchor.y + Math.sin(angle) * distance, WORLD.bottom - 80);

    let valid = true;
    for (const obstacle of OBSTACLES) {
      if (magnitude(x - obstacle.x, y - obstacle.y) < obstacle.r + 80) {
        valid = false;
        break;
      }
    }

    if (!valid) {
      continue;
    }

    if (magnitude(x - anchor.x, y - anchor.y) < 280) {
      continue;
    }

    return { x, y };
  }

  return {
    x: rand(WORLD.left + 120, WORLD.right - 120),
    y: rand(WORLD.top + 120, WORLD.bottom - 120),
  };
}

function randomPickupType() {
  const roll = Math.random();
  if (roll < 0.38) {
    return "life";
  }
  if (roll < 0.76) {
    return "energy";
  }
  return "both";
}

function findPickupSpawnPoint() {
  const anchor = game.player;
  const minDistance = 120;
  const maxDistance = 260 + Math.min(120, game.wave * 10);

  for (let attempts = 0; attempts < 140; attempts += 1) {
    const angle = rand(0, TAU);
    const distance = rand(minDistance, maxDistance);
    const x = clamp(WORLD.left + 120, anchor.x + Math.cos(angle) * distance, WORLD.right - 120);
    const y = clamp(WORLD.top + 120, anchor.y + Math.sin(angle) * distance, WORLD.bottom - 120);

    let blocked = false;
    for (const pickup of game.pickups) {
      if (magnitude(x - pickup.x, y - pickup.y) < 240) {
        blocked = true;
        break;
      }
    }
    if (blocked) {
      continue;
    }

    for (const obstacle of OBSTACLES) {
      if (magnitude(x - obstacle.x, y - obstacle.y) < obstacle.r + 72) {
        blocked = true;
        break;
      }
    }
    if (blocked) {
      continue;
    }

    return { x, y };
  }

  return {
    x: clamp(WORLD.left + 120, anchor.x + rand(-180, 180), WORLD.right - 120),
    y: clamp(WORLD.top + 120, anchor.y + rand(-180, 180), WORLD.bottom - 120),
  };
}

function spawnPickup() {
  if (game.pickups.length >= MAX_PICKUPS) {
    return false;
  }

  const point = findPickupSpawnPoint();
  if (!point) {
    return false;
  }

  const type = randomPickupType();
  game.pickups.push({
    id: `pickup-${Math.random().toString(36).slice(2, 9)}`,
    type,
    x: point.x,
    y: point.y,
    radius: 16,
    pulse: rand(0, TAU),
  });

  const names = {
    life: "life fragment",
    energy: "energy shard",
    both: "vitality core",
  };
  addLog(`A ${names[type]} drops into the field.`);
  return true;
}

function collectPickup(entity, pickup) {
  let healed = 0;
  let restored = 0;

  if (pickup.type === "life" || pickup.type === "both") {
    const hpGain = entity.maxHp * (pickup.type === "both" ? 0.24 : 0.36);
    healed = Math.min(entity.maxHp - entity.hp, hpGain);
    entity.hp += healed;
  }
  if (pickup.type === "energy" || pickup.type === "both") {
    const energyGain = entity.maxEnergy * (pickup.type === "both" ? 0.38 : 0.58);
    restored = Math.min(entity.maxEnergy - entity.energy, energyGain);
    entity.energy += restored;
  }

  if (healed <= 0 && restored <= 0) {
    return false;
  }

  const color = pickup.type === "life" ? "#ffb8a6" : pickup.type === "energy" ? "#92ecff" : "#c6ffd2";
  spawnBurst(pickup.x, pickup.y, color, 18, 120, 0.7, 5);

  if (entity === game.player) {
    const pickupName = pickup.type === "life" ? "life fragment" : pickup.type === "energy" ? "energy shard" : "vitality core";
    addLog(`You absorbed a ${pickupName}.`);
  }

  return true;
}

function updatePickups(dt) {
  game.nextPickupTimer -= dt;
  if (game.nextPickupTimer <= 0) {
    spawnPickup();
    game.nextPickupTimer = randomDropDelay();
  }

  for (const pickup of game.pickups) {
    pickup.pulse += dt * 2.4;
  }

  game.pickups = game.pickups.filter((pickup) => {
    const distance = magnitude(pickup.x - game.player.x, pickup.y - game.player.y);
    if (distance < pickup.radius + game.player.radius + 6) {
      return !collectPickup(game.player, pickup);
    }
    return true;
  });
}

function showBanner(text, duration = 2.2) {
  ui.banner.textContent = text;
  ui.banner.classList.remove("hidden");
  game.bannerTimer = duration;
}

function addLog(text) {
  game.logs.unshift(text);
  game.logs = game.logs.slice(0, EVENT_CAP);
}

function spawnBurst(x, y, color, count, speed = 120, life = 0.65, size = 6) {
  for (let i = 0; i < count; i += 1) {
    const angle = rand(0, TAU);
    const force = speed * rand(0.35, 1);
    game.particles.push({
      kind: "dot",
      x,
      y,
      vx: Math.cos(angle) * force,
      vy: Math.sin(angle) * force,
      size: rand(size * 0.35, size),
      life: rand(life * 0.65, life),
      maxLife: life,
      color,
    });
  }
}

function spawnText(x, y, text, color) {
  game.particles.push({
    kind: "text",
    x,
    y,
    vx: rand(-12, 12),
    vy: rand(-42, -24),
    size: 16,
    life: 0.75,
    maxLife: 0.75,
    color,
    text,
  });
}

function startRun() {
  resetWorldBounds();
  const base = createBaseEssence();
  const player = createEntity("player", base, WORLD.left + WORLD.width / 2, WORLD.top + WORLD.height / 2);

  game = {
    viewWidth: 1280,
    viewHeight: 720,
    dpr: window.devicePixelRatio || 1,
    lastTime: performance.now(),
    state: "playing",
    wave: 1,
    forms: [base],
    currentFormIndex: 0,
    player,
    enemies: [],
    pickups: [],
    particles: [],
    logs: [],
    bannerTimer: 0,
    nextWaveTimer: null,
    nextPickupTimer: randomDropDelay(),
    kills: 0,
    currentWaveProfile: null,
    camera: { x: player.x, y: player.y, shake: 0 },
    uiRefresh: 0,
  };

  game.currentWaveProfile = getWaveProfile(game.wave);

  ui.deathOverlay.classList.add("hidden");
  ui.runState.textContent = "RUN ACTIVE";
  addLog("A new hunt begins. Defeat an enemy to steal its form.");
  showBanner("Wave 1 begins. Capture an essence and stay alive.");
  spawnWave();
  refreshHud();
}

function spawnWave() {
  const profile = getWaveProfile(game.wave);
  const count = profile.count;
  const threat = getThreatLevel() + profile.scaleBoost;
  game.currentWaveProfile = profile;

  for (let i = 0; i < count; i += 1) {
    const spawn = randomSpawnPoint();
    const essence = createEnemyEssence(threat + rand(-0.12, 0.22), game.wave, { variant: profile.kind });
    const enemy = createEntity("enemy", essence, spawn.x, spawn.y);
    enemy.facing = Math.atan2(game.player.y - enemy.y, game.player.x - enemy.x);
    enemy.desiredFacing = enemy.facing;
    game.enemies.push(enemy);
    spawnBurst(enemy.x, enemy.y, enemy.essence.palette.trail, 8, 60, 0.55, 4);
  }

  addLog(`${profile.log} Count ${count}.`);
  showBanner(profile.banner);
}

function queueMorph(direction) {
  if (game.state !== "playing" || game.forms.length <= 1) {
    return;
  }

  const player = game.player;
  const length = game.forms.length;
  let nextIndex = (game.currentFormIndex + direction + length) % length;

  if (nextIndex === game.currentFormIndex) {
    return;
  }

  player.blocking = false;
  player.blockTimer = 0;
  player.parryTimer = 0;
  player.attackState = null;
  player.pendingFormIndex = nextIndex;
  player.morphTimer = 0.92;
  player.morphTotal = 0.92;

  const next = game.forms[nextIndex];
  addLog(`Morphing into ${next.name}. Vulnerable until the shift completes.`);
  showBanner(`Morphing into ${next.name}. Hold out until the shell locks in.`);
}

function unlockEssence(essence) {
  const captured = cloneEssence(essence);
  captured.id = `essence-${++essenceCounter}`;
  game.forms.push(captured);
  addLog(`Captured ${captured.name}. Switch with Q / E or the mouse wheel.`);
  showBanner(`Essence seized: ${captured.name}`);
}

function getInputVector() {
  let x = 0;
  let y = 0;

  if (input.keys.has("KeyW")) {
    y -= 1;
  }
  if (input.keys.has("KeyS")) {
    y += 1;
  }
  if (input.keys.has("KeyA")) {
    x -= 1;
  }
  if (input.keys.has("KeyD")) {
    x += 1;
  }
  if (input.touchDirections.has("up")) {
    y -= 1;
  }
  if (input.touchDirections.has("down")) {
    y += 1;
  }
  if (input.touchDirections.has("left")) {
    x -= 1;
  }
  if (input.touchDirections.has("right")) {
    x += 1;
  }

  return normalize(x, y);
}

function canAct(entity) {
  return !entity.dead && entity.stunTimer <= 0 && entity.morphTimer <= 0;
}

function currentFrenzyFactor(entity) {
  if (entity.essence.special !== "frenzy") {
    return 1;
  }
  const missing = 1 - entity.hp / entity.maxHp;
  return 1 + missing * 0.35;
}

function startAttack(entity) {
  if (!canAct(entity) || entity.attackCooldown > 0 || entity.attackState || entity.evadeTimer > 0) {
    return false;
  }

  const cooldown = entity.stats.attackCooldown / currentFrenzyFactor(entity);
  entity.sprinting = false;
  entity.blocking = false;
  entity.blockTimer = 0;
  entity.parryTimer = 0;
  entity.attackCooldown = cooldown;
  entity.attackState = {
    windup: entity.stats.windup,
    recover: cooldown * 0.4,
    done: false,
  };
  return true;
}

function startBlock(entity, aiHold = 0) {
  if (!canAct(entity) || entity.evadeTimer > 0 || entity.attackState) {
    return false;
  }

  entity.sprinting = false;
  entity.blocking = true;
  entity.blockTimer = aiHold;
  entity.parryTimer = entity.stats.parryWindow;
  return true;
}

function stopBlock(entity) {
  entity.blocking = false;
  entity.blockTimer = 0;
  entity.parryTimer = 0;
}

function startEvade(entity, dirX, dirY) {
  if (!canAct(entity) || entity.evadeCooldown > 0 || entity.evadeTimer > 0) {
    return false;
  }

  if (!spendEnergy(entity, 0.5)) {
    if (entity === game.player) {
      spawnText(entity.x, entity.y - entity.radius - 10, "LOW ENERGY", "#92ecff");
    }
    return false;
  }

  const direction = normalize(dirX, dirY);
  if (!direction.x && !direction.y) {
    direction.x = Math.cos(entity.facing);
    direction.y = Math.sin(entity.facing);
  }

  entity.blocking = false;
  entity.blockTimer = 0;
  entity.parryTimer = 0;
  entity.attackState = null;
  entity.sprinting = false;
  entity.evadeDir = direction;
  entity.evadeTimer = entity.stats.evadeDuration;
  entity.evadeCooldown = entity.stats.evadeCooldown;
  entity.invulnTimer = Math.max(entity.invulnTimer, entity.stats.evadeDuration * 0.85);

  if (entity.essence.special === "blink") {
    const jump = entity.stats.evadeDistance * 0.42;
    entity.x += direction.x * jump;
    entity.y += direction.y * jump;
    spawnBurst(entity.x, entity.y, entity.essence.palette.trail, 10, 72, 0.45, 5);
  }

  return true;
}

function resolveAttack(attacker) {
  const targets = getCombatTargets(attacker);
  let connected = false;

  for (const target of targets) {
    if (!target || target.dead) {
      continue;
    }

    const dx = target.x - attacker.x;
    const dy = target.y - attacker.y;
    const dist = Math.hypot(dx, dy);
    const angle = Math.atan2(dy, dx);
    const withinArc = Math.abs(angleDiff(attacker.facing, angle)) <= attacker.stats.arc * 0.5;
    const withinRange = dist <= attacker.radius + target.radius + attacker.stats.range;

    if (withinArc && withinRange) {
      connected = true;
      applyHit(attacker, target, angle);
    }
  }

  spawnBurst(
    attacker.x + Math.cos(attacker.facing) * (attacker.radius + 12),
    attacker.y + Math.sin(attacker.facing) * (attacker.radius + 12),
    attacker.essence.palette.trail,
    connected ? 9 : 5,
    connected ? 120 : 70,
    0.45,
    connected ? 5 : 3
  );
}

function dealDamage(target, amount, source, color) {
  if (target.dead || amount <= 0) {
    return 0;
  }

  target.hp -= amount;
  target.hitFlash = 0.12;
  spawnText(target.x, target.y - target.radius - 8, `${Math.round(amount)}`, color);
  spawnBurst(target.x, target.y, color, 8, 100, 0.5, 4);

  if (target.hp <= 0) {
    handleDeath(target, source);
  }

  return amount;
}

function applyHit(attacker, target, attackAngle) {
  if (target.invulnTimer > 0) {
    spawnText(target.x, target.y - target.radius - 4, "EVADE", "#e9fdff");
    return;
  }

  const defendFacing = Math.atan2(attacker.y - target.y, attacker.x - target.x);
  const guarding = target.blocking && Math.abs(angleDiff(target.facing, defendFacing)) <= Math.PI * 0.7;
  let damage = attacker.stats.damage * currentFrenzyFactor(attacker);

  if (target.morphTimer > 0) {
    damage *= 1.22;
  }

  if (guarding) {
    if (target.parryTimer > 0) {
      if (!spendEnergy(target, 0.2)) {
        target.parryTimer = 0;
        if (target === game.player) {
          spawnText(target.x, target.y - target.radius - 10, "LOW ENERGY", "#92ecff");
        }
      } else {
        stopBlock(target);
        attacker.stunTimer = 0.8;
        attacker.attackState = null;
        attacker.attackCooldown = Math.max(attacker.attackCooldown, 0.35);
        attacker.vx -= Math.cos(attackAngle) * 180;
        attacker.vy -= Math.sin(attackAngle) * 180;
        spawnText(target.x, target.y - target.radius - 10, "PARRY", "#fff0b2");
        spawnBurst(target.x, target.y, "#fff0b2", 14, 150, 0.55, 5);
        dealDamage(attacker, Math.max(8, damage * 0.24), target, "#ffe78d");
        game.camera.shake = Math.max(game.camera.shake, 5);
        return;
      }
    }

    const blockFraction = 0.3 + attacker.essence.stats.strength / 100;
    if (!spendEnergy(target, blockFraction)) {
      stopBlock(target);
      spawnText(target.x, target.y - target.radius - 10, "GUARD BREAK", "#ffd3b2");
      damage *= 1.1;
      dealDamage(target, damage, attacker, "#ffb39e");
      target.vx += Math.cos(attackAngle) * attacker.stats.knockback * 1.15;
      target.vy += Math.sin(attackAngle) * attacker.stats.knockback * 1.15;
      target.stunTimer = Math.max(target.stunTimer, 0.32);
      return;
    }

    const blocked = damage * (1 - target.stats.blockMitigation);
    dealDamage(target, blocked, attacker, "#f6d58b");
    target.vx += Math.cos(attackAngle) * 70;
    target.vy += Math.sin(attackAngle) * 70;
    spawnText(target.x, target.y - target.radius - 10, "BLOCK", "#ffe7b6");

    if (target.essence.special === "thorns") {
      dealDamage(attacker, Math.max(3, blocked * 0.6), target, "#8cf0d2");
    }
    return;
  }

  dealDamage(target, damage, attacker, attacker.team === "player" ? "#ffdca8" : "#ff9d8b");
  target.vx += Math.cos(attackAngle) * attacker.stats.knockback;
  target.vy += Math.sin(attackAngle) * attacker.stats.knockback;
  game.camera.shake = Math.max(game.camera.shake, attacker.team === "player" ? 7 : 5);

  if (attacker.essence.special === "leech") {
    attacker.hp = Math.min(attacker.maxHp, attacker.hp + damage * 0.22);
  }
  if (attacker.essence.special === "poison") {
    target.poisonTimer = Math.max(target.poisonTimer, 2.8);
    target.poisonTick = 0;
    target.poisonSource = attacker;
  }
}

function handleDeath(target, source) {
  if (target.dead) {
    return;
  }

  target.dead = true;
  spawnBurst(target.x, target.y, target.essence.palette.body, 18, 180, 0.8, 7);

  if (target.team === "enemy") {
    if (source === game.player) {
      game.kills += 1;
      unlockEssence(target.essence);
      game.player.hp = game.player.maxHp;
      spawnText(game.player.x, game.player.y - game.player.radius - 12, "FULL HEAL", "#ffdca8");
      spawnBurst(game.player.x, game.player.y, "#ffdca8", 16, 120, 0.65, 5);
      addLog("Finisher secured. Health fully restored.");
    }
    game.enemies = game.enemies.filter((enemy) => enemy !== target);
  } else {
    game.state = "dead";
    ui.deathOverlay.classList.remove("hidden");
    ui.runState.textContent = "RUN SHATTERED";
    showBanner("Run broken. Press R to restart.");
    addLog("You died. Every captured essence was lost.");
  }
}

function updatePlayer(dt) {
  const player = game.player;
  const move = getInputVector();
  const queuedAttack = input.attackQueued || input.mouse.left || input.attackHeld;
  const queuedEvade = input.evadeQueued;
  player.moveIntent = move;
  player.sprinting =
    input.sprintHeld &&
    player.morphTimer <= 0 &&
    player.evadeTimer <= 0 &&
    !player.blocking &&
    !player.attackState &&
    !!(move.x || move.y);

  updateMouseWorld();
  const aimX = input.mouse.inside ? input.mouse.worldX - player.x : move.x;
  const aimY = input.mouse.inside ? input.mouse.worldY - player.y : move.y;
  if (aimX || aimY) {
    player.desiredFacing = Math.atan2(aimY, aimX);
  }

  input.attackQueued = false;
  input.evadeQueued = false;

  if (game.state !== "playing") {
    return;
  }

  if (player.morphTimer <= 0) {
    if (input.blockHeld) {
      if (!player.blocking) {
        startBlock(player);
      }
    } else if (player.blocking) {
      stopBlock(player);
    }

    if (queuedAttack) {
      startAttack(player);
    }

    if (queuedEvade) {
      startEvade(player, move.x || Math.cos(player.facing), move.y || Math.sin(player.facing));
    }
  }
}

function updateEnemy(enemy, dt) {
  const { target, distance: dist } = findNearestTarget(enemy);
  if (!target) {
    enemy.moveIntent.x = 0;
    enemy.moveIntent.y = 0;
    enemy.sprinting = false;
    return;
  }

  const dx = target.x - enemy.x;
  const dy = target.y - enemy.y;
  const dir = normalize(dx, dy);
  const right = { x: -dir.y, y: dir.x };
  const desiredRange = enemy.radius + target.radius + enemy.stats.range * 0.72;

  enemy.desiredFacing = Math.atan2(dy, dx);
  enemy.moveIntent.x = 0;
  enemy.moveIntent.y = 0;
  enemy.sprinting = false;

  if (enemy.stunTimer <= 0 && enemy.morphTimer <= 0 && enemy.evadeTimer <= 0) {
    if (
      target.attackState &&
      target.attackState.windup > 0 &&
      dist < target.stats.range + target.radius + enemy.radius + 64 &&
      enemy.reactionCooldown <= 0
    ) {
      const roll = Math.random();
      if (roll < enemy.essence.ai.defense * 0.38 && enemy.evadeCooldown <= 0) {
        const escapeX = -dir.x + right.x * enemy.aiStrafeDir * 0.35;
        const escapeY = -dir.y + right.y * enemy.aiStrafeDir * 0.35;
        if (startEvade(enemy, escapeX, escapeY)) {
          enemy.reactionCooldown = 0.54;
        }
      } else if (roll < enemy.essence.ai.defense && !enemy.blocking) {
        if (startBlock(enemy, 0.46 + rand(0, 0.18))) {
          enemy.reactionCooldown = 0.58;
        }
      }
    }

    if (dist > desiredRange + 24) {
      enemy.moveIntent.x += dir.x;
      enemy.moveIntent.y += dir.y;
    } else if (dist < desiredRange * 0.7) {
      enemy.moveIntent.x -= dir.x * 0.8;
      enemy.moveIntent.y -= dir.y * 0.8;
    }

    enemy.moveIntent.x += right.x * enemy.aiStrafeDir * enemy.essence.ai.strafe * 0.52;
    enemy.moveIntent.y += right.y * enemy.aiStrafeDir * enemy.essence.ai.strafe * 0.52;
    enemy.moveIntent = normalize(enemy.moveIntent.x, enemy.moveIntent.y);

    if (
      dist <= desiredRange + 10 &&
      enemy.attackCooldown <= 0 &&
      !enemy.attackState &&
      !enemy.blocking &&
      Math.random() < enemy.essence.ai.aggression * dt * 4.6
    ) {
      startAttack(enemy);
    }

    if (Math.random() < 0.15 * dt) {
      enemy.aiStrafeDir *= -1;
    }
  }
}

function tickEntity(entity, dt) {
  entity.hitFlash = Math.max(0, entity.hitFlash - dt);
  entity.attackCooldown = Math.max(0, entity.attackCooldown - dt);
  entity.evadeCooldown = Math.max(0, entity.evadeCooldown - dt);
  entity.parryTimer = Math.max(0, entity.parryTimer - dt);
  entity.stunTimer = Math.max(0, entity.stunTimer - dt);
  entity.invulnTimer = Math.max(0, entity.invulnTimer - dt);
  entity.reactionCooldown = Math.max(0, entity.reactionCooldown - dt);

  if (entity.poisonTimer > 0) {
    entity.poisonTimer -= dt;
    entity.poisonTick += dt;
    if (entity.poisonTick >= 0.4) {
      entity.poisonTick = 0;
      dealDamage(entity, Math.max(2, entity.maxHp * 0.014), entity.poisonSource, "#9eff8f");
    }
  } else if (entity.poisonSource) {
    entity.poisonSource = null;
  }

  if (entity.blockTimer > 0) {
    entity.blockTimer -= dt;
    if (entity.blockTimer <= 0 && entity.team === "enemy") {
      stopBlock(entity);
    }
  }

  const energyRegenFactor = entity.blocking
    ? 0.16
    : entity.attackState
      ? 0.42
      : entity.morphTimer > 0
        ? 0.35
        : entity.sprinting
          ? 0.52
          : 1;
  entity.energy = clamp(0, entity.energy + entity.stats.energyRegen * energyRegenFactor * dt, entity.maxEnergy);

  if (entity.morphTimer > 0) {
    entity.morphTimer -= dt;
    if (Math.random() < 10 * dt) {
      spawnBurst(entity.x, entity.y, entity.essence.palette.trail, 4, 40, 0.28, 3);
    }
    if (entity.morphTimer <= 0 && entity.pendingFormIndex !== null) {
      const next = game.forms[entity.pendingFormIndex];
      game.currentFormIndex = entity.pendingFormIndex;
      applyEssence(entity, next, false);
      entity.pendingFormIndex = null;
      spawnBurst(entity.x, entity.y, entity.essence.palette.trail, 18, 140, 0.7, 6);
      addLog(`Morph locked: ${entity.essence.name}.`);
    }
  }

  if (entity.attackState) {
    if (!entity.attackState.done) {
      entity.attackState.windup -= dt;
      if (entity.attackState.windup <= 0) {
        entity.attackState.done = true;
        resolveAttack(entity);
      }
    } else {
      entity.attackState.recover -= dt;
      if (entity.attackState.recover <= 0) {
        entity.attackState = null;
      }
    }
  }

  if (entity.evadeTimer > 0) {
    entity.evadeTimer -= dt;
    const speed = entity.stats.evadeDistance / entity.stats.evadeDuration;
    entity.vx = entity.evadeDir.x * speed;
    entity.vy = entity.evadeDir.y * speed;

    if (entity.evadeTimer <= 0 && entity.essence.special === "shock") {
      spawnBurst(entity.x, entity.y, "#b8f1ff", 22, 180, 0.7, 6);
      const targets = entity.team === "player" ? game.enemies : [game.player];
      for (const target of targets) {
        if (!target || target.dead) {
          continue;
        }
        const dist = magnitude(target.x - entity.x, target.y - entity.y);
        if (dist < 110 + target.radius) {
          dealDamage(target, Math.max(8, entity.stats.damage * 0.35), entity, "#b8f1ff");
        }
      }
    }
  } else {
    const moveScale = entity.morphTimer > 0
      ? 0.28
      : entity.blocking
        ? entity.stats.blockMoveMultiplier
        : entity.attackState && !entity.attackState.done
          ? 0.42
          : entity.stunTimer > 0
            ? 0
            : currentFrenzyFactor(entity);

    const sprintMultiplier = entity.sprinting ? entity.stats.sprintMultiplier : 1;
    const targetSpeed = entity.stats.moveSpeed * moveScale * sprintMultiplier;
    entity.vx = lerp(entity.vx, entity.moveIntent.x * targetSpeed, dt * 12);
    entity.vy = lerp(entity.vy, entity.moveIntent.y * targetSpeed, dt * 12);
  }

  entity.facing = lerpAngle(entity.facing, entity.desiredFacing, dt * 12);
  entity.x += entity.vx * dt;
  entity.y += entity.vy * dt;

  collideWithArena(entity);
}

function collideWithArena(entity) {
  if (entity === game.player) {
    expandWorldAround(entity);
  }

  entity.x = clamp(WORLD.left + entity.radius + 18, entity.x, WORLD.right - entity.radius - 18);
  entity.y = clamp(WORLD.top + entity.radius + 18, entity.y, WORLD.bottom - entity.radius - 18);

  for (const obstacle of OBSTACLES) {
    const dx = entity.x - obstacle.x;
    const dy = entity.y - obstacle.y;
    const dist = Math.hypot(dx, dy);
    const limit = entity.radius + obstacle.r;
    if (dist < limit && dist > 0) {
      const push = (limit - dist) / dist;
      entity.x += dx * push;
      entity.y += dy * push;
    }
  }
}

function separateEntities() {
  const entities = [game.player, ...game.enemies];
  for (let i = 0; i < entities.length; i += 1) {
    for (let j = i + 1; j < entities.length; j += 1) {
      const a = entities[i];
      const b = entities[j];
      if (!a || !b || a.dead || b.dead) {
        continue;
      }
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 0.0001;
      const overlap = a.radius + b.radius - dist;
      if (overlap > 0) {
        const pushX = (dx / dist) * overlap * 0.5;
        const pushY = (dy / dist) * overlap * 0.5;
        a.x -= pushX;
        a.y -= pushY;
        b.x += pushX;
        b.y += pushY;
      }
    }
  }
}

function updateParticles(dt) {
  game.particles = game.particles.filter((particle) => {
    particle.life -= dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vx *= 0.98;
    particle.vy *= 0.98;
    return particle.life > 0;
  });
}

function updateMouseWorld() {
  const offsetX = game.viewWidth * 0.5 - game.camera.x;
  const offsetY = game.viewHeight * 0.5 - game.camera.y;
  input.mouse.worldX = input.mouse.x - offsetX;
  input.mouse.worldY = input.mouse.y - offsetY;
}

function updateCamera(dt) {
  const shake = game.camera.shake;
  game.camera.shake = Math.max(0, game.camera.shake - dt * 18);
  const minX = WORLD.left + game.viewWidth / 2;
  const maxX = WORLD.right - game.viewWidth / 2;
  const minY = WORLD.top + game.viewHeight / 2;
  const maxY = WORLD.bottom - game.viewHeight / 2;
  const targetX = clamp(minX, game.player.x, maxX);
  const targetY = clamp(minY, game.player.y, maxY);
  game.camera.x = lerp(game.camera.x, targetX, dt * 4.5);
  game.camera.y = lerp(game.camera.y, targetY, dt * 4.5);

  if (shake > 0) {
    game.camera.x += rand(-shake, shake);
    game.camera.y += rand(-shake, shake);
  }
}

function updateGame(dt) {
  if (game.bannerTimer > 0) {
    game.bannerTimer -= dt;
    if (game.bannerTimer <= 0) {
      ui.banner.classList.add("hidden");
    }
  }

  if (game.state === "dead") {
    updateParticles(dt);
    updateCamera(dt);
    return;
  }

  updatePlayer(dt);
  for (const enemy of game.enemies) {
    updateEnemy(enemy, dt);
  }

  tickEntity(game.player, dt);
  for (const enemy of game.enemies) {
    tickEntity(enemy, dt);
  }

  separateEntities();
  updatePickups(dt);
  updateParticles(dt);
  updateCamera(dt);

  if (game.enemies.length === 0 && game.nextWaveTimer === null) {
    game.nextWaveTimer = 2.3;
    addLog("The map is empty. More enemies are repopulating...");
    showBanner("No enemies remain. The arena repopulates.");
  }

  if (game.nextWaveTimer !== null) {
    game.nextWaveTimer -= dt;
    if (game.nextWaveTimer <= 0) {
      game.nextWaveTimer = null;
      game.wave += 1;
      spawnWave();
    }
  }

  game.uiRefresh -= dt;
  if (game.uiRefresh <= 0) {
    game.uiRefresh = 0.12;
    refreshHud();
  }
}

function refreshHud() {
  const player = game.player;
  const essence = player.essence;
  const hpPercent = clamp(0, player.hp / player.maxHp, 1) * 100;
  const energyPercent = clamp(0, player.energy / player.maxEnergy, 1) * 100;

  ui.waveLabel.textContent = String(game.wave);
  ui.enemiesLabel.textContent = String(game.enemies.length);
  ui.threatLabel.textContent = `${getThreatLevel().toFixed(1)}x`;
  ui.essenceCountLabel.textContent = String(game.forms.length);
  ui.killsLabel.textContent = String(game.kills);
  ui.hpFill.style.width = `${hpPercent}%`;
  ui.hpText.textContent = `${Math.max(0, Math.round(player.hp))} / ${Math.round(player.maxHp)}`;
  ui.energyFill.style.width = `${energyPercent}%`;
  ui.energyText.textContent = `${Math.round(player.energy)} / ${Math.round(player.maxEnergy)} energy`;
  ui.essenceName.textContent = essence.name;
  ui.essenceTags.textContent = `${essence.species} / ${essence.tags.join(" / ")}`;
  ui.specialName.textContent = essence.specialName;
  ui.specialText.textContent = essence.specialText;
  ui.powerLabel.textContent = essence.power.toFixed(1);

  for (const key of STAT_KEYS) {
    statFields[key].fill.style.width = `${clamp(0, essence.stats[key] / MAX_STAT, 1) * 100}%`;
    statFields[key].value.textContent = String(essence.stats[key]);
  }

  ui.morphList.innerHTML = game.forms
    .map((essenceItem, index) => {
      const active = index === game.currentFormIndex ? " active" : "";
      const pending = game.player.pendingFormIndex === index ? " pending" : "";
      return `
        <article class="morph-card${active}${pending}">
          <h3>${essenceItem.name}</h3>
          <p class="morph-meta">${essenceItem.specialName}</p>
          <p class="morph-meta">Power ${essenceItem.power.toFixed(1)} / ${essenceItem.tags.join(" / ")}</p>
        </article>
      `;
    })
    .join("");

  ui.log.innerHTML = game.logs
    .map((entry) => `<div class="log-entry">${entry}</div>`)
    .join("");
}

function drawBackground() {
  ctx.fillStyle = "#08111d";
  ctx.fillRect(WORLD.left, WORLD.top, WORLD.width, WORLD.height);

  const centerX = WORLD.left + WORLD.width * 0.5;
  const centerY = WORLD.top + WORLD.height * 0.5;
  const gradient = ctx.createRadialGradient(centerX, WORLD.top + WORLD.height * 0.46, 180, centerX, centerY, 1200);
  gradient.addColorStop(0, "rgba(62, 134, 201, 0.15)");
  gradient.addColorStop(0.5, "rgba(22, 42, 78, 0.08)");
  gradient.addColorStop(1, "rgba(6, 10, 19, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(WORLD.left, WORLD.top, WORLD.width, WORLD.height);

  ctx.strokeStyle = "rgba(168, 214, 255, 0.08)";
  ctx.lineWidth = 1;
  for (let x = Math.floor(WORLD.left / 120) * 120; x <= WORLD.right; x += 120) {
    ctx.beginPath();
    ctx.moveTo(x, WORLD.top);
    ctx.lineTo(x, WORLD.bottom);
    ctx.stroke();
  }
  for (let y = Math.floor(WORLD.top / 120) * 120; y <= WORLD.bottom; y += 120) {
    ctx.beginPath();
    ctx.moveTo(WORLD.left, y);
    ctx.lineTo(WORLD.right, y);
    ctx.stroke();
  }

  for (const obstacle of OBSTACLES) {
    ctx.fillStyle = obstacle.hue;
    ctx.beginPath();
    ctx.arc(obstacle.x, obstacle.y, obstacle.r + 10, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
    ctx.beginPath();
    ctx.arc(obstacle.x - obstacle.r * 0.16, obstacle.y - obstacle.r * 0.22, obstacle.r * 0.66, 0, TAU);
    ctx.fill();
  }
}

function drawPickups() {
  for (const pickup of game.pickups) {
    const bob = Math.sin(pickup.pulse) * 4;
    const y = pickup.y + bob;

    ctx.save();
    ctx.translate(pickup.x, y);

    const palette =
      pickup.type === "life"
        ? { outer: "#ff8e80", inner: "#ffe1c8" }
        : pickup.type === "energy"
          ? { outer: "#6fd5ff", inner: "#d8fcff" }
          : { outer: "#90f0bf", inner: "#f0ffd8" };

    ctx.fillStyle = "rgba(0, 0, 0, 0.24)";
    ctx.beginPath();
    ctx.ellipse(0, 18, 14, 8, 0, 0, TAU);
    ctx.fill();

    ctx.fillStyle = palette.outer;
    ctx.strokeStyle = palette.inner;
    ctx.lineWidth = 2;

    if (pickup.type === "life") {
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.bezierCurveTo(18, -28, 30, -3, 0, 18);
      ctx.bezierCurveTo(-30, -3, -18, -28, 0, -12);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (pickup.type === "energy") {
      ctx.beginPath();
      ctx.moveTo(0, -18);
      ctx.lineTo(12, -2);
      ctx.lineTo(2, -2);
      ctx.lineTo(14, 18);
      ctx.lineTo(-12, 2);
      ctx.lineTo(-2, 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.beginPath();
      for (let i = 0; i < 6; i += 1) {
        const angle = -Math.PI / 2 + (i / 6) * TAU;
        const px = Math.cos(angle) * 16;
        const py = Math.sin(angle) * 16;
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(6, 0);
      ctx.moveTo(0, -6);
      ctx.lineTo(0, 6);
      ctx.stroke();
    }

    ctx.restore();
  }
}

function drawAttackTelegraph(entity) {
  if (entity.attackState && !entity.attackState.done) {
    const progress = 1 - entity.attackState.windup / entity.stats.windup;
    ctx.save();
    ctx.translate(entity.x, entity.y);
    ctx.rotate(entity.facing);
    ctx.strokeStyle = entity.team === "player" ? "rgba(255, 215, 144, 0.9)" : "rgba(255, 130, 103, 0.9)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, entity.radius + entity.stats.range, -entity.stats.arc * 0.5, entity.stats.arc * 0.5);
    ctx.stroke();
    ctx.globalAlpha = 0.18 + progress * 0.2;
    ctx.fillStyle = entity.team === "player" ? "#ffd084" : "#ff8267";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, entity.radius + entity.stats.range, -entity.stats.arc * 0.5, entity.stats.arc * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  if (entity.blocking) {
    ctx.save();
    ctx.translate(entity.x, entity.y);
    ctx.rotate(entity.facing);
    ctx.strokeStyle = "rgba(240, 250, 255, 0.7)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, entity.radius + 8, -0.9, 0.9);
    ctx.stroke();
    ctx.restore();
  }
}

function drawHealthBar(entity) {
  const width = entity.radius * 2.2;
  const height = 6;
  const x = entity.x - width / 2;
  const y = entity.y - entity.radius - 18;
  const hpColor = entity.team === "player"
    ? "#ffd083"
    : entity.essence.variant === "boss"
      ? "#ff9c7c"
      : entity.essence.variant === "elite"
        ? "#ffd27c"
        : "#ff756b";
  const energyColor = entity.essence.variant === "boss" ? "#ffe3a8" : "#7fe1f5";

  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = hpColor;
  ctx.fillRect(x, y, width * clamp(0, entity.hp / entity.maxHp, 1), height);

  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
  ctx.fillRect(x, y + height + 2, width, 4);
  ctx.fillStyle = energyColor;
  ctx.fillRect(x, y + height + 2, width * clamp(0, entity.energy / entity.maxEnergy, 1), 4);
}

function drawEntity(entity) {
  const palette = entity.essence.palette;
  const alpha = entity.morphTimer > 0 ? 0.56 + Math.sin(entity.morphTimer * 24) * 0.18 : 1;

  drawAttackTelegraph(entity);
  drawHealthBar(entity);

  ctx.save();
  ctx.translate(entity.x, entity.y);
  ctx.rotate(entity.facing);
  ctx.globalAlpha = alpha;

  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.beginPath();
  ctx.ellipse(0, entity.radius * 0.7, entity.radius * 1.05, entity.radius * 0.64, 0, 0, TAU);
  ctx.fill();

  ctx.fillStyle = entity.hitFlash > 0 ? "#ffffff" : palette.body;
  ctx.strokeStyle = entity.team === "player" ? "#fff1bf" : palette.accent;
  ctx.lineWidth = entity.team === "player" ? 3.2 : 2.4;

  switch (entity.essence.shape) {
    case "duelist":
      ctx.beginPath();
      ctx.moveTo(entity.radius * 0.8, 0);
      ctx.lineTo(0, -entity.radius * 0.82);
      ctx.lineTo(-entity.radius * 0.7, 0);
      ctx.lineTo(0, entity.radius * 0.82);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = palette.accent;
      ctx.beginPath();
      ctx.arc(entity.radius * 0.12, -entity.radius * 0.78, entity.radius * 0.32, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = "#fef3d7";
      ctx.beginPath();
      ctx.moveTo(entity.radius * 0.6, -entity.radius * 0.18);
      ctx.lineTo(entity.radius * 1.5, -entity.radius * 0.72);
      ctx.stroke();
      break;
    case "brute":
      ctx.beginPath();
      ctx.roundRect(-entity.radius * 0.95, -entity.radius * 0.8, entity.radius * 1.8, entity.radius * 1.6, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = palette.accent;
      ctx.beginPath();
      ctx.moveTo(-entity.radius * 0.58, -entity.radius * 0.92);
      ctx.lineTo(-entity.radius * 0.25, -entity.radius * 1.35);
      ctx.lineTo(0, -entity.radius * 0.9);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(entity.radius * 0.58, -entity.radius * 0.92);
      ctx.lineTo(entity.radius * 0.2, -entity.radius * 1.35);
      ctx.lineTo(0, -entity.radius * 0.9);
      ctx.fill();
      break;
    case "stalker":
      ctx.beginPath();
      ctx.moveTo(entity.radius * 1.05, 0);
      ctx.lineTo(-entity.radius * 0.2, -entity.radius * 0.88);
      ctx.lineTo(-entity.radius * 0.88, -entity.radius * 0.28);
      ctx.lineTo(-entity.radius * 0.72, entity.radius * 0.32);
      ctx.lineTo(-entity.radius * 0.12, entity.radius * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-entity.radius * 0.7, 0);
      ctx.lineTo(-entity.radius * 1.45, 0);
      ctx.stroke();
      break;
    case "hopper":
      ctx.beginPath();
      ctx.ellipse(0, 0, entity.radius * 0.94, entity.radius * 0.72, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-entity.radius * 0.5, entity.radius * 0.2);
      ctx.lineTo(-entity.radius * 1.05, entity.radius * 1.02);
      ctx.moveTo(entity.radius * 0.5, entity.radius * 0.2);
      ctx.lineTo(entity.radius * 1.05, entity.radius * 1.02);
      ctx.stroke();
      ctx.fillStyle = palette.accent;
      ctx.beginPath();
      ctx.arc(-entity.radius * 0.2, -entity.radius * 0.34, entity.radius * 0.18, 0, TAU);
      ctx.arc(entity.radius * 0.2, -entity.radius * 0.34, entity.radius * 0.18, 0, TAU);
      ctx.fill();
      break;
    case "shade":
      ctx.beginPath();
      ctx.moveTo(entity.radius * 0.82, 0);
      for (let i = 1; i <= 7; i += 1) {
        const angle = (i / 7) * TAU;
        const r = entity.radius * (0.55 + Math.sin(i * 2.4 + performance.now() * 0.01) * 0.08);
        ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    case "sentinel":
      ctx.beginPath();
      for (let i = 0; i < 6; i += 1) {
        const angle = -Math.PI / 6 + (i / 6) * TAU;
        const r = entity.radius * (i % 2 === 0 ? 1.06 : 0.76);
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    default:
      ctx.beginPath();
      ctx.arc(0, 0, entity.radius, 0, TAU);
      ctx.fill();
      ctx.stroke();
      break;
  }

  if (entity.essence.special === "poison") {
    ctx.strokeStyle = "rgba(159, 255, 139, 0.75)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, entity.radius + 5, 0, TAU);
    ctx.stroke();
  }

  if (entity.team === "enemy" && entity.essence.variant === "elite") {
    ctx.strokeStyle = "rgba(255, 210, 124, 0.92)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, entity.radius + 10, 0, TAU);
    ctx.stroke();
  }

  if (entity.team === "enemy" && entity.essence.variant === "boss") {
    ctx.strokeStyle = "rgba(255, 156, 124, 0.96)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < 5; i += 1) {
      const angle = -Math.PI / 2 + (i / 5) * TAU;
      const radius = i % 2 === 0 ? entity.radius + 13 : entity.radius + 7;
      const px = Math.cos(angle) * radius;
      const py = Math.sin(angle) * radius;
      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.closePath();
    ctx.stroke();
  }

  if (entity.team === "player") {
    ctx.strokeStyle = "rgba(255, 242, 188, 0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, entity.radius + 8 + Math.sin(performance.now() * 0.01) * 1.4, 0, TAU);
    ctx.stroke();
  }

  ctx.restore();
}

function drawParticles() {
  for (const particle of game.particles) {
    const alpha = clamp(0, particle.life / particle.maxLife, 1);
    if (particle.kind === "text") {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.font = "bold 16px Trebuchet MS";
      ctx.textAlign = "center";
      ctx.fillText(particle.text, particle.x, particle.y);
      ctx.restore();
    } else {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  }
}

function render() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(game.dpr, 0, 0, game.dpr, 0, 0);

  ctx.fillStyle = "#040710";
  ctx.fillRect(0, 0, game.viewWidth, game.viewHeight);

  const cameraX = game.viewWidth * 0.5 - game.camera.x;
  const cameraY = game.viewHeight * 0.5 - game.camera.y;
  ctx.save();
  ctx.translate(cameraX, cameraY);

  drawBackground();
  drawPickups();
  const drawables = [game.player, ...game.enemies].sort((a, b) => a.y - b.y);
  for (const entity of drawables) {
    drawEntity(entity);
  }
  drawParticles();

  ctx.restore();

  if (game.player.morphTimer > 0) {
    ctx.save();
    ctx.fillStyle = "rgba(255, 212, 135, 0.15)";
    ctx.fillRect(0, 0, game.viewWidth, game.viewHeight);
    ctx.restore();
  }
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);

  if (game) {
    game.dpr = dpr;
    game.viewWidth = rect.width;
    game.viewHeight = rect.height;
  }
}

function frame(now) {
  const dt = Math.min(0.033, (now - game.lastTime) / 1000);
  game.lastTime = now;
  updateGame(dt);
  render();
  requestAnimationFrame(frame);
}

function handleKeyDown(event) {
  input.keys.add(event.code);

  if (event.code === "KeyO") {
    event.preventDefault();
    toggleFullscreenMode();
  }
  if (event.code === "KeyP") {
    event.preventDefault();
    toggleCanvasOnlyMode();
  }
  if (event.code === "KeyF") {
    input.attackQueued = true;
  }
  if (event.code === "Space") {
    event.preventDefault();
    input.evadeQueued = true;
  }
  if (event.code === "KeyQ") {
    queueMorph(-1);
  }
  if (event.code === "KeyE") {
    queueMorph(1);
  }
  if (event.code === "KeyR" && game.state === "dead") {
    startRun();
  }

  syncHeldActions();
}

function handleKeyUp(event) {
  input.keys.delete(event.code);
  syncHeldActions();
}

function syncHeldActions() {
  input.blockHeld =
    input.keys.has("ShiftLeft") ||
    input.keys.has("ShiftRight") ||
    input.mouse.right ||
    input.touchBlockHeld;
  input.sprintHeld =
    input.keys.has("KeyC") ||
    input.keys.has("ControlLeft") ||
    input.keys.has("ControlRight") ||
    input.touchSprintHeld;
}

function updateDisplayButtons() {
  const fullscreenActive = document.fullscreenElement === ui.shell;
  ui.shell.classList.toggle("is-fullscreen", fullscreenActive);
  ui.fullscreenButton.textContent = fullscreenActive ? "Exit Fullscreen" : "Fullscreen";
  ui.canvasOnlyButton.textContent = displayState.canvasOnly ? "Show GUI" : "Canvas Only";
  ui.fullscreenButton.classList.toggle("active", fullscreenActive);
  ui.canvasOnlyButton.classList.toggle("active", displayState.canvasOnly);
  ui.fullscreenButton.setAttribute("aria-pressed", String(fullscreenActive));
  ui.canvasOnlyButton.setAttribute("aria-pressed", String(displayState.canvasOnly));
}

function setCanvasOnlyMode(enabled) {
  displayState.canvasOnly = enabled;
  document.body.classList.toggle("canvas-only-mode", enabled);
  resizeCanvas();
  updateDisplayButtons();
}

async function requestGameFullscreen() {
  if (!ui.shell.requestFullscreen || document.fullscreenElement === ui.shell) {
    return;
  }

  try {
    await ui.shell.requestFullscreen();
  } catch (error) {
    if (game) {
      addLog("Fullscreen request was blocked by the browser.");
    }
  }
}

async function toggleFullscreenMode() {
  if (document.fullscreenElement === ui.shell) {
    await document.exitFullscreen();
  } else {
    await requestGameFullscreen();
  }

  resizeCanvas();
  updateDisplayButtons();
}

async function toggleCanvasOnlyMode() {
  const nextState = !displayState.canvasOnly;
  setCanvasOnlyMode(nextState);

  if (nextState && document.fullscreenElement !== ui.shell) {
    await requestGameFullscreen();
  }

  resizeCanvas();
  updateDisplayButtons();
}

function updateMobileMode() {
  const mobile = window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 820;
  document.body.classList.toggle("mobile-mode", mobile);
  ui.mobileControls.classList.toggle("hidden", !mobile);
}

function bindTouchButton(button) {
  const action = button.dataset.touch;
  if (!action) {
    return;
  }

  const release = () => {
    button.classList.remove("active");
    if (action === "move-up") {
      input.touchDirections.delete("up");
    } else if (action === "move-down") {
      input.touchDirections.delete("down");
    } else if (action === "move-left") {
      input.touchDirections.delete("left");
    } else if (action === "move-right") {
      input.touchDirections.delete("right");
    } else if (action === "attack") {
      input.attackHeld = false;
    } else if (action === "block") {
      input.touchBlockHeld = false;
      syncHeldActions();
    } else if (action === "sprint") {
      input.touchSprintHeld = false;
      syncHeldActions();
    }
  };

  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    button.classList.add("active");
    button.setPointerCapture(event.pointerId);

    if (action === "move-up") {
      input.touchDirections.add("up");
    } else if (action === "move-down") {
      input.touchDirections.add("down");
    } else if (action === "move-left") {
      input.touchDirections.add("left");
    } else if (action === "move-right") {
      input.touchDirections.add("right");
    } else if (action === "attack") {
      input.attackHeld = true;
      input.attackQueued = true;
    } else if (action === "block") {
      input.touchBlockHeld = true;
      syncHeldActions();
    } else if (action === "evade") {
      input.evadeQueued = true;
    } else if (action === "sprint") {
      input.touchSprintHeld = true;
      syncHeldActions();
    } else if (action === "morph-prev") {
      queueMorph(-1);
    } else if (action === "morph-next") {
      queueMorph(1);
    }
  });

  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", release);
}

function installInput() {
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  window.addEventListener("blur", () => {
    input.keys.clear();
    input.touchDirections.clear();
    input.attackQueued = false;
    input.attackHeld = false;
    input.evadeQueued = false;
    input.mouse.left = false;
    input.mouse.right = false;
    input.touchBlockHeld = false;
    input.touchSprintHeld = false;
    syncHeldActions();
  });

  canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    input.mouse.x = event.clientX - rect.left;
    input.mouse.y = event.clientY - rect.top;
    input.mouse.inside = true;
  });

  canvas.addEventListener("mouseenter", () => {
    input.mouse.inside = true;
  });

  canvas.addEventListener("mouseleave", () => {
    input.mouse.inside = false;
  });

  canvas.addEventListener("mousedown", (event) => {
    if (event.button === 0) {
      input.mouse.left = true;
      input.attackQueued = true;
    }
    if (event.button === 2) {
      input.mouse.right = true;
      syncHeldActions();
    }
  });

  window.addEventListener("mouseup", (event) => {
    if (event.button === 0) {
      input.mouse.left = false;
    }
    if (event.button === 2) {
      input.mouse.right = false;
      syncHeldActions();
    }
  });

  canvas.addEventListener("contextmenu", (event) => event.preventDefault());
  canvas.addEventListener(
    "wheel",
    (event) => {
      event.preventDefault();
      queueMorph(event.deltaY > 0 ? 1 : -1);
    },
    { passive: false }
  );

  for (const button of ui.mobileControls.querySelectorAll("[data-touch]")) {
    bindTouchButton(button);
  }

  ui.restartButton.addEventListener("click", () => startRun());
  ui.fullscreenButton.addEventListener("click", () => {
    toggleFullscreenMode();
  });
  ui.canvasOnlyButton.addEventListener("click", () => {
    toggleCanvasOnlyMode();
  });

  document.addEventListener("fullscreenchange", () => {
    if (document.fullscreenElement !== ui.shell && displayState.canvasOnly) {
      setCanvasOnlyMode(false);
    } else {
      updateDisplayButtons();
      resizeCanvas();
    }
  });

  window.addEventListener("resize", () => {
    resizeCanvas();
    updateMobileMode();
    updateDisplayButtons();
  });

  updateMobileMode();
  updateDisplayButtons();
}

installInput();
startRun();
resizeCanvas();
requestAnimationFrame(frame);
