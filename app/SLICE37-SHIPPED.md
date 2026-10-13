# Slice 37 — auto-place Teknik when a mall is applied (SHIPPED, local only)

Branch `slice-37-code` off `origin/slice-37-docs` (e1ef3fd, main c6a11d5). Not pushed, no upstream, not merged. No SQL.

## Change
- `components/SessionBuilder.tsx`: all three apply paths call `autoPlaceUnplaced` (lib/hallSuggest, same helper as Planera pass) once, before adopt:
  - built-in: `autoPlaceUnplaced(cloneTemplate(pendingTemplate))` → onChange (as before)
  - Egen mall: `adoptAsDraft(autoPlaceUnplaced(savedTemplateToSession(pendingSaved)))`
  - Klubbmall: `adoptAsDraft(autoPlaceUnplaced(clubTemplateToSession(pendingClub)))`
  - Club confirm no longer passes `note`.
- `data/blockMeta.ts`: `SLICE_NUMBER='37'`; `clubTemplateApplied: 'Mallen är i Passbyggaren.'`; `clubTemplatePlacementsNote` removed.
- Tests: feedback/clubTemplates asserts → Slice 37; new `lib/mallApply.test.ts` (4 tests).

## Bundle (gzip -9, dist/assets JS+CSS; main c6a11d5 → branch)
Total 216 944 → 216 895 (−49 B) · coach-facing eager 153 053 → 152 994 (−59 B) · lazy +10 B. Limit +512 B: OK.

## Open items
- A1 one helper call per path, before adopt · B1 no new controls · C1 no new strings · E1 Teknik only, pass hall template kept · F1 bundle within limit.
- D1: helper used unchanged with no filter; drills without redskap fall back to tag/`open` spots as in Planera pass. Any change needs a new lock.

## Verification
bun test src 165/0 (22 files) · bun test tools/bank 21 pass/5 skip/0 fail · tsc OK · lint 0 errors · npm run build OK.
Smoke `verifier/slice-37-builder-smoke.mjs` at 390×844 on local stand-in: 24/24 PASS; screenshots /workspace/screenshots/slice37_01…07.

## Deviations
- `TemplateConfirm`'s `note` prop is now unused but kept (no extra file touched).
- Built-in apply and Tomt pass are not auto-saved (pre-existing behaviour; HANDOFF assumed "App persists"). Smoke clicks «Spara utkast» before reading/reloading the built-in draft; placements are made on apply and persist. Egen/Klubb persist via adoptAsDraft.
- AC6 (no stacking) shown by shared helper + distinct-spot check; Golvklart/Förrådslista not driven.
