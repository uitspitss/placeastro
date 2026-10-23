# 開発ルール

<!-- intent-skills:start -->
## TanStack Router のスキル

- 対象は `apps/web` のルーティング（ルート定義・loader・ナビゲーション・認可ガード・コード分割）だけ
- 該当する作業では、変更前に `pnpm exec intent list` で一覧を見て
  `pnpm exec intent load <package>#<skill>` で読み込む
- Intent が使えないときは代わりを取ってこず、依存が無いことを報告する
<!-- intent-skills:end -->

## コード変更後の検証

コードを変更したら、以下を実行してエラーがないことを確認する:

- `nr lint` (turbo 経由で全パッケージの biome check)
- `nr typecheck` (turbo 経由で全パッケージの tsc --noEmit)

## 開発サーバー

- `nr dev` で全アプリを同時起動
- Codex から実行する場合は `nlx turbo run dev --ui=stream` を使う

## エージェント用スキル

- 第三者のスキルは `skills-lock.json` で管理し、本体はコミットしない
- clone 後に `bash scripts/restore-skills.sh` で復元する
- **`skills-lock.json` は版を固定しない。** `experimental_install` は commit を指定できず
  `computedHash` も照合しないので、復元のたびに上流の最新が入る
- worktrunk のワークツリーには pre-start の `wt step copy-ignored` で
  メインのワークツリーからコピーされる（対象は `.worktreeinclude`）

## モノレポ構成

- `apps/web` - Vite + React フロントエンド
- `apps/api` - Hono + oRPC + Drizzle API サーバー (Cloudflare Workers)
- `packages/database` - Drizzle ORM + D1 スキーマ・マイグレーション
- `packages/shared` - 共有型・ユーティリティ (Zod スキーマ)
- `packages/ui` - 共有 UI コンポーネント (shadcn/ui パターン)

## ファイル命名規則

- kebab-case を使用する (例: `my-component.tsx`, `use-auth.ts`)
- PascalCase は使わない

## API アーキテクチャ

- oRPC を使用した型安全な RPC
- `routers/` → oRPC ルーター定義
- `routes/` → HTTP ルート（画像プロキシ等）
- `services/` → ビジネスロジック・DB クエリ
- `schema/` → Zod スキーマ（入出力バリデーション）
- `lib/` → 共通ユーティリティ（auth, db, s3）
- DI は関数引数で行う（DI コンテナは使わない）

## テスト

- TDD（テスト駆動開発）で実装する
- テストを先に書き、実装はテストが通るように行う
- services のテストでは repository をモックして単体テストする

## Storybook

- `apps/web/.storybook` に1つだけ置き、`packages/ui` のストーリーもここから拾う
- ストーリーは対象と同じ場所に置く（`foo.tsx` の隣に `foo.stories.tsx`）
- `nr storybook` で dev サーバー、`nr build-storybook` で静的ビルド
- `nr test` は unit と storybook の2プロジェクトを回す
  （`nr test:unit` / `nr test:storybook` で個別実行）
- `play` は「描画結果だけでは分からないこと」にだけ書く。
  インタラクション・aria 属性・CSS 由来の状態・非同期表示
- AI が書いたストーリーには `tags: ['ai-generated']` を付ける
- **`@/lib/client` に手続きを足したら `apps/web/src/lib/__mocks__/client.js`
  にも足す。** ストーリーは実 API を叩かないよう `.storybook/main.ts` の
  `mockModules` プラグインでこのモックへ差し替えている
- ストーリーからしか使わない依存を足したら `.storybook/main.ts` の
  `optimizeDepsInclude` に加える。入れないとテスト中のリロードでテストが落ちる

## E2E (Playwright)

- `apps/web/e2e` に置き、`apps/web/playwright.config.ts` から回す
- 命名は unit が `*.test.ts`、E2E が `*.spec.ts`。Vitest と Playwright が
  同じファイルを取り合わないよう、ディレクトリと拡張子の両方で分けている
- `apps/web` で `nr test:e2e`（前段で `db:e2e:prepare` が走る）。UI は `nr test:e2e:ui`。
  **turbo タスクにも `nr test` にもルートの scripts にも足さない** —
  サーバー起動と DB の状態に依存するのでキャッシュしてはいけない
- `webServer` は2本。API は `wrangler dev`、web は `vite build && vite preview`。
  dev サーバーを使わないのは、オンデマンドコンパイルの待ちが
  「要素が見つからない」として現れて原因が分からなくなるため
- ポートは web 3100 / API 3101。開発サーバーとずらして、
  `nr dev` を上げたまま回しても開発用 D1 を見に行かないようにしている
- **D1 は `--persist-to .wrangler/e2e-state` で開発用の `.wrangler/state` と分ける。**
  `e2e/prepare-db.ts` が毎回このディレクトリを捨てて migration と seed を流し直す
- migration/seed は Playwright の**外**（`test:e2e` の前段）で流す。
  setup project も globalSetup も `webServer` 起動より後なので間に合わない
- 認証は `e2e/auth.setup.ts` が better-auth の API を直接叩き、
  `e2e/.auth/user.json` に storageState を保存する（`/sign-up` は画面として閉じているため）
- E2E に書くのは「サーバー・認証・DB を貫く経路」だけ。
  表示のバリエーションは Storybook、分岐網羅は unit に置く

## パッケージ間の依存関係

- `@placeastro/shared` は `apps/web` と `apps/api` の両方から参照可能
- `@placeastro/database` は `apps/api` と `apps/web` から参照可能
- `@placeastro/ui` は `apps/web` から参照可能
- `@placeastro/api` の型は `apps/web` から `import type` でのみ参照する

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
