# Slice 19 — Code evidence pack (Verifier)

**Date:** 2026-09-25 22:13 CEST (Europe/Stockholm)  
**Agent:** code verifier (executor subagent)  
**Authority:** `slice-19/verification-checklist.md` + `slice-19/decisions.md` (APPROVED A–F) + `app/SLICE19-SHIPPED.md` + `docs/anvand-alla-forslag.sv.md`  
**Scope:** CODE / static / build only — inspect + `npm run build`. **UI smoke is separate** (not exercised here).  
**Product rewrite:** none (evidence only under `verifier/`)

---

## Environment / build

| Check | Result | Evidence |
| --- | --- | --- |
| App path | `/workspace/gymnastics-planner/app` | — |
| `npm run build` | **PASS** (exit **0**) | `tsc -b && vite build`; vite v8.3.0; 45 modules; `dist/index.html` 0.97 kB; `index-Dvg9yjiG.css` 34.88 kB; `index-CBCBmblw.js` 322.73 kB; built in ~178 ms |
| Errors | none | clean build stdout |
| Git history | **unavailable** (`NO_GIT`) | Used mtimes + content spot for seed/library untouched |

### Files touched (Slice 19 ship — per `SLICE19-SHIPPED.md`)

| File | Role | mtime (box local CEST) |
| --- | --- | --- |
| `src/lib/session.ts` | `eligibleSuggestedStationEquipmentItems`, `applyAllSuggestedStationEquipment` | Sep 25 22:10 |
| `src/components/HallBoard.tsx` | Edit CTA + handler + soft toast | Sep 25 22:10 |
| `src/data/blockMeta.ts` | Slice 19 UI keys + result helper + footer Slice 19 | Sep 25 22:10 |
| `SLICE19-SHIPPED.md` | Ship notes | — |

### Untouched (scope / regression)

| File | mtime | Note |
| --- | --- | --- |
| `src/data/seedActivities.ts` | Sep 25 **19:47** | Slice 18 ship time; **not** in Slice 19 touch list |
| `src/data/equipmentPieces.ts` | Sep 25 **14:33** | Library still 10 `eq-*`; aggregate saved-only |

---

## Legend

- **PASS** — satisfied from code with concrete file:line  
- **PARTIAL** — present in code; visual/UX or runtime needs UI smoke  
- **FAIL** — clear code violation  
- **N/A (code)** — checklist item not decidable from static code alone  
- **Uncertainty** — called out explicitly

---

## Task 1 — Eligibility helpers (`session.ts`)

### `eligibleSuggestedStationEquipmentItems` — `src/lib/session.ts:192-205`

```ts
/** Placed Teknik with unset stationEquipment + non-empty seed (Slice 19). */
export function eligibleSuggestedStationEquipmentItems(
  session: Session,
): SessionItem[] {
  const placedIds = new Set(
    (session.hallPlacements ?? []).map((p) => p.sessionItemId),
  )
  return placeableItems(session).filter((item) => {
    if (!placedIds.has(item.id)) return false
    if (item.stationEquipment !== undefined) return false
    const seed = getActivityById(item.activityId)?.defaultStationEquipment
    return Array.isArray(seed) && seed.length > 0
  })
}
```

**Predicates (Lock C):**

| Predicate | Code | Effect |
| --- | --- | --- |
| Placed Teknik | `placeableItems(session)` then `placedIds.has(item.id)` | `placeableItems` = Teknik only (`hall.ts:83-86` `blockType === 'techniques'`); unplaced skipped |
| Unset only | `item.stationEquipment !== undefined` → skip | Skips **saved non-empty** and cleared **`[]`** (both are defined) |
| Non-empty seed | `Array.isArray(seed) && seed.length > 0` | Skips seedless / missing `defaultStationEquipment` |
| Non-Teknik | filtered out by `placeableItems` | Skip |

### `applyAllSuggestedStationEquipment` — `src/lib/session.ts:211-222`

```ts
export function applyAllSuggestedStationEquipment(
  session: Session,
): { session: Session; appliedCount: number } {
  const eligible = eligibleSuggestedStationEquipmentItems(session)
  let next = session
  for (const item of eligible) {
    const seed = getActivityById(item.activityId)?.defaultStationEquipment
    if (!seed || seed.length === 0) continue
    next = updateItemStationEquipment(next, item.id, seed)
  }
  return { session: next, appliedCount: eligible.length }
}
```

- Persist path = **`updateItemStationEquipment`** (`session.ts:174-189`) — same as per-station Använd förslag / Klar (`HallBoard.tsx:244-255`).
- Recomputes eligibility at call time; does not overwrite defined saved/`[]`.
- **Uncertainty (minor):** `appliedCount` is `eligible.length` even if an item were skipped by the inner `continue` (seed gone mid-loop). Static race only; not a Lock C violation.

**Task 1 / Lock C — PASS.**

---

## Task 2 — `HallBoard.tsx` CTA (edit-only, disabled, toast, no confirm)

