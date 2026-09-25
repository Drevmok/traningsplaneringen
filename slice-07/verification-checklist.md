# Verification checklist — Slice 07 (flow, phone polish, Golvklart)

**Slice passes when** a coach can see **station numbers 1…N** on placed chips following Passbyggaren order, optionally show **flow** connectors, use a **usable phone** hall (sticky tray, pan vs chip drag, some zoom, Placera här, remove without accident, preset picker), enter **Golvklart** read-only with unplaced soft banner, exit back to edit, and **Skriv ut** via `window.print()` + print CSS — without breaking Slice 01–06 behavior or inventing product rules outside this pack.

Use this checklist as sole Slice 07 authority after Christoffer approval.

**Status:** APPROVED by Christoffer 2026-09-24

---

## Locked pass/fail rules

- **Order source:** Station badges among *placed* chips follow Passbyggaren order (blocks Samling→…→Lek och spel, then `item.order`). Fail if numbers follow drop-time order, random order, or spatial left-to-right instead of pass order.
- **Placed-only numbers:** Unplaced tray chips have **no** station number; placed chips show **1…N** contiguous among currently placed. Fail if tray shows numbers, or if badges skip/renumber incorrectly when one of three placed items is removed (remaining must renumber 1…N−1 in pass order).
- **Spatial OK:** Badges need not be contiguous on the canvas — do **not** fail for “out of spatial order.”
- **Flow toggle:** **Visa flöde** / **Dölj flöde** exists; default ON; when ON and ≥2 placed, muted dashed connectors link consecutive placed stations in pass order. Fail if toggle missing, or connectors ignore pass order.
- **No hall reorder:** Dragging chips must **not** change Passbyggaren item order. Fail if hall drag mutates `order` / block sequence.
- **Phone sticky tray:** On ~390px width, tray remains reachable while canvas scrolls/pans. Fail if tray scrolls fully off and is unreachable without leaving hall.
- **Pan vs drag:** Pointer on empty canvas pans/scrolls; chip drag only when pointer starts on chip. Fail if every canvas touch grabs a chip or makes pan impossible. **Placera här** still works.
- **Zoom:** Some enlarge path on narrow screens (pinch **or** +/−). Fail if neither exists. Zoom must **not** change stored normalized coords after reload.
- **Remove:** Clear remove path without accidental single-tap remove when opening detail. Fail if short tap meant for detail deletes placement with no confirmation/affordance distinction.
- **Golvklart:** Header CTA enters read-only mode; tray/drag chrome hidden; numbers (+ flow if on) + zones + caption + title visible; **Avsluta golvklart** returns to edit. Fail if mode missing or edit chrome still dominant.
- **Unplaced banner:** With unplaced items, soft **N övningar ej placerade** (or singular equivalent) appears; entry **not** blocked. Fail if Golvklart refuses entry when any unplaced.
- **Print:** **Skriv ut** calls print path; print layout keeps schematic + chips + numbers + title and hides app chrome. Fail if button missing, or if implementation depends on a PDF CDN/library.
- **Experienced:** **Erfaren** badge visible in Golvklart; if detail opens, warning still shows. Fail if hall/floor path suppresses experienced safety.
- **Persist:** Storage key remains `gymnastics-planner-draft-v1`. Optional `hallShowFlow` OK. `hallMode` must **not** be required on Session. Snap/presets unchanged from Slice 06.
- **Scope guard:** Absence of club CAD, meters, share links, new drills, hall drag-reorder, PDF library — must **not** cause FAIL.
- **Regression:** Slice 01–06 Passbyggaren + hall foundation/snap/presets still PASS.

---

## Product / UX

