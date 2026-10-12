#!/usr/bin/env bash
# Fresh Slice 36 stand-in: Slice 32/33 setup + start + users, then 36-01 → 36-02 → 36-03 on the LOCAL
# Postgres (127.0.0.1:$S32_PG_PORT). A second admin (admin2@test.local) is added so 36-03's
# "two admins listed" check matches the live project (Christoffer + Planner).
set -euo pipefail
. "$(cd "$(dirname "$0")" && pwd)/env.sh"
bash "$L32/setup.sh" && bash "$L32/start.sh" && bash "$L32/users.sh"
Q="psql -h 127.0.0.1 -p $S32_PG_PORT -U postgres -d bank -v ON_ERROR_STOP=1 -qAt"
BOT=$(head -1 "$S32_DIR/bot-keys.txt")
curl -s -o /dev/null -X POST "http://127.0.0.1:$S32_GATEWAY_PORT/auth/v1/admin/users" -H "apikey: $BOT" -H 'Content-Type: application/json' \
  -d "{\"email\":\"admin2@test.local\",\"email_confirm\":true,\"password\":\"local-$(head -c 12 /dev/urandom | od -An -tx1 | tr -d ' \n')\"}"
$Q -c "insert into public.admins (user_id, email, note) select id, email, 'second admin' from auth.users where email = 'admin2@test.local' on conflict (user_id) do nothing;"
$Q -f "$SQL36/36-01-table.sql" >/dev/null
$Q -f "$SQL36/36-02-rls-grants.sql" >/dev/null
# PostgREST must see the new table.
$Q -c "notify pgrst, 'reload schema';"
sleep 1
psql -h 127.0.0.1 -p "$S32_PG_PORT" -U postgres -d bank -P pager=off -f "$SQL36/36-03-smoke.sql" | tee "$S32_DIR/36-03-smoke.out"
