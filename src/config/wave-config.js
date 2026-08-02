// Wave data restructured into missions for neoDefense-style progression

export const WAVE_DATA = [
  // ==================== MISSION 1: TUTORIAL (Cannons & Boosters) ====================
  // Wave 1: Simple intro with basic robots
  { robot: 4, spider: 0, heavybot: 0, drone: 0, golem: 0, boss: 0 },
  // Wave 2: Add some spiders for speed challenge
  { robot: 4, spider: 3, heavybot: 0, drone: 0, golem: 0, boss: 0 },
  // Wave 3: Introduce heavybots - test cannon splash damage
  { robot: 6, spider: 2, heavybot: 3, drone: 0, golem: 0, boss: 0 },
  // Wave 4: Mixed enemies with drones (flying)
  { robot: 8, spider: 4, heavybot: 2, drone: 3, golem: 0, boss: 0 },
  // Wave 5: Mission 1 finale - boss wave!
  { robot: 10, spider: 5, heavybot: 3, drone: 4, golem: 1, boss: 1 },

  // ==================== MISSION 2: EXPANSION (Vulcan + new enemies) ====================
  // Wave 6: Fast enemies introduced - test vulcan rapid fire
  { fast: 8, robot: 5, spider: 3, heavybot: 0, drone: 2, golem: 0, boss: 0 },
  // Wave 7: Armored enemies - test missile homing
  { fast: 5, robot: 6, armored: 3, heavybot: 2, drone: 0, golem: 1, boss: 0 },
  // Wave 8: Regenerators - must keep damaging them
  { fast: 6, regenerator: 4, robot: 8, heavybot: 3, drone: 2, golem: 0, boss: 0 },
  // Wave 9: Splitters - manage the swarm they create
  { fast: 8, splitter: 4, robot: 6, spider: 5, heavybot: 2, drone: 3, boss: 0 },
  // Wave 10: Mission 2 finale - big boss wave!
  { fast: 10, armored: 5, regenerator: 4, splitter: 3, robot: 10, heavybot: 5, drone: 6, golem: 2, boss: 1 },

  // ==================== MISSION 3: FULL FORCE (All enemies) ====================
  // Wave 11: Everything starts mixing together
  { fast: 8, armored: 4, regenerator: 3, splitter: 2, robot: 10, spider: 8, heavybot: 5, drone: 4, golem: 2, boss: 0 },
  // Wave 12: Heavy on regenerators and splitters
  { fast: 6, armored: 3, regenerator: 6, splitter: 5, robot: 8, spider: 6, heavybot: 4, drone: 5, golem: 1, boss: 0 },
  // Wave 13: Armored wall with fast flanking
  { fast: 12, armored: 8, regenerator: 3, splitter: 4, robot: 6, spider: 10, heavybot: 6, drone: 3, golem: 2, boss: 0 },
  // Wave 14: Massive wave with multiple bosses
  { fast: 10, armored: 6, regenerator: 5, splitter: 4, robot: 12, spider: 8, heavybot: 8, drone: 6, golem: 3, boss: 2 },
  // Wave 15: Final boss wave - ultimate challenge!
  { fast: 15, armored: 8, regenerator: 6, splitter: 6, robot: 15, spider: 10, heavybot: 10, drone: 8, golem: 4, boss: 3 },

  // ==================== MISSION 4: ADVANCED TACTICS (Bombers, Stealth, Swarm) ====================
  // Wave 16: Bombers introduced - watch for explosions near turrets
  { bomber: 5, fast: 6, robot: 8, spider: 4, heavybot: 2, drone: 3, golem: 0, boss: 0 },
  // Wave 17: Stealth enemies - they phase in and out of visibility
  { stealth: 6, fast: 8, robot: 6, spider: 5, heavybot: 3, drone: 2, golem: 1, boss: 0 },
  // Wave 18: Swarm wave - tons of tiny fast enemies
  { swarm: 25, fast: 10, robot: 8, spider: 6, heavybot: 2, drone: 4, golem: 0, boss: 0 },
  // Wave 19: Mixed advanced enemies - bombers + stealth + swarm
  { bomber: 4, stealth: 5, swarm: 15, fast: 8, robot: 6, spider: 4, heavybot: 3, drone: 2, golem: 1, boss: 0 },
  // Wave 20: Mission 4 finale - advanced boss wave!
  { bomber: 6, stealth: 8, swarm: 20, fast: 12, armored: 4, regenerator: 3, splitter: 2, robot: 10, heavybot: 6, drone: 5, golem: 2, boss: 1 },

  // ==================== MISSION 5: ENDGAME (Shielded, Healers, Mini Bosses) ====================
  // Wave 21: Shielded enemies - break through their shields first
  { shielded: 6, fast: 8, robot: 10, spider: 6, heavybot: 4, drone: 3, golem: 1, boss: 0 },
  // Wave 22: Healers - they keep enemies alive, focus them down!
  { healer: 4, shielded: 5, fast: 10, robot: 8, spider: 6, heavybot: 4, drone: 3, golem: 1, boss: 0 },
  // Wave 23: Mini bosses - powerful enemies with special abilities
  { boss_mini: 4, shielded: 6, healer: 3, fast: 12, robot: 8, spider: 6, heavybot: 5, drone: 4, golem: 2, boss: 0 },
  // Wave 24: Ultimate mix - everything throws at you
  { bomber: 5, stealth: 6, swarm: 18, shielded: 8, healer: 5, boss_mini: 3, fast: 15, armored: 6, regenerator: 4, splitter: 4, robot: 12, spider: 8, heavybot: 6, drone: 5, golem: 3, boss: 1 },
  // Wave 25: FINAL WAVE - The ultimate neoDefense challenge!
  { bomber: 8, stealth: 10, swarm: 30, shielded: 10, healer: 6, boss_mini: 5, fast: 20, armored: 10, regenerator: 8, splitter: 6, robot: 20, spider: 15, heavybot: 12, drone: 10, golem: 5, boss: 3 },
];

