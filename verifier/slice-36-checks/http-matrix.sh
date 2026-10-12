#!/usr/bin/env bash
# Slice 36 Verifier: role × table × operation HTTP matrix on a LOCAL stand-in only (S32_DIR / ports from env).
# Prints statuses only, never keys or tokens. Seeds one visible + one hidden row as the DB owner, cleans up after.
set -uo pipefail
D=${S32_DIR:?}; G="http://127.0.0.1:$(python3 -c "import json;print(json.load(open('$D/env.json'))['gatewayPort'])")"
PG=$(python3 -c "import json;print(json.load(open('$D/env.json'))['pgPort'])")
K=sb_publishable_local_s32; BOT=$(head -1 "$D/bot-keys.txt")
Q="psql -h 127.0.0.1 -p $PG -U postgres -d bank -qAt"
token() { local before; before=$(ls "$D/mail" | wc -l)
  curl -s -o /dev/null -X POST "$G/auth/v1/otp" -H "apikey: $K" -H 'Content-Type: application/json' -d "{\"email\":\"$1\",\"create_user\":false}"
  for i in $(seq 1 40); do [ "$(ls "$D/mail" | wc -l)" -gt "$before" ] && break; sleep 0.25; done
  local c; c=$(python3 -c "import json,sys,glob,os;f=max(glob.glob(sys.argv[1]+'/*'),key=os.path.getmtime);print(json.load(open(f))['subject'].split(': ')[-1])" "$D/mail")
  curl -s -X POST "$G/auth/v1/verify" -H "apikey: $K" -H 'Content-Type: application/json' -d "{\"type\":\"email\",\"email\":\"$1\",\"token\":\"$c\"}" | python3 -c 'import json,sys;print(json.load(sys.stdin)["access_token"])'; }
$Q -c "delete from public.club_templates where title like 'MX %'" >/dev/null
$Q -c "insert into public.club_templates(title,total_minutes,payload,hidden) values ('MX visible',10,'{\"v\":1,\"blocks\":[]}',false),('MX hidden',10,'{\"v\":1,\"blocks\":[]}',true)" >/dev/null
NA=$(token nonadmin@test.local); sleep 1; AD=$(token admin@test.local)
B=/tmp/s36v-mx.body
st() { curl -s -o $B -w '%{http_code}' "$@"; }
printf '%-9s %-14s %-22s %s\n' role table op "status body"
for who in anon nonadmin admin bot; do
  case $who in anon) H=(-H "apikey: $K");; nonadmin) H=(-H "apikey: $K" -H "Authorization: Bearer $NA");; admin) H=(-H "apikey: $K" -H "Authorization: Bearer $AD");; bot) H=(-H "apikey: $BOT");; esac
  T="$G/rest/v1/club_templates"
  r() { printf '%-9s %-14s %-22s %s %s\n' $who "$1" "$2" "$3" "$(head -c 90 $B | tr '\n' ' ')"; }
  c=$(st "${H[@]}" "$T?select=title&title=like.MX*&order=title"); r club_templates "SELECT MX rows" $c
  c=$(st "${H[@]}" "$T?select=title&hidden=is.true&title=like.MX*"); r club_templates "SELECT hidden=is.true" $c
  c=$(st "${H[@]}" -X POST "$T" -H 'Content-Type: application/json' -H 'Prefer: return=minimal' -d "{\"title\":\"MX ins $who\",\"total_minutes\":5,\"payload\":{\"v\":1,\"blocks\":[]}}"); r club_templates INSERT $c
  c=$(st "${H[@]}" -X PATCH "$T?title=eq.MX%20visible" -H 'Content-Type: application/json' -H 'Prefer: return=representation' -d '{"sort_order":1}'); r club_templates "UPDATE visible" $c
  c=$(st "${H[@]}" -X PATCH "$T?title=eq.MX%20hidden" -H 'Content-Type: application/json' -H 'Prefer: return=representation' -d '{"hidden":false}'); r club_templates "UPDATE hidden→false" $c
  [ $who = admin ] && $Q -c "update public.club_templates set hidden=true where title='MX hidden'" >/dev/null
  c=$(st "${H[@]}" -X DELETE "$T?title=like.MX*" -H 'Prefer: return=representation'); r club_templates DELETE $c
  A="$G/rest/v1/admins"
  c=$(st "${H[@]}" "$A?select=email"); r admins SELECT $c
  c=$(st "${H[@]}" -X POST "$A" -H 'Content-Type: application/json' -d '{"user_id":"00000000-0000-0000-0000-000000000000","email":"x@x"}'); r admins INSERT $c
  c=$(st "${H[@]}" -X PATCH "$A?email=not.is.null" -H 'Content-Type: application/json' -H 'Prefer: return=representation' -d '{"note":"x"}'); r admins UPDATE $c
  c=$(st "${H[@]}" -X DELETE "$A?email=eq.nobody" -H 'Prefer: return=representation'); r admins DELETE $c
done | sed -E 's/[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/<jwt>/g'
echo "rows MX after: $($Q -c "select string_agg(title||'/'||hidden||'/'||sort_order, ', ' order by title) from public.club_templates where title like 'MX %'")"
echo "admins rows: $($Q -c "select count(*) from public.admins")"
$Q -c "delete from public.club_templates where title like 'MX %'" >/dev/null
