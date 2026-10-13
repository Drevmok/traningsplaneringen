# Slice 39: Spara passet automatiskt — Verifier report

**PR #43** · branch `slice-39-code` @ **b0f9eab** · main / merge-base **4b056c8** · checklist `slice-39/verification-checklist.md` (AC1–22, docs 6a21cdf, present on the code branch) · 2026-10-13.
**Method:** detached worktree `/tmp/s39v/wt` @ b0f9eab, main in `/tmp/s39v/main`. Plain `npm run build` → `vite preview` :56881 (branch), :56882 (main). Bank builds (`VITE_SUPABASE_URL=https://bank-mock.supabase.co`) :56880 (branch) and :56883 (main), Playwright-routed to **my own local stand-in** (`verifier/slice-36-local`, `S32_DIR=/tmp/s39v/sb`, gateway :56870, PG :56871, PostgREST :56872, GoTrue :56873, SMTP :56875; 36-03 = 8 × t). Headless Chrome 390×844, DPR 2, touch. An init-script spy on `Storage.prototype.setItem` records a timestamp for each draft write and can throw (storage full). A MutationObserver counts toasts and live-region mutations. `verifier/slice-39-verify.mjs` → **54 / 4** (`slice-39-verify-results.json`, raw output in `slice-39-checks/verify-run.txt`). All 4 fails are the race in F1. Local SQL ran on the stand-in only. **No requests to the live project** (route log: 0 live hosts).

**Short:** autosave works for every edit kind Passbyggaren has (~750–800 ms, one write per burst). Flushes on Home, Hallöversikt, Kör passet, reload, navigate-away, tab close and visibilitychange all keep the edit. Save-on-create works for all five paths. HallBoard data is never overwritten. One real data-integrity bug: a pending debounced write survives an id change (F1). Bundle +683 B, over the soft 512 B.

| AC | Verdict at b0f9eab | Short |
| --- | --- | --- |
| 1 | **PASS** | No «Spara utkast» in the row, Fler, Använd mall sheet, Spara som egen mall, Hallöversikt, Golvklart or Home. Main has it in the row, Fler, sheet and dialog (the control set) |
| 2 | **PASS** | Add station → write +749 ms. «Sparat» exact text, `rgb(120,113,108)`, inside `.builder-actions`. Reload → Fortsätt passet shows it |
| 3 | **PASS** | Each edit kind gives 1 write at +782…799 ms. Burst (12 keys 120 ms apart + 5 length taps) → **1** write at +798 ms after the last change. «Sparat» is visible throughout, never «Sparar…». 0 toasts |
| 4 | **PASS** | Edit + 60 tap → Till startsidan 57 ms later → «Hem snabbt · 60 min» |
| 5 | **PASS** (Chrome) / iOS swipe-away **PENDING-real** | `close({runBeforeUnload})`, `reload()` at 0 ms, `goto(about:blank)` and visibilitychange:hidden (+1 ms write) all keep the edit |
| 6 | **PASS** | Built-in Nybörjare → apply → **reload at once** → same id, 3/3 Teknik placements. Home shows it |
| 7 | **PASS** | Mina mallar, Föreningsmall («V39 klubbmall» via stand-in, 2 placements) and Planera pass: reload right after creation → stored. «Sparat» shows on reopen |
| 8 | **PASS** | Tomt pass + title only → no «Sparat», no write. Reload → old pass still on Home |
| 9 | **PASS** | Tomt pass + first station → reload at once → Home shows the new pass, and the old pass is in Mina mallar under its title. *Caveat F4:* dedupe ignores titles |
| 10 | **PASS** | 20 edits + 3 reopen cycles → same id, Mina mallar empty, one Fortsätt passet. Keys = draft + tips only |
| 11 | **PASS** | Same old contents replaced twice → «Pass 5» once |
| 12 | **PASS** | Empty title → «Fortsätt passet Nytt pass · 12 min». Archived as «Nytt pass» |
| 13 | **PASS** | Draft written by **main's** Spara utkast, seeded → Home shows title · min. Opening it writes nothing (byte-identical). First edit = same id, nothing archived |
| 14 | **PASS** | «Inte sparat» + exactly 1 toast with the exact microcopy, `role=status`. Two more failing edits → no repeat. Till startsidan works with no crash. Un-stub → «Sparat». *See F6* |
| 15 | **PENDING-real** | Safari private mode. The headless storage-throw path is AC14 |
| 16 | **PASS** | All stations removed → saved, Home «Fungerar igen · 0 min» |
| 17 | **PASS** (structural) / VoiceOver **PENDING-real** | «Sparat» has no role/aria-live and no live ancestor. Live-region mutations over 5 saved edits: branch 0 = main 0. The failure toast is announced once (role=status, 1 insertion) |
| 18 | **PASS** | 390: row = Kör passet · Mer · «Sparat» (339–378 px), no overlap, scrollWidth 390 (`s39v_01`) |
| 19 | **PASS** | Hallöversikt, Golvklart, Kör passet, import/receive (34/35/38 smokes), Ny vecka (works; see F1 race). Använd alla förslag: 0 redskap stored before the tap, 3 after one tap |
| 20 | **FAIL (soft)** | **+683 B** total / +690 eager vs the ≤ +512 B soft cap. The overrun is explained in the PR / SHIPPED (see Bundle) |
| 21 | **PASS** | build 0, `tsc -b` 0, `bun test src` **178 pass / 0 fail** (24 files), lint exit 0, **0 errors / 15 warnings** (unchanged). Slice 39 asserts present in feedback.test.ts (3) + clubTemplates.test.ts (1) |
| 22 | **PASS** | Footer «Träningsplaneraren · Slice 39», templateBody verbatim in the Använd mall confirm, keys verbatim, saveDraft/savedToast gone, no «!». *Note:* `oppnaPaTelefonHonesty` is not rendered by any component (pre-existing dead key) |

