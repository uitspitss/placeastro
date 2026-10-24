import { expect, test as setup } from '@playwright/test';
import { E2E_STORAGE_STATE, E2E_USER } from './env';

/**
 * 1回だけ認証してセッションをファイルに保存し、全テストがそれを読む。
 *
 * UI からサインアップしないのは、`/sign-up` が beforeLoad で `/` に飛ばされる
 * （＝画面としては閉じている）ため。better-auth の API を直接叩く。
 * API と SPA は同じオリジンなので、Cookie のドメインは
 * baseURL のホスト（localhost:3100）になり、そのままブラウザに載せられる。
 */
setup('サインアップしてセッションを保存する', async ({ request }) => {
  const res = await request.post('/api/auth/sign-up/email', {
    data: E2E_USER,
  });
  expect(res.ok(), await res.text()).toBeTruthy();

  await request.storageState({ path: E2E_STORAGE_STATE });
});
