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
