# あるもの献立

冷蔵庫の残り物と、自分のカロリー・PFC の目標から、1日分の献立と買い物リストを作る Web アプリです。

## 構成

| 場所 | 中身 |
| --- | --- |
| `src/domain/` | 食材データ、目標の計算、献立のスキーマ、買い物リスト (画面に依存しないロジック) |
| `src/screens/` `src/ui/` | 画面と部品。見た目は `src/app.css` と `src/theme.css` だけで決まる |
| `src/lib/` | 端末内の保存、写真の加工、共有カード、AI の呼び出し |
| `worker/` | Cloudflare Pages の `_worker.js`。`/api/menu` で AI に献立を作らせる |
| `src/config.ts` | アプリ名などの文言 |

## 開発

```sh
pnpm --filter arumono-kondate dev
```

`ANTHROPIC_API_KEY` を環境変数に入れて起動すると本物の AI で献立を作ります。入れなければ開発用の固定の献立を返します。

## 公開 (Cloudflare Pages)

[docs/deploy.md](../../docs/deploy.md) の手順でプロジェクトを作ったうえで、次を設定します。

| 設定 | 値 |
| --- | --- |
| 環境変数 (シークレット) | `ANTHROPIC_API_KEY` = Claude API のキー。**暗号化 (Encrypt) にする** |
| 環境変数 (任意) | `MENU_DAILY_LIMIT` = 1つの接続元が1日に作れる献立の数 (既定 10) |
| KV の紐付け (任意) | 変数名 `RATE_LIMIT` で KV 名前空間を紐付けると、回数制限が全サーバーで共有される |

ビルドで `dist/_worker.js` が作られ、Cloudflare Pages はこれを使って `/api/menu` を動かします。

## セキュリティと個人情報

- 身長・体重・食材・記録・写真は端末内 (localStorage / IndexedDB) にだけ保存する
- AI に送るのは目標の数値と食材 id だけ。入力と AI の返答はどちらも `src/domain/menu.ts` のスキーマで検査する
- API キーはサーバー側 (`_worker.js`) にだけ置く。`VITE_` の環境変数には入れない
- 回数制限: 端末ごとに1日3回 (画面側) と、接続元ごとの上限 (サーバー側)。**Claude Console で月額の利用上限も必ず設定する**
- 写真は保存時と共有時に描き直すので、撮影場所などの付属データは残らない
- セキュリティヘッダーは `public/_headers` が元データ。`_worker.js` も同じ内容を API の応答に付ける

## 公開前にやること

- [ ] `src/domain/foods.ts` の栄養値を、日本食品標準成分表（八訂）の公式データと照合する
- [ ] Claude Console で月額の利用上限を設定する
- [ ] プライバシーポリシーと利用規約を用意する
