#!/usr/bin/env bash
# Slice 50: plain + bank build of one worktree (app/ unchanged; build env only).
#   bash verifier/tools/build-dists.sh <worktree> <out-dir>   → <out>/dist (plain), <out>/bank-build, build-*.log, build.exit
# Bank build = VITE_SUPABASE_URL=https://bank-mock.supabase.co + the local-only publishable key (routed to the stand-in).
set -uo pipefail
WT=${1:?worktree}; OUT=${2:?out}; mkdir -p "$OUT"
cd "$WT/app" || exit 1
[ -d node_modules ] || npm ci --no-audit --no-fund >"$OUT/npm-ci.log" 2>&1
env -u VITE_SUPABASE_URL -u VITE_SUPABASE_PUBLISHABLE_KEY npx vite build --outDir "$OUT/dist" --emptyOutDir >"$OUT/build-plain.log" 2>&1; e1=$?
VITE_SUPABASE_URL=https://bank-mock.supabase.co VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_local_s32 \
  npx vite build --outDir "$OUT/bank-build" --emptyOutDir >"$OUT/build-bank.log" 2>&1; e2=$?
echo "$e1 $e2" > "$OUT/build.exit"
# bundle.txt: gzip -9 bytes per chunk + total (plain build).
( cd "$OUT/dist" && for f in $(find assets -type f \( -name '*.js' -o -name '*.css' \) | sort); do echo "$(gzip -9 -c "$f" | wc -c) $f"; done ) > "$OUT/bundle.txt"
awk '{s+=$1} END {print s" TOTAL"}' "$OUT/bundle.txt" >> "$OUT/bundle.txt"
[ "$e1 $e2" = "0 0" ]
