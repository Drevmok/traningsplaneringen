# Slice 06 — Code evidence pack (Verifier)

**Date:** 2026-09-24 08:22 CEST (Europe/Stockholm)  
**Agent:** code verifier (executor subagent)  
**Authority:** `slice-06/verification-checklist.md` + `app/SLICE06-SHIPPED.md` + `slice-06/content/hall-presets-copy.sv.md`  
**Scope:** `npm run build`, types/libs/UI wiring inspection, Swedish string spot-check, regression spot-check — **not** full browser interaction  
**Product rewrite:** none (evidence only)

---

## Environment / build

| Check | Result | Evidence |
| --- | --- | --- |
| App path | `/workspace/gymnastics-planner/app` | — |
| `npm run build` | **PASS** (exit **0**) | `tsc -b && vite build` → vite v8.3.0; 39 modules; `dist/index.html` 0.46 kB; `index-BFV4T9BP.css` 19.03 kB; `index-B3sHJlkd.js` 284.58 kB; built in ~240 ms |
| Errors | none | clean stdout; `EXIT_CODE=0` |
| Footer | Slice 06 | `App.tsx:61` → `{UI.appName} · Slice 06` |
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
| Six zones incl. Mattberg + schematic caption | **PASS (code)** | `HallZoneId` includes `mattberg` (`types.ts:80-86`); all three presets define Mattberg + Mats (`hallPresets.ts:74-86,123-135,172-184`); canvas renders `preset.zones` + Mattberg SVG cue (`HallCanvas.tsx:78-113`); caption `UI.hallSchematicNote` (`HallCanvas.tsx:116`) |
| Snap apparatus / free open | **PASS (code) / PARTIAL (UI feel)** | `snapPlacement` snaps when `zone.snaps` + snap point; open/`!snaps` keeps exact clamp (`hall.ts:159-192`); wired via `upsertPlacement` (`:194-218`) |
| Phone Placera här same snap path | **PASS (code) / PARTIAL (UI)** | Shared `placeAt` → `upsertPlacement` (`HallBoard.tsx:55-65`); canvas click place-mode (`HallCanvas.tsx:56-61`) and DnD drop (`:45-54`) both call `onPlaceAt` |
| Three Swedish presets + picker | **PASS (code)** | `HALL_PRESET_ORDER` three ids (`hallPresets.ts:32-36`); select `aria-label={UI.hallLayout}` options from presets (`HallBoard.tsx:143-159`); labels Standard trupp / Tävling / linjer / Liten hall |
| Preset migrate placements (never dump tray) | **PASS (code)** | `applyPreset` remaps all placements 1:1; never clears array (`hall.ts:225-270`); switch via `handlePresetChange` → `persist(applyPreset(...))` (`HallBoard.tsx:67-71`) |
| Persist `hallTemplateId` + placements | **PASS (code)** | `applyPreset` / `upsertPlacement` set `hallTemplateId` via `normalizeTemplateId`; `persist` → `saveDraft`; key `gymnastics-planner-draft-v1` |
| Slice 05 `generic-trupp` migrate | **PASS (code)** | `LegacyHallTemplateId` (`types.ts:93-94`); `normalizeTemplateId` / `getPreset` / `migrateHallFields` alias → `standard-trupp` (`hall.ts:43-58,327-346`); `loadDraft` calls migrate (`session.ts:101`) |
| Tray / remove / back | **PASS (code)** | tray drop → `removePlacement` (`HallBoard.tsx:100-107`); chip remove; back `onBack` → builder (`App.tsx`); empty pass guard unchanged |
| Safety experienced warning | **PASS (code)** | Hall opens `ActivityDetail readOnly` (`HallBoard.tsx:235-240`); warning still rendered (`ActivityDetail.tsx:67-71`) |
| Scope guard (flow/print) | **N/A (OK)** | no flow-arrow / station-order / print-view implementation; must not FAIL |
| Regression 01–05 | **PASS (code spot-check)** | see Regression section |

