import Phaser from "phaser";
import Turret from "./classes/turrets/Turret";
import BaseEnemy from "./classes/enemies/BaseEnemy";
import Bullet from "./classes/bullet/Bullet";
import { formatDuration, toggleCurrentEnemiesSpeed } from "./helpers/helpers";
import { enemyClassTypes } from "./config/enemy-config";
import BaseTurret from "./classes/turrets/BaseTurret";
import { WAVE_DATA, MISSIONS, getCurrentMission } from "./config/wave-config";
import { turretsClassTypes } from "./config/turrets-config";
import PowerTurret from "./classes/turrets/PowerTurret";
import DroneEnemy from "./classes/enemies/DroneClass";
import { doc, getDoc, updateDoc } from "@firebase/firestore";
import { firebaseAuth, firebaseDB } from "./config/firebase";
import * as Sprites from "./parcelSpriteImports";
import * as AudioFiles from "./parcelAudioImports";
import lifeHeartImage from "../assets/images/life-heart.png";
import { createGameMap } from "./helpers/mapCreationHelpers";

// Neo Defense new turret imports
import BoosterTurret from "./classes/turrets/BoosterTurret";
import CannonTurret from "./classes/turrets/CannonTurret";
import VulcanTurret from "./classes/turrets/VulcanTurret";
import MissileTurret from "./classes/turrets/MissileTurret";

// SpriteGenerator for runtime sprite creation
import { SpriteGenerator } from "./utils/SpriteGenerator";

// TurretPopup for upgrade/sell system
import { TurretPopup } from "./ui/TurretPopup";

// SoundManager for Web Audio API synthesis
import { soundManager } from "./audio/SoundManager";

// UI Screens for Neo Defense style
import { StartScreen } from "./ui/StartScreen";
import { GameOverScreen } from "./ui/GameOverScreen";

const NEXT_WAVE_TIME = 30000;
const difficulty = localStorage.getItem("difficulty") || "4";
let hearts;

if (difficulty === "1") {
  hearts = 5;
}
if (difficulty === "2") {
  hearts = 4;
}
if (difficulty === "4") {
  hearts = 3;
}

// Neo Defense: Neon glow color palette
const NEON_GLOW_COLORS = {
  auto: 0xffffff,
  laser: 0x00ff00,
  shotgun: 0xffaa00,
  antiAir: 0xffffff,
  human: 0x00aaff,
  cannon: 0xff8800,
  vulcan: 0xffff00,
  missile: 0x00ffff,
  booster: 0x4488ff,
};

export default class MapScene extends Phaser.Scene {
  constructor() {
    super("mapScene");

    // Get start wave from scene data (for mission selection)
    const { startWave = 0 } = this.data.values;

    this.resources = 2000;
    this.score = 0;
    this.isWaveInProgress = false;
    this.startedGame = false;
    this.waveIndex = 0;
    this.boss = false;
    this.turretType = "auto";
    this.waveArray = convertObjectToArray(WAVE_DATA[this.waveIndex]);
    this.hearts = hearts;
    this.electric = false;
    this.fire = false;
    this.freeze = false;
    this.speedMultiplyer = 1;
    this.timeUntilNextWave = 0;
    this.isGamePaused = false;
    this.isAudioMuted = false;
    this.isMusicMuted = false;
    this.humanTurret = false;
    this.difficulty = parseInt(difficulty);

    // Neo Defense: Mission tracking
    this.currentMission = 0;
    this.missionComplete = false;

    // Neo Defense: Turret selection state for new types
    this.selectedTurretType = "cannon"; // Default to cannon for Neo Defense style

    // Neo Defense: Neon glow system
    this.neonGlowGraphics = null;
    this.glowUpdateTimer = 0;

    // Neo Defense: Particle effects system
    this.particleEffects = [];

    // Neo Defense: Sound manager initialized on first user interaction
    this.soundInitialized = false;

    // Neo Defense: Wave bonus tracking
    this.waveStartTime = 0;
  }
  init(data) {
    // Neo Defense: Get start wave from scene data (for mission selection)
    this.startWave = data?.startWave || 0;
  }

  preload() {
    // Neo Defense: Start with start screen instead of loading game immediately
    this.load.scenePlugin({
      key: "rexuiplugin",
      url: "", // Not needed for basic scenes
      sceneKey: "rexUIPlugin",
    });

    // Load game assets normally
    this.load.image("tiles", Sprites.map2Dsprites);
    loadAllSprites(this);
    loadAllAudio(this);
  }

