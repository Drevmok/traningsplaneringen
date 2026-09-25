# Verification checklist — Slice 08 polish / cleanup

**App:** Träningsplaneraren  
**Status:** **APPROVED by Christoffer 2026-09-24**  
**Verifier rule:** mark each applicable item **PASS** or **FAIL** and record evidence. Do not infer PASS from implementation intent.

## Locked PASS/FAIL rules

- Any locked product rule below failing is a **FAIL**.
- A missing out-of-scope feature is **not** a FAIL.
- Historical docs and compatibility fields may remain unchanged.
- Manual phone checks should use a narrow viewport around 390px and a viewport at the boundary (768px); test with a safe-area device/emulation where available.

## 1. Slice 08 acceptance

| Result | Check |
|---|---|
| [ ] PASS [ ] FAIL | Footer reads exactly **Träningsplaneraren · Slice 08** after the Slice 08 implementation; no historical Slice 01–07 file was mass-renamed. |
| [ ] PASS [ ] FAIL | `Placering sparad` / `hallPlacementSaved` is absent from the active placement-save UI/path; placement and preset changes save silently. |
| [ ] PASS [ ] FAIL | Explicit builder save still gives **Utkast sparat**; no new placement toast or replacement status copy appears. |
| [ ] PASS [ ] FAIL | At ≤768px, **Ej placerade** stays reliably bottom-reachable while the hall canvas pans/scrolls. |
| [ ] PASS [ ] FAIL | Phone tray has safe-area treatment and canvas bottom padding/scroll geometry at least equal to the full tray height; active drop/placement content is not permanently covered. |
| [ ] PASS [ ] FAIL | Existing tray horizontal scroll, **Placera här**, snap, move, and remove behavior still work. |
| [ ] PASS [ ] FAIL | Audited technical English such as `Zoom` is replaced with Swedish accessible naming (**Zooma**, and **Zooma in/ut** if separate controls exist); no new English hall chrome is found. |
| [ ] PASS [ ] FAIL | Print has exactly one title/meta treatment (title plus available duration/date, preferably `.print-only`). |
| [ ] PASS [ ] FAIL | Print hides edit chrome, tray, and Golvklart action buttons, while retaining schematic, zones, caption, station numbers, optional flow, and soft unplaced banner. |
| [ ] PASS [ ] FAIL | Caption is exactly **Schematisk hall — inte exakt mått** in edit mode, Golvklart, and print. |

## 2. Scope guard

Mark **PASS** when the implementation does not add or alter these items. Mark **FAIL** only if Slice 08 introduces scope or breaks a carried contract.

| Result | Scope guard |
|---|---|
| [ ] PASS [ ] FAIL | No keyboard drag/move feature was added (P08-04). |
| [ ] PASS [ ] FAIL | No removal of valid Utkast compatibility/data or historical docs (P08-06). |
| [ ] PASS [ ] FAIL | No caption rewrite (P08-07); no soft snap/zone animation (P08-09). |
| [ ] PASS [ ] FAIL | No new drills, coach filter, onboarding, CAD, exact measurements, hall reorder, share links, export/PDF machinery, or new route (P08-10). |
| [ ] PASS [ ] FAIL | No snap, preset, station-order, flow, or storage-key redesign; no requirement to persist `hallMode`. |

## 3. Accessibility and interaction

| Result | Check |
|---|---|
| [ ] PASS [ ] FAIL | Visible control labels and accessible names agree and use Swedish hall terms: **Golvklart**, **Ej placerade**, **Placera här**, **Visa flöde**, **Dölj flöde**. |
| [ ] PASS [ ] FAIL | Phone tray, preset picker, placement actions, remove action, zoom controls, and floor/print actions have ≥44px primary targets where applicable. |
| [ ] PASS [ ] FAIL | Empty canvas can pan/scroll without starting a chip drag; chip interaction still works; **Placera här** remains a reliable alternate. |
| [ ] PASS [ ] FAIL | Experienced-only chips retain **Erfaren** and the existing warning path when detail opens. |
| [ ] PASS [ ] FAIL | Print content remains DOM/CSS content, not a canvas-only bitmap that defeats print rules. |

## 4. Regression 01–07

Run the applicable prior-slice smoke path and record PASS/FAIL for each numbered regression.

| Regression | Result | Check |
|---|---|---|
| **01 — Home / builder entry** | [ ] PASS [ ] FAIL | Home → **Nytt pass**, template, and **Fortsätt senaste pass** work; Hallöversikt still returns to the same pass. |
| **02 — Pass structure / totals** | [ ] PASS [ ] FAIL | Five blocks remain in order; totals remain item-sum based with the existing soft mismatch behavior. |
| **03 — Activity library / safety** | [ ] PASS [ ] FAIL | 28 drills, VisualIcon rendering, and the two experienced-only activities/warning remain intact. |
| **04 — Hall entry / navigation** | [ ] PASS [ ] FAIL | Hallöversikt CTA guard works for empty pass; entry works for a non-empty pass; back returns to Passbyggaren. |
| **05 — Placements / tray lifecycle** | [ ] PASS [ ] FAIL | New items start unplaced; place/move/remove works; orphan placements prune; template replacement clears placements; **Placera här** works. |
| **06 — Zones / snap / presets** | [ ] PASS [ ] FAIL | Six zones, three presets, `generic-trupp` alias, apparatus snap/free open, and normalized placement persistence remain unchanged. |
| **07 — Flow / Golvklart / phone baseline** | [ ] PASS [ ] FAIL | Station numbers/flow still follow pass order; Golvklart remains read-only with soft banner; exit works; phone pan/zoom/remove behavior remains; print call works. |

## 5. Build and print smoke checks

| Result | Check |
|---|---|
| [ ] PASS [ ] FAIL | `npm run build` succeeds from the app project. |
| [ ] PASS [ ] FAIL | At ~390px and 768px, tray does not disappear, overlap the active drop area, or become unreachable during canvas pan. |
| [ ] PASS [ ] FAIL | In print preview, only one title/meta treatment is visible and no edit/tray/action chrome is visible. |
| [ ] PASS [ ] FAIL | Print preview retains schematic, zones, caption, placed station numbers, flow when on, and unplaced banner when applicable. |
| [ ] PASS [ ] FAIL | Storage key remains `gymnastics-planner-draft-v1`; reload restores placements/presets and opens the hall in edit mode. |

## Suggested smoke path

1. Build a pass with several activities across blocks, including an experienced-only activity; note order and open Hallöversikt.
2. Place and move activities, use **Placera här**, change preset, reload, and confirm silent persistence with no placement toast.
3. At ~390px, pan the canvas to its bottom edge and confirm the tray remains reachable, safe-area space is present, and the last drop area can be reached above the tray.
4. Check zoom accessible names and all visible hall labels for Swedish copy.
5. Enter **Golvklart** with at least one unplaced activity; confirm caption, numbers, flow preference, **Erfaren**, and soft banner.
6. Print from Golvklart; confirm one title/meta strip and the exact keep/hide rules above.
7. Run Regression 01–07 and `npm run build`.

**Overall PASS:** all locked Slice 08 checks and Regression 01–07 are PASS, with no scope-guard violation.  
**Overall FAIL:** any locked check fails, the smoke path is blocked, or a prior-slice regression is introduced.
