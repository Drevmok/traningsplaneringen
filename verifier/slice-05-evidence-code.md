# Slice 05 — Code evidence pack (Verifier)

**Date:** 2026-09-24 07:43 CEST (Europe/Stockholm)  
**Agent:** code verifier (executor subagent)  
**Authority:** `slice-05/verification-checklist.md` + `app/SLICE05-SHIPPED.md` + `slice-05/content/hall-oversikt-copy.sv.md`  
**Scope:** `npm run build`, types/libs/UI wiring inspection, Swedish string spot-check, regression spot-check — **not** full browser interaction  
**Product rewrite:** none (evidence only)

---

## Environment / build

| Check | Result | Evidence |
| --- | --- | --- |
| App path | `/workspace/gymnastics-planner/app` | — |
| `npm run build` | **PASS** (exit **0**) | `tsc -b && vite build` → vite v8.3.0; 38 modules; `dist/index.html` 0.46 kB; `index-C3f8bvpc.css` 18.31 kB; `index-pzUiH4iV.js` 280.21 kB; built in ~196 ms |
| Errors | none | clean stdout; `EXIT_CODE=0` |
| Footer | Slice 05 | `App.tsx:61` → `{UI.appName} · Slice 05` |
| `index.html` lang | `sv` | `index.html:2` |

---

## Legend

- **PASS** — satisfied from code with concrete evidence  
- **PARTIAL** — present in code; needs UI/browser confirmation  
- **FAIL** — clear violation (none found on code side)  
- **N/A** — explicit non-fail / out of scope / deferred

---

## Locked rules (summary)

| Locked rule | Verdict | Evidence |
| --- | --- | --- |
| CTA Hallöversikt enable/disable + Swedish hint | **PASS (code)** | `SessionBuilder.tsx:205-223` — disabled when `countSessionItems < 1`; `title` + `aria-describedby` → `UI.hallCtaDisabled` |
| Entry/back → Passbyggaren (not Home) | **PASS (code)** | `App.tsx:45-50` hall view; `onBack={() => setView('builder')}`; `HallBoard` uses `UI.hallBack` / empty uses `UI.hallBackShort` |
| Schematic five labels + caption | **PASS (code)** | `hall.ts:11-17` labels; `HallCanvas.tsx:89-108` renders all five + `UI.hallSchematicNote` |
| Tray default (new = unplaced) | **PASS (code)** | blank/template start `hallPlacements: []`; `getUnplacedItems` = items without placement |
| Place / move / remove | **PASS (code)** | DnD tray↔canvas (`HallCanvas` drop, `HallBoard` tray drop); `showRemove` × → `removePlacement`; reposition via drop |
| Persist `hallPlacements` | **PASS (code)** | `HallBoard.persist` → `saveDraft`; key `gymnastics-planner-draft-v1` |
| Orphan prune | **PASS (code)** | `removeItem` → `pruneHallPlacements`; `migrateHallFields` also prunes |
| Chips title + tint + VisualIcon + Erfaren | **PASS (code)** | `HallChip.tsx` |
| Safety warning from hall path | **PASS (code)** | `HallBoard` opens `ActivityDetail readOnly`; warning still rendered when `experiencedCoachOnly` |
| Phone usable + alternate place | **PASS (code) / PARTIAL (UI)** | CSS ≥44px + stacked layout ≤768; tap tray → place-mode → canvas click `Placera här` |
| Scope guard (no snap/flow/print) | **N/A (OK)** | absences confirmed; must not FAIL |
| Regression 01–04 | **PASS (code spot-check)** | 28 drills, VisualIcon, experienced ids, soft mismatch, export stub |

**Code-side lean:** **PASS** — no FAIL candidates from static inspection. Runtime place/persist/phone remain for UI verifier.

---

## Data / persistence (checklist)

| Item | Verdict | Citation |
| --- | --- | --- |
| Draft JSON includes `hallPlacements` after place + save | **PASS (code)** | `HallBoard.tsx:47-50` `persist` → `onChange` + `saveDraft`; `upsertPlacement` writes array (`hall.ts:114-121`); `saveDraft` (`session.ts:90-93`) serializes full session |
| Coordinates numbers in `[0, 1]` | **PASS (code)** | `clamp01` `hall.ts:42-45`; applied in `upsertPlacement` (`:102-103`) and `sanitizePlacement` (`:167-168`) |
| Keyed by `sessionItemId` (not only activityId) | **PASS** | `HallPlacement.sessionItemId` `types.ts:89-91`; chips set DnD data to `item.id` (`HallChip.tsx:57-58`) |
| Old draft without hall fields loads; all unplaced | **PASS (code)** | `loadDraft` → `migrateHallFields` (`session.ts:101`); missing/invalid → `[]` (`hall.ts:175-194`); no throw in try/catch |
| Template replace clears placements | **PASS** | `cloneTemplate` wraps `clearHallPlacements` (`session.ts:72-83`); new item ids via `uid('item')` |
| `removeItem` prunes placement | **PASS** | `session.ts:187-201` → `pruneHallPlacements` |
| Optional `zoneId` only known ids | **PASS** | Union `open\|trampett\|tumbling\|vault\|mats` (`types.ts:80-85`); `KNOWN_ZONES` filter on upsert/sanitize (`hall.ts:40,104-107,161-164`) |
| Storage key `gymnastics-planner-draft-v1` | **PASS** | `session.ts:17` |
| `hallTemplateId` / migrate default | **PASS** | type `'generic-trupp'` (`types.ts:87`); `DEFAULT_HALL_TEMPLATE` (`hall.ts:9`); blank session sets both (`session.ts:41-42`) |
| `moveItemToBlock` keeps `SessionItem.id` | **PASS** | `session.ts:177-180` comment + spreads `moving` without new id |

