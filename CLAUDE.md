# App Factory

毎週1本アプリを公開するためのモノレポ (pnpm workspaces)。構成と手順は README.md と docs/deploy.md を参照。

## ルール

- UI・デザインを最重要視する。見た目はあとから微調整しやすく作る
- 色・余白・角丸・フォントサイズなどの値は `packages/design-tokens/src/tokens.json` を唯一の元データとし、コードに直接書かない
  - トークンは3層 (プリミティブ `--palette-*` → セマンティック `--color-*` `--space-*` など → コンポーネント `--button-*` など)。画面・部品はセマンティック以降だけを参照する
  - 命名は「種類-役割-状態」(例: `--color-primary-pressed`)。余白は `space-1`〜`10` (4px 刻み)、文字は rem
  - アプリ固有のテーマ (`src/theme.css` / `src/theme.ts`) で上書きしてよいのはセマンティック層だけ。ライト/ダーク両方を用意する
  - Web: CSS 変数を使う。Expo: `useTheme()` から値を取り、スタイルは `createStyles(theme)` に集約する
- 見た目 (CSS / スタイル定義) とロジックを分ける
- 新しいアプリは `pnpm new-app <slug> [--type web|expo] --name 表示名` で作り、手でコピーしない
- 各アプリの `factory.json` を最新に保つ (ハブの一覧はここから自動生成される)
- React などの共通依存のバージョンは `pnpm-workspace.yaml` の `catalog:` で揃える。各アプリで個別に指定しない

## セキュリティ・個人情報

- 個人情報は必要最小限しか扱わない。可能なら端末内 (localStorage など) で完結させ、サーバーに送らない
- 個人情報を外部に送る、ログイン機能を持つ、外部 API を使うなど、リスクのある設計になる場合は、実装前にユーザーへ伝える
- API キーなどの秘密情報をコミットしない。`VITE_` / `EXPO_PUBLIC_` で始まる環境変数はアプリに埋め込まれ誰でも読めるので、秘密情報を入れない
- ユーザー入力を HTML として描画しない (`dangerouslySetInnerHTML` を使わない)
- 外部サービスを使うときは `public/_headers` の Content-Security-Policy に必要なドメインだけ追加する
- CI のセキュリティチェック (`pnpm audit`、gitleaks、CodeQL) を無効化しない。脆弱性を例外にするときは理由をユーザーに伝える

## PR の進め方

- Claude が作った PR は、CI (lint・型チェック・ビルド・セキュリティチェック) がすべて通ったら Claude がマージしてよい (ユーザー了承済み)
- CI が通らない、レビューで指摘が残っている、本番の設定変更が必要などの場合はマージせず、ユーザーに伝える

## 確認コマンド

```sh
pnpm install
pnpm lint
pnpm typecheck
pnpm build
```
