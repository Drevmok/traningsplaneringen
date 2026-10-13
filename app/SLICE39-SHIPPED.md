# Slice 39 — Spara passet automatiskt (SHIPPED, local only)

Worktree `/workspace/gp-s39`, branch `slice-39-code` off `origin/slice-39-docs` (6a21cdf, main 4b056c8). Not pushed, no upstream, not merged. No SQL.

## Change
- `lib/autosave.ts` (new): `archiveReplacedDraft` (stored pass with ≥ 1 station and another id → Mina mallar, deduped via `sessionAlreadyArchived`, title fallback «Nytt pass», own try/catch), `trySaveDraft` (never throws), `shouldAutosave` (E1 rule), registers the guard on `session.ts`.
- `lib/useAutosave.ts` (new): 800 ms debounce, identical-JSON skip, `flush()`, `pagehide` + `visibilitychange: hidden` flush, status `idle | saved | failed`.
- `lib/session.ts`: `setBeforeDraftWrite` hook called at the top of `saveDraft` (so `adoptAsDraft`, wizard, Ny vecka and HallBoard all pass the guard); blank pass title uses `UI.untitledPass`.
- `App.tsx`: `useAutosave` while builder/hall is on screen; flush before Till startsidan, Hallöversikt and Kör passet; `saveStatus` to SessionBuilder.
- `SessionBuilder.tsx`: Spara utkast button + `handleSave` removed; built-in mall saved at once (`trySaveDraft(cloned)`, C1); «Sparat» / «Inte sparat» span at the end of `.builder-actions`; failure toast once per pass id.
- `Home.tsx`: `{draft.title.trim() || UI.untitledPass}`.
- `blockMeta.ts`: `SLICE_NUMBER='39'`; new `autosaveSaved`, `autosaveFailed`, `autosaveFailedToast`, `untitledPass`; `templateBody`, `oppnaPaTelefonHonesty` rewritten; `saveDraft`, `savedToast` removed (all verbatim from microcopy).
- `export.css`: `.save-status`, `.save-status-failed`.
- Tests: Slice 39 asserts (feedback.test.ts 25/45/46, clubTemplates.test.ts:316); new `lib/autosave.test.ts` (8 tests).

## Open items
1. **Mina mallar cap (8):** archiving a replaced pass can push out the oldest mall. Accepted (same as Ny vecka). Not seen in the smoke (max 4 entries).
2. **Two tabs:** last write wins. Not handled (out of scope).
3. **iOS swipe-away (`pagehide`):** implemented, and AC5 passes in desktop Chrome (tab closed within 300 ms → change kept). **Not confirmed on a real iPhone home-screen app**; needs a device check (edit, swipe away within 1 s, reopen).
4. **Import cycle:** avoided. `savedTemplates.ts` imports `session.ts`, so the guard lives in `lib/autosave.ts` and `session.ts` exposes only an injected hook (`setBeforeDraftWrite`). No new chunk; `dist/assets` has the same 10 files as main.
5. **E1 with Slice 27 Soft Samling:** Tomt pass starts with Närvaro + Dagens pass (2 items), so «< 1 station» never fires. Decision: a pass that is not the stored one is written only once it has more stations than it started with (= first station added). A title edit alone does not save it (AC8). The stored pass always saves, including at 0 stations (AC16).
6. **Action row at 390 px:** one line: Kör passet · Mer · «Sparat» (Hallöversikt sits in Mer at this width, as before). No overlap; `.more-menu` placement unchanged.

## Bundle (gzip -9, dist/assets JS+CSS; main 4b056c8 → branch)
Total 216 969 → 217 652 (**+683 B**) · coach-facing eager 153 079 → 153 769 (+690 B) · lazy −7 B. **Over the soft +512 B limit by ~171 B.** Why: about 230 B of new or longer Swedish text (the 107-char failure toast, two rewritten sentences, three short keys), the hook (timer, two listeners, status), the guard + try/catch, and the per-pass toast gate, all in the eager chunk because the builder is eager. Removed: one button + `handleSave`. One trim already done (single archive path). Further cuts would mean dropping the identical-JSON skip or the once-per-pass toast, both required by HANDOFF.

## Verification
bun test src 178/0 (24 files) · bun test tools/bank 21 pass/5 skip/0 fail · tsc OK · lint 0 errors · npm run build OK.
Smoke `verifier/slice-39-builder-smoke.mjs` (plain preview :4199, real clock, draft-write spy, 390×844): **32/32 PASS**; screenshots /workspace/screenshots/slice39_01…06.

## Deviations
- AC7 Föreningsmall not driven (needs the bank stand-in); its apply goes through `adoptAsDraft`, the same guarded path as Mina mallar (driven) and covered by a unit test.
- AC7 wizard: Home shows «Planera pass» only when no pass is stored, so the smoke cleared the slot first.
- Device-only: AC5 on iOS (pagehide), AC15 (Safari private mode), AC17 (VoiceOver; structurally checked: no role/aria-live on «Sparat», toast uses existing role="status" once).
- AC19: Hallöversikt + «Använd alla förslag» checked; Golvklart, Kör passet, Ny vecka, import and receive-a-pass not re-driven (they use the unchanged `saveDraft` / `adoptAsDraft`, now with the guard).
- HallBoard's own `saveDraft` calls are unchanged (not in scope), so a storage-full error there behaves as on main.
- Bundle over the soft limit (see above).
- Older verifier smokes that click «Spara utkast» (slices 30/31/33/37/38) will fail on purpose, as HANDOFF says.
