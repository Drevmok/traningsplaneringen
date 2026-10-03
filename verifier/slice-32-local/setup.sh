#!/usr/bin/env bash
# Slice 32 local stand-in: Postgres 17 + Supabase-style roles + GoTrue schema + schema-31/32 + seed.
# Everything lives in /tmp/s32 (throwaway). Generated local-only keys/secrets stay there, never in git.
#   bash verifier/slice-32-local/setup.sh      then   bash verifier/slice-32-local/start.sh
set -euo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
HERE="$REPO/verifier/slice-32-local"
D=/tmp/s32
PGBIN=${PGBIN:-/usr/lib/postgresql/17/bin}
GOTRUE=${GOTRUE:-/tmp/gotrue/auth}
PGPORT=54341
if [ -f "$D/pids" ]; then bash "$HERE/stop.sh" || true; fi
rm -rf "$D"; mkdir -p "$D/mail"; chmod 700 "$D"
rand() { head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n'; }
JWT_SECRET="local-$(rand)"
BOT_KEY="localbot_$(rand)"
echo "$BOT_KEY" > "$D/bot-keys.txt"; chmod 600 "$D/bot-keys.txt"
cat > "$D/env.json" <<JSON
{ "dir": "$D", "jwtSecret": "$JWT_SECRET", "publishableKey": "sb_publishable_local_s32",
  "botKeysFile": "$D/bot-keys.txt", "gatewayPort": 54340, "postgrestPort": 54342, "gotruePort": 54343, "smtpPort": 54345,
  "pgPort": $PGPORT }
JSON
chmod 600 "$D/env.json"
"$PGBIN/initdb" -D "$D/pg" -U postgres -A trust >/dev/null
"$PGBIN/pg_ctl" -D "$D/pg" -o "-p $PGPORT -k /tmp -c listen_addresses=127.0.0.1" -l "$D/pg.log" -w start >/dev/null
P="env PGOPTIONS=-cclient_min_messages=warning psql -h 127.0.0.1 -p $PGPORT -U postgres -v ON_ERROR_STOP=1 -qAt"
$P -c "create database bank" >/dev/null
$P -d bank -f "$HERE/roles.sql" >/dev/null
cat > "$D/gotrue.env" <<ENV
GOTRUE_API_HOST=127.0.0.1
PORT=54343
API_EXTERNAL_URL=https://bank-mock.supabase.co/auth/v1
GOTRUE_DB_DRIVER=postgres
DATABASE_URL='postgres://supabase_auth_admin:local-only@127.0.0.1:$PGPORT/bank?sslmode=disable&search_path=auth'
DB_NAMESPACE=auth
GOTRUE_SITE_URL=http://127.0.0.1:4174/traningsplaneringen/
GOTRUE_URI_ALLOW_LIST=http://127.0.0.1:4174/traningsplaneringen/,http://127.0.0.1:4174/traningsplaneringen/**
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
GOTRUE_SMTP_PORT=54345
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
$P -d bank -f "$REPO/slice-31/content/schema-32.sql" >/dev/null
cat > "$D/postgrest.conf" <<CONF
db-uri = "postgres://authenticator:local-only@127.0.0.1:$PGPORT/bank"
db-schemas = "public"
db-anon-role = "anon"
jwt-secret = "$JWT_SECRET"
server-host = "127.0.0.1"
server-port = 54342
CONF
chmod 600 "$D/postgrest.conf"
echo "setup ok: $($P -d bank -c "select count(*) from public.exercises where status='published'") published, $($P -d bank -c "select count(*) from public.redskap") redskap"
