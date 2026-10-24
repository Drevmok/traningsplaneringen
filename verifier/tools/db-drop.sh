#!/usr/bin/env bash
# Slice 50 (A1): stop a run's own services (owned pids only) and drop bank_<run>. The template stays.
#   bash verifier/tools/db-drop.sh <run>
set -euo pipefail
RUN=${1:?usage: db-drop.sh <run>}
[[ "$RUN" =~ ^[a-z0-9_]+$ ]] || { echo "run id: [a-z0-9_] only" >&2; exit 1; }
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
TPV_HOME=${TPV_HOME:-/home/box/tp-verify}; STANDIN=${TPV_STANDIN:-$TPV_HOME/standin}
R="$STANDIN/runs/$RUN"
PGPORT=$(python3 -c 'import json,sys;print(json.load(open(sys.argv[1]))["pgPort"])' "$STANDIN/env.json")
[ -d "$R" ] && S32_DIR="$R" S32_PG_DIR="$STANDIN/pg" bash "$REPO/verifier/slice-32-local/stop.sh" >/dev/null || true
psql -h 127.0.0.1 -p "$PGPORT" -U postgres -qAt -d postgres -c "drop database if exists bank_$RUN with (force)" >/dev/null
rm -rf "$R"
echo "dropped bank_$RUN (template kept)"