- [ ] Placed chips show badges 1…N in pass order
- [ ] Tray chips have no station numbers
- [ ] Help or chrome mentions stationsordning / passet (Swedish)
- [ ] **Visa flöde** default ON; can hide; connectors match pass order
- [ ] Hall drag does not reorder Passbyggaren items
- [ ] **Golvklart** CTA in hall header
- [ ] Golvklart hides tray / drag affordances
- [ ] Unplaced soft banner when applicable; can still enter
- [ ] **Avsluta golvklart** → editable Hallöversikt
- [ ] **Skriv ut** available in Golvklart
- [ ] Caption **Schematisk hall — inte exakt mått** still visible (edit + floor)
- [ ] Experienced badge visible in Golvklart
- [ ] Swedish chrome (Golvklart, Visa/Dölj flöde, Skriv ut, Avsluta golvklart)

## Phone (~390px)

- [ ] Sticky / always-reachable tray while canvas pans
- [ ] Pan canvas without starting chip drag from empty floor
- [ ] Chip drag (or Placera här) still places/moves with Slice 06 snap
- [ ] Primary controls ≥44px (Golvklart, exit, print, zoom if buttons, preset, remove)
- [ ] Zoom path present (pinch **or** +/−); coords unchanged after zoom + reload
- [ ] Hallayout picker usable
- [ ] Remove without accidental wipe on detail tap

## Data / persistence

- [ ] Storage key `gymnastics-planner-draft-v1`
- [ ] Placements still keyed by `sessionItemId`, x,y ∈ [0,1]
- [ ] Optional `hallShowFlow` defaults true when absent
- [ ] Reload restores placements + presets; hall opens in **edit** (not stuck in Golvklart)
- [ ] Reorder items in Passbyggaren → return to hall → badges/flow update
- [ ] Remove placement → remaining badges renumber 1…N
- [ ] Snap / three presets / Mattberg unchanged

## Technical / scope

- [ ] No PDF library / CDN for print
- [ ] `npm run build` succeeds
- [ ] Flow layer does not block chip taps (`pointer-events` or equivalent)
- [ ] No new App route required (mode flag OK)
- [ ] Do **not** fail for missing club CAD, share links, hall reorder, keyboard full-drag, optional toast

## Regression (prior slices)

- [ ] Home → Nytt pass / mall / Fortsätt senaste pass
- [ ] Five blocks + totals = item sum + soft mismatch in Passbyggaren
- [ ] 28 drills + VisualIcon + experienced pair warning
- [ ] Hallöversikt CTA; empty pass disabled; back → Passbyggaren
- [ ] Tray default for new items; orphan prune; template replace clears placements
- [ ] Six zones; snap apparatus / free open; three presets; `generic-trupp` alias
- [ ] Export stub “Kommer snart”

---

## Suggested Verifier smoke path

1. Build a pass with ≥4 övningar across ≥2 blocks (include one experienced-only). Note Passbyggaren order. Open **Hallöversikt**.
2. Place items **out of** pass order spatially (e.g. place #3 then #1). Confirm badges still follow pass order among placed; tray unplaced have no numbers.
3. Confirm **Visa flöde** ON → dashed connectors in pass order; toggle off → lines gone; preference survives reload if persisted (or defaults ON).
4. Confirm dragging a chip does **not** change Flytta upp/ner order in Passbyggaren.
5. Phone ~390px: sticky tray reachable; pan empty canvas; Placera här onto trampett snaps; zoom enlarge works; coords same after reload; preset picker usable; remove explicit.
6. Tap **Golvklart**: read-only; numbers (+ flow if on); banner if unplaced remain; **Erfaren** visible; **Avsluta golvklart** → edit.
7. In Golvklart: **Skriv ut** → print dialog / print preview shows schematic + chips + numbers + title, app chrome hidden (manual glance in browser print preview).
8. Experienced chip → detail (from edit or floor) → warning visible.
9. Regression: switch presets; snap open vs apparatus; Fortsätt draft; `npm run build`.
10. Confirm no FAIL for absent share links / CAD / PDF lib / hall reorder.

**Pass** = all locked rules green and smoke path completes without blocker bugs.  
**Fail** = any locked rule red, or smoke path blocked.

**Do not fail** for: polish animation quality of flow dashes, exact badge corner, singular vs plural unplaced copy, whether `hallShowFlow` persists vs session-only (both allowed — prefer persist), pinch vs +/− choice, optional toast, keyboard full-drag, soft zone highlight.
