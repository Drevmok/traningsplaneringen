# Slice 44 — Verification checklist

**Status:** PROPOSED — written against ★ A1 B1 C1 D1 E1 F1; re-check after lock.  
**Viewport:** 390×844 portrait, DPR 2, touch, clean site data, unless the row says otherwise. Pass = Från mall → Nybörjare (3 Teknik stations). «Dela» = Mer → Dela. Baseline evidence: `evidence/` (main @ 0d88da5).  
**Print checks:** desktop Chrome (latest, 1280×800) print preview, A4 portrait, «Bakgrundsgrafik» on; iPhone Safari tab; iPhone installed app (home screen). Save each as PDF/screenshot under `verifier/`.

## Dela sheet (390×844)

| # | Check |
|---|---|
| AC1 | Mer shows «Dela» (not «Exportera / dela»); tapping it opens a sheet titled «Dela» |
| AC2 | The sheet has exactly two action buttons: «Kopiera länk» and «Skriv ut passet» (plus the × close). No Helskär, Skriv ut kort, Ladda ner fil, link field, QR code, Importera fil or Spara som egen mall |
| AC3 | Both buttons ≥ 44×44; the whole sheet fits without horizontal scroll; hint texts as `content/microcopy.sv.md` |
| AC4 | «Kopiera länk»: clipboard holds `…/traningsplaneringen/#dela=…`; label shows «Länken är kopierad.» and returns to «Kopiera länk» after ~3 s |
| AC5 | Opening that link in a fresh tab shows Delat pass with the same title, blocks, minutes and hall placements; «Spara på den här enheten» saves it |
| AC6 | An old link made on main @ 0d88da5 still opens (SharePass v1 unchanged) |
| AC7 | Copy failure (deny clipboard permission, stub `execCommand` false): `exportCopyManual` line and a read-only field with the link appear; the label does not claim «kopierad» |
| AC8 | Close (×, backdrop tap) returns to Passbyggaren; page scrolls; `body` has no stray `is-print-pass` class after the sheet closes |

## Other surfaces (390×844)

| # | Check |
|---|---|
| AC9 | Golvklart actions are exactly: Avsluta Golvklart · Förrådslista · Skriv ut passet; Förrådslista still opens and works |
| AC10 | Delat pass actions: Kör passet · Spara och kör · Spara på den här enheten · Skriv ut passet · Till planeringen (no Helskär, no Skriv ut kort) |
| AC11 | Kör passet still enters fullscreen where supported (from Passbyggaren and from Delat pass) |
| AC12 | Home «Hämta ett pass»: file import and pasted link still work (unchanged) |
| AC13 | Mer «Spara som egen mall» still opens its dialog and saves (the Dela copy is gone, this one stays) |

## Print content

| # | Check |
|---|---|
| AC14 | Desktop Chrome, Dela → «Skriv ut passet»: preview shows the pass, not the app; A4 portrait; title + total minutes, all five blocks with rows and minutes |
| AC15 | Teknik rows show «1.», «2.», «3.» matching the numbers on the hall map, and for each station: sketch (when the station has redskap), «Se upp för.», «Säkerhet.», «Redskap.» lines, «Erfaren ledare» on a station that has it (add one, e.g. an experienced-coach drill from Biblioteket) |
| AC16 | No station is split across two pages; a block heading is never the last line on a page; the Hallöversikt heading and map print together; Blå/Vit map ratios unchanged |
| AC17 | Same print from Golvklart and from Delat pass gives the same pages |
| AC18 | Print twice in a row from the same sheet: the dialog opens both times; Cancel in the dialog leaves the app usable |
| AC19 | iPhone **Safari tab**: «Skriv ut passet» opens the iOS print sheet and its preview shows the pass with stations (not the Passbyggaren page) |
| AC20 | iPhone **installed app** (home screen): if no print sheet appears, within ~2 s the `printStalled` line shows under the button; following it (Kopiera länk → open in Safari → Skriv ut passet) prints the pass. If the sheet does appear, the line must not show. Note the iOS version |

## Build and budget

| # | Check |
|---|---|
| AC21 | No new strings beyond the microcopy file; locked terms as on main; deleted strings and `StationDeck`, `qrSvg`, `uqr.mjs`, `downloadPassFile` gone (`rg` finds nothing in `app/src`) |
| AC22 | Bundle delta ≤ +512 B gz (expected about −5.5 kB gz), numbers in PR; `npx tsc -b`, `bun test src`, `npm run lint`, `npm run build` green; footer «Träningsplaneraren · Slice 44»; asserts `feedback.test.ts:25/45/46`, `clubTemplates.test.ts:316` |
