# Slice 16 — Code evidence pack (Verifier)

**Date:** 2026-09-25 12:10 CEST (Europe/Stockholm)  
**Agent:** code verifier (executor subagent)  
**Authority:** `slice-16/verification-checklist.md` (APPROVED 2026-09-25) + `app/SLICE16-SHIPPED.md` + `docs/kom-igang-redskap.sv.md` + `docs/coach-tips.sv.md`  
**Scope:** CODE / static / build only — inspect + `npm run build`. **UI smoke is separate** (not exercised here).  
**Product rewrite:** none (evidence only under `verifier/`)

---

## Environment / build

| Check | Result | Evidence |
| --- | --- | --- |
| App path | `/workspace/gymnastics-planner/app` | — |
| `npm run build` | **PASS** (exit **0**) | `tsc -b && vite build`; vite v8.3.0; 45 modules; `dist/index.html` 0.97 kB; `index-Db9oX7lS.css` 34.76 kB; `index-C0wqc_Kg.js` 320.88 kB; built in ~212 ms |
| Unit tests for `hasComposedEquipment` | **none found** | No `*.test.*` / `*.spec.*` under `app/src`; predicate cited below instead |
| Errors | none | clean build stdout |

### Files touched (Slice 16 ship — mtimes 2026-09-25 ~12:08–12:09 CEST)

| File | Role |
| --- | --- |
| `src/lib/coachTips.ts` | `composeStationEquipment`; `CHECKLIST_TOTAL = 5`; normalize; sync + done-count |
| `src/App.tsx` | Derive `hasComposedEquipment`; pass into `syncChecklistHeuristics` |
| `src/data/blockMeta.ts` | Fem intro; compose step keys; footer Slice 16 |
| `src/components/KomIgangCard.tsx` | Insert soft compose step; Golvklart ungated by compose |
| `SLICE16-SHIPPED.md` | Ship notes |

### Untouched (regression spots — mtimes CEST)

| File | mtime | Note |
| --- | --- | --- |
| `src/lib/hall.ts` | 2026-09-24 14:30 | Teknik filter / prune |
| `src/components/HallChip.tsx` | 2026-09-25 09:43 | Slice 12 markers + Slice 14 under-markör |
| `src/components/ForradslistaSheet.tsx` | 2026-09-25 11:35 | Slice 15 Förrådslista |
| `src/components/ActivityDetail.tsx` | 2026-09-24 15:33 | Detail **Redigera redskap** + `tipStationCompose` show |
| `src/components/StationComposeSheet.tsx` | 2026-09-24 15:32 | Compose sheet |
| `src/components/Home.tsx` | 2026-09-24 11:17 | Home chrome structure (no redesign) |

---

## Legend

- **PASS** — satisfied from code with concrete file:line  
- **PARTIAL** — present in code; visual/UX or runtime needs UI smoke  
- **FAIL** — clear code violation  
- **N/A (code)** — checklist item not decidable from static code alone

---

## Locked rules (CODE) 1–14

### 1. Discoverability — Home teaches set redskap (markör → Redigera redskap) — **PASS**

| Claim | Evidence |
| --- | --- |
| New step label | `blockMeta.ts:226` `komIgangStepCompose: 'Ange redskap på Teknik-stationerna'` |
| Hint names CTA | `blockMeta.ts:227-228` `Tryck en markör och välj Redigera redskap.` |
| Step in card | `KomIgangCard.tsx:67-76` key `composeStationEquipment`, label/hint from UI |
| Intro Fem | `blockMeta.ts:215-216` `Fem korta steg — från tomt pass till något du kan visa på golvet.` |

Matches `docs/kom-igang-redskap.sv.md` step 4 keys.

### 2. Path — points at hall detail Redigera redskap; no Passbyggaren compose — **PASS**

