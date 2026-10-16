# Slice 42 — Rätt tips i rätt läge (shipped notes)

Branch `slice-42-code` off `main` @ `1814e50` + docs pack `b3d569a`.

## What changed
- **`lib/freshPass.ts` (new):** `coachStationCount` (the soft pair Närvaro + Dagens pass doesn't count), `isEmptyPass`, `markFresh` / `isFreshPass` (in-memory origin = id + fresh signature: `passSignature(sessionToShare)` + title + notes + block coachNotes), and `noteChange`.
- **Tip (A1):** `SessionBuilder` shows «Tomt pass?» only when `coachStationCount(session) < 1` and it isn't dismissed. The `showFirstVisitTip` state is removed; the `builderFirstVisitSeen` bookkeeping is untouched.
- **Confirm skip (B1/C1):** the three `handleConfirm*` handlers take the mall as an argument (defaulting to the pending one). A `pick()` helper runs the handler at once when the pass is fresh, otherwise it sets the pending state, which shows the confirm. Covers the built-in, Mina mallar and föreningsmall pickers, plus ClubAdminSection. The Slice 41 `armUndo` and Ångra toast are unchanged.
- **Mark fresh:** `App.tsx` `goNew` / `goTemplate` (Tomt pass) and `goWizardFinish`, and the three confirm handlers right after the new pass is written (so the replaced pass is still judged by its own origin).
- **Auto-copy (D1):** `archiveReplacedDraft` skips a fresh pass instead of `countSessionItems < 1`.
- `SLICE_NUMBER = '42'`; test asserts bumped. No CSS, no strings.

## Decisions
1. **AC12 «edit then put back by hand stays not-fresh»:** comparing signatures alone can't tell, so `noteChange(session)` (an App `useEffect` on `session`) drops the origin at the first difference. It sits in App so Hallöversikt edits count too. An edit made and put back inside Hallöversikt in one visit, before the effect sees it, would not be caught. App re-renders on every `onChange`, so in practice every drag is seen.
2. **Ångra (Slice 41) doesn't re-mark.** A restored Tomt pass is fresh because it's empty; a restored untouched mall pass reads as not fresh (HANDOFF §2).
3. **Slice 39 test updated:** a 0-station pass *with a title* is now coach work and gets copied (README: title counts for the confirm). The test now uses an untitled empty pass.

## Verification
- `bun test src` 220/0 (+6 freshPass tests, +3 D1 auto-copy tests); `bun test tools/bank` 26/26; `npx tsc -b` clean; `npm run lint` 0 errors; `npm run build` ok.
- Smoke `verifier/slice-42-builder-smoke.mjs` @ 390×844: 24/24 (results JSON next to it; screenshots `/workspace/screenshots/slice42_*`).
- Not verified: AC8 föreningsmall (needs a club backend; same `pick` path as built-in / Mina mallar), AC10 pass note / block note in the UI (unit-tested only), AC11 add/move station and Hallöversikt drag variants (minute change tested in the smoke; the signature covers blocks and placements), AC17 is by inspection (no strings or CSS touched).

## Bundle (F1, gzip -9)
| | main 1814e50 | branch | Δ |
|---|---|---|---|
| all js+css | 218 833 | 219 011 | **+178** |
| eager (index.html) | 154 944 | 155 125 | +181 |
