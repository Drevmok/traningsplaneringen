# Slice 44 — Dela och utskrift

**App:** Träningsplaneraren  
**Status:** **LOCKED 2026-10-17 by Christoffer: A1 B1 C1 D1 E1 F1 (the ★ recommendations).** Effort M (print fix alone S). Docs pack only, no app code. Branch `slice-44-docs` from `origin/main` @ `0d88da5` (Slice 43 merge).  
**Effort:** **M** overall. The print fix on its own is **S** (one hook, ~30 lines). See below.  
**Source:** `feedback/2026-10-17-christoffer.md` row A: «fix Skriv ut passet (broken), Dela = only print + copy link; remove Helskär, Skriv ut kort».

## Why

«Skriv ut passet» does nothing useful on Christoffer's phone, and the Dela sheet («Exportera / dela») has grown to eight controls in three sections. Coaches need two things from it: a paper or PDF of the pass, and a link they can send to another coach.

**Coach outcome:** «Jag trycker Dela, får en utskrift av hela passet med stationerna, eller kopierar en länk till en annan tränare.»

## Finding 1 — why «Skriv ut passet» fails (root cause)

**Cause A (code, every WebKit browser: iPhone/iPad Safari, macOS Safari):** `lib/bodyPrint.ts:useBodyPrint` builds the print page only for the moment of printing. It adds `body.is-print-pass`, mounts `<PassPrint>` in a portal, calls `window.print()` in a rAF, and **tears both down on `afterprint`** (`done()` removes the class and calls `onDone` → `setPrintMode(null)` → portal unmounts). The print CSS (`export.css:223–240`) shows `.print-host` and hides everything else only while that class is on `body`.

- Chromium runs the print synchronously: measured order `call → beforeprint → afterprint → returned` (`evidence/print-event-order.mjs`). The print copy is laid out before `afterprint`, so desktop Chrome prints correctly: 2 A4 pages, timeline + hall map (`evidence/main-A4-chromium-pass-p1/p2.png`).
- WebKit returns from `print()` at once and fires `afterprint` when the print sheet opens; the page is rendered for print **after** that (MDN `Window.print()`: «in more recent versions of Safari, it may return immediately»; Stack Overflow 30310918: «onafterprint fires almost immediately after window.print»). Simulated in Chromium (afterprint dispatched right after `print()` returns): when the print renders, `body` has no class and there is **no `.print-host`**; the PDF is **10 pages of the app itself** (Passbyggaren behind the Exportera / dela modal, QR code included) — `evidence/main-A4-webkit-sim-pass-p1.png`.

**Cause B (platform, installed PWA on iOS 27):** In a home-screen PWA (`display: standalone`, `public/manifest.webmanifest`) on iOS 27, `window.print()` does nothing: no sheet, no `beforeprint`/`afterprint`, no error. Reported as a regression from iOS 26.6.2 (r/PWA 2026-09-29; OJapp test table). Safari in a normal tab still prints. No JS workaround is known. The app can only notice that printing did not start and point the coach to Safari.

No hidden iframe or popup is involved (`rg iframe|window.open` = none). `display-mode` is never checked.

**Minimal fix (A1 + B1):** keep the print page armed instead of tearing it down on `afterprint`, and if `beforeprint` never arrives, say so. Verified in a scratch prototype (not pushed): with the WebKit-like timing the print renders `is-print-pass` + 1 host, 3 A4 pages with pass, stations and map (`evidence/prototype-A4-pass-with-cards.png`).

Also seen on desktop (fix with C1): «Hallöversikt» heading orphaned at the bottom of page 1, map alone on page 2 (`.pass-sheet-map` has no `break-inside: avoid`, only the canvas does).

## Finding 2 — what «Skriv ut kort» shows that the pass print lacks

`lib/stationCards.ts:stationCards` → `StationCardModel`, printed by `PassPrint` mode `stations` (`PassPrint.tsx:18–57`), one Teknik station per A4. Compared with the pass print (`PassPrint.tsx:60–124`):

