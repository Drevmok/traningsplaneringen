# Slice 11 — Code evidence pack (Verifier)

**Date:** 2026-09-24 14:33 CEST (Europe/Stockholm)  
**Agent:** code verifier (executor subagent)  
**Authority:** `slice-11/verification-checklist.md` + `app/SLICE11-SHIPPED.md` + `docs/hall-declutter.sv.md`  
**Scope:** CODE / build only — inspect, build, evidence. **UI smoke is separate** (not exercised here).  
**Product rewrite:** none (evidence only)

---

## Environment / build

| Check | Result | Evidence |
| --- | --- | --- |
| App path | `/workspace/gymnastics-planner/app` | — |
| `npm run build` | **PASS** (exit **0**) | `tsc -b && vite build`; vite v8.3.0; 42 modules; `dist/index.html` 0.97 kB; `index-DWl5wzgI.css` 27.81 kB; `index-83vp64Q5.js` 304.69 kB; built in ~196 ms; `BUILD_EXIT=0` |
| Dist strings present | **PASS** | Bundle contains `Träningsplaneraren · Slice 11`, `Inga Teknik-stationer ännu`, `Tillbaka till Passbyggaren`, `Endast Teknik-stationer` |
| Errors | none | clean build stdout |

---

## Legend

- **PASS** — satisfied from code with concrete file:line / grep quotes  
- **PARTIAL** — present in code; visual/size/UX needs UI smoke  
- **FAIL** — clear code violation  
- **N/A / DEFERRED** — UI smoke / live URL; not a code FAIL here

---

## Locked rules (CODE)

### 1. Teknik-only placeable — **PASS**

| Claim | Evidence |
| --- | --- |
| Single filter | `src/lib/hall.ts:83-86` `isPlaceableItem` → `activity?.blockType === 'techniques'`; `placeableItems` `:93-94` filters `passOrder` via that |
| Count helper | `countPlaceableItems` `:97-98` |
| Tray / unplaced | `getUnplacedItems` `:172-176` filters `placeableItems` not in placements |
| Canvas / placed | `getPlacedItems` `:179-188` resolves only via `placeableItems` map |
| Ranks | `stationRanks` `:101-114` iterates `placeableItems` among placed |
| Flow | `flowSegments` `:131-156` ordered from `placeableItems` only |
| Upsert reject | `upsertPlacement` `:283-290` `if (!item \|\| !isPlaceableItem(item)) return session` |
| UI wiring | `HallBoard.tsx` uses `getUnplacedItems` / `countPlaceableItems` for tray (`:75`, `:466+`); `HallCanvas.tsx:53-55` uses `getPlacedItems` + `stationRanks` |

Non-Teknik (Samling / Uppvärmning / Styrka / Lek) never enter tray or canvas lists via these APIs.

### 2. Silent prune — **PASS**

| Claim | Evidence |
| --- | --- |
| Drops missing OR non-Teknik | `pruneHallPlacements` `hall.ts:379-391`: keeps only ids in `placeableItems` set (missing activity → not placeable; non-`techniques` → not placeable) |
| Comment lock | `:380-381` “Silent — no toast. Used on migrate / load / open.” |
| On migrate/load | `migrateHallFields` ends with `return pruneHallPlacements({…})` `:443-448`; `session.ts:101` `loadDraft` → `migrateHallFields(parsed)` |
| Also on item remove path | `session.ts:201` returns `pruneHallPlacements(…)` after block mutation |
| Hallöversikt open | `HallBoard.tsx:84-93` `useEffect` calls `pruneHallPlacements(session)` and `onChange`/`saveDraft` if changed — no toast/alert |
| No prune toast | `toast`/`showToast` exist only in `SessionBuilder.tsx` (save / block pick); HallBoard has no toast call |

### 3. Compact canvas chips — **PASS (code)** / visual size **PARTIAL→UI**

