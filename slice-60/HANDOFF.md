# Slice 60 — HANDOFF till Builder (FÖRESLAGEN, inte låst)

**Status:** FÖRESLAGEN 2026-11-10. **Bygg inte** förrän Christoffer låst via PO och PO skickat byggkortet (Docs pingar inte Builder). Bas main @ `34ec865`, docs-gren `slice-60-docs`. **Ingen merge utan Christoffers OK.**
**Beskrivningen nedan gäller ★ A1 B1 C1 D1 E1 F1 G1 H1.** Avvikande lås: se slutet.
**Rör inte:** `app/` (D1: tom diff), smokernas förväntningar i `verifier/slice-3{1,2,3}-builder-smoke.mjs`, `slice-57/content/schema-57.sql`, `slice-58/content/schema-58.sql`. Ingen SQL mot riktiga projektet.
**Kör från egen worktree.** Huvudklonen har oincheckade borttagningar av `tools/bank/out/*` (bl.a. `bank-seed.sql`, som mallen byggs av).

## 1. Bekräfta orsaken först (E1)

Innan något ändras, på `34ec865`:
- `bash verifier/tools/doctor.sh` → PASS.
- `bash verifier/tools/run-smokes.sh slice-31-builder-smoke` → C1a och C2a FAIL som i v45.
- I körningens egen databas (`eval "$(bash verifier/tools/db-new.sh s60probe)"`, `start.sh`): en läsande `curl` mot PostgREST `…/rest/v1/exercises?select=default_station_layout&limit=1` med körningens lokala publishable-nyckel (via gatewayen) → förväntat 400 med `42703` och kolumnnamnet. Spara svaret i `verifier/slice-60-checks/probe-before.txt`. `db-drop.sh s60probe` efteråt.
- Stämmer det inte: stoppa och rapportera till PO. Bygg inte vidare på en fel hypotes.

## 2. Stand-in-mallen (A1, C1)

`verifier/slice-32-local/setup.sh`:
- Ny variabel `SCHEMA57=${S32_SCHEMA57:-$REPO/slice-57/content/schema-57.sql}` bredvid `SCHEMA32` (`:21`).
- Kör den efter schema-32 (`:93`): `$P -d $DB -f "$SCHEMA57" >/dev/null`.
- Lägg `"$SCHEMA57"` sist i hashen (`:101`) och i slutraden (`:114`).
- Kommentaren `:2` och `:8–9`: «… → schema-32 → schema-57 (som live sedan Slice 57)».

`verifier/tools/doctor.sh:29–31`: samma femte fil i `want`-hashen, så att mallen byggs om av sig själv (`:32–38`). Kommentaren «same formula as setup.sh --template» ska fortfarande stämma.

`schema-58.sql` läggs **inte** till (låst HOPPAS ÖVER, inte inklistrad live). Slice 36:s SQL körs fortfarande bara per körning för s36 (`run-smokes.sh:72–74`).

## 3. Doctor-kontroll av kolumner (F1)

I `doctor.sh`, efter malldatabasen (avsnitt 2):
- Läs kolumnlistan ur `app/src/lib/bankRow.ts` (`BANK_EXERCISE_COLUMNS`, strängarna mellan `[` och `]`) och lägg till `updated_at`, `updated_by` (`adminBank.ts:13`).
- Fråga mallen (lokalt, läsande): `select column_name from information_schema.columns where table_schema='public' and table_name='exercises'` mot `bank_template`.
- Alla finns: `PASS stand-in har appens exercises-kolumner (n)`.
- Saknas någon: `BLOCKED stand-in saknar kolumn <x> — lägg schemafilen i verifier/slice-32-local/setup.sh`. BLOCKED är aldrig PASS.
- Ingen kontakt med riktiga projektet. Inga nycklar i loggar eller filer.

## 4. Docs i repot

- `verifier/README.md`: tabellraden för `standin/` säger vilka schemafiler mallen har (31, seed, 32, 57) och att Doctor stoppar när en kolumn saknas.
- `verify-traningsplaneraren/SKILL.md` steg 1 (Doctor): en mening om kolumnkontrollen.
- `verifier/smoke-map.json`: `note` för s31, s32 och s33 → «lagad i Slice 60 (stand-in schema-57)».
- `SLICE60-SHIPPED.md` i roten: utfallet av steg 1, diffen, smokes före och efter, och att `app/` är orörd.

## 5. Bevis

- `git diff 34ec865 -- app/` tom. `SLICE_NUMBER` stannar `'59'`.
- Doctor: mallen ombyggd med ny sha256, kolumnkontrollen PASS. Visa också att kontrollen kan säga BLOCKED: kör den mot en mall utan schema-57 (t.ex. `S32_SCHEMA57=/dev/null` i en egen `TPV_HOME`) och spara utskriften. Rör inte den delade mallen för det testet.
- `run-smokes.sh --baseline <main-cachens smoke-baseline.txt> slice-31-builder-smoke slice-32-builder-smoke slice-33-builder-smoke` → 47/0, 78/0, 146/0 (eller fler PASS), LAGAD för alla tre.
- Hela loopen (`run-smokes.sh all`) → 23 skript, 0 FAIL, inga NY FAIL. Netlog: 0 anrop till live-projektet.
- Spara i `verifier/slice-60-checks/`.

## 6. PR

- Gren `slice-60-code` från `34ec865`, PR mot main med `SLICE60-SHIPPED.md`. Ingen merge. Head-SHA och bevis till PO, inte till Verifier direkt.

## Andra lås

- **A2/G2:** reservhämtning i `loadAdminBank` och `refreshAdminRow` (`adminBank.ts:46–89`) med samma villkor som `bank.ts:190–193` (felet nämner `default_station_layout` → fråga utan den). Enhetstest i `lib/admin/` med mockad klient. Kräver D2 (bundle mot main i PR) och H2 (`SLICE_NUMBER = '60'`, footer-smokes följer `sliceNumber()`).
- **A3:** avråds. Packen beskriver inte hur.
- **B2:** (a) `run-smokes.sh compare()` skriver `SAMMA (baslinjen röd: n FAIL)` när baslinjen har FAIL. (b) regel i `backlog/PSTACK-OPS.md`: säger `pick-smokes` HELA LOOPEN, kör Builder och Verifier hela loopen före claim.
- **F2:** ny `verifier/slice-60-standin-smoke.mjs` med `"standin": "s32"` i smoke-map: admin-inloggning, «Väntar på godkännande (n)» och «Saknar skiss (n)» syns, ledarstart exakt två GET.
