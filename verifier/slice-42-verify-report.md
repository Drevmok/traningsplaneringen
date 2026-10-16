# Slice 42 — Verifier report («rätt tips i rätt läge», PR #46)

**Commit verified:** `91c7e19` (slice-42-code), checklist `slice-42/` @ `b3d569a`, main `1814e50`. Own worktrees `/tmp/s42v/{wt,main}`, own local stand-in (PG17 + PostgREST + GoTrue, ports 5743x), headless Chrome 390×844 DPR 2 touch, 320×844 for layout. 0 requests to the live project. Script `verifier/slice-42-verify.mjs`, results `slice-42-verify-results.json`, raw output `slice-42-checks/`, screenshots `slice-42-screenshots/s42v_*`.

**Result: 60 PASS / 1 FAIL**, 0 page errors. The single FAIL (S39-unsaved) is outside the AC text, behaves the same on main, and is Finding 1.

## Per-AC table
| AC | Result | Evidence |
|---|---|---|
| AC1 | PASS | Hem → Tomt pass (Närvaro + Dagens pass) → tip (s42v_01, s42v_04_tip_320) |
| AC2 | PASS | Adding a bank station hides the tip at once; × brings it back; × → Ångra hides it again |
| AC3 | PASS | Clean first visit via Från mall shows the mall pass with no confirm and no tip. A first visit via Fortsätt passet on a 3-station pass also shows no tip; **main shows the tip there (the bug, reproduced on main)** |
| AC4 | PASS | Wizard pass: no tip |
| AC5 | PASS | Tip still shows with the soft pair removed, with a title only, and with a titled pass after reload |
| AC6 | PASS | Dismissed tip stays hidden on a later empty pass, after reload and after going 0→1→0 stations |
| AC7 | PASS | Untouched Tomt pass → built-in mall applies at once with no confirm. Toast «Mallen är i Passbyggaren. · Ångra», focus on Ångra |
| AC8 | PASS | Mina mallar: no confirm, same toast, Mina mallar unchanged (2). **Föreningsmall on the local stand-in** (bank build, 2 rows inserted with SQL): no confirm, same toast, mall applied (Vit, 3 Teknik) |
| AC9 | PASS | No confirm for mall → another mall, for built-in, Mina mallar and föreningsmall, and for wizard → mall |
| AC10 | PASS (UI for title; stored state for notes) | A typed title shows the confirm, and Fortsätt redigera keeps the pass. **There is no editor in the UI for a pass note or block coachNote**, so I tested those with stored 0-station passes. Both show the confirm and still show the tip. Control: a stored untitled blank pass gives no confirm |
| AC11 | PASS (UI) | On a mall pass, each of these shows the confirm, and Fortsätt redigera keeps the pass: minutes change, add station, remove station, **Hallöversikt drag**, title change. An edited föreningsmall pass also shows the confirm. The builder has no move-station control; moving a station is the Hallöversikt drag |
| AC12 | PASS | Edit then put back by hand: minutes ±1, add+remove station, title edit+revert (stored pass identical to the original each time), and a hall drag. All show the confirm, both right away **and after reload** |
| AC13 | PASS | Untouched mall pass → reload → confirm. After Använd mall the pass is auto-copied (+1, the conservative choice per README) |
| AC14 | PASS | AC7 → Ångra → Tomt pass back (tip, 2 soft items, default title) |
| AC15 | PASS | After AC7 + AC9 (built-in, Mina mallar, förening, wizard), Mina mallar gets no auto-copy |
| AC16 | PASS | Edited pass → confirm → Använd mall → Mina mallar +1 auto-copy of the edited pass. Body «…Passet du hade finns kvar under Mina mallar.» is true here |
| AC17 | PASS | Hem, Passbyggaren and confirm buttons identical to main. Tip, confirm and toast text identical to main. Only `SLICE_NUMBER` changed in blockMeta, and no CSS changed |
| AC18 | PASS | Bundle +178 B gz (≤ 512). Build, test and lint green. Footer «Träningsplaneraren · Slice 42». Test asserts bumped |

### Tip text and a11y
- The tip reads «Tomt pass? Börja från en mall, eller lägg till en övning i ett block. Varje övning visar varför, hur och vad du ska se upp för.» verbatim, with no «!».
- The strip is `role="note"` and is not inside any live region, so it is not announced. This is the same as main, and no aria changed. The dismiss button's aria-label is «Dölj det här tipset».
- No tip spam: sampling every 20 ms showed no flash while a pass with stations loads. The tip appears once at 0 stations and stays put through minute and title edits, and there is only ever one strip.

### 320 / 390 layout
- At both widths the tip is inside the viewport with no horizontal scroll (12–308 px at 320).
- The confirm fits and its buttons are reachable (s42v_05_confirm_320).

