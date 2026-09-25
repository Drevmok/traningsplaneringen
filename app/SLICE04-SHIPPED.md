# Slice 04 — SHIPPED

**Date:** 2026-09-24  
**App:** Träningsplaneraren (`/workspace/gymnastics-planner/app`)

## How to run

```bash
cd /workspace/gymnastics-planner/app
npm install   # if needed
npm run dev   # http://localhost:5173
npm run build # production check
```

Offline: icons are local React SVG components — no CDN, no icon font, no new npm deps.

## What changed

Replaced bare emoji (`BLOCK_ICONS`, `VISUAL_EMOJI`, `visualEmoji()`) with a local SVG icon tile system for **5 blocks + 28 activities**.

- New `src/icons/` package: `IconId` union, stroke SVG glyphs, `VISUAL_ICON` / `BLOCK_ICON_IDS` maps, `<VisualIcon />` tinted tiles
- Render sites updated: `BlockCard` (header + session rows), `ActivityCard`, `ActivityDetail`
- CSS: `.visual-icon-tile` hosts tiles; `.block-icon` / `.item-visual` / `.activity-visual` / `.detail-visual` no longer use emoji `font-size` as primary visual
- Home action-card emoji left as-is (out of scope)
- Seed `visualKey` strings unchanged (Slice 03)
- Swedish UI, experienced badge + warning, phone sheets / ≥44px taps / desktop two-column preserved

## Icon counts

| Kind | Count |
|---|---|
| `IconId` vocabulary | **31** (incl. `fallback`) |
| Block headers mapped | **5** |
| Activity `visualKey` → iconId | **28** / 28 |

### Block → iconId

| BlockType | iconId |
|---|---|
| gathering | users-wave |
| warmup | flame |
| techniques | spark |
| strength | dumbbell |
| fun_and_games | smile |

### Experienced drills (skill icons, **not** warnings)

| Activity id | visualKey | iconId |
|---|---|---|
| tech-rondat-flickis | tech-rondat-flickis | **flip** |
| tech-salto-fran-hojd | tech-salto-height | **salto-height** |

Existing `.experienced-badge` + `.experienced-warning` (`role="alert"`) unchanged.

## Fallback behavior

- Unknown `visualKey` → `fallback` icon
- If `blockType` provided → tile tinted with that block’s `BLOCK_COLORS`
- If no `blockType` (e.g. missing activity in session row) → neutral tile `#f1f5f9` / `#64748b` (not ❓ emoji)

## Tile sizes (screen-spec)

| Context | Tile | SVG draw |
|---|---|---|
| Block header | 36 | 20 |
| Session item | 40 | 22 |
| Library card | 44 | 24 |
| Activity detail | 64 | 36 |

Decorative tiles use `aria-hidden` when titles are adjacent.

## Files touched

**Added**

- `src/icons/types.ts`
- `src/icons/Icon.tsx`
- `src/icons/map.ts`
- `src/icons/VisualIcon.tsx`
- `src/icons/index.ts`
- `SLICE04-SHIPPED.md` (this file)

**Updated**

- `src/data/blockMeta.ts` — removed `BLOCK_ICONS`, `VISUAL_EMOJI`, `visualEmoji()`
- `src/components/BlockCard.tsx`
- `src/components/ActivityCard.tsx`
- `src/components/ActivityDetail.tsx`
- `src/App.css`

## Gaps / non-goals

- Home action cards still use emoji (intentional)
- Vite scaffold `public/icons.svg` unused
- No new drills, filter chips, onboarding, or export work
- Icon strokes are abstract/friendly — not biomechanical form cues

## Build

`npm run build` — **green** (tsc -b && vite build) as of ship.
