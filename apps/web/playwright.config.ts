import { defineConfig, devices } from '@playwright/test';
import {
  API_DIR,
  E2E_APP_BASE,
  E2E_BASE_URL,
  E2E_PERSIST_TO,
  E2E_PORT,
  E2E_STORAGE_STATE,
} from './e2e/env';

export default defineConfig({
  // Vitest の include（src 配下）と食い合わないよう E2E は e2e/ に隔離する
  testDir: './e2e',

  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,

  // 全テストが同じ D1（1つの SQLite ファイル）を見るので直列に走らせる。
  // 並列にすると一覧の件数を見るテストが他のテストの書き込みで落ちる。
  workers: 1,

  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list']],

  use: {
    baseURL: E2E_BASE_URL,
    // 失敗して再実行したときだけ trace を残す。常時 on はディスクを食う
    trace: 'on-first-retry',
  },

  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: E2E_STORAGE_STATE,
      },
      dependencies: ['setup'],
    },
  ],

  // 本番と同じく、api の Worker が API と SPA（web のビルド成果物）を1つのポートで配る
  webServer: {
    // web は dev サーバーではなくビルド成果物を配る。`vite dev` はオンデマンド
    // コンパイルの待ちが「要素が見つからない」として現れて原因が分からなくなる。
    // 開発用の .wrangler/state ではなく E2E 専用の state を見る。
    // CORS_ORIGIN / BETTER_AUTH_URL は wrangler.jsonc で 3000 番固定なので、
    // ここで E2E の URL に上書きする。CORS_ORIGIN は better-auth の
    // trustedOrigins になるので、ずれるとサインアップが弾かれる
    // （BETTER_AUTH_URL は現状コードから読んでいないが、dev の
    //  scripts/setup-portless-env.sh と同じく web の URL に揃えておく）
    command: [
      'pnpm run build &&',
      `cd ${API_DIR} &&`,
      'pnpm exec wrangler dev --local',
      `--port ${E2E_PORT}`,
      `--persist-to ${E2E_PERSIST_TO}`,
      `--var CORS_ORIGIN:${E2E_BASE_URL}`,
      `--var BETTER_AUTH_URL:${E2E_BASE_URL}`,
    ].join(' '),
    url: `${E2E_BASE_URL}${E2E_APP_BASE}/`,
    env: {
      // .env.production が VITE_API_URL に本番 URL を入れていることがあるので必ず潰す
      // （Vite は .env ファイルより process.env の VITE_* を優先する）。
      // 空にすると auth-client も oRPC も同一オリジンへ出す
      VITE_API_URL: '',
    },
    // 使い回さない。db:e2e:prepare が --persist-to のディレクトリごと作り直すので、
    // 前回のサーバーが生き残っていると消えた SQLite を掴んだまま動き続ける
    reuseExistingServer: false,
    // 既定の "ignore" だとサーバー側のエラーが完全に握り潰される
    stdout: 'pipe',
    // build を含むので長めに取る
    timeout: 240_000,
  },
});
