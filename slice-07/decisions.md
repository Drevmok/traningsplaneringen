# Slice 07 — Locked decisions (draft for Christoffer)

Drafted 2026-09-24 from audit of Slice 05–06 PASS (`HallBoard` / `HallCanvas` / `HallChip`, `lib/hall.ts`, `types.ts`, `blockMeta.ts` UI keys, `SLICE06-SHIPPED.md`) and the approved 3-slice hall plan.  
**Status:** APPROVED by Christoffer 2026-09-24

---

## A. Station order / flow

### A1. Order source

**Decision:** Stationsordning = Passbyggaren item order.

1. Walk blocks in fixed order: Samling → Uppvärmning → Teknik → Styrka → Lek och spel (`BLOCK_ORDER` / `session.blocks` which must remain that order).
2. Within each block, sort items by `SessionItem.order` ascending.
3. That full sequence is the pass order. **Station numbers** apply only to items that currently have a `HallPlacement` (placed chips).

Reuse / extend `listSessionItems` (already walks blocks + sorts by `order`).

### A2. Numbers

**Decision:** Placed chips show a small badge **1…N** reflecting global order among *placed* items only (skip unplaced).

- If coach places pass-item #3 before #1, badges still follow pass order (e.g. chip that is third in pass but first placed gets **3** once others are placed — numbering is always “rank among currently placed in pass order”).
- Spatially, numbers need **not** be contiguous on the canvas — that is OK.
- Unplaced tray chips show **no** station number.
- Help text may say numbers follow passordningen (**Stationsordning följer passet**).

### A3. Flow lines

**Decision:** Optional soft SVG/CSS connectors between consecutive *placed* stations in pass order.

- Muted dashed polyline from chip-center to chip-center (normalized coords → canvas %).
- Toggle **Visa flöde** / **Dölj flöde**.
- Default **ON** for desktop (and phone when space allows).
- Preference: persist `hallShowFlow?: boolean` on Session (default `true` when missing). If Builder finds persist hard, session UI state only is acceptable for PASS — prefer persist when easy.
- Flow hidden when fewer than 2 placed chips.
- Flow visible in edit mode when toggle ON, and in Golvklart when toggle was ON (carry current preference into floor mode).

### A4. No hall reorder

**Decision:** Do **not** add drag-to-reorder stations on the hall that mutates Passbyggaren order. Reorder stays in Passbyggaren (Flytta upp / ner).

### A5. Tray

**Decision:** Unplaced chips show no station number. Tray help may include **Stationsordning följer passet**.

---

## B. Phone touch polish

### B1. Sticky tray

**Decision:** On narrow screens (≤768px), tray is a **sticky bottom strip** that stays reachable while the canvas scrolls/pans.

### B2. Pan vs chip drag

**Decision:** Pointer distinction:

- Pointer **starts on a chip** → drag that chip (or begin place interaction).
- Pointer starts on empty canvas / floor → **pan / scroll** the canvas (do not steal as chip drag).
- Keep existing **Placera här** path (tap tray chip → tap canvas) as reliable alternate.

### B3. Tap targets

**Decision:** Primary tap targets ≥44px (Slice 02 — already required). Applies to Golvklart CTAs, flow toggle, zoom controls, preset select, remove.

### B4. Zoom

**Decision:** Builder picks **one**:

- Pinch-zoom on the hall canvas, **or**
- Simple **+ / −** zoom control on phone.

Checklist requires *some* way to enlarge the hall on narrow screens. **Zoom is view-only** — does **not** change stored normalized `x,y`.

### B5. Remove

**Decision:** Long-press **or** clear **Ta bort från hall** control remains available without accidental remove (do not remove on single short tap that was meant to open detail or start drag).

### B6. Preset picker

**Decision:** Hallayout picker remains usable on phone (compact `<select>` OK, ≥44px height).

---

## C. Floor-ready / print (Golvklart)

### C1. Naming

**Decision:** Swedish mode name **Golvklart**. CTA from hall header. Alternate short label **Visa för golvet** may appear in Docs / secondary copy; primary button = **Golvklart**.

### C2. Entering Golvklart

**Decision:** Read-only presentation mode:

- Hide tray editing chrome, hide drag affordances / place-mode, hide (or disable) preset switch if it would mutate layout mid-presentation — prefer **hide** edit controls; showing current preset name as read-only text is OK.
- Show: schematic + placed chips with station numbers + flow (if ON) + zone labels + caption **Schematisk hall — inte exakt mått** + session title + duration summary if space (`session.totalMinutes` or item-sum — same as Passbyggaren total).
- Unplaced count banner if any remain: **N övningar ej placerade** (soft, **not** blocking entry).