| Claim | Evidence |
| --- | --- |
| Compose step CTA = Hallöversikt | `KomIgangCard.tsx:70` `action: 'openHall'` (same as place step) |
| Home routes openHall → hall | `Home.tsx:60-64` → `onOpenHall()`; `App.tsx:118-125` `openHallFromHome` → `setView('hall')` |
| Compose UI only from hall detail | `ActivityDetail.tsx:215-225` `stationEquipmentEdit` button when `onEditEquipment`; `HallBoard.tsx` mounts `StationComposeSheet` |
| No Passbyggaren compose entry | `rg` on `SessionBuilder.tsx` / `LibraryPanel.tsx` / `ActivityCard.tsx`: **no** `StationCompose` / `composeTitle` / `stationEquipmentEdit` |

### 3. Step shape (A) — 5 soft steps; between place and Golvklart; Fem; CHECKLIST_TOTAL=5 — **PASS**

| Claim | Evidence |
| --- | --- |
| `CHECKLIST_TOTAL` | `coachTips.ts:245` `export const CHECKLIST_TOTAL = 5` |
| Checklist keys (5) | `coachTips.ts:12-17` / `:23-28` includes `composeStationEquipment` between place and Golvklart |
| Card order | `KomIgangCard.tsx:46-87` — choose → add → place → **compose** → Golvklart |
| Intro Fem | `blockMeta.ts:215-216` |
| Progress uses total 5 | `KomIgangCard.tsx:109` `komIgangProgressText(done, CHECKLIST_TOTAL)` |
| Done-count includes compose | `coachTips.ts:234-242` sums all five booleans |
| Normalize missing → false | `coachTips.ts:65-66` `composeStationEquipment: Boolean(checklist.composeStationEquipment)` |

### 4. Auto-progress (B) — non-empty saved `stationEquipment` only — **PASS**

**Predicate (no unit tests; exact code):**

```ts
// App.tsx:50-58
const hasComposedEquipment = Boolean(
  sourceForCompose &&
    listSessionItems(sourceForCompose).some(
      (item) =>
        Array.isArray(item.stationEquipment) &&
        item.stationEquipment.length > 0,
    ),
)
```

| Case | Counts? | Why |
| --- | --- | --- |
| `stationEquipment` undefined (unset) | **No** | `Array.isArray(undefined)` false |
| `stationEquipment: []` | **No** | `length > 0` false |
| non-empty saved array | **Yes** | both conjuncts true |
| `defaultStationEquipment` / förslag alone | **No** | Predicate never reads `defaultStationEquipment` or activity seed; only `item.stationEquipment` |

Sync wiring: `App.tsx:63-67` passes `hasComposedEquipment` → `coachTips.ts:220-223` sets `composeStationEquipment` only when true; never clears (`if (!checklist.composeStationEquipment && opts.hasComposedEquipment)`).

Types confirm semantic split: `types.ts:40-43` `defaultStationEquipment` = förslag when unset; `types.ts:58-64` `stationEquipment` = saved recipe / `[]` cleared / undefined unset.

UI still shows förslag separately (`ActivityDetail.tsx:66-74`) without feeding the heuristic.

### 5. Tip strip (C) — `tipStationCompose` as-is — **PASS**

| Claim | Evidence |
| --- | --- |
| String in UI | `blockMeta.ts:251-252` `'Redigera redskapen ni faktiskt använder. Det sparas i utkastet och syns när du trycker på markören.'` |
| Slice 13 docs lock | `slice-13/content/station-compose.sv.md:115` — **identical** wording |
| Slice 16 / living docs | `docs/kom-igang-redskap.sv.md:94` and `docs/coach-tips.sv.md:96` — **identical** |
| Show rules | `ActivityDetail.tsx:228-236` — when `showStationEquipment` + tips + not dismissed `TIP_STATION_COMPOSE`; dismissible `CoachTipStrip` |
| Tip id constant | `coachTips.ts:9-10` `TIP_STATION_COMPOSE = 'tip-station-compose'` |
| File untouched by Slice 16 | `ActivityDetail.tsx` mtime **2026-09-24 15:33** (pre–Slice 16) |

