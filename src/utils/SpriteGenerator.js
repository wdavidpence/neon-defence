/**
 * SpriteGenerator - Generates placeholder sprites at runtime using Phaser Graphics
 * Creates visual representations for new turrets and enemies that don't have image files.
 */

export class SpriteGenerator {
  /**
   * Generate all sprites needed for the game
   */
  static generateAll(scene) {
    this.generateTurretSprites(scene);
    this.generateExistingTurretSprites(scene); // Add sprites for existing turrets
    this.generateEnemySprites(scene);
  }

  /**
   * Generate sprites for existing turret types (auto, laser, shotgun, antiAir, human)
   */
  static generateExistingTurretSprites(scene) {
    // Auto turret sprites (3 levels) - basic round turret
    this.generateAutoTurretSprite(scene, 'turret', 0xffffff);
    this.generateAutoTurretSprite(scene, 'turret2', 0xcccccc);
    this.generateAutoTurretSprite(scene, 'turret3', 0x999999);

    // Laser turret sprites (3 levels) - green laser cannon
    this.generateLaserTurretSprite(scene, 'laser', 0x00ff00);
    this.generateLaserTurretSprite(scene, 'laser2', 0x00cc00);
    this.generateLaserTurretSprite(scene, 'laser3', 0x009900);

    // Shotgun turret sprites (3 levels) - wide barrel
    this.generateShotgunTurretSprite(scene, 'shotgun', 0xffaa00);
    this.generateShotgunTurretSprite(scene, 'shotgun2', 0xcc8800);
    this.generateShotgunTurretSprite(scene, 'shotgun3', 0x996600);

    // Anti-air turret sprites (3 levels) - dual barrel
    this.generateAntiAirTurretSprite(scene, 'antiAir', 0xffffff);
    this.generateAntiAirTurretSprite(scene, 'antiAir2', 0xcccccc);
    this.generateAntiAirTurretSprite(scene, 'antiAir3', 0x999999);

    // Human turret sprites (3 levels) - plasma cannon
    this.generateHumanTurretSprite(scene, 'human1', 0x00aaff);
    this.generateHumanTurretSprite(scene, 'human2', 0x0088cc);
    this.generateHumanTurretSprite(scene, 'human3', 0x006699);
  }

  /**
   * Generate Auto turret sprite - basic round turret with single barrel
   */
  static generateAutoTurretSprite(scene, key, color) {
    const graphics = scene.add.graphics();

    // Base platform
    graphics.fillStyle(0x333333, 1);
    graphics.fillRoundedRect(-18, -14, 36, 28, 4);

    // Turret body (round)
    graphics.fillStyle(color, 1);
    graphics.fillCircle(0, -3, 12);

    // Barrel pointing up
    graphics.fillStyle(0x666666, 1);
    graphics.fillRect(-5, -22, 10, 18);

    // Barrel tip
    graphics.fillStyle(0x888888, 1);
    graphics.fillRect(-6, -24, 12, 5);

    // Detail lines
    graphics.lineStyle(2, 0x555555, 1);
    graphics.strokeRect(-16, -12, 32, 24);

    // Generate texture
    scene.textures.addCanvas(key, graphics.generateTexture(key, 48, 48));
    graphics.destroy();
  }

  /**
   * Generate Laser turret sprite - green laser cannon with energy core
   */
  static generateLaserTurretSprite(scene, key, color) {
    const graphics = scene.add.graphics();

    // Base platform
    graphics.fillStyle(0x333333, 1);
    graphics.fillRoundedRect(-20, -15, 40, 30, 4);

    // Laser cannon body
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(-8, -30, 16, 25, 3);

    // Energy core
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(0, -15, 5);

    // Lens at top
    graphics.fillStyle(0x88ff88, 1);
    graphics.fillCircle(0, -32, 4);

    // Detail lines
    graphics.lineStyle(2, 0x555555, 1);
    graphics.strokeRect(-18, -13, 36, 26);

    // Generate texture
    scene.textures.addCanvas(key, graphics.generateTexture(key, 48, 64));
    graphics.destroy();
  }

