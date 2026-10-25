#!/usr/bin/env bash
# design-sync の変換前に走らせる。ds-package の .d.ts を生成する
set -euo pipefail
cd "$(dirname "$0")/.."
# 変換ツールが @types/react を ds-package から辿れるようにする
ln -sfn ../../apps/web/node_modules .design-sync/ds-package/node_modules
rm -rf .design-sync/ds-package/types
packages/ui/node_modules/.bin/tsc -p .design-sync/ds-package/tsconfig.json
