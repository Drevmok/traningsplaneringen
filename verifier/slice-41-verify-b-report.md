# Slice 41 «Ångra» — Verifier report, second pass "-b" (PR #45, slice-41-code @ 12fb874)

> File note: a parallel Verifier run pushed `slice-41-verify-report.md` / `-results.json` / `slice-41-verify.mjs` (89c83d5) while this pass was running, and Builder then pushed 0836eb6 (fix for AC8 + AC2). To avoid overwriting their files this pass uses the `-b` names. Everything below was measured on **12fb874**, not 0836eb6.

Verifier, 2026-10-14. Own worktree `/tmp/s41v/wt` (main `/tmp/s41v/main` @ ce799ca), own local stand-in `/tmp/s41v/sb` (36-03: 8 × t; reinstalled PG 17 / PostgREST / GoTrue on the box after a reset). Nothing against the live project (0 live hosts). Headless Chrome 390×844 DPR 2 touch (+ 1280×900 desktop for keyboard). Script `verifier/slice-41-verify-b.mjs` → `slice-41-verify-b-results.json`: **63 PASS / 1 FAIL**. Raw output `verifier/slice-41-checks/`, screenshots `verifier/slice-41-screenshots/` (+ `/workspace/screenshots/s41v_*`). Seed: `slice-41-checks/seed.ts` = 4 Teknik (distinct minutes, notes with åäö, saved redskap incl. an explicit `[]`, placements with and without `zoneId`) + 3 Uppvärmning.

## Per-AC table