### Placement (edit chrome `.hall-header-actions`)

- Edit branch only: ternary `isFloor ? (floor header) : (edit header)` — `HallBoard.tsx:322-369` vs `:369-453`.
- CTA in `.hall-header-actions` beside Visa/dölj flöde + Förrådslista; primary **Golvklart** after — `:383-420`.
- Label `UI.hallApplyAllSuggested` → `'Använd alla förslag'` (`blockMeta.ts:318`).
- Secondary class `btn-secondary`; Golvklart stays `btn-primary`.

### Disabled when count 0

```tsx
const eligibleSuggestedCount = useMemo(
  () => eligibleSuggestedStationEquipmentItems(session).length,
  [session],
)
// ...
disabled={eligibleSuggestedCount === 0}
title={eligibleSuggestedCount === 0 ? UI.hallApplyAllSuggestedDisabled : undefined}
```

— `HallBoard.tsx:111-114`, `:400-412`. Matches Docs prefer-disabled (not hidden).

### Handler — immediate apply + soft toast; no confirm

```tsx
function handleApplyAllSuggested() {
  const { session: next, appliedCount } =
    applyAllSuggestedStationEquipment(session)
  if (appliedCount > 0) persist(next)
  setApplyAllStatus(hallApplyAllSuggestedResultText(appliedCount))
  window.setTimeout(() => setApplyAllStatus(null), 2200)
}
```

— `HallBoard.tsx:257-263`.

Toast:

```tsx
{applyAllStatus && (
  <div className="toast" role="status">
    {applyAllStatus}
  </div>
)}
```

— `:628-632`.

Result strings via `hallApplyAllSuggestedResultText` (`blockMeta.ts:358-362`): N=0 → `hallApplyAllSuggestedNone`; N=1 → One; else `{n}` template.

**No** `window.confirm` / `confirm(` in `HallBoard.tsx` (rg: NO_CONFIRM).

**Task 2 / Locks A (placement), B — PASS** (phone layout / tap feel → PARTIAL UI smoke).

---

## Task 3 — CTA absent from Golvklart / Passbyggaren / markör

| Surface | Evidence | Verdict |
| --- | --- | --- |
| Golvklart floor chrome | Floor header `:322-368` — Exit / Förrådslista / Print only; **no** `hallApplyAllSuggested` | **PASS** |
| Passbyggaren | `SessionBuilder.tsx` rg `hallApply\|Använd alla\|applyAll` → **NO_MATCH** | **PASS** |
| Markör sheet | `ActivityDetail.tsx` + `StationComposeSheet.tsx` → **NO_MATCH** for bulk CTA; detail still has per-station `stationEquipmentUseSuggested` / Använd förslag (`ActivityDetail.tsx:178+`, `blockMeta.ts:288`) | **PASS** |

CTA symbol only appears in `HallBoard.tsx` + `blockMeta.ts` + session helpers.

**Task 3 / Lock A absence — PASS.**

---

## Task 4 — Place does not write `stationEquipment`; Golvklart / Förråd saved-only

### Place path

`HallBoard.placeAt` (`:165-175`) → `upsertPlacement` only → `persist`.  
`upsertPlacement` (`hall.ts:283-313`) mutates **`hallPlacements` only** — no `stationEquipment` / no item rewrite.

`createSessionItem` (`session.ts:117-135`) leaves `stationEquipment` **undefined** unless explicitly passed (comment: seed förslag until coach saves).

### Quiet / saved-only consumers

| Consumer | Rule | Lines |
| --- | --- | --- |
| HallChip under-markör | `hasEquipment` = `Array.isArray(stationEquipment) && length > 0`; lines only from **saved** slots | `HallChip.tsx:63-81` |
| Edit hide / floor show | `.hall-chip-equipment { display: none }` ; `.hall-canvas.is-floor … { display: flex }` | `App.css:1763-1799` |
| Förrådslista | `aggregateStationEquipment` omits unset/`[]`; **ignores** `defaultStationEquipment` | `equipmentPieces.ts:141-175` |
| Print Förråd in HallBoard | uses `forradRows` from aggregate | `HallBoard.tsx:107-110`, `:580-590` |

**No auto-apply on place — PASS (Lock F).**  
**Quiet until saved — PASS (code).** Golvklart/Förråd *after* CTA filled — **PARTIAL** (needs UI smoke rules 9–10).

---

## Task 5 — Caption + footer Slice 19; library / seeds untouched

