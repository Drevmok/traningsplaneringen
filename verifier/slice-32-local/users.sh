#!/usr/bin/env bash
# After start.sh: two auth users through the auth admin API (bot key → service_role),
# then admin@test.local on the admin list (as the owner would in the SQL Editor). Dir/ports from env.sh.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"; . "$HERE/env.sh"
s32_check_env_json
BOT=$(head -1 "$D/bot-keys.txt")
for e in admin@test.local nonadmin@test.local; do
  curl -s -o /dev/null -X POST "http://127.0.0.1:$S32_GATEWAY_PORT/auth/v1/admin/users" -H "apikey: $BOT" -H 'Content-Type: application/json' \
    -d "{\"email\":\"$e\",\"email_confirm\":true,\"password\":\"local-$(head -c 12 /dev/urandom | od -An -tx1 | tr -d ' \n')\"}"
done
Q="psql -h 127.0.0.1 -p $S32_PG_PORT -U postgres -d bank -qAt"
$Q -v ON_ERROR_STOP=1 -c "insert into public.admins (user_id, email, note) select id, email, 'owner' from auth.users where email = 'admin@test.local' on conflict (user_id) do nothing;"
echo "users: $($Q -c "select string_agg(email, ', ' order by email) from auth.users") · admins: $($Q -c "select string_agg(email, ', ') from public.admins")"
