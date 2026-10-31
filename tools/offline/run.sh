#!/usr/bin/env bash
# 오프라인 검증 실행기 — Next.js를 설치할 수 없는 환경에서 실제 소스 기준 검증을 돌린다.
# 사용: [BASE_PATH=/repo] [SITE_URL=https://user.github.io/repo] bash tools/offline/run.sh <mode> [fixture]
#   mode: preview | production | development
#   GitHub Pages 프로젝트 사이트를 모의하려면 BASE_PATH와 SITE_URL을 함께 지정
set -euo pipefail
cd "$(dirname "$0")/../.."
TOOLS=${OFFLINE_NODE_MODULES:-/opt/npm-tools/node_modules}
MODE=${1:-preview}
FIX=${2:-}
OUT=${OUT_DIR:-out}

# 1) 의존성 링크 (node_modules가 실제 설치본이면 건드리지 않음)
if [ ! -f node_modules/next/dist/server/next.js ]; then
  mkdir -p node_modules
  for p in react react-dom scheduler tailwindcss playwright playwright-core sharp @img esbuild @esbuild typescript @types; do
    [ -e "$TOOLS/$p" ] && ln -sfn "$TOOLS/$p" "node_modules/$p"
  done
  rm -rf node_modules/next && cp -r tools/offline/stubs/next node_modules/next
fi
TSX="$TOOLS/.bin/tsx --tsconfig tools/offline/tsconfig.json"

export SITE_ENV=$MODE
export NEXT_PUBLIC_BASE_PATH=${BASE_PATH:-}
[ -n "${SITE_URL:-}" ] && export SITE_URL || unset SITE_URL
[ "$FIX" = "fixture" ] && export SITE_CONFIG_FIXTURE=1 || unset SITE_CONFIG_FIXTURE
export SITE_LASTMOD=2026-10-29

echo "── guard ($MODE${FIX:+ +fixture})"
set +e; $TSX scripts/guard.ts; GUARD=$?; set -e
if [ "$MODE" = production ] && [ $GUARD -ne 0 ]; then echo "guard blocked production build (exit $GUARD)"; exit $GUARD; fi

echo "── render"
NODE_OPTIONS="--require $(pwd)/tools/offline/css-hook.cjs" $TSX tools/offline/render.tsx "$OUT"
node tools/offline/build-css.mjs "$OUT"
"$TOOLS/.bin/esbuild" tools/offline/client-entry.tsx --bundle --minify --format=iife --jsx=automatic \
  --define:process.env.NODE_ENV='"production"' --alias:@=. --outfile="$OUT/_next/static/chunks/client.js" --log-level=warning
$TSX scripts/postbuild-pages.ts "$OUT"

echo "── seo:audit"
set +e; $TSX scripts/seo-audit.ts "$OUT"; AUDIT=$?; set -e

echo "── test:routes"
set +e; SHOT_PREFIX="${MODE}${FIX:+-fixture}${BASE_PATH:+-basepath}" $TSX scripts/route-test.ts "$OUT"; ROUTES=$?; set -e

echo "── result: audit=$AUDIT routes=$ROUTES"
exit $(( AUDIT | ROUTES ))