  create() {
    // CREATE GAME MAP
    const { map, layer1, waveTimeRemainingText, scoreText, resourceText } =
      createGameMap(this);
    this.map = map;
    this.waveTimeRemainingText = waveTimeRemainingText;
    this.scoreText = scoreText;
    this.resourceText = resourceText;

    this.startBtn = document.getElementById("start");
    this.startBtn.addEventListener("click", () => {
      // Initialize sound on first user interaction (browser policy)
      if (!this.soundInitialized) {
        soundManager.init();
        this.soundInitialized = true;
      }
      this.startWave();
    });

    // Neo Defense: Initialize sound manager on any user interaction
    this.input.on("pointerdown", () => {
      if (!this.soundInitialized) {
        soundManager.init();
        this.soundInitialized = true;

        // Generate sprites after audio context is initialized
        SpriteGenerator.generateAll(this);
      }
    });

    this.speedBtn = document.getElementById("speed-up");
    this.speedBtn.addEventListener("click", this.toggleGameSpeed.bind(this));

    this.pauseBtn = document.getElementById("pause");
    this.pauseIcon = this.pauseBtn.querySelector("i");
    this.pauseBtn.addEventListener("click", this.togglePause.bind(this));

    //Audio additions
    this.lifeDamage = this.sound.add("life-damage");

    const settingsBtn = document.getElementById("settings");
    settingsBtn.addEventListener("click", this.togglePause.bind(this));

    const modalSettingsBtnClose = document
      .getElementById("modalSettings")
      .querySelector(".close-button");

    modalSettingsBtnClose.addEventListener(
      "click",
      this.togglePause.bind(this)
    );

    const audioSettingsBtn = document.getElementById("music");
    this.musicSettingsBtn = document.getElementById("mute-sound");
    this.audio = document.getElementById("synthwave-track");

    audioSettingsBtn.addEventListener("click", this.toggleAudioMute.bind(this));
    this.musicSettingsBtn.addEventListener(
      "click",
      this.toggleMusicMute.bind(this)
    );

    const replayBtn = document.getElementById("replay-button");
    replayBtn.addEventListener("click", () => location.reload());

    this.heartContainer = document.getElementById("heart-container");
    const autoTurret = document.getElementById("auto-turret");
    const laserTurret = document.getElementById("laser-turret");
    const shotgunTurret = document.getElementById("shotgun-turret");
    const antiAirTurret = document.getElementById("antiAir-turret");

    const humanTurret = document.getElementById("human-turret");

    this.humanTurretBtn = humanTurret;

    // Neo Defense: New turret button event listeners
    const cannonTurret = document.getElementById("cannon-turret");
    const vulcanTurret = document.getElementById("vulcan-turret");
    const missileTurret = document.getElementById("missile-turret");
    const boosterTurret = document.getElementById("booster-turret");

    // Existing turret buttons
    antiAirTurret.addEventListener("click", this.chooseTurretType.bind(this));
    autoTurret.addEventListener("click", this.chooseTurretType.bind(this));
    laserTurret.addEventListener("click", this.chooseTurretType.bind(this));
    shotgunTurret.addEventListener("click", this.chooseTurretType.bind(this));
    humanTurret.addEventListener("click", this.chooseTurretType.bind(this));

    // Neo Defense: New turret buttons
    if (cannonTurret) {
      cannonTurret.addEventListener("click", this.chooseTurretType.bind(this));
    }
    if (vulcanTurret) {
      vulcanTurret.addEventListener("click", this.chooseTurretType.bind(this));
    }
    if (missileTurret) {
      missileTurret.addEventListener("click", this.chooseTurretType.bind(this));
    }
    if (boosterTurret) {
      boosterTurret.addEventListener("click", this.chooseTurretType.bind(this));
    }

    this.electricTower = document.getElementById("electric");
    this.electricTower.addEventListener(
      "click",
      this.purchaseTower.bind(this, "electric", this.electricTower)
    );
    this.fireTower = document.getElementById("fire");
    this.fireTower.addEventListener(
      "click",
      this.purchaseTower.bind(this, "fire", this.fireTower)
    );

    this.freezeTower = document.getElementById("freeze");
    this.freezeTower.addEventListener(
      "click",
      this.purchaseTower.bind(this, "freeze", this.freezeTower)
    );

    // Neo Defense: New turret purchase handlers (reuse already-declared variables)
    if (cannonTurret) {
      cannonTurret.addEventListener(
        "click",
        this.purchaseTower.bind(this, "cannon", cannonTurret)
      );
    }

    if (vulcanTurret) {
      vulcanTurret.addEventListener(
        "click",
        this.purchaseTower.bind(this, "vulcan", vulcanTurret)
      );
    }

    if (missileTurret) {
      missileTurret.addEventListener(
        "click",
        this.purchaseTower.bind(this, "missile", missileTurret)
      );
    }

    if (boosterTurret) {
      boosterTurret.addEventListener(
        "click",
        this.purchaseTower.bind(this, "booster", boosterTurret)
      );
    }

    // Neo Defense: Neon glow graphics layer (behind everything)
    this.neonGlowGraphics = this.add.graphics();
    this.neonGlowGraphics.depth = -1; // Behind all game objects

    // Neo Defense: Particle effects container
    this.particleEffects = [];

    this.nextEnemy = 0;
    this.nextBoss = 0;

    // ADDING COLLISION FUNCTION BETWEEN CLASSES
    this.bullets = this.physics.add.group({
      classType: Bullet,
      runChildUpdate: true,
    });

    this.enemies = this.physics.add.group({
      classType: BaseEnemy,
      runChildUpdate: true,
    });

    this.turrets = this.add.group({
      classType: Turret && BaseTurret,
      runChildUpdate: true,
    });

    // OVERLAP FUNCTION
    this.physics.add.overlap(this.enemies, this.bullets, damageEnemy);

    this.displayHearts();
    // @ts-ignore
    this.audio.play();
    // @ts-ignore
    this.audio.volume = 0.3;
  }