| Card field | On the card | In «Skriv ut passet» today |
|---|---|---|
| `rank` | Big number 1…n (pass order = hall marker number) | **Missing** (the map shows the numbers, the list does not) |
| `title` | Yes | Yes |
| `minutes` | «Teknik · 6 min» | Yes (row) |
| `blockLabel` | «Teknik» | Yes, implicitly (block heading) |
| `experienced` | «· Erfaren ledare» | **Missing** |
| `equipmentSlots` | `StationSketch` + caption «Skiss — så kan stationen stå…» | **Missing** |
| `watch` | «Se upp för. …» (`floorTip().watchFor`) | **Missing** |
| `safety` | «Säkerhet. …» (`floorTip().safety`) | **Missing** |
| `equipment` | «Redskap. Satsbräda · Landningsmatta» (`item.stationEquipment ?? activity.defaultStationEquipment`) | **Missing** per station. The pass print's Förrådslista page only aggregates *saved* `item.stationEquipment`; with Nybörjare as cloned it is empty, so no Förrådslista page prints. |

So **6 fields** to merge: rank, Erfaren ledare, sketch, Se upp för, Säkerhet, Redskap.

## Finding 3 — the Dela sheet and the other print/Helskär buttons

Reached from Mer → «Exportera / dela» on phone (`SessionBuilder.tsx:renderPassExtras`, `:479–483`; also in the desktop `.builder-extra` row). Component `components/ExportSheet.tsx`.

| Before (main @ 0d88da5) | After (★) |
|---|---|
| **Stationskort** — hint, «Helskär», «Skriv ut kort» | removed |
| **Skicka till telefonen** — hint, «Kopiera länk», «Ladda ner fil», link textarea, QR code (or «Länken är för lång för en QR…»), «Importera fil», «Spara som egen mall» | «Kopiera länk» (hint rewritten for coaches) |
| **Skriv ut passet** — hint, «Skriv ut passet» | «Skriv ut passet» (hint rewritten) |

Removed from the menu: **Helskär, Skriv ut kort, Ladda ner fil, link textarea, QR code, Importera fil, Spara som egen mall** (7). Nothing is lost elsewhere: receiving a file or link stays on Home «Hämta ett pass» (`Home.tsx:110–150`); «Spara som egen mall» stays in Mer (`renderPassExtras`, with its name dialog).

Same removal on the other two surfaces:
- **Golvklart** (`HallBoard.tsx:424–466`): Avsluta Golvklart · ~~Helskär~~ · ~~Skriv ut kort~~ · Förrådslista · Skriv ut passet.
- **Delat pass** (`SharePass.tsx:74–93`): Kör passet · Spara och kör · Spara på den här enheten · ~~Helskär~~ · ~~Skriv ut kort~~ · Skriv ut passet · Till planeringen.

Share link (SharePass v1) checked on main: «Kopiera länk» writes `…/traningsplaneringen/#dela=z.…` (754 chars for Nybörjare) to the clipboard, the button text turns into «Länken är kopierad.» (no toast), and the link opens the Delat pass view with the banner «Pass från en annan enhet. Ingenting sparas här förrän du själv sparar.» (`evidence/share-copy.mjs`, `main-390x844-share-view.png`). Two weak spots: `copyText` never reports failure, so the label says «kopierad» even if both clipboard paths fail; and the label never resets.

## Options (★ = Docs recommendation)

### A — Fix the print timing
- **A1 ★** Keep the print page armed: on tap add `body.is-print-pass` and mount `<PassPrint>`; do **not** remove either on `afterprint`; remove them when the owning sheet/screen unmounts. A request counter re-runs `print()` on each tap. On screen nothing changes (`.print-host` is `display: none` outside print). Effort S.
- **A2** Keep the teardown but delay it to the first `focus` / `visibilitychange` after `afterprint`. Timing-dependent; WebKit can still render after that.
- **A3** Pure CSS: host always mounted, `body:has(> .print-host)` instead of the class. Then Cmd+P anywhere in Passbyggaren prints the pass; wider change.
- **A4** Build a real PDF in JS (jsPDF etc.). Works in the PWA too, but L and far over budget.

### B — When printing does not start (iOS 27 home-screen app)
- **B1 ★** After `print()`, if no `beforeprint` arrives within 1.5 s, show one quiet line under the button telling the coach to open the link in Safari and print there (the «Kopiera länk» button is right above it; the link opens Delat pass, which has «Skriv ut passet»). No platform sniffing, so it heals itself if Apple fixes the PWA.
- **B2** Detect iOS + standalone up front and replace the print button with the note. Blocks printing even after Apple fixes it.
- **B3** Do nothing. The button stays dead in the installed app.