**Code-side lean:** **PASS** — no FAIL candidates from static inspection. Snap feel, open free drop, preset remap visuals, migrate draft reload, and phone Placera här remain for UI verifier.

---

## Data / persistence (checklist)

| Item | Verdict | Citation |
| --- | --- | --- |
| `hallTemplateId` stored as preset id after switch + save | **PASS (code)** | `applyPreset` writes `hallTemplateId: templateId` (`hall.ts:266-269`); `persist` → `saveDraft` (`HallBoard.tsx:50-53,67-70`; `session.ts:90-93`) |
| Storage key remains `gymnastics-planner-draft-v1` | **PASS** | `session.ts:17` |
| `mattberg` accepted as `zoneId` | **PASS** | in `HallZoneId` (`types.ts:85`); `ZONE_PRIORITY` / `KNOWN_ZONES` (`hallPresets.ts:27`; `hall.ts:30`); sanitize accepts known zones (`hall.ts:310-313`) |
| `mats` still valid (not deleted) | **PASS** | `types.ts:86`; all three presets include mats zone; labels `Mattor` |
| Old `generic-trupp` aliases to `standard-trupp` | **PASS** | `normalizeTemplateId` (`hall.ts:53-58`); `migrateHallFields` (`:339-341`); load path (`session.ts:101`) |
| Preset switch does not empty `hallPlacements` | **PASS** | `applyPreset` loops every placement into `remapped` (`hall.ts:234-264`); length preserved; never `[]` on switch |
| Reload / Fortsätt restores preset + placements | **PASS (code) / PARTIAL (UI)** | `loadDraft` → `migrateHallFields` keeps placements + normalized template; Home continue uses `hasDraft`/`loadDraft` |
| `removeItem` still prunes; template replace still clears | **PASS** | `removeItem` → `pruneHallPlacements` (`session.ts:187-201`); `cloneTemplate` → `clearHallPlacements` (`:72-83`) |
| Coordinates remain in `[0, 1]` after snap | **PASS (code)** | `clamp01` (`hall.ts:38-41`); used in snap, offset, sanitize, keep-xy remap branch |

### Types inspection

| Symbol | Expected | Found | Verdict |
| --- | --- | --- | --- |
| `HallZoneId` | includes `mattberg` | `open \| trampett \| tumbling \| vault \| mattberg \| mats` (`types.ts:80-86`) | **PASS** |
| `HallTemplateId` | `standard-trupp \| tavling-linjer \| liten-hall` | exact (`types.ts:88-91`) | **PASS** |
| `LegacyHallTemplateId` | `generic-trupp` | exact (`types.ts:93-94`) | **PASS** |
| Public write of legacy id | do not write anew | blank/template use `DEFAULT_HALL_TEMPLATE = 'standard-trupp'` (`hall.ts:19`; `session.ts:41,80`) | **PASS** |

### `hallPresets.ts` / `hall.ts` inspection

| Behavior | Verdict | Citation |
| --- | --- | --- |
| Three presets with distinct layouts | **PASS** | `HALL_PRESETS` three keys; different bboxes (`hallPresets.ts:39-187`) |
| Apparatus `snaps: true` + snap points | **PASS** | trampett/tumbling/vault/mattberg/mats all `snaps: true` with `snap` |
| Open `snaps: false` (free) | **PASS** | open zones `snaps: false`, no snap (`hallPresets.ts:46-51` etc.) |
| `snapPlacement` apparatus → slot + multi-chip offset | **PASS** | `OFFSET_X=0.035`, `OFFSET_Y=0.04`; `(i%3)*OFFSET_X`, `floor(i/3)*OFFSET_Y` (`hall.ts:35-36,143-152,184-191`) |
| `snapPlacement` open → free exact clamp | **PASS** | early return `{ x: cx, y: cy, zoneId }` when `!zone.snaps \|\| zoneId === 'open'` (`hall.ts:179-182`) |
| Outside zones → free, no zoneId | **PASS** | `!zoneId` return without zoneId (`hall.ts:170-172`) |
| `applyPreset` remap by zoneId→snap; else keep x,y + re-resolve | **PASS** | (`hall.ts:240-259`) |
| Never dump to tray on preset switch | **PASS** | remapped always includes every input placement |
| Migrate alias load-only; no auto-snap on load | **PASS** | `migrateHallFields` sanitize + normalize only (`hall.ts:327-346`) |
| Priority hit-test apparatus before open | **PASS** | `ZONE_PRIORITY` ends with `open` (`hallPresets.ts:23-30`) |

