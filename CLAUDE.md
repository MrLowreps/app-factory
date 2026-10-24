# App Factory

毎週1本アプリを公開するためのモノレポ (pnpm workspaces)。構成と手順は README.md と docs/deploy.md を参照。

## ルール

- UI・デザインを最重要視する。見た目はあとから微調整しやすく作る
- 色・余白・角丸・フォントサイズなどの値は `packages/design-tokens/src/tokens.json` を唯一の元データとし、コードに直接書かない
  - Web: `var(--color-*)`, `var(--space-*)` などの CSS 変数を使う。アプリ固有の上書きは各アプリの `src/theme.css`
  - Expo: `src/theme.ts` の `useTheme()` から値を取る。スタイルは `createStyles(theme)` に集約する
- 見た目 (CSS / スタイル定義) とロジックを分ける
- 新しいアプリは `pnpm new-app <slug> [--type web|expo] --name 表示名` で作り、手でコピーしない
- 各アプリの `factory.json` を最新に保つ (ハブの一覧はここから自動生成される)
- React などの共通依存のバージョンは `pnpm-workspace.yaml` の `catalog:` で揃える。各アプリで個別に指定しない

## 確認コマンド

```sh
pnpm install
pnpm typecheck
pnpm build
```
