import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * portless 使用時は `portless get api` で API の URL を取得する。
 * portless 未使用時は localhost:8080 にフォールバック。
 */
function resolveApiTarget(): string {
  if (process.env.PORT) {
    try {
      return execFileSync('portless', ['get', 'api'], {
        encoding: 'utf-8',
      }).trim();
    } catch {}
  }
  return 'http://localhost:8080';
}

const apiTarget = resolveApiTarget();

/**
 * 本番は api の Worker が SPA もアセットとして配るので同一オリジンになる。
 * vite dev はプロキシでそれを再現する。
 */
const apiProxy = {
  '/api': { target: apiTarget, changeOrigin: true, secure: false },
  '/m': { target: apiTarget, changeOrigin: true, secure: false },
  '/random': { target: apiTarget, changeOrigin: true, secure: false },
};

export default defineConfig({
  base: '/docs/',
  plugins: [
    TanStackRouterVite(),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: apiProxy,
  },
  build: {
    // api の Worker がこのディレクトリをアセットとして配る。
    // `base` と揃えて、ファイルのパスと URL を一致させる
    outDir: 'dist/docs',
    sourcemap: true,
  },
});
