#!/usr/bin/env bash
# Slice 50 (A1): new run database from the template. bank_<run> = copy of bank_template (~1 s).
#   eval "$(bash verifier/tools/db-new.sh <run>)"   → exports S32_DIR/S32_PG_DIR/S32_DB/ports for this run
#   bash verifier/slice-32-local/start.sh && bash verifier/slice-32-local/users.sh   (GoTrue + PostgREST on bank_<run>)
# Ports for the run's services come from S32_GATEWAY_PORT/… (defaults 54740/54742/54743/54745, preview 4174).
# Keys are generated into <standin>/runs/<run>/ (chmod 600), never into git.
set -euo pipefail
RUN=${1:?usage: db-new.sh <run>}
[[ "$RUN" =~ ^[a-z0-9_]+$ ]] || { echo "run id: [a-z0-9_] only" >&2; exit 1; }
REPO="$(cd "$(dirname "$0")/../.." && pwd)"; L32="$REPO/verifier/slice-32-local"
TPV_HOME=${TPV_HOME:-/home/box/tp-verify}; STANDIN=${TPV_STANDIN:-$TPV_HOME/standin}
PGBIN=${PGBIN:-/usr/lib/postgresql/17/bin}
PGPORT=$(python3 -c 'import json,sys;print(json.load(open(sys.argv[1]))["pgPort"])' "$STANDIN/env.json" 2>/dev/null) \
  || { echo "no template — kör: bash verifier/tools/doctor.sh" >&2; exit 1; }
if [ ! -f "$STANDIN/pg/postmaster.pid" ]; then
  S32_OWNER="$STANDIN" "$PGBIN/pg_ctl" -D "$STANDIN/pg" -o "-p $PGPORT -k /tmp -c listen_addresses=127.0.0.1" -l "$STANDIN/pg.log" -w start >/dev/null
fi
P="psql -h 127.0.0.1 -p $PGPORT -U postgres -v ON_ERROR_STOP=1 -qAt"
R="$STANDIN/runs/$RUN"
[ ! -e "$R" ] || { echo "run $RUN exists — db-drop.sh $RUN first" >&2; exit 1; }
$P -d postgres -c "create database bank_$RUN template bank_template" >/dev/null
mkdir -p "$R/mail"; chmod 700 "$R"
export S32_DIR="$R" S32_PG_DIR="$STANDIN/pg" S32_DB="bank_$RUN" S32_PG_PORT=$PGPORT
export S32_GATEWAY_PORT=${S32_GATEWAY_PORT:-54740} S32_POSTGREST_PORT=${S32_POSTGREST_PORT:-54742} S32_GOTRUE_PORT=${S32_GOTRUE_PORT:-54743} S32_SMTP_PORT=${S32_SMTP_PORT:-54745} S32_PREVIEW_PORT=${S32_PREVIEW_PORT:-4174}
rand() { head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n'; }
JWT_SECRET="local-$(rand)"; echo "localbot_$(rand)" > "$R/bot-keys.txt"; chmod 600 "$R/bot-keys.txt"
cat > "$R/env.json" <<JSON
{ "dir": "$R", "jwtSecret": "$JWT_SECRET", "publishableKey": "sb_publishable_local_s32", "db": "bank_$RUN", "pgDir": "$STANDIN/pg",
  "botKeysFile": "$R/bot-keys.txt", "gatewayPort": $S32_GATEWAY_PORT, "postgrestPort": $S32_POSTGREST_PORT, "gotruePort": $S32_GOTRUE_PORT, "smtpPort": $S32_SMTP_PORT,
  "pgPort": $PGPORT }
JSON
# GoTrue/PostgREST config = the same as setup.sh writes, pointed at bank_<run>.
python3 - "$L32/setup.sh" "$R" "$JWT_SECRET" <<'PY'
import re,sys,os
src=open(sys.argv[1]).read(); R=sys.argv[2]; jwt=sys.argv[3]; e=os.environ
def fill(t):
  for k,v in {"$S32_GOTRUE_PORT":e["S32_GOTRUE_PORT"],"$PGPORT":e["S32_PG_PORT"],"$DB":e["S32_DB"],"$S32_PREVIEW_PORT":e["S32_PREVIEW_PORT"],
              "$JWT_SECRET":jwt,"${S32_OTP_EXP:-3600}":e.get("S32_OTP_EXP","3600"),"${S32_OTP_LENGTH:-6}":e.get("S32_OTP_LENGTH","6"),
              "$S32_SMTP_PORT":e["S32_SMTP_PORT"],"$S32_POSTGREST_PORT":e["S32_POSTGREST_PORT"]}.items(): t=t.replace(k,v)
  return t
g=re.search(r'cat > "\$D/gotrue.env" <<ENV\n(.*?)\nENV\n',src,re.S).group(1)
c=re.search(r'cat > "\$D/postgrest.conf" <<CONF\n(.*?)\nCONF\n',src,re.S).group(1)
open(R+"/gotrue.env","w").write(fill(g)+"\n"); open(R+"/postgrest.conf","w").write(fill(c)+"\n")
os.chmod(R+"/gotrue.env",0o600); os.chmod(R+"/postgrest.conf",0o600)
PY
if [ -n "${S32_MAGIC_LINK_TEMPLATE:-}" ]; then
  mkdir -p "$R/templates"; cp "$S32_MAGIC_LINK_TEMPLATE" "$R/templates/magic_link.html"
  { echo "GOTRUE_MAILER_TEMPLATES_MAGIC_LINK=http://127.0.0.1:$S32_GATEWAY_PORT/__templates/magic_link.html"
    printf "GOTRUE_MAILER_SUBJECTS_MAGIC_LINK='%s'\n" "${S32_MAGIC_LINK_SUBJECT:-Din kod till Träningsplaneraren: {{ .Token }}}"; } >> "$R/gotrue.env"
fi
echo "export S32_DIR=$R S32_PG_DIR=$STANDIN/pg S32_DB=bank_$RUN S32_PG_PORT=$PGPORT S32_GATEWAY_PORT=$S32_GATEWAY_PORT S32_POSTGREST_PORT=$S32_POSTGREST_PORT S32_GOTRUE_PORT=$S32_GOTRUE_PORT S32_SMTP_PORT=$S32_SMTP_PORT S32_PREVIEW_PORT=$S32_PREVIEW_PORT"
