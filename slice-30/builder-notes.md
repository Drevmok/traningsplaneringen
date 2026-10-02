# Slice 30 — Builder notes (DRAFT · build only after lock + Docs)

Min bar per `backlog/PSTACK-OPS.md`: honour locked A–F, `npm run build` green, `node --test` green, one real UI path driven, ship notes in `app/SLICE30-SHIPPED.md`.

## Exact files

| File | Change |
|---|---|
| `app/src/types.ts` | Add `ActivitySource { url: string; creator: string; title?: string; startSeconds?: number }`; `Activity.source?: ActivitySource` |
| `app/src/lib/source.ts` **(new)** | `sanitizeSource(raw)` (https only, ≤300, creator ≤80, title ≤120, seconds 0–86400) · `formatSourceTime(sec)` → `m:ss` / `h:mm:ss` |
| `app/src/lib/ownActivities.ts` | `MAX_OWN = 100` (export it). `asActivity` + `build` keep `defaultStationEquipment` (Teknik only, via `sanitizeStationEquipment`), `tags` (≤8, ≤24, lower, dedup, +`egen`), `difficulty`, `progressionOf`, `regressionOf`, `needsCoachReview`, `experiencedCoachOnly`, `source`. `OwnDraft` gains `equipment: StationEquipmentSlot[]`. `saveOwnActivity(draft, existingId)` merges hidden fields from the existing drill and sets `needsCoachReview: false`. New `markOwnReviewed(id)`. New `importOwnActivities(list, mode)` (single write). `ShareOwn` + `activityToShareOwn` carry the new fields (all optional → old links still parse). Keep `parseHowLines` / 4-step rule |
| `app/src/lib/ownImport.ts` **(new)** | `parseExerciseFile(text)` → `{ ok:false, reason:'bad'|'newer'|'empty'|'isPass' } \| { ok:true, batchNote?, rows: ImportRow[] }`. Row = sanitized `Activity` + `state` (`new`/`sameName`/`exists`/`invalid`/`noRoom`) + `notes[]` + default choice. Rules = `slice-30/content/import-schema.md`. `isExerciseFile(text)` for Home. `applyImport(rows, choices)` → calls `importOwnActivities` |
| `app/src/lib/ownImport.test.ts` **(new)** | Load both fixtures from `slice-30/content/`; assert AC 14, 19–26 |
| `app/src/lib/ownActivities.test.ts` | Field round trip (AC 7–8), cap 100 (AC 11), reviewed flag (AC 28) |
| `app/src/lib/sharePass.test.ts` | Encode/decode keeps `source` + redskap on own drills; old token without them still decodes (AC 6, 39) |
| `app/src/data/equipmentPieces.ts` | Append 5 pieces + `EQUIPMENT_ICON` entries (see `content/redskap-library.md`) |
| `app/src/components/equipmentMark.tsx` | `EquipmentKind` + `wedge · block · beam · bar · hoop`; `EQUIPMENT_KIND`, `EQUIPMENT_ROW_WIDTH`, `EquipmentMark` cases, `ICON_FRAME` |
| `app/src/components/StationSketch.tsx` | `order` list + caps per redskap-library.md |
| `app/src/lib/hallSuggest.ts` | `PIECE_ZONE` order per redskap-library.md |
| `app/src/lib/hallSuggest.test.ts` | AC 33 cases |
| `app/src/lib/ownedEquipment.ts` | Seen-ids migration (`gymnastics-planner-owned-equipment-seen-v1`) — AC 35 |
| `app/src/components/OwnImportSheet.tsx` **(new)** | File input + paste + Läs in → preview rows (title, block, minutes, state chip, notes, Ta med/Hoppa över/Ersätt) → **Importera {n} övningar**. Modal family like `OwnActivityForm` (`useBodyScrollLock`) |
| `app/src/components/OwnActivityForm.tsx` | Redskap field (Teknik only): selected chips with `EquipmentIcon` + **Välj redskap** → piece grid with counts (reuse the grid/stepper from `StationComposeSheet`; extract `EquipmentPicker.tsx` if cleaner). Pass hidden fields through on edit |
| `app/src/components/LibraryPanel.tsx` | **Importera övningar** button beside **Ny egen övning**; review badge on own cards; prop `onImportOwn` |
| `app/src/components/ActivityCard.tsx` | Review badge when `own && needsCoachReview` |
| `app/src/components/ActivityDetail.tsx` | Review badge + hint + **Markera som granskad** (prop `onMarkReviewed`); Källa line; Bygger på / Lättare variant av (resolve via `getActivityById`) |
| `app/src/components/ActivityTip.tsx` | Källa line at the end of the info panel (quiet, small) |
| `app/src/components/SessionBuilder.tsx` | Own state: open `OwnImportSheet`, refresh list after import / reviewed, toast |
| `app/src/components/Home.tsx` (`takeTransfer`, line ~40) | Exercise file pasted/picked in Hämta ett pass → `importIsExercises` message; draft untouched |
| `app/src/data/blockMeta.ts` | All keys from `content/microcopy.sv.md` (Docs-final); `ownFull` → 100; footer → `Slice 30` |
| `app/src/App.css` / `export.css` | `.review-badge` (quiet, same family as `.own-badge`), `.source-line`, import sheet rows |
| `app/SLICE30-SHIPPED.md` **(new)** | Ship notes, deviations |

**Do not touch:** `seedActivities.ts` content (no new seeds this slice; type allows `source`), `activityTips.ts` `MAX_FLOOR_STEPS`, `hall.ts` placeable rules, hall presets/zones, wizard paths, `createBlankSession`, `cloneTemplate`.

## Implementation notes

1. **One sanitizer.** `asActivity` (storage + share) and the importer must share the same field sanitizers so storage, share links and import can never disagree.
2. **Links resolve at render.** Keep stored ids; hide the line when `getActivityById` misses (drill deleted). Importer only drops links that cannot resolve at import time.
3. **Replace keeps id.** `Ersätt` overwrites in place → passes/mallar referencing the id show the new text.
4. **Tags matter.** `zoneFromTags` (hallSuggest) and `mapActivityToZone` read `trampett`/`vault`/`floor`; keep tags verbatim (lower-case) so imported drills auto-place.
5. **Badge scope.** `own === true && needsCoachReview === true`. Seeds with the flag stay badge-free.
6. **Source link safety.** Render only sanitized `https://` URLs; `target="_blank" rel="noopener noreferrer"`. No fetch, no oEmbed, no thumbnails.
7. **Share size.** Own drills now carry more fields; the existing `exportQrLong` fallback covers long links — do not shorten fields to fit QR.
8. **Paste box.** Accept raw JSON (trim, allow a fenced ```json block from chat by stripping the fence). Compressed token = nice-later.
