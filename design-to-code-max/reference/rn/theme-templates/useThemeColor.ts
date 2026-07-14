import { useAppContext } from '@xlb/components-react-native';
import { useCallback, useMemo } from 'react';
import { THEME_COLOR_FALLBACK, type ThemeColorKey } from '../theme/fallback';
import { resolveThemeColor, type ThemeColorMap } from '../theme/resolveThemeColor';

export type UseThemeColorOptions = {
  /** 覆盖 context 主题（弹窗等可能取不到 context 时由外部传入） */
  theme?: ThemeColorMap | object;
  /** 与默认兜底色合并，可局部覆盖 */
  fallback?: Partial<ThemeColorMap>;
};

/**
 * 取主题色：默认 @xlb/components-react-native context theme，缺失时用兜底色
 *
 * @example
 * const { getColor } = useThemeColor();
 * getColor('color-text-icon-0');
 */
export function useThemeColor(options?: UseThemeColorOptions) {
  const { theme: contextTheme } = useAppContext();

  const mergedFallback = useMemo(
    () => ({
      ...THEME_COLOR_FALLBACK,
      ...options?.fallback,
    }),
    [options?.fallback],
  );

  const theme = options?.theme ?? contextTheme;

  const getColor = useCallback(
    (key: ThemeColorKey | string) =>
      resolveThemeColor(key, theme, mergedFallback),
    [theme, mergedFallback],
  );

  return {
    getColor,
    theme,
    fallback: mergedFallback,
  };
}
