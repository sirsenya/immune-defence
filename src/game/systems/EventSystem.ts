import type { GameEvent, GameState } from '../types/game';
import { EVENTS } from '../data/events';
import { createRng, pick } from '../utils/random';

export function pickEventForState(state: GameState): GameEvent | null {
  const candidates = EVENTS.filter((e) => (e.condition ? e.condition(state) : true));
  if (candidates.length === 0) return null;
  const rng = createRng(state.runSeed + state.day * 7919);
  // Weighted: events without weight get weight 1
  const weights = candidates.map((e) => (e.weight ? e.weight(state) : 1));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < candidates.length; i++) {
    r -= weights[i] ?? 1;
    if (r <= 0) return candidates[i] ?? null;
  }
  return pick(rng, candidates);
}
