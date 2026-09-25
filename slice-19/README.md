# Slice 19 — Hall — Använd alla förslag

**App:** Träningsplaneraren  
**Approval:** **APPROVED 2026-09-25** — recommended A–F locked  
**Date approved:** 2026-09-25  
**Status:** **APPROVED 2026-09-25** — recommended A–F locked. Christoffer approved via Planner lock widget.

**Backlog:** Idea **Hall — Använd alla förslag** Approved 2026-09-25 (Christoffer via Planner batch gate) → this pack is **In flight** (Slice 19).

## Goal

One tap on Hallöversikt **edit** chrome accepts every **unset** Teknik-förslag that has a non-empty `activity.defaultStationEquipment` seed, persisting each via the same path as per-station **Använd förslag**. After apply, Golvklart and Förrådslista fill from **saved** composition without opening each markör.

**Coach outcome:** “Jag trycker **Använd alla förslag** en gång — alla stationer med förslag sparas, och Golvklart / Förrådslista fylls.”

## Direction lock (from Christoffer / product / hard locks)

- Hallöversikt **edit** chrome only — secondary CTA near existing hall actions (locked A)
- Enabled when ≥1 **placed** Teknik item has **unset** `stationEquipment` **and** non-empty `activity.defaultStationEquipment`
- On tap: **immediate apply** (locked B) — no browser `confirm`; one-line result toast/banner
- Persist each eligible item via the same path as per-station **Använd förslag** / `updateItemStationEquipment`
- Skip: already-saved compositions; `[]` cleared; activities with empty/no seed; non-Teknik; unplaced Teknik
- **Does NOT** auto-apply on place (Slice 18 rejected that)
- **Does NOT** change unset vs `[]` semantics for single-station compose
- Golvklart / Förrådslista / print still only show **saved** composition (CTA persists, so they update after apply)
- Compose = hall detail **Redigera redskap** only — no Passbyggaren compose
- Placeable = **Teknik** only
- Fixed **~10-piece** Swedish redskap library — no growth
- Caption **Schematisk hall — inte exakt mått** unchanged
- **NO** canvas equipment-count badge
- **NO** CAD / equipment pins
- Swedish UI; gymnaster / pass; device-local; no accounts / cloud
- Footer `Träningsplaneraren · Slice 19` when shipped (locked E)
- **Netlify out of pack scope** unless Christoffer asks (phone URL still Slice 17; Slice 18 Verifier PASS locally, not republished)

## Problem

Slice 18 seeded all nine Teknik drills with `defaultStationEquipment`. Coaches still must open each markör and tap **Använd förslag** (or Klar) before Golvklart / Förrådslista show redskap. On a full pass that is many taps for an obvious “accept every seed” intent.

## Current baseline (do not regress)

### Apply path (cite live symbols)

| Symbol | Location | Role |
|---|---|---|
| `updateItemStationEquipment(session, itemId, stationEquipment)` | `app/src/lib/session.ts` | Persist composed redskap (Klar / Använd förslag) |
| `handleUseSuggested(slots)` | `app/src/components/HallBoard.tsx` | Detail → `updateItemStationEquipment` + `persist` |
| `UI.stationEquipmentUseSuggested` | `app/src/data/blockMeta.ts` | Per-station CTA label **Använd förslag** |
| `activity.defaultStationEquipment` | `Activity` in `app/src/types.ts` / seeds in `seedActivities.ts` | Förslag when item unset |
| `item.stationEquipment` | `SessionItem` | `undefined` = unset; `[]` = cleared; non-empty = saved |
| Edit chrome actions | `HallBoard.tsx` `.hall-header-actions` | Visa/dölj flöde, Förrådslista, **Golvklart** (primary) |
| Floor chrome | `HallBoard.tsx` `.hall-floor-actions` | Exit / Förrådslista / Skriv ut — **no** Slice 19 CTA here |
| Caption | `UI.hallSchematicNote` | **Schematisk hall — inte exakt mått** |
| Footer | `UI.footerSliceLabel` | Currently `Träningsplaneraren · Slice 18` |

### Semantics to preserve

- Unset (`undefined`) may show förslag; `[]` = coach cleared — no förslag
- Golvklart / print / Förrådslista / Kom igång progress use **SAVED** `stationEquipment` only
- Place does **not** write `stationEquipment` from seed (no auto-apply)
- Compose entry = hall detail **Redigera redskap** only
- Live phone: https://fancy-blancmange-4d516b.netlify.app/ (through Slice 17; Slice 18 code shipped locally, Netlify not republished)

## In scope

1. **Hallöversikt edit CTA** — secondary **Använd alla förslag** (Docs owns exact Swedish label) in edit chrome near existing hall actions.
2. **Enable rules** — enabled iff ≥1 placed Teknik has unset + non-empty seed; otherwise disabled (or hidden — see locked B/D if needed).
3. **Bulk apply** — for each eligible item, persist `activity.defaultStationEquipment` via `updateItemStationEquipment` (same sanitization as single-station Använd förslag); one persist of the resulting session preferred.
4. **Result feedback** — one-line Swedish result (“Sparade redskap på N stationer”); soft no-op if N=0 after edge race (locked B).
5. **Docs** — thin Swedish strings for CTA + result (+ disabled/empty if needed) in `docs/hall-oversikt-copy.sv.md` or a thin new docs file (locked D).
6. **Footer** — `Träningsplaneraren · Slice 19` when shipped.
7. Verification checklist for the pack after Builder ship.

## Out of scope

- Auto-apply förslag on place
- Promoting förslag onto Golvklart / Förrådslista / print without this CTA / Klar / Använd förslag
- Changing unset vs `[]` / single-station Använd förslag / Klar UX
- Passbyggaren compose entry
- Canvas equipment-count badge / CAD pins
- Library growth / custom catalog
- Caption change
- New required tip for PASS
- Accounts / cloud / App Store / Netlify in this pack
- Seed table edits (Slice 18 already seeded all nine Teknik)

## Files in this pack

| File | Purpose |
|---|---|
| `README.md` | Goal, scope, baseline, status APPROVED |
| `decisions.md` | Locked A–F answers |
| `screen-spec.md` | CTA placement, enable rules, apply behavior, feedback, must-not-change |
| `verification-checklist.md` | Verifier cases after Builder ship |
| `HANDOFF.md` | Docs → Builder → Verifier (Planner pings) |

No `content/` seed in this pack — Docs owns Swedish strings in `docs/*.sv.md` (optional thin content later if Docs prefers).

## Locked answers

See `decisions.md`. A–F are locked. Docs may start now; Builder after Docs (or parallel only if Planner says); Verifier only after Builder ships and Planner pings.
