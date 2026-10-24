# Slice 51 — Laga trasiga smokes

**App:** Träningsplaneraren (appen ändras inte)
**Status:** **LÅST** 2026-10-24 av Christoffer (svar via PO-chatten: «Lås enligt rekommendationerna»): A1 B1 C1 D1 E1 F1. Bas: main @ 055af39. Gren: `slice-51-docs`. Se `decisions.md`.
**Effort:** **L** (se nedan).
**Källa:** PO-uppdrag 2026-10-24. Underlag: `verifier/smoke-map.json`, `verifier/slice-50-checks/main-smoke-baseline.txt`, `verifier/slice-50-verify-checks/loop.txt`, `verifier/slice-50-verify-report.md` (Quality Masters fynd M1, M2 och Info), `verifier/tools/`.

## Varför

Smoke-loopen säger i dag lite. Av 22 skript är bara s48 och s49 `"baseline": "ok"`. Resten är märkta `trasig`, och flera av dem kör inte alls. En regression i de områdena syns bara om någon jämför siffror för hand.

### Smokes som faller på main (punkt 1)

Orsakerna nedan kommer från skripten och appkoden på 055af39. Inga smokes kördes för den här texten.

| Skript | Utfall på main | Orsak |
|---|---|---|
| `slice-30-builder-smoke`, `slice-30-fix-b1-smoke` | exit 1 på 0–1 s | Rad 3 importerar `/usr/local/lib/node_modules/playwright-core/index.mjs`, som inte finns längre (kommentaren på rad 3 i seed-skriptet: «was gone on 2026-10-02»). Läser inte `PW_CORE`. Dessutom fast `BASE` 4173 (rad 6) och `ROOT = '/workspace/gymnastics-planner'` (rad 7–8), alltså huvudcheckouten i stället för worktreen. |
| `seed-2DJ_oMM81mI-smoke` | exit 1 på ca 1 s | Läser `PW_CORE`, men `BASE` är fast `127.0.0.1:4173` (rad 7) och `ROOT` är fast (rad 8). `run-smokes.sh` startar inget på 4173. Kartans not om saknade fixtures stämmer inte: `slice-30/content/example-import.json` finns. |
| `slice-31-builder-smoke` | exit 1 på ca 1 s | Fasta `OFF` 4173 och `ON` 4174 (rad 11–12), PostgREST på 54332 (rad 4) och fast `ROOT` (rad 15). `tools/bank/out/bank-seed.json` finns i repot. |
| `slice-32-builder-smoke` | 16 PASS / 16 FAIL | Inloggningen förutsätter Slice 32-flödet: knappen «Skicka länk» (rad 169, 284) och sidfoten «Träningsplaneraren · Slice 32 · Logga in som admin» (AC50, rad 209). Appen har inloggningskod och sidfoten säger «Slice 49». |
| `slice-37-builder-smoke` | exit 1 på 12 s | `openFromHome()` (rad 61–64) klickar på knappen `/^(Starta f\|F)rån mall$/` direkt på startsidan. Sedan Slice 46 har startsidan bara «Planera pass» (`Home.tsx` rad 82–89). «Tomt pass» och «Starta från mall» ligger i guiden (`HomeWizard.tsx`). Klicket når timeout och skriptet kraschar. |
| `slice-42-builder-smoke` | 1/11 | `tomt()` (rad 30) klickar på «Tomt pass» på startsidan. Samma orsak som s37. |
| `slice-43-builder-smoke`, `slice-44-builder-smoke`, `slice-45-builder-smoke` | 1/9, 1/10, 2/20 | Rad 21 (s43) och rad 34 (s44, s45) klickar på «Från mall» på startsidan. s45 rad 89 klickar på «Tomt pass». Samma orsak. |

Orsaken för s37 och s42–45 är bara läst ur koden. Den första uppgiften i Builder-steget är att köra skripten och se att felet uppstår just där (AC1).

### Quality Masters fynd från Slice 50 (punkt 2)

