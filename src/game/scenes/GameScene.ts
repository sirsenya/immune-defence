import Phaser from 'phaser';
import type { Game } from '../Game';
import type { ActionId, GameState, PersonData } from '../types/game';
import { ACTIONS, COLORS, RUN_LENGTH } from '../../config/constants';
import { TEXT, UI_COLORS, LAYOUT } from '../../ui/styles';

interface CitizenCardRefs {
  container: Phaser.GameObjects.Container;
  bg: Phaser.GameObjects.Rectangle;
  selected: boolean;
}

interface SelectedRef {
  container: Phaser.GameObjects.Container;
  person: PersonData;
}

export class GameScene extends Phaser.Scene {
  private mobka!: Game;
  private activePersonId: string | null = null;

  private resourceTexts: Phaser.GameObjects.Text[] = [];
  private resourceBars: Phaser.GameObjects.Graphics[] = [];

  private poolContainer!: Phaser.GameObjects.Container;
  private poolCards: Map<string, CitizenCardRefs> = new Map();
  private selectedContainer!: Phaser.GameObjects.Container;
  private selectedItems: SelectedRef[] = [];

  private comboText!: Phaser.GameObjects.Text;
  private forecastText!: Phaser.GameObjects.Text;

  private actionButtons: Map<ActionId, Phaser.GameObjects.Container> = new Map();
  private finishBtn!: Phaser.GameObjects.Container;
  private logText!: Phaser.GameObjects.Text;
  private actionsPanel!: Phaser.GameObjects.Container;
  private dayLabel!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'Game' });
  }

  init() {
    this.mobka = this.registry.get('mobka:game') as Game;
  }

  create(): void {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor(COLORS.bg);

    this.drawLayout(width, height);
    this.drawResources(width, height);
    this.drawPool(width, height);
    this.drawSelected(width, height);
    this.drawActions(width, height);
    this.drawFinishButton(width, height);

    this.refreshAll();

    this.events.on('shutdown', () => {
      this.poolCards.clear();
      this.selectedItems = [];
      this.actionButtons.clear();
    });
  }

  // --- Layout primitives --------------------------------------------------

  private panel(x: number, y: number, w: number, h: number, color = COLORS.panel): Phaser.GameObjects.Rectangle {
    const rect = this.add.rectangle(x + w / 2, y + h / 2, w, h, color, 1);
    rect.setStrokeStyle(2, COLORS.border, 1);
    return rect;
  }

  private drawLayout(width: number, height: number): void {
    // Header
    this.add.rectangle(0, 0, width, LAYOUT.headerHeight, COLORS.panel, 1).setOrigin(0, 0);
    this.add.text(16, 14, 'МОБКА', { ...TEXT.button, fontSize: '26px' }).setOrigin(0, 0);
    this.dayLabel = this.add.text(width - 16, 14, '', TEXT.button).setOrigin(1, 0);

    // Left resources column
    this.panel(LAYOUT.resourcePanelX, 64, LAYOUT.resourcePanelWidth, height - 80);
    this.add.text(20, 72, 'РЕСУРСЫ', TEXT.panelHeader);

    // Center pool
    this.panel(236, 64, width - 480, height - 196);
    this.add.text(248, 72, 'КАРТОЧКИ ГРАЖДАН', TEXT.panelHeader);

    // Right column: selected + combo + forecast
    this.panel(width - 236, 64, 228, 320);
    this.add.text(width - 224, 72, 'ВЫБРАННЫЕ', TEXT.panelHeader);

    // Right bottom: actions
    this.panel(width - 236, 392, 228, height - 416);
    this.add.text(width - 224, 400, 'ДЕЙСТВИЯ', TEXT.panelHeader);

    // Bottom log
    const logH = LAYOUT.logHeight;
    this.panel(8, height - logH - 8, width - 16, logH);
    this.add.text(20, height - logH - 4, 'ЖУРНАЛ', TEXT.small);
    this.logText = this.add.text(20, height - logH + 14, '', {
      ...TEXT.log,
      wordWrap: { width: width - 60 },
    });
  }

  // --- Resources ---------------------------------------------------------

  private drawResources(_width: number, _height: number): void {
    // Resource panel occupies x=8..228 (width 220). Inner content area is 16..216.
    const startX = 16;
    const startY = 100;
    const lineH = 92;
    const barX = startX;
    const barW = 196;
    const barYOffset = 26;
    const barH = 10;
    const valueRightX = startX + barW;

    const labels: { key: keyof GameState['resources']; name: string; color: number; max?: number; money?: boolean }[] =
      [
        { key: 'money', name: 'БЮДЖЕТ', color: COLORS.green, money: true },
        { key: 'admin', name: 'АДМ. РЕСУРС', color: COLORS.inkSoft, max: 200 },
        { key: 'discontent', name: 'НЕДОВОЛЬСТВО', color: COLORS.warning, max: 100 },
        { key: 'security', name: 'БЕЗОПАСНОСТЬ', color: COLORS.inkSoft, max: 100 },
        { key: 'loyalty', name: 'НАЧАЛЬСТВО', color: COLORS.stamp, max: 100 },
      ];

    for (let i = 0; i < labels.length; i++) {
      const def = labels[i]!;
      const y = startY + i * lineH;
      this.add.text(startX, y, def.name, TEXT.resourceName);
      const text = this.add.text(valueRightX, y, '', TEXT.resourceValue);
      text.setOrigin(1, 0);
      this.resourceTexts.push(text);
      // bar background (fits within the resource panel)
      const barBg = this.add.rectangle(barX, y + barYOffset, barW, barH, COLORS.panelLight, 1);
      barBg.setOrigin(0, 0);
      const bar = this.add.graphics();
      this.resourceBars.push(bar);
      bar.x = barX;
      bar.y = y + barYOffset;
    }
  }

  private refreshResources(): void {
    const r = this.mobka.state.resources;
    const barW = 196;
    const barH = 10;
    const values: { key: keyof GameState['resources']; max: number; money: boolean }[] = [
      { key: 'money', max: 1, money: true },
      { key: 'admin', max: 200, money: false },
      { key: 'discontent', max: 100, money: false },
      { key: 'security', max: 100, money: false },
      { key: 'loyalty', max: 100, money: false },
    ];
    for (let i = 0; i < values.length; i++) {
      const def = values[i]!;
      const value = r[def.key];
      const text = this.resourceTexts[i];
      const bar = this.resourceBars[i];
      if (!text || !bar) continue;
      const textValue = def.money ? `₽${value}` : `${value}${def.max <= 100 ? '' : '/' + def.max}`;
      const color = def.money
        ? UI_COLORS.green
        : def.key === 'discontent'
          ? value > 60
            ? UI_COLORS.warning
            : UI_COLORS.cream
          : UI_COLORS.white;
      text.setText(textValue);
      text.setColor(color);
      bar.clear();
      const pctVal = def.money ? 0 : Math.max(0, Math.min(1, value / def.max));
      const fillColor = def.key === 'discontent' ? COLORS.red : COLORS.green;
      bar.fillStyle(fillColor, 1);
      bar.fillRect(0, 0, barW * pctVal, barH);
    }
  }

  // --- Pool --------------------------------------------------------------

  private drawPool(width: number, height: number): void {
    this.poolContainer = this.add.container(248, 96);
    this.poolContainer.setSize(width - 504, height - 244);

    this.refreshPool();
  }

  private refreshPool(): void {
    this.poolContainer.removeAll(true);
    this.poolCards.clear();

    const cols = 3;
    const startX = 0;
    const startY = 0;
    const state = this.mobka.state;

    state.pool.forEach((person, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const x = startX + col * (LAYOUT.cardWidth + LAYOUT.cardGapX);
      const y = startY + row * (LAYOUT.cardHeight + LAYOUT.cardGapY);

      const card = this.makeCitizenCard(person, x, y);
      this.poolContainer.add(card.container);
      this.poolCards.set(person.id, card);
    });
  }

  private makeCitizenCard(person: PersonData, x: number, y: number): CitizenCardRefs {
    const container = this.add.container(x, y);
    const selected = this.mobka.state.selectedIds.includes(person.id);
    const fillColor = selected ? COLORS.selected : COLORS.panelLight;

    const bg = this.add.rectangle(0, 0, LAYOUT.cardWidth, LAYOUT.cardHeight, fillColor, 1);
    bg.setOrigin(0, 0);
    bg.setStrokeStyle(2, selected ? COLORS.warning : COLORS.border, 1);
    bg.setInteractive({ useHandCursor: true });
    container.add(bg);

    // Name
    container.add(this.add.text(8, 6, person.name, TEXT.cardName));

    // Age/profession line
    container.add(this.add.text(8, 28, `${person.age} лет · ${person.profession}`, TEXT.cardLine));

    // Family / income
    container.add(this.add.text(8, 46, `Семья: ${person.familySize} · ₽${person.income}`, TEXT.cardLine));

    // Stats bars
    const stats = [
      { label: 'СТРАХ', value: person.fear, color: COLORS.red },
      { label: 'СОПРОТ', value: person.resistance, color: COLORS.warning },
      { label: 'ЯВКА', value: person.attendanceChance, color: COLORS.green },
    ];
    for (let i = 0; i < stats.length; i++) {
      const s = stats[i]!;
      const sy = 70 + i * 18;
      container.add(this.add.text(8, sy, s.label, TEXT.cardStatLabel));
      const barBg = this.add.rectangle(70, sy + 2, 100, 8, COLORS.bg, 1);
      barBg.setOrigin(0, 0);
      container.add(barBg);
      const bar = this.add.graphics();
      bar.fillStyle(s.color, 1);
      bar.fillRect(70, sy + 2, Math.max(0, Math.min(1, s.value / 100)) * 100, 8);
      container.add(bar);
      container.add(this.add.text(176, sy - 1, `${Math.round(s.value)}%`, TEXT.cardStatValue));
    }

    // Connections indicator
    if (person.connections.length > 0) {
      container.add(this.add.text(8, LAYOUT.cardHeight - 16, `связи: ${person.connections.length}`, TEXT.cardConn));
    }

    // Action label
    const action = this.mobka.state.lastActionByPerson[person.id];
    if (action) {
      const a2 = this.add.text(LAYOUT.cardWidth - 8, 6, ACTIONS[action].label, TEXT.tinyOrange);
      a2.setOrigin(1, 0);
      container.add(a2);
    }

    bg.on('pointerdown', () => {
      const wasSelected = this.mobka.state.selectedIds.includes(person.id);
      this.mobka.toggleSelect(person.id);
      // If selecting (and it's a new selection) set as active
      if (!wasSelected) {
        this.activePersonId = person.id;
      } else if (this.activePersonId === person.id) {
        this.activePersonId = null;
      }
      this.refreshAll();
    });

    return { container, bg, selected };
  }

  // --- Selected list -----------------------------------------------------

  private drawSelected(width: number, height: number): void {
    this.selectedContainer = this.add.container(width - 224, 96);
    this.selectedContainer.setSize(216, 280);

    this.comboText = this.add.text(width - 224, height - 320, '', {
      ...TEXT.small,
      color: UI_COLORS.orange,
      wordWrap: { width: 216 },
    });
    this.forecastText = this.add.text(width - 224, height - 260, '', {
      ...TEXT.resourceValue,
      color: UI_COLORS.cream,
      wordWrap: { width: 216 },
    });

    this.refreshSelected();
    this.refreshCombo();
  }

  private refreshSelected(): void {
    this.selectedContainer.removeAll(true);
    this.selectedItems = [];

    const state = this.mobka.state;
    state.selectedIds.forEach((id, idx) => {
      const person = state.pool.find((p) => p.id === id);
      if (!person) return;
      const y = idx * 32;
      const container = this.add.container(0, y);
      const isActive = this.activePersonId === person.id;
      const bg = this.add.rectangle(0, 0, 216, 30, isActive ? COLORS.selected : COLORS.panelLight, 1);
      bg.setOrigin(0, 0);
      bg.setStrokeStyle(1, isActive ? COLORS.warning : COLORS.border, 1);
      bg.setInteractive({ useHandCursor: true });
      container.add(bg);
      container.add(this.add.text(6, 6, `${person.name}`, TEXT.selectedName));
      const act = state.lastActionByPerson[person.id];
      if (act) {
        const at = this.add.text(210, 6, ACTIONS[act].label.slice(0, 6), TEXT.tinyOrangeSmaller);
        at.setOrigin(1, 0);
        container.add(at);
      }
      bg.on('pointerdown', () => {
        this.activePersonId = this.activePersonId === person.id ? null : person.id;
        this.refreshSelected();
        this.refreshActions();
      });
      this.selectedContainer.add(container);
      this.selectedItems.push({ container, person });
    });
  }

  private refreshCombo(): void {
    const forecast = this.mobka.forecast();
    const comboText = this.mobka.describeCombo();
    if (comboText) {
      this.comboText.setText(`COMBO x${forecast.multiplier.toFixed(1)}\n${comboText}`);
    } else {
      this.comboText.setText('Комбо: —');
    }
    this.forecastText.setText(
      `ПРОГНОЗ\nСобрано: ${forecast.collected.toFixed(1)}\nПлан: ${this.mobka.state.plan}\n\n${
        forecast.collected >= this.mobka.state.plan ? '✓ план выполнится' : '✗ план не выполнится'
      }`,
    );
  }

  // --- Actions -----------------------------------------------------------

  private drawActions(width: number, _height: number): void {
    this.actionsPanel = this.add.container(width - 224, 416);

    const actionOrder: ActionId[] = ['summons', 'docs', 'detain', 'neighbors', 'medical'];
    for (let i = 0; i < actionOrder.length; i++) {
      const id = actionOrder[i]!;
      const def = ACTIONS[id];
      const y = i * 46;
      const container = this.makeActionButton(def, 0, y);
      this.actionsPanel.add(container);
      this.actionButtons.set(id, container);
    }

    this.refreshActions();
  }

  private makeActionButton(def: (typeof ACTIONS)[ActionId], x: number, y: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, 216, 42, COLORS.panelLight, 1);
    bg.setOrigin(0, 0);
    bg.setStrokeStyle(1, COLORS.border, 1);
    bg.setInteractive({ useHandCursor: true });
    container.add(bg);
    const title = this.add.text(8, 4, def.label, { ...TEXT.log, color: UI_COLORS.cream });
    container.add(title);
    const cost = this.add.text(8, 22, `₽${def.costMoney} · адм ${def.costAdmin}`, TEXT.buttonCost);
    container.add(cost);

    bg.on('pointerdown', () => this.tryAction(def.id));
    bg.on('pointerover', () => bg.setFillStyle(COLORS.selected, 1));
    bg.on('pointerout', () => bg.setFillStyle(COLORS.panelLight, 1));
    container.setData('bg', bg);
    container.setData('title', title);
    container.setData('cost', cost);
    container.setData('actionId', def.id);
    return container;
  }

  private tryAction(actionId: ActionId): void {
    if (!this.activePersonId) {
      this.flashLog('Выберите гражданина');
      return;
    }
    const result = this.mobka.performAction(this.activePersonId, actionId);
    if (!result.ok) {
      this.flashLog(result.reason ?? 'Действие не удалось');
      return;
    }
    this.flashLog(`+ ${ACTIONS[actionId].label}`);
    this.refreshAll();
  }

  private refreshActions(): void {
    const state = this.mobka.state;
    const canAct = !!this.activePersonId && state.selectedIds.includes(this.activePersonId);
    for (const [, container] of this.actionButtons) {
      const bg = container.getData('bg') as Phaser.GameObjects.Rectangle;
      const title = container.getData('title') as Phaser.GameObjects.Text;
      const cost = container.getData('cost') as Phaser.GameObjects.Text;
      const id = container.getData('actionId') as ActionId;
      const def = ACTIONS[id];
      const enough = state.resources.money >= def.costMoney && state.resources.admin >= def.costAdmin;
      bg.setFillStyle(canAct && enough ? COLORS.panelLight : COLORS.panel, 1);
      title.setColor(canAct ? UI_COLORS.cream : UI_COLORS.darker);
      cost.setColor(enough ? UI_COLORS.dim : UI_COLORS.red);
    }
  }

  // --- Finish day --------------------------------------------------------

  private drawFinishButton(width: number, height: number): void {
    const btnW = 320;
    const btnH = 48;
    const btnX = width / 2 - btnW / 2;
    const btnY = height - 124;
    this.finishBtn = this.add.container(btnX, btnY);
    const bg = this.add.rectangle(0, 0, btnW, btnH, COLORS.stamp, 1);
    bg.setOrigin(0, 0);
    bg.setStrokeStyle(2, COLORS.warning, 1);
    bg.setInteractive({ useHandCursor: true });
    this.finishBtn.add(bg);
    this.finishBtn.add(this.add.text(btnW / 2, btnH / 2, 'ЗАВЕРШИТЬ ДЕНЬ', TEXT.button).setOrigin(0.5));
    bg.on('pointerdown', () => this.onFinish());
    bg.on('pointerover', () => bg.setFillStyle(COLORS.redBright, 1));
    bg.on('pointerout', () => bg.setFillStyle(COLORS.stamp, 1));
  }

  private onFinish(): void {
    const r = this.mobka.finishDay();
    this.cameras.main.flash(180, 200, 80, 60);
    if (r.gameOver) {
      this.scene.start('GameOver', { reason: r.reason });
    } else {
      this.scene.start('DayEnd');
    }
  }

  // --- Logging -----------------------------------------------------------

  private flashLog(msg: string): void {
    const log = [msg, ...this.mobka.state.eventLog].slice(0, 4);
    this.logText.setText(log.join('\n'));
  }

  // --- Refresh all -------------------------------------------------------

  private refreshAll(): void {
    const s = this.mobka.state;
    this.dayLabel.setText(
      `ДЕНЬ ${s.day}/${RUN_LENGTH}   ПЛАН: ${s.plan}   ${s.status === 'playing' ? '' : '[' + s.status + ']'}`,
    );
    this.refreshResources();
    this.refreshPool();
    this.refreshSelected();
    this.refreshCombo();
    this.refreshActions();
    this.logText.setText(s.eventLog.slice(0, 4).join('\n') || 'Журнал событий пуст.');
  }
}
