import type { ActionId, GameState, PersonData } from '../types/game';
import { ACTIONS } from '../../config/constants';
import { hasUpgrade } from '../data/upgrades';

export interface ActionAttemptResult {
  ok: boolean;
  reason?: string;
}

const UPGRADE_FREE_SUMMONS_EVERY = 3;
const UPGRADE_FREE_DETAIN_FIRST = true;
const UPGRADE_SECRETARY_FREE_EVERY = 5;

// Try to apply an action to a person. Mutates resources and the person state.
export function applyAction(state: GameState, person: PersonData, actionId: ActionId): ActionAttemptResult {
  const def = ACTIONS[actionId];

  // Upgrade-aware cost calculation
  let costMoney = def.costMoney;
  let costAdmin = def.costAdmin;

  if (actionId === 'summons' && hasUpgrade(state, 'new_stamp')) {
    const paid = state.summonsThisDay % UPGRADE_FREE_SUMMONS_EVERY;
    // every 3rd summons is free (the 3rd one, i.e. when summonsThisDay % 3 === 2)
    if (state.summonsThisDay % UPGRADE_FREE_SUMMONS_EVERY === UPGRADE_FREE_SUMMONS_EVERY - 1) {
      costMoney = 0;
    }
    void paid;
  }
  if (actionId === 'detain' && hasUpgrade(state, 'service_car') && UPGRADE_FREE_DETAIN_FIRST) {
    // First detain of the day is half price.
    const usedDetainToday = Object.values(state.lastActionByPerson).filter((a) => a === 'detain').length;
    if (usedDetainToday === 0) {
      costMoney = Math.round(costMoney / 2);
    }
  }

  if (state.resources.money < costMoney) {
    return { ok: false, reason: 'Не хватает бюджета' };
  }
  if (state.resources.admin < costAdmin) {
    return { ok: false, reason: 'Не хватает админ. ресурса' };
  }

  state.resources.money -= costMoney;
  state.resources.admin -= costAdmin;

  // Per-person state
  if (actionId === 'summons') {
    person.summonsSent = (person.summonsSent ?? 0) + 1;
    person.attendanceChance = Math.min(99, person.attendanceChance + def.attendanceBonus);
  }
  if (actionId === 'docs') {
    person.docsChecked = true;
    person.attendanceChance = Math.min(99, person.attendanceChance + def.attendanceBonus);
  }
  if (actionId === 'detain') {
    person.detained = true;
    person.attendanceChance = Math.min(99, person.attendanceChance + def.attendanceBonus);
  }
  if (actionId === 'neighbors') {
    person.neighborsChecked = true;
    person.attendanceChance = Math.min(99, person.attendanceChance + def.attendanceBonus);
  }
  if (actionId === 'medical') {
    person.medicalChecked = true;
    // 60% chance to actually remove from plan via the system; here we just mark intent
    if (Math.random() < 0.6) {
      person.removedFromPlan = true;
    } else {
      person.attendanceChance = Math.min(99, person.attendanceChance + def.attendanceBonus);
    }
  }

  // Side effects
  if (def.effects.discontentDelta) {
    state.resources.discontent = Math.max(0, Math.min(100, state.resources.discontent + def.effects.discontentDelta));
  }

  // Track action on person
  state.lastActionByPerson[person.id] = actionId;

  return { ok: true };
}

// Validate whether adding another selected person would violate the cap.
// Secretary upgrade: every 5th selection doesn't count against the cap.
export function canSelectMore(state: GameState, personId: string): boolean {
  if (state.selectedIds.includes(personId)) return false;
  if (hasUpgrade(state, 'secretary')) {
    const next = state.selectedIds.length + 1;
    if (next % UPGRADE_SECRETARY_FREE_EVERY === 0) return true;
  }
  if (hasUpgrade(state, 'card_index')) return true; // card_index expands pool, not cap; but allow generous cap
  return state.selectedIds.length < 6;
}
