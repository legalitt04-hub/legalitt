import { normalize } from '../utils/responsive';

// ─── LEGALITT PREMIUM THEME ─────────────────────────────────────────────────
// Deep Navy + Gold — professional legal brand identity
export const COLORS = {
  // ── Primary Palette ───────────────────────────────────────────────────────
  primary:            '#1A3C5E',   // Deep Navy — primary brand color
  primaryDark:        '#0F2540',   // Darker Navy
  primaryLight:       '#2A5F8F',   // Mid Navy
  primarySurface:     '#EEF4FA',   // Very light navy tint (backgrounds/cards)

  // ── Accent ───────────────────────────────────────────────────────────────
  accent:             '#C9A84C',   // Premium Gold
  accentDark:         '#A6873A',   // Darker Gold
  accentLight:        '#F0D98E',   // Light Gold tint
  accentSurface:      '#FDF8EC',   // Very light gold tint

  // ── Success / Warning / Error ─────────────────────────────────────────────
  success:            '#16A34A',   // Rich Green
  successSurface:     '#DCFCE7',
  warning:            '#D97706',   // Amber
  warningSurface:     '#FEF3C7',
  danger:             '#DC2626',   // Red
  dangerSurface:      '#FEE2E2',
  error:              '#DC2626',

  // ── Backgrounds ───────────────────────────────────────────────────────────
  background:         '#F4F6F9',   // Soft blue-grey page background
  backgroundGray:     '#F4F6F9',
  surface:            '#FFFFFF',   // Card / elevated surface
  card:               '#FFFFFF',
  overlay:            'rgba(15,37,64,0.55)', // Navy overlay for modals

  // ── Text ─────────────────────────────────────────────────────────────────
  text:               '#1A1F36',   // Near-black primary text
  textPrimary:        '#1A1F36',
  textSecondary:      '#5A6478',   // Muted grey
  textTertiary:       '#9BA3B4',   // Very muted
  textInverse:        '#FFFFFF',   // White text on dark backgrounds
  textAccent:         '#C9A84C',   // Gold text

  // ── Borders ───────────────────────────────────────────────────────────────
  border:             '#DDE3ED',
  borderLight:        '#EEF1F7',
  divider:            '#F0F2F7',

  // ── Gradients (start→end) ─────────────────────────────────────────────────
  primaryGradientStart: '#1A3C5E',
  primaryGradientEnd:   '#0F2540',
  accentGradientStart:  '#C9A84C',
  accentGradientEnd:    '#A6873A',

  // ── Status Badges ─────────────────────────────────────────────────────────
  statusPending:    '#D97706',
  statusActive:     '#16A34A',
  statusCompleted:  '#1A3C5E',
  statusCancelled:  '#DC2626',

  // ── Legacy compat (kept so no screen breaks) ──────────────────────────────
  primaryLight2:    '#EEF4FA',
};

export const GRADIENTS = {
  primary:   ['#1A3C5E', '#0F2540'],
  accent:    ['#C9A84C', '#A6873A'],
  hero:      ['#1A3C5E', '#2A5F8F'],
  card:      ['#FFFFFF', '#F4F6F9'],
  success:   ['#16A34A', '#15803D'],
};

export const SHADOWS = {
  xs: {
    shadowColor: '#1A3C5E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  small: {
    shadowColor: '#1A3C5E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  medium: {
    shadowColor: '#1A3C5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  large: {
    shadowColor: '#1A3C5E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 8,
  },
  gold: {
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
};

export const SIZES = {
  small:        normalize(12),
  medium:       normalize(16),
  large:        normalize(20),
  xlarge:       normalize(24),
  xxlarge:      normalize(32),
  buttonHeight: normalize(56),
  radiusXl:     normalize(20),
  radiusLg:     normalize(16),
  radiusMd:     normalize(12),
  radiusSm:     normalize(8),
  radiusXs:     normalize(6),
};

export const TYPOGRAPHY = {
  h1:     { fontSize: normalize(28), fontWeight: '800', letterSpacing: -0.5 },
  h2:     { fontSize: normalize(22), fontWeight: '700', letterSpacing: -0.3 },
  h3:     { fontSize: normalize(18), fontWeight: '700', letterSpacing: -0.2 },
  h4:     { fontSize: normalize(16), fontWeight: '700' },
  body:   { fontSize: normalize(14), fontWeight: '400', lineHeight: normalize(22) },
  bodyMd: { fontSize: normalize(14), fontWeight: '500' },
  small:  { fontSize: normalize(12), fontWeight: '500' },
  tiny:   { fontSize: normalize(10), fontWeight: '600', letterSpacing: 0.3 },
  label:  { fontSize: normalize(11), fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
};
