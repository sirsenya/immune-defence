// Centralized game tuning constants for Мобка

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const RUN_LENGTH = 10;

// Daily plan targets — soft ramp up
export const DAILY_PLANS: ReadonlyArray<number> = [8, 10, 11, 13, 15, 17, 19, 21, 23, 25];

export const STARTING_RESOURCES = {
  money: 500,
  admin: 80,
  discontent: 25,
  security: 70,
  loyalty: 60,
} as const;

export const RESOURCE_LIMITS = {
  money: 999999,
  admin: 200,
  discontent: 100,
  security: 100,
  loyalty: 100,
} as const;

// Discontent thresholds (percent)
export const DISCONTENT_TIERS = {
  calm: 20,
  uneasy: 40,
  hostile: 60,
  emergency: 80,
} as const;

// Discontent impact on attendance chance multiplier (lower = less cooperation)
export function discontentAttendanceFactor(discontent: number): number {
  if (discontent < DISCONTENT_TIERS.calm) return 1.0;
  if (discontent < DISCONTENT_TIERS.uneasy) return 0.92;
  if (discontent < DISCONTENT_TIERS.hostile) return 0.8;
  if (discontent < DISCONTENT_TIERS.emergency) return 0.65;
  return 0.45;
}

// Pool size per day
export const POOL_SIZE = 8;

// Maximum selectable citizens per day
export const MAX_SELECTED = 6;

// Each citizen contributes base 1 to the result; multiplier from actions and combo applies.
export const BASE_PER_PERSON = 1;

// Action base success rates and bonuses
export const ACTIONS: Record<
  'summons' | 'docs' | 'detain' | 'neighbors' | 'medical',
  import('./../game/types/game').ActionDef
> = {
  summons: {
    id: 'summons',
    label: 'ПОВЕСТКА',
    description: 'Отправить уведомление гражданину. Дешёво и просто.',
    costMoney: 20,
    costAdmin: 0,
    baseSuccessBonus: 0.05,
    attendanceBonus: 18,
    effects: {},
  },
  docs: {
    id: 'docs',
    label: 'ДОКУМЕНТЫ',
    description: 'Проверить документы. Повышает шанс успешного получения.',
    costMoney: 100,
    costAdmin: 5,
    baseSuccessBonus: 0.15,
    attendanceBonus: 6,
    effects: {},
  },
  detain: {
    id: 'detain',
    label: 'ПРИВОД',
    description: 'Принудительное получение. Сильно повышает шанс, но бьёт по недовольству.',
    costMoney: 150,
    costAdmin: 12,
    baseSuccessBonus: 0.3,
    attendanceBonus: 25,
    effects: { discontentDelta: 5 },
  },
  neighbors: {
    id: 'neighbors',
    label: 'СОСЕДИ',
    description: 'Опрос соседей. Открывает связи гражданина.',
    costMoney: 100,
    costAdmin: 7,
    baseSuccessBonus: 0.05,
    attendanceBonus: 5,
    effects: { revealsConnections: true },
  },
  medical: {
    id: 'medical',
    label: 'МЕДКОМИССИЯ',
    description: 'Попытка вывести гражданина из плана по медицинским показаниям.',
    costMoney: 100,
    costAdmin: 5,
    baseSuccessBonus: 0.05,
    attendanceBonus: 4,
    effects: { canRemoveFromPlan: true },
  },
};

// Rewards
export const REWARDS = {
  moneyPerCollected: 35,
  adminPerCollected: 3,
  moneyPerOverfulfilled: 25,
  adminPerOverfulfilled: 1,
  baseLoyaltyOnFulfill: 4,
  baseLoyaltyOnUnderfill: -6,
  baseLoyaltyOnSevereUnderfill: -10,
} as const;

// Combo thresholds (in collected persons) for higher-tier combos
export const COMBO_TIERS = {
  ok: 1.15,
  good: 1.4,
  great: 1.7,
  awesome: 2.0,
} as const;

export const COLORS = {
  paper: 0xd6c89a,
  paperDark: 0xb8a978,
  ink: 0x2a1f17,
  inkSoft: 0x5b4a36,
  red: 0xa3331f,
  redBright: 0xd94a2e,
  green: 0x5a7a3a,
  bg: 0x1a1612,
  panel: 0x2a241c,
  panelLight: 0x3a3128,
  stamp: 0x8a2a18,
  text: 0xd8c9a8,
  textDim: 0x8a7a60,
  border: 0x4a3f2f,
  selected: 0x6b5a3a,
  warning: 0xc06030,
} as const;

export const FONTS = {
  body: '16px "Courier New", monospace',
  small: '12px "Courier New", monospace',
  title: '24px "Courier New", monospace',
  big: '36px "Courier New", monospace',
  huge: '64px "Courier New", monospace',
} as const;

export const SAVE_KEY = 'mobka:save:v1';

export const NAMES_FIRST = [
  'Иван',
  'Пётр',
  'Сергей',
  'Андрей',
  'Михаил',
  'Алексей',
  'Дмитрий',
  'Ольга',
  'Елена',
  'Татьяна',
  'Наталья',
  'Ирина',
  'Светлана',
  'Мария',
  'Анна',
  'Юлия',
  'Виктор',
  'Николай',
  'Артём',
  'Кирилл',
  'Павел',
  'Роман',
];
export const NAMES_LAST = [
  'Петров',
  'Сидоров',
  'Кузнецов',
  'Смирнов',
  'Попов',
  'Васильев',
  'Соколов',
  'Михайлов',
  'Новиков',
  'Фёдоров',
  'Морозов',
  'Волков',
  'Алексеев',
  'Лебедев',
  'Семёнов',
  'Егоров',
  'Павлов',
  'Козлов',
  'Степанов',
  'Николаев',
  'Орлов',
  'Андреев',
  'Макаров',
  'Никитин',
];
export const PROFESSIONS = [
  'Токарь',
  'Сварщик',
  'Учитель',
  'Водитель',
  'Программист',
  'Бухгалтер',
  'Врач',
  'Строитель',
  'Электрик',
  'Продавец',
  'Инженер',
  'Слесарь',
  'Каменщик',
  'Оператор',
  'Курьер',
  'Охранник',
  'Машинист',
  'Грузчик',
  'Фермер',
  'Таксист',
  'Повар',
  'Журналист',
  'Музыкант',
  'Художник',
];
