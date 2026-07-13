import { BRAND_COLORS } from '../../../../packages/shared/constants/brand';

export const theme = {
  colors: {
    ...BRAND_COLORS,
    primary: BRAND_COLORS.coral,
    secondary: BRAND_COLORS.gray,
    accent: BRAND_COLORS.gold,
    text: BRAND_COLORS.foreground,
    surface: BRAND_COLORS.background,
    muted: '#F5F5F5',
    border: '#E8E8E8',
  },
} as const;

export type Theme = typeof theme;
