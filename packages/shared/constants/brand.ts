/** Dash Job Eventos — identidade visual (logo oficial + paleta). */

export const BRAND = {
  name: 'Dash Job',
  tagline: 'Eventos',
  fullName: 'Dash Job Eventos',
} as const;

/** Cores extraídas do logo oficial. */
export const BRAND_COLORS = {
  /** Círculo esquerdo — ações primárias, CTAs, destaques. */
  coral: '#FF6262',
  /** Círculo central — textos secundários, bordas, ícones muted. */
  gray: '#A3A3A3',
  /** Círculo direito — badges, alertas suaves, acentos quentes. */
  gold: '#FFBF50',
  /** Texto principal do logo. */
  foreground: '#212121',
  /** Fundo do logo e superfícies claras. */
  background: '#FFFFFF',
} as const;

/** Caminhos do logo por app (arquivo: `logo.png`). */
export const BRAND_LOGO_PATH = {
  web: '/logo.png',
  mobile: 'assets/logo.png',
  shared: 'packages/shared/assets/logo.png',
} as const;

export type BrandColor = keyof typeof BRAND_COLORS;
