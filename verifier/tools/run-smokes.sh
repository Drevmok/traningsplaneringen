#!/usr/bin/env bash
# Slice 50: run smoke scripts against built dists, one line per script (same format as slice-49-checks/loop-*.txt).
#   TPV_ROOT=<worktree> TPV_PLAIN=<dist> TPV_BANK=<bank-build> [TPV_MAIN=<main dist>] TPV_OUT=<dir> \
#     bash verifier/tools/run-smokes.sh <script> [<script> …]        (script = basename without .mjs, or "all")
# - Previews: own static servers on TPV_PORT_BASE+81 (plain), +80 (bank = GoTrue site URL), +83 (main).
# - Scripts that need the stand-in ("standin" in smoke-map.json) get their OWN database bank_<run> from the
#   template (db-new.sh → start → users → script → db-drop.sh). So s33 never shares GoTrue with s32.
# - Every request is logged by pw-netlog.mjs to $TPV_OUT/netlog/<script>.log; the live project host is aborted.
# Reads the main cache, never writes it (only doctor.sh does).
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; REPO="$(cd "$HERE/../.." && pwd)"
ROOT=${TPV_ROOT:-$REPO}; OUT=${TPV_OUT:?TPV_OUT}; PLAIN=${TPV_PLAIN:?TPV_PLAIN}; BANK=${TPV_BANK:?TPV_BANK}; MAIN=${TPV_MAIN:-$PLAIN}
PB=${TPV_PORT_BASE:-57800}; TAG=${TPV_RUN_TAG:-r$PB}
MAP="$REPO/verifier/smoke-map.json"
mkdir -p "$OUT/logs" "$OUT/netlog" "$OUT/shots"
if [ "${1:-}" = all ]; then set -- $(node -e 'console.log(Object.keys(require(process.argv[1])).join(" "))' "$MAP"); fi
P=http://127.0.0.1:$((PB+81))/traningsplaneringen/; B=http://127.0.0.1:$((PB+80))/traningsplaneringen/; M=http://127.0.0.1:$((PB+83))/traningsplaneringen/
SPIDS=()
serve() { TPV_OWNER="$OUT" node "$HERE/serve-dist.mjs" "$1" "$2" >"$OUT/serve-$2.log" 2>&1 & SPIDS+=($!); }
serve "$PLAIN" $((PB+81)); serve "$BANK" $((PB+80)); serve "$MAIN" $((PB+83))
trap 'kill "${SPIDS[@]}" 2>/dev/null' EXIT
for i in $(seq 1 40); do curl -sf -o /dev/null "$P" && curl -sf -o /dev/null "$B" && curl -sf -o /dev/null "$M" && break; sleep 0.25; done
export PATH="$HERE/shim:$PATH"
export PW_CORE="$HERE/pw-netlog.mjs" SMOKE_ROOT=$ROOT S32_OFF_URL=$P S32_ON_URL=$B S33_OFF_URL=$P S33_ON_URL=$B S34_URL=$P \
  S35_OFF=$P S35_ON=$B S36_OFF_URL=$P S36_ON_URL=$B S37_URL=$B S38_URL=$P S38_ROOT=$ROOT S39_URL=$P S39_ROOT=$ROOT \
  S47_SEED=$ROOT/tools/bank/out/bank-seed.json
for n in 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55; do export S${n}_BR=$P S${n}_MAIN=$M S${n}_ROOT=$ROOT S${n}_FIX=$P S${n}_SHOTS=$OUT/shots; done
export S46_BR=$B S47_BR=$B S47_MAIN=$M   # bank-env builds (see smoke-map "build")
cd "$ROOT"
for s in "$@"; do
  f="$ROOT/verifier/$s.mjs"; [ -f "$f" ] || { echo "$s exit=127 missing $f"; continue; }
  standin=$(node -e 'const m=require(process.argv[1]);console.log((m[process.argv[2]]||{}).standin||"")' "$MAP" "$s")
  run=""
  if [ -n "$standin" ]; then
    run="${TAG}_$(echo "$s" | tr -c 'a-z0-9\n' '_' | cut -c1-30)"
    bash "$HERE/db-drop.sh" "$run" >/dev/null 2>&1 || true
    envs=$(S32_GATEWAY_PORT=$((PB+70)) S32_POSTGREST_PORT=$((PB+72)) S32_GOTRUE_PORT=$((PB+73)) S32_SMTP_PORT=$((PB+75)) S32_PREVIEW_PORT=$((PB+80)) \
      S32_MAGIC_LINK_TEMPLATE=$([ "$standin" = s33 ] && echo "$REPO/verifier/slice-33-local/magic-link.html") bash "$HERE/db-new.sh" "$run") || { echo "$s exit=125 db-new failed"; continue; }
    ( eval "$envs"; bash "$REPO/verifier/slice-32-local/start.sh" && bash "$REPO/verifier/slice-32-local/users.sh"
      if [ "$standin" = s36 ]; then Q="psql -h 127.0.0.1 -p $S32_PG_PORT -U postgres -d $S32_DB -v ON_ERROR_STOP=1 -qAt"
        $Q -f "$REPO/slice-36/sql/36-01-table.sql" && $Q -f "$REPO/slice-36/sql/36-02-rls-grants.sql" && $Q -c "notify pgrst, 'reload schema';"; fi
    ) >"$OUT/logs/$s.standin.log" 2>&1 || { echo "$s exit=124 stand-in failed (logs/$s.standin.log)"; bash "$HERE/db-drop.sh" "$run" >/dev/null 2>&1; continue; }
    eval "$envs"
  fi
  t0=$(date +%s)
  TPV_LOG_DIR="$OUT/logs" NETLOG="$OUT/netlog/$s.log" timeout "${TPV_SMOKE_TIMEOUT:-400}" node "$f" >"$OUT/logs/$s.txt" 2>&1; e=$?
  echo "$s exit=$e $(tail -1 "$OUT/logs/$s.txt") ($(( $(date +%s)-t0 )) s)"
  [ -n "$run" ] && { [ -f "$S32_DIR/gotrue.log" ] && cp "$S32_DIR/gotrue.log" "$OUT/logs/$s.gotrue.log"; bash "$HERE/db-drop.sh" "$run" >/dev/null 2>&1; unset S32_DIR S32_PG_DIR S32_DB; }
done
live=$(cat "$OUT"/netlog/*.log 2>/dev/null | grep -c fhzqwbdlejzohetdoluw); total=$(cat "$OUT"/netlog/*.log 2>/dev/null | wc -l)
echo "netlog: $total requests, $live to the live project host (all aborted)"
