# Slice 41 «Ångra» — Verifier report

**Overall: FAIL** (2 defects: AC8 Kör passet exit, AC2/B1 stale autosave after Ångra). Everything else passes.

| | |
|---|---|
| PR | https://github.com/Drevmok/traningsplaneringen/pull/45 |
| Verified HEAD | `12fb8749eed90760d7da0e67039d04cc57c1a573` (`slice-41-code`), base `main` @ `ce799ca` |
| When | 2026-10-14, 09:58–10:20 (Europe/Stockholm) |
| How | `verify-traningsplaneraren` skill: Launch → Doctor → Drive → Evidence. Headless Chrome via playwright-core, 390×844 touch (plus 1280×800 for AC18 desktop) |
| Driver | `verifier/slice-41-verify.mjs` (my own script, separate from Builder's smoke). It reuses only `verifier/slice-41-seed.ts` for fixed passes |
| Results | `verifier/slice-41-verify-results.json`, log `verifier/slice-41-verify-log.txt`: **49/51 checks pass** in one full run |
| Screenshots | `verifier/slice-41-screenshots/v41_*.png` |

## Setup / Doctor

- `npm run build` on the branch: exit 0. `npx tsc -b`: 0. `npm run lint`: 0 errors, 15 warnings (all pre-existing). `bun test src`: **210 pass / 0 fail** (25 files). `bun test tools/bank`: 26/26.
- There is no `npm test` script in `app/package.json` on main or on the branch. The repo's test command is `bun test src`, so AC22's «npm test» is read as that.
- Preview `npm run preview -- --host 127.0.0.1 --port 4173`: HTTP 200 on `/traningsplaneringen/`. Footer in Passbyggaren shows «Träningsplaneraren · Slice 41».
- Main `ce799ca`: a separate worktree at `/tmp/s41x/main`, preview on :57241, used for bundle and parity checks.
- AC11: branch bank build (`VITE_SUPABASE_URL=https://bank-mock.supabase.co`, local publishable key) on :57240. The browser's `*.supabase.co` traffic is routed to **my own local stand-in** (`verifier/slice-36-local/up.sh`, `S32_DIR=/tmp/s41x/sb`, ports 57230–57235; 36-03 smoke 8× `t`). The run made no live Supabase request (`no-live` PASS). I inserted and then deleted one row, `V41 klubbmall`, in the local DB only.
- Note: another Slice 41 setup was running on this box at the same time (`/tmp/s41v`, ports 57130–57143). I used no part of it.

## Per-AC results

| AC | Result | Evidence / note |
|---|---|---|
| AC1 | PASS | Tapping × on the middle Teknik station removes it at once. No dialog. Toast reads «Borttagen · Ångra», bottom pill y=756 h=64. `v41_01` |
| AC2 | **FAIL** (one variant) | Basic case PASS: toast lives **5002 ms**, the station stays removed, and the stored pass has no item or placement for it (`v41_02`). **Variant `AC2-reX` FAILS:** × → (1.5 s) Ångra → × the **same** station again. The screen shows it removed and the header says «Sparat», but storage still holds 3 Teknik items. After Hem + reload the station is back (header 18/60 min = all 3). `v41_22`, `v41_23`. Control: re-× a *different* station → stored correctly. See Defect 2 |
| AC3 | PASS | × → Ångra after 1.5 s: same block, same order; items deep-equal, including minutes, notes and ids. «Ångrat.» shows **2203 ms** with no button. `v41_04` |
| AC4 | PASS | Stored `hallPlacements` equal to the original. Hallöversikt markers sit at identical normalised x/y before × and after Ångra. `v41_03`, `v41_05` |
| AC5 | PASS | Reload 42 ms after Ångra: the station is stored. Race variant (Ångra 250 ms after ×, inside the 800 ms debounce): the removal write does not land. Header shows «Sparat» |
| AC6 | PASS | × A, then × B 3 s later: one toast, still there 7 s after A. Its life from the second × is **5045 ms**, so the timer re-arms. Ångra brings back B only; A stays removed. `v41_06` |
| AC7 | PASS | × → change minutes on another station: toast and Ångra gone, and the minute change is stored. Editing the title also closes it. `v41_07` |
| AC8 | **FAIL** (Kör passet) | Hallöversikt → back: PASS. Hem → Fortsätt passet: PASS. Hallöversikt → **Golvklart** → Avsluta golvklart → back: PASS. **Kör passet → Avsluta (1.2 s): FAIL.** «Borttagen · Ångra» is still shown with the Ångra button live, and tapping it restores the station. While Kör passet is open, the toast sits under the run overlay (z 50 < 90) and its timer keeps running. `v41_08`, `v41_09`. See Defect 1 |
| AC9 | PASS | Built-in Nybörjare over «V41 eget» (3 placed Teknik): one toast «Mallen är i Passbyggaren. · Ångra». Ångra → same id, title, blocks and hall, then «Ångrat.». `v41_10`, `v41_11`. Also driven from Hem «Från mall» (see note 3) |
| AC10 | PASS | From Mina mallar («V41 egen mall»): toast with Ångra → previous pass back (id, title, blocks, placements). Mina mallar = before + 1 (auto-copy). The source mall is untouched. `v41_15` |
| AC11 | PASS | Föreningsmall from the local stand-in (`section.club-templates`). Toast sequence over the whole run: `["Mallen är i Passbyggaren. · Ångra", "Ångrat."]`. One toast; the mall text is not repeated and does not show after Ångra. Previous pass back (id, blocks, placements). No copy of the club pass in Mina mallar. `v41_16`, `v41_17` |
| AC12 | PASS | The mall pass had 3 Teknik auto-placed (Slice 37). After Ångra, stored placements equal the old pass's, and the Hallöversikt DOM markers match the old ones. No mall item ids remain. `v41_12` |
| AC13 | PASS | Reload after the mall undo: the stored pass has the same id as before the mall. Hem «Fortsätt passet» opens «V41 eget» with 3 Teknik |
| AC14 | PASS | Mina mallar 0 → 1: one auto-copy of «V41 eget», left on purpose. No «Nybörjare» copy |
| AC15 | PASS | Använd mall again over the restored pass: still 1 copy of «V41 eget». `v41_13` |
| AC16 | PASS | Hem «Tomt pass» (only the soft Samling rows) → mall → Ångra: the blank pass is back (title, rows) and Mina mallar stays 0. Also tested with a strictly 0-item pass → same |
| AC17 | PASS | Mall → add a Teknik station from Biblioteket before Ångra: toast gone, the mall pass is stored with the new station (9 → 10, same id). `v41_18` |
| AC18 | PASS (desktop + 390 emulated; gap) | Real Tab walk to × (17 Tabs at 390, 25 at 1280) + Enter → focus on Ångra (`:focus-visible`). The toast is **held 7 s** while focused, and Enter undoes. Escape closes it without undo. Shift+Tab out restarts the timer (closes ~5 s later). Keyboard Använd mall → focus on Ångra, held, Enter undoes. Touch emulation: a tap moves focus to Ångra but not `:focus-visible`, so the timer is not held and the toast closes after 5 s. `v41_19_*`. **Gap:** not run on a real 390 px device with an external keyboard. Real iOS Safari `:focus-visible` after programmatic focus (mall confirm) not observed |
| AC19 | N/A (manual) | VoiceOver cannot run on the box. Proxy PASS: `role=status` is mounted per toast; the separator is `aria-hidden`; Ångra is a `<button type=button>`; the toast DOM changes **0 times** during its 5 s, so no repeat or tick; «Ångrat.» appears in `role=status`. A real VoiceOver pass on iPhone is still needed |
| AC20 | PASS | No dialog for ×. The Använd mall confirm markup is byte-identical between main and branch (`v41_20_*`). Sparad som egen mall 2202 ms, Delningskoden är kopierad 2203 ms, autosave failure 2205 ms: no button on any. Import shows **no toast on main or branch** (the existing remount drops `importDone`), so it is unchanged and not a regression. Ångra is 53×44 px. While shown, the toast covers «Bläddra bland idéer»; after it closes, that button is hittable again. `v41_21` |
| AC21 | PASS (soft budget overrun) | See Bundle below: **+593 B gz**, about 81 B over the soft +512 B (F1) |
| AC22 | PASS | Build green; `bun test src` 210/0; footer «Träningsplaneraren · Slice 41»; asserts at `feedback.test.ts:25/45/46` and `clubTemplates.test.ts:316` read Slice 41 / `'41'` |

**Counts (22 ACs):** 18 PASS (including AC18 with a device gap and AC21 with the soft overrun), **2 FAIL (AC2, AC8)**, 1 N/A manual (AC19), 0 SKIP. AC11 was driven for real against the local stand-in, not skipped.

## Defects (Builder)

### Defect 1: AC8, the undo survives Kör passet
Kör passet is an overlay (`App.tsx` renders `<RunPass>` over a still-mounted `SessionBuilder`). The builder never unmounts, so `pendingUndo` and the toast timer keep going. If the coach comes back within 5 s, Ångra is still live and works.
**Fix hint:** in `SessionBuilder.tsx` the Kör passet button `onClick` (≈ line 533, before `onRun()`), drop the undo: `pendingUndo = null` and close an undo toast (e.g. `if (toast?.undo) closeToast()`). Keep plain toasts as they are if you like.

### Defect 2: AC2 / B1, re-removing after Ångra is never saved (data loss)
Sequence: × (the debounced write lands, so useAutosave's `last.json` = pass without the station) → Ångra (`restoreDraft` writes the full pass **straight to storage, behind useAutosave's back**) → × the same station again. The new session JSON equals `last.json`, so the Slice 41 branch in `useAutosave.ts` (`if (last.current?.json === json) { … return }`) treats it as already written, cancels the timer, and writes nothing. The screen says «Sparat», storage still has the station, and it comes back after reload or Hem (`autosave.flush()` has nothing pending).
**Fix hint (pick one, small):** make `restoreDraft` and useAutosave agree on what was last written. For example, update useAutosave's last-written JSON when `restoreDraft` writes (a shared module-level `lastWritten` in `autosave.ts` that useAutosave reads), or in the equal-JSON branch skip only when storage really holds that JSON. Add a test: remove → write → restoreDraft → same remove → expect the removal stored.
Re-verify will rerun `ONLY=A2x,A8,A12,A345 node verifier/slice-41-verify.mjs` plus the full run.

## Notes for Planner (not failures)

1. **Bundle F1 (soft):** see below. +593 B is over +512 B by 81 B. It is soft, so not a FAIL on its own; it is Planner's call. The two fixes above should add only a few bytes.
2. **Focus after Ångra / Escape** lands on `<body>` (the Ångra button unmounts). HANDOFF allowed «leave it if not easy», but for keyboard and switch users focus is lost. It could go back to the restored item's × or the builder heading, as HANDOFF suggested. Not in an AC.
3. **Hem «Från mall» path:** App first creates a **new blank pass** and opens the picker (the confirm shows because of the Samling rows). Ångra therefore brings back that blank «Nytt pass», not the earlier pass with stations, which is only in Mina mallar (Slice 39 copy). This matches the lock (before = the pass on screen), but a coach might expect the old pass. Worth a Planner/Docs look; AC9 was proven from the builder's «Använd mall».
4. The toast covers «Bläddra bland idéer» (an empty-block button) while shown, for at most 5 s or while held by focus. It is hittable again after close, which is what AC20 asks.
5. On a phone, the mall-confirm focus move did not hold the toast in Chrome touch emulation. Real iOS Safari should still be spot-checked: if Safari treats that programmatic focus as `:focus-visible`, the mall toast would stay until blur.

## Blast radius

- **Slice 37 auto-place + Slice 39 auto-copy on Använd mall:** a built-in mall over the same seeded pass gives identical blocks, placements, hall and Mina mallar on main and branch; only the toast differs (`BR-mall` PASS).
- **Slice 39 autosave:** «Sparat» after Ångra + reload PASS, and the debounce race PASS. The **re-× after Ångra** case fails (Defect 2). This is new code-path interaction and does not exist on main.
- **Slice 36 club toast:** now the shared undo toast; shown once (AC11).
- **Other builder toasts:** unchanged, 2.2 s, no button (AC20). HallBoard has its own toast; its code is not touched by the diff.
- No page errors in any run. No live Supabase host contacted.

## Bundle (AC21, `gzip -9c`, sum of `dist/assets/*.js` + `*.css`)

| | main `ce799ca` | branch `12fb874` | Δ |
|---|---|---|---|
| all js + css | 218 201 | 218 794 | **+593** |
| eager (assets in `index.html`) | 154 314 | 154 899 | +585 |
| main chunk `index-*.js` | 140 155 | 140 708 | +553 |
| css | 14 159 | 14 191 | +32 |

These match Builder's numbers. The soft F1 limit is +512 B, so this is **81 B over**.

## Not done / gaps

- AC19 real VoiceOver on iPhone (manual).
- AC18 on a real 390 px device with an external keyboard; real iOS `:focus-visible` behaviour.
- PR not merged, Pages not published, Christoffer not contacted.
