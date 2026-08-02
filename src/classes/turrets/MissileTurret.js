import Phaser from "phaser";
import { getEnemyNearTurret } from "../../helpers/helpers";

// ParticleSystem for visual effects
import { ParticleSystem } from "../../utils/ParticleSystem";

/**
 * MissileTurret - Neo Defense's homing missile turret.
 * Fires slow but powerful missiles that track the nearest enemy in range.
 * Long range, high damage, slow fire rate.
 */
export default class MissileTurret extends Phaser.GameObjects.Sprite {
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

    // Shooting properties - slow but powerful
    this.nextTic = 0;
    this.tickTimer = turretObject.tickTimer || 4000; // Slow fire rate

    // Missile properties
    this.bulletSpeed = turretObject.bulletSpeed.level1;
    this.homing = true;

    // Visual properties
    this.setInteractive();
    this.depth = 2;
    this.glowColor = turretObject.glowColor || 0x00ffff; // cyan
    this.glow = scene.add.graphics();

    // Level tracking
    this.experiencePoints = 0;
    this.level = 1;

    // Sound reference
    this.launchSound = this.scene.sound.add("missile-launch");
    this.hitSound = this.scene.sound.add("missile-hit");

    // Particle system for visual effects
    this.particleSystem = new ParticleSystem(this.scene);