  toggleAudioMute() {
    if (!this.isAudioMuted) {
      this.game.sound.mute = true;
      this.isAudioMuted = true;
    } else {
      this.game.sound.mute = false;
      this.isAudioMuted = false;
    }
  }

  toggleMusicMute() {
    if (this.isMusicMuted) {
      this.audio.play();
      this.isMusicMuted = false;
    } else {
      this.audio.pause();
      this.isMusicMuted = true;
    }
  }

  purchaseTower(type, buttonElement) {
    // Neo Defense: New turrets can be placed multiple times (not single-use like power towers)
    const isNewTurret = ["cannon", "vulcan", "missile", "booster"].includes(type);

    if (!isNewTurret && this[type] === true) return;

    const turretConfig = turretsClassTypes[type];
    if (!turretConfig) return;

    if (this.resources < turretConfig.cost) {
      this.notEnoughRes();
      return;
    }

    this.resources = this.resources - turretConfig.cost;
    this.updateResources();

    // Play purchase sound via SoundManager
    if (this.soundInitialized) {
      soundManager.play("turret-upgrade", { volume: 0.3 });
    }

    // Neo Defense: For new turrets, open placement mode on map click
    if (isNewTurret) {
      this.pendingPlacement = { type, config: turretConfig };
      this.showPlacementHint(type);

      // Add click handler for map placement
      if (!this.placementListener) {
        this.placementListener = this.input.on("pointerdown", (pointer) => {
          if (!this.pendingPlacement) return;

          const tileX = Math.floor(pointer.x / this.map.tileWidth);
          const tileY = Math.floor(pointer.y / this.map.tileHeight);

          // Check if placement is valid (on a buildable tile)
          const tileLayer = this.map.getLayer(0);
          const tile = tileLayer.getTileAt(tileX, tileY);

          if (tile && this.isValidPlacement(tile.index)) {
            this.placeTurret(this.pendingPlacement.type, this.pendingPlacement.config, pointer.x, pointer.y);
            this.pendingPlacement = null;
          } else {
            // Invalid placement - visual feedback
            this.showInvalidPlacement(pointer.x, pointer.y);
          }
        });
      }

      return;
    }

    // Existing power tower logic (electric, fire, freeze) - single use per mission
    let tileID;

    if (type === "electric") {
      tileID = 39;
      this.electricTower.innerHTML =
        '<i style="color: yellow" class="fa-solid fa-bolt-lightning"></i>';
    }
    if (type === "fire") {
      tileID = 59;
      this.fire.innerHTML =
        '<i style="color: red" class="fa-solid fa-fire"></i>';
    }
    if (type === "freeze") {
      tileID = 49;
      this.freezeTower.innerHTML =
        '<i style="color: aquamarine" class="fa-solid fa-icicles"></i>';
    }
    const tileInstances = [];

    const tileLayer = this.map.getLayer(0);

    tileLayer.data.forEach((row, y) => {
      row.forEach((tile, x) => {
        if (tile.index === tileID) {
          tileInstances.push({ x, y });
        }
      });
    });

    const tile = tileInstances[0];
    if (!tile) return; // No valid placement found

    const tileWidth = this.map.tileWidth;
    const tileHeight = this.map.tileHeight;
    const offsetX = tileWidth;
    const offsetY = tileHeight;
    const centerX = tile.x * tileWidth + offsetX;
    const centerY = tile.y * tileHeight + offsetY - 15;

    const tower = new PowerTurret(
      this,
      centerX,
      centerY,
      turretConfig
    );

    if (type === "electric") {
      this.electricTower = tower;
      // @ts-ignore
      this.upgradeElectricBtn.disabled = false;
    }
    if (type === "freeze") {
      this.freezeTower = tower;
      // @ts-ignore
      this.upgradeFreezeBtn.disabled = false;
    }
    if (type === "fire") {
      this.fireTower = tower;
      // @ts-ignore
      this.upgradeFireBtn.disabled = false;
    }

    this[type] = true;
  }

