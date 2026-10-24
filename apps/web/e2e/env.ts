/**
 * E2E 専用の設定値。すべてローカル固定の値なので平文で持ってよい。
 *
 * `.env.e2e` のようなファイルは作らないこと。lefthook の encrypt-env が
 * `.env*` を拾って dotenvx で暗号化し、復号キーは gitignore なので
 * CI では `"encrypted:..."` がそのまま値になる。
 */

/**
 * 開発サーバーとポートをずらす。
 * 揃えてしまうと `nr dev` を上げたまま E2E を回したときに
 * 開発用の D1 に対してテストが走り、状態を分けた意味が消える。
 */
// ?? ではなく || 。空文字で渡ってきたときも既定値に落とす
// （?? だと `http://localhost:` という壊れた URL になる）
export const E2E_PORT = process.env.E2E_PORT || '3100';

/** API と SPA を同じ Worker が配るので、本番と同じく1つのオリジンになる */
export const E2E_BASE_URL = `http://localhost:${E2E_PORT}`;

/** vite.config.ts の `base`。SPA はこの配下に配信される */
export const E2E_APP_BASE = '/docs';

/** playwright.config.ts / package.json の scripts から見た apps/api */
export const API_DIR = '../api';

/**
 * apps/api から見た miniflare の状態ディレクトリ。
 * 開発用の `.wrangler/state` とは別にして、E2E の書き込みで開発用の D1 を汚さない。
 * D1 はコンテナではないので、分けるのはディレクトリだけで足りる。
 */
export const E2E_PERSIST_TO = '.wrangler/e2e-state';

/** apps/api から見た、E2E の D1 に流す SQL。順序に意味がある */
export const E2E_SQL_FILES = [
  '../../packages/database/drizzle/0000_init.sql',
  '../../packages/database/drizzle/0001_auth.sql',
  '../../packages/database/drizzle/seed.sql',
];

/**
 * auth.setup.ts が作るユーザー。
 * prepare-db.ts が毎回 D1 を作り直すので、常に「未登録」から始まる。
 */
export const E2E_USER = {
  name: 'E2E User',
  email: 'e2e@example.test',
  password: 'e2e-password-not-used-for-anything-real',
};

/** apps/web から見た storageState の保存先。gitignore 済み */
export const E2E_STORAGE_STATE = 'e2e/.auth/user.json';
