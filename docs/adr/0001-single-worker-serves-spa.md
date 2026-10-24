# api の Worker が SPA も配る

`placeastro-api` と `placeastro-web` の2つの Worker を api の1つにまとめ、web のビルド成果物（`apps/web/dist/docs`）を静的アセットとして持たせる。アセットの `not_found_handling` は `single-page-application` ではなく `none` にし、`/docs` 配下の SPA フォールバックは Hono 側（画像ルートより前）で処理する。SPA モードにすると、アセットに一致しないナビゲーションがすべて `index.html` に吸われ、`/api/*`・`/random`・`/:catalogue/:catalogueNumber` に届かなくなるため。

## Considered Options

- **2つの Worker のまま（Cloudflare のルートで `/docs*` を web に振る）**: ルート設定・デプロイ・E2E のサーバーがそれぞれ2つになり、ローカルでは proxy で同一オリジンを再現する必要があった。
- **`run_worker_first: true` で全リクエストを Worker に通す**: `/docs/assets/*` まで Worker の実行回数と課金に入るので見送った。

## Consequences

- 出力先を `dist/docs` にして、アセットのパスと URL を一致させている。`/docs` と `/docs/index.html` は、アセット層が `/docs/` へ 307 を返す。
- アセットに一致するパスへの GET/HEAD 以外（POST など）は、Worker を通らずにアセット層が 405 を返す。
- `assets.directory` が存在しないと `wrangler dev` も `deploy` も起動しない。そのため api の dev はディレクトリを先に作り、deploy の前には web をビルドする。