  /**
   * Neo Defense: Check if a tile is valid for turret placement
   */
  isValidPlacement(tileIndex) {
    // Valid placement tiles (adjust based on your tilemap)
    const validTiles = [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    return validTiles.includes(tileIndex);
  }

  /**
   * Neo Defense: Place a turret at the clicked position
   */
  placeTurret(type, config, x, y) {
    let turret;

    switch (type) {
      case "cannon":
        turret = new CannonTurret(this, x, y, config);
        break;
      case "vulcan":
        turret = new VulcanTurret(this, x, y, config);
        break;
      case "missile":
        turret = new MissileTurret(this, x, y, config);
        break;
      case "booster":
        turret = new BoosterTurret(this, x, y, config);
        break;
      default:
        return;
    }

    // Add to turrets group
    this.turrets.add(turret);

    // Make turret interactive for upgrade/sell popup
    turret.setInteractive();
    turret.on("pointerdown", (pointer) => {
      // Don't show popup if we're in placement mode
      if (this.pendingPlacement) return;

      // Close any existing popup first
      if (this.activePopup && this.activePopup.active) {
        this.activePopup.destroy();
      }

      // Show upgrade/sell popup
      this.activePopup = new TurretPopup(this, x, y - 40, turret);
      this.activePopup.autoDestroy();
    });

    // Create placement effect
    this._createPlacementEffect(x, y, config.glowColor);

    // Play placement sound
    if (this.soundInitialized) {
      soundManager.play("turret-upgrade", { volume: 0.2 });
    }

    // Clear placement mode
    this.pendingPlacement = null;
  }

  /**
   * Neo Defense: Show placement hint UI
   */
  showPlacementHint(type) {
    // Update resource text to show placement mode
    const hintMessages = {
      cannon: "Click on map to place Cannon (200 resources)",
      vulcan: "Click on map to place Vulcan (150 resources)",
      missile: "Click on map to place Missile (500 resources)",
      booster: "Click on map to place Booster (250 resources)",
    };

    this.resourceText.setText(hintMessages[type] || "Click on map to place turret");
  }

  /**
   * Neo Defense: Show invalid placement feedback
   */
  showInvalidPlacement(x, y) {
    const indicator = this.add.circle(x, y, 10, 0xff0000);
    indicator.setAlpha(0.8);

    this.tweens.add({
      targets: indicator,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 300,
      onComplete: () => indicator.destroy(),
    });
  }

  /**
   * Neo Defense: Create placement effect (expanding ring)
   */
  _createPlacementEffect(x, y, color) {
    const ring = this.add.circle(x, y, 5, color);
    ring.setAlpha(1);

    this.tweens.add({
      targets: ring,
      scaleX: 4,
      scaleY: 4,
      alpha: 0,
      duration: 400,
      onComplete: () => ring.destroy(),
    });

    // Spawn particles
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      const particle = this.add.circle(
        x + Math.cos(angle) * 10,
        y + Math.sin(angle) * 10,
        2,
        color
      );
      particle.setAlpha(1);

      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * 30,
        y: y + Math.sin(angle) * 30,
        alpha: 0,
        duration: 500,
        onComplete: () => particle.destroy(),
      });
    }
  }

  /**
   * Neo Defense: Create explosion particle effect
   */
  createExplosionEffect(x, y, color) {
    // Main explosion flash
    const flash = this.add.circle(x, y, 5, color);
    flash.setAlpha(1);

    this.tweens.add({
      targets: flash,
      scaleX: 5,
      scaleY: 5,
      alpha: 0,
      duration: 200,
      onComplete: () => flash.destroy(),
    });

    // Spawn particles in all directions
    const particleCount = 12;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 / particleCount) * i;
      const distance = 15 + Math.random() * 25;

      const particle = this.add.circle(
        x,
        y,
        2 + Math.random() * 3,
        color
      );
      particle.setAlpha(1);

      const targetX = x + Math.cos(angle) * distance;
      const targetY = y + Math.sin(angle) * distance;

      this.tweens.add({
        targets: particle,
        x: targetX,
        y: targetY,
        alpha: 0,
        duration: 300 + Math.random() * 200,
        ease: "Power1",
        onComplete: () => particle.destroy(),
      });
    }

    // Play explosion sound via SoundManager
    if (this.soundInitialized) {
      soundManager.play("explosion", { volume: 0.2 });
    }
  }

  /**
   * Neo Defense: Update neon glow effects for all game objects
   */
  updateNeonGlow() {
    if (!this.neonGlowGraphics) return;

    this.neonGlowGraphics.clear();

    // Draw glow for each turret
    const turrets = this.turrets.getChildren();
    for (const turret of turrets) {
      if (!turret.active || !turret.turretName) continue;

      const glowColor = NEON_GLOW_COLORS[turret.turretName] || 0xffffff;
      const pulse = Math.sin(Date.now() / 500 + turret.x) * 0.2 + 0.4;

      // Outer glow
      this.neonGlowGraphics.fillStyle(glowColor, pulse * 0.2);
      this.neonGlowGraphics.fillCircle(turret.x, turret.y, 25);

      // Inner bright core
      this.neonGlowGraphics.fillStyle(0xffffff, pulse * 0.3);
      this.neonGlowGraphics.fillCircle(turret.x, turret.y, 10);
    }

    // Draw glow for each enemy
    const enemies = this.enemies.getChildren();
    for (const enemy of enemies) {
      if (!enemy.active || !enemy.enemyName) continue;

      const enemyConfig = enemyClassTypes[enemy.enemyName];
      if (!enemyConfig || !enemyConfig.glowColor) continue;

      const glowColor = enemyConfig.glowColor;
      const pulse = Math.sin(Date.now() / 400 + enemy.x) * 0.3 + 0.5;

      // Enemy glow
      this.neonGlowGraphics.fillStyle(glowColor, pulse * 0.3);
      this.neonGlowGraphics.fillCircle(enemy.x, enemy.y, 18);

      // Inner bright core
      this.neonGlowGraphics.fillStyle(0xffffff, pulse * 0.4);
      this.neonGlowGraphics.fillCircle(enemy.x, enemy.y, 6);
    }

    // Draw range circles for hovered turrets (if any)
    // This is handled by the turret's own onPointerOver/onPointerOut methods
  }

  /**
   * Neo Defense: Create bullet trail effect
   */
  createBulletTrail(x, y, color) {
    const trail = this.add.circle(x, y, 1.5, color);
    trail.setAlpha(0.6);

    this.tweens.add({
      targets: trail,
      alpha: 0,
      duration: 150,
      onComplete: () => trail.destroy(),
    });
  }

  /**
   * Neo Defense: Create energy flow effect (booster to cannon)
   */
  createEnergyFlow(fromX, fromY, toX, toY, color) {
    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2 - 10;

    const particle = this.add.circle(midX, midY, 2, color);
    particle.setAlpha(0.8);

    this.tweens.add({
      targets: particle,
      x: toX,
      y: toY,
      alpha: 0,
      duration: 300,
      ease: "Power2",
      onComplete: () => particle.destroy(),
    });
  }

  displayHearts() {
    const hearts = Array.from(Array(this.hearts).keys());
    this.heartContainer.innerHTML = "";
    hearts.forEach((heart) => {
      const imageElement = document.createElement("img");
      imageElement.classList.add("heart-icon");
      imageElement.src = lifeHeartImage;
      this.heartContainer.appendChild(imageElement);
    });
  }

  toggleGameSpeed() {
    const currentEnemies = Array.from(this.enemies.children.entries);
    const currentTurrets = Array.from(this.turrets.children.entries);

    if (this.speedMultiplyer === 2) {
      this.speedMultiplyer = 1;
      this.speedBtn.innerHTML =
        'x2 Speed <i class="fa-sharp fa-solid fa-forward-fast"></i>';

      toggleCurrentEnemiesSpeed(0.5, currentEnemies, currentTurrets);
    } else {
      this.speedMultiplyer = 2;
      this.speedBtn.innerHTML =
        'x1 Speed <i class="fa-solid fa-forward-step"></i>';
      toggleCurrentEnemiesSpeed(2, currentEnemies, currentTurrets);
    }
  }

  updateResources() {
    this.resourceText.setText(`Resources: ${this.resources}`);
    this.scoreText.setText(`Score: ${this.score}`);
  }

  updateWaveTimeRemaining() {
    this.waveTimeRemainingText.setText(
      `Time Until Next Wave: ${formatDuration(this.timeUntilNextWave)}`
    );
  }

  notEnoughRes() {
    this.resourceText.setText(`Resources: Not enough resources`);

    this.time.addEvent({
      delay: 1000,
      callback: this.updateResources,
      callbackScope: this,
    });
  }

  togglePause() {
    if (this.isGamePaused) {
      this.physics.resume();
      this.scene.resume();
      this.pauseBtn.innerHTML =
        'Pause <i class="fa-sharp fa-solid fa-pause"></i>';

      this.isGamePaused = false;
    } else {
      this.pauseBtn.innerHTML =
        'Play <i class="fa-sharp fa-solid fa-play"></i>';
      this.physics.pause();
      this.scene.pause();
      this.isGamePaused = true;
    }
  }

  chooseTurretType(e) {
    const buttons = Array.from(
      document.querySelector(".turret-buttons").querySelectorAll("button")
    );

    buttons.forEach((button) => button.classList.remove("selected"));

    const button = e.target.closest("button");
    if (button) {
      button.classList.add("selected");
    }

    const type = button ? button.id.split("-")[0] : "auto";

    this.turretType = type;
  }

  takeHeart() {
    this.hearts--;
    if (this.hearts == 0) {
      this.gameOver();
    }
    this.displayHearts();
    this.lifeDamage.play({ volume: 0.6 });
  }

  gameOver() {
    this.physics.pause();
    this.scene.pause();
    const modalGameOver = document.getElementById("modalGameOver");
    modalGameOver.setAttribute("open", "");

    const score = document.getElementById("score");

    saveUserHighScore(this.score);

    score.textContent = `Your Score ${this.score.toString()}`;
  }

  spawnEnemiesForWave(enemyType) {
    let enemy;
    if (enemyType === "drone") {
      enemy = new DroneEnemy(this, 0, 0, enemyClassTypes[enemyType]);
    } else {
      enemy = new BaseEnemy(this, 0, 0, enemyClassTypes[enemyType]);
    }
    this.enemies.add(enemy);
    this.waveArray.shift();
  }

  startWave() {
    const bonus = (this.timeUntilNextWave * 10) / 1000;
    this.resources = this.resources + bonus;
    this.score = this.score + bonus;
    this.updateResources();
    this.startedGame = true;
    // @ts-ignore
    this.startBtn.disabled = true;
    // @ts-ignore
    const previousTimers = this.time._active;
    // remove previous timer
    if (previousTimers.length > 0) {
      previousTimers.forEach((timer) => this.time.removeEvent(timer));
    }

    if (WAVE_DATA.length <= this.waveIndex) {
      return;
    }

    if (!this.isWaveInProgress) {
      this.isWaveInProgress = true;
      this.waveArray = shuffleArray(
        convertObjectToArray(WAVE_DATA[this.waveIndex])
      );

      // Neo Defense: Show wave announcement
      const currentWaveData = WAVE_DATA[this.waveIndex];
      const isBossWave = currentWaveData.boss > 0;
      this.showWaveAnnouncement(this.waveIndex + 1, isBossWave);

      const time = this.waveArray.length * 1000 + NEXT_WAVE_TIME;

      this.timeUntilNextWave = time;

      this.time.addEvent({
        delay: 1000,
        repeat: time / 1000,
        callback: () => {
          this.timeUntilNextWave = this.timeUntilNextWave - 1000;
        },
        callbackScope: this,
      });
    }
  }

  endWave() {
    this.waveIndex++;
    this.isWaveInProgress = false;
    if (this.waveIndex >= WAVE_DATA.length) return;
    this.waveArray = shuffleArray(
      convertObjectToArray(WAVE_DATA[this.waveIndex])
    );
  }

  update(time, delta) {
    if (!this.startedGame) return;
    this.updateWaveTimeRemaining();

    // Neo Defense: Update neon glow effects periodically (every 100ms)
    if (time > this.glowUpdateTimer + 100) {
      this.updateNeonGlow();
      this.glowUpdateTimer = time;
    }

    // Neo Defense: Check mission completion and progression
    this.checkMissionProgress();

    if (this.enemies.getLength() === 0 && WAVE_DATA.length <= this.waveIndex) {
      this.gameOver();
    }

    if (this.timeUntilNextWave <= 0) {
      this.startWave();
    }
    if (!this.isWaveInProgress) return;

    if (time > this.nextEnemy && this.waveArray.length > 0) {
      // CHANGE DURATION OF ENEMY RESPAWN
      this.spawnEnemiesForWave(this.waveArray[0]);
      this.nextEnemy = time + 1000 / this.speedMultiplyer;
    }

    if (time > this.nextEnemy && this.waveArray.length === 0) {
      this.endWave();
      // @ts-ignore
      this.startBtn.disabled = false;
    }
  }

  /**
   * Neo Defense: Check mission progression and update UI
   */
  checkMissionProgress() {
    const newMission = getCurrentMission(this.waveIndex);

    if (newMission && newMission.id !== this.currentMission) {
      // Mission changed!
      this.currentMission = newMission.id;

      // Update mission display in UI if available
      const missionDisplay = document.getElementById("mission-display");
      if (missionDisplay) {
        missionDisplay.textContent = `Mission ${this.currentMission}: ${newMission.name}`;
      }

      // Show mission transition notification
      this.showMissionTransition(newMission);

      // Play wave start sound via SoundManager
      if (this.soundInitialized) {
        soundManager.play("wave-start", { volume: 0.3 });
      }

      // Update available turret buttons based on mission unlocks
      this.updateAvailableTurrets(newMission.unlockedTurrets);
    }
  }

  /**
   * Neo Defense: Show mission transition notification with enhanced UI
   */
  showMissionTransition(mission) {
    // Create dark overlay background
    const overlay = this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.7);
    overlay.setDepth(99);

    // Create mission title text with glow effect
    const titleText = this.add.text(512, 300, `MISSION ${mission.id}`, {
      fontSize: "48px",
      fill: "#00ffff",
      fontStyle: "bold",
      stroke: "#0088ff",
      strokeThickness: 6,
    });
    titleText.setOrigin(0.5);
    titleText.setDepth(100);

    // Create mission name text
    const nameText = this.add.text(512, 360, mission.name, {
      fontSize: "36px",
      fill: "#ffffff",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 4,
    });
    nameText.setOrigin(0.5);
    nameText.setDepth(100);

    // Create mission description text
    const descText = this.add.text(512, 420, mission.description, {
      fontSize: "20px",
      fill: "#aaaaaa",
      align: "center",
      wordWrap: { width: 600 },
    });
    descText.setOrigin(0.5);
    descText.setDepth(100);

    // Create "Press Start" text
    const startText = this.add.text(512, 500, "Press START to begin", {
      fontSize: "24px",
      fill: "#ffff00",
      fontStyle: "bold",
    });
    startText.setOrigin(0.5);
    startText.setDepth(100);

    // Animate all text elements in
    [titleText, nameText, descText, startText].forEach((text) => {
      text.setAlpha(0);
      this.tweens.add({
        targets: text,
        alpha: 1,
        y: text.y - 20,
        duration: 600,
        ease: "Power2",
      });
    });

    // Animate overlay in
    overlay.setAlpha(0);
    this.tweens.add({
      targets: overlay,
      alpha: 0.7,
      duration: 400,
    });

    // Animate all out after delay
    this.time.delayedCall(3000, () => {
      [titleText, nameText, descText, startText, overlay].forEach((obj) => {
        this.tweens.add({
          targets: obj,
          alpha: 0,
          duration: 500,
          onComplete: () => obj.destroy(),
        });
      });
    });
  }

  /**
   * Neo Defense: Show wave announcement overlay
   */
  showWaveAnnouncement(waveNumber, isBoss = false) {
    // Create dark overlay background
    const overlay = this.add.rectangle(512, 384, 1024, 768, 0x000000, 0.6);
    overlay.setDepth(99);

    // Create wave text with glow effect
    const waveText = this.add.text(512, 360, isBoss ? "⚠ BOSS WAVE ⚠" : `WAVE ${waveNumber}`, {
      fontSize: isBoss ? "56px" : "48px",
      fill: isBoss ? "#ff0000" : "#00ffff",
      fontStyle: "bold",
      stroke: isBoss ? "#880000" : "#0088ff",
      strokeThickness: 6,
    });
    waveText.setOrigin(0.5);
    waveText.setDepth(100);

    // Animate in with scale effect
    waveText.setScale(0);
    overlay.setAlpha(0);

    this.tweens.add({
      targets: waveText,
      alpha: 1,
      scale: 1,
      duration: 400,
      ease: "Back.out",
    });

    this.tweens.add({
      targets: overlay,
      alpha: 0.6,
      duration: 300,
    });

    // Animate out after delay
    this.time.delayedCall(2000, () => {
      this.tweens.add({
        targets: [waveText, overlay],
        alpha: 0,
        scale: 1.2,
        duration: 400,
        onComplete: () => {
          waveText.destroy();
          overlay.destroy();
        },
      });
    });

    // Play wave start sound via SoundManager
    if (this.soundInitialized) {
      soundManager.play("wave-start", { volume: isBoss ? 0.5 : 0.3 });
    }
  }

  /**
   * Neo Defense: Update available turret buttons based on mission unlocks
   */
  updateAvailableTurrets(unlockedTypes) {
    const turretButtons = document.querySelectorAll(".turret-buttons button");

    turretButtons.forEach((button) => {
      const type = button.id.split("-")[0];

      if (unlockedTypes.includes(type)) {
        button.style.opacity = "1";
        button.disabled = false;
      } else {
        button.style.opacity = "0.3";
        button.disabled = true;
      }
    });
  }

  /**
   * Neo Defense: Handle enemy death with special effects
   */
  handleEnemyDeath(enemy) {
    const glowColor = enemyClassTypes[enemy.enemyName]?.glowColor || 0xff0000;

    // Create explosion effect
    this.createExplosionEffect(enemy.x, enemy.y, glowColor);

    // Handle special enemy types
    if (enemy.type === "splitter") {
      this._handleSplitterDeath(enemy);
    }

    // Handle regenerator death (no special effect needed)
  }

  /**
   * Neo Defense: Handle splitter enemy death - spawn 2 smaller enemies
   */
  _handleSplitterDeath(parentEnemy) {
    // Create 2 smaller "baby" splitters
    for (let i = 0; i < 2; i++) {
      const angle = Math.random() * Math.PI * 2;
      const offsetX = Math.cos(angle) * 15;
      const offsetY = Math.sin(angle) * 15;

      // Create a smaller, weaker version
      const babyConfig = {
        name: "baby-splitter",
        sprite: parentEnemy.sprite,
        health: Math.floor(parentEnemy.health * 0.3),
        speed: parentEnemy.speed * 1.5, // Faster but weaker
        resources: Math.floor(parentEnemy.resources / 3),
        glowColor: 0xff6699, // Pink variant
      };

      const babyEnemy = new BaseEnemy(
        this,
        parentEnemy.x + offsetX,
        parentEnemy.y + offsetY,
        babyConfig
      );

      this.enemies.add(babyEnemy);

      // Spawn effect for splitting
      const splitEffect = this.add.circle(
        parentEnemy.x,
        parentEnemy.y,
        5,
        0xff6699
      );
      splitEffect.setAlpha(1);

      this.tweens.add({
        targets: splitEffect,
        scaleX: 3,
        scaleY: 3,
        alpha: 0,
        duration: 200,
        onComplete: () => splitEffect.destroy(),
      });
    }
  }
}

