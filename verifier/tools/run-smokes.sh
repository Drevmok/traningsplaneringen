#!/usr/bin/env bash
# Slice 50: run smoke scripts against built dists, one line per script (same format as slice-49-checks/loop-*.txt).
#   TPV_ROOT=<worktree> TPV_PLAIN=<dist> TPV_BANK=<bank-build> [TPV_MAIN=<main dist>] TPV_OUT=<dir> \
#     bash verifier/tools/run-smokes.sh [--baseline <file>] <script> [<script> …]   (script = basename without .mjs, or "all")
# - Slice 51 (D1): the full log of every script is in $TPV_OUT/logs/<script>.txt. A crash (exit ≠ 0, no summary line)
#   prints «KRASCH: <first Error line>» instead of the last line. --baseline <file> (e.g. the main cache's
#   smoke-baseline.txt) adds SAMMA / NY FAIL / LAGAD per script and exits 1 on any NY FAIL:
#     NY FAIL = more FAIL or fewer PASS than the baseline line, a crash where the baseline had counts, or exit ≠ 0
#     where the baseline was exit 0 with 0 FAIL. LAGAD = fewer FAIL, or a crashed baseline now exit 0 with 0 FAIL.
#     KARANTÄN-FAIL lines (ids in smoke-map "karantan") do not count as FAIL.
# - Slice 51 (E1): every KARANTÄN-FAIL is appended to $TPV_HOME/quarantine.tsv (datum, sha, skript, id); the same id
#   in two runs of a script in a row (state in $TPV_HOME/quarantine.last/<script>) → NY FAIL.
# - Previews: own static servers on TPV_PORT_BASE+81 (plain), +80 (bank = GoTrue site URL), +83 (main).
# - Scripts that need the stand-in ("standin" in smoke-map.json) get their OWN database bank_<run> from the
#   template (db-new.sh → start → users → script → db-drop.sh). So s33 never shares GoTrue with s32.
# - Every request is logged by pw-netlog.mjs to $TPV_OUT/netlog/<script>.log; the live project host is aborted.
# - Slice 52 (D1): exit code. With --baseline: 1 only on NY FAIL (as before). Without --baseline: 1 when any script
#   exits ≠ 0 (or is missing), else 0. --baseline refuses (exit 2) a file that fails baseline_ok (lib.sh, F1).
# Reads the main cache, never writes it (only doctor.sh does).
set -uo pipefail
BASELINE=""; if [ "${1:-}" = --baseline ]; then BASELINE=${2:?--baseline <file>}; shift 2; [ -f "$BASELINE" ] || { echo "baseline $BASELINE saknas"; exit 2; }; fi
HERE="$(cd "$(dirname "$0")" && pwd)"; REPO="$(cd "$HERE/../.." && pwd)"
. "$HERE/lib.sh"
ROOT=${TPV_ROOT:-$REPO}; OUT=${TPV_OUT:?TPV_OUT}; PLAIN=${TPV_PLAIN:?TPV_PLAIN}; BANK=${TPV_BANK:?TPV_BANK}; MAIN=${TPV_MAIN:-$PLAIN}
PB=${TPV_PORT_BASE:-57800}; TAG=${TPV_RUN_TAG:-r$PB}
MAP=${SMOKE_MAP:-$REPO/verifier/smoke-map.json}   # Slice 51 E1: SMOKE_MAP = test map (also read by tools/smoke-exit.mjs)
BMAP=$(dirname "$BASELINE")/wt/verifier/smoke-map.json; [ -f "$BMAP" ] || BMAP=$MAP   # the map the baseline was made with (main cache)
[ -n "$BASELINE" ] && { baseline_ok "$BASELINE" "$BMAP" || { echo "baseline $BASELINE är ogiltig (baseline_ok, se ovan); kör Doctor för en ny main-cache"; exit 2; }; }  # Slice 52 F1
mkdir -p "$OUT/logs" "$OUT/netlog" "$OUT/shots"
if [ "${1:-}" = all ]; then set -- $(node -e 'console.log(Object.keys(require(process.argv[1])).filter((k) => k !== "karantan").join(" "))' "$MAP"); fi
TPV_HOME=${TPV_HOME:-/home/box/tp-verify}; QTSV=${TPV_QUARANTINE:-$TPV_HOME/quarantine.tsv}; QLAST="$TPV_HOME/quarantine.last"
SHA=$(git -C "$ROOT" rev-parse --short HEAD 2>/dev/null || echo '?'); NEWFAIL=0; ANYFAIL=0
# counts <line>: "pass fail" from a summary line (PASS n / FAIL m · TOTAL PASS n FAIL m · n/m pass|PASS), or "" when none.
counts() { echo "$1" | sed -nE 's/.*PASS ([0-9]+) \/ FAIL ([0-9]+).*/\1 \2/p; s/.*TOTAL PASS ([0-9]+) FAIL ([0-9]+).*/\1 \2/p; s/.*[^0-9]([0-9]+)\/([0-9]+) (pass|PASS).*/\1 \2 tot/p; s/^([0-9]+)\/([0-9]+) (pass|PASS).*/\1 \2 tot/p' | head -1 | awk '{ if ($3 == "tot") print $1, $2-$1; else print $1, $2 }'; }
compare() { # <script> <exit> <summary> <karantän-fails>
  local s=$1 e=$2 sum=$3 k=$4 bl be bc cc bp bf cp cf
  bl=$(grep -m1 "^$s exit=" "$BASELINE"); [ -z "$bl" ] && { echo "  $s: UTAN BASLINJE"; return; }
  be=$(echo "$bl" | sed -E 's/^[^ ]+ exit=([0-9]+).*/\1/'); bc=$(counts "$bl"); cc=$(counts "$sum")
  read -r bp bf <<<"${bc:-x x}"; read -r cp cf <<<"${cc:-x x}"; [ "$cf" != x ] && { cf=$((cf - k)); cp=$((cp + k)); }  # Slice 51 E1: a KARANTÄN-FAIL is neither FAIL nor a lost PASS (AC12)
  local v=SAMMA why=""
  if [ -z "$cc" ] && [ -n "$bc" ]; then v="NY FAIL"; why="kraschar (baslinjen $bp/$bf)"
  elif [ -n "$cc" ] && [ -n "$bc" ] && { [ "$cf" -gt "$bf" ] || [ "$cp" -lt "$bp" ]; }; then v="NY FAIL"; why="PASS $bp→$cp, FAIL $bf→$cf"
  elif [ "$be" = 0 ] && [ "${bf:-x}" = 0 ] && [ "$e" != 0 ]; then v="NY FAIL"; why="exit 0→$e"
  elif [ -n "$cc" ] && [ -n "$bc" ] && [ "$cf" -lt "$bf" ]; then v=LAGAD; why="FAIL $bf→$cf"
  elif [ -z "$bc" ] && [ "$e" = 0 ] && [ "${cf:-1}" = 0 ]; then v=LAGAD; why="baslinjen kraschade, nu 0 FAIL"
  elif [ -z "$bc" ]; then why="baslinjen kraschade (exit $be)"; fi
  [ "$v" = "NY FAIL" ] && NEWFAIL=1
  echo "  $s: $v${why:+ ($why)}"
}
P=http://127.0.0.1:$((PB+81))/traningsplaneringen/; B=http://127.0.0.1:$((PB+80))/traningsplaneringen/; M=http://127.0.0.1:$((PB+83))/traningsplaneringen/
SPIDS=()
serve() { TPV_OWNER="$OUT" node "$HERE/serve-dist.mjs" "$1" "$2" >"$OUT/serve-$2.log" 2>&1 & SPIDS+=($!); }
serve "$PLAIN" $((PB+81)); serve "$BANK" $((PB+80)); serve "$MAIN" $((PB+83))
trap 'kill "${SPIDS[@]}" 2>/dev/null' EXIT
for i in $(seq 1 40); do curl -sf -o /dev/null "$P" && curl -sf -o /dev/null "$B" && curl -sf -o /dev/null "$M" && break; sleep 0.25; done
export PATH="$HERE/shim:$PATH"
export PW_CORE="$HERE/pw-netlog.mjs" SMOKE_ROOT=$ROOT S30_URL=$P S31_OFF_URL=$P S31_ON_URL=$B S32_OFF_URL=$P S32_ON_URL=$B S33_OFF_URL=$P S33_ON_URL=$B S34_URL=$P \
  S35_OFF=$P S35_ON=$B S36_OFF_URL=$P S36_ON_URL=$B S37_URL=$B S38_URL=$P S38_ROOT=$ROOT S39_URL=$P S39_ROOT=$ROOT \
  S47_SEED=$ROOT/tools/bank/out/bank-seed.json
