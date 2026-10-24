import { useColorScheme } from 'react-native';
import { createTheme } from '@app-factory/design-tokens';

// このアプリだけのテーマ。上書きしてよいのはセマンティック色だけ (名前は CSS の --color-* と同じ)。
// アプリ固有の役割 (例: 'macro-protein') もここで追加でき、theme.color.macroProtein で参照できる。
const overrides: Record<'light' | 'dark', Record<string, string>> = {
  light: {},
  dark: {},
};

const themes = {
  light: createTheme('light', overrides.light),
  dark: createTheme('dark', overrides.dark),
};

export function useTheme() {
  return useColorScheme() === 'dark' ? themes.dark : themes.light;
}

export type AppTheme = ReturnType<typeof useTheme>;
