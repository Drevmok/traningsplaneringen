# Slice 56 — Redskap-förslag även vid «Lägg till» Teknik (A1–F1)

Branch `slice-56-redskap-lagg-till`, base main `6a75ec1`. Decisions: slice-56/decisions.md on `slice-56-docs` @ b7936d7.

## Change
- SessionBuilder `handleAddFromDetail`: Teknik add → `autoPlaceItems` then `applyAllSuggestedStationEquipment` (fills stations lacking equipment; Q3 ★ — first add after mall fills all such stations).
- HallBoard `handleAddStation`: same after `autoPlaceUnplaced`.
- No helper changes (session/wizard/mallApply), no new UI strings/toast. Footer → Slice 56.
- New unit tests `app/src/lib/addTeknikEquipment.test.ts` (4). New smoke `verifier/slice-56-builder-smoke.mjs` (18/18 branch; main 11/18 → discriminates).

## Verification
- Doctor PASS; bun test 278/0; build ok; lint 0; bundle 215573 vs 215560 gzip = **+13 B**.
- Smokes vs main baseline: all SAMMA (41 had one flaky toast-timing fail, SAMMA on rerun).
- Smoke adapts (expected consequence): slice-30/31/39 accept that «Använd alla förslag» may be absent because redskap are saved at add; slice-49/55 footer → Slice 56.
- AC1–7, 9–11, 13, 14 PASS (browser 390; AC2/4/11 also 844). AC8 unit-covered (existing edit flow). AC12 tappable/saknar-banner gone PASS; "no jump" not measured explicitly.

## Note for PO
Behavior change: once added, a station's redskap list is saved; later edits to the own-drill default don't propagate to that station.
