# Slice 07 — Station flow, phone polish, Golvklart

**App:** Träningsplaneraren  
**Owner approval needed before:** Docs polish / Builder implementation  
**Date drafted:** 2026-09-24  
**Status:** APPROVED by Christoffer 2026-09-24

## Goal

Finish the approved **3-slice hall plan**. Hallöversikt already places drills on a schematic hall (Slices 05–06). Slice 07 adds **stationsordning** (numbers + optional flow lines from Passbyggaren order), **phone touch polish** (sticky tray, pan vs chip drag, zoom), and **Golvklart** — a read-only floor-ready / print presentation for the coach on the mat.

**Coach outcome:** “Jag ser i vilken ordning stationerna körs, kan zooma på telefonen, och visa eller skriva ut en golvklar hallöversikt.”

## In scope

1. **Station order / flow** — numbers **1…N** on *placed* chips only, derived from Passbyggaren item order (blocks Samling→…→Lek och spel, then `order` within block). Optional soft flow connectors (**Visa flöde**, default ON). No drag-reorder on the hall.
2. **Phone touch polish** — sticky bottom tray; pan canvas unless pointer starts on a chip; keep **Placera här**; primary taps ≥44px; pinch-zoom **or** **+ / −** zoom (Builder picks one); zoom does not change stored coords; clear / long-press **Ta bort från hall**; usable preset picker.
3. **Golvklart (floor-ready / print)** — read-only presentation mode from hall header; hide edit chrome; show schematic + numbered chips + flow (if on) + zones + caption + title (+ duration if space); unplaced banner **N övningar ej placerade**; exit **Avsluta golvklart**; **Skriv ut** → `window.print()` + print CSS (landscape A4-friendly, offline, no PDF lib / CDN). Mode flag on hall view (`hallMode: 'edit' | 'floor'`), not a new App route.
4. Optional Session field `hallShowFlow?: boolean` (default true). Storage key unchanged.
5. Swedish UI seeds; experienced-only badge still visible in Golvklart.
6. Verification checklist for Verifier.

## Out of scope

- Club CAD, meters, AR, multi-user, export/share links
- New drills or Passbyggaren block editing beyond hall UI
- Drag-to-reorder stations on the hall (reorder stays in Passbyggaren)
- Changing snap / preset rules from Slice 06
- New placement fields; PDF library; persist `hallMode` across reloads
- Keyboard full-drag polish (still mouse DnD + Placera här)

## Pack contents

| File | Purpose |
|---|---|
| [`README.md`](./README.md) | This overview + acceptance |
| [`decisions.md`](./decisions.md) | Locked choices A–E + rejected alternatives |
| [`data-model.md`](./data-model.md) | Session/UI fields, flow algorithm, mode/print |
| [`screen-spec-floor-ready.md`](./screen-spec-floor-ready.md) | Numbers, flow toggle, phone polish, Golvklart, print |
| [`verification-checklist.md`](./verification-checklist.md) | Verifier pass/fail criteria |
| [`content/golvklart-copy.sv.md`](./content/golvklart-copy.sv.md) | Swedish string seeds for Docs |

## Acceptance for Christoffer (product owner)

Approve Slice 07 when you agree that:

1. **Stationsordning** comes only from Passbyggaren order (block walk + item `order`). Placed chips show badges **1…N** among *placed* items only; unplaced tray chips have no number. Spatial layout need not match number sequence.
2. **Visa flöde** draws optional soft dashed connectors between consecutive *placed* stations in that order (default ON). Toggle may persist as `hallShowFlow` on Session (default true). **No** hall drag-reorder that mutates pass order.
3. **Phone:** sticky tray; pan vs chip-drag distinction; Placera här kept; ≥44px targets; some enlarge path (pinch **or** +/−); remove without accident; preset picker usable.
4. **Golvklart** is the Swedish floor-ready mode (CTA from hall header; short alternate **Visa för golvet** OK in Docs). Read-only; soft unplaced banner; **Avsluta golvklart** returns to edit; **Skriv ut** uses `window.print()` + print CSS only.
5. Experienced-only: **Erfaren** badge stays visible in Golvklart; optional tap-to-detail with warning preferred.
6. Scope stays flow + phone polish + Golvklart/print — **no** club CAD, share links, new drills, or snap/preset rule changes.

**Approve** → Docs can polish Swedish microcopy; Builder implements against this pack; Verifier uses the checklist.

## Prior slices (siblings)

- [Slice 01](../slice-01/) — data model + Passbyggaren foundation  
- [Slice 02](../slice-02/) — phone sheet polish  
- [Slice 03](../slice-03/) — 28 real drills + experienced-only  
- [Slice 04](../slice-04/) — SVG VisualIcon tiles + block colors  
- [Slice 05](../slice-05/) — Hallöversikt foundation (**PASS**)  
- [Slice 06](../slice-06/) — zones, snap, presets (**PASS** / shipped 2026-09-24)

## Live Slice 06 audit (2026-09-24, read-only)

| Area | Shipped today |
|---|---|
| Draft key | `gymnastics-planner-draft-v1` (`saveDraft` / `loadDraft`) |
| Types | `Session.hallTemplateId` + `hallPlacements`; six `HallZoneId`s; three presets; **no** `hallShowFlow` / `hallMode` yet |
| Helpers | `listSessionItems` walks `session.blocks` + sort by `item.order`; `getUnplacedItems` / `getPlacedItems`; snap via `upsertPlacement` |
| UI | `HallBoard` / `HallCanvas` / `HallChip`; Hallayout select; tray; Placera här on ≤768px; remove on canvas chips |
| Phone | Narrow stack; no sticky tray; no zoom; pan/drag not fully distinguished |
| Persist | `saveDraft` on every placement / preset change |
| Deferred to 07 | Flow arrows, station numbers, Golvklart / print, advanced touch polish |

## Status

**Status:** APPROVED by Christoffer 2026-09-24
