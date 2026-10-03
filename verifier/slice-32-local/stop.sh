#!/usr/bin/env bash
# Stop THIS stand-in only (dir from S32_DIR, default /tmp/s32): pids from its pid file that still
# carry S32_OWNER=<this dir>, then its own Postgres cluster (pg_ctl -D <dir>/pg). Never by pattern,
# never by port alone — another stand-in's processes are left alone.
HERE="$(cd "$(dirname "$0")" && pwd)"; . "$HERE/env.sh"
if [ -f "$D/pids" ]; then
  while read -r p _; do
    [ -n "$p" ] || continue
    if s32_owned "$p"; then kill "$p" 2>/dev/null; else echo "skip pid $p (gone or not from $D)"; fi
  done < "$D/pids"
  : > "$D/pids"
fi
[ -f "$D/pg/postmaster.pid" ] && "$PGBIN/pg_ctl" -D "$D/pg" -m fast stop >/dev/null 2>&1
echo "stopped ($D)"
