#!/usr/bin/env bash
# Slice 32 local stand-in: Postgres 17 + Supabase-style roles + GoTrue schema + schema-31/32 + seed.
# Everything lives in $S32_DIR (default /tmp/s32, throwaway); ports from S32_*_PORT (see env.sh / README.md).
# Generated local-only keys/secrets stay in that dir, never in git.
#   bash verifier/slice-32-local/setup.sh      then   bash verifier/slice-32-local/start.sh
# S32_SCHEMA32 (optional) = the schema-32 file to apply (default: slice-31/content/schema-32.sql).
set -euo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
HERE="$REPO/verifier/slice-32-local"
. "$HERE/env.sh"
SCHEMA32=${S32_SCHEMA32:-$REPO/slice-31/content/schema-32.sql}
PGPORT=$S32_PG_PORT
# Stop only what belongs to THIS dir, then make sure no other process holds our ports.
if [ -d "$D" ]; then bash "$HERE/stop.sh" >/dev/null || true; fi
for port in $S32_PORTS; do
  for p in $(s32_port_pids "$port"); do
    echo "port $port is in use by pid $p ($(tr '\0' ' ' < /proc/$p/cmdline 2>/dev/null | cut -c1-80)) — not from $D; pick other S32_*_PORT values" >&2
    exit 1
  done
done
rm -rf "$D"; mkdir -p "$D/mail"; chmod 700 "$D"
rand() { head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n'; }
JWT_SECRET="local-$(rand)"
BOT_KEY="localbot_$(rand)"
echo "$BOT_KEY" > "$D/bot-keys.txt"; chmod 600 "$D/bot-keys.txt"
cat > "$D/env.json" <<JSON
{ "dir": "$D", "jwtSecret": "$JWT_SECRET", "publishableKey": "sb_publishable_local_s32",
  "botKeysFile": "$D/bot-keys.txt", "gatewayPort": $S32_GATEWAY_PORT, "postgrestPort": $S32_POSTGREST_PORT, "gotruePort": $S32_GOTRUE_PORT, "smtpPort": $S32_SMTP_PORT,
  "pgPort": $PGPORT }
JSON
chmod 600 "$D/env.json"
"$PGBIN/initdb" -D "$D/pg" -U postgres -A trust >/dev/null
S32_OWNER="$D" "$PGBIN/pg_ctl" -D "$D/pg" -o "-p $PGPORT -k /tmp -c listen_addresses=127.0.0.1" -l "$D/pg.log" -w start >/dev/null
P="env PGOPTIONS=-cclient_min_messages=warning psql -h 127.0.0.1 -p $PGPORT -U postgres -v ON_ERROR_STOP=1 -qAt"
$P -c "create database bank" >/dev/null
$P -d bank -f "$HERE/roles.sql" >/dev/null
cat > "$D/gotrue.env" <<ENV
GOTRUE_API_HOST=127.0.0.1
PORT=$S32_GOTRUE_PORT
API_EXTERNAL_URL=https://bank-mock.supabase.co/auth/v1
GOTRUE_DB_DRIVER=postgres
DATABASE_URL='postgres://supabase_auth_admin:local-only@127.0.0.1:$PGPORT/bank?sslmode=disable&search_path=auth'
DB_NAMESPACE=auth
GOTRUE_SITE_URL=http://127.0.0.1:$S32_PREVIEW_PORT/traningsplaneringen/
GOTRUE_URI_ALLOW_LIST=http://127.0.0.1:$S32_PREVIEW_PORT/traningsplaneringen/,http://127.0.0.1:$S32_PREVIEW_PORT/traningsplaneringen/**
GOTRUE_DISABLE_SIGNUP=true
GOTRUE_JWT_SECRET=$JWT_SECRET
GOTRUE_JWT_EXP=3600
GOTRUE_JWT_AUD=authenticated
GOTRUE_JWT_ADMIN_ROLES=service_role
GOTRUE_JWT_DEFAULT_GROUP_NAME=authenticated
GOTRUE_EXTERNAL_EMAIL_ENABLED=true
GOTRUE_MAILER_AUTOCONFIRM=false
GOTRUE_MAILER_OTP_EXP=3600
GOTRUE_SMTP_HOST=127.0.0.1
GOTRUE_SMTP_PORT=$S32_SMTP_PORT
GOTRUE_SMTP_ADMIN_EMAIL=noreply@bank-mock.local
GOTRUE_SMTP_SENDER_NAME='Supabase Auth local'
GOTRUE_SMTP_MAX_FREQUENCY=60s
GOTRUE_MAILER_URLPATHS_MAGIC_LINK=/auth/v1/verify
GOTRUE_MAILER_URLPATHS_CONFIRMATION=/auth/v1/verify
GOTRUE_MAILER_URLPATHS_INVITE=/auth/v1/verify
GOTRUE_MAILER_URLPATHS_RECOVERY=/auth/v1/verify
GOTRUE_MAILER_URLPATHS_EMAIL_CHANGE=/auth/v1/verify
GOTRUE_RATE_LIMIT_EMAIL_SENT=100
GOTRUE_LOG_LEVEL=warn
ENV
chmod 600 "$D/gotrue.env"
( cd "$(dirname "$GOTRUE")" && set -a && . "$D/gotrue.env" && set +a && "$GOTRUE" migrate >"$D/gotrue-migrate.log" 2>&1 )
$P -d bank -f "$REPO/slice-31/content/schema-31.sql" >/dev/null
$P -d bank -f "$REPO/tools/bank/out/bank-seed.sql" >/dev/null
$P -d bank -f "$SCHEMA32" >/dev/null
cat > "$D/postgrest.conf" <<CONF
db-uri = "postgres://authenticator:local-only@127.0.0.1:$PGPORT/bank"
db-schemas = "public"
db-anon-role = "anon"
jwt-secret = "$JWT_SECRET"
server-host = "127.0.0.1"
server-port = $S32_POSTGREST_PORT
CONF
chmod 600 "$D/postgrest.conf"
echo "setup ok ($D, pg :$PGPORT, schema-32: ${SCHEMA32#$REPO/}): $($P -d bank -c "select count(*) from public.exercises where status='published'") published, $($P -d bank -c "select count(*) from public.redskap") redskap"
