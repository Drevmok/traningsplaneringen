#!/usr/bin/env bash
# Stop everything started by start.sh/setup.sh (by pid file, never by pattern).
D=/tmp/s32; PGBIN=${PGBIN:-/usr/lib/postgresql/17/bin}
if [ -f "$D/pids" ]; then while read -r p; do [ -n "$p" ] && kill "$p" 2>/dev/null; done < "$D/pids"; : > "$D/pids"; fi
[ -d "$D/pg" ] && "$PGBIN/pg_ctl" -D "$D/pg" -m fast stop >/dev/null 2>&1
echo stopped
