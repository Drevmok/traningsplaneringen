#!/usr/bin/env bash
# AC18 / AC19 on the LOCAL stand-in only: publishable key, signed-in non-admin, admin (codes from the mail sink).
set -uo pipefail
. "$(cd "$(dirname "$0")" && pwd)/env.sh"
G="http://127.0.0.1:$S32_GATEWAY_PORT"; K=sb_publishable_local_s32; T="$G/rest/v1/club_templates"
token() { # email → access token via the e-mail code (Slice 33 flow)
  local before; before=$(ls "$S32_DIR/mail" | wc -l)
  curl -s -o /dev/null -X POST "$G/auth/v1/otp" -H "apikey: $K" -H 'Content-Type: application/json' -d "{\"email\":\"$1\",\"create_user\":false}"
  for i in $(seq 1 20); do [ "$(ls "$S32_DIR/mail" | wc -l)" -gt "$before" ] && break; sleep 0.25; done
  local code; code=$(python3 -c "import json,sys,glob,os;f=max(glob.glob(sys.argv[1]+'/*'),key=os.path.getmtime);print(json.load(open(f))['subject'].split(': ')[-1])" "$S32_DIR/mail")
  curl -s -X POST "$G/auth/v1/verify" -H "apikey: $K" -H 'Content-Type: application/json' -d "{\"type\":\"email\",\"email\":\"$1\",\"token\":\"$code\"}" | python3 -c 'import json,sys;print(json.load(sys.stdin)["access_token"])'
}
ok=0; bad=0
check() { if [ "$2" = "$3" ]; then echo "ok   $1 → $2"; ok=$((ok+1)); else echo "FAIL $1 → got $2, want $3"; bad=$((bad+1)); fi; }
code() { curl -s -o /tmp/s36-rls.body -w '%{http_code}' "$@"; }
PAY='{"v":1,"title":"RLS-test","notes":"","blocks":[]}'
NA=$(token nonadmin@test.local); AD=$(token admin@test.local)
for who in anon nonadmin; do
  H=(-H "apikey: $K"); [ $who = nonadmin ] && H+=(-H "Authorization: Bearer $NA")
  check "$who select hidden=is.true" "$(curl -s "${H[@]}" "$T?select=id&hidden=is.true")" "[]"
  c=$(code "${H[@]}" -X POST "$T" -H 'Content-Type: application/json' -d "{\"title\":\"x-$who\",\"total_minutes\":10,\"payload\":$PAY}"); check "$who insert refused" "$([ "$c" = 401 ] || [ "$c" = 403 ] && echo refused || echo "$c")" refused
  c=$(code "${H[@]}" -X PATCH "$T?id=not.is.null" -H 'Content-Type: application/json' -H 'Prefer: return=representation' -d '{"hidden":true}'); check "$who update refused/0 rows" "$([ "$c" = 401 ] || [ "$c" = 403 ] || [ "$(cat /tmp/s36-rls.body)" = "[]" ] && echo refused || echo "$c $(cat /tmp/s36-rls.body)")" refused
  c=$(code "${H[@]}" -X DELETE "$T?id=not.is.null"); check "$who delete refused" "$([ "$c" = 401 ] || [ "$c" = 403 ] && echo refused || echo "$c")" refused
done
A=(-H "apikey: $K" -H "Authorization: Bearer $AD")
c=$(code "${A[@]}" -X POST "$T" -H 'Content-Type: application/json' -H 'Prefer: return=representation' -d "{\"title\":\"RLS admin\",\"total_minutes\":10,\"payload\":$PAY}"); check "admin insert ok" "$c" 201
ID=$(python3 -c 'import json;print(json.load(open("/tmp/s36-rls.body"))[0]["id"])')
c=$(code "${A[@]}" -X POST "$T" -H 'Content-Type: application/json' -d "{\"title\":\"  rls ADMIN \",\"total_minutes\":10,\"payload\":$PAY}"); check "admin same name → 23505" "$(grep -o 23505 /tmp/s36-rls.body)" 23505
c=$(code "${A[@]}" -X POST "$T" -H 'Content-Type: application/json' -d "{\"title\":\"RLS placements\",\"total_minutes\":10,\"payload\":{\"v\":1,\"title\":\"x\",\"blocks\":[],\"hallPlacements\":[]}}"); check "admin payload with hallPlacements refused (AC19)" "$(grep -o 23514 /tmp/s36-rls.body)" 23514
c=$(code "${A[@]}" -X PATCH "$T?id=eq.$ID" -H 'Content-Type: application/json' -H 'Prefer: return=representation' -d '{"hidden":true}'); check "admin hide ok" "$c" 200
check "anon cannot see the hidden row" "$(curl -s -H "apikey: $K" "$T?select=id&id=eq.$ID")" "[]"
check "admin sees the hidden row" "$(curl -s "${A[@]}" "$T?select=hidden&id=eq.$ID")" '[{"hidden":true}]'
check "updated_by stamped with the admin e-mail" "$(psql -h 127.0.0.1 -p "$S32_PG_PORT" -U postgres -d bank -qAt -c "select updated_by from public.club_templates where id = '$ID'")" admin@test.local
c=$(code "${A[@]}" -X DELETE "$T?id=eq.$ID"); check "admin delete refused" "$([ "$c" = 401 ] || [ "$c" = 403 ] && echo refused || echo "$c")" refused
BOT=$(head -1 "$S32_DIR/bot-keys.txt")
c=$(code -H "apikey: $BOT" "$T?select=id"); check "service_role select refused (no grant)" "$([ "$c" = 401 ] || [ "$c" = 403 ] && echo refused || echo "$c")" refused
psql -h 127.0.0.1 -p "$S32_PG_PORT" -U postgres -d bank -qAt -c "select 'rows left: ' || count(*) from public.club_templates"
# Clean up the test row as the DB owner (the app itself can never delete).
psql -h 127.0.0.1 -p "$S32_PG_PORT" -U postgres -d bank -qAt -c "delete from public.club_templates where title like 'RLS%'" >/dev/null
echo "rls: $ok ok, $bad failed"; [ $bad -eq 0 ]
