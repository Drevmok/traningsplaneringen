# Verification checklist — Slice 04 (visuals & icons)

**Slice passes when** a coach can scan Passbyggaren and the library on phone + desktop and see **consistent SVG icon tiles** (not bare emoji) for all five blocks and all 28 activities, with Swedish labels and experienced-only warnings still clear — offline, no CDN.

Use this checklist as sole Slice 04 authority after Christoffer approval.

---

## Locked pass/fail rules

- **Local assets only:** Icons ship with the app (React SVG components or bundled sprite). Production build must not fetch icon fonts/CDN URLs. Fail if network required for icons.
- **No bare emoji as primary visual:** Block headers, library cards, session item rows, and activity detail must render SVG tiles. Fail if primary visual is still an emoji character for any of the 28 seeded activities or 5 blocks.
- **All 28 mapped:** Every seed activity’s `visualKey` resolves to a defined `iconId` (see `icon-map.md`). Fail if any seed shows only fallback **because the map omitted it**.
- **Fallback exists:** A deliberately unknown `visualKey` (Verifier may inject in a test or temporarily) shows the fallback tile — not a blank, not a crash.
- **Block color language preserved:** Five blocks keep amber / sky / violet / rose / green tiles matching `BLOCK_COLORS`. Fail if colors swapped or removed.
- **Experienced-only still clear:** `tech-rondat-flickis` and `tech-salto-fran-hojd` show badge + warning text; their icons are **not** warning/siren-only glyphs. Fail if warning emoji is the sole/primary visual again.
- **Text labels remain:** Icon-only rows (no Swedish title) = fail.
- **Phone + desktop:** At ~390px sheet library and desktop two-column, tiles readable; duration controls and ≥44px tap targets from Slice 02 still work. Fail if icons break layout or shrink primary CTAs below usable.
- **Scope guard:** Missing Home SVG tiles, no new drills, no filter chips, no export — must **not** cause FAIL.
- **Offline smoke:** Load app with network disabled (or confirm no icon network requests in build). Icons still visible = pass for this rule.

---

## Product / UX

- [ ] Block headers: SVG tile + Swedish name for all 5 blocks in locked order
- [ ] Library cards: SVG tile + title + duration for all visible activities
- [ ] Session item rows: SVG tile + title + duration
- [ ] Activity detail: larger SVG tile above title
- [ ] Tile colors match activity/block type tokens
- [ ] Experienced badge visible on the two flagged drills; warning alert still present in detail
- [ ] Icon shapes differ enough across the five blocks to tell them apart without reading color
- [ ] Empty block: tip + CTAs unchanged; block header icon still shown
- [ ] Mismatch banner / move / duration editing still work (visual regression only)

## Data / mapping

- [ ] Count: 28 activities in seed; each has `visualKey` present in icon map
- [ ] Map matches `icon-map.md` (or documented intentional Builder alias with same meaning)
- [ ] `visualKey` strings not renamed away from Slice 03 without Docs note
- [ ] Unknown key → fallback tile

## Technical

- [ ] No new production dependency on remote icon CDN
- [ ] `npm run build` succeeds with icons included
- [ ] Decorative icons `aria-hidden` (or equivalent) when title adjacent
- [ ] No detailed technique illustrations that could be mistaken for form cues

## Regression (must still pass from prior slices)

- [ ] Slice 01: five blocks, budgets, mismatch soft warning, save draft
- [ ] Slice 02: phone sheet library usable at ~390px
- [ ] Slice 03: 3/5/9/3/8 drills; experienced-only on rondat–flickis + salto från höjd

## Explicit non-fail

- Home still using emoji on action cards
- Vite scaffold `public/icons.svg` (Bluesky/Discord) unused
- Minor stroke-style differences vs mock if meanings match `icon-map.md`

---

## Quick Verifier script (manual)

1. Open Passbyggaren desktop — confirm 5 block header SVG tiles + colors.
2. Open library — scan all filters / block types; every card has a tile (spot-check all 28).
3. Add one activity per block — session rows show tiles.
4. Open detail for `tech-rondat-flickis` and `tech-salto-fran-hojd` — badge + warning + non-warning icon.
5. Phone width ~390px — sheet library tiles + tap targets OK.
6. Disconnect network / check Network panel — no icon CDN requests; tiles remain.
7. Temporarily break a `visualKey` in seed (local only) — fallback tile; revert.

**PASS** = all locked rules green + Product/UX + Data + Technical + Regression.  
**FAIL** = any locked rule red.
