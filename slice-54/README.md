# Slice 54 — Smoke-resterna

**App:** Träningsplaneraren (appen ändras inte)
**Status:** **LÅST** 2026-10-30 av Christoffer (svar via PO-chatten: «Ja, lås A1 B1 C1 D1 E1 F1»): A1 B1 C1 D1 E1 F1. Bas: main @ 03c0864. Gren: `slice-54-docs`. Se `decisions.md`.
**Effort:** **M** (se nedan).
**Källa:** Christoffer 2026-10-30: «Kör smoke-resterna». Underlag: `SLICE52-SHIPPED.md` («Open for Slice 53»), main-cachens baslinje för 7bf99cd (`/home/box/tp-verify/main/7bf99cd…/smoke-baseline.txt` och `smoke-out/logs/`), `verifier/tools/weekly.sh`, skripten nedan.

## Breddning 2026-10-30

Christoffer breddade sliten efter låsningen (via PO-chatten): «Bredda: skriv om s33 admin→AdminArea, tillåt club_templates-GET, utöka E1 till s40 AC1/AC2, utred s36 — sedan PR». Status är fortfarande **LÅST**.

Landat i PR #59 (commit e911064, gren `slice-54-smoke-resterna`), bara `verifier/`:
- **s33 → AdminArea (Slice 47):** hjälpare `openAdminArea/areaHeads/areaList/areaTitles/areaCard`; AC4b-local, S32-AC29a/c/d, AC31, AC33, AC34 «Dolda» går via Admin-vyn; AC29f väntar «Godkänn | Ändra i banken | Dölj för alla»; AC35 öppnar Biblioteket först.
- **s33 AC21c:** tre GET tillåtna (`club_templates`, `exercises`, `redskap`).
- **E1 utökad:** s40 AC1-main och AC2-main läser `GOLDEN[hall]` (första 3 `g-`-punkterna), som AC8-main.
- **s36 utredd:** mallsheet, Admin-vy för klubbadminverktyg, redskapsjämförelse oberoende av nyckelordning (jsonb), AC12 = ingen sektion när allt är dolt (Slice 49 E1). C-fasens «stale»-fel var en kaskad (B kraschade på AC12 före avdöljning). Inget appfel.
- **Resultat:** alla nio smokes exit 0, 0 FAIL (s33 146, s34 31, s35 41, s36 46, s38 26, s39 38, s40 20, s41 34, s47 32 PASS). Netlog 0 anrop mot live. Appen orörd, `SLICE_NUMBER` = 53. Avvikelser: s36 i `s32|s33`-fallet i run-smokes.sh rad 71; s41 AC16 ersätt-bekräftelse valfri. Se `SLICE54-SHIPPED.md` på PR-grenen.

## Varför

Efter Slice 52 faller nio skript fortfarande på main: s33 (12), s34 (2), s35 (13), s36 (4), s38 (1), s39 (5), s40 (4), s41 (2) och s47 (3). Totalt 46 FAIL. Så länge de står som `kända-fel` döljer de en riktig regression i samma område. Slice 53 rörde inte skripten utom s49.

Alla 46 FAIL går att förklara med att appen har ändrats med avsikt sedan skriptet skrevs. Ingen av dem pekar på ett fel i appen. Slicen ändrar därför bara `verifier/`. Orsakerna nedan är lästa ur loggar och kod; Builder bekräftar dem först (AC1).

## Fel per grupp (main 7bf99cd)

### 1. Startvägen (s33, s34, s36, s38, s39, s40, s41, s35 E)

| Skript | FAIL | Orsak |
|---|---|---|
| s33 | AC16, AC21, AC22, S32-AC29–31, S32-AC33, S32-AC34, S32-AC35, S32-AC36, S32-AC37 (11) | Rad 176 klickar «Tomt pass» och rad 865 «Från mall» på startsidan. Sedan Slice 46 finns de bara i guiden (`app/src/components/HomeWizard.tsx` rad 61). S32-AC35 följer av samma krasch (`.filter-row select` hittas inte eftersom Passbyggaren aldrig öppnas). |
| s39 | B, C, D, F, G (5) | «Tomt pass» på startsidan rad 124, 131, 201, 298, 305; «Starta från mall» rad 140, 150, 166, 172, 259, 314. |
| s41 | AC16 (1) | «Tomt pass» på startsidan rad 122. |
| s36 | B, C (2) | «Starta från mall» på startsidan rad 311, 387, 401, 410, 438, 449, 459. |
| s34 | B (1) | Guiden rad 155–160 klickar «Nästa». Guiden har ingen «Nästa» längre: ett tryck per svar, Ålder → Fokus → Hall → Passlängd (`HomeWizard.tsx` rad 61). |
| s38 | B (1) | Samma, rad 117–121 («Nästa», «Skapa pass»). |
| s40 | W, M (2) | Samma, rad 71–75. Plus «Starta från mall» på startsidan rad 168. |
| s35 | E (1) | Väntar på åldersval i guiden och följer samma gamla väg. |

