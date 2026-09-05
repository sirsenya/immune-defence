import Phaser from 'phaser';
import type { Game } from '../Game';
import { COLORS } from '../../config/constants';

export class MainMenuScene extends Phaser.Scene {
  private mobka!: Game;

  constructor() {
    super({ key: 'MainMenu' });
  }

  init() {
    this.mobka = this.registry.get('mobka:game') as Game;
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(COLORS.bg);

    // Stamp texture as background
    const bg = this.add.graphics();
    bg.fillStyle(COLORS.panel, 1);
    bg.fillRect(40, 40, width - 80, height - 80);
    bg.lineStyle(3, COLORS.border, 1);
    bg.strokeRect(40, 40, width - 80, height - 80);
    bg.lineStyle(1, COLORS.border, 0.6);
    bg.strokeRect(60, 60, width - 120, height - 120);

    // Title
    const title = this.add.text(width / 2, height / 2 - 220, 'МОБКА', {
      fontFamily: '"Courier New", monospace',
      fontSize: '84px',
      color: '#d8c9a8',
    });
    title.setOrigin(0.5);

    const subtitle = this.add.text(
      width / 2,
      height / 2 - 150,
      'САТИРИЧЕСКИЙ ОТДЕЛ МОБИЛИЗАЦИИ',
      {
        fontFamily: '"Courier New", monospace',
        fontSize: '20px',
        color: '#8a7a60',
      },
    );
    subtitle.setOrigin(0.5);

    const tag = this.add.text(
      width / 2,
      height / 2 - 110,
      '«план есть — работа есть»',
      {
        fontFamily: '"Courier New", monospace',
        fontSize: '16px',
        color: '#a3331f',
      },
    );
    tag.setOrigin(0.5);

    // Buttons
    this.makeButton(width / 2, height / 2 + 20, 'НОВЫЙ RUN', () => {
      this.mobka.startNewRun();
      this.scene.start('Game');
    });

    this.makeButton(width / 2, height / 2 + 80, 'ПРОДОЛЖИТЬ', () => {
      const ok = this.mobka.tryLoad();
      if (ok) {
        this.scene.start('Game');
      } else {
        this.scene.start('Game');
      }
    });

    // Footer
    const footer = this.add.text(
      width / 2,
      height - 72,
      '«Не пытайтесь выполнить план. Пытайтесь его перевыполнить.»',
      {
        fontFamily: '"Courier New", monospace',
        fontSize: '14px',
        color: '#5b4a36',
      },
    );
    footer.setOrigin(0.5);
  }

  private makeButton(x: number, y: number, label: string, onClick: () => void): void {
    const w = 320;
    const h = 50;
    const rect = this.add.rectangle(x, y, w, h, COLORS.panelLight, 1);
    rect.setStrokeStyle(2, COLORS.border, 1);
    rect.setInteractive({ useHandCursor: true });
    const text = this.add.text(x, y, label, {
      fontFamily: '"Courier New", monospace',
      fontSize: '20px',
      color: '#d8c9a8',
    });
    text.setOrigin(0.5);
    rect.on('pointerover', () => {
      rect.setFillStyle(COLORS.selected, 1);
      text.setColor('#ffffff');
    });
    rect.on('pointerout', () => {
      rect.setFillStyle(COLORS.panelLight, 1);
      text.setColor('#d8c9a8');
    });
    rect.on('pointerdown', () => {
      rect.setFillStyle(COLORS.border, 1);
    });
    rect.on('pointerup', () => {
      rect.setFillStyle(COLORS.selected, 1);
      onClick();
    });
  }
}
