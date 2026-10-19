# Slice 47 «Lägg till övning + Admin» — Verifier report (PR #51, slice-47-code @ c8b4e24)

Main = 9aa3996 (Slice 46 merged, current origin/main, confirmed). Pack slice-47-docs @ 3c63fef, LOCKED A1 B1 C1 D2 E1 F1; the pack on the branch is identical to it. Planner rulings 1–5 applied.
Setup: my own stand-in (`slice-36-local`, ports 57850–57855) with the bank builds on `https://bank-mock.supabase.co` routed to it. Every browser request was recorded by a PW_CORE shim (it also blocks the live host). 390×844 DPR 2 touch, plus 320×640, 844×390 and 1280×800.

## Verdict: **PASS with one Major (pre-existing, Planner call)**
Nothing SERIOUS: no data loss, no admin power for non-admins, no live request.
AC24 fails on its landscape «Lägg till övning» part. The cause is identical on main 9aa3996, so Slice 47 did not introduce it, but AC24 asks for it explicitly. Everything else passes: 40/41 drive checks, + Builder 32/32.

## Findings
| Sev | Finding |
|---|---|
| **Major (pre-existing, also main)** | **844×390 landscape: adding from the library is practically impossible.** (a) «+ Lägg till övning» opens the library panel near the bottom of a 4,845 px page (panel box y 1680–2046 in a 390 px viewport), so nothing visible changes. (b) The exercise detail modal is 696 px tall in a 390 px viewport. The backdrop is `overflow: visible` and nothing scrolls (wheel and touch swipe both leave «Lägg till i valt block» at y 648–688). Shot `s47v_31_detail_add_unreachable_land`. Branch and main behave the same. 320, 390 and 1280 are fine. |
| minor | Import timeout edge: if an insert commits but answers after the 10 s client timeout, it counts as failed. The toast says «1 övning väntar…» while the DB holds 2 rows. Re-reading the file marks the extra row «Samma namn finns redan / Hoppa över», so no duplicate unless the admin chooses Ta med. |
| nit | Admin view «Ny egen övning» and «Importera övningar» are 40 px tall on touch (btn-secondary); «← Tillbaka» is < 44 px in landscape. |
| nit | `needs_coach_review` is true on imported/new pending rows (they also show under «Behöver granskas» after Godkänn). This matches the bot flow; noted only. |

## Per-AC
| AC | Result | Evidence |
|---|---|---|
| 1 | PASS | Sheet: Stäng, Sök, Filter, list; none of the removed items |
| 2 | PASS | First card at 238 (main 464); search/filter work; block preselected (Teknik); tap → detail → added; same as main |
| 3 | PASS | Egen badge; Ändra saves («Egen övning sparad.»); Ta bort disabled while in use, works otherwise |
| 4 | PASS | Own + library exercises: Golvklart opens as on main (Teknik stations only, identical); Kör passet shows them; Skriv ut passet prints with them; share link on a device without the own list opens and runs; Mina mall with an own exercise reopens |
| 5 | PASS | Använd mall sheet: Mina mallar (Kopiera delningskod, Ta bort), Nybörjare, Kort pass, no admin tools; «Ersätta det här passet?» → «Mallen är i Passbyggaren. · Ångra»; Ångra restores |
| 6 | PASS | Planera pass Mall step: text and geometry identical to main |
| 7 | PASS | No ikväll list; rest of Förrådslista identical to main; old owned list (nothing ticked, ikväll on) → 51 = 51 exercises |
| 8 | PASS | Gating matrix of 64 visits, 0 leaks (see below) |
| 9 | PASS | Row 2 «Admin · Logga ut»; button 44 px, aria «Öppna Admin»; doc 844 |
| 10 | PASS | Footer and Mer both open «Admin»; Tillbaka → start / builder; localStorage byte-identical |
| 11 | PASS | Order correct; empty state «Inget väntar just nu.» (DB states restored) |
| 12 | PASS | No admin bar; detail has Ändra i banken / Dölj för alla |
| 13 | PASS | Toast correct; DB pending `tech-egen-…`, visual own, Trampett kept, updated_by admin@ |
| 14 | PASS | Samling saves without Säkerhet; Styrka refuses («Skriv säkerheten. Den följer med till golvet.») and then saves |
| 15 | PASS | (D2) own row: Godkänn, Ändra, Dölj; no «annan admin» text; published; coach 0 → 1 after reload |
| 16 | PASS | B Godkänn on A's row → toast, leaves Väntar, coach 0 → 1 |
| 17 | PASS (per ruling 1/D2) | B edits A's pending row → «Sparat i banken.», still pending, updated_by admin2@, Godkänn shown to both. The checklist text is superseded by D2 |
| 18 | PASS | Confirm «Dölja ”Höjdhopp (lek)” för alla tränare?…» → «Dold för alla.», coach 0, Dolda (n) → «Syns igen för alla.» (restored) |
| 19 | PASS | File and pasted code; only Ta med / Hoppa över; same name → skip + note |
| 20 | PASS | «3 övningar väntar på godkännande.»; warm-/tech-/gather-egen- ids, fields equal to the file, nothing local |
| 21 | PASS | Offline message and disabled buttons; DB hash identical; 0 write requests, also after reconnect |
| 22 | PASS | Message exact; localStorage unchanged |
| 23 | PASS | From home → home, from builder → builder; session key removed |
| 24 | **FAIL (landscape add, pre-existing)** | Admin view, import, form, Använd mall and desktop side panel (no tabs) all OK at 320/390/844×390/1280. Adding from the library at 844×390 fails (Major above) |
| 25 | PASS | 10 new strings all in microcopy.sv.md; changed strings too; no «!»; no deleted key used as `UI.*`; no SideTab/ownedEquipment |
| 26 | PASS | No SQL/Supabase files; coach chunk −4,264 B, no supabase-js; tsc/test/lint/build green; footer «Slice 47»; asserts read 47 |

