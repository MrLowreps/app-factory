// tokens.json から Web 用の CSS 変数 (dist/tokens.css) を生成する。
// プリミティブ → セマンティック → コンポーネントの順に var() で参照をつなぐので、
// 実行中にセマンティック変数を書き換えるだけで部品の見た目も変わる。
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { componentRef, isMix, parseRef } from '../src/resolve.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = JSON.parse(readFileSync(join(root, 'src/tokens.json'), 'utf8'));
const { primitive, semantic, component } = tokens;

const px = (n) => (n === 0 ? '0' : `${n}px`);
const rem = (n) => `${n / 16}rem`;
const indent = (lines, n = 2) => lines.map((l) => ' '.repeat(n) + l).join('\n');

// 1. プリミティブ
const primitiveVars = Object.entries(primitive.color).flatMap(([hue, steps]) =>
  Object.entries(steps).map(([step, v]) => `--palette-${hue}-${step}: ${v};`),
);

// 2. セマンティック
const KEYWORDS = new Set(['black', 'white']);
const colorOperand = (name) => (KEYWORDS.has(name) ? name : `var(--color-${name})`);
const colorValue = (v) => {
  if (isMix(v)) return `color-mix(in oklab, ${colorOperand(v.mix[0])}, ${colorOperand(v.mix[1])} ${v.amount}%)`;
  const path = parseRef(v);
  return path ? `var(--palette-${path.join('-')})` : v;
};
const colorVars = (scheme) =>
  Object.entries(semantic.color[scheme]).map(([k, v]) => `--color-${k}: ${colorValue(v)};`);

const shadowVars = (scheme) =>
  Object.entries(semantic.shadow).map(([k, { y, blur, opacity }]) => {
    const a = scheme === 'dark' ? Math.min(opacity * 3, 0.5) : opacity;
    return `--shadow-${k}: 0 ${px(y)} ${px(blur)} rgba(0, 0, 0, ${+a.toFixed(3)});`;
  });

const staticVars = [
  ...Object.entries(semantic.space).map(([k, v]) => `--space-${k}: ${rem(v)};`),
  ...Object.entries(semantic['font-family']).map(([k, v]) => `--font-family-${k}: ${v};`),
  ...Object.entries(semantic['font-size']).map(([k, v]) => `--font-size-${k}: ${rem(v)};`),
  ...Object.entries(semantic['font-weight']).map(([k, v]) => `--font-weight-${k}: ${v};`),
  ...Object.entries(semantic['line-height']).map(([k, v]) => `--line-height-${k}: ${v};`),
  ...Object.entries(semantic.radius).map(([k, v]) => `--radius-${k}: ${px(v)};`),
  ...Object.entries(semantic.size).map(([k, v]) => `--size-${k}: ${rem(v)};`),
  ...Object.entries(semantic.motion).map(([k, v]) => `--motion-${k}: ${v}ms;`),
  ...Object.entries(semantic.ease).map(([k, v]) => `--ease-${k}: ${v};`),
];

// 3. コンポーネント
const componentVars = Object.entries(component).flatMap(([name, entries]) =>
  Object.entries(entries).map(([k, ref]) => {
    const { group, name: key } = componentRef(ref);
    return `--${name}-${k}: var(--${group}-${key});`;
  }),
);

const css = `/* 自動生成ファイル。編集は packages/design-tokens/src/tokens.json で行う。 */

/* 1. プリミティブ (直接使わない) */
:root {
${indent(primitiveVars)}
}

/* 2. セマンティック (アプリ別 theme.css で上書きしてよいのはこの層だけ) */
:root {
  color-scheme: light dark;
${indent(staticVars)}
${indent(colorVars('light'))}
${indent(shadowVars('light'))}
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
${indent(colorVars('dark'), 4)}
${indent(shadowVars('dark'), 4)}
  }
}

:root[data-theme="light"] {
  color-scheme: light;
}

:root[data-theme="dark"] {
  color-scheme: dark;
${indent(colorVars('dark'))}
${indent(shadowVars('dark'))}
}

/* 3. コンポーネント */
:root {
${indent(componentVars)}
}
`;

mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist/tokens.css'), css);
console.log('design-tokens: dist/tokens.css を生成しました');
