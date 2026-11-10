# Slice 60 — s31–33-felen från veckokörning v45 (infra, A1 B1 C1 D1 E1 F1 G1 H1)

Beslut: [`slice-60/decisions.md`](https://github.com/Drevmok/traningsplaneringen/blob/e230f65/slice-60/decisions.md) (Docs `slice-60-docs` @ `e230f65`). Bas: main `34ec865` · gren: `slice-60-code` · kodcommit: ``d43a8c9``.

**Merga inte** — väntar på verifiering. **Ingen SQL mot riktiga banken** (C1): `schema-57.sql` körs bara i den lokala stand-in-mallen. **Appen orörd** (D1/G1): `git diff 34ec865 -- app/` är tom, bundle 219746 B gzip både före och efter (0 B). `SLICE_NUMBER` stannar `'59'` (H1).

## Orsaken bekräftad före ändringen (E1)
- Doctor PASS på `34ec865` (`verifier/slice-60-checks/doctor-before.txt`, mall sha256 `c2ddf0d…`).
- `slice-31-builder-smoke` på `34ec865`: 45/2, C1a och C2a FAIL. Netloggen har exercises-GET både med och utan `default_station_layout` (12 med, 8 utan; `netlog-s31-before.txt`).
- PostgREST i egen körningsdatabas (`bank_s60probe`, via gatewayen): `GET /rest/v1/exercises?select=default_station_layout&limit=1` → **HTTP 400**, `{"code":"42703","message":"column exercises.default_station_layout does not exist"}`. Samma tabell utan kolumnen → 200 (`probe-before.txt`). Hypotesen i packen stämmer.

## Vad som ändrades
- **A1/C1** `verifier/slice-32-local/setup.sh`: `SCHEMA57=${S32_SCHEMA57:-slice-57/content/schema-57.sql}` körs efter schema-32 och ingår sist i `template.sha256`. Mallen: roles → GoTrue → schema-31 → seed → schema-32 → schema-57, som live sedan Slice 57. `schema-58.sql` ingår inte (låst HOPPAS ÖVER).
- **F1** `verifier/tools/doctor.sh`: samma femte fil i `want`-hashen, så att mallen byggs om av sig själv. Ny kontroll efter malldatabasen: kolumnerna i `BANK_EXERCISE_COLUMNS` (läst ur `app/src/lib/bankRow.ts`) plus `updated_at`, `updated_by` ska finnas i `bank_template.public.exercises` (läsande fråga mot `information_schema`, bara lokalt). Saknas en: `BLOCKED stand-in saknar kolumn <x> — lägg schemafilen i verifier/slice-32-local/setup.sh`, exit 1. Går listan inte att läsa: BLOCKED. Ny variabel `TPV_SCHEMA57` (som `TPV_BANK_SEED`) skickas vidare till `setup.sh`; den behövs för att visa BLOCKED i en egen `TPV_HOME`, eftersom Doctor nollar alla `S3x_`-variabler.
- Docs: `verifier/README.md` (raden för `standin/`), `verify-traningsplaneraren/SKILL.md` steg 1, `verifier/smoke-map.json` (`note` för s31–33 «lagad i Slice 60 (stand-in schema-57)»).
- Smokes, `schema-57.sql`, `schema-58.sql` och `app/` är orörda.

## Smokes före och efter (`--baseline` main-cachen `34ec865`)

| Skript | Före (34ec865) | Efter | Mot baslinjen |
|---|---|---|---|
| slice-31-builder-smoke | 45/2 | 47/0 | LAGAD (FAIL 2→0) |
| slice-32-builder-smoke | 42/14 | 78/0 | LAGAD (FAIL 14→0) |
| slice-33-builder-smoke | 111/13 | 146/0 | LAGAD (FAIL 13→0) |
| slice-36-builder-smoke | — | 46/46 | SAMMA |
| slice-37-builder-smoke | — | 24/24 | SAMMA |

Alla 29 FAIL-id → PASS (`fail-to-pass.txt`). Blocken AC29, AC31, AC33, AC34, AC35, AC36, AC37 (och S32-varianterna i s33) skriver bara en egen rad när de kraschar; efter ändringen körde de utan fel och alla deras delkontroller är PASS. s31 efter: 12 exercises-GET, alla med `default_station_layout`, 0 reserv-GET (`netlog-s31-after.txt`). Probe efter: 200, `[{"default_station_layout":null}]`, 51/51 rader null (`probe-after.txt`).

## Hela loopen (`run-smokes.sh --baseline … all`, som `weekly.sh`)
23 skript, alla exit 0, 0 FAIL. s31–33 LAGAD, övriga 20 SAMMA, inga NY FAIL, inga KARANTÄN-FAIL. Netlog: 4470 anrop, 0 till live-projektet (`loop-all.txt`).

## Checklistan (`slice-60/verification-checklist.md`)
| # | Utfall |
|---|---|
| 1 | PASS: C1a, C2a FAIL på `34ec865`; netloggen har GET med och utan `default_station_layout` |
| 2 | PASS: 400, `42703`, kolumnnamnet (`probe-before.txt`) |
| 3 | PASS: s31 47/0 |
| 4 | PASS: s32 78/0, alla 14 id PASS |
| 5 | PASS: s33 146/0, alla 13 id PASS |
| 6 | PASS: LAGAD för s31, s32, s33; inga NY FAIL |
| 7 | PASS: 23 skript, 0 FAIL, inga NY FAIL, inga KARANTÄN-FAIL |
| 8 | PASS: s36 46/46, s37 24/24 |
| 9 | PASS: ny sha256 `7cd50f7…`, `PASS stand-in har appens exercises-kolumner (25)` |
| 10 | PASS: `BLOCKED stand-in saknar kolumn default_station_layout — …`, exit 1 (egen `TPV_HOME`) |
| 11 | PASS: `schema-58` finns inte i `setup.sh` eller `doctor.sh` |
| 12 | PASS: `git diff 34ec865 -- app/` 0 B, bundle 219746 B båda, `SLICE_NUMBER = '59'` |
| 13 | PASS: diffen för s31–33-skripten är tom |
| 14 | PASS: `schema-57.sql` oförändrad |
| 15 | PASS: build, lint, `bun test src` 319/0, `bun test tools/bank` 21/0 (som main-cachen) |
| 16 | PASS: README, SKILL, smoke-map uppdaterade |
| 17 | PASS: den här filen |
| 18 | Efter merge (rutinen), inte en Verifier-grind |

## Doctor (F1)
- Efter ändringen, delade `TPV_HOME`: `INFO malldatabas inaktuell (c2ddf0dcd9a8… → 7cd50f797cf6…), bygger om`, `PASS malldatabas ombyggd sha256=7cd50f797cf6…`, `PASS stand-in har appens exercises-kolumner (25)`, Doctor PASS (`doctor-after.txt`).
- Egen `TPV_HOME=/tmp/tpv-s60-f1`, `TPV_SCHEMA57=/dev/null`, `TPV_NO_MAIN=1`: `BLOCKED stand-in saknar kolumn default_station_layout — lägg schemafilen i verifier/slice-32-local/setup.sh`, `Doctor: BLOCKED`, exit 1. Samma `TPV_HOME` med schema-57: PASS (25 kolumner). Den egna mallen är borttagen efteråt (`doctor-f1-blocked.txt`).

## Enhetstester och bygg (`unit-build.txt`)
`bun test src` 319/0 · `bun test tools/bank` 21/0 · `npm run build` exit 0 · `npm run lint` exit 0. Samma som main-cachen `34ec865`.

## Not om Slice 59 `content/schema-notes.md`
Meningen «Då hamnar alla Teknik med redskap i kön, och ingenting kraschar» gäller bara ledarvägen (`bank.ts` gör en reservhämtning utan kolumnen). Adminvägen har ingen reserv: `loadAdminBank` returnerar `false` vid fel (`app/src/lib/admin/adminBank.ts:50–56`), och Admin-vyn blir tom utan felrad. Det är en uppföljning i backloggen (G1), inte en del av Slice 60. `slice-59-docs` är inte ändrad.

## Box (inte i repot)
Boxen saknade Postgres 17-servern och Playwright-cachen, och den delade mallens `pg/` var skadad (`pg_notify` saknades). `install-once.sh` installerade Playwright. `apt-get` fick HTTP 500 från speglarna, så `postgresql-17` installerades från Debians `.deb`-filer med `dpkg -i`. Mallen byggdes om med `setup.sh --template` på `34ec865` innan före-körningen.
