import Phaser from 'phaser';
import type { Game } from '../Game';
import type { GameEvent, UpgradeDef } from '../types/game';
import { COLORS, RUN_LENGTH } from '../../config/constants';
import { UPGRADE_POOL, hasUpgrade } from '../data/upgrades';
import { pickEventForState } from '../systems/EventSystem';
import { createRng, shuffle } from '../utils/random';
import { TEXT, UI_COLORS } from '../../ui/styles';

export class DayEndScene extends Phaser.Scene {
  private mobka!: Game;
  private currentEvent: GameEvent | null = null;
  private currentShopItems: UpgradeDef[] = [];

  constructor() {
    super({ key: 'DayEnd' });
  }

  init() {
    this.mobka = this.registry.get('mobka:game') as Game;
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(COLORS.bg);

    this.showSummary(width, height);
  }

  // --- Stages ----------------------------------------------------------

  private clearStage(): void {
    this.children.removeAll(true);
  }

  private showSummary(width: number, height: number): void {
    this.clearStage();

    const result = this.mobka.state.pastDays[this.mobka.state.pastDays.length - 1];
    if (!result) {
      this.scene.start('Game');
      return;
    }

    this.drawHeader(width);

    // Summary panel
    const panelX = 60;
    const panelY = 100;
    const panelW = width - 120;
    const panelH = 360;
    this.add
      .rectangle(panelX + panelW / 2, panelY + panelH / 2, panelW, panelH, COLORS.panel, 1)
      .setStrokeStyle(2, COLORS.border, 1);

    this.add.text(panelX + 20, panelY + 14, `ИТОГИ ДНЯ ${result.day}`, TEXT.dayTitle);

    const headlineColor =
      result.overfulfilledPercent >= 5
        ? UI_COLORS.green
        : result.overfulfilledPercent >= -5
          ? UI_COLORS.cream
          : UI_COLORS.warning;
    this.add.text(panelX + 20, panelY + 60, result.message, { ...TEXT.headline, color: headlineColor });

    const lines = [
      `План:           ${result.target}`,
      `Собрано:        ${result.collected}`,
      `База:           ${result.baseCollected}`,
      `Множитель комбо: x${result.multiplier.toFixed(2)}`,
      `Перевыполнение: ${result.overfulfilledPercent >= 0 ? '+' : ''}${result.overfulfilledPercent}%`,
      ``,
      `+ ₽${result.moneyEarned}        (бюджет)`,
      `+ ${result.adminEarned} адм. ресурса`,
      `${result.loyaltyDelta >= 0 ? '+' : ''}${result.loyaltyDelta} лояльность`,
      `${result.discontentDelta >= 0 ? '+' : ''}${result.discontentDelta} недовольство`,
      `${result.securityDelta >= 0 ? '+' : ''}${result.securityDelta} безопасность`,
    ];
    for (let i = 0; i < lines.length; i++) {
      this.add.text(panelX + 40, panelY + 130 + i * 22, lines[i] ?? '', TEXT.body);
    }

    // Continue button
    const btnW = 320;
    const btnH = 48;
    this.makeButton(width / 2 - btnW / 2, height - 80, btnW, btnH, 'ПРОДОЛЖИТЬ', () => {
      this.showEvent(width, height);
    });
  }

  private showEvent(width: number, height: number): void {
    this.clearStage();
    this.currentEvent = pickEventForState(this.mobka.state);

    this.drawHeader(width);

    if (!this.currentEvent) {
      this.continueAfterEvent();
      return;
    }

    const panelX = 60;
    const panelY = 100;
    const panelW = width - 120;
    const panelH = height - 200;
    this.add
      .rectangle(panelX + panelW / 2, panelY + panelH / 2, panelW, panelH, COLORS.panel, 1)
      .setStrokeStyle(2, COLORS.border, 1);

    this.add.text(panelX + 20, panelY + 14, `СОБЫТИЕ: ${this.currentEvent.title}`, TEXT.eventTitle);
    this.add.text(panelX + 20, panelY + 56, this.currentEvent.text, {
      ...TEXT.body,
      wordWrap: { width: panelW - 40 },
    });

    const choices = this.currentEvent.choices;
    for (let i = 0; i < choices.length; i++) {
      const c = choices[i]!;
      const y = panelY + 160 + i * 70;
      this.makeButton(
        panelX + 30,
        y,
        panelW - 60,
        60,
        c.label,
        () => {
          this.mobka.applyEventChoice(i);
          this.continueAfterEvent();
        },
        c.description,
      );
    }
  }

  private continueAfterEvent(): void {
    if (this.mobka.state.status === 'gameOver') {
      this.scene.start('GameOver', { reason: this.mobka.state.gameOverReason ?? '' });
      return;
    }
    this.showShop(this.scale.width, this.scale.height);
  }

