// 各アプリの theme.css で、ライトで上書きした --color-* がダーク側 (2つのセレクタ) にもあるか調べる。
// 片方だけ書くと、ダークモードのときだけ既定の色に戻ってしまうため。
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const SKIP_DIRS = new Set(['node_modules', 'dist', '.expo']);

const files = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(path);
    } else if (entry.isFile() && entry.name === 'theme.css') files.push(path);
  }
};
['apps', 'templates'].forEach((d) => walk(join(root, d)));

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const varsIn = (body) => new Set([...body.matchAll(/(--color-[\w-]+)\s*:/g)].map((m) => m[1]));
const blockAfter = (css, selectorPattern) => {
  const m = css.match(new RegExp(selectorPattern + String.raw`\s*\{([^{}]*)\}`));
  return m ? varsIn(m[1]) : new Set();
};

const problems = [];
for (const file of files) {
  const css = stripComments(readFileSync(file, 'utf8'));
  // 先頭が ":root {" のブロック = ライト (既定)
  const light = blockAfter(css, String.raw`(?:^|\})\s*:root`);
  const darkMedia = blockAfter(css, String.raw`:root:not\(\[data-theme="light"\]\)`);
  const darkAttr = blockAfter(css, String.raw`:root\[data-theme="dark"\]`);
  for (const name of light) {
    if (!darkMedia.has(name)) problems.push(`${relative(root, file)}: ${name} が @media (prefers-color-scheme: dark) 側にありません`);
    if (!darkAttr.has(name)) problems.push(`${relative(root, file)}: ${name} が :root[data-theme="dark"] 側にありません`);
  }
}

if (problems.length) {
  console.error('テーマのダーク側の上書き漏れがあります:\n' + problems.join('\n'));
  process.exit(1);
}
console.log(`check-theme: ${files.length} ファイル問題なし`);
