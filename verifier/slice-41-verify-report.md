# Slice 41 «Ångra»: Verifier report (re-verify)

**Overall: PASS.** Both earlier defects (AC8 Kör passet, AC2-reX stale autosave after Ångra) are fixed. All 57 driven checks pass in one clean full run at the branch tip.

| | |
|---|---|
| PR | https://github.com/Drevmok/traningsplaneringen/pull/45 |
| Verified HEAD | `ccd3c310a37af6705ac9107bed89136612ff54bf` (`slice-41-code` tip after fetch), base `main` @ `ce799ca` |
| Fix commits covered | `0836eb6` (AC8 + AC2 fixes) and `ccd3c31` (CSS only: undo toast `width:max-content`, `max-width:calc(100vw - 24px)`, Ångra `nowrap`). `bbabfde` holds Planner's separate `verify-b` pack; it touches no app code |
| When | 2026-10-14, 10:27–10:42 (Europe/Stockholm). Clean full run finished 10:38 |
| How | `verify-traningsplaneraren` skill: Launch → Doctor → Drive → Evidence. Headless Chrome via playwright-core, 390×844 touch (plus 1280×800 for AC18 desktop) |
| Driver | `verifier/slice-41-verify.mjs`. It is extended for this re-verify with `A2y` (4 new AC2-reX variants), `AC8-korpasset-stored`, `AC8-korpasset` that now also asserts no toast during the run, and `AC9-geom` (390 px one-line mall toast, for `ccd3c31`) |
| Results | `verifier/slice-41-verify-results.json` (sha `ccd3c31`), log `verifier/slice-41-verify-log.txt`: **57/57 pass** |
| Screenshots | `verifier/slice-41-screenshots/v41_*.png` (refreshed by this run) |

## Setup / Doctor

- Verified in an **isolated detached worktree** (`/tmp/s41x/rv` @ `ccd3c31`). The reason: while my first full run was going, the shared worktree `/workspace/gp-s41` moved from `0836eb6` to `ccd3c31` and its `app/dist` was rebuilt at 10:33. That first run passed 56/56, but it ran on mixed assets, so I discarded it and ran everything again on the fixed tip.
- `npm run build`: exit 0. `npx tsc -b`: 0. `npm run lint`: 0 errors, 15 warnings (all pre-existing). `bun test src`: **211 pass / 0 fail**, including the new `autosave.test.ts` case "remove → write → restoreDraft → same remove". `bun test tools/bank`: 26/26.
- Preview `vite preview --host 127.0.0.1 --port 4173`: HTTP 200. Footer in Passbyggaren shows «Träningsplaneraren · Slice 41».
- Main `ce799ca` (`/tmp/s41x/main`) runs on :57241 for parity and bundle checks.
- AC11 uses the branch bank build (`VITE_SUPABASE_URL=https://bank-mock.supabase.co`, local key) on :57240, routed to my **local stand-in** (`verifier/slice-36-local/up.sh`, `S32_DIR=/tmp/s41x/sb`, ports 57230–57235). The 36-03 smoke gave 8× `t`. No live Supabase request was made (`no-live` PASS).

## Earlier defects: re-verify

| Earlier defect | Fix in | Re-verify result |
|---|---|---|
| **AC8:** undo survived Kör passet | `SessionBuilder.tsx` Kör passet `onClick`: `pendingUndo = null`, drops an undo toast, un-holds. All before `onRun()` | **PASS.** × → Kör passet → Avsluta after 1.2 s: no toast **during** the run (DOM 0) or after it, Ångra not tappable, and the station stays removed on screen and in storage (`AC8-korpasset`, `AC8-korpasset-stored`, `v41_08`, `v41_09`). Hall, Hem and Golvklart exits still PASS |
| **AC2-reX:** × → Ångra → × same station was not saved | Shared `lastWritten` in `autosave.ts`. `restoreDraft` sets it after a write. `useAutosave` reads and writes the same ref | **PASS** on all variants: original (6 s, Hem + reload) `AC2-reX`; **hard reload with no Hem flush** `AC2-reX-reload`; **race**: Ångra inside the 800 ms debounce, then × same `AC2-reX-race`; **double cycle** × → Ångra → × → Ångra → reload: all 3 back, deep-equal `AC2-reX-double`; **chain** after the toast ends, × another → 1 stored `AC2-reX-chain`; control `AC2-reX-control`. `v41_22`, `v41_23` |

Focused second run, `ONLY=A2x,A2y,A8`: 13/13 PASS, so the result is stable.

## Per-AC results (at `ccd3c31`)

