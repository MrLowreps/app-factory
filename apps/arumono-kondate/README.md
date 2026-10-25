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

ふだんは開発用の固定の献立を返します。`AI_PROVIDER=claude` と `ANTHROPIC_API_KEY` を環境変数に入れて起動すると Claude で献立を作ります。Workers AI はローカルから呼べないので、Cloudflare のプレビュー環境で確かめます。

## AI の切り替え

AI の呼び出しは `worker/providers/` に事業者ごとに分けてあり、`AI_PROVIDER` で選びます。どれを選んでも、返答は同じスキーマで検査します。

| `AI_PROVIDER` | 費用 | 必要な設定 | 入力データの扱い |
| --- | --- | --- | --- |
| `workers-ai` (既定) | 1日 10,000 Neurons まで無料。超えるとその日はエラー (Free プラン) | Pages に Workers AI のバインディング `AI` を追加 | 学習に使わない・保存しない ([公式](https://developers.cloudflare.com/workers-ai/platform/data-usage/)) |
| `claude` | 従量課金 | `ANTHROPIC_API_KEY` (暗号化) | API の入力は既定で学習に使わない |

モデルを変えるときは `AI_MODEL` を指定します (Workers AI の既定は `@cf/meta/llama-3.3-70b-instruct-fp8-fast`)。新しい事業者を足すときは `worker/providers/` にファイルを1つ足し、`index.ts` に登録します。

## 公開 (Cloudflare Pages)

[docs/deploy.md](../../docs/deploy.md) の手順でプロジェクトを作ったうえで、次を設定します。

| 設定 | 値 |
| --- | --- |
| バインディング | Workers AI を変数名 `AI` で追加する (既定の `workers-ai` を使う場合) |
| 環境変数 (任意) | `AI_PROVIDER` / `AI_MODEL` = 上の「AI の切り替え」を参照 |
| 環境変数 (シークレット) | `ANTHROPIC_API_KEY` = Claude を使う場合だけ。**暗号化 (Encrypt) にする** |
| 環境変数 (任意) | `MENU_DAILY_LIMIT` = 1つの接続元が1日に作れる献立の数 (既定 10) |
| KV の紐付け (任意) | 変数名 `RATE_LIMIT` で KV 名前空間を紐付けると、回数制限が全サーバーで共有される |

ビルドで `dist/_worker.js` が作られ、Cloudflare Pages はこれを使って `/api/menu` を動かします。

## セキュリティと個人情報

- 身長・体重・食材・記録・写真は端末内 (localStorage / IndexedDB) にだけ保存する
- AI に送るのは目標の数値と食材 id だけ。入力と AI の返答はどちらも `src/domain/menu.ts` のスキーマで検査する
- API キーはサーバー側 (`_worker.js`) にだけ置く。`VITE_` の環境変数には入れない
- 回数制限: 端末ごとに1日3回 (画面側) と、接続元ごとの上限 (サーバー側)。Workers AI の無料枠は超えるとエラーになるだけで課金されない。有料の事業者に切り替えるときは**その事業者の管理画面で月額の利用上限も必ず設定する**
- 写真は保存時と共有時に描き直すので、撮影場所などの付属データは残らない
- セキュリティヘッダーは `public/_headers` が元データ。`_worker.js` も同じ内容を API の応答に付ける

## 公開前にやること

- [ ] `src/domain/foods.ts` の栄養値を、日本食品標準成分表（八訂）の公式データと照合する
- [ ] Cloudflare Pages に Workers AI のバインディング `AI` を追加し、プレビューで献立が作れるか確かめる
- [ ] (有料の事業者に切り替える場合) 月額の利用上限を設定する
- [x] プライバシーポリシーと利用規約を用意する (`src/content/legal.ts`、設定と最初の画面から開ける)
- [ ] `src/config.ts` の運営者名 `operator` と問い合わせ先 `contact` を本物に差し替える
- AI 事業者を切り替えたら、プライバシーポリシーの「2. 献立を作るときに送る情報」も書き直す
