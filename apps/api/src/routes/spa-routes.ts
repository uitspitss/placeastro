import { Hono } from 'hono';
import type { HonoEnv } from '../orpc';

/**
 * web のビルド成果物はアセットとして `/docs/` 配下に置かれ、一致するパスは
 * Worker を通らずに配信される。ここに来るのは一致しなかったものだけなので、
 * SPA のルート（拡張子の無いパス）にだけ index.html を返す。
 * 拡張子付きは、デプロイ前の古いチャンクなどを HTML で返さないよう 404 にする。
 */
export const spaRoutes = new Hono<HonoEnv>();

spaRoutes.get('/', (c) => c.redirect('/docs/'));

spaRoutes.get('/docs/*', async (c) => {
  const lastSegment = c.req.path.split('/').pop() ?? '';
  if (lastSegment.includes('.')) {
    return c.notFound();
  }
  // 受信リクエストを init に渡すと redirect: manual が引き継がれ、
  // アセットの auto-trailing-slash の 307 がそのまま返る
  return c.env.ASSETS.fetch(new Request(new URL('/docs/', c.req.url)));
});
