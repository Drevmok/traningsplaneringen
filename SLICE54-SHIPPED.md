# Slice 54 — Smoke-resterna

Base: main 03c0864 · branch: slice-54-smoke-resterna. App bundle diff: 0 B (`git diff --stat origin/main -- app/` is empty). SLICE_NUMBER stays '53'.

## What changed (verifier/ only)
- **A1 (anpassa):** s33–s36, s38–s41, s47 follow intentional later-slice behaviour: «Använd mall» opens `.mall-sheet` (Slice 47), Föreningens mallar only with ≥1 mall (Slice 49 E1), no placements note (Slice 37), applied toast «Mallen är i Passbyggaren.» with optional replace confirm (Slice 41).
- **B1:** footer checks use `includes` on the Slice label instead of exact text.
- **C1/D1:** run-smokes treats `s32|s33|s36` alike (line 71; deviation, see below); weekly.sh gets a `cnt()` helper.
- **E1:** s40 AC8-main reads the golden JSON (`GOLDEN['forening-bla']`).
- **F1:** smoke-map.json marks all nine scripts ok.

## Widen (Christoffer: «Bredda: skriv om s33 admin→AdminArea, tillåt club_templates-GET, utöka E1 till s40 AC1/AC2, utred s36 — sedan PR»)
- **s33 → AdminArea (Slice 47):** helpers `openAdminArea/areaHeads/areaList/areaTitles/areaCard`; AC4b-local, S32-AC29a/c/d, AC31, AC33, AC34 «Dolda» use the Admin view; AC29f expects «Godkänn | Ändra i banken | Dölj för alla» (D2); AC35 reopens Biblioteket first.
- **s33 AC21c:** 3 GETs allowed (`club_templates`, `exercises`, `redskap`).
- **s40 AC1-main/AC2-main:** use `GOLDEN[hall]` (first 3 `g-` points, same spot), like AC8-main.
- **s36:** mall sheet, Admin view for club admin tools, key-order-free redskap compare (jsonb reorders keys), AC12 = no section when all hidden (Slice 49 E1). The C-phase stale failure was a cascade: B crashed at AC12 before un-hiding the rows. No app bug found.

## Evidence (`verifier/slice-54-checks/`)
- `before/` — nine scripts on 03c0864: s33 12, s34 2, s35 13, s36 4, s38 1, s39 5, s40 4, s41 2, s47 3 FAIL.
- `after/` — same nine on this branch: all exit 0, 0 FAIL (s33 146, s34 31, s35 41, s36 46, s38 26, s39 38, s40 20, s41 34, s47 32 PASS). Netlog 1660 requests, 0 to the live host. Baseline: no NY FAIL.

## Deviations
- D1: `s36` added to the `s32|s33` case in run-smokes.sh line 71.
- s41 AC16 replace confirm made optional (the app asks only when needed, Slice 41).

## Open
None known in these nine scripts.
