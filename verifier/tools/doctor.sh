#!/usr/bin/env bash
# Slice 50 (B1): Doctor. One line per check: PASS … or BLOCKED <what> — kör <cmd>. Exit 1 on any BLOCKED.
# Doctor never installs anything (that is install-once.sh). It is the ONLY writer of /home/box/tp-verify/{standin,main}:
# it rebuilds a stale template database and builds the main cache once per origin/main SHA. Builder/Verifier only read.
#   TPV_BANK_SEED   seed for the template (default tools/bank/out/bank-seed.sql)   AC4
#   TPV_PORT_BASE   port base for run-smokes (default 57800)
#   TPV_DIST        optional: also check this dist (HTTP 200 + base) — e.g. the branch build
#   TPV_NO_MAIN=1   skip the main cache (tools/template only)
set -uo pipefail
for v in $(compgen -e | grep -E "^S3[0-9]_"); do unset "$v"; done   # a leaked run env (db-new eval) must not redirect the template
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"; REPO="$(cd "$HERE/../.." && pwd)"
TPV_HOME="${TPV_HOME:-/home/box/tp-verify}"; ST="$TPV_HOME/standin"; BIN="$TPV_HOME/bin"
SEED="${TPV_BANK_SEED:-$REPO/tools/bank/out/bank-seed.sql}"; PB="${TPV_PORT_BASE:-57800}"
T0=$(date +%s%N); blocked=0
pass() { echo "PASS $*"; }
block() { echo "BLOCKED $1 — kör $2"; blocked=1; }
INSTALL="bash verifier/tools/install-once.sh"
PGBIN="$(ls -d /usr/lib/postgresql/17/bin 2>/dev/null)"

# 1. tools
if [ -x "$PGBIN/initdb" ]; then pass "Postgres 17 ($("$PGBIN/postgres" --version | awk '{print $3}'))"; else block "Postgres 17 (initdb)" "$INSTALL"; fi
if [ -x "$BIN/gotrue/auth" ]; then pass "GoTrue $(cat "$BIN/gotrue/VERSION" 2>/dev/null || echo '?')"; else block "GoTrue ($BIN/gotrue/auth)" "$INSTALL"; fi
if [ -x "$BIN/postgrest" ]; then pass "PostgREST $("$BIN/postgrest" --version 2>/dev/null | head -1 | awk '{print $2}')"; else block "PostgREST ($BIN/postgrest)" "$INSTALL"; fi
. "$HERE/lib.sh"   # Slice 51 (F1): pw_ok shared with install-once
if pw_ok; then pass "Playwright Chromium + /usr/bin/google-chrome"; else block "Playwright Chromium" "$INSTALL"; fi
[ -f "$SEED" ] || block "bank-seed ($SEED)" "node tools/bank/build.mjs (eller sätt TPV_BANK_SEED)"
[ $blocked = 0 ] || { echo "Doctor: BLOCKED ($(( ($(date +%s%N) - T0) / 1000000 )) ms)"; exit 1; }

