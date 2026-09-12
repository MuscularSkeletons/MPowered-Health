// UI features for consistency
export const palette = {
  primary: '#5E17EB',
  secondary: '#8C52FF',
  accent: '#BEA1F7',
  light: '#D8C7FA',
  primaryDark: '#4610B8',
  text: '#201A2B',
  muted: '#686173',
  background: '#F9F8FC',
  surface: '#FFFFFF',
  surfaceSoft: '#F7F4FC',
  line: '#E5DFF0',
  success: '#257A57',
  error: '#A64259',
};
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const layout = {
  screenGutter: 24,
  screenTop: 24,
  screenBottom: 112,
  maxContentWidth: 680,
  sectionGap: 32,
  cardPadding: 18,
  controlHeight: 56,
};

export const radius = { sm: 12, md: 16, lg: 20, xl: 24, pill: 999 };

// ? what is this for?
const tones = {
  rose: ['#F8E1E5', '#94465A'],
  mint: ['#DFF1E9', '#27705A'],
  blue: ['#E1EBF7', '#3C648E'],
  gold: ['#F5EBD2', '#83651F'],
  violet: ['#E9DEFF', '#5E17EB'],
} as const;