### C3. Exit

**Decision:** **Avsluta golvklart** → back to editable Hallöversikt (`hallMode: 'edit'`).

### C4. Print

**Decision:** **Skriv ut** triggers `window.print()` with print CSS:

- Landscape A4-friendly.
- Hide app chrome / nav / edit buttons.
- Keep schematic + chips + numbers + title (+ flow if on, zone labels, caption).
- **No** PDF library, **no** CDN.
- Offline-only.

### C5. Routing

**Decision:** Not a separate App route required — mode flag on hall view is fine: `hallMode: 'edit' | 'floor'`. **Do not** persist mode across reloads (always open hall in `edit`).

### C6. Experienced-only in Golvklart

**Decision:** Keep **Erfaren** badge visible on chip. Prefer badge + optional tap-to-detail (ActivityDetail read-only with existing `role="alert"` warning). Badge-only is acceptable if detail is too heavy for floor mode — prefer badge + tap.

---

## D. Persistence / scope

**Decision:**

- Storage key stays **`gymnastics-planner-draft-v1`**.
- Optional new Session field: `hallShowFlow?: boolean` (default `true` when absent).
- No new placement fields required.
- Do **not** add club CAD, meters, export share links, multi-user, new drills.
- Do **not** change snap / preset rules from Slice 06.
- `hallMode` is UI state only (not on Session).

---

## E. Swedish copy seeds

Put these in decisions / screen-spec / content stub (Docs polish later):

| Seed | Swedish |
|---|---|
| Floor mode | **Golvklart** |
| Exit floor | **Avsluta golvklart** |
| Flow on | **Visa flöde** |
| Flow off | **Dölj flöde** |
| Print | **Skriv ut** |
| Unplaced banner | **N övningar ej placerade** |
| Order help | **Stationsordning följer passet** |
| Caption (keep) | **Schematisk hall — inte exakt mått** |
| Alternate CTA short | **Visa för golvet** |

---

## Alternatives considered and rejected

| Approach | Why not |
|---|---|
| **Drag-reorder on hall mutates pass order** | Confusing dual source of truth; Passbyggaren already owns order. |
| **Numbers = placement order (when dropped)** | Breaks coach mental model of pass flow; locked to pass order. |
| **Number all items including unplaced on canvas ghosts** | Clutters; unplaced stay in tray without numbers. |
| **Require contiguous spatial path for PASS** | Numbers may skip spatially — OK by product lock. |
| **Separate App route `/golvklart`** | Unnecessary; mode flag on hall is enough. |
| **PDF.js / CDN print** | Offline / no-CDN constraint from Slice 04. |
| **Block Golvklart until all placed** | Soft banner only; coach may still show partial hall. |
| **Persist hallMode** | Would reopen in floor mode after Fortsätt — surprising; always edit. |
| **Change snap / presets** | Slice 06 locked; out of scope. |
| **Club CAD / meters / share links** | Explicitly out. |

---

## Constraints carried from prior slices (do not reopen)

- Block order: Samling → Uppvärmning → Teknik → Styrka → Lek och spel
- Session total = sum of item durations; soft mismatch stays in Passbyggaren
- Swedish UI; athletes = gymnaster; session = pass
- Experienced-only: `tech-rondat-flickis`, `tech-salto-fran-hojd`
- Phone ≥44px primary tap targets
- Offline / no CDN icons or hall art
- Entry from Passbyggaren **Hallöversikt**; back → Passbyggaren
- Six zones + three presets + snap apparatus / free open (Slice 06)
- Caption: **Schematisk hall — inte exakt mått**
- Storage key `gymnastics-planner-draft-v1`

---

## Non-blocking debt from Slice 05–06 (do not block 07)

- Optional toast `Placering sparad` unused — leave optional
- No keyboard full-drag — still OK
- Soft zone highlight during drag / snap ease — still nice-to-have
- These are **not** Slice 07 acceptance criteria

---

## Open questions for Christoffer

**None required to start.** All product choices above are locked in the brief (A–E).

---

## Approval

- [x] Christoffer approves station order/flow + phone polish + Golvklart/print approach
- [ ] Docs: polish Swedish microcopy from `content/golvklart-copy.sv.md` if needed
- [ ] Builder: implement against this pack (no app work in this folder)
- [ ] Verifier: use `verification-checklist.md`

**Status:** APPROVED by Christoffer 2026-09-24
