import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './config/constants';
import { Game } from './game/Game';
import { MainMenuScene } from './game/scenes/MainMenuScene';
import { GameScene } from './game/scenes/GameScene';
import { DayEndScene } from './game/scenes/DayEndScene';
import { GameOverScene } from './game/scenes/GameOverScene';
import { RunEndScene } from './game/scenes/RunEndScene';

const game = new Game();

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game',
  backgroundColor: '#1a1612',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [MainMenuScene, GameScene, DayEndScene, GameOverScene, RunEndScene],
  render: {
    pixelArt: false,
    antialias: true,
  },
};

const phaser = new Phaser.Game(config);

// Register the Game instance so scenes can pick it up on init.
phaser.registry.set('mobka:game', game);
