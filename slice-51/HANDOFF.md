# Slice 51 — HANDOFF (FÖRESLAGEN)

**Status:** FÖRESLAGEN. Gäller A1 B1 C1 D1 E1 F1 om de låses. Bas main @ 055af39.

Gränser: rör inte `app/`. Ingen SQL mot det riktiga projektet, inga anrop till live-värden (netlog ska visa 0). Inga nycklar i repot eller i incheckade loggar (bara prefixen `sb_publishable_`/`sb_secret_`). Inget push till main, ingen force-push, ingen `--no-verify`. Kör allt via `verifier/tools/run-smokes.sh` mot lokal stand-in.

## 0. Bekräfta orsaken först
Kör varje skript i scope en gång på 055af39 med `run-smokes.sh` och spara hela loggen (inte bara `tail -1`) i `verifier/slice-51-checks/before/<skript>.txt`. Stämmer orsaken inte med README-tabellen: skriv den verkliga orsaken i ship notes innan något rättas.

## 1. Startväg (A1)
- Ny `verifier/tools/smoke-start.mjs`:
  - `startTomt(p)`: klicka «Planera pass» (`.home-start` knappen med `UI.homeWizardPrimary`) → «Tomt pass» i guiden → vänta på `.builder`.
  - `startMall(p, namn = 'Nybörjare')`: «Planera pass» → «Starta från mall» → välj kort → «Använd mall» om bekräftelsen visas → `.builder`.
  - Väljare enligt `verify-traningsplaneraren/features/home-kom-igang.md` (Stabila väljare), roll + synlig svensk etikett först.
- Byt i:
  - `slice-37-builder-smoke.mjs` `openFromHome()` (rad 61–64)
  - `slice-42-builder-smoke.mjs` `tomt()` (rad 30)
  - `slice-43-builder-smoke.mjs` rad 21
  - `slice-44-builder-smoke.mjs` rad 34
  - `slice-45-builder-smoke.mjs` rad 34 och 89
- Ändra inga förväntade värden i AC-kontrollerna. Faller en AC fortfarande efter fixen: undersök om appen har ändrats med avsikt sedan sliceen (se slicens `decisions.md`) och skriv det i ship notes. Ändra AC bara med hänvisning till ett låst beslut.

## 2. s30, s30-fix, seed, s31 (B1)
- s30, s30-fix: byt den statiska importen (rad 3) mot `await import(process.env.PW_CORE ?? '/tmp/pw/node_modules/playwright-core/index.mjs')`.
- Alla fyra: `BASE`/`OFF`/`ON` från `S30_URL`, `S31_OFF_URL`, `S31_ON_URL`. `ROOT` från `SMOKE_ROOT`. Dagens värden blir standard.
- s31: PostgREST-URL från stand-in-miljön (`S32_POSTGREST_PORT` som `db-new.sh` sätter) i stället för 54332. `"standin": "s32"` i kartan.
- `run-smokes.sh` rad 24–26: exportera `S30_URL=$P S31_OFF_URL=$P S31_ON_URL=$B`.
- Resultatfiler som skripten skriver (`slice-30-smoke-results.json` m.fl.) återställs före commit, som i Slice 50.

## 3. s32 (C1)
- Byt «Skicka länk»-flödet (rad 169, 284) mot inloggning med kod, samma hjälpare som s33 (`waitMail` + kodfält). Flytta gärna hjälparen till `verifier/tools/smoke-login.mjs` och låt s33 använda den också.
- AC50 (rad 209): förväntad sidfot byggs från `SLICE_NUMBER` i `app/src/data/blockMeta.ts` (läs filen, importera inte appen).
- AC som bara gäller magisk länk: ta bort och lista id:n i ship notes (öppen fråga 3).

## 4. Exit-kod och baslinje (D1)
- Alla skript i `smoke-map.json`: efter sammanfattningsraden, `process.exitCode = results.some((r) => !r.ok && !r.karantan) ? 1 : 0`. Behåll sista raden `PASS n / FAIL m` (eller `n/m pass`) så att `run-smokes.sh` fortfarande kan läsa den.
- `run-smokes.sh`: nytt flagga `--baseline <fil>`. Per skript: jämför exit och antal med baslinjens rad (ignorera tider). Skriv `SAMMA`, `NY FAIL` (fler FAIL, färre PASS eller exit från 0 till ≠0) eller `LAGAD`. Exit 1 om minst en `NY FAIL`.
- Spara också hela loggen; `tail -1` räcker inte när ett skript kraschar (då blir raden bara `Node.js v20.19.2`). Skriv första raden som börjar med `Error`/`TypeError` när exit ≠ 0 och ingen sammanfattningsrad finns.
- `doctor.sh` rad 75–77 och `weekly.sh`: använd `--baseline`.

## 5. Karantän (E1)
- Kartan: `"karantan": {"ids": ["AC16d", "AC11d"], "limit": "≥2/20"}` (tomt i dag; s33 var 1/20).
- Skript skriver `KARANTÄN-FAIL [id]` i stället för `FAIL [id]` för id i listan (läs listan från kartan via `SMOKE_MAP`).
- `run-smokes.sh` lägger till en rad per KARANTÄN-FAIL i `/home/box/tp-verify/quarantine.tsv` (datum, sha, skript, id). Samma id två körningar i rad → `NY FAIL`.
- `pick-smokes.mjs` rad 47: texten nämner räkningen och gränsen.

## 6. Småfixar (F1)
- Ny `verifier/tools/lib.sh` med `pw_ok()` (kontroll från `doctor.sh` rad 24). `doctor.sh` och `install-once.sh` (rad 113) använder den.
- `doctor.sh` rad 72: `bun test src` i `app/` → `test.txt`; `bun test tools/bank` från `$WT` → `test-bank.txt`.
- `smoke-map.json`: `baseline` blir `"ok" | "kända-fel" | "kraschar"`. Sätt värdet utifrån körningen i §0 och efter fixen. De elva skripten i scope ska bli `"ok"`. Uppdatera `pick-smokes.mjs` rad 9 och 46 och `weekly.sh` rad 22.
- Port: `setup.sh --template` väljer `54741 + (cksum av TPV_HOME) % 100` om `S32_PG_PORT` saknas och skriver den i `env.json`. `doctor.sh` rad 41 läser redan därifrån. `slice-36-local/env.sh` rad 7 likaså.
- `tools/bank/push-promote.test.ts` rad 209, 211, 237: `const S32 = process.env.S32_DIR ?? '/home/box/tp-verify/standin'`.

## 7. Levande docs
- `verifier/README.md`: `--baseline`, karantänfilen, nya baseline-värden.
- PROJECT.md: inga ändringar krävs. Om `test-bank.txt` läggs till i main-cachen: en rad i Verifieringsrecept steg 1, på kodgrenen.
- `backlog/IMPROVEMENTS.md`: post «Laga trasiga smokes» → Slice 51.
- Ingen ändring av `SLICE_NUMBER`.
