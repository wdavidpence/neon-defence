import Phaser from "phaser";
import { getEnemyNearTurret } from "../../helpers/helpers";

// ParticleSystem for visual effects
import { ParticleSystem } from "../../utils/ParticleSystem";

/**
 * VulcanTurret - Neo Defense's rapid-fire turret.
 * Fires very quickly with low damage per shot. Does NOT require a booster.
 * Excellent for crowd control of weak enemies.
 */
export default class VulcanTurret extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, turretObject) {
    super(scene, x, y, turretObject.sprite.level1.name);

    this.MapScene = scene;
    scene.add.existing(this);

    // Config properties
    this.turretName = turretObject.name;
    this.turretSprite = turretObject.sprite;
    this.cost = turretObject.cost;
    this.experience = turretObject.experience;

    // Combat properties
    this.range = turretObject.range;
    this.damageOutput = turretObject.damageOutput.level1;
    this.damageObject = turretObject.damageOutput;

    // Shooting properties - very fast fire rate
    this.nextTic = 0;
    this.tickTimer = turretObject.tickTimer || 150; // 150ms between shots

    // Visual properties
    this.setInteractive();
    this.depth = 2;
    this.glowColor = turretObject.glowColor || 0xffff00; // yellow
    this.glow = scene.add.graphics();

    // Level tracking
    this.experiencePoints = 0;
    this.level = 1;

    // Sound reference
    this.bulletSound = this.scene.sound.add("vulcan-fire");

    // Particle system for visual effects
    this.particleSystem = new ParticleSystem(this.scene);