// Mission definitions for UI progression display
export const MISSIONS = [
  {
    id: 1,
    name: "Tutorial",
    description: "Learn the basics - Cannons and Boosters",
    startWave: 0,
    endWave: 4, // waves 1-5 (index 0-4)
    unlockedTurrets: ["cannon", "booster"],
  },
  {
    id: 2,
    name: "Expansion",
    description: "New weapons - Vulcan and Missile turrets",
    startWave: 5,
    endWave: 9, // waves 6-10 (index 5-9)
    unlockedTurrets: ["cannon", "booster", "vulcan", "missile"],
  },
  {
    id: 3,
    name: "Full Force",
    description: "All enemies - ultimate challenge",
    startWave: 10,
    endWave: 14, // waves 11-15 (index 10-14)
    unlockedTurrets: ["cannon", "booster", "vulcan", "missile"],
  },
  {
    id: 4,
    name: "Advanced Tactics",
    description: "Bombers, Stealth, and Swarm enemies",
    startWave: 15,
    endWave: 19, // waves 16-20 (index 15-19)
    unlockedTurrets: ["cannon", "booster", "vulcan", "missile"],
  },
  {
    id: 5,
    name: "Endgame",
    description: "Shielded, Healers, and Mini Bosses - the final challenge!",
    startWave: 20,
    endWave: 24, // waves 21-25 (index 20-24)
    unlockedTurrets: ["cannon", "booster", "vulcan", "missile"],
  },
];

// Helper to get current mission based on wave index
export function getCurrentMission(waveIndex) {
  for (const mission of MISSIONS) {
    if (waveIndex >= mission.startWave && waveIndex <= mission.endWave) {
      return mission;
    }
  }
  return null;
}

// Helper to get unlocked turrets for current mission
export function getUnlockedTurretTypes(waveIndex) {
  const mission = getCurrentMission(waveIndex);
  return mission ? mission.unlockedTurrets : ["cannon", "booster"];
}