---

## Product / UX — code-verifiable items

| Item | Verdict | Citation |
| --- | --- | --- |
| Hallöversikt opens from Passbyggaren (≥1 övning) | **PASS (code)** | CTA disabled when `countSessionItems < 1` (`SessionBuilder.tsx:208-217`); `onOpenHall` → `view === 'hall'` (`App.tsx:45-57`) |
| Six zone labels on Standard trupp | **PASS (code)** | `hallPresets.ts:45-86` labels Öppen yta, Trampett, Tumbling, Satsbräda, Mattberg, Mattor; canvas maps `zone.label` |
| Caption schematic / not exact measurements | **PASS** | `UI.hallSchematicNote` = `Schematisk hall — inte exakt mått` (`blockMeta.ts:165`; `HallCanvas.tsx:116`) |
| Hallayout picker visible | **PASS (code)** | `HallBoard.tsx:143-162` label + select + migrate note + coach tip |
| Three preset labels Swedish as locked | **PASS** | preset labels (`hallPresets.ts:42,91,140`) + UI keys (`blockMeta.ts:175-178`) match Docs pack |
| Switching preset redraws zone layout | **PASS (code) / PARTIAL (UI)** | `getPreset(session.hallTemplateId)` drives canvas zones (`HallCanvas.tsx:43,78-113`); switch updates session template |
| Drop on Trampett snaps | **PASS (code) / PARTIAL (UI)** | snap path documented above |
| Drop on Öppen yta does not jump to center | **PASS (code) / PARTIAL (UI)** | open free branch |
| Move open → tumbling snaps on drop | **PASS (code) / PARTIAL (UI)** | same `upsertPlacement` on every drop |
| Multiple chips distinguishable (offset) | **PASS (code) / PARTIAL (UI)** | multi-chip offset in `offsetFromSlot` |
| Remove to tray after snap | **PASS (code)** | `removePlacement` / tray drop / chip remove |
| Experienced badge + detail warning | **PASS (code)** | `HallChip` experienced; `ActivityDetail` warning |
| Swedish chrome (no leftover English picker/zones) | **PASS (spot-check)** | see Swedish strings section |

---

## Phone (code-verifiable)

| Item | Verdict | Citation |
| --- | --- | --- |
| ~390px: preset picker usable (≥44px) | **PASS (code) / PARTIAL (UI)** | `.hall-preset-select { min-height: 44px }` (`App.css:1191-1192`); media query repeats (`:1554-1560`); width 100% on narrow |
| Canvas + tray reachable | **PASS (code) / PARTIAL (UI)** | stacked `.hall-layout` phone CSS (Slice 05–06 hall section `App.css`) |
| Placera här into apparatus → snapped | **PASS (code) / PARTIAL (UI)** | place-mode canvas click → `placeAt` → `snapPlacement` |
| Placera här into öppen yta → free | **PASS (code) / PARTIAL (UI)** | same path; open `snaps: false` |

---

## Technical / scope (checklist)

| Item | Verdict | Citation |
| --- | --- | --- |
| No CDN hall art | **PASS** | Mattberg cue is inline SVG (`HallCanvas.tsx:91-108`); zones CSS-local; `index.html` only local `/src/main.tsx`; `rg` no cdn/unpkg/jsdelivr |
| `npm run build` succeeds | **PASS** | exit 0 |
| No flow arrows / station order / print required | **N/A (OK)** | no such UI; SHIPPED gaps defer to Slice 07 |
| No keyboard full-drag required | **N/A (OK)** | not implemented; out of scope |
| Optional toast still optional | **N/A (OK)** | `UI.hallPlacementSaved` exists (`blockMeta.ts:173`) but no toast wiring required |

