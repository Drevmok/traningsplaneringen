# Slice 44 — Builder handoff

**Status:** PROPOSED 2026-10-17 (not locked). Written against ★ answers A1 B1 C1 D1 E1 F1. Base `origin/main` @ `0d88da5`. Scope: `app/src/lib/bodyPrint.ts`, `components/{ExportSheet,PassPrint,HallBoard,SharePass,SessionBuilder,StationDeck}.tsx`, `lib/{sharePass,qrSvg}.ts`, `lib/uqr.mjs`, `export.css`, `data/blockMeta.ts`, tests. No data/format change. Evidence and repro scripts: `slice-44/evidence/` (`print-findings.txt`).

## What exists today (main @ 0d88da5)

- **Print hook:** `lib/bodyPrint.ts:useBodyPrint(mode, onDone)` — `useLayoutEffect` adds `is-print-stations|is-print-pass` to `body`, `requestAnimationFrame(() => window.print())`, and on `afterprint` → `done()` removes the class and calls `onDone` (callers set their print state to `null`, which unmounts the `<PassPrint>` portal). **This teardown is the bug on WebKit** (README Finding 1).
- **Callers:** `ExportSheet.tsx:35,43,198,215–216` (`printMode`), `HallBoard.tsx:110–111,447,462,850–854` (`cardPrint`), `SharePass.tsx:25,28,86,91,154–155` (`printMode`).
- **Print page:** `components/PassPrint.tsx:PassPrint({ session, mode })` — `mode === 'stations'` `:18–57` (station sheets), pass `:60–124` (head, `ol.pass-timeline`, `HallCanvas hallMode="floor"`, `pass-sheet-gear` Förrådslista).
- **Print CSS:** `export.css:209–211` `.print-host { display: none }`; `:213–221` `@page station-card` / `@page pass-sheet` (A4 portrait); `:223–322` print rules (body class gates, `.station-sheet*`, `.pass-sheet*`, `.pass-timeline > li { break-inside: avoid }` `:295`); `:1197–1212` Blå/Vit ratios for `.pass-sheet-map`. Global `App.css:2646–2650` `@page { size: A4 landscape }` (used by Hallöversikt Cmd+P; the named `pass-sheet` page overrides it).
- **Dela sheet:** `components/ExportSheet.tsx` (whole file), opened from `SessionBuilder.tsx:479–483` (`renderPassExtras`, `UI.export`) and rendered at `:858–865` with `onImport={handleImported}` / `onTemplateSaved`.
- **Helskär:** `components/StationDeck.tsx:StationDeck` (fullscreen station deck) + `enterPresentation()` `:12–16`; opened from `ExportSheet.tsx:119–128`, `HallBoard.tsx:432–442,847–849`, `SharePass.tsx:74–84,153`.
- **Share link:** `lib/sharePass.ts:encodeShare`, `shareUrl` (`#dela=` + `z.`/`j.` token), `copyText` `:274–285` (clipboard API, falls back to `execCommand('copy')`, never reports failure). Copy handler `ExportSheet.tsx:68–72` (label swap `exportCopy` → `exportCopied`, never resets).

## 1. A1 — print hook (`lib/bodyPrint.ts`)

Replace `useBodyPrint` + `BodyPrintMode` with one pass-only hook, for example:

```ts
export function usePassPrint(): { armed: boolean; stalled: boolean; print: () => void }
```

- `print()` → `setStalled(false)`, `setArmed(true)`, bump a request counter.
- Effect on the counter (skip 0): `document.body.classList.add('is-print-pass')`; listen once for `beforeprint` (B1); `requestAnimationFrame(() => window.print())`.
- **No `afterprint` handler.** Class and portal stay until the owner unmounts: separate effect `useEffect(() => () => document.body.classList.remove('is-print-pass'), [])`.
- Callers render `{armed && createPortal(<PassPrint session={session} />, document.body)}`. Two owners never live at once (sheet is a modal over Passbyggaren; Golvklart and Delat pass are separate screens); if that changes, guard with a ref count.
- Keep the rAF: the portal must be in the DOM before `print()`.