| AC | Result | Evidence |
|---|---|---|
| AC1 | PASS | × on middle Teknik → gone at once, 0 dialogs, toast «Borttagen · Ångra» (`s41v_01_removed_toast`) |
| AC2 | **FAIL (re-× variant)** | Basic: toast visible 4 979 ms, then closes; stored pass has 3 Teknik, 3 placements ✓. **× → (> 0.8 s) Ångra → × the same station again**: screen 3 stations and «Sparat», but storage keeps 4, and after reload the station is back (data loss). With the first gap < 0.8 s it saves correctly. Repro `slice-41-checks/rex-repro.mjs`, `s41v_11` (confirms the parallel run's Defect 2) |
| AC3 | PASS | × first / middle / last Teknik and middle Uppvärmning → Ångra → whole stored pass deep-equal to before (order, minutes, note, redskap, other blocks). «Ångrat.» 2 180 ms, no button (`s41v_02_undone_toast`) |
| AC4 | PASS | `hallPlacements` equal incl. array position and `zoneId`, for all three. Dragged marker (Blå, dragged to 0.6117, 0.7733) → × → Ångra → stored equal, drawn at 0.6105, 0.7692 (`s41v_03_dragged_marker_restored`) |
| AC5 | PASS | Reload right after Ångra → stored = before |
| AC6 | PASS | × A, × B 3 s later → one toast, still there 6.5 s after A (fresh 5 s); Ångra → B back at its position, A stays removed |
| AC7 | PASS | × → minutes on another station → toast gone, no Ångra; edit saved, station still removed. Same for a title edit |
| AC8 | **FAIL (Kör passet)** | Hallöversikt, Golvklart, Hem, reload, and mall-toast → Hem: no toast, change kept ✓. **Kör passet**: RunPass is an overlay, SessionBuilder stays mounted. The toast keeps running hidden under it. Back via «Avsluta» after 2.3 s → «Borttagen · Ångra» still shown and Ångra restores the station (`s41v_09`, `s41v_10`, repro `slice-41-checks/korpasset-repro.mjs`) |
| AC9 | PASS | Built-in Nybörjare over a Blå pass → «Mallen är i Passbyggaren. · Ångra», focus on Ångra (`s41v_04_mall_toast`); Ångra → same id, title, blocks, hall `forening-bla` |
| AC10 | PASS | Mina mallar → same toast → Ångra → previous pass deep-equal; Mina mallar = before + 1 |
| AC11 | PASS | Föreningsmall from my stand-in (Vit, bank build): toast episodes over 3.5 s = «Mallen är i Passbyggaren. · Ångra» once, then «Ångrat.»; previous pass deep-equal; Mina mallar + 1 (`s41v_06_club_toast`) |
| AC12 | PASS | Mall auto-placed 3 Teknik in Standard trupp → Ångra → placements = the old 4 only, hall back to Blå, 4 markers drawn (`s41v_05_mall_undo_hall`) |
| AC13 | PASS | Reload → stored id = pre-mall id; Fortsätt passet opens «S41V eget Blå» |
| AC14 | PASS (note) | Auto-copy of the previous pass kept, no copy of the mall pass, count = before + 1. Spare slot: 8 hand-saved → 9 after mall, 9 after Ångra, 9 after mall again. 8 hand + 1 old auto → the old auto-copy is evicted by the Slice 39 cap when the mall runs and is **not** brought back by Ångra (count = before, not before + 1). See F4 |
| AC15 | PASS | Mall again over the restored pass → still one auto-copy of it |
| AC16 | PASS (note) | Tomt pass (2 Samling rows) → mall → Ångra → same title and rows on screen; Mina mallar 0. The blank pass was never stored before the mall (Slice 39: blank pass not written), so "same id in storage" can't be compared |
| AC17 | PASS | Edit the mall pass → toast gone, mall pass stays with the edit (stored) |
| AC18 | PASS (real keyboard PENDING-real) | Desktop and 390 emulated: focus × + Enter → focus on Ångra; still open after 6.5 s while focused; Enter undoes; Escape closes without undo. After Ångra / Escape focus goes to `<body>` (F5) |
| AC19 | PENDING-real | VoiceOver not available. Statically: `role="status"`, Ångra is a real `<button type=button>` named «Ångra», separator `aria-hidden="true"`; toast text not changed while shown; × → Ångra swaps the same live node to «Ångrat.» |
| AC20 | PASS (notes) | No dialog on ×; Använd mall confirm text identical to main (E1). «Sparad som egen mall.» 2 180 ms, no button. Ångra 53×44 px; contrast 14:1. After close nothing remains over the page. While shown, the pill (159×64 px at bottom 24) covers the middle of a row (`s41v_07`). The mall toast wraps to 2 lines at 390 (F3, `s41v_08`) |
| AC21 | **FAIL (soft)** | gzip -9 total 218 201 → 218 794 = **+593 B** (eager +585). Over the +512 B soft cap by 81 B. Matches Builder |
| AC22 | PASS | Build OK; `bun test src` 210 / 0 (25 files); `tools/bank` 26 / 0; tsc 0; lint 0 errors (15 pre-existing warnings); footer «Träningsplaneraren · Slice 41»; asserts at feedback.test.ts:25/45/46 and clubTemplates.test.ts:316 |

## Autosave race (× / Använd mall then Ångra after a gap)

Sampler read the stored draft every 20 ms, then reload.

| × → Ångra gap | removed state ever stored | stale write after Ångra | final = before | after reload |
|---|---|---|---|---|
| 0 ms | never | 0 | ✓ | ✓ |
| 100 ms | never | 0 | ✓ | ✓ |
| 400 ms | never | 0 | ✓ | ✓ |
| 790 ms | never | 0 | ✓ | ✓ |
| 900 ms (control) | 820–900 ms | 0 | ✓ | ✓ |
| 1 500 ms (control) | 821–1 500 ms | 0 | ✓ | ✓ |

- Minutes edit pending → × within 800 ms → Ångra at 100 ms → after reload the edit (11 min) and all 4 stations are kept.
- Använd mall → Ångra (built-in and Mina mallar) at 0 / 100 / 400 / 790 / 900 ms: 0 mall-pass writes after Ångra, stored and after reload = previous pass (same id), Mina mallar = before + 1, no copy of the mall pass. 10/10.

## Numbered findings

0. **F0 (FAIL, AC2 / B1, data loss): removing again after Ångra is never saved.** This happens when the first removal had already autosaved (gap > 800 ms). `restoreDraft` writes behind `useAutosave`, so `last.json` still holds the removed state. The second × then equals `last.json`, the new Slice 41 branch cancels the write, and the screen says «Sparat» while storage still has the station.

   | First gap | Screen | Stored | After reload |
   |---|---|---|---|
   | 300 ms | 3 | 3 | 3 ✓ |
   | 1 500 ms | 3 | **4** | **4** ✗ |

   My race table (× → Ångra only) missed it, and a parallel Verifier found it first. Builder's 0836eb6 says it fixes this; not re-verified here.
1. **F1 (FAIL, AC8): Kör passet does not end the undo.** RunPass renders over the builder (`App.tsx:416`), so SessionBuilder isn't unmounted. Back within 5 s, the «Borttagen · Ångra» toast is still there and works. HANDOFF assumed `onRun` unmounts. Fix: disarm `pendingUndo` and close the toast when Kör passet opens (e.g. in the builder's `onRun` handler).
2. **F2 (FAIL soft, AC21):** +593 B gz vs +512 B soft cap (+81 B). Planner call.
3. **F3 (cosmetic, AC20 / microcopy):** at 390 px the pill is shrink-to-fit inside `left: 50%` (max ≈ 50 % of the viewport). «Mallen är i Passbyggaren.» wraps to 2 lines (span 41 px for a 20 px line); the microcopy notes expected one line. «Borttagen · Ångra» fits. Possible fix: `white-space: nowrap` or `width: max-content; max-width: calc(100vw - 32px)`.
4. **F4 (info, AC14 spare-slot):** with 8 hand-saved + 1 older auto-copy, the mall's auto-copy evicts the older auto-copy (Slice 39 cap). Ångra leaves the list as is, so that copy is gone and the count is unchanged rather than + 1. This follows README «leave it»; the AC's "+1" assumes room.
5. **F5 (a11y minor, AC18):** after Ångra and after Escape, focus lands on `<body>` (the toast is gone). Allowed for Ångra by HANDOFF («if easy; else leave it»). For Escape, keyboard users lose their place.
6. **F6 (info):** a plain toast during a pending undo (e.g. «Sparad som egen mall.») replaces the undo toast without clearing `pendingUndo`. No button is left, so nothing can trigger it, and it is dropped on the next change or exit. Harmless.
7. **F7 (smokes):**
   - Slice 41 Builder 27/27.
   - Old smokes vs last runs (Slice 40 re-verify) are the same except for expected changes:
     - Footer now reads 41.
     - 37 Builder AC9a/AC9c and 37 Verifier A0/C9b/E9: Slice 41 adds a toast to built-in / Egen mall and adds Ångra to the club toast.
     - 39 Verifier AC3/AC17: its edit run includes a ×, which now shows «Borttagen · Ångra».
     - 40 Builder AC1/2/8-main: main now contains Slice 40.
     - 40 Verifier at a0ca4fe: values superseded by the 0cba89e grid; 40 re-verify 1 fail = footer.
     - 35 Verifier [V]: missing `/tmp/s35tok` harness file after the box reset.
   - Counts: 39 B 1, 39 V 4, 38 B 1, 38 V 3, 37 B 2, 37 V 5, 36 B 6, 36 V 2, 35 B 8, 35 V 11, 34 B 2, 34 V 1, 33 B 5, 32 B 17.
   - **R2 fixed:** `slice-37-verify.mjs` C7e now picks a free hall spot by `elementFromPoint` (no marker or button within ±30 px). C7e PASS. Not in Builder's smoke.
