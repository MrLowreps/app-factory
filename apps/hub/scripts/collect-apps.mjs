// apps/*/factory.json を集めて、ハブの一覧データ (src/generated/apps.json) を生成する。
// サムネイル画像は public/thumbs/ にコピーする。
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const hubDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const appsDir = join(hubDir, '..');
const outDir = join(hubDir, 'src/generated');
const thumbsDir = join(hubDir, 'public/thumbs');

rmSync(thumbsDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
mkdirSync(thumbsDir, { recursive: true });

const apps = [];
for (const slug of readdirSync(appsDir).sort()) {
  const manifestPath = join(appsDir, slug, 'factory.json');
  if (slug === 'hub' || !existsSync(manifestPath)) continue;

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  let thumbnail = null;
  if (manifest.thumbnail) {
    const src = join(appsDir, slug, manifest.thumbnail);
    if (existsSync(src)) {
      const file = `${slug}${extname(src)}`;
      copyFileSync(src, join(thumbsDir, file));
      thumbnail = `/thumbs/${file}`;
    } else {
      console.warn(`[collect] ${slug}: サムネイル ${manifest.thumbnail} が見つかりません`);
    }
  }
  apps.push({ slug, ...manifest, thumbnail });
}

// 公開日の新しい順
apps.sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''));

writeFileSync(join(outDir, 'apps.json'), JSON.stringify(apps, null, 2) + '\n');
console.log(`[collect] ${apps.length} 件のアプリを読み込みました`);
