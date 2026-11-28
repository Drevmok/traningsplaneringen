# Slice 69 — «Du är här»-minikarta (SHIPPED, PR)

Locks **A1 B1 C1 D1 E1 F1**. Christoffer, 28 nov 2026 16:49 (Europe/Stockholm), verbatim: «Ja, lås A1 B1 C1 D1 E1 F1». Pack: `slice-69-docs` @ `c76bc7a`. Base main `83965f7`. Merge-base of `slice-69-code` is `83965f7`. Head-SHA: see the PR text (a file cannot name its own commit).

**SQL:** none. No bank change, no publish.

## Urval (A–F)
- **A1:** `.run-hall-mini` is the first child of `.run-script`; `StationSketch` unchanged below it. Only `.run-script` scrolls.
- **B1:** `HallCanvas` `hallMode="floor"`, `viewZoom={1}`, no `onViewZoomChange` (no pinch). CSS in `export.css`: `min-height: 0`, `max-height: 16svh`, aspect 16/10, wrap `overflow: hidden`, width `min(100%, 16svh × 1.6)`.
- **C1:** `runHallMini(session, itemId)` in `runPass.ts` → `{ show, selectedItemId, unplaced }`. `show` = at least one placed marker and the step is Teknik. Unplaced Teknik with other markers → map + `UI.buildHallUnplaced` («Saknar plats»). No placements or not Teknik → no map, no text.
- **D1:** all placed markers, active = `is-selected`. No extra pin, no CAD, `hallSetupSteps` not used. `.hall-chip-equipment` hidden in the mini.
- **E1:** display only: `pointer-events: none` on the mini, empty callbacks, `HallBoard` not mounted.
- **F1:** `SLICE_NUMBER = '69'`; footer literals in `feedback.test.ts` and `clubTemplates.test.ts` updated; tests for `runHallMini`.

## Bantning
None needed. The new `UI.runHallMiniAria` key was kept (only 241 B over).

## Evidence
- CI command `cd app && npm ci && npm run build` (`tsc -b && vite build`): exit 0.
- `npm run lint`: exit 0 (warnings only, same family as main).
- `bun test src`: **355 pass / 0 fail** (4 new `runHallMini` tests).
- Bundle (`verifier/tools/build-dists.sh`, gzip -9, js+css TOTAL, plain build): **222130 → 222371 (+241 B gzip; budget +512)**.
- `pick-smokes 83965f7 HEAD`: HELA LOOPEN (`blockMeta.ts`; 22 scripts). 22/22 SAMMA, no NY FAIL. netlog 4214 requests, **0 to the live host**.
- Own visual check (Playwright, 390×844 and 844×390, dist of this branch vs main dist): mini is the first child of `.run-script`, active marker `is-selected` (1), 2 markers, no equipment rows, `pointer-events: none`, sketch kept, clock and nav inside the viewport, mini does not scroll itself, tap on it changes nothing; unplaced Teknik → map + «Saknar plats», no selection; warm-up → no map.
- Feature map: one sentence in `verify-traningsplaneraren/features/kor-passet.md`.

## Known, pre-existing (not changed here)
At 844×390 the `.run-script` area is only ~9 px high **on main as well** (the clock is `clamp(4.25rem, 18vw, 7.5rem)` and the title/next/left rows fill the screen), so the sketch and the new mini are mostly clipped in landscape. The mini follows the same rule as the sketch (A1). Checklist #3 depends on that layout; a landscape fix would be a separate decision.
