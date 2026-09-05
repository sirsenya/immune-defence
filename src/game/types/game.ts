// Core game type definitions for Мобка

export type ActionId =
  | 'summons'
  | 'docs'
  | 'detain'
  | 'neighbors'
  | 'medical';

export interface ActionDef {
  id: ActionId;
  label: string;
  description: string;
  costMoney: number;
  costAdmin: number;
  baseSuccessBonus: number; // additive to attendance/result chance
  attendanceBonus: number; // how much it raises attendanceChance
  effects: ActionEffects;
}

export interface ActionEffects {
  discontentDelta?: number;
  departmentSecurityDelta?: number;
  revealsConnections?: boolean;
  canRemoveFromPlan?: boolean;
}

export interface Resources {
  money: number;
  admin: number; // административный ресурс
  discontent: number; // 0..100
  security: number; // 0..100 безопасность отдела
  loyalty: number; // лояльность начальства 0..100
}

export interface PersonData {
  id: string;
  name: string;
  age: number;
  profession: string;
  familySize: number;
  income: number;
  fear: number; // 0..100
  resistance: number; // 0..100
  attendanceChance: number; // 0..100
  connections: string[];
  // meta state tracked across days:
  summonsSent?: number;
  docsChecked?: boolean;
  detained?: boolean;
  medicalChecked?: boolean;
  neighborsChecked?: boolean;
  removedFromPlan?: boolean;
  timesSeen?: number; // how many days the player has seen this person
}

export interface ComboRule {
  id: string;
  label: string;
  description: string;
  matches: (selected: PersonData[]) => number; // returns # of matched groups or 1 if matched
  multiplier: (selected: PersonData[]) => number; // returns extra multiplier (0..1+)
}

export interface ActiveCombo {
  ruleId: string;
  label: string;
  bonus: number; // 0..1 (e.g. 0.3 = +30%)
}

export interface ComboResult {
  multiplier: number; // 1 = no combo
  bonuses: ActiveCombo[];
  bonusPercent: number; // (multiplier - 1) * 100
}

export interface DayPlan {
  day: number;
  target: number;
}

export interface DayResult {
  day: number;
  target: number;
  collected: number;
  multiplier: number;
  baseCollected: number; // before multiplier
  overfulfilledPercent: number;
  moneyEarned: number;
  adminEarned: number;
  loyaltyDelta: number;
  discontentDelta: number;
  securityDelta: number;
  message: string;
}

export interface UpgradeDef {
  id: string;
  name: string;
  description: string;
  descriptionShort: string;
  cost: number;
  apply: (state: GameState) => void;
  // human-readable summary of what changed, displayed in the shop
  effectSummary: string;
}

export interface OwnedUpgrade {
  id: string;
}

export interface GameEventChoice {
  label: string;
  description?: string;
  apply: (state: GameState) => void;
}

export interface GameEvent {
  id: string;
  title: string;
  text: string;
  weight?: (state: GameState) => number; // higher = more likely when not specified
  condition?: (state: GameState) => boolean;
  choices: GameEventChoice[];
}

export interface GameState {
  day: number; // 1..10
  plan: number; // current day plan target
  resources: Resources;
  pool: PersonData[]; // today's available citizens
  selectedIds: string[];
  lastActionByPerson: Record<string, ActionId | undefined>;
  upgrades: OwnedUpgrade[];
  pastDays: DayResult[];
  runSeed: number;
  totalEarned: number;
  maxComboMultiplier: number;
  eventLog: string[];
  comboMultiplier: number;
  status: 'menu' | 'playing' | 'dayEnd' | 'runEnd' | 'gameOver';
  gameOverReason?: string;
  // counters used by upgrades
  summonsThisDay: number;
  // run-level counters
  citizensSeen: Record<string, number>; // id -> times seen
}
