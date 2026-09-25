# Screen spec — visuals & icons (Slice 04)

Swedish UI. Decorative icons only; titles and badges carry meaning.

## Where icons appear

| Surface | Component | What shows | Notes |
|---|---|---|---|
| Block header | `BlockCard` | Block icon tile + Swedish block name + budget | Color from `BLOCK_COLORS[type]` |
| Session item row | `BlockCard` → `.session-item` | Activity icon tile + title + duration + actions | Tint tile with **activity’s** `blockType` color (not destination block if mismatched — optional; default = activity’s own type) |
| Library card | `ActivityCard` | Activity icon tile + title + duration + badges | Phone sheet + desktop side panel |
| Activity detail | `ActivityDetail` | Larger activity icon tile above title | Experienced warning stays below title |
| Empty block | `BlockCard` empty state | **No** activity icon required; block header icon remains | Tips + CTAs unchanged |
| Home action cards | `Home` | Out of required scope (emoji OK) | Do not fail Verifier if still emoji |

## Icon tile anatomy

```
┌──────────┐
│   SVG    │  rounded square
│   icon   │  bg = block.bg, border optional 1px block.border
└──────────┘  icon stroke/fill = block.text (or darker neutral)
```

- Corner radius: **10px** (match current `.block-icon`)
- Icon is centered; padding ~22% of tile so stroke icons breathe
- Never show bare emoji text as the primary visual after Slice 04

## Sizes

| Context | Tile size | SVG draw size | CSS hook (suggested) |
|---|---|---|---|
| Block header | **36×36** | 20×20 | `.block-icon` (already sized) |
| Session item (desktop + phone) | **40×40** | 22×22 | `.item-visual` → become tile |
| Library card | **44×44** | 24×24 | `.activity-visual` → become tile |
| Activity detail | **64×64** | 36×36 | `.detail-visual` → become tile |
| Fallback (any) | same as context | same | `.visual-fallback` |

Phone (Slice 02, ~360–390px): tiles must not steal width from duration inputs or ≥44px tap targets. Keep session-item layout: `[tile 40] [body flex] [actions]`.

Desktop two-column: same tiles; library list can feel slightly denser — do not enlarge library tiles beyond 44.

## Colors (locked from Slice 01 / `blockMeta.ts`)

| Block | Token | bg | border | text (icon tint) |
|---|---|---|---|---|
| Samling | amber | `#fef3c7` | `#f59e0b` | `#92400e` |
| Uppvärmning | sky | `#e0f2fe` | `#0ea5e9` | `#075985` |
| Teknik | violet | `#ede9fe` | `#8b5cf6` | `#5b21b6` |
| Styrka | rose | `#ffe4e6` | `#f43f5e` | `#9f1239` |
| Lek och spel | green | `#dcfce7` | `#22c55e` | `#166534` |

Block header tile: use that block’s colors.  
Activity tile: use **activity.blockType** colors (so a strength drill stays rose-tinted even if browsed from “Alla typer”).

Fallback tile (unknown key): neutral `#f1f5f9` bg, `#64748b` icon — or tint from provided `blockType` if caller passes one.

## Empty / fallback / missing activity

| Case | Visual |
|---|---|
| Known `visualKey` | Mapped SVG in tinted tile |
| Unknown `visualKey` | `icon-fallback` (generic activity / dumbbell-ish abstract) + tile |
| Session item with missing activity id | Keep today’s `❓` **or** swap to same fallback tile — prefer **fallback tile** for consistency |
| Empty block | Header block icon only; empty tip copy unchanged |

## Accessibility

- Icon tiles: `aria-hidden="true"` when adjacent title text is present (current pattern).
- Do not rely on color alone to distinguish blocks — shape differs per `IconId`.
- Experienced-only: keep `.experienced-badge` + `.experienced-warning` (text). Icon must not be the sole warning.
- Contrast: icon stroke on tinted bg must remain readable (use `text` token, not light border color).

## Motion / interaction

- No required animation. Optional: none for Slice 04.
- Tiles are not separate buttons; parent card/row remains the hit target.

## What Builder should change in CSS

- `.block-icon`, `.item-visual`, `.activity-visual`, `.detail-visual`: host the tile; stop using `font-size` for emoji.
- Ensure SVG `display:block; width/height:100%` inside tile padding box.
- Preserve Slice 02 sheet library spacing.

## Explicit non-goals on screen

- No video thumbnails
- No photo backgrounds on cards
- No changing badge copy or mismatch banner visuals beyond what icon migration touches
