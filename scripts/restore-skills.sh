#!/bin/bash
# skills-lock.json のスキルを復元し、Claude Code から見えるようにする
# clone 直後に手動で実行（ワークツリーには wt step copy-ignored でコピーされる）
set -euo pipefail
shopt -s nullglob

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$(dirname "$SCRIPT_DIR")"

# experimental_install は -a を無視して .agents/skills にしか置かない
nlx skills@1.7.4 experimental_install </dev/null

mkdir -p .claude/skills
for dir in .agents/skills/*/; do
  name="$(basename "$dir")"
  link=".claude/skills/$name"
  if [ -e "$link" ] && [ ! -L "$link" ]; then
    echo "skip: $link は実ディレクトリなのでリンクを張らない" >&2
    continue
  fi
  ln -sfn "../../.agents/skills/$name" "$link"
done

# lock から外したスキルの .agents/skills が消された後のリンクを掃除する
for link in .claude/skills/*; do
  if [ -L "$link" ] && [ ! -e "$link" ]; then
    rm "$link"
  fi
done
