# Slice 60 — rotorsak per AC (v45, main `34ec865`)

Källor: `/home/box/tp-verify/weekly/2026-v45-out/logs/slice-3{1,2,3}-builder-smoke.txt`, `…/netlog/slice-31-builder-smoke.log`, `/home/box/tp-verify/main/<sha>/smoke-baseline.txt`, kod på `34ec865`. Inga smokes kördes för den här filen.

## Kedjan

| Steg | Bevis |
|---|---|
| Stand-in-mallen saknar `default_station_layout` | `verifier/slice-32-local/setup.sh:91–93` kör schema-31, seed, schema-32. Hash `setup.sh:101`, `verifier/tools/doctor.sh:31`: samma fyra filer. `grep -c default_station_layout`: schema-31 0, schema-32 0, schema-57 13 |
| Appen frågar efter kolumnen | `app/src/lib/bankRow.ts:60` (`BANK_EXERCISE_COLUMNS`), från Slice 57 |
| Ledare: fel → ny GET utan kolumnen | `app/src/lib/bank.ts:190–193`. Netlog s31 v45: `GET …/exercises?select=…,default_station_layout,…` följt av `GET …/exercises?select=…,default_station_equipment,legacy_equipment,…` (utan kolumnen) |
| Admin: fel → `false`, ingen reserv | `app/src/lib/admin/adminBank.ts:13` (`ADMIN_COLUMNS`), `:50–56` (`if (error …) return false`) |
| Admin-vyn tom | `app/src/components/AdminArea.tsx:51` (listor ur `bank.entries`), `:65` (tomtext bara när `bank.loaded`) |
| Start: Slice 57 | Baslinjer: `9a452c7` s31 47/0, s32 78/0, s33 146/0. `b610103` NY FAIL i alla tre. `3f0a729`, `34ec865`: 45/2, 42/14, 111/13 |
| Inte körda före merge | `pick-smokes 9a452c7 b610103` → HELA LOOPEN. `SLICE57-SHIPPED.md` och `SLICE58-SHIPPED.md`: bara s48, s49, s52, s55, s56 |

## Per AC

Klass: **M** = miljön (stand-in saknar schema-57), förväntan i smoken är rätt mot live. **M→** = följdfel av ett tidigare M-fel i samma skript. Ingen rad är **A** (appfel i produktion).

| Skript | AC | Loggrad (v45) | Mekanism | Klass | Åtgärd ★ |
|---|---|---|---|---|---|
| s31 | C1a | `/rest/v1/exercises,/rest/v1/exercises,/rest/v1/redskap` | Reserv-GET i `bank.ts:190–193` | M | schema-57 i mallen |
| s31 | C2a | «Reload makes one new pair of GETs» | Samma, vid omladdning | M | schema-57 i mallen |
| s32 | AC26b | `GET exercises, GET redskap, GET exercises` | Reserv-GET | M | schema-57 i mallen |
| s32 | AC29a | rubriker saknas | `loadAdminBank` false → inga listor | M | schema-57 i mallen |
| s32 | AC29c | Väntar-listan saknas | Som AC29a | M | schema-57 i mallen |
| s32 | AC29d | Väntar först | Som AC29a | M | schema-57 i mallen |
| s32 | AC29 | timeout på kort «Test: formhopp över lågt block» | Inga kort att trycka på | M | schema-57 i mallen |
| s32 | AC30b | «51» titlar, godkänd rad saknas | Godkännandet i AC29 gjordes aldrig | M→ | följer AC29 |
| s32 | AC31 | timeout på «Väntar på godkännande (1)» | Admin-listor saknas | M | schema-57 i mallen |
| s32 | AC33b0 | «0» rader i Behöver granskas | Admin-listor saknas | M | schema-57 i mallen |
| s32 | AC33 | timeout på kort «Närvaro» | Admin-listor saknas | M | schema-57 i mallen |
| s32 | AC34 | timeout på `.admin-detail` | Admin-detaljen kräver laddad admin-bank | M | schema-57 i mallen |
| s32 | AC35 | timeout på `.admin-detail` | Som AC34 | M | schema-57 i mallen |
| s32 | AC36 | timeout på `.admin-detail` | Som AC34 | M | schema-57 i mallen |
| s32 | AC37 | timeout på kort «Kullerbytta (flik 2)» | Admin-listor saknas, fliktiteln sparades aldrig | M | schema-57 i mallen |
| s32 | AC48c | cachen saknar godkänd rad + flik-2-titel | Följd av AC29 och AC36 | M→ | följer AC29/AC36 |
| s33 | AC21c | `GET exercises, GET redskap, GET club_templates, GET exercises` | Reserv-GET | M | schema-57 i mallen |
| s33 | S32-AC29a | rubriker saknas | Som s32 AC29a | M | schema-57 i mallen |
| s33 | S32-AC29c | Som s32 | Som s32 | M | schema-57 i mallen |
| s33 | S32-AC29d | Som s32 | Som s32 | M | schema-57 i mallen |
| s33 | S32-AC29 | timeout i «Väntar på godkännande» | Som s32 | M | schema-57 i mallen |
| s33 | S32-AC30b | «51» | Som s32 AC30b | M→ | följer S32-AC29 |
| s33 | S32-AC31 | timeout «Väntar på godkännande (1)» | Som s32 | M | schema-57 i mallen |
| s33 | S32-AC33b0 | «0» | Som s32 | M | schema-57 i mallen |
| s33 | S32-AC33 | timeout «Behöver granskas (16)» | Som s32 | M | schema-57 i mallen |
| s33 | S32-AC34 | timeout `.admin-detail` | Som s32 | M | schema-57 i mallen |
| s33 | S32-AC35 | timeout `.admin-detail` | Som s32 | M | schema-57 i mallen |
| s33 | S32-AC36 | timeout `.admin-detail` | Som s32 | M | schema-57 i mallen |
| s33 | S32-AC37 | timeout «Kullerbytta (flik 2)» | Som s32 | M | schema-57 i mallen |

29 rader: 25 M, 4 M→, 0 A.

## Varför andra stand-in-smokes är gröna

- s36 och s37 kör mot samma mall och är gröna i v45. Inget av dem räknar exercises-GET eller väntar på admin-bankens listor. Föreningens mallar laddas separat (`loadClubAdmin` mot `club_templates`, `ClubAdminSection.tsx:27–31`). Läst ur kod, inte kört.
- s47 och s52 (admin) kör mot `verifier/slice-47-fake-supabase.mjs`, som svarar oavsett vilka kolumner som begärs.

## Det som inte är bevisat

- PostgREST-svarets status och text (väntat 400, kod `42703`, «column exercises.default_station_layout does not exist»). Netloggen sparar inte status. Reserv-GET:en i `bank.ts:192` körs bara när felet nämner kolumnen, så den syns i netloggen bara om texten stämmer. Det stöder hypotesen men är inte direkt bevis.
- Att schema-57 i mallen gör alla 29 gröna. Det visar Builder i checklistans AC 3–5.
