import tokens from './tokens.json';
import { componentRef, resolveColors, toCamel, type Scheme } from './resolve';

// デザインの唯一の元データは tokens.json。値の変更はそちらで行う。
// ここはスマホ (React Native) 向けに、参照を解決したテーマオブジェクトを作る。

export type ColorScheme = Scheme;
type Semantic = typeof tokens.semantic;
export type SemanticColorName = keyof Semantic['color']['light'];
type Camel<S extends string> = S extends `${infer H}-${infer T}` ? `${H}${Capitalize<Camel<T>>}` : S;

export type ThemeColors = { [K in SemanticColorName as Camel<K>]: string } & Record<string, string>;
// 寸法系 (padding / radius / gap / height) は数値、それ以外 (色・影の名前) は文字列
type ComponentValue<K> = K extends
  | `${string}padding${string}`
  | `${string}radius${string}`
  | `${string}gap${string}`
  | `${string}height${string}`
  ? number
  : string;
type ComponentTokens = {
  [C in keyof typeof tokens.component]: {
    [K in keyof (typeof tokens.component)[C] as Camel<K & string>]: ComponentValue<K>;
  };
};

export interface NativeShadow {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface Theme {
  scheme: ColorScheme;
  color: ThemeColors;
  space: Semantic['space'];
  fontSize: Semantic['font-size'];
  fontWeight: Semantic['font-weight'];
  lineHeight: Semantic['line-height'];
  radius: Semantic['radius'];
  size: { [K in keyof Semantic['size'] as Camel<K & string>]: number };
  shadow: Record<keyof Semantic['shadow'], NativeShadow>;
  motion: Semantic['motion'];
  component: ComponentTokens;
}

const camelKeys = <T>(obj: Record<string, T>) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [toCamel(k), v]));

const nativeShadow = (s: { y: number; blur: number; opacity: number }, scheme: Scheme): NativeShadow => ({
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: s.y },
  shadowOpacity: scheme === 'dark' ? Math.min(s.opacity * 3, 0.5) : s.opacity,
  shadowRadius: s.blur / 2,
  elevation: Math.round(s.y * 1.5),
});

/**
 * ライト/ダークのテーマを作る。アプリ固有の色はセマンティック名 (CSS と同じ名前) で上書きする。
 * 例: createTheme('light', { primary: '#0B7A53', 'primary-soft': '#E2F5EC' })
 */
export function createTheme(scheme: ColorScheme, overrides: Record<string, string> = {}): Theme {
  const colors = resolveColors(tokens, scheme, overrides);
  const shadow = Object.fromEntries(
    Object.entries(tokens.semantic.shadow).map(([k, v]) => [k, nativeShadow(v, scheme)]),
  ) as Theme['shadow'];

  const groups: Record<string, Record<string, unknown>> = {
    color: colors,
    space: tokens.semantic.space,
    radius: tokens.semantic.radius,
    size: tokens.semantic.size,
    'font-size': tokens.semantic['font-size'],
  };
  const component = Object.fromEntries(
    Object.entries(tokens.component).map(([name, entries]) => [
      name,
      camelKeys(
        Object.fromEntries(
          Object.entries(entries as Record<string, string>).map(([k, ref]) => {
            const { group, name: key } = componentRef(ref);
            // 影はネイティブでは style オブジェクトになるため、名前だけ返す
            return [k, group === 'shadow' ? key : (groups[group]?.[key] as string | number)];
          }),
        ),
      ),
    ]),
  ) as ComponentTokens;

  return {
    scheme,
    color: camelKeys(colors) as ThemeColors,
    space: tokens.semantic.space,
    fontSize: tokens.semantic['font-size'],
    fontWeight: tokens.semantic['font-weight'],
    lineHeight: tokens.semantic['line-height'],
    radius: tokens.semantic.radius,
    size: camelKeys(tokens.semantic.size) as Theme['size'],
    shadow,
    motion: tokens.semantic.motion,
    component,
  };
}

export default tokens;