---

## Technical / scope (checklist)

| Item | Verdict | Citation |
| --- | --- | --- |
| No snap physics required | **N/A (OK)** | No snap/magnetic code; soft `zoneId` only (`resolveZoneId`); SHIPPED gaps defer snap to Slice 06 |
| No flow arrows / station order UI | **N/A (OK)** | `rg` no flow-arrow / station-order UI in `src/` |
| No print / floor-ready view | **N/A (OK)** | no print-view / floor-ready implementation |
| No CDN dependency for hall art | **PASS** | Hall = local CSS zones (`.hall-floor` / `.hall-zone-*` in `App.css`); no hall image URL; `index.html` has no CDN scripts; only SVG xmlns refs |
| `npm run build` succeeds | **PASS** | exit 0 (see build table) |
| Swedish UI strings (no leftover English hall chrome) | **PASS (spot-check)** | All hall UI keys in `blockMeta.ts:156-173` match locked copy; no English hall chrome strings in components |

---

## Product / UX (code-verifiable)

| Item | Verdict | Citation |
| --- | --- | --- |
| CTA **Hallöversikt** visible | **PASS** | `SessionBuilder.tsx:205-218` `{UI.hallOverview}` |
| CTA disabled on empty + Swedish explanation | **PASS** | `disabled={count < 1}`; `title`/`sr-only` = `Lägg till minst en övning först` |
| CTA enabled after ≥1 övning | **PASS (code)** | same gate inverted |
| Hall header shows pass title / Hallöversikt | **PASS** | `HallBoard.tsx:129-134` title + `session.title` + count label |
| Back: Tillbaka till Passbyggaren / Till Passbyggaren | **PASS** | header `UI.hallBack` (`:126`); empty button `UI.hallBackShort` (`:115`) |
| Five zone labels | **PASS** | `HALL_ZONE_LABELS` + canvas map |
| Caption schematic / not exact | **PASS** | `UI.hallSchematicNote` = `Schematisk hall — inte exakt mått` |
| Unplaced tray lists all for fresh pass | **PASS (code)** | empty placements → all items in tray |
| Drag (or alternate) places chip | **PASS (code)** | HTML5 DnD + phone place-mode |
| Reposition updates location | **PASS (code)** | canvas drop calls `placeAt` → `upsertPlacement` |
| Remove from hall → tray (item stays on pass) | **PASS (code)** | `removePlacement` only; session items untouched; tray drop also removes placement |
| Empty tray message when all placed | **PASS** | `UI.hallAllPlaced` `HallBoard.tsx:185-186` |
| Empty-pass guard | **PASS** | `itemCount === 0` branch `HallBoard.tsx:103-119` |
| Missing activity **Övning saknas** | **PASS** | `HallChip.tsx:35` → `UI.hallMissingActivity` |
| Experienced badge on chips | **PASS** | compact `UI.hallExperiencedShort` = `Erfaren` (`HallChip.tsx:84-87`) |
| Chip colors match block tokens | **PASS** | `BLOCK_COLORS` amber/sky/violet/rose/green (`blockMeta.ts:27-61`); applied in `HallChip.tsx:37-54` |

Phone items (~390px, ≥44px, Placera här): **PARTIAL** — CSS `App.css:1454-1501` stacks layout, horizontal tray scroll, `min-width/height: 44px` on back/chips/remove; place-mode wired in `HallBoard.tsx:71-77,179-201` + `HallCanvas.tsx:67-72`. Needs browser confirm at ~390px.

---

## Swedish string spot-check vs `hall-oversikt-copy.sv.md`

