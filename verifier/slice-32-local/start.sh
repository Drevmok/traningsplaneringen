#!/usr/bin/env bash
# Start PostgREST, GoTrue, the SMTP sink and the gateway (after setup.sh). Pids → /tmp/s32/pids.
set -euo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; HERE="$REPO/verifier/slice-32-local"; D=/tmp/s32
POSTGREST=${POSTGREST:-/tmp/postgrest/postgrest}; GOTRUE=${GOTRUE:-/tmp/gotrue/auth}
: > "$D/pids"
nohup "$POSTGREST" "$D/postgrest.conf" >"$D/postgrest.log" 2>&1 & echo $! >> "$D/pids"
( cd "$(dirname "$GOTRUE")" && set -a && . "$D/gotrue.env" && set +a && exec nohup "$GOTRUE" serve >"$D/gotrue.log" 2>&1 ) & echo $! >> "$D/pids"
nohup python3 "$HERE/smtp-catcher.py" 54345 "$D/mail" >"$D/smtp.log" 2>&1 & echo $! >> "$D/pids"
S32_ENV="$D/env.json" nohup node "$HERE/gateway.mjs" >"$D/gateway.out" 2>&1 & echo $! >> "$D/pids"
for i in $(seq 1 40); do
  if curl -s -o /dev/null http://127.0.0.1:54343/health && curl -s -o /dev/null http://127.0.0.1:54342/ && curl -s -o /dev/null http://127.0.0.1:54340/rest/v1/; then echo "started"; exit 0; fi
  sleep 0.25
done
echo "services did not come up; see $D/*.log" >&2; exit 1
