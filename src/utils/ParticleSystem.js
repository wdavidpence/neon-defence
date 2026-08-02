/**
 * ParticleSystem - Neo Defense style particle effects for explosions, impacts, and visual feedback
 */

import Phaser from "phaser";

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
  }

  /**
   * Create explosion effect at position
   */
  createExplosion(x, y, color = 0xff8800, size = 20) {
    const count = 15;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
      const speed = 50 + Math.random() * 100;

      const particle = this.scene.add.circle(
        x, y, 2 + Math.random() * 3, color
      );
      particle.setAlpha(1);
      particle.setDepth(50);

      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        scaleX: 0.2,
        scaleY: 0.2,
        duration: 400 + Math.random() * 300,
        ease: "Power2",
        onComplete: () => particle.destroy(),
      });

      this.particles.push(particle);
    }

    // Flash effect
    const flash = this.scene.add.circle(x, y, size * 0.5, color);
    flash.setAlpha(0.8);
    flash.setDepth(49);

    this.scene.tweens.add({
      targets: flash,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 200,
      ease: "Power2",
      onComplete: () => flash.destroy(),
    });

    this.particles.push(flash);
  }

  /**
   * Create impact effect (bullet hitting enemy)
   */
  createImpact(x, y, color = 0xffffff) {
    const count = 8;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 60;

      const particle = this.scene.add.circle(
        x, y, 1 + Math.random() * 2, color
      );
      particle.setAlpha(1);
      particle.setDepth(50);

      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        duration: 200 + Math.random() * 200,
        ease: "Power2",
        onComplete: () => particle.destroy(),
      });

      this.particles.push(particle);
    }
  }

  /**
   * Create healing effect (green particles rising)
   */
  createHealEffect(x, y) {
    const count = 6;

    for (let i = 0; i < count; i++) {
      const particle = this.scene.add.circle(
        x + (Math.random() - 0.5) * 20, y, 2, 0x33ff33
      );
      particle.setAlpha(1);
      particle.setDepth(50);

      this.scene.tweens.add({
        targets: particle,
        y: y - 30 - Math.random() * 20,
        alpha: 0,
        duration: 600 + Math.random() * 400,
        ease: "Power2",
        onComplete: () => particle.destroy(),
      });

      this.particles.push(particle);
    }
  }

  /**
   * Create shield break effect (blue sparks)
   */
  createShieldBreak(x, y) {
    const count = 12;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 80;

      const particle = this.scene.add.circle(
        x, y, 2 + Math.random() * 2, 0x44aaff
      );
      particle.setAlpha(1);
      particle.setDepth(50);

      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        duration: 300 + Math.random() * 200,
        ease: "Power2",
        onComplete: () => particle.destroy(),
      });

      this.particles.push(particle);
    }
  }

  /**
   * Create stealth reveal effect (ghostly fade)
   */
  createStealthReveal(x, y) {
    const count = 10;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 15 + Math.random() * 20;

      const particle = this.scene.add.circle(
        x, y, 1 + Math.random() * 2, 0x8888ff
      );
      particle.setAlpha(0.6);
      particle.setDepth(50);

      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        alpha: 0,
        duration: 400 + Math.random() * 300,
        ease: "Power2",
        onComplete: () => particle.destroy(),
      });

      this.particles.push(particle);
    }
  }

  /**
   * Create booster charge effect (blue energy particles)
   */
  createBoosterCharge(x, y) {
    const count = 8;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 10 + Math.random() * 30;

      const particle = this.scene.add.circle(
        x, y, 2 + Math.random() * 3, 0x4488ff
      );
      particle.setAlpha(0.8);
      particle.setDepth(50);

      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance - 10, // Slight upward drift
        alpha: 0,
        duration: 500 + Math.random() * 400,
        ease: "Power2",
        onComplete: () => particle.destroy(),
      });

      this.particles.push(particle);
    }
  }

  /**
   * Create screen shake effect
   */
  createScreenShake(intensity = 5, duration = 200) {
    this.scene.cameras.main.shake(duration, intensity / 100);
  }

  /**
   * Create damage number popup
   */
  createDamageNumber(x, y, damage, color = 0xff4444) {
    const text = this.scene.add.text(x, y, `-${damage}`, {
      fontSize: "16px",
      fill: "#ffffff",
      stroke: "#000000",
      strokeThickness: 3,
    });
    text.setOrigin(0.5);
    text.setDepth(100);

    this.scene.tweens.add({
      targets: text,
      y: y - 40,
      alpha: 0,
      duration: 800,
      ease: "Power2",
      onComplete: () => text.destroy(),
    });
  }

  /**
   * Create resource gain popup (green)
   */
  createResourceGain(x, y, amount) {
    const text = this.scene.add.text(x, y, `+${amount}`, {
      fontSize: "18px",
      fill: "#00ff00",
      stroke: "#000000",
      strokeThickness: 3,
    });
    text.setOrigin(0.5);
    text.setDepth(100);

    this.scene.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      duration: 1000,
      ease: "Power2",
      onComplete: () => text.destroy(),
    });
  }

  /**
   * Clear all particles
   */
  clear() {
    this.particles.forEach((p) => p.destroy());
    this.particles = [];
  }
}
