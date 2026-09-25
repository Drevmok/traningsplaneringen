# Slice 13 — Compose stations from equipment pieces

**App:** Träningsplaneraren  
**Owner approval needed before:** Docs polish / Builder implementation  
**Date drafted:** 2026-09-24  
**Status:** **APPROVED 2026-09-24** (Christoffer)

## Goal

Let coaches **compose a Teknik station from separate redskap** (equipment pieces) in a small Swedish library. The composed station still places as **one** Hallöversikt marker. **Tap** the marker → detail shows the activity **and** the equipment list.

**Coach outcome:** “Jag bygger stationen av redskapen vi faktiskt ställer upp, ser den som en markör på hallen, och trycker för att läsa hur den är sammansatt.”

## Direction lock (from Slice 12 / Christoffer)

- Slice 12 = visual station tiles + tap-to-detail (**shipped / approved**)
- Slice 13 = **equipment composition** (this pack) — build stations from pieces
- Hallöversikt stays **Teknik-only** unless Christoffer changes it in decisions
- Schematisk hall — inte exakt mått; device-local drafts; no accounts / cloud / Netlify in this pack

## Problem

Today a Teknik station is one library activity with one icon. Coaches think in **setups** (trampett + landningsmatta + mattberg, plint + madrass, …). Without a compose step, the floor map cannot show *what* is at the station — only *which drill*.

## Current baseline (do not regress)

- Placeable = `blockType === 'techniques'` only (Slice 11)
- Silent prune of non-Teknik placements
- Canvas: icon-first ~52px markers; tap → `ActivityDetail` read-only; drag ≠ detail (Slice 12)
- Erfaren on marker + detail; ranks / Golvklart Teknik-only
- Caption: **Schematisk hall — inte exakt mått**
- gymnaster / pass / Swedish UI
- `Activity.equipment?: string[]` exists but is barely used (legacy free-text); do not treat it as the compose model

## In scope

1. **Equipment library (seed)** — Full ~10-piece Swedish truppgymnastik catalog (Trampett, Satsbräda, Plint, Landningsmatta, Tumblingmatta, Madrass, Mattberg, Flickiskudde, Airtrack, Kon). Icon + short label each. Not a full shop inventory. **Mattberg** = one catalog piece.
2. **Compose station** — Ordered list of pieces (with simple counts) attached to a **Teknik** `SessionItem` on the draft. Coach picks pieces in a phone-friendly compose UI.
3. **One placeable marker** — Composition does **not** put each mat on the floor. Hallöversikt still places **one** marker per Teknik session item (Slice 12 marker anatomy). **No** equipment-count badge on the marker this slice.
4. **Tap → detail + equipment** — Placed tap still opens hall detail; sheet shows existing activity content **plus** the composed equipment list (Swedish). CTA: **Redigera redskap**.
5. **Defaults** — Optional seed defaults only on obvious vault/trampett/mattberg-style Teknik drills (not every Teknik drill).
6. **Compose entry (v1)** — Hall station detail only. Passbyggaren entry is **out** of Slice 13.
7. **Swedish microcopy** — Compose sheet, empty equipment, library labels (Docs seeds in `content/` → polish to `docs/`).
8. **Footer** — `Träningsplaneraren · Slice 13` when shipped.
9. Verification checklist.

## Out of scope

- Freeform CAD / drag individual pieces on the hall / exact meters / real floor plans
- Changing placeable blocks (stays Teknik-only unless decisions change)
- Full drill library expansion / new Teknik övningar beyond wiring selective defaults
- PDF / share libraries / accounts / cloud / Netlify republish in this pack
- Replacing ActivityDetail with a second parallel detail system (extend / thin wrap)
- Drag-reorder stations on hall; Passbyggaren library CRUD for custom equipment
- Passbyggaren compose entry (deferred past Slice 13)
- Marker equipment-count badge
- Multi-user inventory (“club owns 3 trampetter”)

## Pack contents

| File | Purpose |
|---|---|
| [`README.md`](./README.md) | Overview + acceptance + handoff |
| [`HANDOFF.md`](./HANDOFF.md) | Docs → Builder → Verifier order (Planner pings) |
| [`decisions.md`](./decisions.md) | Locked choices (APPROVED) |
| [`screen-spec.md`](./screen-spec.md) | Library, compose UI, detail, data hooks |
| [`content/station-compose.sv.md`](./content/station-compose.sv.md) | Swedish seeds for Docs |
| [`verification-checklist.md`](./verification-checklist.md) | Verifier pass/fail |

## Acceptance (met — Christoffer APPROVED 2026-09-24)

1. Coaches compose a Teknik station from a **small fixed equipment library** (all ~10 pieces; not free drawing).
2. The hall still shows **one marker per station**; pieces are listed in detail, not as separate floor pins; **no** marker badge.
3. **Tap** marker → detail includes **redskapslista**; CTA **Redigera redskap**; drag ≠ detail; Teknik-only / Slice 11–12 rules stay.
4. Compose UI is **phone-friendly** (sheet / bottom panel), entry from **hall detail only** for v1.
5. Defaults only on obvious vault/trampett/mattberg-style Teknik drills.
6. Scope stays first compose slice — **no** CAD, exact measures, accounts, Netlify, or full library rewrite.

## Handoff order (Planner pings — do not self-ping)

1. **Docs** first — Swedish polish of `content/station-compose.sv.md` → `docs/station-compose.sv.md`.
2. **Builder** implements against APPROVED decisions + polished docs.
3. **Planner** pings **Verifier** only after Builder ships.

See [`HANDOFF.md`](./HANDOFF.md).

## Prior context

- Slice 11: Teknik-only hall + compact chips  
- Slice 12: icon-first markers + tap-to-detail; **deferred** equipment composition → this slice  