// DAMAGE FUNCTION
function damageEnemy(enemy, bullet) {
  bullet.destroy();

  enemy.damageTaken(bullet.damage);

  // Neo Defense: Create bullet trail effect
  if (enemy.MapScene && enemy.MapScene.createBulletTrail) {
    enemy.MapScene.createBulletTrail(enemy.x, enemy.y, 0xffaa44);
  }
}

// Override the enemy death handling to include Neo Defense effects
const originalDamageTaken = BaseEnemy.prototype.damageTaken;
BaseEnemy.prototype.damageTaken = function(damage) {
  const wasAlive = this.currentHealth > 0;
  originalDamageTaken.call(this, damage);

  // Neo Defense: Handle special enemy types on death
  if (wasAlive && this.currentHealth <= 0) {
    const scene = this.MapScene;
    if (scene && scene.handleEnemyDeath) {
      scene.handleEnemyDeath(this);
    }

    // Neo Defense: Play enemy death sound via SoundManager
    if (scene && scene.soundInitialized) {
      soundManager.play("enemy-death", { volume: 0.2 });
    }

    // Neo Defense: Booster collects energy from enemy death
    if (scene) {
      const turrets = scene.turrets.getChildren();
      for (const turret of turrets) {
        if (turret.constructor.name === "BoosterTurret") {
          const distance = Phaser.Math.Distance.Between(
            turret.x,
            turret.y,
            this.x,
            this.y
          );
          if (distance <= turret.collectionRadius) {
            // Booster collects energy from nearby enemy death
            const energyGain = Math.max(1, Math.floor(this.health / 30));
            turret.charge = Math.min(turret.maxCharge, turret.charge + energyGain);

            // Visual feedback - energy particle flowing to booster
            if (scene.createEnergyFlow) {
              scene.createEnergyFlow(this.x, this.y, turret.x, turret.y, 0x4488ff);
            }
          }
        }
      }
    }
  }
};
function convertObjectToArray(obj) {
  const array = [];

  // Iterate over the object properties
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];

      // Skip the "boss" key for now
      if (key !== "boss" && value > 0) {
        // Create individual strings for each enemy type
        for (let i = 0; i < value; i++) {
          array.push(key);
        }
      }
    }
  }

  // Add the "boss" key last if it exists and its value is greater than 0
  if (obj.hasOwnProperty("boss") && obj.boss > 0) {
    array.push("boss");
  }

  return array.filter((element) => element !== "enemies");
}

