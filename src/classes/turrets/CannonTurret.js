import Phaser from "phaser";
import { getEnemyNearTurret, timerDelay } from "../../helpers/helpers";

// ParticleSystem for visual effects
import { ParticleSystem } from "../../utils/ParticleSystem";

/**
 * CannonTurret - Neo Defense's primary turret.
 * Fires explosive projectiles with splash damage.
 * Requires an adjacent Booster to fire - no booster = no power.
 */
export default class CannonTurret extends Phaser.GameObjects.Sprite {
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
    this.splashRadius = turretObject.splashRadius.level1;

    // Shooting properties
    this.nextTic = 0;
    this.tickTimer = turretObject.tickTimer;

    // Booster dependency
    this.requiresBooster = true;
    this.hasPower = false;

    // Visual properties
    this.setInteractive();
    this.depth = 2;
    this.glowColor = turretObject.glowColor || 0xff8800;
    this.glow = scene.add.graphics();

    // Bullet group
    this.bullets = this.scene.add.group();

    // Level tracking
    this.experiencePoints = 0;
    this.level = 1;

    // Sound references
    this.bulletSound = this.scene.sound.add("cannon-fire");

    // Particle system for visual effects
    this.particleSystem = new ParticleSystem(this.scene);

    // No-power visual state
    this.isNoPower = false;
  }

  /**
   * Auto-fire at nearest enemy in range
   */
  autoFire() {
    // Check if we have power from booster
    if (this.requiresBooster && !this.hasPower) {
      this.isNoPower = true;
      return; // Cannot fire without booster power
    }

    this.isNoPower = false;

    const enemy = getEnemyNearTurret(this.x, this.y, this.range, this.MapScene.enemies);

    if (enemy) {
      let angle = Phaser.Math.Angle.Between(this.x, this.y, enemy.x, enemy.y);
      this.angle = (angle + Math.PI + Math.PI / 2) * Phaser.Math.RAD_TO_DEG;

      this.shootBullet(enemy);
    }
  }

  /**
   * Shoot an explosive cannonball at the target enemy
   */
  shootBullet(enemy) {
    // Create explosive projectile with trail effect
    const bullet = this.MapScene.add.circle(
      this.x,
      this.y,
      6,
      this.glowColor
    );
    bullet.setDepth(3);

    // Add trail particles
    this._createBulletTrail(bullet, this.glowColor);

    const angle = Phaser.Math.Angle.Between(this.x, this.y, enemy.x, enemy.y);
    const speed = 300;

    this.MapScene.tweens.add({
      targets: bullet,
      x: enemy.x + Math.cos(angle) * 20,
      y: enemy.y + Math.sin(angle) * 20,
      duration: Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y) / speed,
      ease: "Linear",
      onComplete: () => {
        // Impact - create explosion effect with splash ring
        this._createExplosion(bullet.x, bullet.y);

        // Deal damage to target
        if (enemy.active && enemy.currentHealth > 0) {
          // Track damage for visual feedback
          const prevHealth = enemy.currentHealth;
          enemy.damageTaken(this.damageOutput);

          // Show damage number popup using ParticleSystem
          if (this.particleSystem) {
            this.particleSystem.createDamageNumber(
              enemy.x,
              enemy.y - 20,
              this.damageOutput
            );

            // Screen shake for heavy hits
            if (this.damageOutput > 50) {
              this.particleSystem.createScreenShake(3, 150);
            }
          }

          // Deal splash damage to nearby enemies
          this._dealSplashDamage(bullet.x, bullet.y);
        }

        bullet.destroy();
      },
    });

    // Play cannon fire sound
    if (this.bulletSound) {
      this.bulletSound.play({ volume: 0.3 });
    }

    // Muzzle flash effect
    this._showMuzzleFlash(angle);

    // Upgrade experience for shooting
    this.upgradeExperience();
  }

  /**
   * Create bullet trail particles for cannon projectile
   */
  _createBulletTrail(bullet, color) {
    const trail = this.MapScene.add.circle(bullet.x, bullet.y, 2, color);
    trail.setAlpha(0.6);

    this.MapScene.tweens.add({
      targets: trail,
      alpha: 0,
      duration: 200,
      onComplete: () => trail.destroy(),
    });
  }

  /**
   * Show muzzle flash when firing cannon
   */
  _showMuzzleFlash(angle) {
    const flashX = this.x + Math.cos(angle) * 18;
    const flashY = this.y + Math.sin(angle) * 18;

    const muzzleFlash = this.MapScene.add.circle(flashX, flashY, 5, 0xffaa44);
    muzzleFlash.setAlpha(1);

    this.MapScene.tweens.add({
      targets: muzzleFlash,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 100,
      onComplete: () => muzzleFlash.destroy(),
    });
  }

  /**
   * Create explosion visual effect at impact point
   */
  _createExplosion(x, y) {
    // Main explosion circle
    const explosion = this.MapScene.add.circle(x, y, 5, this.glowColor);
    explosion.setAlpha(1);

    this.MapScene.tweens.add({
      targets: explosion,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 200,
      ease: "Power2",
      onComplete: () => {
        explosion.destroy();
      },
    });

    // Spawn particles for splash effect
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 / particleCount) * i;
      const distance = 15 + Math.random() * 20;

      const particle = this.MapScene.add.circle(
        x,
        y,
        2 + Math.random() * 2,
        this.glowColor
      );
      particle.setAlpha(1);

      const targetX = x + Math.cos(angle) * distance;
      const targetY = y + Math.sin(angle) * distance;

      this.MapScene.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        duration: 300 + Math.random() * 200,
        ease: "Power1",
        onComplete: () => {
          particle.destroy();
        },
      });
    }

    // Play explosion sound if available
    if (this.MapScene.sound && this.MapScene.sound.get("cannon-splash")) {
      this.MapScene.sound.play("cannon-splash", { volume: 0.2 });
    }
  }

  /**
   * Deal splash damage to enemies near the impact point
   */
  _dealSplashDamage(impactX, impactY) {
    const enemies = this.MapScene.enemies.getChildren();

    for (const enemy of enemies) {
      if (!enemy.active || !enemy.currentHealth || enemy.currentHealth <= 0) continue;
      if (enemy === this._lastTarget) continue; // Don't splash the primary target

      const distance = Phaser.Math.Distance.Between(
        impactX,
        impactY,
        enemy.x,
        enemy.y
      );

      if (distance <= this.splashRadius) {
        // Splash damage is 50% of main damage
        const splashDamage = this.damageOutput * 0.5;

        // Armored enemies take reduced splash damage
        if (enemy.type === "armored") {
          enemy.damageTaken(splashDamage * 0.3);
        } else {
          enemy.damageTaken(splashDamage);
        }

        // Visual splash indicator
        const splash = this.MapScene.add.circle(
          enemy.x,
          enemy.y,
          3,
          0xffaa44
        );
        splash.setAlpha(0.8);

        this.MapScene.tweens.add({
          targets: splash,
          alpha: 0,
          duration: 150,
          onComplete: () => splash.destroy(),
        });
      }
    }

    this._lastTarget = null; // Reset after splash
  }

  /**
   * Upgrade the cannon (increase damage, range, splash radius)
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
    if (this.splashRadius && turretObject?.splashRadius) {
      this.splashRadius = turretObject.splashRadius[newLevel];
    }

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
   * Draw glow effect around cannon
   */
  drawGlow() {
    this.glow.clear();

    if (this.isNoPower) {
      // Red warning glow when no power
      const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.5;
      this.glow.fillStyle(0xff0000, pulse * 0.3);
      this.glow.fillCircle(0, 0, 22);

      // "NO POWER" indicator
      this.glow.lineStyle(2, 0xff0000, 0.6);
      this.glow.strokeCircle(0, 0, 25);
    } else {
      // Normal orange glow when powered
      const pulse = Math.sin(Date.now() / 500) * 0.2 + 0.4;
      this.glow.fillStyle(this.glowColor, pulse * 0.3);
      this.glow.fillCircle(0, 0, 22);

      // Bright center
      this.glow.fillStyle(0xffffff, pulse * 0.5);
      this.glow.fillCircle(0, 0, 8);

      // Range indicator (subtle)
      this.glow.lineStyle(1, this.glowColor, 0.2);
      this.glow.strokeCircle(0, 0, this.range);
    }
  }

  /**
   * Main update loop for cannon
   */
  update(time, delta) {
    // Fire at enemies on tick timer
    if (time > this.nextTic) {
      this.autoFire();
      this.nextTic = time + this.tickTimer;
    }

    // Draw glow effect every frame
    this.drawGlow();
  }

  /**
   * Sell the cannon (return half cost)
   */
  sellCannon() {
    this.MapScene.resources += this.cost / 2;
    this.MapScene.updateResources();

    // Remove from any boosters' adjacent list
    for (const child of this.MapScene.turrets.getChildren()) {
      if (child.constructor.name === "BoosterTurret" && child.adjacentCannons) {
        const index = child.adjacentCannons.indexOf(this);
        if (index !== -1) {
          child.adjacentCannons.splice(index, 1);
        }
      }
    }

    this.destroy();
  }
}
