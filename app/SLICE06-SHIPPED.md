# Slice 06 — SHIPPED

**Date:** 2026-09-24  
**App:** Träningsplaneraren (`/workspace/gymnastics-planner/app`)  
**Pack:** `slice-06/` (+ locked copy `slice-06/content/hall-presets-copy.sv.md`, mirror `docs/hall-presets-copy.sv.md`)

## How to run

```bash
cd /workspace/gymnastics-planner/app
npm install   # if needed
npm run dev   # http://localhost:5173
npm run build # production check — green
```

## Features shipped

1. **Richer zones (6):** Öppen yta, Trampett, Tumbling, Satsbräda, **Mattberg**, Mattor. Mattberg sits beside Mattor with a soft stacked/foam SVG cue (no CDN). Caption remains **Schematisk hall — inte exakt mått**.
2. **Snap-to-zone:** Apparatus drops (`trampett` / `tumbling` / `vault` / `mattberg` / `mats`) snap chip center to the zone snap slot + multi-chip offset (`~0.035` x / `~0.04` y). **Öppen yta stays free** (exact clamp). Outside zones → free place, `zoneId` undefined.
3. **Shared snap helper:** `upsertPlacement` → `snapPlacement` for both mouse DnD and phone **Placera här** (same path).
4. **Three hall presets:** Standard trupp / Tävling / linjer / Liten hall (`standard-trupp` | `tavling-linjer` | `liten-hall`). Default = `standard-trupp`.
5. **Hallayout picker** in hall header (`aria-label="Hallayout"`), ≥44px on phone; muted migrate note + short coach tip under picker; snap hint under tray help.
6. **Preset switch:** `applyPreset` remaps by `zoneId`→snap when zone exists & snaps; else keep x,y + re-resolve. **Never** dumps chips to tray. Persists via `saveDraft`.
7. **Migrate:** `generic-trupp` → `standard-trupp` on load only; six zone ids accepted; **no** auto-snap on load. Storage key unchanged: `gymnastics-planner-draft-v1`.
8. **Safety / tray / back:** Experienced badge + detail warning, tray remove, empty-pass guard unchanged from Slice 05.

## Locked Docs strings used

| Key | Swedish |
| --- | --- |
| `hallLayout` | Hallayout |
| `hallPresetStandard` | Standard trupp |
| `hallPresetTavling` | Tävling / linjer |
| `hallPresetLiten` | Liten hall |
| `hallPresetMigrateNote` | Placerade övningar flyttas till samma zon i den nya layouten när det går. |
| `hallSnapHint` | Släpp på en zon för att fästa övningen där. På öppen yta kan du placera fritt. |
| `hallPresetCoachTip` | Välj den hallayout som liknar er hall mest. Övningar på trampett, tumbling och liknande fäster i zonen; på öppen yta placerar du fritt. |
| Zone labels | Öppen yta, Trampett, Tumbling, Satsbräda, Mattberg, Mattor |
| Caption | Schematisk hall — inte exakt mått |

## Data / migrate notes

- `HallTemplateId` public union = three presets; `LegacyHallTemplateId = 'generic-trupp'` load-only alias.
- `DEFAULT_HALL_TEMPLATE = 'standard-trupp'` (blank session + template replace clear placements as before).
- Multi-chip offset: `(i % 3) * 0.035` x, `floor(i/3) * 0.04` y; clamp preferably inside zone bbox.
- `session.ts` continues to import `DEFAULT_HALL_TEMPLATE` / migrate / prune — no hardcoded `generic-trupp`.

## Files changed / added

**Added**

- `src/data/hallPresets.ts` — `HALL_PRESETS`, zone defs, priority
- `SLICE06-SHIPPED.md`

**Updated**

- `src/types.ts` — `mattberg`; three template ids; legacy alias type
- `src/lib/hall.ts` — presets, `getPreset`, `snapPlacement`, `applyPreset`, migrate alias
- `src/data/blockMeta.ts` — Slice 06 UI keys from Docs pack
- `src/components/HallBoard.tsx` — Hallayout select + hints; shared `placeAt`
- `src/components/HallCanvas.tsx` — draw active preset zones + Mattberg cue
- `src/App.css` — preset picker, Mattberg, phone ≥44px select
- `src/App.tsx` — footer Slice 06

## Gaps / deferred (not FAIL)

- Soft zone highlight during drag (nice-to-have)
- Snap ease animation (hard jump OK for PASS)
- Flow arrows / station order / print (Slice 07)
- Keyboard full-drag; optional “Placering sparad” toast

## Confirmations

- DnD + Placera här share `snapPlacement` via `upsertPlacement`
- `generic-trupp` migrates to `standard-trupp`
- Mattberg present beside mats on all three presets
- Preset switch never dumps chips to tray
- `npm run build` green

## Regression preserved

Slice 01–05: Passbyggaren, totals, soft mismatch, VisualIcon, 28 drills, experienced warning, Hallöversikt foundation, draft key.