No strengthening / retirement / second Home-only compose tip in Slice 16 files.

### 6. Soft only (D) — Golvklart enterable with compose unchecked — **PASS**

| Claim | Evidence |
| --- | --- |
| Golvklart step not gated by compose | `KomIgangCard.tsx:77-86` comment `Soft only — never disabled for missing compose`; `disabled: !canOpenHall` only; `disabledReason` = NeedActivity / NeedHall — **never** compose / redskap |
| Checklist CTA path | `Home.tsx:66-71` `openGolvklart` → flash only activity/hall need |
| App open path | `App.tsx:128-137` `openGolvklartFromHome` requires draft + `countSessionItems >= 1` only — **no** `composeStationEquipment` / `hasComposedEquipment` check |
| Hall Golvklart | No compose gate added in Slice 16 ship files; `HallBoard` / compose files untouched for gating |

### 7. Home-only — no mandatory new compose chrome on Hall / Golvklart — **PASS** (code)

| Claim | Evidence |
| --- | --- |
| New step only in Kom igång | `KomIgangCard.tsx` + Home mount `Home.tsx:91-98` |
| Hall tips unchanged | Existing `tipStationCompose` only (Slice 13); ActivityDetail mtime pre–16 |
| Ship scope | `SLICE16-SHIPPED.md` lists only coachTips / App / blockMeta / KomIgangCard |

### 8. Teknik-only — Slice 11 filter/prune unchanged — **PASS**

| Claim | Evidence |
| --- | --- |
| Filter | `hall.ts:83-86` `isPlaceableItem` → `blockType === 'techniques'` |
| Placeable set | `hall.ts:93-95` |
| Prune | `hall.ts:383+` `pruneHallPlacements` |
| HallBoard still prunes | `HallBoard.tsx:108-110` (import/use `pruneHallPlacements`) |
| File mtime | `hall.ts` **2026-09-24 14:30** — not in Slice 16 ship set |

### 9. Slice 12–15 intact — **PASS** (static presence)

| Sub-claim | Evidence |
| --- | --- |
| Markers / tap≠drag | `HallChip.tsx:33-36`, `:83-101` suppressClickRef; mtime Slice 14 era |
| Redigera redskap detail-only | `ActivityDetail.tsx:215-225`; no SessionBuilder compose |
| Under-markör | `HallChip.tsx:66-81`, `:173+` `hall-chip-equipment`; `App.css:1762+` Slice 14 comment |
| Förrådslista | `ForradslistaSheet.tsx` present; `HallBoard.tsx:319+`, `:379+`, `:592` CTAs + sheet; `equipmentPieces.ts` aggregate |
| No badge / CAD | No equipment-count badge chrome in Slice 16 ship; caption honesty preserved |
| Caption | see rule 10 |

### 10. Caption — Schematisk hall — inte exakt mått — **PASS**

| Claim | Evidence |
| --- | --- |
| Copy key | `blockMeta.ts:168` `hallSchematicNote: 'Schematisk hall — inte exakt mått'` |
| Rendered | `HallCanvas.tsx:160` `{UI.hallSchematicNote}` |

### 11. Phone ~390px Kom igång readable/tappable — **PARTIAL**

| Claim | Evidence |
| --- | --- |
| Soft phone CSS | `App.css:413-417` `@media (max-width: 480px) { .kom-igang { … padding: 14px } }` |
| Step buttons | `KomIgangCard.tsx:123-134` full-width-ish step buttons (`kom-igang-step-btn`) |
| UI smoke | **Not run** — cannot assert 390px layout from static code alone |

### 12. Scope — no Netlify / accounts / idea 1 / idea 3 — **PASS** (code scope)

