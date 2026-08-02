import Phaser from "phaser";

export default class BaseEnemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, enemyObject) {
    super(scene, x, y, enemyObject.name);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.MapScene = scene;
    this.map = scene.map;
    this.health = enemyObject.health * scene.difficulty;
    this.currentHealth = enemyObject.health * scene.difficulty;
    this.initialMove = true;
    this.resources = enemyObject.resources;
    this.speed = enemyObject.speed * scene.speedMultiplyer;

    this.sound = enemyObject.sound;
    this.deadSound = this.scene.sound.add(enemyObject.sound.name);

    this.enemyName = enemyObject.name;
    this.sprite = enemyObject.sprite;

    // Neo Defense: Special enemy type handling
    this.type = enemyObject.type || null;

    // Neo Defense: Special behavior properties
    this.lastDamageTime = 0; // For regenerator healing
    this.dashCooldown = 0; // For fast enemy dash
    this.shieldActive = false; // For armored enemy shield visual

    // Neo Defense: Iteration 6 - new enemy type properties
    this.shieldHealth = enemyObject.shieldHealth || null; // For shielded enemies
    this.lastShieldRegen = 0; // Shield regeneration timer
    this.lastHealTime = 0; // Healer behavior timer

    // Store config for use in methods
    this.constructorConfig = {
      shieldHealth: enemyObject.shieldHealth || 125,
      healRange: enemyObject.healRange || 100,
      healAmount: enemyObject.healAmount || 2,
    };

    // Visual effects for special enemies
    this.shieldGraphics = null;
    this.healIndicator = null;

