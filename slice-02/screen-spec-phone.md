# Screen spec — Phone layout (Slice 02)

## Breakpoints
| Name | Width | Intent |
|---|---|---|
| phone | ≤480px | Primary polish target (iPhone-class) |
| narrow | 481–768px | Same patterns; slightly more breathing room |
| desktop | ≥901px | Keep Slice 01 two-column builder; do not regress |

## Home (≤480px)
- Three CTAs stack full-width, min tap height **44px**
- Title + short subtitle readable without wrapping into a wall of text
- Comfortable vertical spacing; no side-by-side cramped buttons

## Passbyggaren shell (≤480px)
- **Top bar:** title (editable) + live total `n / 60` stay visible; secondary actions (Mallar, Spara tip) collapse into a compact row or overflow menu — must not push total off-screen
- **No horizontal page scroll** at 390px width
- Main column is the block list; side panel is **not** a permanent second column

## Side panel → bottom sheet / full-screen sheet
On ≤768px (required at ≤480px):
- Library / Tips / Templates open as a **sheet** (bottom sheet or full-screen overlay), not a squeezed sidebar
- Sheet has a clear **Stäng** control; backdrop dismiss OK
- Opening “Lägg till övning” from a block opens Library already filtered to that block
- Focus trap / scroll: sheet body scrolls; page behind does not scroll through

## Block cards
- Budget vs filled stays on one readable row (or stacked label+meters, not truncated to uselessness)
- Empty tip + primary CTA visible without expanding mystery menus
- Item rows: emoji/visual + title + duration; duration control still usable with thumb
- Reorder ↑↓ and overflow actions: hit area ≥44×44px (padding OK)

## Activity detail
- Opens as modal/sheet on phone; primary actions **Lägg till** and duration edit reachable without landscape
- Sammanfattning / Så gör du / Se upp för stack vertically; long text scrolls inside the sheet

## Soft mismatch banner
- Full width, readable, dismiss control ≥44px; does not cover the only Add button permanently

## Template confirm
- Dialog fits phone width; Confirm / Cancel both full-width stack or clearly separated ≥44px taps

## Touch & type
- Body text ≥16px on inputs where iOS would zoom (especially title field)
- Visible focus/active states for buttons

## Do not break
- Slice 01 behavior: totals, soft mismatch, templates, draft restore, five locked blocks, Swedish strings
