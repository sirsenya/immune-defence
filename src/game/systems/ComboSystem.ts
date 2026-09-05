import type { ComboResult, PersonData } from '../types/game';
import { hasUpgrade } from '../data/upgrades';

interface Rule {
  id: string;
  label: string;
  bonus: number; // extra multiplier added per match
  evaluate: (selected: PersonData[]) => number;
}

function professionRule(): Rule {
  return {
    id: 'profession_pair',
    label: 'Одна профессия',
    bonus: 0.2,
    evaluate: (selected) => {
      const counts = new Map<string, number>();
      for (const p of selected) counts.set(p.profession, (counts.get(p.profession) ?? 0) + 1);
      let matches = 0;
      for (const c of counts.values()) {
        if (c >= 2) matches += 1;
        if (c >= 3) matches += 1; // extra tier
      }
      return matches;
    },
  };
}

function familyRule(): Rule {
  return {
    id: 'family_pair',
    label: 'Родственники',
    bonus: 0.3,
    evaluate: (selected) => {
      const ids = new Set(selected.map((p) => p.id));
      let pairs = 0;
      for (const p of selected) {
        for (const c of p.connections) {
          if (ids.has(c)) pairs += 1;
        }
      }
      // each pair counted twice; clamp at number of selected people
      return Math.min(pairs / 2, selected.length);
    },
  };
}

function ageGroupRule(): Rule {
  return {
    id: 'age_young',
    label: 'Молодые 25–35',
    bonus: 0.15,
    evaluate: (selected) => {
      const n = selected.filter((p) => p.age >= 25 && p.age <= 35).length;
      return n >= 3 ? 1 : 0;
    },
  };
}

function varietyRule(): Rule {
  return {
    id: 'variety',
    label: 'Разные профессии',
    bonus: 0.1,
    evaluate: (selected) => {
      const uniq = new Set(selected.map((p) => p.profession));
      return uniq.size >= 4 ? 1 : 0;
    },
  };
}

function bigFamilyRule(): Rule {
  return {
    id: 'big_family',
    label: 'Большие семьи',
    bonus: 0.12,
    evaluate: (selected) => {
      const n = selected.filter((p) => p.familySize >= 3).length;
      return n >= 2 ? 1 : 0;
    },
  };
}

const BASE_RULES: Rule[] = [professionRule(), familyRule(), ageGroupRule(), varietyRule(), bigFamilyRule()];

export function evaluateCombos(selected: PersonData[], state: { upgrades: { id: string }[] }): ComboResult {
  let multiplier = 1;
  const bonuses: ComboResult['bonuses'] = [];
  for (const rule of BASE_RULES) {
    const hits = rule.evaluate(selected);
    if (hits > 0) {
      const bonus = rule.bonus * hits;
      multiplier += bonus;
      bonuses.push({ ruleId: rule.id, label: rule.label, bonus });
    }
  }
  // Phone book upgrade: extra bonus if any two selected are connected.
  if (hasUpgrade(state as never, 'phone_book')) {
    const ids = new Set(selected.map((p) => p.id));
    let hasPair = false;
    for (const p of selected) {
      for (const c of p.connections) {
        if (ids.has(c)) {
          hasPair = true;
          break;
        }
      }
      if (hasPair) break;
    }
    if (hasPair) {
      multiplier += 0.25;
      bonuses.push({ ruleId: 'phone_book', label: 'Справочник', bonus: 0.25 });
    }
  }
  return {
    multiplier,
    bonuses,
    bonusPercent: Math.round((multiplier - 1) * 100),
  };
}
