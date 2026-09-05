import type { GameState, UpgradeDef } from '../types/game';

export const UPGRADE_POOL: UpgradeDef[] = [
  {
    id: 'card_index',
    name: 'КАРТОТЕКА',
    description: 'Дополнительная полка с папками. +1 доступный гражданин в день.',
    descriptionShort: '+1 гражданин в пуле',
    cost: 400,
    effectSummary: '+1 гражданин в день',
    apply: (_s: GameState) => {
      // represented by a flag the pool generator checks
      // (no direct mutation needed; systems read upgrades by id)
    },
  },
  {
    id: 'phone_book',
    name: 'ТЕЛЕФОННЫЙ СПРАВОЧНИК',
    description: 'Связи между гражданами легче отследить. Если выбраны 2 связанных — +25% к результату.',
    descriptionShort: '+25% за связанную пару',
    cost: 600,
    effectSummary: '+25% за связанную пару',
    apply: () => {},
  },
  {
    id: 'new_stamp',
    name: 'НОВАЯ ПЕЧАТЬ',
    description: 'Каждая третья повестка за день — бесплатная.',
    descriptionShort: 'Каждая 3-я повестка бесплатно',
    cost: 350,
    effectSummary: 'Каждая 3-я повестка бесплатна',
    apply: () => {},
  },
  {
    id: 'service_car',
    name: 'СЛУЖЕБНЫЙ АВТОМОБИЛЬ',
    description: 'Первый привод за день стоит вдвое дешевле.',
    descriptionShort: 'Первый привод −50%',
    cost: 550,
    effectSummary: 'Первый привод −50%',
    apply: () => {},
  },
  {
    id: 'veteran_hr',
    name: 'ОПЫТНЫЙ КАДРОВИК',
    description: 'Старожилы отдела знают подход. Граждане старше 40 дают +20% к результату.',
    descriptionShort: '+20% за возраст 40+',
    cost: 450,
    effectSummary: '+20% за граждан 40+',
    apply: () => {},
  },
  {
    id: 'special_order',
    name: 'ОСОБОЕ РАСПОРЯЖЕНИЕ',
    description: 'Если план почти выполнен, последний выбранный гражданин даёт x2 к результату.',
    descriptionShort: 'Последний гражданин x2 у финиша',
    cost: 750,
    effectSummary: 'Последний x2 при околоплановом счёте',
    apply: () => {},
  },
  {
    id: 'archive',
    name: 'АРХИВ',
    description: 'Ранее встречавшиеся граждане дают +50% к эффективности.',
    descriptionShort: '+50% за повторно seen',
    cost: 500,
    effectSummary: '+50% за знакомых граждан',
    apply: () => {},
  },
  {
    id: 'secretary',
    name: 'СЕКРЕТАРША',
    description: 'Каждый пятый выбранный гражданин не требует затрат действий.',
    descriptionShort: 'Каждый 5-й выбор бесплатный',
    cost: 650,
    effectSummary: 'Каждый 5-й выбор бесплатно',
    apply: () => {},
  },
  {
    id: 'press_kremlin',
    name: 'ПРЕСС-СЛУЖБА',
    description: 'Каждое завершение дня с перевыполнением снижает недовольство на 5.',
    descriptionShort: '−5 недовольства при перевыполнении',
    cost: 700,
    effectSummary: '−5 недовольства при перевыполнении',
    apply: () => {},
  },
  {
    id: 'overtime_fund',
    name: 'ФОНД СВЕРХУРОЧНЫХ',
    description: '+15% к денежной награде за каждый день.',
    descriptionShort: '+15% денег за день',
    cost: 800,
    effectSummary: '+15% денег за день',
    apply: () => {},
  },
];

export function hasUpgrade(state: GameState, id: string): boolean {
  return state.upgrades.some((u) => u.id === id);
}
