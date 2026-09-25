# Slice 17 — Golvklart: short station titles on screen

**App:** Träningsplaneraren  
**Approval:** APPROVED 2026-09-25 — recommended A–F locked  
**Date drafted:** 2026-09-25  
**Status:** **APPROVED 2026-09-25** (recommended A–F locked after Christoffer skipped the lock prompt; Planner proceeded with published recommendations)

**Backlog:** Idea 3 Approved 2026-09-25 (Christoffer via Planner) → this pack. Broader selective redskap-förslag (Approved idea 1) stays **out** of this pack.

## Goal

On **Golvklart**, coaches holding up the phone can read each Teknik station’s **short name** under the markör — without opening detail or relying on print. Reuse the existing print short-title chrome (`.hall-chip-title--print`); show it on **Golvklart screen** (`.is-floor`) as well as print. **Edit canvas stays title-hidden.** Redskap lines (Slice 14) stay under the title when present.

**Coach outcome:** “Jag håller upp Golvklart på golvet och läser stationsnamnen under markörerna — samma korta titel som på utskriften.”

## Direction lock (from Christoffer / product / hard locks)

- Show existing **short activity title** under markörer on **Golvklart screen** (`.is-floor`)
- Still **hidden on Hallöversikt edit** canvas
- **Print** short titles remain (already shipped)
- Stack with Slice 14: **title first**, then redskap lines when non-empty
- Caption **Schematisk hall — inte exakt mått** unchanged
- **NO** canvas equipment-count badge
- **NO** CAD / equipment pins
- **NO** edit-canvas title clutter
- Teknik-only placeable intact
- Slice 11–16 behaviors intact (compose, under-markör redskap, Förrådslista, Kom igång)
- Swedish UI; gymnaster / pass; device-local
- Footer `Träningsplaneraren · Slice 17` when shipped (recommended E)
- **Netlify out of pack scope** unless Christoffer asks
- No accounts / cloud
- No new placeable blocks / library pieces

## Problem

Slice 12 hid canvas titles on screen (icon-first markörer). Slice 14 showed redskap under markörer on Golvklart **and** print, but kept short titles **print-only** on Golvklart screen (`display: none` until `@media print`). Holding the phone on the floor, coaches and helpers see redskap lines without a readable station name unless they tap each markör or print.

## Current baseline (do not regress)

- Canvas markör: icon + rank; `.hall-chip-title--print` in DOM with full `activity.title`, CSS `display: none` on screen; `@media print` → `display: block` (~9–10ch ellipsis)
- Golvklart (`.hall-canvas.is-floor`): shows `.hall-chip-equipment` under markör; **title still hidden**
- Print: title then equipment (`top` offset for equipment under title)
- Edit Hallöversikt: no under-markör title or redskap
- Caption: **Schematisk hall — inte exakt mått**
- Live: https://fancy-blancmange-4d516b.netlify.app/ (Slice 16)
- Slice 14 Docs explicitly: “Golvklart screen | Equipment lines only; short station title stays **print-only**” — **this slice supersedes that line** for Golvklart screen only

## In scope

1. **Show short title on Golvklart screen** — CSS (and minimal layout tweak): `.hall-canvas.is-floor .hall-chip-title--print { display: block; }` (or equivalent), still hidden on edit canvas.
2. **Stack with redskap** — On `.is-floor`, offset equipment below the short title the same way print already does (title → then lines).
3. **Always show title for placed Teknik markörer** on Golvklart — even when redskap is unset / `[]` / quiet.
4. **Docs** — Update `docs/golvklart-redskap.sv.md` (and thin seed in `content/`) so Golvklart screen is no longer “print-only” for titles; keep edit canvas hidden.
5. **Footer** — `Träningsplaneraren · Slice 17` when shipped.
6. Verification checklist (phone Golvklart + print still OK; Netlify not required).

## Out of scope

- Broader selective redskap-förslag (Approved idea 1 — **later slice**)
- Showing titles on **edit** Hallöversikt canvas
- Canvas equipment-count badge / CAD pins
- Changing title **source** (still `activity.title` with CSS ellipsis) unless Christoffer locks otherwise
- Changing Slice 14 redskap format / quiet rules
- Changing Förrådslista / Kom igång / compose entry
- New tip required for PASS (optional soft tip deferred)
- Caption change
- Accounts / cloud / App Store / Netlify in this pack

## Files in this pack

| File | Purpose |
|---|---|
| `README.md` | Goal, scope, baseline |
| `decisions.md` | Open questions A–F + Planner recommendations |
| `screen-spec.md` | Visibility matrix + layout |
| `verification-checklist.md` | Verifier rules after ship |
| `HANDOFF.md` | Docs → Builder → Verifier order |
| `content/golvklart-short-titles.sv.md` | Docs seed (visibility matrix update) |

## Locked answers

See `decisions.md` — A–F locked as recommended. Docs → Builder → Verifier.
