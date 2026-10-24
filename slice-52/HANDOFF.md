# Slice 52 — HANDOFF (FÖRESLAGEN)

**Status:** FÖRESLAGEN. Gäller A1 B1 C1 D1 E1 F1 om de låses. Bas main @ 84b44e7.

Gränser: rör inte `app/`. Ingen SQL mot det riktiga projektet, inga anrop till live-värden (netlog ska visa 0). Inga nycklar i repot eller i incheckade loggar (bara prefixen `sb_publishable_`/`sb_secret_`). Inget push till main, ingen force-push, ingen `--no-verify`. Kör allt via `verifier/tools/run-smokes.sh`.

## 0. Bekräfta orsakerna
Kör s37, s43, s44, s45 och s46 en gång på 84b44e7 och spara hela loggarna i `verifier/slice-52-checks/before/`. Väntat: s43 20/21, s44 30/31, s45 37/40, s46 35/37 med de sju FAIL i README-tabellen. Avviker något: skriv den verkliga orsaken i ship notes innan du rättar.

## 1. De sju FAIL (A1)
- **s43 AC5** (rad 65): byt `count() === 4` mot en kontroll av etiketterna i `.hall-header-actions`: «Ändra stationer», «Visa flöde»/«Dölj flöde», «Förrådslista», «Golvklart», plus «Använd alla förslag» när `.hall-saknar-banner` finns. Behåll `above` och `small.length === 0`. Kommentar: Slice 48 B1, Slice 49 D1.
- **s44 AC6** (rad 161–171): ta bort `mall(p, MAIN)`, «Exportera / dela» och `replace('4410', '4444')`. Läs token från `verifier/fixtures/old-share-links.json` (`s44`) och öppna `BR + '#' + token`. AC12-delen (klistra in på startsidan) använder samma URL.
- **s45 AC10** (rad 177–195): ta bort steget på main med `#hall-layout-select`. Token `s45` från samma fixtur (hall `standard-trupp`). Behåll kraven: markörer i Delat pass, sparat utkast har `forening-bla` och alla `zoneId === 'open'`. AC14-replace i samma block oförändrad.
- **s45 AC1** (rad 58–60): efter varje klick, vänta på rubriken i stället för 200 ms: `await p.locator('.home-wizard-sheet h2', { hasText: /^Hall$/ }).waitFor()`. Ändra inte förväntan.
- **s45 AC14-tall** (rad 259): ersätt `fl.h > 400` med: inte `modal--compact`, `bottom === 844` på 390×844 och beräknad `max-height` ≥ 85 % av fönstret. Kommentar: Slice 47 B1 tog bort «Vad finns i hallen ikväll?».
- **s46 AC10** (rad 131): `'53 / 90 min'` → `'90 / 90 min'`. Ta bort `(await Promise.resolve(true)) &&`. Kommentar: Slice 49 A1.
- **s46 AC17** (rad 246–254): i stället för fliken «Mallar»: öppna «Använd mall» i Passbyggaren och kontrollera att arket visar Föreningens mallar, Mina mallar och «Kopiera delningskod» / «Ta bort» på Mina mallar. Kommentar: Slice 47 A1. Byt namn på kontrollen till `AC17-usemall`, men behåll id `AC17`.

## 2. Gamla länkar (B1)
- `git worktree add /tmp/s52-old44 0d88da5` och `/tmp/s52-old45 cd19319^`. `npm ci && npm run build`, servera `dist` med `serve-dist.mjs` på en ledig port.
- s44: Nybörjare → «Exportera / dela» → «Kopiera länk». s45: samma pass, Hallöversikt → `standard-trupp` → «Dela»/«Exportera / dela» → «Kopiera länk».
- Spara `{ "s44": { "commit", "made", "token" }, "s45": { … } }` i `verifier/fixtures/old-share-links.json`. Bara texten efter `#dela=`. Ta bort worktreesen efteråt.

