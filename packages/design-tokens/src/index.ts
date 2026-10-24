import tokens from './tokens.json';

// デザインの唯一の元データは tokens.json。値の変更はそちらで行う。

export type ColorScheme = 'light' | 'dark';
export type ColorTokens = typeof tokens.color.light;
export type ColorName = keyof ColorTokens;
export type SpaceName = keyof typeof tokens.space;
export type RadiusName = keyof typeof tokens.radius;
export type FontSizeName = keyof typeof tokens.font.size;

export const color = tokens.color;
export const space = tokens.space;
export const radius = tokens.radius;
export const font = tokens.font;
export const shadow = tokens.shadow;
export const duration = tokens.duration;

export interface Theme {
  scheme: ColorScheme;
  color: ColorTokens;
  space: typeof tokens.space;
  radius: typeof tokens.radius;
  font: typeof tokens.font;
  shadow: typeof tokens.shadow;
  duration: typeof tokens.duration;
}

/**
 * ライト/ダークのテーマを作る。アプリ固有の色は overrides で上書きする。
 * 例: createTheme('light', { primary: '#00A86B' })
 */
export function createTheme(
  scheme: ColorScheme,
  overrides: Partial<ColorTokens> = {},
): Theme {
  return {
    scheme,
    color: { ...tokens.color[scheme], ...overrides },
    space: tokens.space,
    radius: tokens.radius,
    font: tokens.font,
    shadow: tokens.shadow,
    duration: tokens.duration,
  };
}

export default tokens;
