import { describe, expect, it, vi } from 'vitest';
import app from '../index';

function setup() {
  const assetsFetch = vi.fn(
    async (_input: RequestInfo | URL) => new Response('INDEX'),
  );
  const env = { ASSETS: { fetch: assetsFetch } } as unknown as Cloudflare.Env;
  const request = (path: string, init?: RequestInit) =>
    app.request(`http://localhost${path}`, init, env);
  return { assetsFetch, request };
}

function fetchedRequest(assetsFetch: ReturnType<typeof setup>['assetsFetch']) {
  const [input] = assetsFetch.mock.calls[0];
  return input instanceof Request ? input : new Request(input);
}

describe('SPA のルーティング', () => {
  it('/ は /docs/ にリダイレクトする', async () => {
    const { request } = setup();
    const res = await request('/');
    expect(res.status).toBe(302);
    expect(res.headers.get('Location')).toBe('/docs/');
  });

  it.each(['/docs/login', '/docs/a/b', '/docs/x/info'])(
    '%s には index.html を返す',
    async (path) => {
      const { assetsFetch, request } = setup();
      const res = await request(path);
      expect(res.status).toBe(200);
      expect(await res.text()).toBe('INDEX');
      expect(new URL(fetchedRequest(assetsFetch).url).pathname).toBe('/docs/');
    },
  );

  // 受信リクエストの redirect は manual なので、引き継ぐとアセットの
  // auto-trailing-slash の 307 がそのまま返ってしまう
  it('受信リクエストを引き継がずに取りに行く', async () => {
    const { assetsFetch, request } = setup();
    await request('/docs/login', { redirect: 'manual' });
    const fetched = fetchedRequest(assetsFetch);
    expect(fetched.method).toBe('GET');
    expect(fetched.redirect).toBe('follow');
  });

  it('拡張子付きのパスは index.html にせず 404 にする', async () => {
    const { assetsFetch, request } = setup();
    const res = await request('/docs/assets/old-hash.js');
    expect(res.status).toBe(404);
    expect(assetsFetch).not.toHaveBeenCalled();
  });

  it('HEAD にも応答する', async () => {
    const { request } = setup();
    const res = await request('/docs/login', { method: 'HEAD' });
    expect(res.status).toBe(200);
  });

  it('GET/HEAD 以外は扱わない', async () => {
    const { assetsFetch, request } = setup();
    const res = await request('/docs/login', { method: 'POST' });
    expect(res.status).toBe(404);
    expect(assetsFetch).not.toHaveBeenCalled();
  });
});
