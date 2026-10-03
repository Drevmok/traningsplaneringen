#!/usr/bin/env bash
# Start PostgREST, GoTrue, the SMTP sink and the gateway for THIS stand-in (after setup.sh).
# Dir/ports from env.sh (S32_DIR, S32_*_PORT). Pids → <dir>/pids; each process carries S32_OWNER=<dir>.
set -euo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; HERE="$REPO/verifier/slice-32-local"
. "$HERE/env.sh"
s32_check_env_json
[ -f "$D/pg/postmaster.pid" ] || S32_OWNER="$D" "$PGBIN/pg_ctl" -D "$D/pg" -o "-p $S32_PG_PORT -k /tmp -c listen_addresses=127.0.0.1" -l "$D/pg.log" -w start >/dev/null
for port in $S32_GATEWAY_PORT $S32_POSTGREST_PORT $S32_GOTRUE_PORT $S32_SMTP_PORT; do
  [ -z "$(s32_port_pids "$port")" ] || { echo "port $port already in use (pid $(s32_port_pids "$port" | tr '\n' ' ')) — stop.sh for this dir, or other S32_*_PORT values" >&2; exit 1; }
done
: > "$D/pids"
export S32_OWNER="$D"
nohup "$POSTGREST" "$D/postgrest.conf" >"$D/postgrest.log" 2>&1 & echo "$! postgrest" >> "$D/pids"
( cd "$(dirname "$GOTRUE")" && set -a && . "$D/gotrue.env" && set +a && exec nohup "$GOTRUE" serve >"$D/gotrue.log" 2>&1 ) & echo "$! gotrue" >> "$D/pids"
nohup python3 "$HERE/smtp-catcher.py" "$S32_SMTP_PORT" "$D/mail" >"$D/smtp.log" 2>&1 & echo "$! smtp" >> "$D/pids"
S32_ENV="$D/env.json" nohup node "$HERE/gateway.mjs" >"$D/gateway.out" 2>&1 & echo "$! gateway" >> "$D/pids"
for i in $(seq 1 40); do
  if curl -s -o /dev/null "http://127.0.0.1:$S32_GOTRUE_PORT/health" && curl -s -o /dev/null "http://127.0.0.1:$S32_POSTGREST_PORT/" && curl -s -o /dev/null "http://127.0.0.1:$S32_GATEWAY_PORT/rest/v1/"; then echo "started ($D, gateway :$S32_GATEWAY_PORT)"; exit 0; fi
  sleep 0.25
done
echo "services did not come up; see $D/*.log" >&2; exit 1
