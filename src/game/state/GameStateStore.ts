import type { GameState, PersonData } from '../types/game';
import { DAILY_PLANS, POOL_SIZE, STARTING_RESOURCES, RUN_LENGTH, MAX_SELECTED } from '../../config/constants';
import { generateCitizenPool } from '../data/people';
import { createRng, pickN, shuffle } from '../utils/random';
import { hasUpgrade } from '../data/upgrades';
import { clampResources } from '../systems/ResourceSystem';

export interface DayPoolSource {
  // Full pool of citizens (24) generated once per run
  all: PersonData[];
}

export function createInitialState(seed?: number): GameState {
  const runSeed = seed ?? Math.floor(Math.random() * 1_000_000_000);
  return {
    day: 1,
    plan: DAILY_PLANS[0] ?? 8,
    resources: { ...STARTING_RESOURCES },
    pool: [],
    selectedIds: [],
    lastActionByPerson: {},
    upgrades: [],
    pastDays: [],
    runSeed,
    totalEarned: 0,
    maxComboMultiplier: 1,
    eventLog: [],
    comboMultiplier: 1,
    status: 'playing',
    summonsThisDay: 0,
    citizensSeen: {},
  };
}

// Generate or reuse the run-level citizen roster.
export function generateRoster(state: GameState): PersonData[] {
  const rng = createRng(state.runSeed);
  return generateCitizenPool(rng);
}

export function prepareDay(state: GameState, roster: PersonData[]): void {
  const rng = createRng(state.runSeed * 31 + state.day * 131);
  const shuffled = shuffle(rng, roster);
  const dailySize = POOL_SIZE + (hasUpgrade(state, 'card_index') ? 1 : 0);
  state.pool = pickN(rng, shuffled, Math.min(dailySize, shuffled.length));

  // Mark citizens as seen
  for (const p of state.pool) {
    p.timesSeen = (p.timesSeen ?? 0) + 1;
    state.citizensSeen[p.id] = (state.citizensSeen[p.id] ?? 0) + 1;
  }

  state.plan = DAILY_PLANS[state.day - 1] ?? Math.min(8 + state.day, 25);
  state.selectedIds = [];
  state.lastActionByPerson = {};
  state.summonsThisDay = 0;
  state.resources = clampResources(state.resources);
}

export function isLastDay(state: GameState): boolean {
  return state.day >= RUN_LENGTH;
}

export function getMaxSelectable(state: GameState): number {
  // Secretary upgrade effectively expands cap.
  return hasUpgrade(state, 'secretary') ? MAX_SELECTED + 2 : MAX_SELECTED;
}

export function logEvent(state: GameState, msg: string): void {
  state.eventLog.unshift(msg);
  if (state.eventLog.length > 12) state.eventLog.pop();
}
