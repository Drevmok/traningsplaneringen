# Slice 22 — static/code verification evidence

**Verifier role:** Code/static only (no product edits)  
**Date:** 2026-09-26 ~01:39 CEST  
**App root:** `/workspace/gymnastics-planner/app`  
**Authority:** `slice-22/verification-checklist.md` (APPROVED locks A1/B1/C1/D1/E1/F1)  
**Ship notes:** `app/SLICE22-SHIPPED.md`  
**Skill:** `verify-traningsplaneraren/SKILL.md`  
**Overall (code):** **PASS** (locked groups A/B/C/E/F + build; D1 wire-only not scored in this pass)

---

## Build

```
cd /workspace/gymnastics-planner/app && npm run build
```

| Field | Value |
|---|---|
| Exit code | **0** |
| Script | `tsc -b && vite build` |
| Output (brief) | vite v8.3.0; 46 modules; `dist/index.html` 0.98 kB; CSS 36.79 kB; JS 328.33 kB; ✓ built in 184ms |

---

## A1 — Progressive Hall hints — **PASS**

| Check | Result | Evidence |
|---|---|---|
| `hallHintsCompact` durable flag | **PASS** | `coachTips.ts:35-36` field on `CoachTipsStateV1`; normalize persists `:79-80`; `markHallHintsCompact` `:246-249` idempotent set `hallHintsCompact: true` via `saveCoachTips`. |
| Compact on successful `placeAt` | **PASS** | `HallBoard.tsx:187-198` `placeAt` → `persist` then `onTips?.(markHallHintsCompact)` (`:195-196`). Wired from `App.tsx:228` `onTips={handleTipsUpdate}` / `:157-161`. Comment `App.tsx:64-65`: compact **not** synced from `placementCount` so Visa tips igen can clear it. |
| Multi-line hint keys gated | **PASS** | Gating: `showMultiLineHints = !tips.hallHintsCompact && !anyEditTipVisible` (`HallBoard.tsx:110-119`). Header paragraphs when true: `hallStationOrderHint` / `hallStationsOnlyHint` / `hallTileHint` (`:471-476`). Tray: `hallDragHint` / `hallSnapHint` (`:629-633`). Keys in `blockMeta.ts:167+`, `:194+`, `:170+`, `:208`, `:277-278`. |
| Info control ≥44 reveals full set | **PASS** | When `!showMultiLineHints && showHintsInfo` (`HallBoard.tsx:478-502`): button `hall-tap-target hall-hints-info-btn` (`:482`), label `UI.hallHintsInfo` / hide (`:489`) → `blockMeta.ts:268-271` `'Tips om placering'`. Expanded panel shows all five hint keys (`:493-499`). Session-local `hintsInfoOpen` (`:91-92`). CSS: `.hall-tap-target` `App.css:2159-2162` min 44×44; Slice 22 info block `:2165-2194`. |
| Visa tips igen clears compact | **PASS** | `resetTipsVisibility` (`coachTips.ts:135-146`) sets `hallHintsCompact: undefined` + `komIgangCollapsed: undefined` (Q4). Invoked `App.tsx:163-166` `handleShowTipsAgain` → `patchTips(resetTipsVisibility)`. Footer + Home buttons use `UI.visaTipsIgen` (`blockMeta.ts:248`; `App.tsx:253-258`; `Home.tsx:146` area). |

---

## B1 — Quieter Kom igång — **PASS**

| Check | Result | Evidence |
|---|---|---|
| `komIgangCollapsed` + setter | **PASS** | Field `coachTips.ts:37-38`; normalize `:81`; `setKomIgangCollapsed` `:252-263`. App wires `handleKomIgangCollapseChange` (`App.tsx:153-155`) → Home `onKomIgangCollapseChange` (`:216`) → `KomIgangCard` `onCollapseChange` (`Home.tsx:100`). |
| Collapsed summary when `done>0` or collapsed | **PASS** | Initial expand: `!(done > 0 \|\| tips.komIgangCollapsed === true)` (`KomIgangCard.tsx:48-51`). Collapsed UI `:108-134`: title + progress (`:116-121`) + expand button. |
| 0/n brand-new stays expanded | **PASS** | When `done === 0` and `komIgangCollapsed` not true, `useState` init → `expanded === true` (`:49-51`); full card with intro + steps (`:137-222`). |
| Dölj Kom igång / Jag klarar mig | **PASS** | Expanded dismiss `:156-163` `{UI.komIgangDismiss}` → `blockMeta.ts:240` `'Dölj Kom igång'`; alt `:215-221` `{UI.komIgangDismissAlt}` → `:241` `'Jag klarar mig'`. `onDismiss` → `dismissChecklist` (`coachTips.ts:127-132` sets `checklistDismissed: true`); early return if dismissed (`KomIgangCard.tsx:53`). |
| Expand / collapse ≥44 | **PASS** | Expand btn `:123-131` / collapse `:147-155` both `hall-tap-target kom-igang-toggle`. Labels `UI.komIgangExpand` / `Collapse` → `blockMeta.ts:272-275` (`Visa steg` / `Dölj steg`). `.hall-tap-target` min 44×44 (`App.css:2159-2162`); toggle layout `:297-308`. Persist via `collapse()`/`expand()` calling `onCollapseChange` (`KomIgangCard.tsx:55-63`). Remount key on Visa tips igen: `Home.tsx:93-94`. |

