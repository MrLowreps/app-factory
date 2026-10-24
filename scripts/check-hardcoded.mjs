// TS/TSX (主にスマホアプリのスタイル) に色の直書きがないか調べる。
// 色を書いてよいのは tokens.json と各アプリの theme.ts だけ。
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const SKIP_DIRS = new Set(['node_modules', 'dist', '.expo', 'generated']);
const ALLOWED = (path) => path.endsWith('/theme.ts');
const HEX = /['"`]#[0-9a-fA-F]{3,8}['"`]|\brgba?\(/;

const problems = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(path);
    } else if (entry.isFile() && /\.tsx?$/.test(entry.name) && !ALLOWED(path)) {
      readFileSync(path, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          if (HEX.test(line)) problems.push(`${relative(root, path)}:${i + 1}: ${line.trim()}`);
        });
    }
  }
};
['apps', 'templates'].forEach((d) => walk(join(root, d)));

if (problems.length) {
  console.error('色の直書きが見つかりました。theme.ts かトークンを使ってください:\n' + problems.join('\n'));
  process.exit(1);
}
console.log('check-hardcoded: 問題なし');
