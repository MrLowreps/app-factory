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

見た目の値は **`packages/design-tokens/src/tokens.json` だけ** が元データです。ここを変えると全アプリ (Web もスマホも) に反映されます。トークンは3層です。

| 層 | 例 | 使い方 |
| --- | --- | --- |
| プリミティブ | `--palette-blue-500` | 素の色。画面や部品からは直接使わない |
| セマンティック | `--color-primary`, `--space-4`, `--font-size-md`, `--radius-lg`, `--shadow-card`, `--motion-fast` | 役割の名前。画面はここを使う |
| コンポーネント | `--button-bg`, `--card-radius`, `--chip-bg-selected` | 部品ごとの値。セマンティックを参照する |

- 命名は「種類-役割-状態」(例: `--color-primary-pressed`)
- 余白は `space-1`〜`space-10` (4px 刻み)、文字サイズは `xs`〜`2xl` (rem)
- Web: CSS 変数を使う。スマホ: `useTheme()` のテーマオブジェクト (`theme.color.primary`, `theme.component.button.bg` など) を使う
- アプリ固有の見た目は、Web は `src/theme.css`、スマホは `src/theme.ts` で **セマンティック層だけ** 上書きする。アプリ専用の役割 (例: `--color-macro-protein`) もそこで定義する
- ライト/ダークは最初から両方用意する (theme.css でダーク側を書き忘れると `pnpm lint` で検出)
- `primary-hover` / `primary-pressed` / `primary-soft` は `primary` から自動で作られるので、ブランド色は `--color-primary` の1行で変わる
- タップできる部品の高さは `--size-touch-min` (44px 相当) 以上にする

色や px をコードに直接書くと `pnpm lint` で検出されます (色を書いてよいのは `tokens.json` と各アプリの `theme.css` / `theme.ts` だけ)。

## セキュリティ

PR と main への push ごとに、次のチェックが自動で走ります (`.github/workflows/security.yml`)。

- 依存パッケージの脆弱性 (`pnpm audit`、深刻度 high 以上で失敗)。毎週月曜にも実行
- 秘密情報 (APIキー・トークンなど) の混入検出 (gitleaks)
- 静的解析 (CodeQL)
- Dependabot による依存パッケージの更新 PR (週1回)
- Web アプリは `public/_headers` でセキュリティヘッダー (CSP など) を付けて配信

## 公開

[docs/deploy.md](docs/deploy.md) を参照してください。
