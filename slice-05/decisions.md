# Slice 05 — Locked decisions (draft for Christoffer)

Drafted 2026-09-24 from audit of `app/src` after Slice 01–04 PASS and Christoffer’s approved 3-slice hall plan.  
**Status:** APPROVED by Christoffer 2026-09-24. Locked for Docs/Builder/Verifier.

---

## 1. CTA label and entry

**Decision:** Swedish CTA **Hallöversikt** on Passbyggaren.

- Visible in the builder top action row (alongside Spara utkast / Använd mall).
- **Enabled** when the pass has ≥1 `SessionItem` across any block.
- **Disabled** (with short title/tooltip) when the pass is empty: e.g. “Lägg till minst en övning först”.
- Navigates to a new App view `hall` (third view beside `home` | `builder`).
- Back from hall returns to Passbyggaren with the **same draft** (not Home).

**Why:** Matches product language (“hallöversikt” = hall overview). Clear for new coaches. Avoids vague “Karta” or English “Floor plan”.

---

## 2. Hall template

**Decision:** One template only in Slice 05: **`generic-trupp`** — generic truppgymnastik schematic.

- Not a specific club layout.
- Abstract schematic — coaches must not treat it as exact meters/blueprint.
- Full layout description: [`hall-template-generic.md`](./hall-template-generic.md).

---

## 3. Minimal zone set (Slice 05)

**Decision:** Five labeled zones:

| `zoneId` | Swedish label |
|---|---|
| `open` | Öppen yta |
| `trampett` | Trampett |
| `tumbling` | Tumbling |
| `vault` | Satsbräda |
| `mats` | Mattor |

**Why:** Enough for “where things run” without Slice 06 richness (mattberg detail, presets, snap). Labels use club Swedish coaches already know.

---

## 4. Coordinates and placement model

**Decision:**

- Store placements as **normalized coordinates 0–1** relative to the hall canvas width/height (chip **center**).
- Optional soft `zoneId` may be recorded when the chip’s center falls inside a zone’s bounding box at drop time — **informational only** in Slice 05 (no snap, no magnetic pull).
- Key placements by **`SessionItem.id`** (instance), not `activityId` — same drill twice in a pass can sit in two places.

---

## 5. Unplaced tray default

**Decision:**

- New session items start **unplaced** (appear in the tray).
- Placing = drag (or drop) onto the canvas → creates/updates a `HallPlacement`.
- Removing from hall = return to tray (delete that placement); pass item itself stays on the pass.
- When a `SessionItem` is **removed from the pass** (or template replace regenerates item ids), orphan placements are cleaned.
- Template replace → clear all `hallPlacements` (new item ids).

---

## 6. Chip visuals

**Decision:** Reuse existing design language:

- `VisualIcon` at size `item` (or slightly smaller chip-friendly tile if Builder needs ~32–36px — do not invent a new icon set).
- Block tint from `BLOCK_COLORS` (border + light bg).
- Swedish title (truncate with ellipsis if needed); duration optional on chip (show if space; full duration always in detail).
- `experiencedCoachOnly` → compact **Erfaren ledare** badge on chip; tapping chip may open existing ActivityDetail (or a thin read-only sheet) where the full warning still shows.
- Missing / unknown activity → fallback title **Övning saknas** + fallback VisualIcon; chip still placeable.

---

## 7. Persistence

**Decision:**

- Extend `Session` with optional `hallPlacements` and fixed `hallTemplateId: 'generic-trupp'`.
- Keep localStorage key **`gymnastics-planner-draft-v1`** — additive fields; old drafts load fine.
- Save on place/move/remove (same pattern as today’s `saveDraft` after edits, or auto-save when leaving hall — Builder may choose either as long as reload restores placements). Prefer: update session state on every placement change and call `saveDraft` (consistent with explicit Spara, plus auto-persist on hall edits is OK if documented).

---

## 8. Desktop vs phone

**Decision:**

- Desktop-first layout (tray beside or under canvas).
- Phone must be **usable**: scroll/pan canvas, chips tappable, tray accessible (collapsible strip OK).
- Advanced gesture polish (multi-touch, momentum, long-press menus) → Slice 07.

---

## 9. Safety

**Decision:** Hall board does **not** replace experienced-only warnings. If a chip opens activity detail, the existing badge + `role="alert"` warning copy must still appear for the two flagged drills.

---

## 10. Alternatives considered and rejected

| Approach | Why not for Slice 05 |
|---|---|
| **CTA “Golvplan” / “Karta”** | Sounds like a measured blueprint or venue map; “Hallöversikt” matches the approved goal wording. |
| **CTA “Visa hall”** | Weaker as a noun destination; Hallöversikt reads as a named screen. |
| **Club-specific floor plan** | Explicitly out; Christoffer locked generic truppgymnastik. |
| **Pixel / meter coordinates** | Harder to resize; normalized 0–1 survives canvas resize. |
| **Key by activityId** | Breaks when the same drill appears twice. |
| **Auto-place all items into zones on open** | Surprising; new-coach friendlier to start in tray and place intentionally. |
| **Snap-to-zone + presets** | Slice 06. |
| **Flow arrows / station numbers / print** | Slice 07. |
| **Require zoneId always** | Over-constrains free placement on open floor; zone is optional soft tag. |
| **Separate localStorage key for hall** | Splits draft; placements belong with the pass. |

---

## 11. Constraints carried from prior slices (do not reopen)

- Block order locked: Samling → Uppvärmning → Teknik → Styrka → Lek och spel
- Session total = sum of item durations only
- Soft mismatch stays in Passbyggaren (not reimplemented on hall)
- Swedish UI; athletes = gymnaster; session = pass
- Experienced-only: `tech-rondat-flickis`, `tech-salto-fran-hojd`
- Phone ≥44px primary tap targets (Slice 02)
- Offline / no CDN icons (Slice 04)

---

## 12. Open questions for Christoffer

**None required to start.** All product choices above are decided within the locked 3-slice plan.

Optional later (not blocking): whether Home should also show a “Fortsätt → Hallöversikt” shortcut — **default no** for Slice 05; entry only from Passbyggaren.

---

## Approval

- [ ] Christoffer approves Slice 05 approach + zone set + CTA **Hallöversikt**
- [ ] Docs: Swedish empty-state / tooltip microcopy if needed
- [ ] Builder: implement against this pack (no app work in this folder)
- [ ] Verifier: use `verification-checklist.md`