`verifier/tools/smoke-start.mjs` (Slice 51) har redan `startTomt`, `startMall`, `openMallList` och `startFragor`. Skripten ovan använder dem inte. **Anpassa smoke.**

### 2. Sidfot och versionsnummer (s33, s34, s35, s36, s40, s41, s47)

| Skript | FAIL | Orsak |
|---|---|---|
| s33 | AC26l | Rad 1024–1027 kräver `'<text>'` för varje nyckel. `footerSliceLabel` är en mall-literal (`app/src/data/blockMeta.ts` rad 408: `` `Träningsplaneraren · Slice ${SLICE_NUMBER}` ``), så strängen står aldrig inom `'…'`. |
| s34 | AC20b | Rad 188, samma mönster. |
| s35 | AC2b, AC3, AC16d | Rad 79–80: väntar «Version: Slice 35». Rad 229: samma verbatim-mönster. |
| s36 | AC23 | Rad 468 kräver `SLICE_NUMBER = '36'`. |
| s40 | AC16-footer | Rad 195: fast «Slice 40». |
| s41 | AC22-footer | Rad 149: fast «Slice 41». |
| s47 | AC26-footer | Rad 448: fast «Slice 47». |

Sidfoten följer `SLICE_NUMBER` med avsikt. `sliceNumber(root)` finns i `verifier/tools/smoke-login.mjs` rad 11. **Anpassa smoke.**

### 3. s35 sidfotslayout

| FAIL | Orsak |
|---|---|
| AC1a, AC12-admina, AC12-notadmina | Väntar en ordning per länk; appen lägger «Tyck till» och `after` i samma rad `.app-footer-row` (`app/src/components/FooterFeedback.tsx` rad 24–29). Loggen visar `["Tyck till · Uppdatera appen", …]`. |
| A, B, D-admin, D-notadmin | `footer.app-footer p` träffar två element när tipsraden visas (strict mode). |
| AC11a, AC9-local | Väljaren `.app-footer > p` och `count() === 1` räknar också statusraden «Passen sparas bara på den här enheten.». Tipsraden `.footer-feedback-hint` visas bara efter tryck (`FooterFeedback.tsx` rad 30). |

Layouten är ändrad med avsikt i senare slices. **Anpassa smoke.**

### 4. s36 inloggning

| FAIL | Orsak |
|---|---|
| A | Rad 135 läser koden bara ur ämnesraden: `.subject.match(/\b(\d{6})\b/)`. Koden står i brödtexten, så `code` blir `undefined` och `pressSequentially` kraschar. `smoke-login.mjs` rad 24 läser både ämne och brödtext. |

**Anpassa smoke.**

### 5. Jämförelse mot gammal main och flyttad meny (s40, s47)

| Skript | FAIL | Orsak |
|---|---|---|
| s40 | AC8-main | Rad 104 kräver att *main* staplar markörer. Det var sant på 45cce9b, före Slice 40. Main har nu Slice 40 och Slice 53 C1, så kontrollen kan aldrig bli sann. Läget före Slice 40 finns redan i `verifier/slice-40-golden-main-45cce9b.json`. |
| s47 | AC3, AC7 | `menu(p, 'Hallöversikt')` (rad 129, 174) letar i «Fler saker med passet». Hallöversikt är en knapp i Passbyggarens rubrik sedan Slice 48 B1/49 D1; menyn har bara Admin, Publicera, Spara som egen mall, Ny vecka (`SessionBuilder.tsx` rad 561–563, `renderPassExtras`). Timeout på rad 61. |

**Anpassa smoke.**

