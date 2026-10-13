# Slice 37: formal verification report («Teknik på plats direkt från mall», auto-place Teknik on mall apply)

- **Date:** 2026-10-13, ~12:10–13:00 CEST (Europe/Stockholm)
- **Verifier:** Verifier
- **Code under test:** PR #41, branch `slice-37-code` at **`b0e5fbf`** (docs pack `e1ef3fd`, base = `git merge-base` = `main` @ **`c6a11d5`**). Working tree clean, origin not moved. Not merged.
- **Pack:** `slice-37/` LOCKED 2026-10-13 (README A1–F1, HANDOFF, checklist AC1–14).
- **Stand-in (local only, never the live project; no live requests at all, no SQL against it):** `verifier/slice-36-local/up.sh` with my own dir/ports: `S32_DIR=/tmp/s37v/sb`, gateway 56850, PG 56851, PostgREST 56852, GoTrue 56853, SMTP 56855 (36-03 = 8 × t). Previews: 56861 branch bank build, 56862 branch plain build, 56863 main plain build, 56864 main bank build (for the 33 smoke classification). Club rows inserted by the local DB owner only. Browser requests to `https://bank-mock.supabase.co/**` forwarded by Playwright routes to the local gateway (Builder's pattern).
- **Driver:** Playwright (playwright-core) + headless Chrome at **390×844**, DPR 2, touch.
- **Scripts:** `verifier/slice-37-verify.mjs` (**44/45 PASS**, the 1 FAIL = AC6 stacking on Blå hall, F1), `verifier/slice-37-checks/helper-parity.ts` (bun; **4/4 PASS** + stacking table), Builder's `slice-37-builder-smoke.mjs` on my stand-in (**24/24 PASS**, outputs to /tmp).

### Verdict: **PASS with one partial (AC6, pre-existing helper behaviour on the club's Blå/Vit hall). Ready to merge: yes** — no regression, nothing needs a live step. AC6's stacking should go to Planner as a follow-up (needs a helper lock; HANDOFF forbids touching `hallSuggest.ts` in this slice). Real-finger drag is PENDING-real.

| AC | Verdict at b0e5fbf | Short |
| --- | --- | --- |
| 1 | **PASS** | Built-in «Nybörjare — ca 55 min»: draft has 3/3 Teknik markers before Hallöversikt is opened (main @ c6a11d5: 0 on apply). Open Hallöversikt: 3 canvas chips, tray empty, draft byte-identical (no extra/duplicate). Golvklart: 3 chips. There is no separate hall preview in Passbyggaren; Golvklart lives inside Hallöversikt |
| 2 | **PASS** | Föreningsmall (4 Teknik incl. Hjul, hall `forening-bla`) → Använd mall: 4/4 placed on apply, hall `forening-bla` kept |
| 3 | **PASS** | Egen mall with placements (one at exact 0.123/0.456, one removed, + Hjul added unplaced, hall `forening-vit`): all saved markers keep exact x/y/zone; only the 2 unplaced Teknik got new ones. Egen without placements: all Teknik placed |
| 4 | **PASS** | All three paths + plain build: 0 markers on gathering/warmup/strength/fun_and_games items; hall = built-in `standard-trupp`, club `forening-bla`, Egen `forening-vit` (the mall's) |
| 5 | **PASS** | No `stationEquipment` saved on any item after apply, after opening Hallöversikt/Golvklart/Förrådslista; MutationObserver saw no «Sparade redskap på …» toast; saknar-banner «3 stationer saknar redskap» and Förrådslista text **identical to main** for the same mall |
| 6 | **PARTIAL** | Zones/spots = the wizard/HallBoard helper exactly (UI placements == branch helper == main helper for built-in, club, Egen, Planera pass; branch apply-time spots == main's Hallöversikt-fallback spots). Standard/tävling/liten hall: no stacking. **Blå hall / Vit hall: 3 of 4 chips on the same spot** (F1) — pre-existing, identical on main's wizard/fallback |
| 7 | **PASS** (drag: PENDING-real) | Drag a marker → only that placement moves; «Ta bort från hall» → into tray; reopen and reload+reopen → stays removed; «Placera här» (tap tray chip → hint → tap hall) → placed again. The app has **no Ångra/undo control** (none on main either), so remove + Placera här is the "undo" path (F3). No new buttons/settings (diff: only the club `note=` prop removed) |
| 8 | **PASS** (built-in: after «Spara utkast») | Club and Egen: placements identical after reload. Built-in: identical after reload once «Spara utkast» is pressed; built-in apply is not auto-saved on main either (reload without saving loses the whole pass on both; F2) |
| 9 | **PASS** | Club toast exactly «Mallen är i Passbyggaren.», gone ~2.3 s after first seen; club confirm has no «Stationerna placerar du själv i Hallöversikt.»; built-in and Egen apply: no toast |
| 10 | **PASS** | «Hjul» (`tech-hjul`, no `defaultStationEquipment`, no saved redskap) in a Föreningsmall and an Egen mall: no page error, no alert/toast/message; placed in `open` exactly as `autoPlaceUnplaced` (tag `floor` → open) and as main's helper; Hallöversikt shows all chips, tray empty; Golvklart lists «4 Hjul»; Förrådslista opens normally (osparade förslag point); saknar-banner counts 4 as on any unsaved pass |
| 11 | **PASS** | Club row in the local DB: `bool_and(not payload ? 'hallPlacements') = t` after apply; `clubPayload` tests green (in `bun test src`) |
| 12 | **PASS** | Footer «Träningsplaneraren · Slice 37»; Tyck till mail body ends «Version: Slice 37» |
| 13 | **PASS** | Total **216 944 → 216 895 = −49 B** (cap +512 B); eager **153 053 → 152 994 = −59 B**; lazy +10 B. Reproduces Builder byte-for-byte |
| 14 | **PASS** | `npm run build` exit 0; `bun test src` **165 pass / 0 fail** (22 files); lint exit 0, **0 errors / 15 warnings** (unchanged vs Slice 36). Planera pass places all Teknik; Tomt pass empty hall; club list/admin/Golvklart/Förrådslista smokes pass (table below). `app/` changes only SessionBuilder.tsx, blockMeta.ts, 2 test asserts, new mallApply.test.ts, SLICE37-SHIPPED.md |

## Findings

1. **AC6 stacking on the club's halls (pre-existing, made visible earlier).** `forening-bla` and `forening-vit` have only an `open` zone. `autoPlaceItems` counts slots per *suggested* zone (vault, mats, open…), and `pointInZone` falls back to `open` with that zone's index 0 → every station whose zone the hall lacks lands on the same spot (club pass: 3 of 4 chips at 0.2784/0.3152, `s37v_08`). `helper-parity.ts` shows main's helper does the same for the same pass (standard-trupp/tävling-linjer/liten-hall 0 stacked; Blå/Vit 2 stacked), so Planera pass with Blå/Vit hall and the HallBoard first-open fallback already did this on main. Slice 37 only moves it to apply time. Not a regression; needs a Planner lock to fix in `hallSuggest.ts` (count by resolved zone). Egen with `forening-vit` happened not to stack because its saved placements filled the first slots.
2. **Built-in apply is not auto-saved** (pre-existing, Builder deviation noted too). Placements are in the in-memory pass at apply and persist after «Spara utkast»; reload *without* saving loses the whole pass on main and on the branch alike. AC8 is met for built-in only in that sense.
3. **No undo control exists.** AC7/B1 say "undo … as today"; there is no «Ångra» anywhere in the app (main or branch). Remove + «Placera här» works; no new controls were added.
4. **Drag in headless Chrome:** native HTML5 drag does not start from synthetic mouse/touch input, so the move was driven by dispatching the chip's real `dragstart` and the canvas `dragover`/`drop` with one `DataTransfer` (app handlers unchanged). Finger-drag on a phone = PENDING-real.
5. **AC1 wording:** Passbyggaren has no hall preview; Golvklart is inside Hallöversikt. "Without opening Hallöversikt" was proven on the draft (placements present before the first open; HallBoard's fallback cannot be the source because it only runs on 0 placements, and opening changed nothing).
6. **Golvklart/Förrådslista consistent:** after an auto-placed built-in mall, Golvklart shows 3 numbered stations in the same spots, no remove buttons, caption «Schematisk hall — inte exakt mått» kept, identical to main after its fallback; Förrådslista shows «Inga redskap summerade ännu. Det finns osparade förslag. …» (same as main). After the coach presses «Använd alla förslag» by hand: Förrådslista «Satsbräda · Plint · Landningsmatta · 2× Madrass» = exact sum of the saved station redskap; Golvklart chips unchanged and now list their redskap. Same picture on the club (with Hjul) and Egen passes.
7. **Secrets:** `git grep` of the tree at b0e5fbf: 0 `sb_secret_…` values, 0 JWTs, 0 private keys (9 pattern hits are `\dp` grant text / a `…` placeholder). `.github/`: only `vars.VITE_SUPABASE_*` (publishable). `app/dist` + my dists: only supabase-js's `sb_secret_` prefix literal and the local `sb_publishable_local_s32`; the stand-in bot key appears nowhere. Screenshots show no codes/keys.
8. **Old-smoke flake:** the first branch run of the 33 smoke had 2 extra FAILs (AC12d/AC11c, offline→online admin login). Re-run on main bank build: 141/5; re-run on the branch: **141/5**, same 5 as main. Timing flake in that phase, not a regression.

## Bundle (gzip -9, `dist/assets/*.js` + `*.css`, plain `npm run build`; main built in worktree `/tmp/s37v/main`)

| | main c6a11d5 | branch b0e5fbf | Δ |
| --- | --- | --- | --- |
| Total JS+CSS | 216 944 | 216 895 | **−49** (cap +512) |
| Eager coach-facing (index js + index css) | 138 933 + 14 120 = 153 053 | 138 874 + 14 120 = 152 994 | **−59** |
| Lazy (admin chunks, session, supabase dist) | 63 891 | 63 901 | +10 |

## AC14: earlier smokes against the b0e5fbf build

| Script | Result | Failures explained |
| --- | --- | --- |
| slice-37-builder-smoke.mjs | 24 / 0 | — |
| slice-36-builder-smoke.mjs | 40 / 6 | AC16a (old club note, removed by C1), AC16b + AC13-apply (old toast text, now «Mallen är i Passbyggaren.»), AC17a (expects no placements after club apply = superseded by Slice 37 A1), AC24 + AC23 (Slice 36 footer/strings). All expected |
| slice-36-verify.mjs | 15 / 2 | E1-apply (expects `hallPlacements: []` on the device; superseded by A1 — the DB payload still has none, AC11), AC24-v footer «Slice 36». Expected |
| slice-35-verify.mjs | 37 / 10 | 9 = «Slice 35» footer/version/SLICE_NUMBER strings (expected); `E` = ERR_FAILED from the script's own offline/route aborts (same as the 35 and 36 reports) |
| slice-35-builder-smoke.mjs | 33 / 8 | All 8 = «Slice 35» label/version/strings (expected) |
| slice-34-verify.mjs | 31 / 1 | Footer «Slice 34» (expected). Same-controls checks main vs branch for home/builder/menu/bibliotek/hall/golvklart/share/run all equal |
| slice-34-builder-smoke.mjs | 29 / 2 | Footer «Slice 34» + footer string verbatim (expected) |
| slice-33-builder-smoke.mjs | 141 / 5 (re-run; first run 139 / 7, F8) | 3 × footer «Slice 33», `footerSliceLabel` verbatim, AC21c third GET `club_templates` (Slice 36 by design). Main bank build: identical 141 / 5 |
| slice-32-builder-smoke.mjs | 26 / 17 | Same 17 as the Slice 36 report: 2 × footer, AC26b third GET (by design), 14 = superseded magic-link flow + cascade |

No regression found.

## Screenshots (`verifier/slice-37-screenshots/`)

s37v_01_builtin_applied_builder, 02_builtin_hall, 03_builtin_golvklart, 03_builtin_forradslista, 04_builtin_after_applyall_{golvklart,forradslista}, 05_main_builtin_{golvklart,forradslista}, 06_club_confirm, 07_club_applied_toast, 08_club_hall_forening_bla (F1 stacking), 09_club_{golvklart,forradslista}, 10_club_after_drag, 11_club_removed_in_tray, 12_club_placera_har, 13_egen_hall_forening_vit, 14_egen_{golvklart,forradslista}.

## Ready to merge?

**Yes.** All three apply paths place Teknik only, never run «Använd alla förslag», keep saved spots and the mall's hall, and match main/wizard placement exactly; bundle −49 B; tests/lint/build green; no regressions. Open for Planner (not blocking): F1 (stacking on Blå/Vit hall, pre-existing helper), F2 (built-in apply not auto-saved), F3 (no undo control exists despite AC7 wording). Not merged by Verifier.
