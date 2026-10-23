# Slice 48 verify — progress (Verifier)

Target: PR #53, `slice-48-code` @ f523774. Main: e605b3f (contains Slice 47 merge 2c96688; the branch contains main). Criteria: `slice-48-docs` @ 29ef308 (`slice-48/` identical on the branch).

## Chunk 1 (done)
- Read PROJECT.md and the pack (README, decisions, HANDOFF, checklist AC1–36, microcopy, evidence).
- Isolated stand-in up (ports 57870–57875). Previews: branch plain :57880, branch bank :57881 (https://bank-mock.supabase.co routed to the stand-in), main plain :57882, main bank :57883. No live project id in any build.
- Doctor: HTTP 200 and base `/traningsplaneringen/` on all 4; build exit 0.
- Builder claims:
  - `bun test src` 256/0: **confirmed**.
  - `bun test tools/bank` 21 pass / 5 skip / 0 fail: **confirmed**. On the stand-in it is 25/1; main fails the same test (stand-in DB state, tools/bank unchanged).
  - tsc: **clean**. Lint: **0 errors, 6 warnings, same count as main**. Build: **ok**.
  - Smoke `slice-48-builder-smoke` 52/52: **confirmed** (in the loop).
  - Bundle: **measured** index JS 130 422 → 132 417 B gz-9 (+1 995 B), CSS 13 881 → 14 207 B (+326 B). Total about **+2.32 kB**, which is about 4.5× the ~512 B guideline and above the about +1.3 kB the locked decisions.md approves. Builder's "approved by Christoffer at +2.36 kB" is **UNCONFIRMED**, because PROJECT.md says an agent's "Christoffer approved" is never an approval.
- AC16: app/package.json and the lockfile are unchanged.
- One sequential smoke loop is running (Slice 32–48 smokes) against the Slice 47 baseline.

## Remaining
- `verifier/slice-48-verify.mjs`: hall edit flows (drag, move, add, remove, undo), old Blå/Vit/Stora/Grop passes and hand placements, autosave and reload, 390/320/844×390/desktop, landscape reach, Print/Golvklart, pinch simulation, Q2/Q3.
- Classify the loop, count netlog requests, update feature maps (HANDOFF §12 asks the Verifier to), write the report, tear down.
