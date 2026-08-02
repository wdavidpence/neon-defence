export const enemyClassTypes = {
  robot: {
    name: "robot",
    sprite: "robot",
    health: 100,
    sound: { name: "dead", audio: "dead-enemy" },
    speed: 50,
    resources: 25,
    glowColor: 0xff3333, // red
  },
  heavybot: {
    name: "heavybot",
    sprite: "heavybot",
    health: 150,
    sound: { name: "dead", audio: "dead" },
    speed: 40,
    resources: 75,
    glowColor: 0x9933ff, // purple
  },
  spider: {
    name: "spider",
    sprite: "spider",
    health: 100,
    sound: { name: "dead", audio: "dead" },
    speed: 100,
    resources: 75,
    glowColor: 0xff8833, // orange
  },
  drone: {
    name: "drone",
    sprite: "drone",
    health: 125,
    sound: { name: "dead", audio: "dead" },
    speed: 75,
    resources: 125,
    glowColor: 0xff33ff, // magenta
  },
  golem: {
    name: "golem",
    sprite: "golem",
    health: 300,
    sound: { name: "dead", audio: "dead" },
    speed: 30,
    resources: 150,
    glowColor: 0x888888, // gray
  },
  boss: {
    name: "boss",
    sprite: "boss",
    health: 1000,
    sound: { name: "dead-boss", audio: "dead-boss" },
    speed: 25,
    resources: 300,
    glowColor: 0xff0000, // bright red
  },

  // ==================== NEO DEFENSE ENEMIES ====================

  fast: {
    name: "fast",
    sprite: "fast",
    health: 40,
    sound: { name: "dead-fast", audio: "dead-enemy" },
    speed: 150, // very fast
    resources: 30,
    glowColor: 0x00ff88, // bright green
    type: "fast", // for special handling
  },
  armored: {
    name: "armored",
    sprite: "armored",
    health: 400,
    sound: { name: "dead-armored", audio: "dead" },
    speed: 25, // slow and tough
    resources: 100,
    glowColor: 0x6666ff, // blue-gray
    type: "armored", // takes reduced splash damage
  },
  regenerator: {
    name: "regenerator",
    sprite: "regenerator",
    health: 200,
    sound: { name: "dead-regen", audio: "dead" },
    speed: 45,
    resources: 80,
    glowColor: 0x33ff33, // bright green
    type: "regenerator", // heals over time when not taking damage
  },
  splitter: {
    name: "splitter",
    sprite: "splitter",
    health: 150,
    sound: { name: "dead-splitter", audio: "dead" },
    speed: 55,
    resources: 60,
    glowColor: 0xff3399, // pink
    type: "splitter", // splits into 2 smaller enemies on death
  },

  // ==================== NEW NEO DEFENSE ENEMIES (Iteration 6) ====================

  bomber: {
    name: "bomber",
    sprite: "bomber",
    health: 120,
    sound: { name: "dead-bomber", audio: "dead-enemy" },
    speed: 60,
    resources: 70,
    glowColor: 0xff8800, // orange-red
    type: "bomber", // explodes on death dealing damage to nearby turrets
  },

  stealth: {
    name: "stealth",
    sprite: "stealth",
    health: 80,
    sound: { name: "dead-stealth", audio: "dead-enemy" },
    speed: 80,
    resources: 90,
    glowColor: 0x8888ff, // light blue (faint when stealthed)
    type: "stealth", // invisible for periods of time, only visible when targeted
  },

  swarm: {
    name: "swarm",
    sprite: "swarm",
    health: 25,
    sound: { name: "dead-swarm", audio: "dead-enemy" },
    speed: 120, // fast like fast enemy
    resources: 15, // low reward but spawns in huge numbers
    glowColor: 0xffff00, // bright yellow
    type: "swarm", // very weak but spawns in huge numbers
  },

  shielded: {
    name: "shielded",
    sprite: "shielded",
    health: 250,
    sound: { name: "dead-shielded", audio: "dead" },
    speed: 35, // slow like armored
    resources: 120,
    glowColor: 0x44aaff, // bright blue
    type: "shielded", // has a shield that absorbs 50% of damage until broken
    shieldHealth: 125, // separate shield health pool
  },

  healer: {
    name: "healer",
    sprite: "healer",
    health: 180,
    sound: { name: "dead-healer", audio: "dead" },
    speed: 40,
    resources: 150, // high reward because it's dangerous
    glowColor: 0x88ff88, // light green
    type: "healer", // heals nearby enemies within range
    healRange: 100, // pixels
    healAmount: 2, // health per tick
  },

  boss_mini: {
    name: "boss-mini",
    sprite: "boss-mini",
    health: 500,
    sound: { name: "dead-boss", audio: "dead-boss" },
    speed: 30,
    resources: 200,
    glowColor: 0xff4444, // bright red
    type: "boss_mini", // mini boss with special abilities
  },

  // Baby splitter (spawned from splitter death) - already defined in SpriteGenerator
};