  /**
   * Generate Shotgun turret sprite - wide barrel for spread shot
   */
  static generateShotgunTurretSprite(scene, key, color) {
    const graphics = scene.add.graphics();

    // Base platform
    graphics.fillStyle(0x333333, 1);
    graphics.fillRoundedRect(-20, -15, 40, 30, 4);

    // Shotgun body (wider)
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(-12, -28, 24, 23, 3);

    // Wide barrel
    graphics.fillStyle(0x666666, 1);
    graphics.fillRect(-14, -38, 28, 15);

    // Barrel openings
    graphics.fillStyle(0x333333, 1);
    graphics.fillCircle(-8, -38, 4);
    graphics.fillCircle(0, -38, 4);
    graphics.fillCircle(8, -38, 4);

    // Detail lines
    graphics.lineStyle(2, 0x555555, 1);
    graphics.strokeRect(-18, -13, 36, 26);

    // Generate texture
    scene.textures.addCanvas(key, graphics.generateTexture(key, 48, 64));
    graphics.destroy();
  }

  /**
   * Generate Anti-air turret sprite - dual barrel for flying enemies
   */
  static generateAntiAirTurretSprite(scene, key, color) {
    const graphics = scene.add.graphics();

    // Base platform
    graphics.fillStyle(0x333333, 1);
    graphics.fillRoundedRect(-20, -15, 40, 30, 4);

    // Dual barrels
    graphics.fillStyle(color, 1);
    graphics.fillRect(-16, -30, 10, 25);
    graphics.fillRect(6, -30, 10, 25);

    // Barrel tips
    graphics.fillStyle(0x666666, 1);
    graphics.fillRect(-18, -34, 14, 6);
    graphics.fillRect(4, -34, 14, 6);

    // Detail lines
    graphics.lineStyle(2, 0x555555, 1);
    graphics.strokeRect(-18, -13, 36, 26);

    // Generate texture
    scene.textures.addCanvas(key, graphics.generateTexture(key, 48, 64));
    graphics.destroy();
  }

  /**
   * Generate Human turret sprite - plasma cannon with energy core
   */
  static generateHumanTurretSprite(scene, key, color) {
    const graphics = scene.add.graphics();

    // Base platform
    graphics.fillStyle(0x333333, 1);
    graphics.fillRoundedRect(-20, -15, 40, 30, 4);

    // Plasma cannon body
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(-10, -32, 20, 27, 4);

    // Energy core
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(0, -18, 6);

    // Plasma emitter
    graphics.fillStyle(0x88ddff, 1);
    graphics.fillCircle(0, -34, 5);

    // Detail lines
    graphics.lineStyle(2, 0x555555, 1);
    graphics.strokeRect(-18, -13, 36, 26);

    // Generate texture
    scene.textures.addCanvas(key, graphics.generateTexture(key, 48, 64));
    graphics.destroy();
  }

  /**
   * Generate turret sprites for all new turret types
   */
  static generateTurretSprites(scene) {
    // Cannon sprites (3 levels)
    this.generateCannonSprite(scene, 'cannon1', 0xff8800);
    this.generateCannonSprite(scene, 'cannon2', 0xff6600);
    this.generateCannonSprite(scene, 'cannon3', 0xff4400);

    // Vulcan sprites (3 levels)
    this.generateVulcanSprite(scene, 'vulcan1', 0xffff00);
    this.generateVulcanSprite(scene, 'vulcan2', 0xffdd00);
    this.generateVulcanSprite(scene, 'vulcan3', 0xffbb00);

    // Missile sprites (3 levels)
    this.generateMissileSprite(scene, 'missile1', 0x00ffff);
    this.generateMissileSprite(scene, 'missile2', 0x00dddd);
    this.generateMissileSprite(scene, 'missile3', 0x00bbbb);

    // Booster sprites (3 levels)
    this.generateBoosterSprite(scene, 'booster1', 0x4488ff);
    this.generateBoosterSprite(scene, 'booster2', 0x3377ee);
    this.generateBoosterSprite(scene, 'booster3', 0x2266dd);
  }