### 6. Dubbel «0» i veckorapporten

`verifier/tools/weekly.sh` rad 23: `$(grep -c '^PASS \[' "$l" 2>/dev/null || echo 0)`. När inget matchar skriver `grep -c` själv `0` och avslutar med 1, så `|| echo 0` lägger till en andra rad. Cellen blir `0⏎0` och tabellraden bryts. Samma för FAIL- och KARANTÄN-kolumnen. Saknas loggen skriver `grep -c` inget och exit är 2; då behövs reserven.

## A–F (★ = förslag)

### A. Startvägen
- **A1 ★** Alla klick på «Tomt pass», «Från mall»/«Starta från mall» och «Nästa» i s33, s34, s35, s36, s38, s39, s40, s41 går via `smoke-start.mjs` (`startTomt`, `startMall`, `openMallList`, `startFragor`). Inga förväntade värden ändras.
- A2 Rätta varje rad på plats. Fler kopior av samma väg.
- A3 Pensionera s39 och s41 (minst täckning kvar). Autosave (s39) blir då utan smoke.

### B. Sidfot och versionsnummer
- **B1 ★** Förväntat nummer kommer från `sliceNumber(ROOT)`. Verbatim-kontrollerna hoppar över `footerSliceLabel` och kontrollerar i stället att `blockMeta.ts` innehåller `` `Träningsplaneraren · Slice ${SLICE_NUMBER}` ``. s36 AC23 kontrollerar att `SLICE_NUMBER` finns, inte värdet 36.
- B2 Ta bort sidfotskontrollerna i s33–s47; s49 täcker sidfoten.

### C. s35 sidfotslayout
- **C1 ★** Väljarna avgränsas till `.app-footer-row` och `.footer-feedback-hint`. AC1a och AC12 jämför länkarna i raden i ordning. AC11a kräver noll `.footer-feedback-hint` före tryck; AC9-local kräver exakt en efter tryck.
- C2 Ta bort AC1a, AC11a och AC12; behåll bara mailto-kontrollerna.

### D. s36 inloggning
- **D1 ★** s36 använder `codeLogin` från `smoke-login.mjs`; den egna `waitMail` tas bort.
- D2 Läs koden ur brödtexten i s36:s egen hjälpare.

### E. s40 AC8-main och s47 Hallöversikt
- **E1 ★** s40 AC8-main läser `slice-40-golden-main-45cce9b.json` och kontrollerar att den staplar (dokumenterar läget före), utan att bygga main. s47 öppnar Hallöversikt med rubrikknappen (roll + synlig etikett «Hallöversikt»); `menu()` används bara för poster i menyn.
- E2 Ta bort AC8-main.

### F. Veckorapporten och kartan
- **F1 ★** `weekly.sh`: hjälparen `cnt() { local n; n=$(grep -c "$1" "$2" 2>/dev/null); echo "${n:-0}"; }` för de tre kolumnerna på rad 23. `smoke-map.json`: de nio skripten får `"baseline": "ok"` när AC3 är grön.
- F2 Bara `|| true` på rad 23. Saknad logg ger tom cell.

## Effort

**M.** Nio skript, 46 FAIL, men alla hjälpare finns redan (`smoke-start.mjs`, `smoke-login.mjs`). Mest arbete: s33 (lång körning, ca 180 s) och s35 (sidfoten). Ingen app-kod, ingen ny stand-in. Bundle **0 B**. `SLICE_NUMBER` stannar på `'53'` (samma regel som Slice 50–52).

## Utanför scope

- s44 och s45 i main-cachen för 7bf99cd: s44 `exit=124` efter 517 s (timeout) och s45 4133 s. Kan vara boxlast. Builder noterar om det syns på 03c0864; ingen fix här.
- Räkning av borttagna kontroll-id i `run-smokes --baseline` (förslaget i `SLICE52-SHIPPED.md`).

## Öppna frågor

1. E: ska s40 AC8-main finnas kvar alls (E1) eller tas bort (E2)?
2. Main-cachen för 03c0864 (efter Slice 53) finns inte ännu. Om Slice 53 har ändrat antal FAIL rättar Builder tabellen i ship notes (AC1).
3. Orsaken till s36 A är läst ur koden, inte körd. Visar AC1 något annat stoppar Builder och rapporterar.