| Claim | Evidence |
| --- | --- |
| Anchor ~28% max-width | `App.css:1694-1698` `.hall-chip-anchor { max-width: 28%; }`; print MQ again `:2238-2239` |
| Canvas variant CSS | `.hall-chip--canvas` `:1716-1744` (compact padding/font); `.hall-chip--tray` keeps `min-height: 44px` `:1746-1748` |
| Item icon on canvas | `HallChip.tsx:91-95` `size={isCanvas ? 'item' : 'block'}` |
| Duration hidden on canvas | `HallChip.tsx:99-116` canvas branch shows only Erfaren meta; tray shows `{item.durationMinutes} min` |
| Rank + title | Rank span `:86-89`; title `:98`; a11y `{n}. {title}` `:49-53` |
| Erfaren on canvas | canvas branch `:100-105` uses `UI.hallExperiencedShort` (`blockMeta.ts:183` `'Erfaren'`) |
| Canvas wiring | `HallCanvas.tsx:172+` `className="hall-chip-anchor"` + `variant="canvas"` |

**PARTIAL:** “clearly smaller than Slice 10” is a visual judgment → UI smoke.

### 4. Empty no-Teknik — **PASS**

| Claim | Evidence |
| --- | --- |
| Strings present | `blockMeta.ts:171-174` (exact Swedish below) |
| Used | `HallBoard.tsx:78` `noStations = itemCount > 0 && placeableCount === 0`; render `:238-261` uses `UI.hallNoStationsTitle` / `Body` / `Cta` + `hallStationsOnlyHint` |
| Tray not full of non-Teknik | Empty state returns early (no tray list); normal path tray = `getUnplacedItems` = Teknik only |

### 5. ranks / flow / Golvklart unplaced = Teknik only — **PASS**

| Claim | Evidence |
| --- | --- |
| Ranks Teknik-placed only | `stationRanks` over `placeableItems` ∩ placements (`hall.ts:101-114`) |
| Flow Teknik-placed only | `flowSegments` same (`:131-156`) |
| Golvklart banner | `HallBoard.tsx:299-302` `hallUnplacedBannerText(unplaced.length)` where `unplaced = getUnplacedItems(session)` (Teknik only) |
| Header station count | `:315` `hallStationCountText(placeableCount)` |
| Banner copy | `blockMeta.ts:202-203` `{n} stationer ej placerade` / `1 station ej placerad` |

### 6. Passbyggaren still has all five blocks — **PASS**

| Claim | Evidence |
| --- | --- |
| Order | `blockMeta.ts:3-9` `BLOCK_ORDER` = gathering, warmup, techniques, strength, fun_and_games |
| Labels | `:19-24` Samling / Uppvärmning / Teknik / Styrka / Lek och spel |
| Empty session | `session.ts:24` `BLOCK_ORDER.map` creates five blocks |
| Builder UI | `SessionBuilder.tsx:273` `session.blocks.map`; `LibraryPanel.tsx:90` `BLOCK_ORDER.map`; `BlockCard.tsx` imports `BLOCK_ORDER` |

### 7. Footer exact Slice 11 — **PASS**

| Claim | Evidence |
| --- | --- |
| String | `blockMeta.ts:253` `footerSliceLabel: 'Träningsplaneraren · Slice 11'` |
| Render | `App.tsx:213-216` `<footer className="app-footer no-print">` → `{UI.footerSliceLabel}` |
| Dist | JS bundle contains exact string |

### 8. Scope — no new presets / CAD / styrka-as-stations — **PASS**

| Claim | Evidence |
| --- | --- |
| Same three presets | `hallPresets.ts:32-35` `HALL_PRESET_ORDER` = `standard-trupp`, `tavling-linjer`, `liten-hall` only |
| Ship out-of-scope | `SLICE11-SHIPPED.md:63-65` lists new presets / CAD / Styrka-as-stations / Netlify as not done |
| Placeable lock | Filter is `blockType === 'techniques'` only — strength/cirkel activities remain library items, not hall stations |
| Seed library count | Still **28** activity ids in `seedActivities.ts` (no library expansion this slice) |
| No CAD surface | No CAD module/files added under `src/` for this slice |

### Checklist crosswalk (code lean)