  /**
   * Generate enemy sprites for all new enemy types
   */
  static generateEnemySprites(scene) {
    // Fast enemy sprite
    this.generateFastSprite(scene, 'fast', 0x00ff88);

    // Armored enemy sprite
    this.generateArmoredSprite(scene, 'armored', 0x6666ff);

    // Regenerator enemy sprite
    this.generateRegeneratorSprite(scene, 'regenerator', 0x33ff33);

    // Splitter enemy sprite
    this.generateSplitterSprite(scene, 'splitter', 0xff3399);

    // Baby splitter sprite (smaller version)
    this.generateBabySplitterSprite(scene, 'baby-splitter', 0xff6699);

    // ==================== NEW ENEMIES (Iteration 6) ====================

    // Bomber sprite - explosive enemy
    this.generateBomberSprite(scene, 'bomber', 0xff8800);

    // Stealth sprite - invisible enemy
    this.generateStealthSprite(scene, 'stealth', 0x8888ff);

    // Swarm sprite - tiny fast enemy
    this.generateSwarmSprite(scene, 'swarm', 0xffff00);

    // Shielded sprite - enemy with shield
    this.generateShieldedSprite(scene, 'shielded', 0x44aaff);

    // Healer sprite - healing support enemy
    this.generateHealerSprite(scene, 'healer', 0x88ff88);

    // Mini boss sprite
    this.generateMiniBossSprite(scene, 'boss-mini', 0xff4444);
  }

  /**
   * Generate Bomber sprite - explosive enemy that deals damage on death
   */
  static generateBomberSprite(scene, key, color) {
    const graphics = scene.add.graphics();

    // Body (round explosive shape)
    graphics.fillStyle(color, 1);
    graphics.fillCircle(0, 0, 12);

    // Fuse/spark on top
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(0, -14, 3);

    // Warning stripes
    graphics.lineStyle(2, 0x884400, 1);
    graphics.beginPath();
    graphics.moveTo(-8, -5);
    graphics.lineTo(8, 5);
    graphics.moveTo(-8, 5);
    graphics.lineTo(8, -5);
    graphics.strokePath();

    // Eye/sensor
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(0, -2, 3);

    // Generate texture
    scene.textures.addCanvas(key, graphics.generateTexture(key, 35, 35));
    graphics.destroy();
  }

  /**
   * Generate Stealth sprite - invisible enemy that phases in/out
   */
  static generateStealthSprite(scene, key, color) {
    const graphics = scene.add.graphics();

    // Body (ghostly shape)
    graphics.fillStyle(color, 0.6); // Semi-transparent by default
    graphics.fillCircle(0, -2, 10);

    // Wavy bottom (ghost effect)
    graphics.beginPath();
    graphics.moveTo(-10, 5);
    graphics.quadraticCurveTo(-5, 12, 0, 5);
    graphics.quadraticCurveTo(5, 12, 10, 5);
    graphics.lineTo(10, -2);
    graphics.lineTo(-10, -2);
    graphics.closePath();
    graphics.fillPath();

    // Eyes (menacing)
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(-4, -4, 2.5);
    graphics.fillCircle(4, -4, 2.5);

    // Generate texture
    scene.textures.addCanvas(key, graphics.generateTexture(key, 30, 35));
    graphics.destroy();
  }

  /**
   * Generate Swarm sprite - tiny fast enemy that spawns in huge numbers
   */
  static generateSwarmSprite(scene, key, color) {
    const graphics = scene.add.graphics();

    // Body (tiny circle)
    graphics.fillStyle(color, 1);
    graphics.fillCircle(0, 0, 6);

    // Wings/appendages
    graphics.fillStyle(color, 0.8);
    graphics.fillCircle(-7, -3, 4);
    graphics.fillCircle(7, -3, 4);

    // Eye
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(0, -1, 2);

    // Generate texture
    scene.textures.addCanvas(key, graphics.generateTexture(key, 20, 20));
    graphics.destroy();
  }