---

## C1 — One chrome layer — **PASS**

| Check | Result | Evidence |
|---|---|---|
| Tip strip suppresses multi-line hints on Hall edit | **PASS** | `headerTipVisible` / `trayTipVisible` / `anyEditTipVisible` (`HallBoard.tsx:111-117`); `showMultiLineHints = !hallHintsCompact && !anyEditTipVisible` (`:118`). When tip visible → multi-line paragraphs off; info still via `showHintsInfo = hallHintsCompact \|\| anyEditTipVisible` (`:119`) + panel (`:478-502`). Tip strips: header `:504-510` (`TIP_HALL_FLOW_GOLVKLART`); tray `:635-641` (`TIP_HALL_PLACE`). |
| Golvklart banner suppresses tip | **PASS** | Floor header shows unplaced banner only (`:392-396` `hall-unplaced-banner`); tip visibility gated `!isFloor` (`:112`, `:114`) so no `CoachTipStrip` on floor. Comment `:120` C1 Golvklart. Edit tips already hidden when `isFloor`. |
| CTAs not hidden | **PASS** | Edit header CTAs (Golvklart / apply / etc.) outside hint gates (`:430-449` area). Tray chips + Placera här labels still render when expanded (`:644-666`); compact tray still has expand toggle (`:593-606`). Zoom bar independent (`:522-542`). `placeAt` / chip paths unchanged. |

---

## E1 — Footer — **PASS**

| Check | Result | Evidence |
|---|---|---|
| Exactly `Träningsplaneraren · Slice 22` | **PASS** | `blockMeta.ts:346-347` `footerSliceLabel: 'Träningsplaneraren · Slice 22'`. Rendered `App.tsx:246-249` `{UI.footerSliceLabel}`. |

---

## F1 — Scope / chrome — **PASS**

| Check | Result | Evidence |
|---|---|---|
| No saknar banner | **PASS** | `rg saknar` under `app/src` → **zero** hits. Unplaced chrome remains `hall-unplaced-banner` only (`HallBoard.tsx:392-395`). |
| No place-heuristic change in coachTips auto-progress | **PASS** | `syncChecklistHeuristics` still data-model §4 (`coachTips.ts:199-243`): `openHallAndPlace` when `placementCount >= 1 \|\| openedHall` (`:224-229`). Compact is **not** driven by heuristics; only `placeAt` → `markHallHintsCompact` (`App.tsx:64-65`, `HallBoard.tsx:195-196`). |
| No Passbyggaren compose | **PASS** | `StationComposeSheet` imported/mounted only from `HallBoard.tsx:52`, `:709` (hall path). |
| Library still 10 | **PASS** | `equipmentPieces.ts:8-35` exactly 10 `eq-*` pieces (`eq-trampett` … `eq-kon`); comment “all 10 pieces”. |
| Caption unchanged | **PASS** | `blockMeta.ts:169` `hallSchematicNote: 'Schematisk hall — inte exakt mått'`; rendered `HallCanvas.tsx:237`. |
| No `window.confirm` | **PASS** | `rg window.confirm` under `app/src` → **zero** hits. |
| Slice 21 pinch / pan / tray still present | **PASS** | Pinch: `HallCanvas.tsx:76-135` touchstart/move on wrap; `HallBoard.tsx:562` `onViewZoomChange={handlePinchZoom}`; zoom clamp helpers imported `:28-30`, buttons `:522-542`. Pan: wrap `overflow: auto` + canvas `touch-action: pan-x pan-y` (`App.css:1611`, `:1624`, phone `:2348-2360`); chip `touch-action: none` `:2362-2363`. Tray collapse: `trayCollapsed` default true (`HallBoard.tsx:89-90`); compact bar / toggles `:593-623`; `--hall-tray-reserved` `:547-553`; CSS compact `:2315+`. |

---

## Summary

| Lock | Result |
|---|---|
| **A1** Progressive Hall hints; durable compact on placeAt; gated multi-line keys; info ≥44; Visa tips igen clears | **PASS** |
| **B1** komIgangCollapsed; summary when done>0/collapsed; 0/n expanded; Dölj/Jag klarar mig; expand/collapse ≥44 | **PASS** |
| **C1** Tip suppresses multi-line; Golvklart banner no tip; CTAs not hidden | **PASS** |
| **E1** Footer Slice 22 | **PASS** |
| **F1** No saknar; no heuristic change; no Passbyggaren compose; library 10; caption; no window.confirm; Slice 21 pinch/pan/tray intact | **PASS** |
| **Build** | **PASS** (exit 0) |

**Evidence path:** `/workspace/gymnastics-planner/verifier/slice-22-evidence-code.md`

**Note (static only):** Live phone/Home smoke (first place → compact, Kom igång collapse on return, tip+hint stack, Golvklart banner) not exercised here; handlers + gates verified in source. Pinch multi-touch remains a drive-smoke item per ship gap.
