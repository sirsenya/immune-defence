import type { GameState, PersonData } from './types/game';
import { createInitialState, generateRoster, prepareDay } from './state/GameStateStore';
import { calculateDay } from './systems/MobilizationSystem';
import { evaluateCombos } from './systems/ComboSystem';
import { adjustResources, checkGameOver, clampResources } from './systems/ResourceSystem';
import { pickEventForState } from './systems/EventSystem';
import { loadGame, saveGame, clearSave } from './utils/storage';
import { createRng } from './utils/random';
import { ACTIONS } from '../config/constants';
import { UPGRADE_POOL, hasUpgrade } from './data/upgrades';
import type { ActionId } from './types/game';
import { applyAction } from './systems/ResistanceSystem';

export class Game {
  state: GameState;
  roster: PersonData[];
  rng: () => number;

  constructor() {
    this.state = createInitialState();
    this.roster = generateRoster(this.state);
    this.rng = createRng(this.state.runSeed);
  }

  tryLoad(): boolean {
    const saved = loadGame();
    if (!saved) return false;
    this.state = saved;
    // Re-build rng & roster from saved seed so it's deterministic forward.
    this.rng = createRng(this.state.runSeed);
    this.roster = generateRoster(this.state);
    return true;
  }

  resetRun(seed?: number): void {
    clearSave();
    this.state = createInitialState(seed);
    this.roster = generateRoster(this.state);
    this.rng = createRng(this.state.runSeed);
    prepareDay(this.state, this.roster);
  }

  startNewRun(): void {
    this.resetRun();
  }

  beginDay(): void {
    prepareDay(this.state, this.roster);
  }

  toggleSelect(personId: string): boolean {
    if (this.state.selectedIds.includes(personId)) {
      this.state.selectedIds = this.state.selectedIds.filter((id) => id !== personId);
      // secretary upgrade: free slots don't unselect — keep simple
      delete this.state.lastActionByPerson[personId];
      return false;
    }
    const maxSelectable = hasUpgrade(this.state, 'secretary') ? 8 : 6;
    if (this.state.selectedIds.length >= maxSelectable) return false;
    this.state.selectedIds.push(personId);
    return true;
  }

  performAction(personId: string, actionId: ActionId): { ok: boolean; reason?: string } {
    const person = this.state.pool.find((p) => p.id === personId);
    if (!person) return { ok: false, reason: 'Гражданин не найден' };
    const result = applyAction(this.state, person, actionId);
    if (result.ok && actionId === 'summons') {
      this.state.summonsThisDay += 1;
    }
    return result;
  }

  finishDay(): { gameOver: boolean; reason?: string } {
    // Compute final result and outcomes
    const { result } = calculateDay(this.state, { rng: this.rng });
    const moneyDelta = result.moneyEarned;
    const adminDelta = result.adminEarned;

    this.state.resources = adjustResources(this.state.resources, {
      money: moneyDelta,
      admin: adminDelta,
      loyalty: result.loyaltyDelta,
      discontent: result.discontentDelta,
      security: result.securityDelta,
    });

    this.state.totalEarned += moneyDelta;
    this.state.pastDays.push(result);
    if (result.multiplier > this.state.maxComboMultiplier) {
      this.state.maxComboMultiplier = result.multiplier;
    }

    // Check game over
    const over = checkGameOver(this.state.resources);
    if (over.over) {
      this.state.status = 'gameOver';
      this.state.gameOverReason = over.reason;
      saveGame(this.state);
      return { gameOver: true, reason: over.reason ?? '' };
    }

    // Move to day-end / shop phase
    this.state.status = 'dayEnd';
    saveGame(this.state);
    return { gameOver: false };
  }

  applyEventChoice(choiceIndex: number): void {
    const event = pickEventForState(this.state);
    if (!event) return;
    const choice = event.choices[choiceIndex];
    if (!choice) return;
    choice.apply(this.state);
    this.state.resources = clampResources(this.state.resources);
    this.state.eventLog.unshift(`${event.title}: ${choice.label}`);
    if (this.state.eventLog.length > 12) this.state.eventLog.pop();
    saveGame(this.state);
  }

  buyUpgrade(upgradeId: string): boolean {
    if (this.state.upgrades.some((u) => u.id === upgradeId)) return false;
    const def = UPGRADE_POOL.find((u) => u.id === upgradeId);
    if (!def) return false;
    if (this.state.resources.money < def.cost) return false;
    this.state.resources.money -= def.cost;
    def.apply(this.state);
    this.state.upgrades.push({ id: def.id });
    saveGame(this.state);
    return true;
  }

  startNextDay(): void {
    this.state.day += 1;
    this.state.status = 'playing';
    this.beginDay();
    saveGame(this.state);
  }

  endRun(): void {
    this.state.status = 'runEnd';
    saveGame(this.state);
  }

  forecast(): { collected: number; multiplier: number } {
    const selected = this.state.selectedIds
      .map((id) => this.state.pool.find((p) => p.id === id))
      .filter((p): p is PersonData => p !== undefined);
    const combo = evaluateCombos(selected, this.state);
    let total = selected.length;
    // Apply per-person per-action effects on attendance probability in a forecast-friendly way.
    for (const p of selected) {
      const action = this.state.lastActionByPerson[p.id];
      if (action) {
        // Each action grants roughly the listed bonus
        const def = ACTIONS[action];
        total += def.baseSuccessBonus;
      }
    }
    const projected = Math.round(total * combo.multiplier * 10) / 10;
    return { collected: projected, multiplier: combo.multiplier };
  }

  serialize(): string {
    return JSON.stringify({ version: 1, state: this.state });
  }

  describeCombo(): string {
    const selected = this.state.selectedIds
      .map((id) => this.state.pool.find((p) => p.id === id))
      .filter((p): p is PersonData => p !== undefined);
    const c = evaluateCombos(selected, this.state);
    return c.bonuses.map((b) => `${b.label} +${Math.round(b.bonus * 100)}%`).join(' · ');
  }
}