## Findings

1. **Stale debounced write survives a pass-id change (data-integrity race, real).** `useAutosave` clears the timer only on a same-id change. When a new id arrives, the "new pass" branch returns early and does not cancel or flush the pending timer. So an edit followed within ~800 ms by an in-builder id change makes the old write fire *after* the new pass was saved: `trySaveDraft(old)` puts the old pass back in the slot and archives the new one to Mina mallar.
   - Reproduced 4/4 (`H-*`): edit title → **Använd mall** (Kort) at 0 and ~250 ms per tap, and edit → **Ny vecka → Skapa kopia** at 0 and ~250 ms. Each time, Passbyggaren shows the new pass while Home shows the old one («Anvandmall gammal · 53 min», `s39v_08`).
   - At ≥ 0.9 s it behaves correctly (`H-mall-900`).
   - Contents are not destroyed: the new mall goes to Mina mallar, and the Ny vecka copy is identical to the old pass. The next edit on screen writes the right pass back. But going Home straight away loses the on-screen pass from the slot, and each race adds an extra Mina mallar entry, which feeds F2.
   - Fix (1 line): in the id-change branch, clear `timer` / `pending` (or `flush()`) before resetting `start` / `last`. Alternatively flush in `handleConfirmTemplate` / `handleNewWeek` / `handleConfirmSaved` / `handleConfirmClub` before they write.
2. **Mina mallar cap 8 silently evicts a hand-saved mall.** I saved «Min handsparade mall» by hand, then replaced 9 passes. On the 9th the list stayed at 8 and the oldest entry, the hand-saved one, was dropped with no message. This is HANDOFF Open 1 (accepted risk), recorded as a data-loss path. Autosave makes it much more frequent than on main (every Tomt pass / Från mall replaces the slot). It is newest-first, and all archive names were exact (`Pass 8 … Pass 1`, `s39v_04`).
3. **Two tabs: last write wins, silently (HANDOFF Open 2, out of scope).** Tab B gets a `storage` event but has no listener, so its screen keeps the old title. B's next autosave overwrites A's title (same id, nothing archived). A's next edit then overwrites B's added station. Each tab silently drops the other's edits from storage, and neither tab shows anything. When B starts a different pass, A's pass is archived to Mina mallar, so that variant loses nothing. Main has the same model, but only on an explicit Spara utkast.
4. **Archive dedupe ignores the title.** `passSignature` covers blocks, timings and placements, not the title. A pass with the same stations as an existing mall is not archived under its own name. «Kopia av 5» was not archived because «Pass 5» exists, and «Pass 0» was not archived because the hand-saved mall had the same contents. Nothing is lost (the contents exist), but AC9's «under its title» holds only for new contents.
5. **HallBoard: no race found.** Edit → Hallöversikt at once: the title is flushed before the hall renders. Ta bort från hall, Placera här (tray chip → canvas tap) and Använd alla förslag are each written synchronously. After a 1.5 s wait the hook's re-write carries identical hall data. Hall → builder → edit → Home at once keeps both. Hall remove → back → Home → reload within ~300 ms keeps the removal. Golvklart entry writes nothing. Move = remove + Placera här (HTML5 drag not driven headless).
6. **Storage full keeps the pass only in memory.** After «Inte sparat», Till startsidan → Fortsätt passet reloads the last *stored* version, so the unsaved edits are gone. This is by design (B1, the toast tells the coach to send or download the pass), but it is a data-loss path to know.
7. **Edit kinds not present:** Passbyggaren has no station reorder (the `moveUp/moveDown/moveTo` keys are unused) and no pass-notes field, so those were not drivable. Station minutes (in the info panel) and 60/90/120 are covered.
8. **`page.close()` without unload handlers** keeps the previous value. This is a Playwright artefact (no pagehide). The real iOS swipe-away is PENDING-real.
9. **Secrets:** `git grep` b0f9eab for sb_secret values, JWTs, private keys, ghp_/github_pat_, AKIA, sk-: 1 hit, which is the slice-38 report's own description of the pattern, not a value. Both dists: 0 values (only supabase-js prefix literals and `sb_publishable_local_s32`). The stand-in bot key and JWT secret appear in 0 worktree files. Screenshots show no tokens.
10. **Builder smoke re-run** against my build: `slice-39-builder-smoke.mjs` **32 / 0**. *Note:* its AC19 locator `/Använd alla förslag/` also matches the Saknar point-at button; my F4 uses the real apply-all button.