  private showShop(width: number, height: number): void {
    this.clearStage();

    this.drawHeader(width);

    // Pick 4 random upgrades the player doesn't already own.
    const available = UPGRADE_POOL.filter((u) => !hasUpgrade(this.mobka.state, u.id));
    const rng = createRng(this.mobka.state.runSeed * 991 + this.mobka.state.day * 17);
    this.currentShopItems = shuffle(rng, available).slice(0, 4);

    const panelX = 60;
    const panelY = 100;
    const panelW = width - 120;
    const panelH = height - 240;
    this.add
      .rectangle(panelX + panelW / 2, panelY + panelH / 2, panelW, panelH, COLORS.panel, 1)
      .setStrokeStyle(2, COLORS.border, 1);

    this.add.text(panelX + 20, panelY + 14, 'ОТДЕЛ СНАБЖЕНИЯ', TEXT.eventTitle);

    const state = this.mobka.state;
    this.add
      .text(panelX + panelW - 20, panelY + 16, `Бюджет: ₽${state.resources.money}`, {
        ...TEXT.body,
        color: UI_COLORS.green,
      })
      .setOrigin(1, 0);

    if (this.currentShopItems.length === 0) {
      this.add.text(panelX + 20, panelY + 60, 'Снабжение закончилось. Все улучшения приобретены.', TEXT.bodyDim);
    } else {
      const colW = (panelW - 60) / 2;
      for (let i = 0; i < this.currentShopItems.length; i++) {
        const u = this.currentShopItems[i]!;
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = panelX + 20 + col * (colW + 20);
        const y = panelY + 60 + row * 130;
        this.makeShopItem(x, y, colW - 20, 120, u);
      }
    }

    // Continue / End run buttons
    if (this.mobka.state.day >= RUN_LENGTH) {
      const btnW = 360;
      this.makeButton(width / 2 - btnW / 2, height - 80, btnW, 48, 'ЗАВЕРШИТЬ RUN', () => {
        this.mobka.endRun();
        this.scene.start('RunEnd');
      });
    } else {
      const btnW = 360;
      this.makeButton(width / 2 - btnW / 2, height - 80, btnW, 48, 'СЛЕДУЮЩИЙ ДЕНЬ', () => {
        this.mobka.startNextDay();
        this.scene.start('Game');
      });
    }
  }

  private makeShopItem(x: number, y: number, w: number, h: number, u: UpgradeDef): void {
    const bg = this.add.rectangle(x + w / 2, y + h / 2, w, h, COLORS.panelLight, 1);
    bg.setStrokeStyle(1, COLORS.border, 1);
    bg.setInteractive({ useHandCursor: true });

    this.add.text(x + 12, y + 8, u.name, TEXT.shopName);
    this.add.text(x + 12, y + 30, u.description, {
      ...TEXT.shopDesc,
      wordWrap: { width: w - 24 },
    });

    const canBuy = this.mobka.state.resources.money >= u.cost;
    const costText = this.add.text(x + w - 12, y + 8, `₽${u.cost}`, {
      ...TEXT.shopCost,
      color: canBuy ? UI_COLORS.green : UI_COLORS.red,
    });
    costText.setOrigin(1, 0);

    const buyBtn = this.add.rectangle(x + w / 2, y + h - 24, w - 24, 28, canBuy ? COLORS.stamp : COLORS.panel, 1);
    buyBtn.setStrokeStyle(1, COLORS.warning, 1);
    buyBtn.setInteractive({ useHandCursor: canBuy });
    const buyLabel = this.add.text(x + w / 2, y + h - 24, 'КУПИТЬ', TEXT.buttonBuy);
    buyLabel.setOrigin(0.5);

    if (canBuy) {
      buyBtn.on('pointerdown', () => {
        if (this.mobka.buyUpgrade(u.id)) {
          // Refresh shop
          this.showShop(this.scale.width, this.scale.height);
        }
      });
    }
  }

  // --- Utilities --------------------------------------------------------

  private drawHeader(width: number): void {
    const s = this.mobka.state;
    this.add.rectangle(0, 0, width, 70, COLORS.panel, 1).setOrigin(0, 0);
    this.add.text(16, 12, 'МОБКА', { ...TEXT.button, fontSize: '24px' });
    this.add
      .text(
        width - 16,
        14,
        `ДЕНЬ ${s.day}/${RUN_LENGTH}   ПЛАН ${s.plan}   ₽${s.resources.money}   адм ${s.resources.admin}   недовольство ${s.resources.discontent}`,
        TEXT.panelHeader,
      )
      .setOrigin(1, 0);
  }

  private makeButton(
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    onClick: () => void,
    sub?: string,
  ): void {
    const bg = this.add.rectangle(x + w / 2, y + h / 2, w, h, COLORS.panelLight, 1);
    bg.setStrokeStyle(2, COLORS.border, 1);
    bg.setInteractive({ useHandCursor: true });
    const t = this.add.text(x + w / 2, y + h / 2, label, TEXT.buttonSmall);
    t.setOrigin(0.5);
    bg.on('pointerover', () => bg.setFillStyle(COLORS.selected, 1));
    bg.on('pointerout', () => bg.setFillStyle(COLORS.panelLight, 1));
    bg.on('pointerdown', () => {
      bg.setFillStyle(COLORS.border, 1);
      onClick();
    });
    if (sub) {
      this.add.text(x + 12, y + h - 16, sub, {
        ...TEXT.tiny,
        color: UI_COLORS.dim,
        wordWrap: { width: w - 24 },
      });
    }
  }
}
