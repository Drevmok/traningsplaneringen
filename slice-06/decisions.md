# Slice 06 — Locked decisions (draft for Christoffer)

Drafted 2026-09-24 from audit of Slice 05 PASS (`app/src/lib/hall.ts`, HallBoard/Canvas/Chip, `SLICE05-SHIPPED.md`, verifier report) and the approved 3-slice hall plan.  
**Status:** APPROVED by Christoffer 2026-09-24. Locked for Docs/Builder/Verifier.

---

## 1. Richer zone set

**Decision:** Six labeled zones. Keep all five Slice 05 `zoneId`s stable; **add** `mattberg`.

| `zoneId` | Swedish label | Role |
|---|---|---|
| `open` | Öppen yta | General floor / fogis / games — **free placement** |
| `trampett` | Trampett | Apparatus — **snaps** |
| `tumbling` | Tumbling | Apparatus — **snaps** |
| `vault` | Satsbräda | Apparatus (vault / board) — **snaps** |
| `mattberg` | Mattberg | Foam / soft mountain — **snaps** (**NEW**) |
| `mats` | Mattor | General mats / soft landing strip — **snaps** (refined, often smaller than Slice 05) |

**Mattberg vs Mattor:** Mattberg **sits beside** Mattor. Do **not** delete or rename `mats`. Coaches know both words; Mattberg is the foam mountain, Mattor is general mats.

**Rejected clutter:** separate `runup` / `landing` zone ids — vault + mattberg + mats already cover that story without packing the schematic.

---

## 2. Snap policy

**Decision:** **Snap only inside apparatus zones** (`trampett`, `tumbling`, `vault`, `mattberg`, `mats`). **Öppen yta stays free** — chip stays at exact drop (clamped). Drop outside all zones but on canvas → free place; `zoneId` undefined or nearest open if inside open bbox.

**Snap target:** chip **center** → zone’s single **snap slot** (normalized point, usually near zone center). Soft magnetic feel (short CSS/transform ease ~120–200 ms) is OK; not required for PASS if position jumps correctly on drop end.

**Multiple chips in one zone:** do **not** refuse drops. Offset subsequent chips slightly from the slot (e.g. spiral or row offset ~0.03–0.05 normalized) so they remain readable. Exact offset algorithm is Builder choice; document in PR.

**Phone:** `placeAt` / **Placera här** must call the **same** snap helper as mouse DnD. Fail if desktop snaps but phone places raw tap coordinates inside apparatus zones.

**Why:** Snap reduces mess on apparatus strips; free open floor keeps “fogis / samling stations” flexible and avoids fighting the coach.

---

## 3. Hall presets (count + names)

**Decision:** Exactly **three** presets.

| Preset id | Swedish label | Intent |
|---|---|---|
| `standard-trupp` | **Standard trupp** | Default enriched trupp schematic (successor to Slice 05 `generic-trupp`) |
| `tavling-linjer` | **Tävling / linjer** | More linear apparatus lanes (competition / line feel) |
| `liten-hall` | **Liten hall** | Compact layout — larger open share, smaller apparatus strips |

Layouts: [`hall-presets.md`](./hall-presets.md).

**Default:** `standard-trupp` for new sessions and for migrated Slice 05 drafts.

**Id migration:** persisted `hallTemplateId: 'generic-trupp'` → treat as / rewrite to `'standard-trupp'` on load. Do not keep `generic-trupp` in the public union after Slice 06 ships (alias only during migrate).

---

## 4. Preset switch — placement migration

**Decision:** When the coach changes preset:

1. If placement has `zoneId` that **exists** in the target preset → move chip center to that zone’s snap slot (with multi-chip offset if needed); keep `zoneId`.
2. Else if `zoneId` missing or not in target → **keep** normalized `x,y`; clamp; **re-resolve** `zoneId` against new bboxes (may become free open or undefined).
3. **Never** silently return chips to the tray on preset switch.
4. Persist new `hallTemplateId` immediately with updated placements (`saveDraft`).

**Why:** Remap-by-zone preserves intent (“this was on trampett”); keep-xy is safer than wiping work when a zone is absent in a compact layout.

---

## 5. Persistence

**Decision:**

- Extend `HallTemplateId` union to the three preset ids; store on `Session.hallTemplateId`.
- Keep storage key **`gymnastics-planner-draft-v1`** — additive / alias migration only.
- Save on place/move/remove **and** on preset change (same pattern as Slice 05).
- No new snap fields required on `HallPlacement` for PASS (snap is computed at drop). Optional future `snapSlotIndex` is out of scope.

---

## 6. Visual / chip language (unchanged principles)

- Reuse `VisualIcon` + `BLOCK_COLORS`; Swedish titles; **Erfaren** badge.
- Caption remains **Schematisk hall — inte exakt mått**.
- Zone fills stay muted; chips carry block color.
- New zone **Mattberg** gets a soft stacked/foam visual cue (Builder: CSS/SVG abstract — no photo, no CDN).

---

## 7. Safety

**Decision:** Unchanged from Slice 05. Hall never hides experienced-only warnings. Detail from chip still shows `role="alert"` for `tech-rondat-flickis` / `tech-salto-fran-hojd`.

---

## 8. Desktop vs phone

**Decision:**

- Preset picker visible on hall header (desktop + phone).
- Phone: stacked layout from Slice 05; snap on Placera här; no Slice 07 gesture polish required.
- Tray / remove / back behavior unchanged.

---

## 9. Alternatives considered and rejected

| Approach | Why not |
|---|---|
| **Snap everywhere including open** | Fights free station layout on open floor; feels sticky for fogis/games. |
| **Snap-only world (no free place)** | Too rigid for new coaches; Slice 05 free place was approved. |
| **Replace `mats` with `mattberg` only** | Breaks Slice 05 zone vocabulary; loses “Mattor” label coaches expect. |
| **Add run-up + soft-landing as separate zones** | Clutter on a schematic; vault/mattberg/mats enough. |
| **Keep id `generic-trupp` as display name** | Swedish product label should be **Standard trupp**; migrate id cleanly. |
| **Return unmapped chips to tray on preset switch** | Surprising data loss; remap/keep-xy is friendlier. |
| **4+ presets / club CAD** | Out of scope; three covers Standard / lines / small. |
| **Flow arrows / print** | Slice 07. |
| **Store pixel snap offsets** | Normalized slot + recompute is enough. |

---

## 10. Constraints carried from prior slices (do not reopen)

- Block order, totals = item sum, soft mismatch in Passbyggaren only
- Swedish UI; gymnaster / pass
- Experienced-only pair unchanged
- Phone ≥44px primary taps
- Offline / no CDN hall art
- Entry still from Passbyggaren **Hallöversikt**; back → Passbyggaren

---

## 11. Non-blocking debt from Slice 05 (do not block 06)

- Optional toast `Placering sparad` unused — leave optional
- No keyboard full-drag — still OK
- These are **not** Slice 06 acceptance criteria

---

## 12. Open questions for Christoffer

**None required to start.** All product choices above are decided within the locked 3-slice plan.

---

## Approval

- [ ] Christoffer approves richer zones (Mattberg beside Mattor) + snap policy + three presets
- [ ] Docs: Swedish microcopy for preset picker / snap hint if needed
- [ ] Builder: implement against this pack (no app work in this folder)
- [ ] Verifier: use `verification-checklist.md`
