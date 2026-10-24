// tokens.json から Web 用の CSS 変数 (dist/tokens.css) を生成する。
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = JSON.parse(readFileSync(join(root, 'src/tokens.json'), 'utf8'));

const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const px = (n) => (n === 0 ? '0' : `${n}px`);

const colorVars = (scheme) =>
  Object.entries(tokens.color[scheme])
    .map(([k, v]) => `  --color-${kebab(k)}: ${v};`)
    .join('\n');

const shadowCss = ({ x, y, blur, opacity }, scheme) =>
  `${px(x)} ${px(y)} ${px(blur)} rgba(0, 0, 0, ${scheme === 'dark' ? Math.min(opacity * 4, 0.6) : opacity})`;

const shadowVars = (scheme) =>
  Object.entries(tokens.shadow)
    .map(([k, v]) => `  --shadow-${kebab(k)}: ${shadowCss(v, scheme)};`)
    .join('\n');

const staticVars = [
  ...Object.entries(tokens.space).map(([k, v]) => `  --space-${kebab(k)}: ${px(v)};`),
  ...Object.entries(tokens.radius).map(([k, v]) => `  --radius-${kebab(k)}: ${px(v)};`),
  `  --font-family: ${tokens.font.family.web};`,
  `  --font-family-mono: ${tokens.font.family.webMono};`,
  ...Object.entries(tokens.font.size).map(([k, v]) => `  --font-size-${kebab(k)}: ${v / 16}rem;`),
  ...Object.entries(tokens.font.weight).map(([k, v]) => `  --font-weight-${kebab(k)}: ${v};`),
  ...Object.entries(tokens.font.lineHeight).map(([k, v]) => `  --line-height-${kebab(k)}: ${v};`),
  ...Object.entries(tokens.duration).map(([k, v]) => `  --duration-${kebab(k)}: ${v}ms;`),
].join('\n');

const css = `/* 自動生成ファイル。編集は packages/design-tokens/src/tokens.json で行う。 */
:root {
  color-scheme: light dark;
${staticVars}
${colorVars('light')}
${shadowVars('light')}
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
${colorVars('dark').replace(/^/gm, '  ')}
${shadowVars('dark').replace(/^/gm, '  ')}
  }
}

:root[data-theme="light"] {
  color-scheme: light;
}

:root[data-theme="dark"] {
  color-scheme: dark;
${colorVars('dark')}
${shadowVars('dark')}
}
`;

mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist/tokens.css'), css);
console.log('design-tokens: dist/tokens.css を生成しました');