| Claim | Evidence |
| --- | --- |
| Ship notes | `SLICE16-SHIPPED.md` Deploy: No; Out: Netlify, ideas 1 & 3 |
| Ship file set | Only tips/checklist/footer copy — no selective-förslag catalog or Golvklart short-title work in touched files |

### 13. Footer (E) — Träningsplaneraren · Slice 16 — **PASS**

| Claim | Evidence |
| --- | --- |
| Label | `blockMeta.ts:318` `footerSliceLabel: 'Träningsplaneraren · Slice 16'` |
| Render | `App.tsx:225-228` `{UI.footerSliceLabel}` in `app-footer no-print` |

### 14. Visuals (F) — no Home redesign beyond copy/checklist/progress — **PASS** (code) / **PARTIAL** (pixels)

| Claim | Evidence |
| --- | --- |
| Home.tsx structure | mtime **2026-09-24 11:17** — unchanged in Slice 16; still header + KomIgangCard + action cards |
| Slice 16 UI delta | New step + Fem intro + progress total via blockMeta/KomIgangCard/coachTips only |
| No new Home illustration/accent classes in ship | Ship file list has no Home CSS redesign; `.kom-igang*` rules pre-existing (`App.css:97+`) |
| Pixel proof | **Not run** — UI smoke should confirm no accent/illustration redesign |

---

## A–F lock summary (code)

| Lock | Verdict | One-liner |
| --- | --- | --- |
| **A** Step shape (5; Ange redskap between place & Golvklart; Fem; TOTAL=5) | **PASS** | `CHECKLIST_TOTAL=5`; card order place→compose→Golvklart; Fem intro |
| **B** Auto-progress non-empty saved `stationEquipment` | **PASS** | Predicate on `item.stationEquipment` length only — not förslag/`[]`/unset |
| **C** `tipStationCompose` as-is | **PASS** | Exact Slice 13 string; ActivityDetail show rules untouched |
| **D** Soft only — never block Golvklart | **PASS** | No compose `disabledReason` on Golvklart; open path ignores compose flag |
| **E** Footer Slice 16 | **PASS** | `Träningsplaneraren · Slice 16` |
| **F** No Home visual redesign | **PASS** (code) / **PARTIAL** (UI) | Home.tsx untouched; only checklist copy/progress |

---

## Fail-if scan (static)

| Fail-if | Code result |
| --- | --- |
| Golvklart blocked when compose unchecked | **Not present** |
| New Passbyggaren compose / canvas badge | **Not present** |
| Progress counts förslag / default alone | **Not present** (predicate excludes) |
| Fifth placeable block / custom equipment CRUD | **Not present** |
| Still 4 steps / Fyra korta steg | **Not present** (Fem + TOTAL 5) |
| Under-markör / Förrådslista removed | **Still present** |
| Caption / Teknik-only regress | **Still present** |
| Home visual redesign beyond copy | **No code evidence of redesign** |
| Idea 1 / idea 3 in ship | **Not in ship files** |

---

## Uncertainties / needs UI smoke

1. Rule **11** phone ~390px readability/tappability.  
2. Rule **14** pixel-level Home chrome (no illustration/accent redesign).  
3. Runtime heuristic catch-up (older draft with saved equipment auto-checks on sync) — logic present; not executed here.  
4. Smoke path steps 1–10 (live checklist / Golvklart with compose unchecked) — defer to UI Verifier.

---

## Build log (abbreviated)

```
> tsc -b && vite build
vite v8.3.0 building client environment for production...
✓ 45 modules transformed.
dist/index.html                   0.97 kB │ gzip:  0.47 kB
dist/assets/index-Db9oX7lS.css   34.76 kB │ gzip:  7.27 kB
dist/assets/index-C0wqc_Kg.js   320.88 kB │ gzip: 96.47 kB
✓ built in 212ms
EXIT:0
```

---

**End of code evidence.** Final verify report is owned by Verifier (not this file).
