# Slice 44 — microcopy (Swedish): Dela och utskrift

**Status:** PROPOSED 2026-10-17, written against ★ (E1, B1, C1). Warm, du-form, no exclamation marks. Locked terms unchanged: gymnaster, pass, Redigera redskap, Passbyggaren, Hallöversikt, Golvklart, Förrådslista, Starta från mall, Kom igång, Biblioteket, God känn, Dölj för alla, Visa igen, Logga in som admin, Logga ut.

## Changed

| Key | Today | New |
|---|---|---|
| `export` | Exportera / dela | **Dela** (sheet title, Mer entry, desktop button, dialog `aria-label`) |
| `exportShareLink` | Skicka till telefonen | **Kopiera länk** (section heading; same words as the button) |
| `exportShareHint` | Skanna QR-koden. På telefonen sparar du passet och kör det i hallen. Koden innehåller passet — inget konto och ingen molnsynk. | **Skicka länken till en annan tränare. Den som öppnar den ser hela passet och kan spara det hos sig. Passet finns i länken, så det behövs inget konto.** |
| `exportPrintPassHint` | Tidslinje och hallkarta. Välj Spara som PDF i dialogen. | **Hela passet på papper: tidslinjen, varje station med skiss, Se upp för och Säkerhet, och hallkartan. Vill du ha en fil väljer du Spara som PDF.** |

## New

| Key | Svenska | Where |
|---|---|---|
| `printStalled` | Utskriften kom inte igång. Från hemskärmen kan iPhone ibland inte skriva ut. Kopiera länken, öppna den i Safari och skriv ut passet därifrån. | Under «Skriv ut passet» when no `beforeprint` within 1.5 s (B1). Dela sheet, Golvklart, Delat pass. |
| `exportCopyManual` | Det gick inte att kopiera. Håll fingret på länken nedan och välj Kopiera. | Above the read-only link field, only when copying fails (E1) |

## Unchanged (kept exactly)

| Key | Svenska |
|---|---|
| `exportCopy` | Kopiera länk |
| `exportCopied` | Länken är kopierad. (button label for 3 s, then back to «Kopiera länk») |
| `exportPrintPass` | Skriv ut passet (heading and button, all three surfaces) |
| `watchFor`, `safety`, `stationEquipmentHeading`, `experiencedCoach` | Se upp för · Säkerhet · Redskap · Erfaren ledare (now also in the pass print, C1) |
| `forradslistaPrintHeading`, `hallOverview` | Förrådslista · Hallöversikt (pass print) |
| `shareBanner`, `shareBad`, `shareExit`, `saveHere`, `saveAndRun` | Delat pass view |
| `fetchPass`, `receiveHint`, `importFile`, `receiveBad`, `importIsExercises` | Home «Hämta ett pass» |
| Station sketch caption | Skiss — så kan stationen stå. … |
| `footerSliceLabel` / `feedbackMailVersion` | Träningsplaneraren · Slice 44 / Version: Slice 44 |

## Deleted (no longer shown anywhere)

`exportStations` (Stationskort), `exportStationsHint`, `exportFullscreen` (Helskär), `printStations` (Skriv ut kort), `exportQr`, `exportQrLong`, `downloadFile` (Ladda ner fil), `saveAsTemplate` (the Dela copy; Mer keeps `saveOwnTemplate`), `savedAsTemplate`, `importDone`, `stationCardsEmpty`, `deckNext`, `deckPrev`, `hallPrint` (already unused).

## Notes for Builder

- Option E3 keeps `export` = «Exportera / dela»; then only the hint strings change.
- Option E2 keeps `exportQr` and `exportQrLong`, and the hint keeps its first sentence: «Skanna QR-koden eller skicka länken till en annan tränare. …».
- «Safari» and «iPhone» are names, not product terms; keep them as written.

## Not allowed

New labels beyond this file, exclamation marks, «ni»-form, renaming Golvklart, Förrådslista, Hallöversikt or any locked term, bringing back «Helskär» or «Skriv ut kort» under another name.
