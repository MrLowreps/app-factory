import { useColorScheme } from 'react-native';
import { createTheme } from '@app-factory/design-tokens';

// このアプリだけのテーマ。上書きしてよいのはセマンティック色だけ (名前は CSS の --color-* と同じ)。
// - ライトとダークは必ず両方書く
// - primary を変えれば hover / pressed / soft は自動で追従する。上に乗る文字色 (on-primary) は一緒に見直す
// - アプリ固有の役割 (例: 'macro-protein') もここで追加でき、theme.color.macroProtein で参照できる
// 下の値は既定と同じ。アプリの色に書き換えて使う。
const overrides: Record<'light' | 'dark', Record<string, string>> = {
  light: { primary: '#3D5AFE', 'on-primary': '#FFFFFF', accent: '#FF7A59' },
  dark: { primary: '#7C8CFF', 'on-primary': '#0E1033', accent: '#FF9A7F' },
};

const themes = {
  light: createTheme('light', overrides.light),
  dark: createTheme('dark', overrides.dark),
};

export function useTheme() {
  return useColorScheme() === 'dark' ? themes.dark : themes.light;
}

export type AppTheme = ReturnType<typeof useTheme>;