  /**
   * Generate Shielded sprite - enemy with protective shield
   */
  static generateShieldedSprite(scene, key, color) {
    const graphics = scene.add.graphics();

    // Body (similar to armored but with shield)
    graphics.fillStyle(0x446688, 1);
    graphics.fillRoundedRect(-12, -10, 24, 20, 3);

    // Shield bubble
    graphics.lineStyle(3, color, 0.8);
    graphics.strokeCircle(0, 0, 16);

    // Shield glow effect
    graphics.fillStyle(color, 0.2);
    graphics.fillCircle(0, 0, 16);

    // Eye/sensor
    graphics.fillStyle(0xff4444, 1);
    graphics.fillCircle(0, -2, 3);

    // Generate texture
    scene.textures.addCanvas(key, graphics.generateTexture(key, 45, 40));
    graphics.destroy();
  }

  /**
   * Generate Healer sprite - support enemy that heals others
   */
  static generateHealerSprite(scene, key, color) {
    const graphics = scene.add.graphics();

    // Body (organic/healing shape)
    graphics.fillStyle(0x228844, 1);
    graphics.fillCircle(0, 0, 10);

    // Healing cross (larger than regenerator)
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(-2, -14, 4, 28);
    graphics.fillRect(-14, -2, 28, 4);

    // Healing aura
    graphics.lineStyle(2, color, 0.6);
    graphics.strokeCircle(0, 0, 18);

    // Eye/sensor
    graphics.fillStyle(0x88ffaa, 1);
    graphics.fillCircle(0, -4, 3);

    // Generate texture
    scene.textures.addCanvas(key, graphics.generateTexture(key, 40, 45));
    graphics.destroy();
  }

  /**
   * Generate Mini Boss sprite - powerful enemy with special abilities
   */
  static generateMiniBossSprite(scene, key, color) {
    const graphics = scene.add.graphics();

    // Body (large menacing shape)
    graphics.fillStyle(0x882222, 1);
    graphics.fillRoundedRect(-18, -14, 36, 28, 5);

    // Armor plates
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(-16, -12, 32, 10, 3);
    graphics.fillRoundedRect(-16, 2, 32, 10, 3);

    // Horns/spikes
    graphics.fillStyle(0x666666, 1);
    graphics.fillTriangle(-12, -14, -8, -22, -4, -14);
    graphics.fillTriangle(4, -14, 8, -22, 12, -14);

    // Eyes (menacing)
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(-6, -4, 3);
    graphics.fillCircle(6, -4, 3);

    // Generate texture
    scene.textures.addCanvas(key, graphics.generateTexture(key, 50, 50));
    graphics.destroy();
  }

  /**
   * Generate a generic enemy sprite as fallback
   */
  static generateCannonSprite(scene, key, color) {
    const graphics = scene.add.graphics();

    // Base platform
    graphics.fillStyle(0x333333, 1);
    graphics.fillRoundedRect(-20, -15, 40, 30, 5);

    // Barrel
    graphics.fillStyle(color, 1);
    graphics.fillRect(-8, -30, 16, 25);

    // Barrel tip
    graphics.fillStyle(0x666666, 1);
    graphics.fillRect(-10, -35, 20, 8);

    // Detail lines
    graphics.lineStyle(2, 0x555555, 1);
    graphics.strokeRect(-18, -13, 36, 26);

    // Muzzle flash indicator
    graphics.fillStyle(0xffaa44, 0.8);
    graphics.fillCircle(0, -35, 4);

    // Generate texture
    scene.textures.addCanvas(key, graphics.generateTexture(key, 64, 64));
    graphics.destroy();
  }

  /**
   * Generate Vulcan sprite - rapid-fire twin barrel turret
   */
  static generateVulcanSprite(scene, key, color) {
    const graphics = scene.add.graphics();

    // Base platform
    graphics.fillStyle(0x333333, 1);
    graphics.fillRoundedRect(-20, -15, 40, 30, 5);

    // Twin barrels
    graphics.fillStyle(color, 1);
    graphics.fillRect(-14, -28, 8, 23);
    graphics.fillRect(6, -28, 8, 23);

    // Barrel tips
    graphics.fillStyle(0x666666, 1);
    graphics.fillRect(-16, -32, 12, 6);
    graphics.fillRect(4, -32, 12, 6);

    // Detail lines
    graphics.lineStyle(2, 0x555555, 1);
    graphics.strokeRect(-18, -13, 36, 26);

    // Firing indicators
    graphics.fillStyle(0xffff88, 0.9);
    graphics.fillCircle(-10, -32, 2);
    graphics.fillCircle(10, -32, 2);

    // Generate texture
    scene.textures.addCanvas(key, graphics.generateTexture(key, 64, 64));
    graphics.destroy();
  }

