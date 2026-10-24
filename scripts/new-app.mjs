// 新しいアプリをテンプレートから作る。
// 使い方: pnpm new-app <slug> [--type web|expo] [--name 表示名]
import { cpSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    type: { type: 'string', default: 'web' },
    name: { type: 'string' },
  },
});

const [slug] = positionals;
if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
  console.error('使い方: pnpm new-app <slug> [--type web|expo] [--name 表示名]');
  console.error('slug は半角小文字・数字・ハイフンのみ (例: pomodoro-timer)');
  process.exit(1);
}
if (!['web', 'expo'].includes(values.type)) {
  console.error(`--type は web か expo を指定してください (指定値: ${values.type})`);
  process.exit(1);
}

const dest = join(root, 'apps', slug);
try {
  // 既存のフォルダは上書きしない
  cpSync(join(root, 'templates', values.type), dest, { recursive: true, force: false, errorOnExist: true });
} catch (err) {
  console.error(err.code === 'ERR_FS_CP_EEXIST' ? `apps/${slug} はすでに存在します` : err.message);
  process.exit(1);
}

const TEXT_EXT = new Set(['.json', '.ts', '.tsx', '.html', '.css', '.md']);
const replacements = { __APP_SLUG__: slug, __APP_NAME__: values.name ?? slug };

const walk = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.isFile() && TEXT_EXT.has(extname(path))) {
      let text = readFileSync(path, 'utf8');
      for (const [from, to] of Object.entries(replacements)) text = text.replaceAll(from, to);
      writeFileSync(path, text);
    }
  }
};
walk(dest);

console.log(`apps/${slug} を作成しました (${values.type})`);
console.log('次のステップ:');
console.log('  pnpm install');
console.log(`  pnpm --filter ${slug} dev`);