| Fynd | Var |
|---|---|
| s33 slutar med exit 0 trots FAIL | `verifier/slice-33-builder-smoke.mjs` rad 1037–1040: skriver `PASS n / FAIL m` men sätter aldrig `process.exitCode`. Samma mönster i de flesta `*-builder-smoke.mjs` (main-baslinjen: exit 0 med FAIL i s32–s45 och s47). |
| run-smokes jämför inte själv mot baslinjen | `verifier/tools/run-smokes.sh` rad 46–47 skriver bara en rad per skript. Ingenting läser `smoke-baseline.txt`. I Slice 50 jämförde Verifier för hand (`slice-50-verify-report.md`, «Loop result»). |
| Karantänen kan dölja en riktig regression i s33 AC16d/AC11d | `verifier/tools/pick-smokes.mjs` rad 47: AC i `karantan` räknas inte som FAIL. Enda skyddet är en manuell rad i checklistan (M1). s33 är inte i karantän i dag (1/20 i Slice 50 AC11), men regeln gäller vid ≥2/20. |
| Doctor och install-once letar i olika Playwright-kataloger | `doctor.sh` rad 24 kräver `~/.cache/ms-playwright/chromium_headless_shell-*` och `/usr/bin/google-chrome`. `install-once.sh` rad 113 nöjer sig med `chromium*`. install-once kan säga «ok» medan Doctor säger BLOCKED. |
| Cachesteget kör `bun test` i stället för `bun test src` | `doctor.sh` rad 72: `cd "$WT/app" && bun test`. PROJECT.md anger `cd app && bun test src` och `bun test tools/bank` från repo-roten. `test.txt` i main-cachen kan alltså inte jämföras med Builders `bun test src`. |
| s34–47 märkta `trasig` fast de körs | `verifier/smoke-map.json`: s34–s36 och s38–s47 har `"baseline": "trasig"` utan `inLoop: false`. Märket betyder både «kraschar» och «kör med kända FAIL». |
| Port 54741 delas mellan tool homes | `doctor.sh` rad 41 (standard 54741), `slice-32-local/setup.sh` rad 14, `slice-36-local/env.sh` rad 7. Två `TPV_HOME` kan inte köra Doctor samtidigt. |
| tools/bank hårdkodar `/tmp/s32` | `tools/bank/push-promote.test.ts` rad 209, 211 och 237. Slice 50 flyttade stand-in till `/home/box/tp-verify/standin`, så testerna hoppar över eller faller utan `/tmp/s32`. |

## A–F (★ = förslag)

### A. Startväg i s37 och s42–45
- **A1 ★** En gemensam hjälpare `verifier/tools/smoke-start.mjs` med `startTomt(p)` och `startMall(p, namn)`: «Planera pass» → «Tomt pass» eller «Starta från mall» i guiden, med väljare från `features/home-kom-igang.md` (Stabila väljare). s37, s42, s43, s44 och s45 använder den. Nästa ändring av startsidan rättas på ett ställe.
- A2 Rätta varje skript för sig. Mindre ny kod, men fem kopior av samma väg.
- A3 Pensionera s42–45 och lita på s46/s49. De täcker inte samma AC, till exempel utskrift i s44 och hallmått i s43.

### B. s30, s30-fix, seed och s31
- **B1 ★** Samma mönster som s34–49: `PW_CORE` för Playwright, URL:er och `ROOT` från miljön (`S30_URL`, `S31_OFF_URL`, `S31_ON_URL`, `SMOKE_ROOT`) med dagens värden som standard. `run-smokes.sh` exporterar dem. s31 får `"standin": "s32"` i kartan och läser PostgREST-porten från stand-in-miljön i stället för 54332. `inLoop: false` tas bort.
- B2 `run-smokes.sh` startar extra servrar på 4173/4174. Kolliderar med Builders preview på 4173 och med parallella körningar.
- B3 Pensionera de fyra skripten. Importflödet från Slice 30 och banken från Slice 31 blir då utan smoke.

### C. s32 (admin-inloggning)
- **C1 ★** Byt magisk länk mot inloggningskod (samma väg som s33 och s47: «Logga in som admin» i sidfoten → kod från stand-in-mejlet). AC50 kontrollerar sidfoten med `SLICE_NUMBER` från `app/src/data/blockMeta.ts` i stället för texten «Slice 32». AC som uttryckligen testar magisk länk tas bort och listas i rapporten.
- C2 Behåll bara de AC i s32 som inte redan finns i s33/s47.
- C3 Låt s32 stå kvar som `trasig`.