function loadAllSprites(scene) {
  scene.load.image("interactive-tile", Sprites.interactiveTile);

  // AntiAir Sprites
  scene.load.image("antiAir", Sprites.antiAir);
  scene.load.image("antiAir2", Sprites.antiAir2);
  scene.load.image("antiAir3", Sprites.antiAir3);

  // Turret Sprites
  scene.load.image("turret", Sprites.turret);
  scene.load.image("turret2", Sprites.turret2);
  scene.load.image("turret3", Sprites.turret3);
  // Laser Sprites
  scene.load.image("laser", Sprites.laser);
  scene.load.image("laser2", Sprites.laser2);
  scene.load.image("laser3", Sprites.laser3);
  // Shotgun Sprites
  scene.load.image("shotgun", Sprites.shotgun);
  scene.load.image("shotgun2", Sprites.shotgun2);
  scene.load.image("shotgun3", Sprites.shotgun3);
  // Human Sprites
  scene.load.image("human", Sprites.human);
  scene.load.image("human2", Sprites.human2);
  scene.load.image("human3", Sprites.human3);
  // Electric Sprites
  scene.load.image("electric", Sprites.electricTowerActive);
  scene.load.image("electric-inactive", Sprites.electricTowerInactive);
  // Freeze Sprites
  scene.load.image("freeze", Sprites.freezeTowerActive);
  scene.load.image("freeze-inactive", Sprites.freezeTowerInactive);
  // Fire Sprites
  scene.load.image("fire", Sprites.fireTowerActive);
  scene.load.image("fire-inactive", Sprites.fireTowerInActive);
  // Enemy Sprites
  scene.load.image("robot", Sprites.robot);
  scene.load.image("heavybot", Sprites.heavyBot);
  scene.load.image("spider", Sprites.spider);
  scene.load.image("drone", Sprites.drone);
  scene.load.image("golem", Sprites.golem);
  scene.load.image("boss", Sprites.boss);
  // Bullet Sprites
  scene.load.image("bullet", Sprites.bullet);
  scene.load.image("ShotGunBullet", Sprites.shotgunBullet);
  scene.load.image("HumanBullet", Sprites.humanBullet);
  scene.load.image("AntiAerialBullet", Sprites.aerialBullet);
}

