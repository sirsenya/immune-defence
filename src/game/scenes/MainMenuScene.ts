import Phaser from 'phaser';
import type { Game } from '../Game';
import { COLORS } from '../../config/constants';
import { TEXT, BUTTON } from '../../ui/styles';

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

    this.drawBackground(width, height);
    this.drawHeader(width, height);
    this.drawButtons(width, height);
    this.drawFooter(width, height);
  }

  // ── Background (double-stamped paper border) ────────────────────────────
  private drawBackground(width: number, height: number): void {
    const bg = this.add.graphics();

    // outer thick border
    bg.fillStyle(COLORS.panel, 1);
    bg.fillRect(40, 40, width - 80, height - 80);
    bg.lineStyle(3, COLORS.border, 1);
    bg.strokeRect(40, 40, width - 80, height - 80);

    // inner thin border
    bg.lineStyle(1, COLORS.border, 0.6);
    bg.strokeRect(60, 60, width - 120, height - 120);
  }

  // ── Header (title + subtitle + tagline) ────────────────────────────────
  private drawHeader(width: number, height: number): void {
    const cx = width / 2;
    const cy = height / 2;

    this.add.text(cx, cy - 220, 'МОБКА', TEXT.title).setOrigin(0.5);
    this.add.text(cx, cy - 150, 'ОТДЕЛ МОБИЛИЗАЦИИ', TEXT.subtitle).setOrigin(0.5);
    this.add.text(cx, cy - 110, '«план есть — надо выполнять»', TEXT.tagline).setOrigin(0.5);
  }

  // ── Buttons ─────────────────────────────────────────────────────────────
  private drawButtons(width: number, height: number): void {
    const cx = width / 2;
    const cy = height / 2;

    this.makeButton(cx, cy + 20, 'НОВАЯ ИГРА', () => {
      this.mobka.startNewRun();
      this.scene.start('Game');
    });

    this.makeButton(cx, cy + 80, 'ПРОДОЛЖИТЬ', () => {
      const ok = this.mobka.tryLoad();
      if (ok) this.scene.start('Game');
      else this.scene.start('Game');
    });
  }

  // ── Footer ──────────────────────────────────────────────────────────────
  private drawFooter(width: number, height: number): void {
    this.add
      .text(width / 2, height - 72, '«Не пытайтесь выполнить план. Пытайтесь его перевыполнить.»', TEXT.footer)
      .setOrigin(0.5);
  }

  // ── Button factory ──────────────────────────────────────────────────────
  private makeButton(x: number, y: number, label: string, onClick: () => void): void {
    const rect = this.add
      .rectangle(x, y, BUTTON.width, BUTTON.height, COLORS.panelLight, 1)
      .setStrokeStyle(BUTTON.borderWidth, COLORS.border, 1)
      .setInteractive({ useHandCursor: true });

    const text = this.add.text(x, y, label, TEXT.button).setOrigin(0.5);

    rect.on('pointerover', () => {
      rect.setFillStyle(COLORS.selected, 1);
      text.setColor(BUTTON.textHover);
    });
    rect.on('pointerout', () => {
      rect.setFillStyle(COLORS.panelLight, 1);
      text.setColor(BUTTON.textDefault);
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