### D. Exit-kod och jämförelse mot baslinjen
- **D1 ★** Varje smoke i kartan sätter `process.exitCode = 1` när någon rad är FAIL (karantän räknas inte). `run-smokes.sh` får `--baseline <fil>`: jämför exit och PASS/FAIL-antal per skript med main-cachens `smoke-baseline.txt` och skriver `SAMMA`, `NY FAIL` eller `LAGAD` per skript. Exit 1 om någon rad är `NY FAIL`. Doctor och `weekly.sh` använder det.
- D2 Bara jämförelsen i `run-smokes.sh`, exit-koderna orörda.
- D3 Som i dag: Verifier jämför för hand.

### E. Karantän och tillåtna fel
- **E1 ★** En AC i karantän körs fortfarande och skrivs som `KARANTÄN-FAIL`. `run-smokes.sh` räknar dem per AC i `/home/box/tp-verify/quarantine.tsv`. Gränsen står i kartan som `"karantan": {"ids": [...], "limit": "≥2/20"}`. Om samma AC faller i två körningar i rad räknas det som `NY FAIL`, oavsett karantän. Det täcker M1 utan att ta bort karantänen.
- E2 Ingen karantän. s33 AC16d räknas alltid som FAIL (1/20 i Slice 50).
- E3 Som i dag: bara manuell rad i checklistan.

### F. Småfel i verktygen
- **F1 ★** Alla i samma slice:
  - Doctor och install-once använder samma kontroll: `chromium_headless_shell-*` + `/usr/bin/google-chrome`, i en funktion i `verifier/tools/lib.sh`.
  - Cachesteget kör `bun test src` i `app/` och `bun test tools/bank` från roten, i separata filer `test.txt` och `test-bank.txt`.
  - Kartan delar `trasig` i `"baseline": "ok" | "kända-fel" | "kraschar"` och räknar om alla skript efter fixen.
  - Postgres-porten härleds från `TPV_HOME` (t.ex. 54741 + hash % 100) och skrivs i `env.json`, som Doctor redan läser (rad 41).
  - `tools/bank/push-promote.test.ts` läser `S32_DIR` med standard `/home/box/tp-verify/standin`.
- F2 Bara Playwright-kontrollen och `bun test src`, resten i en senare slice.
- F3 Inga verktygsfixar i den här slicen.

Ingen ändring i `app/`, **bundle 0 B**, **ingen höjning av SLICE_NUMBER** (står kvar på '49'). Samma skäl som Slice 50: appen ändras inte, och en sidfot som byter siffra utan appändring vore missvisande.

## Effort

**L.** Elva skript ska rättas och köras om (s30, s30-fix, seed, s31, s32, s37, s42–45), plus två verktygsändringar med logik (baslinjejämförelse, karantänräkning) och fem småfixar. s32 och s44 är stora skript. Varje rättelse måste köras mot både main och gren för att visa att FAIL försvinner av rätt skäl. s32 kräver inloggning via stand-in-mejl, där s33-flaken finns. Exit 1 vid FAIL ändrar hur Doctor och `weekly.sh` tolkar alla skript. Med bara A1, B1 och D1 vore det M.

## Bundle

0 B. `app/` ändras inte. AC14 kontrollerar det.

## Öppna frågor

1. s33:s egna 12 FAIL (gamla texter «Skicka länk», «Från mall») och kända FAIL i s34–36, s38–41, s46 och s47 ingår inte i uppdraget. Ska de med här, eller i en Slice 52? Förslag: Slice 52.
2. s46 kraschar på main (fixturen `/tmp/s46fix.json` saknas) men står inte i listan. Ta med här? Förslag: ja, samma typ av fix som B1, Effort S.
3. C1: får AC som bara testar magisk länk tas bort ur s32, när appen inte har den vägen längre?
4. E1: räcker «två körningar i rad» som gräns för att karantän blir NY FAIL, eller ska det vara ≥2 av de senaste 20, alltså samma gräns som för att sätta karantän?
5. D1: exit 1 vid FAIL gör att Doctors smoke-baslinje innehåller exit 1 för skript med kända fel. Okej, när jämförelsen går på antal och inte bara exit?