## 3. Svaga kontroller (C1)
- s43 rad 56–59: ta bort `ratioOk` och `?? 'AC3'`. Gå bara över `forening-bla` och `forening-vit`.
- s43 rad 73: kräv `.hall-flow-coach-tip` (värde `true`). Övriga selektorer: `null` eller `true`.
- s37 rad 114 (AC9a), 141 (AC9b), 188 (AC9e): kräv att toasten finns och börjar med `TOAST`. AC9b kräver dessutom att `OLD_NOTE` saknas om en bekräftelse finns.
- Felinjektion i scratch-worktree (inte i grenen): ändra toasttexten (`clubTemplateApplied` eller motsvarande i `blockMeta.ts`), bygg, kör s37 med `--baseline`. Väntat: AC9a, AC9b, AC9e FAIL, `NY FAIL`, rc 1. Spara i `verifier/slice-52-checks/c1-fault.txt`.

## 4. Runner och Playwright (D1)
- `run-smokes.sh` rad 81: spara `e`. Om `BASELINE` är tom och `e ≠ 0`: `ANYFAIL=1`. Rad 96: `exit $(( NEWFAIL || (ANYFAIL && !${#BASELINE}) ))` eller motsvarande läsbar `if`. Dokumentera i rubrikkommentaren.
- `lib.sh`: `PW_VERSION=1.63.0-alpha-2026-08-31`, `PW_REV=1243`. `pw_ok` kräver `chromium_headless_shell-$PW_REV` + `/usr/bin/google-chrome`.
- `install-once.sh` rad 28: `npx -y "playwright@$PW_VERSION" install chromium-headless-shell`.

## 5. Admin-import (E1)
- Ny `verifier/slice-52-admin-import-smoke.mjs`, mönster som s47: `PW_CORE`, `S52_BR` från miljön, `fakeBank` / `fakeSessionValue` från `slice-47-fake-supabase.mjs`, `KARANTAN` från `tools/smoke-exit.mjs`, `process.exitCode = 1` vid FAIL.
- Fixtur `verifier/fixtures/s52-import.json`: tre övningar, en med samma titel som en rad i fejkbanken.
- AC (id i skriptet): `IMP1` Admin → Importera övningar syns; `IMP2` fil → tre rader; `IMP3` dubbletten visar «Samma namn finns redan» och står på «Hoppa över»; `IMP4` Ta med på två → två POST med `status: 'pending'` mot fejken, inga mot live; `IMP5` raderna syns under «Väntar på godkännande (2)» med «Väntar»; `IMP6` kod-input ger samma lista som filen.
- Texterna ska komma från appen (`blockMeta.ts`), inte skrivas om i skriptet.
- `run-smokes.sh`: `S52_BR=$B` (bank-bygget, som s47). `smoke-map.json`: `"slice-52-admin-import-smoke": {"feature": "features/admin.md", "paths": ["app/src/components/AdminArea.tsx", "app/src/lib/ownImport.ts"], "baseline": "ok", "build": "bank"}`.

## 6. Baslinjen (F1)
- `doctor.sh` rad 81: `bash "$MC/wt/verifier/tools/run-smokes.sh" …`.
- Ny funktion `baseline_ok <fil>` i `lib.sh`: en `^<skript> exit=`-rad per nyckel i kartan (utom `karantan`), en `^netlog:`-rad, ingen `syntax error`. Doctor: misslyckas den byts namnet till `smoke-baseline.invalid.txt` och Doctor ger BLOCKED. `run-smokes.sh --baseline`: exit 2 med meddelande.
- På boxen: `mv …/055af39…/smoke-baseline.txt …/smoke-baseline.invalid.txt`. Kör Doctor så att cachen för 84b44e7 byggs.
- `smoke-map.json`: sätt `baseline` för s37 och s43–s46 efter den sista körningen.

## 7. Levande docs
- `verifier/README.md`: rc utan `--baseline`, `PW_VERSION`, `baseline_ok`, fixturen för gamla länkar.
- `verify-traningsplaneraren/features/admin.md`: rad om den nya smoken.
- `backlog/IMPROVEMENTS.md`: post «Kvarvarande smoke-fel» → Slice 52.
- PROJECT.md: inga ändringar. Ingen ändring av `SLICE_NUMBER`.
