# Slice 20 — static/code verification evidence

**Verifier role:** Code/static only (no product edits)  
**Date:** 2026-09-26 ~00:23 CEST  
**App root:** `/workspace/gymnastics-planner/app`  
**Authority:** `slice-20/verification-checklist.md` + `slice-20/decisions.md` (APPROVED A–F)  
**Ship notes:** `app/SLICE20-SHIPPED.md`  
**Overall (code):** **PASS** (all locked rule groups A/B/C/E/F + build)

---

## Build

```
cd /workspace/gymnastics-planner/app && npm run build
```

| Field | Value |
|---|---|
| Exit code | **0** |
| Script | `tsc -b && vite build` |
| Output (brief) | vite v8.3.0; 46 modules; `dist/index.html` 0.98 kB; CSS 35.34 kB; JS 323.20 kB; ✓ built in 196ms |

---

## A1 — Dirty Stäng (`StationComposeSheet`) — **PASS**

| Check | Result | Evidence |
|---|---|---|
| No `window.confirm` on dirty Stäng / `handleClose` | **PASS** | `StationComposeSheet.tsx:100-106` — dirty → `setConfirmDiscard(true)`; clean → `onClose()`. Repo-wide `rg window.confirm` under `app/src` → **zero** hits (only historical mentions in ship md). |
| In-sheet Swedish confirm via `composeDirty*` | **PASS** | Strings in `blockMeta.ts:295-299`: body `Du har osparade ändringar.`; discard `Stäng utan att spara`; keep `Fortsätt redigera` (+ aria). UI wired `StationComposeSheet.tsx:154-175` (`UI.composeDirtyBody` / `Discard` / `Keep`). |
| Discard closes without persist | **PASS** | `handleDiscard` → `onClose()` only (`:108-110`); no `onSave`. |
| Keep editing hides confirm; sheet stays | **PASS** | `handleKeepEditing` → `setConfirmDiscard(false)` (`:112-114`); sheet remains mounted. |
| Clean Stäng closes immediately | **PASS** | `handleClose` when `!dirty` calls `onClose()` (`:100-106`). Backdrop uses same path (`:126-127`). |
| Klar saves without discard confirm | **PASS** | Klar button → `handleDone` → `onSave(...)` (`:116-118`, `:144-150`); never routes through `confirmDiscard` / `handleClose`. |
| Confirm actions CSS min-height ≥44px | **PASS** (phone) | `App.css:2674-2678` `@media (max-width: 768px)` → `.station-compose-dirty-actions .btn-secondary { min-height: 44px; }`. Matches checklist rule 6 “Phone targets”. |

---

## B1 — Canvas remove — **PASS**

| Check | Result | Evidence |
|---|---|---|
| `.hall-chip--canvas .hall-chip-remove` hit ≥44×44 | **PASS** | Base `App.css:1833-1847` — `width/height/min-width/min-height: 44px` (Slice 20 B1 comment). Phone overrides also 44×44: `:2068-2072`, `:2279-2283`. |
| aria/title `hallRemove` / Ta bort från hall | **PASS** | Chip: `HallChip.tsx:201-203` `title={UI.hallRemove}` `aria-label={UI.hallRemove}`. Copy: `blockMeta.ts:175` `hallRemove: 'Ta bort från hall'`. |
| No B2 text CTA in detail | **PASS** | Locked B1 only (no B2). `ActivityDetail.tsx` hall actions show Redigera redskap (`:210-220`); no secondary “Ta bort från hall” detail button. |
| Golvklart/floor: no remove control | **PASS** | `HallCanvas.tsx:190-191` — `onRemove={isFloor ? undefined : onRemovePlacement}`, `showRemove={!isFloor}`. `HallChip.tsx:198` gates render on `showRemove && onRemove`. `handleRemove` also early-returns if floor (`HallBoard.tsx:184-185`). |
| tap→detail; drag≠detail preserved | **PASS** (unchanged pattern) | `HallChip.tsx:33-36` comment + `:114-132` — `onDragStart` sets `suppressClickRef`; `handleActivate` / click ignores post-drag synthetic click (`:97-102`, `:133`). Canvas chips still get `onClick={onChipClick}` (`HallCanvas.tsx:189`) → detail via `openDetail` (`HallBoard.tsx:220-227`). |

---

## C1 — Template scroll / one-shot flag / body unlock — **PASS**

