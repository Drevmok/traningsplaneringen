# Slice 32 stand-in settings, sourced by setup.sh / start.sh / stop.sh / users.sh.
# Everything comes from the environment, with the original values as defaults, so a second
# stand-in (e.g. the Verifier's) can run next to this one:
#   S32_DIR=/tmp/s32vv S32_PG_PORT=54441 S32_GATEWAY_PORT=54440 ... bash setup.sh
# Use the SAME variables for every script of one stand-in.
S32_DIR=${S32_DIR:-/tmp/s32}
S32_GATEWAY_PORT=${S32_GATEWAY_PORT:-54340}
S32_PG_PORT=${S32_PG_PORT:-54341}
S32_POSTGREST_PORT=${S32_POSTGREST_PORT:-54342}
S32_GOTRUE_PORT=${S32_GOTRUE_PORT:-54343}
S32_SMTP_PORT=${S32_SMTP_PORT:-54345}
S32_PREVIEW_PORT=${S32_PREVIEW_PORT:-4174}   # bank-build preview the login links return to
PGBIN=${PGBIN:-/usr/lib/postgresql/17/bin}
GOTRUE=${GOTRUE:-/tmp/gotrue/auth}
POSTGREST=${POSTGREST:-/tmp/postgrest/postgrest}
D=$S32_DIR
S32_PORTS="$S32_GATEWAY_PORT $S32_PG_PORT $S32_POSTGREST_PORT $S32_GOTRUE_PORT $S32_SMTP_PORT"
export S32_DIR

# Every process start.sh launches carries S32_OWNER=<dir> in its environment; stop.sh only
# kills a pid when that marker matches THIS dir (a stale pid file can't hit a reused pid
# or another stand-in that happens to use the same ports).
s32_owned() { # pid → 0 if it is alive and belongs to $S32_DIR
  [ -r "/proc/$1/environ" ] && tr '\0' '\n' < "/proc/$1/environ" 2>/dev/null | grep -qxF "S32_OWNER=$S32_DIR"
}
s32_port_pids() { # port → pids listening on 127.0.0.1:<port>
  ss -ltnpH "sport = :$1" 2>/dev/null | grep -o 'pid=[0-9]*' | cut -d= -f2 | sort -u
}
# After setup: the dir's env.json is the truth. Refuse if the current env points elsewhere.
s32_check_env_json() {
  [ -f "$D/env.json" ] || { echo "no $D/env.json — run setup.sh with the same S32_* variables first" >&2; return 1; }
  local want="$S32_GATEWAY_PORT $S32_PG_PORT $S32_POSTGREST_PORT $S32_GOTRUE_PORT $S32_SMTP_PORT"
  local have
  have=$(python3 -c 'import json,sys;c=json.load(open(sys.argv[1]));print(c["gatewayPort"],c["pgPort"],c["postgrestPort"],c["gotruePort"],c["smtpPort"])' "$D/env.json")
  [ "$have" = "$want" ] || { echo "$D/env.json has ports $have but the environment says $want — use the same S32_* variables as setup.sh" >&2; return 1; }
}