for n in 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57; do export S${n}_BR=$P S${n}_MAIN=$M S${n}_ROOT=$ROOT S${n}_FIX=$P S${n}_SHOTS=$OUT/shots; done
export S46_BR=$B S47_BR=$B S47_MAIN=$M S52_BR=$B   # bank-env builds (see smoke-map "build")
cd "$ROOT"
for s in "$@"; do
  f="$ROOT/verifier/$s.mjs"; [ -f "$f" ] || { echo "$s exit=127 missing $f"; echo "  $s: NY FAIL (skriptet saknas)"; NEWFAIL=1; ANYFAIL=1; continue; }  # Slice 51 D1: a missing script is never «inga NY FAIL»
  standin=$(node -e 'const m=require(process.argv[1]);console.log((m[process.argv[2]]||{}).standin||"")' "$MAP" "$s")
  run=""
  if [ -n "$standin" ]; then
    run="${TAG}_$(echo "$s" | tr -c 'a-z0-9\n' '_' | cut -c1-30)"
    bash "$HERE/db-drop.sh" "$run" >/dev/null 2>&1 || true
    envs=$(S32_GATEWAY_PORT=$((PB+70)) S32_POSTGREST_PORT=$((PB+72)) S32_GOTRUE_PORT=$((PB+73)) S32_SMTP_PORT=$((PB+75)) S32_PREVIEW_PORT=$((PB+80)) \
      S32_MAGIC_LINK_TEMPLATE=$(case $standin in s32|s33|s36) echo "$REPO/verifier/slice-33-local/magic-link.html";; esac) bash "$HERE/db-new.sh" "$run") || { echo "$s exit=125 db-new failed"; ANYFAIL=1; continue; }
    ( eval "$envs"; bash "$REPO/verifier/slice-32-local/start.sh" && bash "$REPO/verifier/slice-32-local/users.sh"
      if [ "$standin" = s36 ]; then Q="psql -h 127.0.0.1 -p $S32_PG_PORT -U postgres -d $S32_DB -v ON_ERROR_STOP=1 -qAt"
        $Q -f "$REPO/slice-36/sql/36-01-table.sql" && $Q -f "$REPO/slice-36/sql/36-02-rls-grants.sql" && $Q -c "notify pgrst, 'reload schema';"; fi
    ) >"$OUT/logs/$s.standin.log" 2>&1 || { echo "$s exit=124 stand-in failed (logs/$s.standin.log)"; ANYFAIL=1; bash "$HERE/db-drop.sh" "$run" >/dev/null 2>&1; continue; }
    eval "$envs"
  fi
  t0=$(date +%s)
  TPV_LOG_DIR="$OUT/logs" NETLOG="$OUT/netlog/$s.log" timeout "${TPV_SMOKE_TIMEOUT:-400}" node "$f" >"$OUT/logs/$s.txt" 2>&1; e=$?
  [ "$e" != 0 ] && ANYFAIL=1   # Slice 52 D1: counts for the exit code without --baseline
  L="$OUT/logs/$s.txt"; sum=$(tail -1 "$L")
  if [ "$e" != 0 ] && [ -z "$(counts "$sum")" ]; then   # crash: show the error, not «Node.js v20…»
    err=$(grep -m1 -E '^[[:space:]]*([A-Za-z]*Error\b|[a-z]+\.[a-zA-Z]+: )' "$L" | sed 's/^[[:space:]]*//' | cut -c1-200)
    [ "$e" = 124 ] && err="timeout ${TPV_SMOKE_TIMEOUT:-400} s${err:+; $err}"
    sum="KRASCH: ${err:-okänt fel, se $L}"
  fi
  echo "$s exit=$e $sum ($(( $(date +%s)-t0 )) s)"
  k=$(grep -o '^KARANTÄN-FAIL \[[^]]*\]' "$L" | sed 's/^KARANTÄN-FAIL \[\(.*\)\]/\1/' | sort -u)
  mkdir -p "$QLAST"; prev=$(cat "$QLAST/$s" 2>/dev/null)
  for id in $k; do
    printf '%s\t%s\t%s\t%s\n' "$(date -Iseconds)" "$SHA" "$s" "$id" >> "$QTSV"
    if echo "$prev" | grep -qx "$id"; then echo "  $s: NY FAIL (karantän $id två körningar i rad, se $QTSV)"; NEWFAIL=1
    else echo "  $s: KARANTÄN-FAIL $id (räknas inte; rad i $QTSV)"; fi
  done
  echo "$k" > "$QLAST/$s"
  [ -n "$BASELINE" ] && compare "$s" "$e" "$sum" "$(echo -n "$k" | grep -c .)"
  [ -n "$run" ] && { [ -f "$S32_DIR/gotrue.log" ] && cp "$S32_DIR/gotrue.log" "$OUT/logs/$s.gotrue.log"; bash "$HERE/db-drop.sh" "$run" >/dev/null 2>&1; unset S32_DIR S32_PG_DIR S32_DB; }
done
live=$(cat "$OUT"/netlog/*.log 2>/dev/null | grep -c fhzqwbdlejzohetdoluw); total=$(cat "$OUT"/netlog/*.log 2>/dev/null | wc -l)
echo "netlog: $total requests, $live to the live project host (all aborted)"
[ -n "$BASELINE" ] && { [ $NEWFAIL = 0 ] && echo "baslinje: inga NY FAIL ($BASELINE)" || echo "baslinje: NY FAIL mot $BASELINE"; }
# Slice 52 D1: with --baseline only NY FAIL fails the run; without it any script exit ≠ 0 does.
if [ -n "$BASELINE" ]; then exit $NEWFAIL; else exit $ANYFAIL; fi