    this.setPosition(145, 767);
    this.overlaySprite = scene.add.sprite(x, y, "flame");
    this.overlaySprite.setDepth(1); // Set the depth to ensure it appears above the base sprite
  }

  preload() {
    this.MapScene.load.image(
      this.enemyName,
      `assets/images/${this.sprite}.png`
    );
    this.MapScene.load.image("flame");
    this.scene.load.audio("bulletsound", "assets/sounds/BulletSound.mp3");

    this.scene.load.audio(
      this.sound.name,
      `assets/sounds/${this.sound.audio}.mp3`
    );
  }

  moveOnPath() {
    // DETECTS IF THE PATH IS A MOVEABLE TILEID
    const currentTile = this.map.getTilesWithinWorldXY(
      this.x,
      this.y,
      this.width,
      this.height
    );

    const singleCurrentTile = currentTile[0];

    if (singleCurrentTile.index === 27) {
      this.setVelocityY(-this.speed);
      this.setVelocityX(0);
    } else if (singleCurrentTile.index === 28) {
      // MOVE RIGHT
      this.setVelocityY(0);
      this.setVelocityX(this.speed);
    } else if (singleCurrentTile.index === 17) {
      // MOVE LEFT
      this.setVelocityY(0);
      this.setVelocityX(-this.speed);
    } else if (singleCurrentTile.index === 5) {
      // MOVE BACK
      this.setVelocityY(this.speed);
      this.setVelocityX(0);
    }
  }

  damageTaken(damage) {
    this.currentHealth -= damage;

    // Neo Defense: Armored enemies take reduced splash damage
    if (this.type === "armored") {
      this._showShieldEffect();
    }

    // Neo Defense: Track last damage time for regenerator healing
    this.lastDamageTime = this.MapScene.time.now;

    const healthPercentage = this.currentHealth / this.health;

    if (healthPercentage < 0.75 && healthPercentage > 0.5) {
      this.setTint(0xff9999);
    } else if (healthPercentage < 0.5) {
      this.setTint(0xff0000);
    }
    if (this.currentHealth <= 0) {
      this.destroy();
      this.deadSound.play({ volume: 0.2 });
      this.MapScene.resources += this.resources;
      this.MapScene.score += this.resources * this.MapScene.difficulty;
      this.MapScene.updateResources();
    }
  }

  /**
   * Neo Defense: Regenerator healing - heal when not taking damage for 2+ seconds
   */
  tryRegenerate() {
    if (this.type !== "regenerator" || this.currentHealth <= 0) return;

    const timeSinceDamage = this.MapScene.time.now - this.lastDamageTime;
    if (timeSinceDamage >= 2000 && this.currentHealth < this.health) {
      // Heal 5% of max health
      const healAmount = Math.floor(this.health * 0.05);
      this.currentHealth = Math.min(this.health, this.currentHealth + healAmount);

      // Visual feedback - green pulse
      this._showHealEffect();
    }
  }

  /**
   * Neo Defense: Fast enemy dash - periodically speed up for 1 second
   */
  tryDash() {
    if (this.type !== "fast") return;

    const time = this.MapScene.time.now;
    if (time > this.dashCooldown) {
      // 20% chance to dash every second
      if (Math.random() < 0.2) {
        this._activateDash();
        this.dashCooldown = time + 3000; // 3 second cooldown after dash
      }
    }
  }

  /**
   * Neo Defense: Activate dash speed boost
   */
  _activateDash() {
    const originalSpeed = this.speed;
    this.setVelocityX(this.speed * 2); // Double speed

    // Visual feedback - speed lines
    this._showDashEffect();

    // Return to normal speed after 1 second
    this.MapScene.time.delayedCall(1000, () => {
      if (this.active) {
        this.setVelocityX(originalSpeed);
      }
    });
  }

  /**
   * Neo Defense: Show shield effect for armored enemies
   */
  _showShieldEffect() {
    // Create temporary shield graphic
    const shield = this.MapScene.add.circle(0, 0, 18, 0x88aaff);
    shield.setAlpha(0.6);
    shield.setDepth(10);

    this.MapScene.tweens.add({
      targets: shield,
      alpha: 0,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 300,
      onComplete: () => shield.destroy(),
    });
  }

  /**
   * Neo Defense: Show heal effect for regenerator enemies
   */
  _showHealEffect() {
    // Create green healing indicator
    const heal = this.MapScene.add.circle(0, -20, 5, 0x33ff33);
    heal.setAlpha(1);

    this.MapScene.tweens.add({
      targets: heal,
      y: -40,
      alpha: 0,
      duration: 800,
      onComplete: () => heal.destroy(),
    });

    // Green pulse on enemy
    this.setTint(0x88ff88);
    this.MapScene.time.delayedCall(300, () => {
      if (this.active) this.clearTint();
    });
  }

  /**
   * Neo Defense: Show dash effect for fast enemies
   */
  _showDashEffect() {
    // Speed lines behind enemy
    for (let i = 0; i < 3; i++) {
      const line = this.MapScene.add.rectangle(
        -15 - i * 8,
        0,
        6 + i * 4,
        2,
        0xffffff
      );
      line.setAlpha(0.8);

      this.MapScene.tweens.add({
        targets: line,
        alpha: 0,
        x: -30 - i * 15,
        duration: 200 + i * 50,
        onComplete: () => line.destroy(),
      });
    }
  }

  update(time, delta) {
    if (this.initialMove) {
      this.setVelocityY(-this.speed);
      this.initialMove = false;
    }

    // Neo Defense: Special enemy behaviors (Iteration 6)
    this.tryRegenerate();
    this.tryDash();
    this.tryStealth(time);
    this.tryShieldedBehavior(time, delta);
    this.tryHealerBehavior(time);

    // Neo Defense: Bomber explosion on death handled in damageTaken
    if (this.type === "bomber" && this.currentHealth <= 0) {
      this._explode();
    }

    // Neo Defense: Shielded enemy shield regeneration
    if (this.type === "shielded" && this.shieldHealth > 0) {
      if (!this.lastShieldRegen || time - this.lastShieldRegen > 1000) {
        const maxShield = this.constructorConfig?.shieldHealth || 125;
        this.shieldHealth = Math.min(maxShield, this.shieldHealth + 1.25);
        this.lastShieldRegen = time;
      }
    }

    this.moveOnPath();
    if (this.y < 100) {
      this.MapScene.takeHeart();
      this.destroy();
    }
  }

  /**
   * Neo Defense: Stealth enemy - phases in and out of visibility
   */
  tryStealth(time) {
    if (this.type !== "stealth") return;
    const stealthCycle = time % 5000;
    if (stealthCycle < 3000) {
      this.setAlpha(1);
    } else {
      this.setAlpha(0.15);
    }
  }

  /**
   * Neo Defense: Shielded enemy - takes reduced damage until shield breaks
   */
  tryShieldedBehavior(time, delta) {
    if (this.type !== "shielded") return;
    if (this.shieldHealth > 0) {
      this._showShieldCrack();
      return true;
    }
    return false;
  }

  /**
   * Neo Defense: Healer enemy - heals nearby enemies
   */
  tryHealerBehavior(time) {
    if (this.type !== "healer") return;
    if (!this.lastHealTime || time - this.lastHealTime > 500) {
      const healRange = this.constructorConfig?.healRange || 100;
      const healAmount = this.constructorConfig?.healAmount || 2;

      this.MapScene.enemies.getChildren().forEach((enemy) => {
        if (
          enemy.active &&
          enemy !== this &&
          Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y) < healRange
        ) {
          enemy.currentHealth = Math.min(
            enemy.health,
            enemy.currentHealth + healAmount
          );

          const beam = this.MapScene.add.line(0, 0, enemy.x - this.x, enemy.y - this.y, 0x88ff88, 0.4);
          beam.setDepth(5);

          this.MapScene.tweens.add({
            targets: beam,
            alpha: 0,
            duration: 200,
            onComplete: () => beam.destroy(),
          });
        }
      });

      this.lastHealTime = time;
    }
  }

  /**
   * Neo Defense: Bomber explosion on death - damages nearby turrets
   */
  _explode() {
    const explodeRadius = 80;

    const explosion = this.MapScene.add.circle(this.x, this.y, 5, 0xff8800);
    explosion.setAlpha(1);

    this.MapScene.tweens.add({
      targets: explosion,
      scaleX: 4,
      scaleY: 4,
      alpha: 0,
      duration: 300,
      ease: "Power2",
      onComplete: () => explosion.destroy(),
    });

    this.MapScene.turrets.getChildren().forEach((turret) => {
      if (
        turret.active &&
        Phaser.Math.Distance.Between(this.x, this.y, turret.x, turret.y) < explodeRadius
      ) {
        turret.setTint(0xff8800);
        this.MapScene.time.delayedCall(500, () => {
          if (turret.active) turret.clearTint();
        });
      }
    });

    if (this.MapScene.soundInitialized) {
      const { soundManager } = this.MapScene;
      if (soundManager && typeof soundManager.play === "function") {
        soundManager.play("cannon-fire", { volume: 0.4 });
      }
    }
  }

  /**
   * Neo Defense: Show shield crack effect for shielded enemies
   */
  _showShieldCrack() {
    const crack = this.MapScene.add.circle(0, 0, 16, 0x44aaff);
    crack.setAlpha(0.8);

    this.MapScene.tweens.add({
      targets: crack,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 200,
      onComplete: () => crack.destroy(),
    });
  }
}
