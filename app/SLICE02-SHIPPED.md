# Slice 02 — shipped (phone / small-screen polish)

## How to run

```bash
cd /workspace/gymnastics-planner/app
npm install
npm run dev
```

Build: `npm run build` (green at ship time).

## Breakpoints covered

| Name | Width | Behavior |
|---|---|---|
| phone | ≤480px | Home CTAs full-width stack; title ~16px; enlarged taps |
| narrow | ≤768px | Library / Tips / Templates as bottom sheet with **Stäng** + backdrop; body scroll lock |
| stacked | ≤900px | Existing single-column builder grid (unchanged) |
| desktop | ≥901px | Two-column builder intact; side panel sticky (not a sheet) |

## What changed

### Behavior
- On ≤768px, the side panel is no longer a permanent second column / stacked sidebar. Opening Bibliotek / Tips / Mallar (via block Add, block select → tips, or **Använd mall**) shows a bottom sheet overlay with **Stäng** and backdrop dismiss.
- Opening **Lägg till övning** / **Bläddra bland idéer** still filters the library to that block type, then opens the sheet.
- Body scroll is locked while the sheet (or activity/template modal) is open.
- Desktop ≥901px keeps the two-column layout; sheet chrome/backdrop stay hidden.

### Touch / type
- Item reorder ↑↓, remove, move-to select, Add, Home cards, mismatch dismiss, modal actions: min ~44×44px hit areas on ≤768px.
- Title + search/filter inputs use ≥16px on narrow to avoid iOS zoom.
- Visible `:focus-visible` and `:active` states on primary controls.
- Activity detail + template confirm stack actions full-width on phone; modals become bottom sheets with internal scroll.
- Soft mismatch banner full-width with ≥44px dismiss.

### Files
- `src/components/SessionBuilder.tsx` — `panelOpen` / `isNarrow`, sheet chrome + backdrop, open/close wiring
- `src/App.css` — phone/narrow media queries, sheet layout, tap targets, modal phone layout
- `src/index.css` — `overflow-x: hidden` on `body`
- `src/components/ActivityDetail.tsx` — body scroll lock; backdrop click closes
- `src/components/TemplateConfirm.tsx` — body scroll lock; backdrop click cancels
- `src/App.tsx` — footer label Slice 02
- No seed/template/product-copy changes. Swedish strings unchanged (`UI.close` → **Stäng**).

## Known gaps / notes
- No dedicated overflow “⋯” menu for top-bar actions; actions wrap into a compact flex row instead (title + `n / 60` stay on one row via `flex-wrap: nowrap` + shrinkable title).
- Focus trap inside the sheet is not a full focus-trap library; sheet scrolls and Stäng is available.
- 769–900px: panel still stacks under blocks (existing ≤900 grid), not a sheet — sheets start at ≤768 per spec.
- Horizontal scroll addressed via `overflow-x: hidden`, `min-width: 0` on title/flex children, and removing fixed `min-width: 200px` on the title input. Verifier should still smoke-test at 390×844 and 360×740.

## Do not break (unchanged product rules)
- Session total = item sum only
- Soft mismatch, templates confirm/cancel, draft save / Fortsätt senaste pass
- Five locked blocks; reorder within block only
- Swedish Slice 01 copy

## Follow-up note (Slice 01 fix, not Slice 02)

`tmpl-short-45` duration bump so item sum is ~45 was a **Slice 01 follow-up fix**, not a Slice 02 product change. Slice 02 only covered phone/sheet layout.