    // Muzzle flash effect
    this.muzzleFlash = null;
  }

  /**
   * Auto-fire at nearest enemy in range - rapid fire!
   */
  autoFire() {
    const enemy = getEnemyNearTurret(this.x, this.y, this.range, this.MapScene.enemies);

    if (enemy) {
      let angle = Phaser.Math.Angle.Between(this.x, this.y, enemy.x, enemy.y);
      this.angle = (angle + Math.PI + Math.PI / 2) * Phaser.Math.RAD_TO_DEG;

      this.shootBullet(enemy);
    }
  }

  /**
   * Shoot a single vulcan round at the target
   */
  shootBullet(enemy) {
    // Create small fast projectile with trail effect
    const bullet = this.MapScene.add.circle(
      this.x,
      this.y,
      2, // Small bullet for rapid fire feel
      this.glowColor
    );
    bullet.setDepth(3);

    // Add quick trail particle
    const trail = this.MapScene.add.circle(bullet.x, bullet.y, 1.5, this.glowColor);
    trail.setAlpha(0.5);

    this.MapScene.tweens.add({
      targets: trail,
      alpha: 0,
      duration: 80,
      onComplete: () => trail.destroy(),
    });

    const angle = Phaser.Math.Angle.Between(this.x, this.y, enemy.x, enemy.y);
    const speed = 500; // Fast bullets

    this.MapScene.tweens.add({
      targets: bullet,
      x: enemy.x + Math.cos(angle) * 10,
      y: enemy.y + Math.sin(angle) * 10,
      duration: Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y) / speed,
      ease: "Linear",
      onComplete: () => {
        // Impact - small hit effect with spark
        this._createHitEffect(bullet.x, bullet.y);

        // Deal damage to target
        if (enemy.active && enemy.currentHealth > 0) {
          // Show small damage number using ParticleSystem (vulcan does low damage per shot)
          if (this.particleSystem && this.damageOutput > 0) {
            this.particleSystem.createDamageNumber(
              enemy.x,
              enemy.y - 15,
              this.damageOutput,
              0xffff88 // Yellow for vulcan damage
            );

            // Small impact particles
            this.particleSystem.createImpact(enemy.x, enemy.y, 0xffff88);
          }

          enemy.damageTaken(this.damageOutput);
        }

        bullet.destroy();
      },
    });

    // Play vulcan fire sound (short burst)
    if (this.bulletSound) {
      this.bulletSound.play({ volume: 0.15 }); // Quieter since it fires so often
    }

    // Muzzle flash effect (quick flash)
    this._showMuzzleFlash(angle);

    // Upgrade experience for shooting
    this.upgradeExperience();
  }

  /**
   * Create small hit effect when bullet impacts enemy
   */
  _createHitEffect(x, y) {
    // Small spark effect
    const spark = this.MapScene.add.circle(x, y, 2, 0xffff88);
    spark.setAlpha(1);

    this.MapScene.tweens.add({
      targets: spark,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 100,
      ease: "Power2",
      onComplete: () => {
        spark.destroy();
      },
    });
  }

  /**
   * Show muzzle flash when firing vulcan
   */
  _showMuzzleFlash(angle) {
    const flashX = this.x + Math.cos(angle) * 15;
    const flashY = this.y + Math.sin(angle) * 15;

    const muzzleFlash = this.MapScene.add.circle(flashX, flashY, 3, 0xffff44);
    muzzleFlash.setAlpha(0.8);

    this.MapScene.tweens.add({
      targets: muzzleFlash,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 60,
      onComplete: () => muzzleFlash.destroy(),
    });
  }

  /**
   * Upgrade the vulcan (increase fire rate, damage, range)
   */
  upgradeExperience() {
    this.experiencePoints++;

    if (this.experiencePoints >= this.experience.level2 && this.level === 1) {
      this._upgradeToLevel(2);
    } else if (this.experiencePoints >= this.experience.level3 && this.level === 2) {
      this._upgradeToLevel(3);
    }
  }

  _upgradeToLevel(newLevel) {
    this.level = newLevel;

    // Update sprite
    const spriteKey = `level${newLevel}`;
    if (this.turretSprite[spriteKey]) {
      this.setTexture(this.turretSprite[spriteKey].name);
    }

    // Update stats
    this.damageOutput = this.damageObject[newLevel];

    // Play upgrade sound
    if (this.MapScene.sound) {
      this.MapScene.sound.play("turret-upgrade", { volume: 0.3 });
    }

    // Visual feedback - burst of particles
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 / 6) * i;
      const particle = this.MapScene.add.circle(
        this.x + Math.cos(angle) * 15,
        this.y + Math.sin(angle) * 15,
        2,
        this.glowColor
      );
      particle.setAlpha(1);

      this.MapScene.tweens.add({
        targets: particle,
        x: this.x + Math.cos(angle) * 30,
        y: this.y + Math.sin(angle) * 30,
        alpha: 0,
        duration: 400,
        onComplete: () => particle.destroy(),
      });
    }
  }

  /**
   * Draw glow effect around vulcan turret
   */
  drawGlow() {
    this.glow.clear();

    // Yellow glow when active
    const pulse = Math.sin(Date.now() / 300) * 0.2 + 0.4;
    this.glow.fillStyle(this.glowColor, pulse * 0.3);
    this.glow.fillCircle(0, 0, 20);

    // Bright center
    this.glow.fillStyle(0xffffff, pulse * 0.5);
    this.glow.fillCircle(0, 0, 6);

    // Range indicator (subtle)
    this.glow.lineStyle(1, this.glowColor, 0.2);
    this.glow.strokeCircle(0, 0, this.range);

    // Firing indicator - small line showing direction
    if (this.angle !== undefined) {
      const dirAngle = this.angle * Phaser.Math.DEG_TO_RAD;
      const barrelEndX = Math.cos(dirAngle) * 18;
      const barrelEndY = Math.sin(dirAngle) * 18;

      this.glow.lineStyle(2, this.glowColor, 0.6);
      this.glow.beginPath();
      this.glow.moveTo(0, 0);
      this.glow.lineTo(barrelEndX, barrelEndY);
      this.glow.strokePath();
    }
  }

  /**
   * Main update loop for vulcan turret
   */
  update(time, delta) {
    // Fire at enemies on tick timer (very fast!)
    if (time > this.nextTic) {
      this.autoFire();
      this.nextTic = time + this.tickTimer;
    }

    // Draw glow effect every frame
    this.drawGlow();
  }

  /**
   * Sell the vulcan (return half cost)
   */
  sellVulcan() {
    this.MapScene.resources += this.cost / 2;
    this.MapScene.updateResources();

    if (this.muzzleFlash) {
      this.muzzleFlash.destroy();
    }

    this.destroy();
  }
}
