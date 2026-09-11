import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './config/constants';
import { Game } from './game/Game';
import { MainMenuScene } from './game/scenes/MainMenuScene';
import { GameScene } from './game/scenes/GameScene';
import { DayEndScene } from './game/scenes/DayEndScene';
import { GameOverScene } from './game/scenes/GameOverScene';
import { RunEndScene } from './game/scenes/RunEndScene';

const game = new Game();

const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH * dpr,
  height: GAME_HEIGHT * dpr,
  parent: 'game',
  backgroundColor: '#1a1612',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    zoom: 1 / dpr,
  },
  scene: [MainMenuScene, GameScene, DayEndScene, GameOverScene, RunEndScene],
  render: {
    pixelArt: false,
    antialias: true,
    roundPixels: false,
  },
};

const phaser = new Phaser.Game(config);

// Register the Game instance so scenes can pick it up on init.
phaser.registry.set('mobka:game', game);
