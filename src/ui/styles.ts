// ─── Centralized UI styles for Мобка ─────────────────────────────────────────
//
// Один источник правды для всех визуальных констант, которые используются
// в Phaser-сценах. В Phaser нет CSS — стили применяются как объекты
// при создании Text или мутируются через setColor/setStyle.
//
//   • FONT_MONO    — моноширинный шрифт, используется везде.
//   • UI_COLORS    — UI-палитра в hex-строках (для Text.color).
//   • TEXT         — готовые объекты Phaser.TextStyle. Переиспользуй
//                    как есть, либо spread: { ...TEXT.body, color: '...' }.
//   • BUTTON       — палитра состояний кнопки (обычное / hover / active).
//   • LAYOUT       — общие размеры (отступы, высота заголовка, и т.п.).
//
// Числовые цвета для Graphics (rectangle/lineStyle) остаются в
// src/config/constants.ts → COLORS, они в формате 0xRRGGBB.

import type Phaser from 'phaser';

type TextStyle = Phaser.Types.GameObjects.Text.TextStyle;

// ── Font ─────────────────────────────────────────────────────────────────────
export const FONT_MONO = '"Courier New", monospace';

// ── UI colors (hex strings for Text.color) ───────────────────────────────────
// Cream = основной текст
// Dim   = вторичный текст
// Red   = акцент / заголовки панелей
export const UI_COLORS = {
  cream: '#d8c9a8',
  dim: '#8a7a60',
  darker: '#5b4a36',
  red: '#a3331f',
  warning: '#ff6b3a',
  orange: '#c06030',
  green: '#a3d97a',
  white: '#ffffff',
} as const;