## noteChange and Ångra
- noteChange: any edit ends «fresh» for good. This held for all 4 put-back variants, and after reload.
- On a Tomt pass, add + remove a station makes it empty again, so it is fresh by definition and gets no confirm. That matches the README (it's «empty», not a noteChange case).
- **ANG-1:** AC7 → Ångra → Tomt pass. A mall pick then gives no confirm, which is correct: the pass is empty.
- **ANG-2:** mall A → mall B → Ångra → A is back. A mall pick then **shows the confirm**, so Ångra does not re-mark A as fresh.
- **ANG-3:** untouched mall pass → × → Ångra (pass identical again). A mall pick then **shows the confirm**, and still does after reload.

## Slice 39 change (titled empty pass = coach work)
- **S39-titled — PASS.** Stored titled Tomt pass → mall → confirm → +1 auto-copy «Tomt med titel». Main does the same.
- **S39-untitled — PASS.** Stored untitled empty pass → no confirm and no copy. Main shows the confirm and copies it, so this is the intended D1 change.
- **Cap and spare rules hold:**
  - 8 hand-saved + a titled empty pass → the copy takes the spare slot (9).
  - A second one replaces the spare (still 9, all 8 hand-saved kept).
  - 7 hand + 1 old auto → the old auto goes (8 in total).
- **Note:** a Tomt pass is only stored once it grows (Slice 39 E1). A titled 0-station pass is therefore only copied if it has been stored, e.g. after a station was added and removed. See Finding 1.

## Findings
1. **Minor, pre-existing (same on main).** Scenario: a titled Tomt pass that was never stored, while an older pass X is the stored draft.
   - The confirm shows and promises «Passet du hade finns kvar under Mina mallar».
   - After Använd mall, Mina mallar gets X, not the titled pass, so the promise is untrue here.
   - Slice 42 makes this more visible, because the README now treats a title as work worth asking about.
   - Not an AC failure.
2. **Minor, D1 edge (out of scope «Nytt pass från Hem»).** Untouched mall pass → Hem → Tomt pass → add a station: the untouched mall pass *is* auto-copied. The cause is that `markFresh(blank)` replaces the origin, so the old pass reads as not fresh. This is conservative; just noting it.
3. **AC10 note/block-note:** there is no editor in the UI for a pass note or block coachNote. Verified via stored state only.
4. **AC12 hall put-back:** a hall drag can't be put back to the exact coordinates by drag, so only drag → confirm (including after reload) was checked.
5. **Old smokes:** every new failure is expected from B1 (no confirm on fresh passes), A1 (no tip on passes with content) or the footer bump. Details below.
6. **slice-33 AC11c/AC12d** (login focus / back-online) are new failures in my run. They are stand-in-state dependent: the same smoke against main's bank build fails a different set (S32-AC29…41) on the same, already-used stand-in. Slice 42 touches no auth code. Inconclusive and not attributable to this slice; a re-check on a fresh stand-in is open.

## Bundle (gzip -9, js+css)
| | main 1814e50 | 91c7e19 | Δ |
|---|---|---|---|
| Total | 218 833 | 219 011 | **+178** |
| Eager | 154 944 | 155 125 | +181 |

Matches Builder's figure and is under the +512 B soft cap.

## Smokes (same stand-in; compared with the slice-41 re-verify baselines)
**Unchanged:** 32, 34 builder, 35 builder/verify, 38 builder, 39 verify.

**34 verify / 38 verify:** the only new differences are the footer, and branch-vs-main control/text diffs caused by the tip no longer showing on a wizard pass. That is A1. A direct repro shows the Hallöversikt controls are identical.

**New failures that wait for the confirm on a fresh pass (B1):**
| Smoke | Failed check or phase |
|---|---|
| 36 builder | [B] |
| 36 verify | V-coach, V-overwrite |
| 37 builder | crash |
| 37 verify | A/C/E/M/P-E (A8b and F12 cascade) |
| 39 builder | C/F/G |
| 40 builder | [M] |
| 40 reverify | [C] |
| 41 builder | AC16 |
| 41 reverify-b | [C] |

**Footer label checks:** 33, 34v, 37v, 38v, 40, 41 (expected).

**slice-42 builder smoke:** 24/24.

## Tests
- `bun test src`: 220 pass / 0 fail.
- `tools/bank`: 21 pass / 5 skip. The stand-in-backed tests hardcode `/tmp/s32` and tools/bank is untouched by this slice.
- lint: 0 errors / 15 warnings.
- tsc: 0.
- Build: OK.
- Secret grep (git tree at 91c7e19, both dists, committed outputs): clean. The only hit is the bare `sb_secret_` prefix literal inside the supabase-js library.

## Verdict
**PASS: all 18 ACs pass.** Ready to merge.
- Open: Findings 1 and 2 (minor; 1 is pre-existing) and 6 (inconclusive, stand-in state).
- Old smokes need follow-up updates for B1, A1 and the footer.
- Device feel is PENDING-real.
