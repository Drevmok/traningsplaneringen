# Slice 47 verify — progress (PR #51 @ c8b4e24, main 9aa3996, pack slice-47-docs @ 3c63fef)

## Chunk 1 — setup (18:39–18:46 CEST)
- Main: Slice 46 merged as **9aa3996** = current origin/main (confirmed). Branch = main + one Builder commit c8b4e24. Pack `slice-47/` on the branch identical to slice-47-docs @ 3c63fef (`diff -rq` empty); status LOCKED A1 B1 C1 D2 E1 F1.
- Planner rulings applied: AC17 per D2 (any admin approves, also own rows; skipped `canApprove` test OK); faked 2nd admin on my stand-in OK (real two-admin run = PENDING-real); ownHint drop OK; Builder extras accepted unless they break an AC; import stop-at-first-failure + count toast OK (count + no partial/corrupt rows to be checked).
- Worktrees (detached): `/workspace/s47v/wt` @ c8b4e24, `/workspace/s47v/main` @ 9aa3996, `/workspace/s47v/docs` @ 3c63fef.
- Stand-in: `slice-36-local/up.sh`, `S32_DIR=/workspace/s47v/sb`, ports 57850 gateway / 57851 PG / 57852 PostgREST / 57853 GoTrue / 57855 SMTP. 8/8 checks t. Read-only DB check: `exercise_status` {published, hidden, pending}; policies read_public (published+hidden), admin_read_all, admin_insert (is_admin), admin_update (is_admin); no delete; grants anon SELECT, authenticated SELECT/INSERT/UPDATE; admins admin@ + admin2@ (= the faked second admin); 51 published, 2 pending seeded.
- Builds/previews: :57861 branch plain, :57862 main plain, :57860 branch bank, :57863 main bank (bank = `https://bank-mock.supabase.co`, routed to my gateway). No `.env` in app; plain builds have no bank. The live project id is in none of the 4 builds (`rg` rc 1).
- **Network recorder**: `PW_CORE` shim `/workspace/s47v/pwshim/index.mjs` wraps playwright-core `chromium.launch`: every context logs every request URL to `/workspace/s47v/netlog/<script>.log` and aborts + logs `BLOCKED` anything to `fhzqwbdlejzohetdoluw`. Used by the smoke loop and my verify script. Self-test: logged and blocked a forced fetch to the live host.
- Smoke loop: one loop, flock, root `/workspace/s47v/smk` (tar copy of wt; the Slice 45 chip-patched old smokes from the Slice 46 loop, 13 files). List: 47-builder, 46-builder, 45-builder, 44…32. Baseline `verifier/slice-46-checks/smokes/`. Started 18:42.

## Builder claims, checked
| Claim | Measured | |
|---|---|---|
| bun test src 245/0 | 245/0 | ✔ |
| tools/bank 21/0/5 skip | 21/0/5 skip; **26/0** with my stand-in (temp `/tmp/s32` symlink, removed) | ✔ |
| tsc clean | rc 0 | ✔ |
| lint 0 err / 6 warn (= main) | 0 / 6; main 6 | ✔ |
| build green | ✔ | ✔ |
| Bundle all JS +350, CSS −250 | main 198,587 / 14,131 → 198,937 / 13,881: **JS +350, CSS −250, total +100**; eager 148,817 → 144,303 (−4,514); coach `index` 134,686 → 130,422 (**−4,264**), no GoTrueClient/PostgrestClient in it | ✔ exact |
| Self-smoke 32/32 | in the loop | … |

Bundle vs ~512 B guideline: total +100 B, well inside; coach chunk shrinks.

## Chunk 2 — gating, RLS, admin flows (18:46–19:01 CEST)
- Builder self-smoke under my recorder: **32/32** (it writes to its in-browser fake only, so real RLS / DB were untested by Builder; my drives use the real stand-in).
- `slice-47-verify.mjs` part **g 8/8**: Admin button / view never shown for logged-out, non-admin, bot key (logged out and with a non-admin session) × start / builder (footer + Mer) / hall / shared link × 320 / 390 / 844×390 / 1280×800 = 64 visits, 0 leaks; admin positive control at all widths; Logga ut → none anywhere (incl. reload), non-admin then logs in in the same browser → none, admin again → back. Direct REST as anon and as a real non-admin JWT: insert pending/published, approve, hide, edit, delete, self-admin, club insert → all 401/403 (42501) or 0 rows; pending and admins unreadable; DB byte-identical.
- Part **a**: AC9, AC10, AC11 (incl. empty state, restored), AC13, AC14, AC15, AC16 pass on the real stand-in. AC12 / AC17 / AC18 failures were my script (selector; updated_by holds the email, not a uid) → fixed, rerun running.
- Nothing SERIOUS so far.

Remaining: part a rerun; part i (import 3, injected mid-import failure, timeout edge, offline, Logga ut, admin layouts); part c (coach AC1–AC7, AC22, AC24); AC25/AC26 static; loop classification; netlog count; secret grep; feature maps; report.

## Chunk 3 — import, failures, offline, layouts, static (19:01–19:15 CEST)
- Part a now all green after script fixes (AC12, AC17 with updated_by = e-mail, AC18 self-contained → running).
- Part **i 10/10**: AC19, AC20 (3 pending rows, new `warm-/tech-/gather-egen-` ids, fields equal to the file, nothing local); **ruling 5 checked**: injected failure on insert #2 of 3 → toast «1 övning väntar på godkännande.», DB has exactly row 1 (complete) and nothing of rows 2–3; re-reading the file puts row 1 on «Samma namn finns redan / Hoppa över» → «Importera 2 övningar». Insert #1 failing → no toast, sheet stays with «Kunde inte spara…», 0 rows. AC21 offline (DB hash identical, 0 write requests also after reconnect), AC23 (home and builder), AC24-admin at 320/390/844×390/1280.
- Edge found (minor): insert that commits but answers after the 10 s client timeout → counted as failed: toast «1 övning…» while DB has 2 rows; re-read marks the extra row same-name/skip, so no duplicate by default.
- Nit: in the Admin view «Ny egen övning» / «Importera övningar» are 40 px tall on touch (btn-secondary), «← Tillbaka» < 44 in landscape.
- Static: AC25 — no deleted key referenced as `UI.*`, no `SideTab`/`ownedEquipment` in src, all 10 new strings found in microcopy.sv.md, changed strings found too, no «!»; AC26 — no SQL/supabase files in the diff, asserts at feedback.test.ts:25/45/46 and clubTemplates.test.ts:316 read 47. Secret grep of the diff and my files: clean.
- Loop so far: 47-builder 32/32; 46-builder 3 new FAILs = intended (Mallar tab removed → AC17; footer «Slice 47» → AC20, AC20-hall); 45…42 identical to the Slice 46 baseline.
- Feature maps written (passbyggaren, starta-fran-mall, golvklart-forrad, delad-bank, new admin.md, README index).

## Chunk 4 — coach side, loop, final (19:15–19:45 CEST)
- Part c green except AC24 landscape add (Major, pre-existing on main). Loop ALLDONE and classified; 33/35 deltas reproduced on main. Netlog: 5,758 requests, 0 live. Final report written.
