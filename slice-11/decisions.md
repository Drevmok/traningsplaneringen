# Slice 11 — locked decisions

**Status:** **APPROVED by Christoffer 2026-09-24**

## A. What is a “station” on the hall?

**Lock:** `blockType === 'techniques'` (Swedish block **Teknik**).

| Block | Place on hall? |
|---|---|
| Samling | No |
| Uppvärmning | No |
| Teknik | **Yes** |
| Styrka | No |
| Lek och spel | No |

**Rejected:** Place any item that has the word “station” in the drill title/body (too fuzzy; pulls in strength cirkel).  
**Rejected:** Allow coach to toggle which blocks are placeable (defer; keep MVP opinionated).

## B. Compact chips (canvas)

**Lock:** Canvas variant is compact:

- Max width ≈ **28%** of hall width (was ~42%).
- VisualIcon size **`item`** (not `block`) on canvas.
- Show: station rank (when placed), icon, **truncated title** (ellipsis), Erfaren short badge when needed.
- **Hide** duration on canvas chips (still visible in Passbyggaren / detail).
- Tray variant: may keep slightly larger title/`block` icon for finger targets ≥44px height; still shorter max title than today if needed.

**Rejected:** Dot/pin only with no title (coach cannot read stations at a glance on Golvklart).  
**Rejected:** Full ActivityCard-sized tiles on the floor.

## C. Migration of old placements

**Lock:** `pruneHallPlacements` (or equivalent on migrate/open) removes placements whose session item:

- no longer exists on the pass, **or**
- resolves to an activity whose `blockType` is not `techniques`.

Silent. Golvklart soft banner only counts **unplaced Teknik** items.

## D. Entry / empty states

**Lock:** Hallöversikt CTA from Passbyggaren stays enabled when the pass has ≥1 övning (any block) — coach can still open the hall. If zero Teknik items: empty canvas + Swedish explanation; tray empty or replaced by empty-state copy (not a list of warmups).

**Rejected:** Disable Hallöversikt until Teknik exists (hides the feature; worse for exploration).

## E. Flow / numbers

**Lock:** `stationRanks` / flow connectors only consider **placed Teknik** items, still in Passbyggaren order among those items.

## F. Footer / deploy

**Lock:** Footer `Träningsplaneraren · Slice 11`. Republish to Netlify only after Verifier PASS if Christoffer wants the phone URL updated (same site).

## Constraints carried forward

- gymnaster / pass / Swedish UI
- Caption: **Schematisk hall — inte exakt mått**
- Storage key unchanged; placement shape unchanged (only which items may occupy it)
- Erfaren safety on Teknik stations unchanged
- No CAD / meters / multi-user / PDF lib
