import type { PersonData } from '../types/game';
import { NAMES_FIRST, NAMES_LAST, PROFESSIONS } from '../../config/constants';
import { pick, randInt } from '../utils/random';

// Deterministic 24-citizen pool; connections added per-run by generator.
export function generateCitizenPool(rng: () => number): PersonData[] {
  const pool: PersonData[] = [];
  const usedNames = new Set<string>();
  for (let i = 0; i < 24; i++) {
    let name = '';
    for (let tries = 0; tries < 30; tries++) {
      const first = pick(rng, NAMES_FIRST);
      const last = pick(rng, NAMES_LAST);
      const candidate = `${first} ${last}`;
      if (!usedNames.has(candidate)) {
        usedNames.add(candidate);
        name = candidate;
        break;
      }
    }
    if (!name) {
      name = `${pick(rng, NAMES_FIRST)} ${pick(rng, NAMES_LAST)}`;
    }
    const age = randInt(rng, 19, 58);
    const profession = pick(rng, PROFESSIONS);
    const familySize = randInt(rng, 0, 5);
    const income = randInt(rng, 18, 95) * 1000;
    const fear = randInt(rng, 15, 70);
    const resistance = randInt(rng, 10, 80);
    const attendanceChance = Math.max(
      5,
      Math.min(95, 40 + fear / 2 - resistance / 3 + randInt(rng, -8, 8)),
    );
    pool.push({
      id: `cit_${i}`,
      name,
      age,
      profession,
      familySize,
      income,
      fear,
      resistance,
      attendanceChance,
      connections: [],
      timesSeen: 0,
    });
  }
  // Generate connections: ~25% chance per citizen to be linked to 1..2 others.
  for (let i = 0; i < pool.length; i++) {
    const me = pool[i]!;
    const linkCount = rng() < 0.55 ? randInt(rng, 1, 2) : 0;
    const used = new Set<string>([me.id]);
    for (let k = 0; k < linkCount; k++) {
      const targetIdx = randInt(rng, 0, pool.length - 1);
      if (targetIdx === i) continue;
      const target = pool[targetIdx]!;
      if (used.has(target.id)) continue;
      used.add(target.id);
      if (!me.connections.includes(target.id)) me.connections.push(target.id);
      if (!target.connections.includes(me.id)) target.connections.push(me.id);
    }
  }
  return pool;
}
