import type { ActionId, DayResult, GameState, PersonData } from '../types/game';
import { ACTIONS, REWARDS, BASE_PER_PERSON, discontentAttendanceFactor } from '../../config/constants';
import { hasUpgrade } from '../data/upgrades';
import { evaluateCombos } from './ComboSystem';

export interface PersonOutcome {
  person: PersonData;
  attended: boolean;
  effectiveMultiplier: number;
  baseContribution: number;
  finalContribution: number;
  reason: string;
}

interface CollectOptions {
  rng: () => number;
}

// Compute the per-person effective chance of successful collection.
export function effectiveChance(
  person: PersonData,
  state: GameState,
  action: ActionId | undefined,
): number {
  const actionDef = action ? ACTIONS[action] : undefined;
  const base = person.attendanceChance / 100;
  const actionBonus = actionDef ? actionDef.attendanceBonus / 100 : 0;
  const baseSuccess = actionDef ? actionDef.baseSuccessBonus : 0;
  const discontentFactor = discontentAttendanceFactor(state.resources.discontent);
  let chance = base + actionBonus + baseSuccess;
  // Upgrades & actions
  if (action === 'detain' && hasUpgrade(state, 'service_car') && state.summonsThisDay >= 0) {
    // first detain is cheaper; doesn't change chance directly
  }
  // Medical may remove from plan entirely if successful
  chance = chance * discontentFactor;
  return Math.max(0, Math.min(0.99, chance));
}

// Apply the actual day calculation: roll attendance and produce outcomes.
export function calculateDay(state: GameState, opts: CollectOptions): {
  result: DayResult;
  outcomes: PersonOutcome[];
} {
  const selected: PersonData[] = state.selectedIds
    .map((id) => state.pool.find((p) => p.id === id))
    .filter((p): p is PersonData => p !== undefined);

  const combo = evaluateCombos(selected, state);
  const outcomes: PersonOutcome[] = [];

  let totalCollected = 0;
  let baseCollected = 0;

  const upgradedSpecialOrder = hasUpgrade(state, 'special_order');
  const upgradedVeteran = hasUpgrade(state, 'veteran_hr');
  const upgradedArchive = hasUpgrade(state, 'archive');
  const lastIdx = selected.length - 1;

  for (let i = 0; i < selected.length; i++) {
    const person = selected[i]!;
    const action = state.lastActionByPerson[person.id];
    const actionDef = action ? ACTIONS[action] : undefined;

    // Removed via medical commission
    if (person.removedFromPlan && action === 'medical') {
      outcomes.push({
        person,
        attended: true,
        effectiveMultiplier: 0,
        baseContribution: 0,
        finalContribution: -1,
        reason: 'Медкомиссия списала',
      });
      totalCollected -= 1;
      continue;
    }

    const chance = effectiveChance(person, state, action);
    const roll = opts.rng();
    const attended = roll < chance;
    const baseContribution = BASE_PER_PERSON;

    let perPersonMultiplier = 1;
    if (actionDef?.effects.discontentDelta) {
      // already applied during action
    }
    // Archive upgrade: previously seen citizens get +50% effective contribution.
    if (upgradedArchive && (state.citizensSeen[person.id] ?? 0) > 0) {
      perPersonMultiplier += 0.5;
    }
    // Veteran upgrade: age 40+ => +20%.
    if (upgradedVeteran && person.age >= 40) {
      perPersonMultiplier += 0.2;
    }
    // Special order upgrade: last person if plan almost met => x2.
    if (
      upgradedSpecialOrder &&
      i === lastIdx &&
      totalCollected >= state.plan - 2 &&
      totalCollected < state.plan + 4
    ) {
      perPersonMultiplier *= 2;
    }

    const finalContribution = attended ? Math.round(baseContribution * perPersonMultiplier * 10) / 10 : 0;
    if (attended) baseCollected += baseContribution;
    if (attended) totalCollected += finalContribution;

    outcomes.push({
      person,
      attended,
      effectiveMultiplier: perPersonMultiplier,
      baseContribution,
      finalContribution,
      reason: !attended
        ? 'Не явился'
        : action === 'summons'
          ? 'Явился по повестке'
          : action === 'docs'
            ? 'Документы в порядке'
            : action === 'detain'
              ? 'Принудительно получен'
              : action === 'neighbors'
                ? 'По наводке соседей'
                : action === 'medical'
                  ? 'Прошёл медкомиссию'
                  : 'Добровольно',
    });
  }

  // Apply global combo multiplier on top.
  totalCollected = totalCollected * combo.multiplier;

  const overfulfilled = totalCollected - state.plan;
  const overfulfilledPercent = state.plan > 0 ? Math.round((overfulfilled / state.plan) * 100) : 0;

  // Resource deltas
  let moneyEarned = Math.round(totalCollected * REWARDS.moneyPerCollected);
  let adminEarned = Math.round(totalCollected * REWARDS.adminPerCollected);
  if (overfulfilled > 0) {
    moneyEarned += Math.round(overfulfilled * REWARDS.moneyPerOverfulfilled);
    adminEarned += Math.round(overfulfilled * REWARDS.adminPerOverfulfilled);
  }
  if (hasUpgrade(state, 'overtime_fund')) {
    moneyEarned = Math.round(moneyEarned * 1.15);
  }

  let loyaltyDelta = 0;
  let discontentDelta = 0;
  let securityDelta = 0;
  if (totalCollected >= state.plan) {
    loyaltyDelta = REWARDS.baseLoyaltyOnFulfill + Math.max(0, overfulfilledPercent) / 25;
    if (overfulfilled <= 0) {
      // just barely made it; small penalty to discontent
      discontentDelta = -1;
    } else {
      discontentDelta = -Math.min(4, Math.floor(overfulfilled / 2));
    }
    securityDelta = -2;
  } else {
    const deficitPercent = Math.round(((state.plan - totalCollected) / state.plan) * 100);
    if (deficitPercent > 25) {
      loyaltyDelta = REWARDS.baseLoyaltyOnSevereUnderfill;
      securityDelta = -5;
    } else {
      loyaltyDelta = REWARDS.baseLoyaltyOnUnderfill;
      securityDelta = -3;
    }
    discontentDelta = 2 + Math.floor(deficitPercent / 10);
  }

  // Press upgrade: if overfulfilled, discontent -5 (in addition)
  if (hasUpgrade(state, 'press_kremlin') && overfulfilled > 0) {
    discontentDelta -= 5;
  }

  let message = '';
  if (overfulfilledPercent >= 30) message = 'БЛЕСТЯЩИЙ РЕЗУЛЬТАТ';
  else if (overfulfilledPercent >= 5) message = 'ПЛАН ВЫПОЛНЕН С ЗАПАСОМ';
  else if (overfulfilledPercent >= -5) message = 'ПЛАН ВЫПОЛНЕН';
  else if (overfulfilledPercent >= -25) message = 'ПЛАН ПОЧТИ ВЫПОЛНЕН';
  else message = 'ПРОВАЛ';

  const result: DayResult = {
    day: state.day,
    target: state.plan,
    collected: Math.round(totalCollected * 10) / 10,
    multiplier: combo.multiplier,
    baseCollected: Math.round(baseCollected * 10) / 10,
    overfulfilledPercent,
    moneyEarned,
    adminEarned,
    loyaltyDelta: Math.round(loyaltyDelta * 10) / 10,
    discontentDelta,
    securityDelta,
    message,
  };

  return { result, outcomes };
}