// ── Text styles ──────────────────────────────────────────────────────────────
// Все объекты соответствуют Phaser.Types.GameObjects.Text.TextStyle.
// `satisfies TextStyle` гарантирует корректность полей, сохраняя literal-типы.
export const TEXT = {
  // Menu / large displays
  title: { fontFamily: FONT_MONO, fontSize: '84px', color: UI_COLORS.cream } satisfies TextStyle,
  subtitle: { fontFamily: FONT_MONO, fontSize: '60px', color: UI_COLORS.dim } satisfies TextStyle,
  tagline: { fontFamily: FONT_MONO, fontSize: '16px', color: UI_COLORS.red } satisfies TextStyle,
  footer: { fontFamily: FONT_MONO, fontSize: '14px', color: UI_COLORS.darker } satisfies TextStyle,
  verdict: { fontFamily: FONT_MONO, fontSize: '20px', color: UI_COLORS.cream } satisfies TextStyle,
  stamped: { fontFamily: FONT_MONO, fontSize: '54px', color: UI_COLORS.red } satisfies TextStyle,
  headline: { fontFamily: FONT_MONO, fontSize: '36px', color: UI_COLORS.cream } satisfies TextStyle,
  dayTitle: { fontFamily: FONT_MONO, fontSize: '28px', color: UI_COLORS.red } satisfies TextStyle,
  eventTitle: { fontFamily: FONT_MONO, fontSize: '22px', color: UI_COLORS.red } satisfies TextStyle,

  // Body
  body: { fontFamily: FONT_MONO, fontSize: '16px', color: UI_COLORS.cream } satisfies TextStyle,
  bodyDim: { fontFamily: FONT_MONO, fontSize: '16px', color: UI_COLORS.dim } satisfies TextStyle,
  stat: { fontFamily: FONT_MONO, fontSize: '16px', color: UI_COLORS.dim } satisfies TextStyle,
  number: { fontFamily: FONT_MONO, fontSize: '14px', color: UI_COLORS.white } satisfies TextStyle,

  // Smaller text
  log: { fontFamily: FONT_MONO, fontSize: '13px', color: UI_COLORS.dim } satisfies TextStyle,
  small: { fontFamily: FONT_MONO, fontSize: '12px', color: UI_COLORS.dim } satisfies TextStyle,
  smaller: { fontFamily: FONT_MONO, fontSize: '11px', color: UI_COLORS.cream } satisfies TextStyle,
  tiny: { fontFamily: FONT_MONO, fontSize: '10px', color: UI_COLORS.dim } satisfies TextStyle,
  tinyCream: { fontFamily: FONT_MONO, fontSize: '10px', color: UI_COLORS.cream } satisfies TextStyle,
  tinyOrange: { fontFamily: FONT_MONO, fontSize: '10px', color: UI_COLORS.orange } satisfies TextStyle,
  tinyOrangeSmaller: { fontFamily: FONT_MONO, fontSize: '10px', color: UI_COLORS.red } satisfies TextStyle,

  // Panel labels & resource names
  panelHeader: { fontFamily: FONT_MONO, fontSize: '14px', color: UI_COLORS.red } satisfies TextStyle,
  resourceName: { fontFamily: FONT_MONO, fontSize: '13px', color: UI_COLORS.cream } satisfies TextStyle,
  resourceValue: { fontFamily: FONT_MONO, fontSize: '14px', color: UI_COLORS.white } satisfies TextStyle,

  // Cards (citizens)
  cardName: { fontFamily: FONT_MONO, fontSize: '15px', color: UI_COLORS.cream } satisfies TextStyle,
  cardLine: { fontFamily: FONT_MONO, fontSize: '12px', color: UI_COLORS.dim } satisfies TextStyle,
  cardStatLabel: { fontFamily: FONT_MONO, fontSize: '10px', color: UI_COLORS.dim } satisfies TextStyle,
  cardStatValue: { fontFamily: FONT_MONO, fontSize: '10px', color: UI_COLORS.cream } satisfies TextStyle,
  cardConn: { fontFamily: FONT_MONO, fontSize: '10px', color: UI_COLORS.orange } satisfies TextStyle,

  // Buttons
  button: { fontFamily: FONT_MONO, fontSize: '20px', color: UI_COLORS.cream } satisfies TextStyle,
  buttonCost: { fontFamily: FONT_MONO, fontSize: '10px', color: UI_COLORS.dim } satisfies TextStyle,
  buttonSmall: { fontFamily: FONT_MONO, fontSize: '18px', color: UI_COLORS.cream } satisfies TextStyle,
  buttonBuy: { fontFamily: FONT_MONO, fontSize: '13px', color: UI_COLORS.cream } satisfies TextStyle,
  selectedAction: { fontFamily: FONT_MONO, fontSize: '10px', color: UI_COLORS.red } satisfies TextStyle,
  selectedName: { fontFamily: FONT_MONO, fontSize: '11px', color: UI_COLORS.cream } satisfies TextStyle,

  // Shop
  shopName: { fontFamily: FONT_MONO, fontSize: '15px', color: UI_COLORS.cream } satisfies TextStyle,
  shopDesc: { fontFamily: FONT_MONO, fontSize: '12px', color: UI_COLORS.dim } satisfies TextStyle,
  shopCost: { fontFamily: FONT_MONO, fontSize: '14px', color: UI_COLORS.green } satisfies TextStyle,

  // Run end / game over
  runTitle: { fontFamily: FONT_MONO, fontSize: '52px', color: UI_COLORS.green } satisfies TextStyle,
  goTitle: { fontFamily: FONT_MONO, fontSize: '54px', color: UI_COLORS.red } satisfies TextStyle,
  goReason: { fontFamily: FONT_MONO, fontSize: '20px', color: UI_COLORS.cream } satisfies TextStyle,
  goStats: { fontFamily: FONT_MONO, fontSize: '16px', color: UI_COLORS.dim } satisfies TextStyle,
  runStats: { fontFamily: FONT_MONO, fontSize: '18px', color: UI_COLORS.cream } satisfies TextStyle,
} as const;

// ── Button palette ───────────────────────────────────────────────────────────
// В Phaser нет CSS :hover/:active — состояния переключаются через ивенты
// pointerover/pointerout/pointerdown и setFillStyle/setColor вручную.
// Эта палитра — единое место для всех трёх состояний.
export const BUTTON = {
  bg: '#3a3128',
  bgHover: '#6b5a3a',
  bgActive: '#4a3f2f',
  bgDisabled: '#2a241c',
  border: '#4a3f2f',
  borderWidth: 2,
  textDefault: '#d8c9a8',
  textDisabled: '#5b4a36',
  textHover: '#ffffff',
  textAffordable: '#a3d97a',
  textUnaffordable: '#a3331f',
  width: 320,
  height: 50,
} as const;

// ── Layout constants ─────────────────────────────────────────────────────────
// Общие для всех сцен. Scene-specific координаты остаются локально.
export const LAYOUT = {
  headerHeight: 56,
  panelPadding: 8,
  resourcePanelX: 8,
  resourcePanelWidth: 220,
  logHeight: 100,
  cardWidth: 220,
  cardHeight: 150,
  cardGapX: 12,
  cardGapY: 12,
} as const;
