import type { ThemeColorKey } from './fallback';

/** 常用主题色变量名 */
export const TEXT_COLOR = {
  /** 一级文字：标题、正文、强调 */
  primary: 'color-text-icon-0' as ThemeColorKey,
  /** 二级文字 */
  secondary: 'color-text-icon-1' as ThemeColorKey,
  /** 中性 / placeholder */
  tertiary: 'color-text-icon-2' as ThemeColorKey,
  /** 品牌色 */
  brand: 'color-primary-brand' as ThemeColorKey,
} as const;
