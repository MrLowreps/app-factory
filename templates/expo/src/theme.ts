import { useColorScheme } from 'react-native';
import { createTheme, type ColorTokens } from '@app-factory/design-tokens';

// このアプリだけの色の上書き。共通トークンはそのまま使い、必要な色だけ変える。
const overrides: Record<'light' | 'dark', Partial<ColorTokens>> = {
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