| AC | Result | Evidence / note |
|---|---|---|
| AC1 | PASS | × removes at once, no dialog. Toast «Borttagen · Ångra», bottom pill y=756 h=64. `v41_01` |
| AC2 | PASS | Toast lifetime 5000 ms. The station stays removed, and storage has no item or placement for it. AC2-reX variants all PASS (above). `v41_02` |
| AC3 | PASS | Same block and order; items deep-equal. «Ångrat.» shows for 2202 ms with no button. `v41_04` |
| AC4 | PASS | Stored `hallPlacements` equal; Hallöversikt markers at the same x/y. `v41_03`, `v41_05` |
| AC5 | PASS | Reload 47 ms after Ångra: stored. Debounce race: the removal does not land. «Sparat» after reload |
| AC6 | PASS | One toast, timer re-armed (5038 ms from the second ×). Ångra brings back B only. `v41_06` |
| AC7 | PASS | Editing minutes or the title closes the undo. The edit is stored. `v41_07` |
| AC8 | **PASS** (was FAIL) | Hall / Hem / Golvklart / **Kör passet** all expire the undo. `v41_08`, `v41_09` |
| AC9 | PASS | Built-in Nybörjare: one toast «Mallen är i Passbyggaren. · Ångra». Ångra brings back the same id, title, blocks and hall. New `AC9-geom`: at 390 px the toast is one line, 257×64, x 67–323 (margins ≥ 12), Ångra 44 px tall. `v41_10`, `v41_11` |
| AC10 | PASS | Mina mallar source: undo restores. Mina mallar = before + 1; the source is untouched. `v41_15` |
| AC11 | PASS | Föreningsmall (local stand-in): toast sequence `["Mallen är i Passbyggaren. · Ångra","Ångrat."]`. No club copy saved. `v41_16`, `v41_17` |
| AC12 | PASS | 3 Teknik auto-placed by the mall. After Ångra: old placements stored and old DOM markers. `v41_12` |
| AC13 | PASS | Reload after the mall undo gives the same pass id. Hem «Fortsätt passet» opens it |
| AC14 | PASS | Mina mallar 0 → 1: auto-copy of the old pass only |
| AC15 | PASS | Mall again: still 1 copy. `v41_13` |
| AC16 | PASS | Tomt pass / 0-item pass → mall → Ångra: the blank pass is back, Mina mallar unchanged |
| AC17 | PASS | Adding a station before Ångra closes the toast. The mall pass keeps the edit (9 → 10). `v41_18` |
| AC18 | PASS (gap) | Tab + Enter → focus on Ångra (`:focus-visible`), held 7 s, Enter undoes. Escape closes; blur re-arms. Same for the keyboard mall flow. Run at 390 and 1280. Touch: not held, closes after 5 s. `v41_19_*`. **Gap:** no real device with an external keyboard; real iOS `:focus-visible` not observed |
| AC19 | N/A (manual) | VoiceOver cannot run on the box. Proxy PASS: `role=status` per toast, separator `aria-hidden`, `<button type=button>`, 0 DOM mutations during the toast's life, «Ångrat.» in status. A real iPhone VoiceOver pass is still needed |
| AC20 | PASS | No dialog for ×. The confirm markup is identical to main. Other toasts last 2.2 s with no button. Import behaves as on main. Ångra is 53×44. Covered controls can be tapped again once the toast closes. `v41_20_*`, `v41_21` |
| AC21 | PASS (soft budget overrun) | **+632 B gz** vs main. See Bundle |
| AC22 | PASS | Build green; `bun test src` 211/0; footer «Träningsplaneraren · Slice 41» |

**Counts (22 ACs):** 21 PASS (AC18 with a device gap, AC21 with the soft overrun), 0 FAIL, 1 N/A manual (AC19), 0 SKIP.

## Blast radius

- **Slice 37/39 on Använd mall:** blocks, placements, hall and Mina mallar are identical on main and branch; only the toast differs (`BR-mall` PASS).
- **Slice 39 autosave:** the shared `lastWritten` replaces useAutosave's private ref. Seed status «Sparat», the debounce race and every re-× variant pass, and `bun test` covers it.
- **`ccd3c31` CSS:** `.toast` is shared by every builder toast. Plain toasts (Sparad som egen mall, Kopierat, failure) still pass AC20-plain. The × toast keeps the same geometry (y 756, h 64), and the bottom controls can be tapped after close.
- No page errors. No live Supabase host contacted.

## Bundle (AC21, `gzip -9c`, sum of `dist/assets/*.js` + `*.css`)

| | main `ce799ca` | first verify `12fb874` | tip `ccd3c31` | Δ vs main |
|---|---|---|---|---|
| all js + css | 218 201 | 218 794 | 218 833 | **+632** |
| eager (in `index.html`) | 154 314 | 154 899 | 154 944 | +630 |
| main chunk `index-*.js` | 140 155 | 140 708 | 140 729 | +574 |
| css | 14 159 | 14 191 | 14 215 | +56 |

The two fixes added +39 B (+21 JS, +24 CSS). That puts the slice **120 B over the soft +512 B (F1)**, up from 81 B. It is soft, so this is not a FAIL. It is Planner's call.

## Notes for Planner (not failures, carried from the first verify)

1. Focus after Ångra or Escape lands on `<body>`, because the Ångra button unmounts. Not in an AC; possible polish.
2. Hem «Från mall» → Ångra brings back the blank «Nytt pass» that App created, not the earlier pass, which stays in Mina mallar. This matches the lock, but it may surprise a coach.
3. The toast covers «Bläddra bland idéer» while shown (5 s at most, or while held by focus).
4. Real iOS Safari spot check: whether the programmatic focus after the mall confirm counts as `:focus-visible`. If it does, the toast stays until blur.

## Not done / gaps

- AC19: real VoiceOver on iPhone (manual).
- AC18: real 390 px device with an external keyboard.
- PR not merged, Pages not published, Christoffer not contacted.
