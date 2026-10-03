/**
 * Core palette: black + silver. Kept intentionally small so the whole app
 * reads as one coherent, premium surface system.
 */
export const colors = {
  /** App background (near black, not pure black to avoid harsh OLED banding). */
  background: '#0A0A0C',
  /** Default card / sheet surface. */
  surface: '#141417',
  /** Raised surface: inputs, pressed states, nested cards. */
  surfaceElevated: '#1C1C21',
  /** Highest surface: modals, tooltips, FAB. */
  surfaceHighest: '#232329',

  /** Subtle hairline borders. */
  border: '#26262C',
  borderStrong: '#34343C',
  borderFocus: '#6E7480',

  /** Silver scale, used for accents, text and gradients. */
  silver: '#C9CDD4',
  silverBright: '#E9EBEE',
  silverMuted: '#8B919B',
  silverDim: '#5E636C',

  /** Text. */
  text: '#F4F5F7',
  textSecondary: '#A2A8B1',
  textTertiary: '#767C86',
  textInverse: '#0A0A0C',

  /** Accent used sparingly for highlights / active states. */
  accent: '#E9EBEE',
  accentSoft: 'rgba(233, 235, 238, 0.10)',

  /** Status. */
  danger: '#F2555A',
  dangerSoft: 'rgba(242, 85, 90, 0.12)',
  success: '#4ADE80',
  successSoft: 'rgba(74, 222, 128, 0.12)',
  warning: '#FBBF24',

  /** Overlays. */
  scrim: 'rgba(4, 4, 6, 0.72)',
  transparent: 'transparent',
} as const;

/** Per-macro chart colors, all tuned to the silver/black system. */
export const macroColors = {
  protein: '#E9EBEE',
  carbs: '#9AA3AE',
  fat: '#5F6672',
} as const;

export const shadow = {
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  fab: {
    shadowColor: '#000000',
    shadowOpacity: 0.55,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
} as const;
