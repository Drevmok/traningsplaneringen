# Slice 06 — Richer zones, snap-to-zone, hall presets

**App:** Träningsplaneraren  
**Owner approval needed before:** Docs polish / Builder implementation  
**Date drafted:** 2026-09-24  
**Status:** APPROVED by Christoffer 2026-09-24

## Goal

Upgrade Hallöversikt from Slice 05’s free-drop foundation into a **calmer, zone-aware hall**: richer schematic zones (including **Mattberg**), **snap-to-zone** when dropping on apparatus regions, and **2–3 named Swedish hall presets** the coach can switch between. Positions still save with the draft.

**Coach outcome:** “Övningarna landar snyggt i rätt zon — och jag kan byta hallayout utan att börja om.”

## In scope

1. **Richer zone set** on the default trupp hall (and alternate presets) — Öppen yta, Trampett, Tumbling, Satsbräda, Mattberg, Mattor (refined). Clear zone list locked in [`decisions.md`](./decisions.md).
2. **Snap-to-zone:** drop inside an apparatus zone → chip center snaps to that zone’s snap slot (soft magnetic feel OK). **Open floor stays free** (exact drop, no snap). Same rule for phone **Placera här**.
3. **Hall presets (3):** named Swedish layouts that swap zone bboxes; migrate placements by `zoneId` when possible.
4. Persist **`hallTemplateId`** (preset id) on the draft; placements keep `SessionItem.id` keys.
5. Swedish UI; Docs tone from Slice 05; experienced-only safety unchanged.
6. Verification checklist for Verifier.
7. Phone: snap must work with existing Placera här / touch path from Slice 05 (no full Slice 07 polish).

## Out of scope

- Flow arrows / station order / print-ready / floor-ready view (→ **Slice 07**)
- Real club CAD, meters, AR, multi-user
- New drills or Passbyggaren block editing beyond hall UI
- Export / share
- Keyboard full-drag polish (still mouse DnD + Placera här)
- Optional “Placering sparad” toast (still optional; silent auto-save OK)

## Pack contents

| File | Purpose |
|---|---|
| [`README.md`](./README.md) | This overview + acceptance |
| [`decisions.md`](./decisions.md) | Locked choices + rejected alternatives |
| [`data-model.md`](./data-model.md) | Preset ids, zone ids, snap, migration from Slice 05 |
| [`screen-spec-hall-presets.md`](./screen-spec-hall-presets.md) | Preset picker, snap UX, empty/edge, phone |
| [`hall-presets.md`](./hall-presets.md) | Each preset layout (normalized bboxes + snap slots) |
| [`verification-checklist.md`](./verification-checklist.md) | Verifier pass/fail criteria |

## Acceptance for Christoffer (product owner)

Approve Slice 06 when you agree that:

1. The richer zone set is: **Öppen yta**, **Trampett**, **Tumbling**, **Satsbräda**, **Mattberg**, **Mattor** — Mattberg **sits beside** Mattor (does not delete the Slice 05 `mats` id).
2. **Snap** applies to apparatus zones only; **öppen yta stays free placement**. Snap must also apply on phone via **Placera här**.
3. Three presets with Swedish labels: **Standard trupp**, **Tävling / linjer**, **Liten hall** (ids: `standard-trupp`, `tavling-linjer`, `liten-hall`). Old drafts with `generic-trupp` migrate to `standard-trupp`.
4. Switching preset remaps chips by `zoneId` into the new layout’s snap slots when the zone exists; otherwise keeps normalized x,y and re-resolves zone — chips are **not** silently returned to the tray.
5. Experienced-only drills still show badge + warning from hall → detail. Caption remains **Schematisk hall — inte exakt mått**.
6. Scope stays snap + presets + richer zones — **no** flow arrows, station order, or print view.

**Approve** → Docs can add Swedish microcopy for preset picker / snap hints; Builder implements against this pack; Verifier uses the checklist.

## Prior slices (siblings)

- [Slice 01](../slice-01/) — data model + Passbyggaren foundation  
- [Slice 02](../slice-02/) — phone sheet polish  
- [Slice 03](../slice-03/) — 28 real drills + experienced-only  
- [Slice 04](../slice-04/) — SVG VisualIcon tiles + block colors  
- [Slice 05](../slice-05/) — Hallöversikt foundation (**PASS** 2026-09-24)

## Planned follow-on (not this pack)

**Slice 07:** station order/flow, phone touch polish, floor-ready/print view. Do not implement 07 behavior here.

## Live Slice 05 audit (2026-09-24, read-only)

| Area | Shipped today |
|---|---|
| Draft key | `gymnastics-planner-draft-v1` (`saveDraft` / `loadDraft`) |
| Types | `HallZoneId` = open \| trampett \| tumbling \| vault \| mats; `HallTemplateId` = `'generic-trupp'`; `HallPlacement` = sessionItemId + x,y ∈ [0,1] + optional zoneId |
| Helpers | `app/src/lib/hall.ts` — bboxes, `resolveZoneId`, upsert/remove/prune/migrate |
| UI | `HallBoard` / `HallCanvas` / `HallChip`; soft zoneId on drop; **no snap** |
| Phone | Narrow ≤768: tap tray chip → tap canvas (**Placera här**) |
| Persist | `saveDraft` on every placement change |
| Non-blocking debt | No “Placering sparad” toast; no keyboard full-drag — acceptable deferrals, not Slice 06 blockers |
