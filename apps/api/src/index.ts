import { onError } from '@orpc/server';
import { RPCHandler } from '@orpc/server/fetch';
import { sentry } from '@sentry/hono/cloudflare';
import { Hono } from 'hono';
import { contextStorage } from 'hono/context-storage';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { createAuth } from './lib/auth';
import type { HonoEnv } from './orpc';
import { placeImageRouter } from './routers/place-image-router';
import { imageRoutes } from './routes/image-routes';
import { spaRoutes } from './routes/spa-routes';

export const appRouter = {
  placeImages: placeImageRouter,
};

export type AppRouter = typeof appRouter;

const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error('[oRPC error]', error);
    }),
  ],
});

const app = new Hono<HonoEnv>();

// Sentry は最初のミドルウェアとして登録し、後続のミドルウェア/ハンドラの
// 未捕捉例外を捕捉しつつ、ルートパターン付きのトランザクション span を作る。
const sentryMiddleware = sentry(app, (env) => ({
  dsn: env.SENTRY_DSN,
  // エラー送信はサンプリング率に影響されない。トランザクション量が気になれば下げる。
  tracesSampleRate: 1.0,
}));

app.use('*', (c, next) => {
  if (!c.env.SENTRY_DSN) return next();
  return sentryMiddleware(c, next);
});

app.use('*', logger());
app.use('*', contextStorage());

app.use('/api/*', async (c, next) => {
  return cors({
    origin: c.env.CORS_ORIGIN,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT'],
    exposeHeaders: ['Content-Length'],
    credentials: true,
  })(c, next);
});

app.use('/api/*', async (c, next) => {
  c.set('auth', createAuth());
  return next();
});

app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  return c.get('auth').handler(c.req.raw);
});

app.use('/api/rpc/*', async (c, next) => {
  const { matched, response } = await rpcHandler.handle(c.req.raw, {
    prefix: '/api/rpc',
    context: {
      env: c.env,
      request: c.req.raw,
    },
  });

  if (matched) {
    return c.newResponse(response.body, response);
  }

  await next();
});

// imageRoutes の `/:catalogue/:catalogueNumber` が `/docs/*` にも一致するので先に置く
app.route('/', spaRoutes);
app.route('/', imageRoutes);

export default app;