| Locked key / copy | Code (`UI` / label) | Match |
| --- | --- | --- |
| Hallöversikt | `hallOverview` | yes `blockMeta.ts:157` |
| Lägg till minst en övning först | `hallCtaDisabled` | yes `:158` |
| Tillbaka till Passbyggaren | `hallBack` | yes `:159` |
| Till Passbyggaren | `hallBackShort` | yes `:160` |
| Öppen yta / Trampett / Tumbling / Satsbräda / Mattor | `HALL_ZONE_LABELS` | yes `hall.ts:11-17` |
| Schematisk hall — inte exakt mått | `hallSchematicNote` | yes `:165` |
| Ej placerade | `hallUnplaced` | yes `:161` |
| Alla övningar är placerade i hallen. | `hallAllPlaced` | yes `:162` |
| Dra övningar till hallen. … | `hallDragHint` | yes `:164` |
| Ta bort från hall | `hallRemove` | yes `:166` |
| Placera här | `hallPlaceHere` | yes `:168` |
| Inga övningar i passet ännu. | `hallEmptyPass` | yes `:163` |
| Dra en övning hit | `hallDropHint` | yes `:169` |
| Övning saknas | `hallMissingActivity` | yes `:167` |
| Erfaren / Erfaren ledare | `hallExperiencedShort` / `experiencedCoach` | yes `:172`, `:152` |
| Coach tip paragraph | `hallCoachTip` | yes `:170-171` |
| `{n} övningar` / `1 övning` | `activityCountLabel` | yes `HallBoard.tsx:24-26` |
| Placering sparad | `hallPlacementSaved` defined only | **deferred** (SHIPPED: silent auto-save; not FAIL) |

---

## UI wiring detail

### App view model
- `View = 'home' | 'builder' | 'hall'` — `App.tsx:14`
- Hall: `<HallBoard session onChange={setSession} onBack={() => setView('builder')} />` — `:45-50`
- Builder: `onOpenHall={() => setView('hall')}` — `:57`

### Hall components
- **HallBoard** — tray, empty guard, persist, place-mode, detail `readOnly`
- **HallCanvas** — zone schematic, DnD drop, place-mode click, placed chip anchors at `%` of normalized x/y
- **HallChip** — VisualIcon size `block`, title, duration, Erfaren badge, optional remove

### ActivityDetail safety
- `readOnly?: boolean` — hides add actions (`ActivityDetail.tsx:87`)
- Experienced `role="alert"` block **unconditional** on flag (`:67-72`) — not gated by `readOnly`
- Hall opens with `readOnly` (`HallBoard.tsx:209-214`)

### Phone alternate path
- Narrow MQ `max-width: 768px` (`HallBoard.tsx:40`)
- Unplaced chip tap toggles `placeModeItemId`; canvas click → `placeAt`
- Hint/label `UI.hallPlaceHere` while active

---

## Regression spot-check (Slices 01–04)

| Check | Verdict | Evidence |
| --- | --- | --- |
| Home → Nytt / mall / fortsätt | **PASS (code)** | `Home.tsx` + `App.goNew/goTemplate/goContinue` |
| Five blocks locked order + Swedish names | **PASS** | `BLOCK_ORDER` + `BLOCK_LABELS` Samling/Uppvärmning/Teknik/Styrka/Lek och spel |
| Total = sum of item durations | **PASS** | `computeTotal` `session.ts:46-51` |
| Soft mismatch banner on builder | **PASS** | `MismatchBanner` via `BlockCard`; set in `SessionBuilder` on cross-block add/move |
| 28 drills + VisualIcon | **PASS** | 28 activity `id:`s in `seedActivities.ts`; `VisualIcon` still used in `ActivityCard` / `HallChip` / `ActivityDetail` |
| Experienced warning path | **PASS** | `tech-rondat-flickis`, `tech-salto-fran-hojd` still `experiencedCoachOnly: true`; warning in detail |
| Export stub "Kommer snart" | **PASS** | `UI.comingSoon` + disabled export button `SessionBuilder.tsx:224-239` |

---

## FAIL candidates

**None from code inspection.**

Watch items for UI verifier (not code FAILs):

1. Persist round-trip after reload / Fortsätt senaste pass (localStorage live check).  
2. ~390px: canvas scroll + tray reachable; place via Placera här.  
3. Drag-back to tray and × remove feel.  
4. Experienced chip detail from hall still shows alert visually.  
5. Ghost chip after remove item in builder then reopen hall.

---

## Gaps / notes (non-blocking)

- Optional toast `Placering sparad` defined (`blockMeta.ts:173`) but unused — SHIPPED deferral.  
- No keyboard full drag — mouse DnD + phone alternate (SHIPPED).  
- Builder `removeItem` / edits do not auto-`saveDraft` (hall placements do); prune is in-memory; orphan prune also on `loadDraft` migrate.  
- `clientToNormalized` may briefly yield values outside [0,1] before `clamp01` in upsert — final stored coords clamped.  
- Snap / flow arrows / print / club layouts / export — out of scope; absence OK.

---

## Files inspected

- `src/types.ts`, `src/lib/hall.ts`, `src/lib/session.ts`
- `src/App.tsx`, `src/App.css` (hall section)
- `src/components/{SessionBuilder,HallBoard,HallCanvas,HallChip,ActivityDetail,Home}.tsx`
- `src/data/{blockMeta,seedActivities}.ts`
- `index.html`, `SLICE05-SHIPPED.md`, checklist + copy pack