| Check | Evidence | Verdict |
| --- | --- | --- |
| Caption | `UI.hallSchematicNote: 'Schematisk hall — inte exakt mått'` (`blockMeta.ts:168`); rendered `HallCanvas.tsx:160` | **PASS** |
| Footer E | `footerSliceLabel: 'Träningsplaneraren · Slice 19'` (`blockMeta.ts:326`); `App.tsx` footer renders `{UI.footerSliceLabel}` | **PASS** |
| Library = 10 `eq-*` | `equipmentPieces.ts` count of `id: 'eq-` = **10**; mtime 14:33 (pre–Slice 19) | **PASS** |
| Seeds | `defaultStationEquipment:` count = **9** in `seedActivities.ts`; mtime **19:47** (Slice 18); not in Slice 19 ship file list | **PASS** (no Slice 19 edits) |
| Docs D wired | Keys match `docs/anvand-alla-forslag.sv.md` CTA/result/disabled/none (`blockMeta.ts:317-324`, helper `:358-362`) | **PASS** |
| Tip omitted | `tipAnvandAllaForslag` / TIP_*ALLA* — **NO_TIP_IN_SRC**; docs mark tip optional | **PASS** (Lock D) |

---

## Task 6 — Spot Slices 14–18 intact

| Slice | Spot | Evidence | Verdict |
| --- | --- | --- | --- |
| 11 | Teknik-only placeable | `hall.ts:83-86` `isPlaceableItem` | **PASS** |
| 13 | unset vs `[]` + Använd förslag | Eligibility skips defined; `updateItemStationEquipment` + detail `onUseSuggestedEquipment` intact | **PASS** |
| 14 | Quiet redskap | HallChip saved-only + CSS hide edit / show floor+print | **PASS** |
| 15 | Förrådslista saved-only | `aggregateStationEquipment` omits unset/`[]`/förslag; `ForradslistaSheet` still used | **PASS** |
| 16 | Kom igång | `CHECKLIST_TOTAL = 5` (`coachTips.ts:245`); `hasComposedEquipment` from saved non-empty only (`App.tsx:50-58`) | **PASS** |
| 17 | Golvklart short titles | `.hall-canvas.is-floor .hall-chip-title--print { display: block }` (`App.css:1792-1794`) | **PASS** |
| 18 | Nine Teknik seeds | 9 `defaultStationEquipment` in seed file; mtime unchanged vs Slice 19 | **PASS** |

No canvas equipment badge / CAD symbols found in HallChip/HallCanvas rg.

---

## Task 7 — Build

`cd /workspace/gymnastics-planner/app && npm run build` → **exit 0** (see Environment table).

**Rule 18 / build — PASS.**

---

## Checklist map (code lens)

| # | Rule | Code verdict |
| --- | --- | --- |
| 1 | CTA placement | **PASS** |
| 2–4 | Enable partial / all-unset / all-saved | **PARTIAL** — disabled when `eligibleSuggestedCount===0` proven; live enable matrices need UI smoke |
| 5 | Skip `[]` | **PASS** (`!== undefined`) |
| 6 | Skip seedless / non-Teknik / unplaced | **PASS** |
| 7 | Apply persists via same path | **PASS** |
| 8 | Result feedback; no confirm | **PASS** |
| 9–10 | Golvklart / Förråd after apply | **PARTIAL** (data path yes; visual smoke N/A) |
| 11 | Quiet before apply | **PASS** (code) |
| 12 | No auto-apply on place | **PASS** |
| 13 | Single-station semantics | **PASS** (unchanged handlers) |
| 14 | Edit vs Golvklart | **PASS** |
| 15 | Phone ~390px | **N/A (code)** |
| 16 | Scope / caption / 11–18 | **PASS** |
| 17 | Footer Slice 19 | **PASS** |
| 18 | Build | **PASS** |

---

## A–F code verdict summary

| Lock | Verdict | Notes |
| --- | --- | --- |
| **A** CTA edit chrome only | **PASS** | In `.hall-header-actions`; absent Golvklart / Passbyggaren / markör |
| **B** Immediate + status toast; N=0 soft; no confirm | **PASS** | `role="status"` toast; `hallApplyAllSuggestedNone` for 0; no `confirm` |
| **C** Eligibility predicates | **PASS** | Placed Teknik + unset + non-empty seed; skip saved/`[]` |
| **D** Docs strings; tip omitted | **PASS** | `blockMeta` matches docs; no tip in product |
| **E** Footer Slice 19 | **PASS** | Exact `Träningsplaneraren · Slice 19` |
| **F** Scope guards | **PASS** | No place auto-apply; quiet until saved; caption unchanged; no library growth; 11–18 spots OK |

**Build:** **PASS** (exit 0).

---

## FAIL / uncertainty list

**FAIL:** none from static code inspection.

**Uncertainty / N/A (defer to UI smoke):**

1. Live enable matrices (checklist rules 2–4) and post-apply Golvklart/Förråd fill (9–10).  
2. Phone ~390px layout / tappable CTA (rule 15).  
3. Git byte-diff of `seedActivities.ts` vs Slice 18 — unavailable; reliance on mtime 19:47 + ship file list + seed count 9.  
4. Theoretical `appliedCount` vs inner `continue` mismatch if seed vanished between eligibility and apply (not observed in code paths).

**Evidence path:** `/workspace/gymnastics-planner/verifier/slice-19-evidence-code.md`
