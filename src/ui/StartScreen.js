/**
 * StartScreen - Neo Defense style start screen with mission selection
 */

import Phaser from "phaser";
import { MISSIONS } from "../config/wave-config";

export class StartScreen extends Phaser.Scene {
  constructor() {
    super("startScreen");
  }

  create() {
    // Dark background with gradient effect
    this.add.rectangle(512, 384, 1024, 768, 0x0a0a1a);

    // Title with glow effect
    const title = this.add.text(512, 150, "NEON DEFENSE", {
      fontSize: "72px",
      fill: "#00ffff",
      fontStyle: "bold",
      stroke: "#0088ff",
      strokeThickness: 8,
    });
    title.setOrigin(0.5);

    // Subtitle
    this.add.text(512, 220, "Tower Defense Clone", {
      fontSize: "28px",
      fill: "#aaaaaa",
      fontStyle: "italic",
    }).setOrigin(0.5);

    // Mission selection buttons
    const startY = 320;
    const buttonSpacing = 80;

    MISSIONS.forEach((mission, index) => {
      const y = startY + index * buttonSpacing;

      // Button background
      const bg = this.add.rectangle(512, y, 600, 60, 0x1a1a3e);
      bg.setStrokeStyle(2, 0x4488ff);

      // Mission number
      this.add.text(250, y, `Mission ${mission.id}`, {
        fontSize: "24px",
        fill: "#00ffff",
        fontStyle: "bold",
      }).setOrigin(0.5, 0.5);

      // Mission name
      this.add.text(420, y - 15, mission.name, {
        fontSize: "20px",
        fill: "#ffffff",
        fontStyle: "bold",
      }).setOrigin(0.5, 0.5);

      // Mission description
      this.add.text(420, y + 15, mission.description, {
        fontSize: "14px",
        fill: "#888888",
      }).setOrigin(0.5, 0.5);

      // Make interactive
      bg.setInteractive({ useHandCursor: true });
      bg.on("pointerover", () => {
        bg.setFillStyle(0x2a2a5e);
      });
      bg.on("pointerout", () => {
        bg.setFillStyle(0x1a1a3e);
      });
      bg.on("pointerdown", () => {
        // Start game with this mission's wave index
        this.scene.start("mapScene", { startWave: mission.startWave });
      });
    });

    // Instructions at bottom
    this.add.text(512, 700, "Click a mission to start", {
      fontSize: "18px",
      fill: "#666666",
    }).setOrigin(0.5);

    // Animated pulse on title
    this.tweens.add({
      targets: title,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  update() {}
}
