import { THEME_COLOR_FALLBACK, type ThemeColorKey } from './fallback';

export type ThemeColorMap = Record<string, string>;

/**
 * 按变量名取色：优先 theme，否则 fallback
 */
export function resolveThemeColor(
  key: ThemeColorKey | string,
  theme?: ThemeColorMap | object | null,
  fallback: ThemeColorMap = THEME_COLOR_FALLBACK,
): string {
  const themeMap = theme as ThemeColorMap | undefined;
  const fromTheme = themeMap?.[key];
  if (fromTheme) {
    return fromTheme;
  }
  return fallback[key] ?? '';
}