    // Trail particles for missile
    this.trailParticles = [];
  }

  /**
   * Auto-fire at nearest enemy in range - homing missile!
   */
  autoFire() {
    const enemy = getEnemyNearTurret(this.x, this.y, this.range, this.MapScene.enemies);

    if (enemy) {
      let angle = Phaser.Math.Angle.Between(this.x, this.y, enemy.x, enemy.y);
      this.angle = (angle + Math.PI + Math.PI / 2) * Phaser.Math.RAD_TO_DEG;

      this.shootMissile(enemy);
    }
  }

  /**
   * Launch a homing missile at the target enemy
   */
  shootMissile(targetEnemy) {
    // Create missile projectile (larger, more visible) with glow effect
    const missile = this.MapScene.add.circle(
      this.x,
      this.y,
      5, // Larger than regular bullets
      this.glowColor
    );
    missile.setDepth(3);

    // Add initial glow pulse
    const glowPulse = this.MapScene.add.circle(this.x, this.y, 8, this.glowColor);
    glowPulse.setAlpha(0.6);
    this.MapScene.tweens.add({
      targets: glowPulse,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 300,
      onComplete: () => glowPulse.destroy(),
    });

    // Store target reference for homing
    missile.targetEnemy = targetEnemy;
    missile.isHoming = true;

    // Calculate initial velocity toward target
    const angle = Phaser.Math.Angle.Between(this.x, this.y, targetEnemy.x, targetEnemy.y);
    missile.vx = Math.cos(angle) * this.bulletSpeed;
    missile.vy = Math.sin(angle) * this.bulletSpeed;

    // Play launch sound
    if (this.launchSound) {
      this.launchSound.play({ volume: 0.25 });
    }

    // Create trail particle group for this missile
    const trail = [];
    missile.trail = trail;

    // Update missile position each frame with homing behavior
    const updateMissile = () => {
      if (!missile.active || !targetEnemy || !targetEnemy.active) {
        // Target destroyed - self destruct with explosion
        this._createExplosion(missile.x, missile.y);
        missile.destroy();
        return;
      }

      // Update target reference (enemy may have moved)
      const currentAngle = Phaser.Math.Angle.Between(
        missile.x,
        missile.y,
        targetEnemy.x,
        targetEnemy.y
      );

      // Homing behavior - gradually steer toward target
      const homingStrength = 0.08; // How quickly missile turns

      // Blend current velocity toward target direction
      const targetVx = Math.cos(currentAngle) * this.bulletSpeed;
      const targetVy = Math.sin(currentAngle) * this.bulletSpeed;

      missile.vx = Phaser.Math.Linear(missile.vx, targetVx, homingStrength);
      missile.vy = Phaser.Math.Linear(missile.vy, targetVy, homingStrength);

      // Move missile
      const newX = missile.x + missile.vx * 0.016; // ~60fps
      const newY = missile.y + missile.vy * 0.016;

      // Create trail particle (more frequent for missiles)
      if (Math.random() < 0.7) {
        const trailParticle = this.MapScene.add.circle(
          missile.x,
          missile.y,
          2 + Math.random() * 2,
          this.glowColor
        );
        trailParticle.setAlpha(0.6);

        this.MapScene.tweens.add({
          targets: trailParticle,
          alpha: 0,
          duration: 250 + Math.random() * 150,
          onComplete: () => trailParticle.destroy(),
        });

        // Keep only last few trail particles
        if (trail.length > 8) {
          const old = trail.shift();
          if (old && old.active) old.destroy();
        }
      }

      missile.x = newX;
      missile.y = newY;

      // Check collision with target enemy
      const distanceToTarget = Phaser.Math.Distance.Between(
        missile.x,
        missile.y,
        targetEnemy.x,
        targetEnemy.y
      );

      if (distanceToTarget < 15) {
        // Hit! Create explosion and deal damage
        this._createExplosion(missile.x, missile.y);

        // Use ParticleSystem for enhanced visual feedback
        if (this.particleSystem) {
          this.particleSystem.createExplosion(missile.x, missile.y, this.glowColor, 25);
          this.particleSystem.createScreenShake(4, 200); // Strong shake for missile hit
        }

        if (targetEnemy.active && targetEnemy.currentHealth > 0) {
          // Show large damage number using ParticleSystem (missiles do high damage)
          if (this.particleSystem && this.damageOutput > 0) {
            this.particleSystem.createDamageNumber(
              targetEnemy.x,
              targetEnemy.y - 25,
              this.damageOutput,
              0x00ffff // Cyan for missile damage
            );

            // Impact particles
            this.particleSystem.createImpact(targetEnemy.x, targetEnemy.y, 0x00ffff);
          }

          targetEnemy.damageTaken(this.damageOutput);

          // Play hit sound if available
          if (this.hitSound) {
            this.hitSound.play({ volume: 0.3 });
          }
        }

        missile.destroy();
      } else if (missile.x < -50 || missile.x > 1100 || missile.y < -50 || missile.y > 850) {
        // Out of bounds - destroy with small explosion
        if (this.particleSystem) {
          this.particleSystem.createImpact(missile.x, missile.y, 0x888888);
        }
        this.MapScene.add.circle(missile.x, missile.y, 3, 0x888888);
        missile.destroy();
      } else {
        // Continue tracking next frame
        this.MapScene.time.delayedCall(16, updateMissile);
      }
    };

    // Start tracking
    this.MapScene.time.delayedCall(16, updateMissile);

    // Upgrade experience for shooting
    this.upgradeExperience();
  }

  /**
   * Create explosion visual effect at impact point
   */
  _createExplosion(x, y) {
    // Large cyan explosion
    const explosion = this.MapScene.add.circle(x, y, 5, this.glowColor);
    explosion.setAlpha(1);

    this.MapScene.tweens.add({
      targets: explosion,
      scaleX: 4,
      scaleY: 4,
      alpha: 0,
      duration: 300,
      ease: "Power2",
      onComplete: () => {
        explosion.destroy();
      },
    });

    // Spawn particles for missile impact effect
    const particleCount = 12;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 / particleCount) * i;
      const distance = 20 + Math.random() * 30;

      const particle = this.MapScene.add.circle(
        x,
        y,
        2 + Math.random() * 3,
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
        duration: 400 + Math.random() * 300,
        ease: "Power1",
        onComplete: () => {
          particle.destroy();
        },
      });
    }

    // White flash at center
    const flash = this.MapScene.add.circle(x, y, 3, 0xffffff);
    flash.setAlpha(1);

    this.MapScene.tweens.add({
      targets: flash,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 150,
      onComplete: () => flash.destroy(),
    });

    // Play explosion sound if available
    if (this.MapScene.sound && this.MapScene.sound.get("explosion")) {
      this.MapScene.sound.play("explosion", { volume: 0.25 });
    }
  }

  /**
   * Upgrade the missile turret (increase damage, speed, range)
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
    if (this.bulletSpeed && this.turretObject?.bulletSpeed) {
      this.bulletSpeed = this.turretObject.bulletSpeed[newLevel];
    }

    // Play upgrade sound
    if (this.MapScene.sound) {
      this.MapScene.sound.play("turret-upgrade", { volume: 0.3 });
    }

    // Visual feedback - burst of particles
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      const particle = this.MapScene.add.circle(
        this.x + Math.cos(angle) * 15,
        this.y + Math.sin(angle) * 15,
        2,
        this.glowColor
      );
      particle.setAlpha(1);

      this.MapScene.tweens.add({
        targets: particle,
        x: this.x + Math.cos(angle) * 35,
        y: this.y + Math.sin(angle) * 35,
        alpha: 0,
        duration: 400,
        onComplete: () => particle.destroy(),
      });
    }
  }

  /**
   * Draw glow effect around missile turret
   */
  drawGlow() {
    this.glow.clear();

    // Cyan glow when active
    const pulse = Math.sin(Date.now() / 500) * 0.2 + 0.4;
    this.glow.fillStyle(this.glowColor, pulse * 0.3);
    this.glow.fillCircle(0, 0, 24);

    // Bright center
    this.glow.fillStyle(0xffffff, pulse * 0.5);
    this.glow.fillCircle(0, 0, 8);

    // Range indicator (more prominent for long-range turret)
    this.glow.lineStyle(1, this.glowColor, 0.25);
    this.glow.strokeCircle(0, 0, this.range);

    // Direction indicator (barrel)
    if (this.angle !== undefined) {
      const dirAngle = this.angle * Phaser.Math.DEG_TO_RAD;
      const barrelEndX = Math.cos(dirAngle) * 20;
      const barrelEndY = Math.sin(dirAngle) * 20;

      this.glow.lineStyle(3, this.glowColor, 0.7);
      this.glow.beginPath();
      this.glow.moveTo(0, 0);
      this.glow.lineTo(barrelEndX, barrelEndY);
      this.glow.strokePath();

      // Missile tip indicator
      const tipX = Math.cos(dirAngle) * 24;
      const tipY = Math.sin(dirAngle) * 24;
      this.glow.fillStyle(this.glowColor, pulse * 0.8);
      this.glow.fillCircle(tipX, tipY, 3);
    }

    // Firing cooldown indicator (ring that fills up)
    const timeSinceLastShot = this.MapScene.time.now - this.nextTic;
    if (timeSinceLastShot < 0) {
      const cooldownProgress = Math.max(0, (timeSinceLastShot + this.tickTimer) / this.tickTimer);
      const cooldownAngle = cooldownProgress * Math.PI * 2;

      this.glow.lineStyle(3, 0x88ffff, 0.5);
      this.glow.beginPath();
      this.glow.arc(0, 0, 28, -Math.PI / 2, -Math.PI / 2 + cooldownAngle);
      this.glow.strokePath();
    }
  }

  /**
   * Main update loop for missile turret
   */
  update(time, delta) {
    // Fire at enemies on tick timer (slow but powerful!)
    if (time > this.nextTic) {
      this.autoFire();
      this.nextTic = time + this.tickTimer;
    }

    // Draw glow effect every frame
    this.drawGlow();
  }

  /**
   * Sell the missile turret (return half cost)
   */
  sellMissile() {
    this.MapScene.resources += this.cost / 2;
    this.MapScene.updateResources();

    // Clean up any active trails
    for (const particle of this.trailParticles) {
      if (particle && particle.active) particle.destroy();
    }

    this.destroy();
  }
}
