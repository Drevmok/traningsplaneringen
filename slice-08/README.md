# Slice 08 — polish / cleanup specification pack

**App:** Träningsplaneraren  
**Date drafted:** 2026-09-24 (Europe/Stockholm)  
**Status:** **APPROVED by Christoffer 2026-09-24**

## Goal

Ship a narrow polish pass over the existing Hallöversikt/Golvklart experience. Remove dead placement-save copy, make the phone tray reliably reachable without hiding the active canvas, finish the Swedish accessibility chrome, make print calm and single-titled, and update the visible footer to Slice 08 when the slice ships.

This pack supersedes the open product questions at the end of [`AUDIT.md`](./AUDIT.md). `AUDIT.md` remains an unchanged read-only record of the audit.

## In scope

- **P08-01 Footer:** change the shipped app footer to exactly `Träningsplaneraren · Slice 08`; do not rewrite historical Slice 01–07 records.
- **P08-02 Silent placement save:** remove unused `Placering sparad` / `hallPlacementSaved` dead copy and path. Placement and preset auto-save remain silent; explicit builder save keeps `Utkast sparat`.
- **P08-03 Phone tray:** polish `Ej placerade` on screens ≤768px so it stays reliably reachable at the bottom while the canvas pans, including safe-area handling and compensating canvas bottom space.
- **P08-05 Swedish accessibility chrome:** replace remaining technical English such as `Zoom` with Swedish labels (`Zooma`, `Zooma in`, `Zooma ut` as applicable); keep visible hall chrome Swedish.
- **P08-08 Golvklart print:** provide one compact title/meta treatment, hide edit-only controls in print, and retain the schematic content and caption required by the product lock.
- **Copy regression:** preserve `Schematisk hall — inte exakt mått` and check the shipped surface for new English or wrong Slice labels.

## Out of scope

P08-04 keyboard drag; P08-06 removal of valid Utkast compatibility/data; P08-07 caption rewrite; P08-09 soft snap/zone animation; P08-10 new drills, coach filters, onboarding, CAD, sharing, export/PDF generation, hall reorder, new routes, new snap rules, or other features.

Historical documentation and compatibility fields are not cleaned up merely to make a text search empty.

## Pack contents

| File | Purpose |
|---|---|
| [`README.md`](./README.md) | Goal, boundaries, pack index, and approval criteria |
| [`decisions.md`](./decisions.md) | Locked product decisions, rejected alternatives, and carried constraints |
| [`screen-spec-polish.md`](./screen-spec-polish.md) | Footer, tray, accessibility, copy, and print behavior |
| [`verification-checklist.md`](./verification-checklist.md) | Verifier PASS/FAIL checks, scope guard, and Slice 01–07 regression |
| [`content/polish-copy.sv.md`](./content/polish-copy.sv.md) | Thin Swedish copy reference for accessibility labels |
| [`AUDIT.md`](./AUDIT.md) | Unchanged audit; this pack resolves its product questions |

## Acceptance for Christoffer (product owner)

Approve this draft when these six statements are locked:

1. **Footer:** once Slice 08 ships, the visible footer reads exactly **Träningsplaneraren · Slice 08**; historical Slice 01–07 notes stay untouched.
2. **Silent save:** the unused **Placering sparad** / `hallPlacementSaved` copy is removed; placement/preset auto-save remains silent, while **Utkast sparat** remains for explicit builder save.
3. **Phone tray:** at ≤768px, **Ej placerade** is reliably bottom-reachable during canvas pan, respects safe-area insets, and leaves canvas bottom padding at least as tall as the tray so the active drop/placement area is not permanently covered.
4. **Swedish a11y:** technical English such as `Zoom` is replaced by Swedish accessible names such as **Zooma**, **Zooma in**, and **Zooma ut**; no new English hall chrome is introduced.
5. **Golvklart print:** print has one compact session title/meta treatment; edit chrome, tray, and Golvklart action buttons are hidden; schematic, zones, caption **Schematisk hall — inte exakt mått**, station numbers, optional flow, and a soft unplaced banner remain.
6. **Regression and scope:** the canonical caption and Slice 01–07 behavior remain intact, and none of the explicitly excluded features or historical/compatibility records are changed.

**Approval flow:** Christoffer approves this pack → Builder implements without changing these docs → Verifier records PASS/FAIL in [`verification-checklist.md`](./verification-checklist.md).