### C — Merge the card content into «Skriv ut passet»
- **C1 ★** In the Teknik block each row gets: «1.» number (same as the hall marker), «· Erfaren ledare» when set, the station sketch, «Se upp för.», «Säkerhet.», «Redskap.» — same data and labels as the card. Page breaks between stations, not inside one; heading kept with its first row; the map section kept whole. Nybörjare: 3 A4 pages (prototype).
- **C2** Same without the sketch: text only, ~2 pages.
- **C3** A separate «Stationer» section after the timeline. Repeats every title.

### D — Remove «Helskär» (StationDeck)
- **D1 ★** Remove it from the Dela sheet, Golvklart and Delat pass; delete the `StationDeck` component, its CSS and strings. Keep `enterPresentation()` (Kör passet uses it, `SessionBuilder.tsx:548`, `SharePass.tsx:56`).
- **D2** Remove it only from the Dela sheet, keep it on Golvklart. Against the feedback.

### E — Dela sheet contents and name
- **E1 ★** Exactly two actions: «Kopiera länk» and «Skriv ut passet», each with one short line. Delete the 7 items in Finding 3. Rename the sheet and the Mer entry to «Dela» (Christoffer's own word). If copying fails, show the link in a read-only field with one line so the coach can copy it by hand. After a copy the label turns into «Länken är kopierad.» and back to «Kopiera länk» after 3 s.
- **E2** Same, but keep the QR code under the link (handy for moving a pass to your own phone). Not «exactly two».
- **E3** Same as E1 but keep the name «Exportera / dela».

### F — Copy, terms, budget
- **F1 ★** Strings exactly as `content/microcopy.sv.md`; no locked term changes (gymnaster, pass, Redigera redskap, Passbyggaren, Hallöversikt, Golvklart, Förrådslista, Starta från mall, Kom igång, Biblioteket, …). SharePass v1 format unchanged, old `#dela=` links keep working, Home «Hämta ett pass» unchanged. `SLICE_NUMBER = '44'`. Budget +512 B gz soft: expected **−5.5 to −6 kB gz** (QR encoder `lib/uqr.mjs` 27.8 kB raw and `StationDeck` leave the bundle; prototype measured −5.60 kB JS, before dead CSS is deleted).
- **F2** Keep «Stationskort» strings for a later slice. Dead strings in the bundle; no.

## Effort: M (print fix S)

The print fix (A1 + B1) is **S**: one hook in `lib/bodyPrint.ts`, three call sites. The slice is **M** because it also touches 4 components (`ExportSheet`, `HallBoard` Golvklart branch, `SharePass`, `PassPrint`), deletes 3 files' worth of code (`StationDeck`, `qrSvg` + `uqr.mjs`, stations print), reworks pass-print CSS for page breaks, removes ~15 strings and a test line, and needs a real-device print check on iPhone (Safari tab and installed app). Not L: no new state model, no data change, no new screen.

## Files

- [`HANDOFF.md`](./HANDOFF.md) — Builder notes, file:function refs, dead code list
- [`verification-checklist.md`](./verification-checklist.md) — AC1–AC22 (against ★)
- [`content/microcopy.sv.md`](./content/microcopy.sv.md) — new and changed strings, deleted strings
- [`evidence/`](./evidence/) — main @ 0d88da5 print PDFs as PNG, Dela sheet, share view, repro scripts, `print-findings.txt`
- Living docs: [`docs/dela-och-utskrift.sv.md`](../docs/dela-och-utskrift.sv.md) (new), [`docs/ui-chrome.sv.md`](../docs/ui-chrome.sv.md) (Slice 44 note), [`docs/README.md`](../docs/README.md)

## Out of scope

A JS PDF generator, server-side print, a new share format or short links, QR codes, changes to Home «Hämta ett pass», Kör passet, Hallöversikt edit mode, Förrådslista content, hall renames (Slice 45).

## Open items

1. Christoffer to lock A–F. E1 renames «Exportera / dela» to «Dela» and drops the QR code; B1 adds one new line of text.
2. Real-device check: iPhone Safari tab (Cause A fixed) and installed PWA on iOS 27 (Cause B note shows). Our WebKit timing is a simulation in Chromium plus public reports; nobody has run the app on an iPhone for this pack. Also check Android Chrome (expected to behave like desktop Chrome).
3. Which iOS version Christoffer's phone runs, and whether he tested in the installed app or a Safari tab.
4. Verifier: `verify-traningsplaneraren/features/` has no print/Dela feature file; add one after ship (Verifier owns the skill, Docs did not edit it).
5. With Nybörjare as cloned, no Förrådslista page prints, because only saved station compositions count (Slice 25 rule). Unchanged here; flag if Christoffer expects it.
