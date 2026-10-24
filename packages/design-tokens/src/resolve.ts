// tokens.json の参照 ({gray.50} や {color.primary}) と色の混合 ({"mix": [...]}) を解決する純粋関数群。
// Web 用 CSS の生成 (scripts/build-css.mjs) とスマホ用テーマ (index.ts) の両方から使う。
// Node から直接読み込むため、型注釈以外の TypeScript 構文は使わない。

export type Scheme = 'light' | 'dark';
type Dict = Record<string, unknown>;

/** 2色を混ぜた色。mix の2色目を amount% 混ぜる。色はセマンティック名か black / white。 */
export interface MixValue {
  mix: [string, string];
  amount: number;
}

const REF = /^\{([^}]+)\}$/;
const KEYWORDS: Record<string, string> = { black: '#000000', white: '#FFFFFF' };

export function parseRef(value: unknown): string[] | null {
  if (typeof value !== 'string') return null;
  const m = value.match(REF);
  return m ? m[1].split('.') : null;
}

export function isMix(value: unknown): value is MixValue {
  return typeof value === 'object' && value !== null && Array.isArray((value as MixValue).mix);
}

/** プリミティブ参照 ({gray.50}) を値に置き換える。参照でなければそのまま返す。 */
export function resolvePrimitive(tokens: Dict, value: unknown): unknown {
  const path = parseRef(value);
  if (!path) return value;
  let node: unknown = (tokens.primitive as Dict).color;
  for (const key of path) node = (node as Dict | undefined)?.[key];
  if (node === undefined) throw new Error(`未定義のプリミティブ参照: ${value}`);
  return node;
}

/** 指定スキームのセマンティック色を、上書きを適用したうえで実際の色 (hex) にする。 */
export function resolveColors(
  tokens: Dict,
  scheme: Scheme,
  overrides: Record<string, string> = {},
): Record<string, string> {
  const base = ((tokens.semantic as Dict).color as Dict)[scheme] as Record<string, unknown>;
  const defs: Record<string, unknown> = { ...base, ...overrides };
  const out: Record<string, string> = {};

  const resolve = (name: string, seen: string[] = []): string => {
    if (out[name]) return out[name];
    if (KEYWORDS[name]) return KEYWORDS[name];
    if (seen.includes(name)) throw new Error(`色の参照が循環しています: ${[...seen, name].join(' → ')}`);
    const def = defs[name];
    if (def === undefined) throw new Error(`未定義のセマンティック色: ${name}`);
    const value = isMix(def)
      ? mixOklab(resolve(def.mix[0], [...seen, name]), resolve(def.mix[1], [...seen, name]), def.amount / 100)
      : String(resolvePrimitive(tokens, def));
    out[name] = value;
    return value;
  };

  for (const name of Object.keys(defs)) resolve(name);
  return out;
}

/** コンポーネントトークンの参照先 ({color.primary} → ['color', 'primary']) */
export function componentRef(value: unknown): { group: string; name: string } {
  const path = parseRef(value);
  if (!path || path.length !== 2) throw new Error(`コンポーネントトークンの参照が不正です: ${value}`);
  return { group: path[0], name: path[1] };
}

export const toCamel = (s: string) => s.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());

// --- oklab での色の混合 (CSS の color-mix(in oklab, ...) と同じ結果にする) ---

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function hexToOklab(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h.slice(0, 6);
  const [r, g, b] = [0, 2, 4].map((i) => toLinear(parseInt(full.slice(i, i + 2), 16) / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function oklabToHex([L, A, B]: [number, number, number]): string {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  const rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return (
    '#' +
    rgb
      .map((c) => Math.round(Math.min(1, Math.max(0, toGamma(c))) * 255).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

/** a に b を t (0〜1) の割合で混ぜる */
export function mixOklab(a: string, b: string, t: number): string {
  const x = hexToOklab(a);
  const y = hexToOklab(b);
  return oklabToHex([0, 1, 2].map((i) => x[i] * (1 - t) + y[i] * t) as [number, number, number]);
}