**Planner ruling checks:**
- Ruling 4, Admin button gating. It never shows for logged out, non-admin, the bot key in place of the publishable key, or the bot key plus a non-admin session. Tested on start page, builder (footer + Mer), hall and shared link, at 320/390/land/desk: 64/64 clean. After Logga ut there is none at any width, in builder, in hall or after reload. A non-admin logging in in the same browser gets none. Admin positive control shows it everywhere except the shared view (badge only, as Builder stated).
- Ruling 4, RLS. Direct REST as anon and with a real non-admin JWT: insert pending/published, approve, hide, edit, delete, self-admin and club insert all return 401 (42501) or 0 rows. Pending rows and admins are unreadable. DB byte-identical.
- Ruling 5, import failure. Injected failure on insert 2 of 3 → toast «1 övning…», DB has row 1 complete, nothing of rows 2–3, no partial rows. Re-reading the file → row 1 on skip, «Importera 2 övningar». Failure on insert 1 → no toast, «Kunde inte spara…», 0 rows.

## PENDING-real
- A real two-admin run (two people, two devices). Here the second admin was admin2@ on my stand-in (ruling 2).
- Real mail delivery of login codes. The stand-in captures them locally.

## Bundle (vs main 9aa3996)
- Total: +100 B (JS +350, CSS −250), within the ~512 B guideline.
- Eager code: −4,514 B.
- Coach index chunk: −4,264 B, with no supabase-js.
- These match Builder's claims exactly.

## Tests and Builder claims
- bun test 245/0
- tools/bank 21/0/5 skip, and 26/0 against my stand-in
- tsc rc 0
- lint 0 errors / 6 warnings (same as main)
- build green
- Builder smoke **32/32** under my recorder. It writes only to an in-browser fake, so the real-DB behaviour above comes from my drives.

## Smoke loop (one loop, vs the Slice 46 baseline)
- 27 smoke outputs; see `slice-47-checks/loop-classify.txt` and `smokes/`.
- Unchanged vs baseline: 32, 34, 36, 38, 39, 42–45.
- New FAILs, all expected changes or test drift, none a regression:
  - 46-builder AC17: Mallar tab removed by A1; content now in the Använd mall sheet, AC5 passes.
  - 46-builder AC20 / AC20-hall, 37 F12: label is now «Slice 47».
  - 40 GK: Förrådslista no longer has the ikväll list (B1).
  - 41 G: strict-mode selector now matches 2 dialogs.
  - 33 AC11c / AC12d and 35 AC11a / AC9-local, plus 35's footer and version checks: the same failures occur on main 9aa3996 today (`smokes-main-33-35/`: 94/14 and 10/13 on both).

## Live-request proof
- 29 netlogs, **5,758 browser requests, 0 to fhzqwbdlejzohetdoluw, 0 blocked**.
- Hosts: 127.0.0.1 previews and bank-mock.supabase.co (routed to my gateway). See `slice-47-checks/netlog-count.txt`.
- Node-side calls went only to 127.0.0.1:57850 and psql on 57851 (my stand-in).
- Secret grep of the diff and my files: clean.

## Feature map changes (verify-traningsplaneraren/features)
- passbyggaren: A1 sheet, Mer Admin, drive tip.
- starta-fran-mall: Använd mall sheet.
- golvklart-forrad: B1, own exercises.
- delad-bank: admin tools moved out, code login, pending creation, RLS.
- New **admin.md**: gating matrix, RLS, import failure injection, offline.
- README index updated.

## Files
- `verifier/slice-47-verify.mjs` (parts g / a / i / c)
- `slice-47-verify-results.json`
- `slice-47-checks/` (run logs, bundle, tests, classify, netlog count)
- `slice-47-screenshots-v/s47v_*` (43)
- Best 2 copied to /workspace/screenshots: `s47v_31_detail_add_unreachable_land.png` and `s47v_12_import_fail_mid_390.png`.
