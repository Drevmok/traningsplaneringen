# Slice 48 re-verify: progress (Verifier)

The target is PR #53, `slice-48-code` @ **29df282**. That is fix 7dc8e8f plus a merge of the Verifier commits up to 2a294f4. Main is e605b3f; criteria are `slice-48-docs` @ 29ef308.

## Chunk 1 (08:33–08:45 CEST)
- Fresh setup:
  - The stand-in was rebuilt from scratch on ports 57870–57875.
  - Four previews, all returning HTTP 200: branch plain :57880, branch bank :57881, main plain :57882, main bank :57883.
  - The bank builds use https://bank-mock.supabase.co, which is routed to the stand-in.
  - No live project id appears in any build.
- The re-verify script `slice-48-reverify.mjs` is the formal script plus a new p5 section. It writes `slice-48-reverify-results.json` and the `s48r_` screenshots.
- p5, the fix checks, **all PASS**:
  - 320×568 and 320×640: names wrap by word (1–2 lines, 182 px wide), ↑ ↓ «Ta bort» drop to a second line, no overflow (row 29–291, doc width 320), every button ≥44 px, and «Ta bort» hit-tests and works (3→2).
  - `.hall-board` touch-action is `pan-x pan-y`. A simulated pinch on the tray, and another below the tray, both leave the page at scale 1. The main control on the tray zooms to 3.07×, so the simulation can tell fixed from unfixed.
  - Q3: the own drill appears in the hall «Lägg till övning» library without Ändra/Ta bort. The Passbyggaren library still shows both buttons.
- Full regression p1–p5: **61/61 PASS** (390, 320, 844×390, 1280). This includes W320, AC26-sim, AC27-sim, old Blå/Vit passes, and the unknown hall.
- `bun test src` 256/0, tsc clean, lint 0 errors / 6 warnings (= main), build ok.
- Bundle: JS +1 994 B, CSS +342 B, **≈ +2.34 kB** gz-9.
- Docs: every Slice 48 status says LÅST, and the A–F labels in SHIPPED match decisions.md.
- The smoke loop started at 08:41, with the fix-related smokes first.