  /**
   * Generate Missile sprite - long-range homing launcher
   */
  static generateMissileSprite(scene, key, color) {
    const graphics = scene.add.graphics();

    // Base platform
    graphics.fillStyle(0x333333, 1);
    graphics.fillRoundedRect(-20, -15, 40, 30, 5);

    // Missile tube
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(-6, -35, 12, 30, 3);

    // Missile tip
    graphics.fillStyle(0xff4444, 1);
    graphics.fillTriangle(-6, -35, 6, -35, 0, -42);

    // Detail lines
    graphics.lineStyle(2, 0x555555, 1);
    graphics.strokeRect(-18, -13, 36, 26);

    // Guidance sensor
    graphics.fillStyle(0x88ffff, 0.8);
    graphics.fillCircle(0, -25, 3);

    // Generate texture
    scene.textures.addCanvas(key, graphics.generateTexture(key, 64, 64));
    graphics.destroy();
  }

  /**
   * Generate Booster sprite - energy collection pillar
   */
  static generateBoosterSprite(scene, key, color) {
    const graphics = scene.add.graphics();

    // Base platform
    graphics.fillStyle(0x333333, 1);
    graphics.fillRoundedRect(-20, -15, 40, 30, 5);

    // Energy pillar
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(-8, -40, 16, 35, 4);

    // Energy core
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(0, -25, 6);

    // Energy rings
    graphics.lineStyle(3, color, 0.8);
    graphics.strokeCircle(0, -25, 12);

    // Detail lines
    graphics.lineStyle(2, 0x555555, 1);
    graphics.strokeRect(-18, -13, 36, 26);

    // Sparkle effects
    graphics.fillStyle(0xaaccff, 0.9);
    graphics.fillCircle(-12, -35, 2);
    graphics.fillCircle(12, -30, 2);

    // Generate texture
    scene.textures.addCanvas(key, graphics.generateTexture(key, 64, 64));
    graphics.destroy();
  }

  /**
   * Generate Fast enemy sprite - small, sleek scout
   */
  static generateFastSprite(scene, key, color) {
    const graphics = scene.add.graphics();

    // Body (sleek triangle shape)
    graphics.fillStyle(color, 1);
    graphics.fillTriangle(0, -12, -10, 10, 10, 10);

    // Speed lines
    graphics.lineStyle(2, 0xffffff, 0.6);
    graphics.beginPath();
    graphics.moveTo(-15, 5);
    graphics.lineTo(-20, 5);
    graphics.moveTo(-12, 8);
    graphics.lineTo(-18, 8);
    graphics.strokePath();

    // Eye/sensor
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(0, -2, 3);

    // Generate texture
    scene.textures.addCanvas(key, graphics.generateTexture(key, 40, 30));
    graphics.destroy();
  }

  /**
   * Generate Armored enemy sprite - bulky, shielded unit
   */
  static generateArmoredSprite(scene, key, color) {
    const graphics = scene.add.graphics();

    // Body (heavy rectangle)
    graphics.fillStyle(0x444466, 1);
    graphics.fillRoundedRect(-15, -12, 30, 24, 3);

    // Armor plates
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(-13, -10, 26, 8, 2);
    graphics.fillRoundedRect(-13, 2, 26, 8, 2);

    // Shield effect
    graphics.lineStyle(3, 0x88aaff, 0.7);
    graphics.strokeCircle(0, 0, 18);

    // Eye/sensor
    graphics.fillStyle(0xff4444, 1);
    graphics.fillCircle(0, -2, 4);

    // Generate texture
    scene.textures.addCanvas(key, graphics.generateTexture(key, 50, 40));
    graphics.destroy();
  }