# 2. template database (sha256 of roles.sql, schema-31, seed, schema-32 — same formula as setup.sh --template)
S32="$REPO/verifier/slice-32-local"
want=$(sha256sum "$S32/roles.sql" "$REPO/slice-31/content/schema-31.sql" "$SEED" "${S32_SCHEMA32:-$REPO/slice-31/content/schema-32.sql}" | awk '{print $1}' | sha256sum | awk '{print $1}')
have=$(cat "$ST/template.sha256" 2>/dev/null || true)
if [ "$want" != "$have" ]; then
  if ls "$ST/runs"/*/ >/dev/null 2>&1; then block "malldatabas inaktuell men körningar pågår ($(ls "$ST/runs" | tr '\n' ' '))" "bash verifier/tools/db-drop.sh <run> för varje, sedan Doctor igen"
  else
    echo "INFO malldatabas inaktuell (${have:0:12}… → ${want:0:12}…), bygger om"
    [ -f "$ST/pg/postmaster.pid" ] && "$PGBIN/pg_ctl" -D "$ST/pg" -m fast -w stop >/dev/null 2>&1
    if TPV_BANK_SEED="$SEED" bash "$S32/setup.sh" --template > "$TPV_HOME/template-build.log" 2>&1; then pass "malldatabas ombyggd sha256=$want"
    else block "malldatabas (se $TPV_HOME/template-build.log)" "TPV_BANK_SEED=$SEED bash verifier/slice-32-local/setup.sh --template"; fi
  fi
else pass "malldatabas sha256=$want"; fi
PGP=$(node -e "console.log(require('$ST/env.json').pgPort)" 2>/dev/null || echo 54741)
if ! "$PGBIN/pg_isready" -q -h 127.0.0.1 -p "$PGP"; then "$PGBIN/pg_ctl" -D "$ST/pg" -l "$ST/pg.log" -w start >/dev/null 2>&1; fi
if "$PGBIN/psql" -h 127.0.0.1 -p "$PGP" -U postgres -tAc "select 1 from pg_database where datname='bank_template' and datistemplate" postgres 2>/dev/null | grep -q 1; then pass "bank_template på port $PGP"; else block "bank_template" "bash verifier/slice-32-local/setup.sh --template"; fi

# 3. ports (run-smokes: +80 bank/preview, +81 plain, +83 main; db-new defaults 54740/42/43/45)
busy=""; for p in $((PB+80)) $((PB+81)) $((PB+83)) 54740 54742 54743 54745; do ss -ltn "sport = :$p" | grep -q LISTEN && busy="$busy $p"; done
if [ -z "$busy" ]; then pass "portar lediga ($((PB+80))–$((PB+83)), 54740–54745)"; else block "portar upptagna:$busy" "bash verifier/tools/db-drop.sh <run> eller TPV_PORT_BASE=<annan>"; fi

http_check() { # <label> <dist>
  local port=$((PB+90)); node "$HERE/serve-dist.mjs" "$2" $port >/dev/null 2>&1 & local pid=$!
  for _ in $(seq 50); do curl -s -o /dev/null "http://127.0.0.1:$port/" && break; sleep 0.1; done
  local code; code=$(curl -s -o /tmp/tpv-doctor.html -w '%{http_code}' "http://127.0.0.1:$port/traningsplaneringen/")
  kill $pid 2>/dev/null; wait $pid 2>/dev/null
  if [ "$code" = 200 ] && grep -q 'src="/traningsplaneringen/assets/' /tmp/tpv-doctor.html; then pass "$1: HTTP 200 på /traningsplaneringen/, base /traningsplaneringen/"
  else block "$1: HTTP $code / fel base" "bash verifier/tools/build-dists.sh <worktree> <out>"; fi
}

# 4. main cache, once per origin/main SHA, under flock
if [ "${TPV_NO_MAIN:-0}" != 1 ]; then
  git -C "$REPO" fetch -q origin main 2>/dev/null || echo "INFO git fetch misslyckades; använder lokal origin/main"
  SHA=$(git -C "$REPO" rev-parse origin/main); MC="$TPV_HOME/main/$SHA"; mkdir -p "$TPV_HOME/main"
  if [ -f "$MC/.complete" ]; then pass "main-cache ${SHA:0:7} finns (läses, byggs inte)"
  else
    exec 9>"$TPV_HOME/main/.lock"; flock 9
    if [ -f "$MC/.complete" ]; then pass "main-cache ${SHA:0:7} byggd av annan agent"
    else
      echo "INFO main-cache ${SHA:0:7} saknas, bygger (en gång per SHA)"
      WT="$MC/wt"; [ -d "$WT" ] && git -C "$REPO" worktree remove --force "$WT" 2>/dev/null; rm -rf "$MC"; mkdir -p "$MC"
      git -C "$REPO" worktree add -q --detach "$WT" "$SHA" &&
      bash "$HERE/build-dists.sh" "$WT" "$MC" > "$MC/build.log" 2>&1
      if [ "$(cat "$MC/build.exit" 2>/dev/null)" = "0 0" ]; then
        (cd "$WT/app" && bun test src > "$MC/test.txt" 2>&1; echo "exit=$?" >> "$MC/test.txt"   # Slice 51 F1: app tests only
         (cd "$WT" && bun test tools/bank) > "$MC/test-bank.txt" 2>&1; echo "exit=$?" >> "$MC/test-bank.txt"
         npx tsc -b > "$MC/tsc.txt" 2>&1; echo "exit=$?" >> "$MC/tsc.txt"
         npx oxlint > "$MC/lint.txt" 2>&1; echo "exit=$?" >> "$MC/lint.txt")
        # smoke baseline: main scripts against main dists (P = B = M = main). Slice 51 D1: compared with the previous
        # main cache's baseline when one exists (SAMMA/NY FAIL/LAGAD lines). A baseline may exit 1 (kända fel) — not BLOCKED.
        PREVB=$(ls -t "$TPV_HOME"/main/*/smoke-baseline.txt 2>/dev/null | grep -v "^$MC/" | head -1)
        TPV_ROOT="$WT" TPV_PLAIN="$MC/dist" TPV_BANK="$MC/bank-build" TPV_MAIN="$MC/dist" TPV_OUT="$MC/smoke-out" TPV_PORT_BASE="$PB" TPV_RUN_TAG=main \
          bash "$MC/wt/verifier/tools/run-smokes.sh" ${PREVB:+--baseline "$PREVB"} all > "$MC/smoke-baseline.txt" 2>&1   # Slice 52 F1: main's own runner, not this checkout's
        echo "$SHA $(date -Iseconds)" > "$MC/.complete"; pass "main-cache ${SHA:0:7} byggd ($MC)"
      else block "main-bygget (se $MC/build.log)" "bash verifier/tools/build-dists.sh $WT $MC"; fi
    fi
    flock -u 9
  fi
  # Slice 52 F1: the baseline must be usable (lib.sh baseline_ok against main's map); else rename it and BLOCK.
  if [ -f "$MC/.complete" ] && [ -f "$MC/smoke-baseline.txt" ]; then
    if baseline_ok "$MC/smoke-baseline.txt" "$MC/wt/verifier/smoke-map.json"; then pass "smoke-baseline ${SHA:0:7} giltig"
    else mv "$MC/smoke-baseline.txt" "$MC/smoke-baseline.invalid.txt"; block "smoke-baseline ${SHA:0:7} ogiltig → smoke-baseline.invalid.txt" "rm -rf $MC && bash verifier/tools/doctor.sh"; fi
  elif [ -f "$MC/smoke-baseline.invalid.txt" ]; then block "smoke-baseline ${SHA:0:7} ogiltig (smoke-baseline.invalid.txt)" "rm -rf $MC && bash verifier/tools/doctor.sh"; fi
  [ -f "$MC/.complete" ] && { [ "$(cat "$MC/build.exit")" = "0 0" ] && pass "main build exit 0, $(grep TOTAL "$MC/bundle.txt")" ; http_check "main-dist" "$MC/dist"; }
fi
[ -n "${TPV_DIST:-}" ] && http_check "TPV_DIST" "$TPV_DIST"
echo "Doctor: $([ $blocked = 0 ] && echo PASS || echo BLOCKED) ($(( ($(date +%s%N) - T0) / 1000000 )) ms)"
exit $blocked
