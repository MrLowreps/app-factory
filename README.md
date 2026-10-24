# App Factory

毎週ひとつアプリを作って公開するためのモノレポです。Web アプリもスマホアプリ (Expo) も、ここにまとめて置きます。

## 構成

```
app-factory/
├─ packages/
│  └─ design-tokens/   全アプリ共通のデザイントークン (色・余白・フォントなど)
├─ apps/
│  ├─ hub/             アプリ一覧ページ (ポートフォリオ兼ハブ)
│  └─ <アプリ>/        各アプリ (テンプレートから作る)
├─ templates/
│  ├─ web/             Web アプリの雛形 (Vite + React + TypeScript)
│  └─ expo/            スマホアプリの雛形 (Expo + React Native)
└─ scripts/new-app.mjs 新しいアプリを作るコマンド
```

## はじめに

Node.js 22 以上と pnpm が必要です (`corepack enable` で pnpm が使えるようになります)。

```sh
pnpm install
pnpm dev:hub        # ハブを開発サーバーで表示
```

## 新しいアプリを作る

```sh
pnpm new-app pomodoro-timer --name ポモドーロタイマー            # Web アプリ
pnpm new-app habit-tracker --type expo --name 習慣トラッカー     # スマホアプリ
pnpm install
pnpm --filter pomodoro-timer dev
```

各アプリの `factory.json` がハブの一覧に載る情報です。公開したら `status` を `"published"` にして、`publishedAt` と `links` を埋めます。

| 項目 | 内容 |
| --- | --- |
| `name` / `description` | 表示名と一言説明 |
| `platforms` | `web` / `ios` / `android` |
| `status` | `wip` (制作中。ハブの開発サーバーでだけ表示) / `published` |
| `publishedAt` | 公開日 `YYYY-MM-DD`。新しい順に並ぶ |
| `links` | 公開 URL (`web`、ストアの `ios` / `android`) |
| `thumbnail` | アプリフォルダ内の画像パス (例: `thumbnail.png`、16:10 推奨) |

## デザインの調整

見た目の値は **`packages/design-tokens/src/tokens.json` だけ** が元データです。ここを変えると全アプリ (Web もスマホも) に反映されます。

- Web: 生成される CSS 変数 (`var(--color-primary)`, `var(--space-md)` など) を使う
- スマホ: `createTheme()` で作ったテーマオブジェクト (`theme.color.primary` など) を使う
- アプリ固有の色: Web は `src/theme.css`、スマホは `src/theme.ts` の上書き欄で変える

色や余白をコードに直接書かず、必ずトークンを使ってください。

## 公開

[docs/deploy.md](docs/deploy.md) を参照してください。
