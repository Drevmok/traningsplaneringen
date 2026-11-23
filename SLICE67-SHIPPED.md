# Slice 67 — Fyll bankens skisser (S6), PR med SQL-fil

Locks A1 B1 C1 D1 E1 F1 (Christoffer 2026-11-23 11:27). Sketch approval: Christoffer 2026-11-23 11:45, «Godkänn de 11 säkra skisserna, hoppa över de osäkra och de enkla». Pack: slice-67-docs @ 36e18c0. Base main 329a259.

- **Live queue (F1, read-only, before SQL):** 25 Teknik with redskap and no `default_station_layout`, all published. Read through the live app's own public GET of `/rest/v1/exercises` (published + hidden). Pending rows are not visible to that read. `tech-ljushopp-satsbrada` already had a sketch and was skipped. Three were not in the pack's seed list (`tech-igelkottsgunga`, `tech-hjul-mattriangel`, `tech-stockrullning-kil`). → `slice-67/live-queue.json`
- **Proposals (A1, D1):** `slice-67/layouts/<id>.json` (Slice 57 format, valid against `sanitizeStationLayout`). Previews are drawn with the real StationSketch: `slice-67/previews/` (`index.html`, `contact-sheet.png`, one PNG per id). Summary: `slice-67/proposals.md`. Harness (outside `app/src`): `slice-67/harness/`.
- **Approved (B1 + Christoffer):** 11 ids. Skipped: 6 unsure and 8 single-piece; see `slice-67/decisions.md`.
- **SQL (C1):** `slice-67/content/update-station-layouts.sql`, 11 × `UPDATE … SET default_station_layout = '<layouts/<id>.json>'::jsonb WHERE id = … AND default_station_layout IS NULL RETURNING id;`. No other column, no DELETE / INSERT, no `--replace`. sha256 `02fee3adf3bf9af0665fc50ccd5a9ba560096353f5535723d7ec3e85d6d409de`.
- **F1 check after running (read-only):** `slice-67/content/check-station-layouts.sql`, sha256 `400f226af69d161bf11e8ddd5a1bcf21b80297aeb12098fcfaebab2413c1180c`. It checks that all 11 have a layout and counts what is left in the queue (expected 14 plus any pending rows).
- **SQL not run by any agent.** It waits for Christoffer's separate yes, after merge.
- **E1:** no app change; `SLICE_NUMBER` stays '66'; `seedActivities.ts` and `export-seed.ts` untouched. No bundle change.
- **Backlog:** `backlog/IMPROVEMENTS.md` synced from slice-67-docs @ 36e18c0.
