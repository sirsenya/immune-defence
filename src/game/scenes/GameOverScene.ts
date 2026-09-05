import Phaser from 'phaser';
import type { Game } from '../Game';
import { COLORS } from '../../config/constants';

export class GameOverScene extends Phaser.Scene {
  private mobka!: Game;
  private reason: string = '';

  constructor() {
    super({ key: 'GameOver' });
  }

  init(data: { reason?: string }) {
    this.mobka = this.registry.get('mobka:game') as Game;
    this.reason = data?.reason ?? '';
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(COLORS.bg);

    this.add.rectangle(width / 2, height / 2, width - 80, height - 80, COLORS.panel, 1)
      .setStrokeStyle(3, COLORS.red, 1);

    const stamp = this.add.rectangle(width / 2, 140, 360, 80, 0x000000, 0);
    stamp.setStrokeStyle(4, COLORS.red, 1);

    const t = this.add.text(width / 2, 140, 'УВОЛЕН', {
      fontFamily: '"Courier New", monospace',
      fontSize: '54px',
      color: '#a3331f',
    });
    t.setOrigin(0.5);
    t.setRotation(Phaser.Math.DegToRad(-8));

    this.add.text(width / 2, height / 2 - 60, this.reason || 'Отдел расформирован.', {
      fontFamily: '"Courier New", monospace',
      fontSize: '20px',
      color: '#d8c9a8',
      align: 'center',
      wordWrap: { width: width - 200 },
    }).setOrigin(0.5);

    const past = this.mobka.state.pastDays;
    const total = past.reduce((acc, d) => acc + d.collected, 0);
    const target = past.reduce((acc, d) => acc + d.target, 0);
    const earned = this.mobka.state.totalEarned;
    const maxCombo = this.mobka.state.maxComboMultiplier;

    const stats = [
      `Дней отработано: ${past.length}`,
      `План / Факт: ${target} / ${Math.round(total)}`,
      `Заработано: ₽${earned}`,
      `Макс. комбо: x${maxCombo.toFixed(2)}`,
    ];
    for (let i = 0; i < stats.length; i++) {
      this.add.text(width / 2, height / 2 + 10 + i * 26, stats[i] ?? '', {
        fontFamily: '"Courier New", monospace',
        fontSize: '16px',
        color: '#8a7a60',
      }).setOrigin(0.5);
    }

    this.makeButton(width / 2, height - 100, 'НАЧАТЬ НОВЫЙ RUN', () => {
      this.mobka.startNewRun();
      this.scene.start('Game');
    });
  }

  private makeButton(x: number, y: number, label: string, onClick: () => void): void {
    const w = 360;
    const h = 50;
    const bg = this.add.rectangle(x, y, w, h, COLORS.panelLight, 1);
    bg.setStrokeStyle(2, COLORS.border, 1);
    bg.setInteractive({ useHandCursor: true });
    const t = this.add.text(x, y, label, {
      fontFamily: '"Courier New", monospace',
      fontSize: '20px',
      color: '#d8c9a8',
    });
    t.setOrigin(0.5);
    bg.on('pointerover', () => bg.setFillStyle(COLORS.selected, 1));
    bg.on('pointerout', () => bg.setFillStyle(COLORS.panelLight, 1));
    bg.on('pointerdown', () => onClick());
  }
}
