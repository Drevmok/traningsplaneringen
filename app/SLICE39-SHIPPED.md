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
- Tests: Slice 39 asserts (feedback.test.ts 25/45/46, clubTemplates.test.ts:316); new `lib/autosave.test.ts` (19 tests).

## Open items
1. **Mina mallar cap (8): decided by Christoffer, see «Cap rule» below.**
2. **Two tabs:** last write wins. Not handled (out of scope).
3. **iOS swipe-away (`pagehide`):** implemented, and AC5 passes in desktop Chrome (tab closed within 300 ms → change kept). **Not confirmed on a real iPhone home-screen app**; needs a device check (edit, swipe away within 1 s, reopen).
4. **Import cycle:** avoided. `savedTemplates.ts` imports `session.ts`, so the guard lives in `lib/autosave.ts` and `session.ts` exposes only an injected hook (`setBeforeDraftWrite`). No new chunk; `dist/assets` has the same 10 files as main.
5. **E1 with Slice 27 Soft Samling:** Tomt pass starts with Närvaro + Dagens pass (2 items), so «< 1 station» never fires. Decision: a pass that is not the stored one is written only once it has more stations than it started with (= first station added). A title edit alone does not save it (AC8). The stored pass always saves, including at 0 stations (AC16).
6. **Action row at 390 px:** one line: Kör passet · Mer · «Sparat» (Hallöversikt sits in Mer at this width, as before). No overlap; `.more-menu` placement unchanged.

## Cap rule (Mina mallar), per Christoffer 2026-10-13 (second decision, replaces «skip»)
- Copies made by the autosave replace guard are stored with `auto: true` (`SavedTemplate.auto`). Entries without the flag (all existing ones, every hand-save, Ny vecka) are hand-saved. Same key, no migration.
- Cap 8 plus **one spare slot for an auto-copy** (max 9). `addWithCap` (newest first) adds the new entry, then while the list is over 8:
  - **Auto-copy:** the oldest *other* auto-copy goes. If there is none (all 8 hand-saved or legacy), the copy keeps the spare slot → 9. Never skipped, so a replaced pass is never silently lost.
  - **Hand-save:** the oldest auto-copy goes first (spare included), then the oldest entry, as on main. A hand-save never leaves more than 8.
- No new UI. Dedupe by `passSignature` unchanged.

### Edge cases
| Before | Action | After |
|---|---|---|
| < 8 entries | any save | added, nothing evicted |
| 7 hand + 1 auto (8) | auto-copy | old auto goes → 7 hand + new auto (8), normal rule |
| 8 hand (incl. legacy) | auto-copy | spare used → 8 hand + auto (9) |
| 8 hand + spare auto (9) | auto-copy | spare replaced → 8 hand + newer auto (9) |
| 8 hand + spare auto (9) | hand-save | spare goes first, then the oldest hand-saved (still over 8) → 8 hand. Hand-save capacity stays 8, as on main |
| 6 hand + 2 auto (8) | hand-save | oldest auto goes → 7 hand + 1 auto (8) |

### Readers of Mina mallar (9 entries)
Only `SessionBuilder` (state) → `LibraryPanel` Mallar tab (`savedTemplates.map`, no cap or slice) reads the list for display; `sessionAlreadyArchived` / `activityIdInTemplates` / delete / apply iterate it. Home and the wizard do not read Mina mallar. No `slice(0, 8)` or 8-assumption outside `savedTemplates.ts`. Smoke CAP-d: 9 cards in the Mallar tab at 390×844, no overlap, no horizontal scroll (screenshot slice39_08_mina_mallar_9).

### Tests
autosave.test.ts: 8 hand + auto → 9; a newer auto replaces the spare; a hand-save evicts the spare first (back to 8); 7 hand + 1 auto stays 8; legacy entries count as hand-saved; flag survives a storage round trip; hand-save prefers an auto victim; auto evicts the oldest auto; dedupe stays. Smoke section G: CAP-a (9 with spare), CAP-b (spare replaced), CAP-c (flag after reload), CAP-d (9-entry list renders).