Scratch prototype of exactly this: WebKit-like timing → print renders `is-print-pass` + 1 host (`evidence/prototype-A4-pass-with-cards.png`).

## 2. B1 — print did not start

In the same effect: `window.setTimeout(() => { if (!seenBeforeprint) setStalled(true) }, 1500)`; clear timer and listener in cleanup. Each caller shows `UI.printStalled` as `<p className="muted" role="status">` right under its «Skriv ut passet» button while `stalled`. Chromium/Safari tab fire `beforeprint` (Chromium synchronously inside `print()`), so the line only shows where print is a no-op (iOS 27 home-screen app). No UA or `display-mode` sniffing.

## 3. C1 — card fields into the pass print (`PassPrint.tsx`, `export.css`)

- Drop the `mode` prop and the whole `stations` branch (`:12`, `:18–57`).
- In the timeline, for `type === 'techniques'` pair each row with `stationCards(session)[i]` in item order (both sort by `order`; `stationCards` uses `placeableItems`, which is the Teknik items — assert in a test that the counts match). Row content:
  - `{card.rank}. {title}` + `· {UI.experiencedCoach}` when `card.experienced`; minutes right as today.
  - Below, full width (`li.pass-station`, `flex-wrap: wrap`; body `flex-basis: 100%`): `<StationSketch slots={card.equipmentSlots}>` when slots exist (max-width ~120 mm), then `UI.watchFor`. `card.watch`, `UI.safety`. `card.safety` (keep the top rule from `.station-sheet-safety`), `UI.stationEquipmentHeading`. `card.equipment`. Same omission rules as the card (skip empty).
- Print CSS (`export.css` print block): `.pass-timeline > li { break-inside: auto }` (replaces `:295`), `.pass-timeline h2 { break-after: avoid }`, `.pass-timeline ul li { break-inside: avoid }`, `.pass-sheet-map { break-inside: avoid }` (fixes the orphaned «Hallöversikt» heading). Body text 11 pt.
- Nybörjare result in the prototype: 3 A4 pages (Samling–Teknik 2 · Teknik 3–Lek · map).

## 4. D1 — remove Helskär and «Skriv ut kort»

- `ExportSheet.tsx`: delete the Stationskort section `:112–138`, `deck` state, `cards`, `StationDeck`/`enterPresentation`/`stationCards` imports, `:214`.
- `HallBoard.tsx` Golvklart actions: delete the Helskär button `:432–442` and «Skriv ut kort» `:443–450`; `deckOpen` `:109`; `:847–849`; `stationCards` import `:62` and `cards` `:118` become unused (check nothing else reads `cards`; on main only those buttons and the deck do). Remaining order: Avsluta Golvklart · Förrådslista · Skriv ut passet.
- `SharePass.tsx`: delete `:74–89` (Helskär + Skriv ut kort fragment), `deck` state, `:153`. Keep `cards` (still gates «Spara och kör» and the primary style on «Spara på den här enheten»). Keep `enterPresentation` import (Kör passet `:56`).
- `StationDeck.tsx`: move `enterPresentation()` to `lib/presentation.ts` (update imports in `SessionBuilder.tsx:56`, `SharePass.tsx:14`) and delete the file.

## 5. E1 — Dela sheet = two actions (`ExportSheet.tsx`)

