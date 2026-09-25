# Slice 15 — Förrådslista (aggregate packing list)

**App:** Träningsplaneraren  
**Approval:** Christoffer approved 2026-09-25; next Docs polish → Builder → Verifier  
**Date approved:** 2026-09-25  
**Status:** **APPROVED 2026-09-25** (Christoffer)

**Backlog:** Idea 3 Approved 2026-09-25 (Christoffer via Planner) → this pack is **APPROVED** with all Planner recommendations A–F locked. Idea 2 (Kom igång) is also Approved but **not** this pack — leave for a later slice.

## Goal

Give coaches one **read-only packing list** for the storeroom across the whole pass: merge all non-empty `SessionItem.stationEquipment` by `pieceId`, sum counts, Swedish labels from the fixed 10-piece library.

**Coach outcome:** “Jag öppnar Förrådslista innan passet — ser 2× Landningsmatta, 1× Trampett… och slipper öppna varje station.”

## Direction lock (from Christoffer / product / hard locks)

- Read-only **Förrådslista** (title via Docs; seed below)
- Aggregate: merge non-empty `stationEquipment` by `pieceId`, **sum** counts
- Labels from fixed **10-piece** library only (`equipmentPieces.ts`)
- Reachable from both Hallöversikt **edit** chrome and Golvklart
- Empty state nudges compose via existing detail CTA wording (**Redigera redskap**)
- **No** custom equipment field
- **No** “vi har N i förrådet” club inventory
- **Bottom sheet**; **phone-first**
- Effort S–M
- **NO** CAD / equipment pins on floor
- **NO** Passbyggaren compose entry (hall detail only for compose)
- **NO** canvas equipment-count badge
- Teknik-only placeable intact
- No accounts / cloud
- Do **not** block Golvklart
- Caption **Schematisk hall — inte exakt mått** unchanged
- Slice 11–14 behaviors intact
- Footer `Träningsplaneraren · Slice 15` when shipped
- **Netlify out of pack scope** unless Christoffer asks

## Problem

Slice 13 stores compositions on each Teknik `SessionItem`; Slice 14 surfaces them **per station** on Golvklart/print. Nothing rolls them up into one packing list — coaches still open every detail (or scan every markör) to know what to pull from the förråd.

## Current baseline (do not regress)

- Placeable = `blockType === 'techniques'` only (Slice 11); silent prune
- Canvas: icon-first ~52px markers; tap → detail; drag ≠ detail (Slice 12)
- Compose: hall-detail **Redigera redskap** only; no Passbyggaren compose; no marker badge (Slice 13)
- Data: `SessionItem.stationEquipment?: Array<{ pieceId; count }>` — `undefined` = unset; `[]` = cleared; non-empty = saved recipe
- Soft caps per station: max **8** slots; count **≤ 9** per piece (`sanitizeStationEquipment`)
- Golvklart: under-marker redskap when non-empty; edit canvas clean (Slice 14)
- Caption: **Schematisk hall — inte exakt mått**
- gymnaster / pass / Swedish UI; device-local drafts
- Live Slice 14: https://fancy-blancmange-4d516b.netlify.app/

## In scope

1. **Aggregate packing list** — Across all Teknik `SessionItem`s on the draft pass: for each non-empty `stationEquipment`, merge by `pieceId` and **sum** counts; resolve Swedish `labelSv` via the fixed library; ignore unknown ids.
2. **Entry** — CTAs from both Hallöversikt edit chrome and Golvklart.
3. **UI** — Phone-first **bottom sheet**; read-only list.
4. **Empty / partial** — Empty aggregate nudges compose using existing detail CTA wording; partial = only composed stations contribute (quiet omit for unset/`[]`).
5. **Line format** — Reuse Slice 13/14: count===1 → `{label}` only; count>1 → `{n}× {label}`.
6. **Print** — Include on print when non-empty.
7. **Swedish microcopy seeds** — `content/forradslista.sv.md` → Docs polish → `docs/forradslista.sv.md`.
8. **Footer** — `Träningsplaneraren · Slice 15` when shipped.
9. Verification checklist (phone-first; Netlify not required).

## Out of scope

- Custom coach-authored redskap / catalog CRUD
- Club inventory (“vi har N i förrådet”) / stock tracking
- CAD / per-piece floor pins / exact measures
- Passbyggaren compose entry
- Canvas equipment-count badge on markers
- Changing Teknik-only placeable rules
- Blocking Golvklart until compositions exist
- **Kom igång** compose checklist step (Approved idea 2 — **later slice**)
- Changing Slice 14 under-markör / print-per-station behavior
- Accounts / cloud / App Store
- **Netlify** republish in this pack
- New equipment catalog pieces
- Editing counts from the packing list (read-only)

## Pack contents

| File | Purpose |
|---|---|
| [`README.md`](./README.md) | Overview + acceptance + handoff |
| [`decisions.md`](./decisions.md) | Locked decisions and answers A–F |
| [`screen-spec.md`](./screen-spec.md) | Entry, list UI, empty/partial, print? |
| [`content/forradslista.sv.md`](./content/forradslista.sv.md) | Swedish seeds for Docs |
| [`verification-checklist.md`](./verification-checklist.md) | Verifier pass/fail |
| [`HANDOFF.md`](./HANDOFF.md) | Docs → Builder → Verifier order |

## Acceptance (binding — pack APPROVED)

1. Coach can open **Förrådslista** from the locked entry point(s) and see one merged list: piece → summed count, Swedish library labels.
2. Only **non-empty** saved `stationEquipment` contribute; unset and `[]` are omitted (quiet).
3. Empty aggregate shows empty copy that points at existing compose path (**Redigera redskap** / detail), without inventing inventory language.
4. Read-only; no custom pieces; no “vi har N” inventory.
5. Slice 11–14 intact: Teknik-only, one marker, compose hall-detail only, no badge, no CAD, Golvklart not blocked, caption unchanged, under-markör redskap still works.
6. Phone-first (~390px); footer Slice 15 when shipped; Netlify not required by this pack.

## Locked answers A–F

See [`decisions.md`](./decisions.md) for the binding decisions. Both entry points, the bottom sheet, library order, print when non-empty, quiet omit of unset/`[]`, and the Slice 15 footer are locked.

## Handoff order (Planner pings — do not self-ping)

1. **Approval complete** — Christoffer locked A–F on 2026-09-25
2. **Docs** — Polish `content/forradslista.sv.md` → `docs/forradslista.sv.md`
3. **Builder** — Implement against APPROVED decisions + screen-spec + polished docs
4. **Verifier** — Planner pings only after Builder ships; use `verification-checklist.md`

## Prior context

- Slice 13: `stationEquipment` compose + detail **Redigera redskap** (shipped)
- Slice 14: Golvklart & print redskap under markör (shipped / live)
- Backlog Scout 2026-09-25 idea 3 → Approved → Slice 15 pack APPROVED 2026-09-25
- Idea 2 Kom igång Approved but **deferred** past Slice 15
