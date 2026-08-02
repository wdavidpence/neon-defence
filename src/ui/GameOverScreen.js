/**
 * GameOverScreen - Neo Defense style game over screen with stats and replay options
 */

import Phaser from "phaser";

export class GameOverScreen extends Phaser.Scene {
  constructor() {
    super("gameOverScreen");
  }

  create(data) {
    const { score, waveIndex, missionComplete } = data;

    // Dark overlay background
    const overlay = this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.85);
    overlay.setDepth(100);

    // Game Over title with glow effect
    const title = this.add.text(512, 200, "GAME OVER", {
      fontSize: "64px",
      fill: "#ff0000",
      fontStyle: "bold",
      stroke: "#880000",
      strokeThickness: 6,
    });
    title.setOrigin(0.5);

    // Animated pulse on title
    this.tweens.add({
      targets: title,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Stats panel background
    const statsBg = this.add.rectangle(512, 380, 500, 250, 0x1a1a3e);
    statsBg.setStrokeStyle(2, 0xff4444);

    // Final Score
    this.add.text(512, 300, "FINAL SCORE", {
      fontSize: "24px",
      fill: "#aaaaaa",
    }).setOrigin(0.5);

    this.add.text(512, 340, score.toLocaleString(), {
      fontSize: "48px",
      fill: "#ffff00",
      fontStyle: "bold",
    }).setOrigin(0.5);

    // Waves survived
    this.add.text(380, 420, "Waves Survived:", {
      fontSize: "18px",
      fill: "#ffffff",
    }).setOrigin(0.5);

    this.add.text(644, 420, `${waveIndex + 1}`, {
      fontSize: "28px",
      fill: "#00ffff",
      fontStyle: "bold",
    }).setOrigin(0.5);

    // Mission complete indicator
    if (missionComplete) {
      this.add.text(512, 480, "MISSION COMPLETE!", {
        fontSize: "24px",
        fill: "#00ff00",
        fontStyle: "bold",
      }).setOrigin(0.5);

      // Green pulse effect
      this.tweens.add({
        targets: title,
        alpha: 0.5,
        duration: 500,
        yoyo: true,
        repeat: -1,
      });
    }

    // Replay button
    const replayBg = this.add.rectangle(512, 580, 300, 60, 0x00aa00);
    replayBg.setStrokeStyle(2, 0x00ff00);

    this.add.text(512, 580, "REPLAY", {
      fontSize: "24px",
      fill: "#ffffff",
      fontStyle: "bold",
    }).setOrigin(0.5);

    replayBg.setInteractive({ useHandCursor: true });
    replayBg.on("pointerover", () => {
      replayBg.setFillStyle(0x00cc00);
    });
    replayBg.on("pointerout", () => {
      replayBg.setFillStyle(0x00aa00);
    });
    replayBg.on("pointerdown", () => {
      // Restart game from beginning
      this.scene.start("mapScene", { startWave: 0 });
    });

    // Main Menu button
    const menuBg = this.add.rectangle(512, 660, 300, 50, 0x444444);
    menuBg.setStrokeStyle(2, 0x888888);

    this.add.text(512, 660, "MAIN MENU", {
      fontSize: "20px",
      fill: "#ffffff",
    }).setOrigin(0.5);

    menuBg.setInteractive({ useHandCursor: true });
    menuBg.on("pointerover", () => {
      menuBg.setFillStyle(0x555555);
    });
    menuBg.on("pointerout", () => {
      menuBg.setFillStyle(0x444444);
    });
    menuBg.on("pointerdown", () => {
      // Go back to start screen
      this.scene.start("startScreen");
    });

    // Fade in overlay
    overlay.setAlpha(0);
    this.tweens.add({
      targets: overlay,
      alpha: 0.85,
      duration: 500,
    });

    // Fade in title and stats
    [title, statsBg].forEach((obj) => {
      obj.setAlpha(0);
      this.tweens.add({
        targets: obj,
        alpha: 1,
        y: obj.y - 20,
        duration: 600,
        delay: 200,
        ease: "Power2",
      });
    });
  }

  update() {}
}
