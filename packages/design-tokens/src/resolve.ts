// tokens.json の参照 ({gray.50} や {color.primary}) を解決する純粋関数群。
// Web 用 CSS の生成 (scripts/build-css.mjs) とスマホ用テーマ (index.ts) の両方から使う。
// Node から直接読み込むため、型注釈以外の TypeScript 構文は使わない。

export type Scheme = 'light' | 'dark';
type Dict = Record<string, unknown>;

const REF = /^\{([^}]+)\}$/;

export function parseRef(value: unknown): string[] | null {
  if (typeof value !== 'string') return null;
  const m = value.match(REF);
  return m ? m[1].split('.') : null;
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

/** 指定スキームのセマンティック色を、上書きを適用したうえで実際の値にする。 */
export function resolveColors(
  tokens: Dict,
  scheme: Scheme,
  overrides: Record<string, string> = {},
): Record<string, string> {
  const base = ((tokens.semantic as Dict).color as Dict)[scheme] as Record<string, string>;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries({ ...base, ...overrides })) {
    out[k] = String(resolvePrimitive(tokens, v));
  }
  return out;
}

/** コンポーネントトークンの参照先 ({color.primary} → ['color', 'primary']) */
export function componentRef(value: unknown): { group: string; name: string } {
  const path = parseRef(value);
  if (!path || path.length !== 2) throw new Error(`コンポーネントトークンの参照が不正です: ${value}`);
  return { group: path[0], name: path[1] };
}

export const toCamel = (s: string) => s.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
