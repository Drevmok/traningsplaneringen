# Slice 19 — screen spec (DRAFT)

**Status:** **DRAFT — awaiting Christoffer A–F lock.** Behavior below follows Planner **recommendations**; Builder must not ship until APPROVED.

## Mental model (bulk accept — new chrome; persist semantics unchanged)

```
Hallöversikt (edit, not Golvklart)
   └─ secondary CTA Använd alla förslag
         enabled when ≥1 placed Teknik has:
            stationEquipment === undefined (unset)
            AND activity.defaultStationEquipment non-empty
         on tap (recommended: immediate):
            for each eligible item:
               persist copy of defaultStationEquipment
               via updateItemStationEquipment (same as Använd förslag)
            show one-line result: Sparade redskap på N stationer
            if N=0 (race): soft no-op message

Skip:
   already-saved stationEquipment (defined, including non-empty)
   stationEquipment === [] (cleared)
   empty / missing defaultStationEquipment
   non-Teknik / unplaced Teknik

Golvklart / print / Förrådslista
   → SAVED stationEquipment only
   → after this CTA runs, eligible stations are saved → lists fill
   → still never promote unset förslag without CTA / Klar / Använd förslag

Place on canvas
   → does NOT write stationEquipment from seed (Slice 18 / F)
```

## Where the CTA lives (recommended A)

| Surface | CTA? |
|---|---|
| Hallöversikt **edit** header actions (`.hall-header-actions`) | **Yes** — secondary `btn-secondary hall-tap-target` near Visa/dölj flöde + Förrådslista; primary stays **Golvklart** |
| Hallöversikt **Golvklart** / floor header (`.hall-floor-actions`) | **No** |
| Activity detail / markör sheet | **No** — keep per-station **Använd förslag** only |
| Passbyggaren | **No** |
| Home / Kom igång | **No** |

**Phone (~390px):** Keep tap target ≥ hall-tap-target size; if header wraps, CTA may sit on a second action row — still edit-only, still secondary.

## Enable rules (recommended C)

CTA **enabled** when count of eligible items ≥ 1.

**Eligible** = placed Teknik SessionItem where:

1. Present in hall placements (`hallPlacements` / placed set from `placeableItems`)  
2. `item.stationEquipment === undefined`  
3. `getActivityById(item.activityId)?.defaultStationEquipment` exists and `length > 0`

Otherwise **disabled** (preferred over hiding so coaches discover the action; Docs may supply aria/title for disabled — e.g. “Inga stationer med osparade förslag”). Exact disabled copy = Docs after lock.

## Apply behavior (recommended B + C)

1. On tap: compute eligible set **again** (avoid stale enable).  
2. For each eligible itemId, apply sanitized copy of that activity’s `defaultStationEquipment` through **`updateItemStationEquipment`** (`app/src/lib/session.ts`) — same sanitization as Klar / Använd förslag. Prefer one session fold + single `persist` over N separate persists if trivial.  
3. Do **not** open compose sheets; do **not** change selection/detail.  
4. Do **not** touch items that are saved, `[]`, seedless, unplaced, or non-Teknik.  
5. Do **not** change unset vs `[]` rules for future single-station compose.

### Builder hooks (do not implement in this pack)

| Area | Hook |
|---|---|
| Chrome | `HallBoard.tsx` edit branch — add secondary button in `.hall-header-actions` (or agreed edit-only row) |
| Apply helper | Prefer small pure helper (e.g. `applyAllSuggestedStationEquipment(session): { session, appliedCount }`) near `updateItemStationEquipment` / hall helpers — keep eligibility testable |
| Persist | Reuse `updateItemStationEquipment` + existing `persist` in HallBoard |
| Activity lookup | Existing `getActivityById` + `defaultStationEquipment` |
| Placeable | Existing `placeableItems` / placed helpers in `app/src/lib/hall.ts` |
| Strings | `UI.*` keys from Docs lock in `blockMeta.ts` |
| Footer | `footerSliceLabel` → `Träningsplaneraren · Slice 19` |
| Toast/banner | Reuse `.toast` or light `role="status"` banner pattern (SessionBuilder toast / hall-unplaced-banner) |

## Result feedback (recommended B)

| Case | Feedback |
|---|---|
| N ≥ 1 applied | One-line Swedish: **Sparade redskap på N stationer** (Docs owns exact inflection; singular if needed) |
| N = 0 after tap | Soft no-op message (Docs owns string) — do not error-crash |
| Disabled CTA | No apply; optional aria/title explaining why |

No browser `confirm`. Action reversible via **Redigera redskap** on each station.

## What must not change

- Per-station **Använd förslag** / **Klar** / unset vs `[]`  
- Caption **Schematisk hall — inte exakt mått**  
- Golvklart short titles (17) + quiet redskap (14) — still saved-only until persist  
- Förrådslista aggregate (15) — saved only  
- Kom igång progress — saved composition only  
- Edit canvas declutter; no under-markör equipment-count badge  
- Hall detail entry for Redigera redskap only — no Passbyggaren compose  
- No auto-apply on place  
- Nine Teknik seeds from Slice 18 — leave seed arrays alone  
- Library size (~10 `eq-*`)  
- Device-local; no Netlify in pack

## Phone

Verify CTA usable at ~390px width in edit mode; absent (or not shown as active compose control) on Golvklart. Result banner/toast must not block Golvklart primary or canvas.
