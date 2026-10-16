# Slice 43 — Verification checklist

**Status:** PROPOSED — written against ★ A1 B1 C1 D1 E1 F1; re-check after lock.  
**Viewport:** 390×844 portrait, DPR 2, touch (iPhone 12–15 class), clean site data. Pass = Från mall → Nybörjare → Hallöversikt (edit). «Fold» = y 739 (844 − 47 status − 58 compact tray). Measure `.hall-canvas` `getBoundingClientRect().bottom` at `scrollY = 0`. Baseline numbers: `evidence/measurements-390x844.txt`.

| # | Check |
|---|---|
| AC1 | Blå hall: hall bottom ≤ 739 with the saknar-redskap banner showing (screenshot) |
| AC2 | Vit hall: hall bottom ≤ 739 (tallest, ~374 px), banner showing |
| AC3 | Standard trupp, Tävling / linjer, Liten hall: hall bottom ≤ 739; height ≈ width × 2/3 (≈ 239) |
| AC4 | Whole hall visible: top ≥ 0 and nothing (tray, toast, banner) covers the canvas at scrollY 0 with tray collapsed |
| AC5 | Back, «Hallöversikt», pass title/count, all 4 action buttons, layout select and zoom − / + are above the hall; all ≥ 44×44 |
| AC6 | Saknar banner is one line; full text readable (not cut) for «3 stationer saknar redskap» at 390; CTA «Använd alla förslag» still works (Slice 37 path) |
| AC7 | Layout migrate note, Blå/Vit coach tip, Visa tips and the flow tip strip appear under the hall, same text; flow tip dismiss still works |
| AC8 | No new buttons/controls; no new or changed text; locked terms as on main |
| AC9 | Pass with all stations having redskap (no banner): hall still ≤ 739 and no empty gap |
| AC10 | Expand the tray: works as Slice 21; collapse again; hall unchanged |
| AC11 | Golvklart: hall still fits (bottom ≤ 739, was 715); floor chrome unchanged |
| AC12 | Pinch / zoom + / − and pan still work on every template; markers tap/drag/remove as Slice 20/21 |
| AC13 | Landscape 844×390: no regression vs `evidence/main-844x390-landscape-forening-bla.png` (hall top ≤ 507), page scrolls normally |
| AC14 | ≥ 769 px (desktop 1280×800): layout same as main except moved secondary items now below the hall |
| AC15 | Print / Exportera of the hall map unchanged (Blå/Vit ratios, generic 16:10) |
| AC16 | Bundle ≤ +512 B gz (soft), numbers in PR; `npm run build`, `npm test` green; footer «Träningsplaneraren · Slice 43»; asserts `feedback.test.ts:25/45/46`, `clubTemplates.test.ts:316` |
