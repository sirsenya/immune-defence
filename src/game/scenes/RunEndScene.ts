import Phaser from 'phaser';
import type { Game } from '../Game';
import { COLORS, RUN_LENGTH } from '../../config/constants';

export class RunEndScene extends Phaser.Scene {
  private mobka!: Game;

  constructor() {
    super({ key: 'RunEnd' });
  }

  init() {
    this.mobka = this.registry.get('mobka:game') as Game;
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(COLORS.bg);

    this.add
      .rectangle(width / 2, height / 2, width - 80, height - 80, COLORS.panel, 1)
      .setStrokeStyle(3, COLORS.border, 1);

    this.add
      .text(width / 2, 80, 'RUN ЗАВЕРШЁН', {
        fontFamily: '"Courier New", monospace',
        fontSize: '52px',
        color: '#a3d97a',
      })
      .setOrigin(0.5);

    const past = this.mobka.state.pastDays;
    const totalCollected = past.reduce((acc, d) => acc + d.collected, 0);
    const totalTarget = past.reduce((acc, d) => acc + d.target, 0);
    const earned = this.mobka.state.totalEarned;
    const maxCombo = this.mobka.state.maxComboMultiplier;
    const finalDiscontent = this.mobka.state.resources.discontent;
    const finalLoyalty = this.mobka.state.resources.loyalty;

    const lines = [
      `Дней отработано:    ${past.length} / ${RUN_LENGTH}`,
      `План:               ${totalTarget}`,
      `Выполнено:          ${Math.round(totalCollected)}`,
      `Заработано:         ₽${earned}`,
      `Максимальное комбо: x${maxCombo.toFixed(2)}`,
      `Недовольство:       ${finalDiscontent}%`,
      `Лояльность:         ${finalLoyalty}%`,
    ];
    for (let i = 0; i < lines.length; i++) {
      this.add
        .text(width / 2, 200 + i * 30, lines[i] ?? '', {
          fontFamily: '"Courier New", monospace',
          fontSize: '18px',
          color: '#d8c9a8',
        })
        .setOrigin(0.5);
    }

    const verdict =
      totalCollected >= totalTarget ? '«ПЛАН ВЫПОЛНЕН. СЛАВА ОТДЕЛУ.»' : '«ПЛАН ПРОВАЛЕН. НО ОТДЕЛ ЕЩЁ СТОИТ.»';
    this.add
      .text(width / 2, height - 200, verdict, {
        fontFamily: '"Courier New", monospace',
        fontSize: '20px',
        color: totalCollected >= totalTarget ? '#a3d97a' : '#ff6b3a',
      })
      .setOrigin(0.5);

    this.makeButton(width / 2, height - 90, 'НАЧАТЬ НОВЫЙ RUN', () => {
      this.mobka.startNewRun();
      this.scene.start('Game');
    });
  }

  private makeButton(x: number, y: number, label: string, onClick: () => void): void {
    const w = 380;
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