| Check | Result | Evidence |
|---|---|---|
| `openTemplates` / `initialTemplatePicker` cleared via `onInitialTemplateConsumed` | **PASS** | App: `App.tsx:182-185` `handleInitialTemplateConsumed` → `setOpenTemplates(false)`; passed as `onInitialTemplateConsumed` (`:225`). Builder: `closePanel` clears when `initialTemplatePicker` (`SessionBuilder.tsx:114-118`); apply path also calls `onInitialTemplateConsumed?.()` before remount (`:185-188`). Entry: `goTemplate` sets `openTemplates` true (`App.tsx:87-90`). |
| Apply uses `closePanel()` not `openPanel('library')` | **PASS** | `handleConfirmTemplate` (`SessionBuilder.tsx:179-188`) ends with `closePanel()`. Sole `openPanel('library')` is `openAddForBlock` (`:126`) — not template apply. |
| `useBodyScrollLock` / `bodyScrollLock.ts` refcount restores overflow | **PASS** | `bodyScrollLock.ts:9-26` — refcount; first lock sets `overflow='hidden'`; last release sets `overflow=''`. Hook `:30-34`. |
| TemplateConfirm, ActivityDetail, ForradslistaSheet, StationComposeSheet use helper | **PASS** | `TemplateConfirm.tsx:2,12`; `ActivityDetail.tsx:11,59`; `ForradslistaSheet.tsx:2,12`; `StationComposeSheet.tsx:16,56`; plus `SessionBuilder.tsx:28,102` for narrow panel. No residual direct `document.body.style.overflow` outside `bodyScrollLock.ts`. |

---

## E1 — Footer — **PASS**

| Check | Result | Evidence |
|---|---|---|
| Exactly `Träningsplaneraren · Slice 20` | **PASS** | `blockMeta.ts:332` `footerSliceLabel: 'Träningsplaneraren · Slice 20'`. Rendered `App.tsx:231-234` `{UI.footerSliceLabel}`. |

---

## F1 — Scope — **PASS**

| Check | Result | Evidence |
|---|---|---|
| No Passbyggaren compose for redskap | **PASS** | `StationComposeSheet` imported/mounted only from `HallBoard.tsx:45,609` (hall path). No import in `SessionBuilder.tsx` / `BlockCard.tsx`. |
| No badge/CAD; library size unchanged (10 `eq-*`) | **PASS** | `equipmentPieces.ts:12-36` — exactly 10 ids (`eq-trampett` … `eq-kon`); matches Slice 13/18 baseline. No CAD / hall-badge feature code under `app/src`. (Existing stub/experienced/total badges are prior slices, not Slice 20 hall CAD.) |
| Caption unchanged | **PASS** | `blockMeta.ts:168` `hallSchematicNote: 'Schematisk hall — inte exakt mått'`; shown `HallCanvas.tsx:160`. |
| No auto-apply on place | **PASS** | `placeAt` (`HallBoard.tsx:165-175`) only `upsertPlacement` + persist; does not call suggestion apply / compose save. |

---

## Checklist rule map (locked #1–18)

| # | Topic | Code verdict |
|---|---|---|
| 1 | No window.confirm dirty Stäng | PASS |
| 2 | Discard closes unsaved | PASS (static) |
| 3 | Fortsätt redigera keeps sheet | PASS (static) |
| 4 | Clean Stäng immediate | PASS |
| 5 | Klar no discard confirm | PASS |
| 6 | Confirm ≥44px phone | PASS |
| 7 | Remove hit ≥44×44 | PASS |
| 8 | Floor no remove | PASS |
| 9 | Tap vs drag | PASS (pattern preserved) |
| 10 | Remove deletes placement | PASS (static: `handleRemove` → `removePlacement`) |
| 11–14 | Template scroll / unlock / cancel | PASS (static; UI scroll smoke deferred) |
| 15 | Flag consumed | PASS |
| 16 | Scope F1 | PASS |
| 17 | Footer Slice 20 | PASS |
| 18 | `npm run build` green | PASS (exit 0) |

**Note:** Rules 2/3/10/11–14 include runtime/UI smoke aspects in the checklist; this file is **code/static** evidence only. Static wiring for those paths is present and consistent with A1/B1/C1 locks.

---

## Summary for parent

- **A** PASS — in-sheet dirty Stäng; no `window.confirm`; Klar clean; phone confirm ≥44px  
- **B** PASS — canvas remove 44×44; aria; no B2; floor no remove; drag≠detail preserved  
- **C** PASS — one-shot flag clear; `closePanel` on apply; body-lock refcount; helpers wired  
- **E** PASS — footer exactly `Träningsplaneraren · Slice 20`  
- **F** PASS — no Passbyggaren compose; library 10; caption unchanged; no auto-apply on place  
- **Build** PASS — exit 0  

Evidence path: `/workspace/gymnastics-planner/verifier/slice-20-evidence-code.md`
