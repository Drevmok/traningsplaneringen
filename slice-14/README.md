# Slice 14 — Golvklart & print: redskap under each station

**App:** Träningsplaneraren  
**Owner approval needed before:** Docs polish / Builder implementation  
**Date drafted:** 2026-09-25  
**Status:** **APPROVED 2026-09-25** (Christoffer)

**Backlog:** Idea 1 Approved 2026-09-25 (Christoffer via Planner) → pack **APPROVED** with all recommended answers to open questions A–D. Ideas 2–3 stay Proposed.

## Goal

Show each Teknik station’s **composed redskap** on **Golvklart** (floor view) and **`@media print`**, under the numbered markör, so coaches see setup on the floor / paper **without tapping every station**.

**Coach outcome:** “Jag håller upp Golvklart eller skriver ut — under varje nummer syns trampett och landningsmatta, inte bara ikonen.”

## Direction lock (from Christoffer / product)

- Show composed lines from `SessionItem.stationEquipment` under each numbered Teknik station in **Golvklart** and **print**
- **Count === 1:** `{label}` only (omit ×) — match Slice 13 detail (`stationEquipmentOne`); otherwise `{count}× {label}`
- **Many pieces:** show **all** lines up to soft cap **8** (no “+N till” truncation)
- **Layout:** under each numbered Teknik markör (not a side list)
- **Golvklart screen:** equipment lines only; short station title stays **print-only** as today
- **Unset** composition → **quiet** (no forced “inga redskap”; default quiet)
- **Saved empty `[]`** → nothing shown
- **NO** canvas equipment badge on Hallöversikt edit markers
- **NO** Passbyggaren compose entry
- **NO** CAD / separate equipment pins
- Teknik-only hall placement intact; Slice 12 marker + Slice 13 compose intact
- Caption **Schematisk hall — inte exakt mått** unchanged
- Swedish UI; gymnaster / pass; device-local
- Footer `Träningsplaneraren · Slice 14` when shipped
- **Netlify out of pack scope**

## Problem

Slice 13 stores compositions on `SessionItem.stationEquipment` and shows them only in hall **detail**. Golvklart / print still show icon + rank (+ short title on paper) — coaches must tap every markör to see redskap. Floor/paper is where the list is most useful.

## Current baseline (do not regress)

- Placeable = `blockType === 'techniques'` only (Slice 11); silent prune
- Canvas: icon-first ~52px markers; tap → detail; drag ≠ detail (Slice 12)
- Compose: hall-detail **Redigera redskap** only; no Passbyggaren compose; no marker badge (Slice 13)
- Data: `SessionItem.stationEquipment?: Array<{ pieceId; count }>` — `undefined` = unset (detail may show förslag); `[]` = cleared; non-empty = saved recipe
- Golvklart: read-only floor; **Skriv ut** → `window.print()`; print reveals short title under canvas chips (`hall-chip-title--print`)
- Edit Hallöversikt: titles/equipment **not** under markers on screen
- Caption: **Schematisk hall — inte exakt mått**
- gymnaster / pass / Swedish UI; device-local drafts

## In scope

1. **Golvklart redskap lines** — For each placed numbered Teknik markör, when `stationEquipment` is **non-empty**, show composed lines under the markör (Swedish labels from the fixed 10-piece library).
2. **Print redskap lines** — Same lines visible in `@media print` (with existing short title treatment).
3. **Quiet empty / unset** — Unset (`undefined`) and saved `[]` show **no** equipment lines and **no** “inga redskap” on floor/print (detail empty copy stays Slice 13).
4. **No förslag on floor/print** — Seed `defaultStationEquipment` stays detail/compose-only; do not invent floor lines from unset + defaults.
5. **Swedish microcopy seeds** — Floor/print keys in `content/golvklart-redskap.sv.md` → Docs polish → `docs/golvklart-redskap.sv.md`.
6. **Footer** — `Träningsplaneraren · Slice 14` when shipped.
7. Verification checklist (phone Golvklart + print smoke).

## Out of scope

- Canvas equipment-count **badge** on markers (edit or floor)
- Passbyggaren compose entry
- CAD / per-piece floor pins / exact measures
- Changing Teknik-only placeable rules
- Förrådslista aggregate (backlog idea 3 — still Proposed)
- Kom igång compose checklist step (backlog idea 2 — still Proposed)
- Accounts / cloud / App Store
- **Netlify** republish in this pack
- New equipment catalog pieces / custom redskap
- Changing hall detail / compose sheet behavior except reuse of labels
- Side-list layout beside the schematic
- “+N till” truncation of equipment lines
- Showing short activity title on Golvklart **screen** (stays print-only)

## Pack contents

| File | Purpose |
|---|---|
| [`README.md`](./README.md) | Overview + acceptance + handoff |
| [`decisions.md`](./decisions.md) | Locked decisions (APPROVED) |
| [`screen-spec.md`](./screen-spec.md) | Golvklart + print behavior |
| [`content/golvklart-redskap.sv.md`](./content/golvklart-redskap.sv.md) | Swedish seeds for Docs |
| [`verification-checklist.md`](./verification-checklist.md) | Verifier pass/fail |
| [`HANDOFF.md`](./HANDOFF.md) | Docs → Builder → Verifier order |

## Acceptance (binding — pack APPROVED)

1. Golvklart shows composed lines under each numbered Teknik station that has **non-empty** `stationEquipment`: count===1 → `{label}` only; else `{count}× {label}`; all lines up to 8.
2. Print shows the same equipment lines **after** the existing short title (title remains print-only on screen).
3. Unset and saved `[]` stay quiet on floor/print — no forced empty copy.
4. Edit Hallöversikt canvas stays free of equipment badge / under-marker redskap clutter (floor+print only).
5. Slice 11–13 locks intact: Teknik-only, one marker, tap detail + compose, no Passbyggaren compose, no CAD pins.
6. Caption and Swedish / gymnaster / pass / device-local unchanged; footer Slice 14 when shipped; Netlify not required by this pack.

## Handoff order (Planner pings — do not self-ping)

1. ~~Christoffer Approves this pack~~ **Done 2026-09-25**
2. **Docs** — Polish `content/golvklart-redskap.sv.md` → `docs/golvklart-redskap.sv.md` (mirror; see `HANDOFF.md`).
3. **Builder** — Implement against APPROVED decisions + screen-spec + polished docs.
4. **Verifier** — Planner pings only after Builder ships; use `verification-checklist.md`.

## Prior context

- Slice 12: icon-first markers + print short titles  
- Slice 13: `stationEquipment` compose + detail Redskap (shipped)  
- Backlog Scout 2026-09-25 idea 1 → Approved → pack APPROVED 2026-09-25  