- Keep: heading `UI.export` («Dela»), section «Kopiera länk» (`exportShareLink` heading, `exportShareHint`, copy button), section «Skriv ut passet» (`exportPrintPass` heading, `exportPrintPassHint`, button, `printStalled` line).
- Delete: «Ladda ner fil» `:147–149`, link textarea `:151–160`, QR `:161–168` + `qr`/`qrFailed` state + `qrSvg` call `:52–58`, «Importera fil» `:170–182` + `onFile` `:80–93` + `fileRef`, «Spara som egen mall» `:183–185` + `saveTemplate` `:74–78` + `templateNote`, `receiveError` + alert `:188–192`, `pendingImport` + `ReplaceDraftConfirm` `:204–213`. Props shrink to `{ session, onClose }`.
- Copy: `copyText` returns `Promise<boolean>` (true on clipboard API or `execCommand` returning true). On true: label `exportCopied`, back to `exportCopy` after 3000 ms (clear timer on unmount). On false: show the URL in a read-only `<input>` (select on focus) with `UI.exportCopyManual` above it.
- `SessionBuilder.tsx`: drop `onImport`/`onTemplateSaved` props `:862–863`; `handleImported` `:424–431` becomes dead — delete. `setSavedTemplates(loadSavedTemplates())` stays where the Mer save dialog uses it.
- Mer entry label is the same `UI.export`, so the rename to «Dela» covers both.

## 6. Dead code and strings to delete

| What | Where | Note |
|---|---|---|
| `StationDeck` component + `StationDeck.tsx` | after moving `enterPresentation` | |
| `lib/qrSvg.ts`, `lib/uqr.mjs` (27.8 kB raw) | only `ExportSheet` imports | largest bundle win |
| `downloadPassFile`, `passFileName` | `lib/sharePass.ts:250–272` | also `sharePass.test.ts:9` import and `:128` assert |
| `BodyPrintMode`, `useBodyPrint` | `lib/bodyPrint.ts` | replaced by `usePassPrint` |
| `handleImported` | `SessionBuilder.tsx:424–431` | |
| CSS `.station-deck*` | `export.css:132–133,142,148–207,1104` | |
| CSS `@page station-card`, `body.is-print-stations`, `.station-sheet*` | `export.css:213–216,224–226,232,237,242–280` | keep `.station-sketch` print rule (`:281–285`); used by C1 and ActivityDetail |
| CSS `.export-url`, `.share-qr*` | `export.css:25–52` | |
| CSS `.receive-file` | `export.css:354–365` | **keep** — Home and OwnImport use it |
| Strings `exportStations`, `exportStationsHint`, `exportFullscreen`, `printStations`, `exportQr`, `exportQrLong`, `downloadFile`, `saveAsTemplate`, `savedAsTemplate`, `importDone`, `stationCardsEmpty`, `deckNext`, `deckPrev`, `hallPrint` (already unused) | `data/blockMeta.ts:145–148,154–156,158–160,180–182,295` | keep `importFile`, `receiveBad`, `importIsExercises` (Home) |

Run `rg` for each key after deleting; tests must not import removed symbols.

## 7. Slice bump

`data/blockMeta.ts:111` `SLICE_NUMBER = '44'`. Asserts confirmed on 0d88da5: `lib/feedback.test.ts:25` (`'Version: Slice 43'`), `:45` (`'43'`), `:46` (`'Träningsplaneraren · Slice 43'`), `lib/clubTemplates.test.ts:316` (`'Träningsplaneraren · Slice 43'`) → 44.

## 8. Tests

- `usePassPrint` logic as a plain function if possible (class stays after a synthetic `afterprint`; removed on unmount).
- `PassPrint`/`stationCards`: Teknik row count = `stationCards(session).length`; a card with `watch`, `safety`, `experienced` renders all three labels.
- Keep `stationCards` tests (`sharePass.test.ts:70ff`, `bank.test.ts:333`).
- `bun test src`, `npx tsc -b`, `npm run lint`, `npm run build` green.

## 9. Bundle

Baseline main: `index-*.js` **142.98 kB gz**, CSS **14.52 kB gz**. Scratch prototype (no dead CSS deleted yet): JS 137.38 (−5.60), CSS 14.59 (+0.07). Expect total **−5.5 to −6.0 kB gz** after CSS cleanup. Report both deltas in the PR.

## 10. Self-smoke

`evidence/print-repro.mjs` (Playwright, 390×844): run with `WEBKIT=1` (afterprint right after `print()`) and without; both PDFs must show the pass with station details, not the app. Then desktop Chrome by hand: Mer → Dela → Skriv ut passet → print preview at A4. Ship notes list deviations.
