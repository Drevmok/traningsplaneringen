# Slice 40 — Verification checklist

**Viewport:** 390×844 portrait (iPhone 12–15 class). Clean site data unless the row says otherwise. Positions are normalized (0–1) from `gymnastics-planner-draft-v1` → `hallPlacements`; compare to HANDOFF §2 within ±0.001.

| # | Check |
|---|---|
| AC1 | Wizard → hall **Blå hall**, pass with ≥ 4 Teknik stations → Hallöversikt shows every marker separately, none on top of another (screenshot) |
| AC2 | Same in **Vit hall** |
| AC3 | Blå, 5 Teknik stations: stored positions match the worked values (4 + 1, x 0.21/0.37/0.53/0.69, y 0.38/0.62) |
| AC4 | Vit, 4 Teknik stations: stored positions match (3 + 1, x 0.135/0.295/0.455, y 0.29/0.53) |
| AC5 | Marker order follows pass order, row by row (rank numbers 1, 2, 3… read left to right, top to bottom) |
| AC6 | Every marker is fully inside the hall drawing; none clipped at edges (Blå and Vit, n = 1, 4, 8) |
| AC7 | Large pass (≥ 12 Teknik in Vit): no marker outside the hall, order kept, app does not hang; overlap only vertical |
| AC8 | Pass with stations from different redskap (satsbräda, trampett, tumbling, open drill) in Blå → no shared spot (the old stacking case) |
| AC9 | Standard trupp, Tävling / linjer, Liten hall: same pass gives the same positions as on main (golden test + one manual spot check per hall) |
| AC10 | HallBoard empty-hall auto-place: Blå pass with Teknik and no placements → open Hallöversikt → grid as AC3 |
| AC11 | Add a station from the bank to a Blå pass with 3 placed (one dragged by hand) → the 3 do not move; the new one lands on grid slot 3 of 4 |
| AC12 | Built-in mall, Mina mallar, föreningsmall applied with Blå hall → grid spread |
| AC13 | Saved pass from main with stacked markers (seed draft before deploy) → opens with the stored positions, nothing re-laid out (D1) |
| AC14 | No new buttons or text anywhere; only Teknik stations get markers; hall choice and drag / Placera här behave as before (C1, E1) |
| AC15 | Bundle delta ≤ +512 B gz (soft): main vs branch, sum of `gzip -9c` for `dist/assets/*.js` + `*.css`; numbers in PR |
| AC16 | `npm run build`, `npm test` green incl. golden test over all 5 templates; footer «Träningsplaneraren · Slice 40»; Slice 40 asserts in `feedback.test.ts` and `clubTemplates.test.ts` |
