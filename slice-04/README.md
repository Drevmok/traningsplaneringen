# Slice 04 — Visuals & icons for blocks and activities

**App:** Träningsplaneraren  
**Owner approval needed before:** Docs polish / Builder implementation  
**Date drafted:** 2026-09-24

## Goal

Replace bare emoji text with a **polished, offline, local SVG icon system** for the five session blocks and all 28 library activities — so Passbyggaren and the phone sheet library look consistent, readable, and coach-friendly without relying on OS emoji rendering.

## In scope

- Block header icons (Samling, Uppvärmning, Teknik, Styrka, Lek och spel)
- Activity visuals wherever they appear today: library card, session item row, activity detail
- Shared `visualKey` → icon renderer with colored icon tiles
- Fallback for unknown `visualKey`
- Keep Swedish labels, experienced-only badge/warning, block color tokens
- Migrate `VISUAL_EMOJI` / `BLOCK_ICONS` emoji maps → structured icon map (same `visualKey` strings where possible)
- Screen sizes for phone sheet (Slice 02) and desktop two-column

## Out of scope

- Onboarding / new coach tour
- Adding more drills or rewriting drill copy
- Distribution / export / share polish
- Coach-level filter chips beyond what Slice 03 already shipped
- Video, photos, or biomechanical technique illustrations
- Redesigning Home action cards (optional later; not required for Slice 04 pass)
- New block types or reordering blocks
- External CDN / icon font dependency in production

## Recommended approach (summary)

**Local SVG icon set** as React components (or one sprite), keyed by existing `Activity.visualKey` and by `BlockType`. Each visual renders inside a **consistent icon tile** tinted with the block’s existing `BLOCK_COLORS`. Unknown keys show a generic dumbbell/activity fallback. No CDN. Icons stay abstract/friendly — not form cues coaches might copy.

Full rationale, rejected alternatives, and locked choices: [`decisions.md`](./decisions.md).  
Placement, sizes, colors: [`screen-spec-visuals.md`](./screen-spec-visuals.md).  
Full key map (5 blocks + 28 activities): [`icon-map.md`](./icon-map.md).  
Verifier criteria: [`verification-checklist.md`](./verification-checklist.md).

## Acceptance for Christoffer (product owner)

Approve Slice 04 when you agree that:

1. Local SVG tiles (not bare emoji, not Lucide CDN, not photo/illustration tiles) is the right polish step.
2. The five block colors stay as today (amber / sky / violet / rose / green) with matching block icons.
3. Experienced-only drills keep the **text badge + warning** — their icons are skill-themed (flip / salto), **not** ⚠️ / 🚨.
4. The icon meanings in [`icon-map.md`](./icon-map.md) feel right enough for coaches scanning the library (abstract is OK; perfect gymnastics glyphs are not required).
5. Scope stays visuals-only — no new drills or chrome features in this slice.

**Approve** → Docs can note any Swedish microcopy for `aria-label`/fallback if needed; Builder implements against this pack; Verifier uses the checklist.

## Current state (audit, 2026-09-24)

| Area | Today |
|---|---|
| Data | `Activity.visualKey: string` already on all 28 seeds |
| Block icons | `BLOCK_ICONS` → emoji (`👋🔥✨💪😄`) |
| Activity icons | `VISUAL_EMOJI` → emoji; `visualEmoji()` with `🏋️` fallback |
| Render sites | `BlockCard` header + session rows, `ActivityCard`, `ActivityDetail` |
| Assets | Vite scaffold only (`icons.svg` = Bluesky/Discord); **no** gymnastics icons |
| Deps | React only — no icon library |
| Prior decision | Slice 01: emoji/`visualKey` OK for that slice; polish deferred |

## Files in this pack

1. `README.md` (this file)
2. `decisions.md`
3. `screen-spec-visuals.md`
4. `icon-map.md`
5. `verification-checklist.md`