8. **F8 (secrets):** `git grep` on 12fb874: no key values; dists: only supabase-js' `"sb_secret_"` prefix check; committed outputs clean.
9. **PENDING-real:** AC19 VoiceOver; AC18 with an external keyboard on a phone; iOS Safari doesn't focus buttons on tap, so focus-to-Ångra after a tap doesn't apply there (fine).

## Verdict

**FAIL (two hard defects).** AC8 fails on the Kör passet exit (F1). AC2/B1 loses data when you remove again after Ångra (F0). AC21 is over its soft cap (+593 B, Planner call). Everything else passes: undo is exact (order, fields, redskap, placements, dragged markers), all three mall paths work, there's no race at any gap, and Mina mallar behaves as the README says. **Not ready to merge** at 12fb874. Builder's 0836eb6 targets both F0 and F1. Next: re-verify 0836eb6 for AC2 (re-× variant at gaps 300 / 900 / 1 500 ms), AC8 Kör passet and the bundle. Not merged by Verifier.

---

## Re-verify at ccd3c31 (2026-10-14)

**Commit verified:** `ccd3c31` (PR #45, slice-41-code). The app code is 0836eb6 plus the toast CSS fix: `.toast` gets `width:max-content; max-width:calc(100vw - 24px); box-sizing:border-box` and `.toast-action` gets `white-space:nowrap`. Main is `ce799ca`. Setup: local stand-in only (PG17 + PostgREST + GoTrue on 5733x), headless Chrome, 390×844 DPR 2 touch plus a 1280×900 desktop context. Requests to the live project: 0. Script: `verifier/slice-41-reverify-b.mjs`. Results: `slice-41-reverify-b-results.json`. Raw output: `slice-41-checks/reverify/`.

**Result: 96 PASS / 0 FAIL, 0 page errors.** First pass was 63/1.

### AC table
| AC | Result | Evidence |
|---|---|---|
| AC1 | PASS | × on the middle of ≥ 3 removes the station at once, with no dialog. Toast «Borttagen · Ångra» |
| AC2 | **PASS** (was FAIL F0) | Toast closes by itself at ~5 s and the station stays removed. × → Ångra → × matrix: 25/25. Minutes change after Ångra (>800 ms) survives reload. × → Ångra → × → Ångra gives the original back |
| AC3 | PASS | Stored pass is deep-equal after Ångra for first, middle and last Teknik and middle Uppvärmning. «Ångrat.» shows ~2.2 s with no button |
| AC4 | PASS | hallPlacements come back with exact x/y and in the same array position, including a dragged Blå marker |
| AC5 | PASS | Reload < 1 s after Ångra: the restored station is stored |
| AC6 | PASS | × A, × B: one toast and a fresh 5 s. Ångra brings B back; A stays removed |
| AC7 | PASS | Minutes or title edit closes the toast and no Ångra is left |
| AC8 | **PASS** (was FAIL F1) | Hallöversikt / Golvklart / Hem / **Kör passet** / reload / mall-toast→Hem all checked within 5 s and back. In each case: no toast and no Ångra, and the change stays in place |
| AC9–AC13 | PASS | Built-in, Mina mallar and Föreningsmall (stand-in) Ångra restore the previous pass: same id, blocks, hall and placements. Survives reload |
| AC14 | PASS (F4 accepted) | Auto-copy is kept and no mall copy is created. Spare-slot cases behave as in the first pass |
| AC15–AC17 | PASS | No second auto-copy. Blank pass is restored. An edit before Ångra closes the toast |
| C1 combos | PASS | × then mall, and mall then ×: only the last action is undone, and no second undo is offered |
| AC18 | PASS | Keyboard: focus moves to Ångra, the toast stays while focused, Enter undoes, Escape closes (desktop + 390) |
| AC20 | PASS | Tap target ≥ 44 px, role=status, nothing left behind after close, E1 confirm text identical to main, plain toast 2.2 s |
| AC22 | PASS | Footer «Träningsplaneraren · Slice 41» |
| Device feel | PENDING-real | |

### × → Ångra → × matrix (same station unless noted). Each cell means screen = storage = reload = 3 stations
| gap before Ångra ↓ / before 2nd × → | 0 | 300 | 900 | 1500 | 900 (other station) |
|---|---|---|---|---|---|
| 0 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 300 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 790 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 900 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 1500 | ✓ | ✓ | ✓ | ✓ | ✓ |

Also: AC2-min-300 ✓ and AC2-min-1500 ✓ (4 stations, 12 min after reload), AC2-twice ✓.

### Races (in-page sampler every 20 ms)
- × → Ångra at 0/100/400/790/900/1500 ms: no stale write, and final = reload = before (6/6).
- Edit + × within 800 ms: edit kept.
- Mall built-in and Mina mallar → Ångra at 0/100/400/790/900 ms: no mall-pass write after Ångra, same id after reload (10/10).

### Toast layout (ccd3c31 CSS)
| Width | Toast | span h / line-h | toast box | scrollWidth |
|---|---|---|---|---|
| 320 | «Borttagen · Ångra» | 20 / 20.3 (1 line) | 81–239 | 320 |
| 320 | «Mallen är i Passbyggaren. · Ångra» | 20 / 20.3 (1 line) | 32–288 | 320 |
| 390 | «Borttagen · Ångra» | 20 / 20.3 | 116–274 | 390 |
| 390 | «Mallen är i Passbyggaren. · Ångra» | 20 / 20.3 | 67–323 | 390 |

Both toasts stay on one line, with no horizontal scroll and no clipping. **F3 (finding 5, mall toast wrap; it was 41 px at 390) is fixed.**

### Bundle (gzip -9, js+css)
- Main 218 201 → branch 218 833: **+632 B**. Eager is +630. This matches Builder's figure. It is 120 B over the +512 soft cap (F2, still open, minor).

### Smokes (same stand-in; compared with slice-41-checks/smokes)
For every smoke, the set of failing IDs is identical to the last run, so there are no new failures:

| Smoke | Result |
|---|---|
| 32 builder | 26/17 |
| 33 | 141/5 |
| 34 builder | 29/2 |
| 34 verify | 31/1 |
| 35 builder | 33/8 |
| 35 verify | 36/11 |
| 36 builder | 40/46 |
| 36 verify | 15/17 |
| 37 builder | 2 fail |
| 37 verify | 40/45 (C7e passes) |
| 38 builder | 25/1 |
| 38 verify | 68/3 |
| 39 builder | 37/1 |
| 39 verify | 68/4 |
| 40 builder | 16/4 |
| 40 reverify | 38/1 |
| 41 builder | **34/34** (was 27/27; Builder added checks) |

### Tests
- `bun test src`: 211 pass / 0 fail.
- lint: 0 errors, 15 warnings.
- tsc: 0.
- build: OK.
- Secret grep (git tree at ccd3c31, dists, committed outputs): clean. The only hit is the bare `sb_secret_` prefix literal inside the supabase-js library.

### Findings
0. F0 (re-× after Ångra not saved) is **fixed**.
1. F1 (Kör passet keeps undo) is **fixed**.
2. F2 (bundle +632 B, over the soft cap by 120 B) is open and minor.
3. F3 / finding 5 (mall toast wraps) is **fixed** at 320 and 390.
4. F4 (spare-slot eviction) is accepted.
5. F5 (focus goes to body after auto-close) is unchanged and minor.

### Verdict
**PASS. Ready to merge** at ccd3c31. The only remaining items are minor: F2 bundle (+120 B over the soft cap) and F5. Device feel is PENDING-real.