## Bundle (gzip -9, dist/assets JS+CSS; main 4b056c8 → branch)
After the F1 fix and the spare-slot cap rule: total 216 969 → 217 831 (**+862 B**) · coach-facing eager 153 079 → 153 946 (+867 B). **Over the soft +512 B limit by ~350 B.** (First ship +683 B; race fix ~+75 B; cap rule ~+104 B.) Why: about 230 B of new or longer Swedish text (the 107-char failure toast, two rewritten sentences, three short keys), the hook (timer, two listeners, status), the guard + try/catch, and the per-pass toast gate, all in the eager chunk because the builder is eager. Removed: one button + `handleSave`. One trim already done (single archive path). Further cuts would mean dropping the identical-JSON skip or the once-per-pass toast, both required by HANDOFF.

## Verifier F1 fix (race on pass replacement)
Verifier (927c23a) found that an edit followed within the 800 ms debounce by «Använd mall» or «Ny vecka» → «Skapa kopia» let the old pass's pending timer fire after the new pass was saved, putting the old pass back in the slot.
- `lib/autosave.ts`: `pendingWrite` holds the debounced write still waiting for the pass on screen (set by `useAutosave`). `beforeDraftWrite` (the hook every `saveDraft` / `adoptAsDraft` runs) **flushes** it first when the incoming pass has a different id: the old pass's last edit is stored, then copied to Mina mallar by the guard, then the new pass takes the slot. The pending entry and timer are cleared, so nothing can fire late. This covers every replacement path at once (Använd mall built-in/Mina mallar/förening, Ny vecka, wizard, import, receive), because they all write through `saveDraft`.
- `lib/useAutosave.ts`: `write()` clears `pendingWrite` for its id; on an id change the hook also flushes any still-pending write of the previous pass (for id changes that don't write, e.g. Tomt pass).
- Tests: 3 new unit tests (Använd mall race, Ny vecka race, same-id save does not flush). Smoke: new section F, F1-mall and F1-nyvecka (replace ~140 ms after the edit): Home = pass on screen, stored = on screen, old pass with the edit in Mina mallar exactly once.
- AC19 smoke selector fixed: it now uses the real apply-all button (exact aria «Spara redskapsförslag på alla stationer som fortfarande saknar sparade redskap»), checks 0 redskap stored before the tap and > 0 after one tap.
- Slice 32/33/37 builder smokes no longer click «Spara utkast»: 32/33 wait for «Sparat» after the mall apply; 37 waits for «Sparat» after the built-in apply and checks AC14b as «Tomt pass not stored yet (E1)». `ROOT` is overridable via `SMOKE_ROOT`. Re-runs on the local stand-in (outputs in `verifier/slice-39-checks/builder-fix/`): 32 → 26/17, 33 → 139/7, 37 → 23/1, the same pass/fail sets as Verifier's main baseline (remaining fails: hard-coded old slice footers, 32's pre-Slice-33 magic-link flow, 33's two flaky login checks).

## Verification
bun test src 189/0 (24 files) · bun test tools/bank 21 pass/5 skip/0 fail · tsc OK · lint 0 errors · npm run build OK.
Smoke `verifier/slice-39-builder-smoke.mjs` (plain preview :4199, real clock, draft-write spy, 390×844): **38/38 PASS** (with the race and spare-slot cap steps); screenshots /workspace/screenshots/slice39_01…06.

## Deviations
- AC7 Föreningsmall not driven (needs the bank stand-in); its apply goes through `adoptAsDraft`, the same guarded path as Mina mallar (driven) and covered by a unit test.
- AC7 wizard: Home shows «Planera pass» only when no pass is stored, so the smoke cleared the slot first.
- Device-only: AC5 on iOS (pagehide), AC15 (Safari private mode), AC17 (VoiceOver; structurally checked: no role/aria-live on «Sparat», toast uses existing role="status" once).
- AC19: Hallöversikt + «Använd alla förslag» checked; Golvklart, Kör passet, Ny vecka, import and receive-a-pass not re-driven (they use the unchanged `saveDraft` / `adoptAsDraft`, now with the guard).
- HallBoard's own `saveDraft` calls are unchanged (not in scope), so a storage-full error there behaves as on main.
- Bundle over the soft limit (see above).
- Older verifier smokes that click «Spara utkast» (slices 30/31/33/37/38) will fail on purpose, as HANDOFF says.