## Bundle (gzip -9, `dist/assets/*.js` + `*.css`, plain build)

| | main 4b056c8 | branch b0f9eab | Δ |
| --- | --- | --- | --- |
| Total JS+CSS | 216 969 | 217 652 | **+683** (soft cap +512) |
| Eager (index js + css) | 138 943 + 14 136 = 153 079 | 139 610 + 14 159 = 153 769 | **+690** |
| Lazy | 63 890 | 63 883 | −7 |

My numbers match Builder's byte-for-byte. AC20's text: «Bundle delta ≤ +512 B gz (soft): … numbers in PR, overrun explained». Lock F1: «+512 B gz total, soft … Builder explains any overrun in the PR». So an overrun is allowed if it is explained, and SHIPPED.md explains it (≈230 B of Swedish text + hook + guard). AC20 is **FAIL-soft / waivable by Planner**, not a blocker.

## Earlier smokes (branch vs main 4b056c8, same stand-in)

| Script | Branch | Main | Classification |
| --- | --- | --- | --- |
| slice-39-builder-smoke | 32/0 | — | — |
| slice-38-builder-smoke | 25/1 | 26/0 | footer «Slice 38» (expected slice number) |
| slice-38-verify | 66/5 | — | 2 × button count −1 (= Spara utkast removed), footer, 2 × «main has no Kvar» (baseline moved: main now contains 38). Expected |
| slice-37-verify (**updated**) | 41/4 | 42/3 | M0, C6, F12 same as main. **A8b** = branch now keeps the built-in pass on reload (C1, the intended change). Expected |
| slice-37-builder-smoke | crash at «Spara utkast» (line 95) | 23/1 | expected removal (Builder script, not edited) |
| slice-36-verify | 15/2 | 15/2 | identical (E1-apply = Slice 37 placements, footer) |
| slice-36-builder-smoke | 40/6 | 40/6 | identical (Slice 37 placements/strings, footer) |
| slice-35-verify | 37/10 | 38/10 | identical fail set (Slice 35 strings, own ERR_FAILED) |
| slice-35-builder-smoke | 33/8 | 34/8 | identical fail set |
| slice-34-verify | 29/3 | — | Same-controls ×2 = «Spara utkast» only diff; footer. Expected |
| slice-34-builder-smoke | 29/2 | 30/2 | identical |
| slice-33-builder-smoke | 133/7 | 140/7 | branch-only S32-AC34/35 = «Spara utkast» in Fler (expected). Main-only AC11d/AC16d (login focus/code, flaky on main). Rest identical |
| slice-32-builder-smoke | 26/17 | 27/17 | identical fail set (Slice 33 replaced magic link with code; strings) |

**No real regressions.** The SQL-based 32/33/36/37 ran on my stand-in only. The first 36-verify run collided with my own V39 club row (F1-write row count). I re-ran it sequentially, and that is the number above. Updated Verifier smoke: `verifier/slice-37-verify.mjs` gets `saveUi()` (clicks «Spara utkast» where it exists, otherwise waits for autosave) plus a null-safe F14b. No other Verifier script used the button. Builder scripts are untouched: 32/33/37 builder smokes still click «Spara utkast». Raw output is in `slice-39-checks/` (`main-baseline/` for main).

## Screenshots (`verifier/slice-39-screenshots/`)

s39v_01_builder_sparat_390, 02_anvand_mall_confirm, 03_home_club_saved, 04_mina_mallar_cap8, 05_hall_after_changes, 06_two_tabs_A, 07_two_tabs_B, 08_race_mall_home, 09_inte_sparat_toast, 10_home_0min.

## Verdict

**PASS with one fix requested.** AC1–14 and AC16–19, 21, 22 PASS. AC20 FAIL-soft (+683 B, explained). AC5 (iOS), 15 and 17 (VoiceOver) are PENDING-real. F1 is a real bug not covered by any AC row, but it violates the D1/AC6 intent («Home shows that mall's pass»).

## Ready to merge?

**Not yet: fix F1 first** (one-line timer cancel/flush on id change, plus a test), then merge. Planner should also accept the +171 B overrun (AC20) and F2 (cap eviction now more likely). F3 and F4 are known or acceptable. Not merged by Verifier.
