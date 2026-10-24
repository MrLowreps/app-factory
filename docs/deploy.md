# 公開手順

## Web アプリ・ハブ (Cloudflare Pages)

アプリごとに Cloudflare Pages のプロジェクトを1つ作り、このリポジトリにつなぎます。

1. Cloudflare ダッシュボード → Workers & Pages → 作成 → Pages → Git に接続 → `app-factory` を選ぶ
2. ビルド設定を入れる (`<slug>` はアプリのフォルダ名)

   | 項目 | 値 |
   | --- | --- |
   | プロジェクト名 | `<slug>` (URL が `https://<slug>.pages.dev` になる) |
   | フレームワーク | なし |
   | ビルドコマンド | `pnpm --filter <slug> build` |
   | 出力ディレクトリ | `apps/<slug>/dist` |
   | ルートディレクトリ | (空欄 = リポジトリのルート) |
   | 環境変数 | `NODE_VERSION` = `22` |

3. 設定 → ビルド → **ビルドのウォッチパス** の「含める」に `apps/<slug>/*` と `packages/*` を指定する。
   ほかのアプリを変更したときに無駄なビルドが走らなくなります。
   ハブは各アプリの `factory.json` も読むので、ハブだけは `apps/*` と `packages/*` にします。

ハブも同じ手順で、`<slug>` を `hub` にして作ります。

## スマホアプリ (Expo / EAS)

```sh
cd apps/<slug>
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform all     # ストア提出用ビルド
npx eas-cli submit --platform ios    # App Store Connect へ提出
```

- ストア提出には Apple Developer Program (年 99 ドル) と Google Play Console (初回 25 ドル) の登録が必要です
- EAS の無料プランはビルド回数に上限があります
- 公開したら `factory.json` の `links.ios` / `links.android` にストアの URL を入れると、ハブに表示されます