| Checklist # | Rule | CODE lean |
| --- | --- | --- |
| 1 | Teknik-only placeable | **PASS** |
| 2 | Prune non-Teknik | **PASS** |
| 3 | Compact canvas chips | **PASS (code)** / size **PARTIAL→UI** |
| 4 | Empty no-Teknik | **PASS** |
| 5 | Flow/numbers Teknik | **PASS** |
| 6 | Golvklart unplaced Teknik | **PASS** |
| 7 | Erfaren badge | **PASS** (`HallChip` canvas Erfaren short) |
| 8 | Passbyggaren intact | **PASS** |
| 9 | Footer Slice 11 | **PASS** |
| 10 | Scope | **PASS** |

**Overall CODE lean:** **PASS** (no code FAILs). UI smoke path (checklist §Smoke) remains separate / deferred.

---

## Exact Swedish strings found in code

### Empty no-Teknik (`blockMeta.ts:171-174`, used `HallBoard.tsx:254-257`)

- **hallNoStationsTitle:** `Inga Teknik-stationer ännu`
- **hallNoStationsBody:** `Lägg till övningar under Teknik i Passbyggaren — sedan kan du placera dem här.`
- **hallNoStationsCta:** `Tillbaka till Passbyggaren`

### Soft hint (`blockMeta.ts:169-170`)

- **hallStationsOnlyHint:** `Endast Teknik-stationer placeras på hallen. Samling, Uppvärmning, Styrka och Lek och spel planeras i Passbyggaren.`

### Footer (`blockMeta.ts:253`, `App.tsx:215`)

- **footerSliceLabel:** `Träningsplaneraren · Slice 11`

---

## Grep inventory (requested markers)

| Marker | Hits (src) |
| --- | --- |
| `footerSliceLabel` | `blockMeta.ts:253`; `App.tsx:215` |
| `placeableItems` / `isPlaceableItem` | `hall.ts:84+` wired into unplaced/placed/ranks/flow/upsert/prune |
| `pruneHallPlacements` | `hall.ts:383`; `migrateHallFields`; `session.ts` load + mutate; `HallBoard.tsx:86` open |
| `hall-chip--canvas` | `App.css:1717+`; class via `HallChip` `hall-chip--${variant}` |
| `28%` | `App.css:1698`, `:2239` on `.hall-chip-anchor` |
| `hallNoStations*` | `blockMeta.ts:171-174`; `HallBoard.tsx:254-257` |
| Footer Slice 11 | exact string in UI + dist JS |

---

## Files inspected

| Path | Role |
| --- | --- |
| `slice-11/verification-checklist.md` | Authority checklist |
| `app/SLICE11-SHIPPED.md` | Ship notes |
| `docs/hall-declutter.sv.md` | Copy / product lock |
| `src/lib/hall.ts` | Placeable filter, prune, ranks, flow, upsert |
| `src/lib/session.ts` | load migrate + prune on mutate |
| `src/components/HallChip.tsx` | Canvas vs tray chip |
| `src/components/HallBoard.tsx` | Empty state, prune-on-open, Golvklart banner, tray |
| `src/components/HallCanvas.tsx` | Placed chips + drop hint |
| `src/data/blockMeta.ts` | UI strings, BLOCK_ORDER, footer |
| `src/data/hallPresets.ts` | Preset inventory (scope) |
| `src/App.css` | 28% anchor + canvas/tray chip CSS |
| `src/App.tsx` | Footer render |
| `src/components/SessionBuilder.tsx` | Five-block builder (spot) |

---

## Deviations vs ship notes

- **None material found in code.** Ship notes claim matches implementation.
- Documented ship deviation retained: tip strings plain text (CoachTipStrip bolds “Golvklart”); Docs `**Golvklart**` markdown not stored in `UI` — not a checklist FAIL.
- **Not done (aligned with ship):** Netlify republish / Verifier ping / live URL — out of this code pack.

## Blockers

- **None for code verification.** Build exit 0; all locked rules have concrete code evidence.
- UI smoke (phone ~390px, place/reload prune visible, print preview) is **deferred** to a separate UI pack — not a code blocker.

---

## Summary for parent

- CODE lean per locked rules: **all PASS** (chip *visual* size vs Slice 10 → PARTIAL/UI).  
- `npm run build` exit **0**.  
- Evidence: `/workspace/gymnastics-planner/verifier/slice-11-evidence-code.md`