  /**
   * Generate Regenerator enemy sprite - pulsing healing unit
   */
  static generateRegeneratorSprite(scene, key, color) {
    const graphics = scene.add.graphics();

    // Body (organic shape)
    graphics.fillStyle(0x226622, 1);
    graphics.fillCircle(0, 0, 12);

    // Healing aura
    graphics.lineStyle(3, color, 0.6);
    graphics.strokeCircle(0, 0, 16);

    // Cross/medical symbol
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(-2, -8, 4, 16);
    graphics.fillRect(-8, -2, 16, 4);

    // Eye/sensor
    graphics.fillStyle(0x88ff88, 1);
    graphics.fillCircle(0, -4, 3);

    // Generate texture
    scene.textures.addCanvas(key, graphics.generateTexture(key, 45, 40));
    graphics.destroy();
  }

  /**
   * Generate Splitter enemy sprite - segmented unit that splits on death
   */
  static generateSplitterSprite(scene, key, color) {
    const graphics = scene.add.graphics();

    // Body (segmented circles)
    graphics.fillStyle(color, 1);
    graphics.fillCircle(-6, -4, 8);
    graphics.fillCircle(6, -4, 8);
    graphics.fillCircle(0, 6, 10);

    // Segmentation lines
    graphics.lineStyle(2, 0x883366, 1);
    graphics.beginPath();
    graphics.moveTo(-6, -4);
    graphics.lineTo(0, 6);
    graphics.moveTo(6, -4);
    graphics.lineTo(0, 6);
    graphics.strokePath();

    // Eyes/sensors
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(-8, -6, 2);
    graphics.fillCircle(8, -6, 2);

    // Generate texture
    scene.textures.addCanvas(key, graphics.generateTexture(key, 45, 35));
    graphics.destroy();
  }

  /**
   * Generate Baby Splitter sprite - smaller version for split enemies
   */
  static generateBabySplitterSprite(scene, key, color) {
    const graphics = scene.add.graphics();

    // Body (smaller segmented circles)
    graphics.fillStyle(color, 1);
    graphics.fillCircle(-4, -3, 5);
    graphics.fillCircle(4, -3, 5);
    graphics.fillCircle(0, 4, 6);

    // Segmentation lines
    graphics.lineStyle(1, 0x883366, 1);
    graphics.beginPath();
    graphics.moveTo(-4, -3);
    graphics.lineTo(0, 4);
    graphics.moveTo(4, -3);
    graphics.lineTo(0, 4);
    graphics.strokePath();

    // Eyes/sensors
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(-5, -4, 1.5);
    graphics.fillCircle(5, -4, 1.5);

    // Generate texture
    scene.textures.addCanvas(key, graphics.generateTexture(key, 30, 25));
    graphics.destroy();
  }

  /**
   * Generate a generic turret sprite as fallback
   */
  static generateGenericTurret(scene, key, color) {
    const graphics = scene.add.graphics();

    // Base platform
    graphics.fillStyle(0x333333, 1);
    graphics.fillRoundedRect(-15, -12, 30, 24, 4);

    // Turret body
    graphics.fillStyle(color, 1);
    graphics.fillCircle(0, -5, 10);

    // Barrel
    graphics.fillStyle(0x666666, 1);
    graphics.fillRect(-4, -20, 8, 15);

    // Detail
    graphics.lineStyle(2, 0x555555, 1);
    graphics.strokeRect(-13, -10, 26, 20);

    // Generate texture
    scene.textures.addCanvas(key, graphics.generateTexture(key, 48, 48));
    graphics.destroy();
  }

  /**
   * Generate a generic enemy sprite as fallback
   */
  static generateGenericEnemy(scene, key, color) {
    const graphics = scene.add.graphics();

    // Body
    graphics.fillStyle(color, 1);
    graphics.fillCircle(0, 0, 12);

    // Eye/sensor
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(0, -3, 4);

    // Generate texture
    scene.textures.addCanvas(key, graphics.generateTexture(key, 32, 32));
    graphics.destroy();
  }
}