---

## Swedish strings vs Docs pack (spot-check)

| Key / label | Docs pack | Code | Match |
| --- | --- | --- | --- |
| `hallLayout` | Hallayout | `blockMeta.ts:175` | **PASS** |
| `hallPresetStandard` | Standard trupp | `:176` (+ `HALL_PRESETS['standard-trupp'].label`) | **PASS** |
| `hallPresetTavling` | Tävling / linjer | `:177` (+ preset label) | **PASS** |
| `hallPresetLiten` | Liten hall | `:178` (+ preset label) | **PASS** |
| `hallPresetMigrateNote` | Placerade övningar flyttas… | `:179-180` | **PASS** |
| `hallSnapHint` | Släpp på en zon… | `:181-182` | **PASS** |
| `hallPresetCoachTip` | Välj den hallayout… | `:183-184` | **PASS** |
| Zone labels | Öppen yta… Mattberg, Mattor | `hallPresets.ts` + `HALL_ZONE_LABELS` (`hall.ts:21-28`) | **PASS** |
| Caption | Schematisk hall — inte exakt mått | `blockMeta.ts:165` | **PASS** |
| `hallPlaceHere` | Placera här | `blockMeta.ts:168` | **PASS** |

Note: picker options render `HALL_PRESETS[id].label` (not `UI.hallPreset*` keys), but string values are identical to Docs pack.

---

## Regression (Slice 01–05) spot-check

| Item | Verdict | Citation |
| --- | --- | --- |
| Home → Nytt pass / mall / fortsätt | **PASS** | `Home.tsx` `UI.newSession` / continue; `App.tsx` blank/template/continue handlers |
| Five blocks + totals + soft mismatch | **PASS** | `BLOCK_ORDER` five types (`blockMeta.ts:3-8`); `MismatchBanner` + `mismatchMessage`; totals via `computeTotal` |
| 28 drills + VisualIcon + experienced pair | **PASS** | 28 activity `id:` lines in `seedActivities.ts`; 2× `experiencedCoachOnly: true` (lines 263, 320); `VisualIcon` used in cards/detail/chips |
| Slice 05: tray default for new items; CTA disable empty | **PASS** | new items absent from `hallPlacements` → unplaced; CTA `disabled={countSessionItems < 1}` |
| Export stub “Kommer snart” | **PASS** | `SessionBuilder.tsx:224-238` `UI.comingSoon` |
| Draft key unchanged | **PASS** | still `gymnastics-planner-draft-v1` |

---

## FAIL candidates

**None on code side.**

Items that could still FAIL at UI smoke (not code defects found):

1. **Snap feel** — chip may not look “settled” if CSS chip anchor vs snap point visually sits on zone edge.  
2. **Open free** — confirm drop does not magnetically center in Öppen yta.  
3. **Preset remap** — confirm chips stay on matching zones and none vanish to tray.  
4. **Migrate draft** — inject `hallTemplateId: "generic-trupp"` and confirm Standard trupp + placements kept.  
5. **Phone Placera här snap** — ~390px apparatus tap must snap same as desktop.

---

## Suggested UI smoke follow-ups

Follow checklist smoke path steps 1–10 in `verification-checklist.md` (especially 3–5, 8–9). Code wiring for shared snap + remap + migrate is in place; verdict on feel/reload is UI-only.

---

## Code-side verdict

**PASS (code)** — build green; types/presets/snap/applyPreset/migrate/picker/canvas/storage/Swedish strings/regression spot-checks all green. No code FAIL candidates. UI verifier must still confirm snap feel, open free, preset remap, draft migrate, and phone Placera här.
