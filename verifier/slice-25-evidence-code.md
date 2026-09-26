# Slice 25 — code evidence

**Run:** 2026-09-26 10:27 CEST  
**Authority:** `slice-25/verification-checklist.md`  
**Scope:** source-only review; no product code changed by this verifier.

## Verdict

**Overall: FAIL-leaning / FAIL from code.** A1, B1 and C1 are implemented; the build is green. D1/E1 fail because the footer value is still Slice 26, and F1 fails because Slice 26's place heuristic is present in the current source.

## A1 — missing saved composition: PASS

- `app/src/lib/session.ts:208-222` documents and implements the helper as “unset OR empty []”. It restricts the result to placed items (`:214-218`), returns true for unset (`:219-220`), and otherwise requires `Array.isArray(eq) && eq.length === 0` (`:221`).
- `app/src/components/HallBoard.tsx:142-146` derives `missingSavedCompositionCount` from that helper.
- The banner is rendered only in the edit branch (`app/src/components/HallBoard.tsx:388-435` is the floor/edit split), under `missingSavedCompositionCount >= 1` (`:511-515`), with `role="status"` (`:513`). Therefore it is hidden on Golvklart and when the count is zero.
- Pluralization is wired through `hallSaknarRedskapBannerText` (`app/src/data/blockMeta.ts:398-401`).

## B1 — optional point CTA: PASS

- `eligibleSuggestedCount` is computed separately (`app/src/components/HallBoard.tsx:138-140`). The CTA is conditional on `eligibleSuggestedCount >= 1` (`:516-524`), so the visible banner is text-only at zero.
- The CTA has `hall-tap-target` (`:518-520`); that shared class provides `min-height: 44px; min-width: 44px` (`app/src/App.css:2229-2233`).
- Banner CTA handling only calls the shared point path (`app/src/components/HallBoard.tsx:304-317`, `:326-329`): it scrolls/focuses/highlights the existing control and shows a toast. It does not call either apply function.
- The real apply-all remains separate at `app/src/components/HallBoard.tsx:296-302` and `:466-482`; its disabled state is based on `eligibleSuggestedCount` (`:473-479`).

## C1 — soft chrome and non-blocking behavior: PASS

- `.hall-unplaced-banner` is the base visual family (`app/src/App.css:2276-2285`); `.hall-saknar-banner` wraps and reuses it (`:2287-2300`). The banner render contains a status paragraph and optional button only (`app/src/components/HallBoard.tsx:511-526`), not a new `CoachTipStrip`.
- Existing edit tips remain separate (`app/src/components/HallBoard.tsx:561-568` and `:692-698`), preserving the Slice 22 tip system rather than turning the saknar status into a tip strip.
- Golvklart remains an ordinary header action (`app/src/components/HallBoard.tsx:390-413`), and the edit `Golvklart` button remains enabled and independent of the missing count (`:483-489`). Placement still uses the existing `placeAt` path (`:197-209`), and close handling remains separate (`:278-281`).

## D1 — Docs keys/wiring: FAIL (partial)

Present in `app/src/data/blockMeta.ts`:

- `hallSaknarRedskapBanner` and singular `hallSaknarRedskapBannerOne` (`:353-355`)
- `hallSaknarPointApplyAll`, aria and toast (`:356-359`)
- pluralization helper `hallSaknarRedskapBannerText` (`:398-401`)

However, the same block labels the footer as Slice 25 while assigning the wrong value: `app/src/data/blockMeta.ts:360-361` says `footerSliceLabel: 'Träningsplaneraren · Slice 26'`. The required Docs footer is `Träningsplaneraren · Slice 25` (`docs/saknar-redskap-banner.sv.md:130-136`).

## E1 — footer: FAIL

`app/src/App.tsx:246-249` renders `UI.footerSliceLabel`, but `app/src/data/blockMeta.ts:361` supplies **`Träningsplaneraren · Slice 26`**, not the locked exact value **`Träningsplaneraren · Slice 25`**.

## F1 — scope/non-goals: FAIL-leaning

PASS evidence for the banner non-goals:

- No auto-apply from the banner: the banner handler only calls `pointAtApplyAll` (`app/src/components/HallBoard.tsx:326-329`); the persist/apply call is only in the separate handler (`:296-302`).
- No compose from the banner: the banner JSX has only the status and point CTA (`:511-526`); `StationComposeSheet` is mounted separately (`:765-776`).
- Caption remains unchanged: `UI.hallSchematicNote` is `Schematisk hall — inte exakt mått` (`app/src/data/blockMeta.ts:169`) and is rendered by `HallCanvas` (`app/src/components/HallCanvas.tsx:237`).
- Slice 24 Förråd still points through the shared path (`app/src/components/HallBoard.tsx:319-324`), while Slice 19 apply-all remains separate (`:296-302`).
- `rg -n 'window\\.confirm' app/src` returned no matches.

Fail evidence:

- The current source contains the Slice 26 placement heuristic explicitly: `app/src/lib/coachTips.ts:224-227` sets `openHallAndPlace` when `opts.placementCount >= 1`. This conflicts with Slice 25 F1's “no Slice 26 place-heuristic” lock, regardless of the fact that it is unrelated to the new banner.

## Build

`cd app && npm run build` — **exit code 0** (TypeScript and Vite build completed successfully; 46 modules transformed).

## Lock summary

| Lock | Code-only result |
|---|---|
| A1 | PASS |
| B1 | PASS |
| C1 | PASS |
| D1 | FAIL (footer wiring value is Slice 26) |
| E1 | FAIL |
| F1 | FAIL-leaning (Slice 26 place heuristic is present) |
| Build | PASS |