function loadAllAudio(scene) {
  scene.load.audio("electric-audio", AudioFiles.electricity);
  scene.load.audio("fire-audio", AudioFiles.fire);
  scene.load.audio("freeze-audio", AudioFiles.freeze);
  scene.load.audio("power-up", AudioFiles.powerUp);

  scene.load.audio("laser", AudioFiles.laser);
  scene.load.audio("bulletsound", AudioFiles.bullet);
  scene.load.audio("shotgunsound", AudioFiles.shotgun);
  scene.load.audio("plasmasound", AudioFiles.plasma);
  scene.load.audio("antiAirsound", AudioFiles.antiAir);

  scene.load.audio("dead", AudioFiles.dead);
  scene.load.audio("dead-boss", AudioFiles.deadboss);

  scene.load.audio("life-damage", AudioFiles.lifeDamage);
  scene.load.audio("synthwave", AudioFiles.synthWave);
}

async function saveUserHighScore(score) {
  if (!firebaseAuth.currentUser) return;
  try {
    const docRef = doc(firebaseDB, "users", firebaseAuth.currentUser.uid);
    const userSnap = await getDoc(docRef);

    if (userSnap.exists()) {
      const user = userSnap.data();

      if (user.highScore < score) {
        await updateDoc(docRef, {
          highScore: score,
        });
      }
    } else {
      console.log("No such document!");
    }
  } catch (error) {
    console.error("Error retrieving stories:", error);
    alert("Failed to retrieve stories. Please try again.");
  }
}
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
