# Verification checklist — Slice 05 (Hall board foundation)

**Slice passes when** a coach can open **Hallöversikt** from a pass with ≥1 övning, see a generic truppgymnastik schematic with five labeled zones, drag session chips from an unplaced tray onto the hall, reposition them, return them to the tray, and reload the draft with placements restored — without losing experienced-only safety cues or prior Passbyggaren behavior.

Use this checklist as sole Slice 05 authority after Christoffer approval.

---

## Locked pass/fail rules

- **CTA:** Passbyggaren shows **Hallöversikt**. Enabled iff ≥1 session item; disabled with clear Swedish hint when empty. Fail if missing, English-only, or always enabled on blank pass.
- **Entry/back:** Opens hall view; back returns to **Passbyggaren** (same pass), not Home. Fail if back dumps to Home or loses unsaved in-memory edits that were already on the session object.
- **Schematic:** Canvas shows generic hall with labels **Öppen yta**, **Trampett**, **Tumbling**, **Satsbräda**, **Mattor** plus muted note that it is schematic / not exact measurements. Fail if club-specific naming or missing ≥2 of the five labels.
- **Tray default:** New items appear under **Ej placerade** until placed. Fail if items auto-scatter onto canvas with no user action.
- **Place / move / remove:** Desktop mouse can place from tray, reposition on canvas, and return to tray (drag-back or **Ta bort från hall**). Fail if placements cannot be created or cleared.
- **Persist:** `hallPlacements` stored on draft (`SessionItem.id` → x,y in 0–1, optional zoneId). Reload (Continue draft / refresh + continue) restores positions. Fail if placements vanish after reload of a saved draft.
- **Orphan prune:** Removing an item from the pass removes its placement; no ghost chips. Fail if canvas shows a chip for a deleted item.
- **Chips:** Show Swedish title + block tint; VisualIcon when cheap/available; experienced-only badge on flagged drills. Fail if icon-only with no title, or if experienced drills lose badge when detail is opened from hall.
- **Safety:** Opening detail from a hall chip for `tech-rondat-flickis` / `tech-salto-fran-hojd` still shows experienced warning. Fail if warning suppressed on hall path.
- **Phone usable:** At ~390px, canvas reachable (scroll/pan) and tray accessible; primary controls ≥44px. Perfect touch-drag not required if alternate place path exists. Fail if hall is unusable (cut off with no scroll, or tray unreachable).
- **Scope guard:** Snap-to-zone, flow arrows, print view, export, library edits — absence must **not** cause FAIL.
- **Regression:** Passbyggaren totals, soft mismatch, block order, library, VisualIcon tiles, Slice 02 sheet still work.

---

## Product / UX

- [ ] CTA **Hallöversikt** visible in Passbyggaren actions
- [ ] CTA disabled on empty pass with Swedish explanation
- [ ] CTA enabled after adding ≥1 övning
- [ ] Hall header shows pass title (or clear Hallöversikt heading)
- [ ] Back: **Tillbaka till Passbyggaren** / **Till Passbyggaren**
- [ ] Five zone labels visible on schematic
- [ ] Caption: schematic / not exact measurements
- [ ] Unplaced tray lists all items for a fresh pass
- [ ] Drag (or documented alternate) places chip on canvas
- [ ] Reposition updates location
- [ ] Remove from hall returns chip to tray (item stays on pass)
- [ ] Empty tray message when all placed
- [ ] Empty-pass guard message if hall opened with 0 items
- [ ] Missing activity fallback title **Övning saknas** (Verifier may break an activityId in a test draft)
- [ ] Experienced badge visible on chips for the two flagged drills
- [ ] Chip colors match block tokens (amber/sky/violet/rose/green)

## Data / persistence

- [ ] Draft JSON includes `hallPlacements` (array) after a place action + save/auto-save
- [ ] Coordinates are numbers in `[0, 1]` (spot-check localStorage)
- [ ] Keyed by `sessionItemId` (not only activityId)
- [ ] Old draft without hall fields loads without crash; all items unplaced
- [ ] Template replace clears placements (new item ids)
- [ ] `removeItem` prunes placement
- [ ] Optional `zoneId` only uses known ids: open | trampett | tumbling | vault | mats
- [ ] Storage key remains `gymnastics-planner-draft-v1` (or documented compatible migration)

## Phone

- [ ] ~390px: can reach canvas content and tray without dead-end
- [ ] Tap targets for back / chips ≥44px where primary
- [ ] If touch-drag unreliable: alternate **Placera här** (or equivalent) works

## Technical / scope

- [ ] No snap physics required
- [ ] No flow arrows / station order UI
- [ ] No print / floor-ready view
- [ ] No CDN dependency for hall art
- [ ] `npm run build` succeeds
- [ ] Swedish UI strings (no leftover English chrome on hall)

## Regression (prior slices)

- [ ] Home → Nytt pass / mall / fortsätt still works
- [ ] Five blocks locked order + Swedish names
- [ ] Total = sum of item durations
- [ ] Soft mismatch banner still on builder
- [ ] 28 drills + VisualIcon tiles intact
- [ ] Experienced warning still in library/detail path from builder
- [ ] Export still stub "Kommer snart"

---

## Suggested Verifier smoke path (happy path)

1. Home → Nytt pass → add 3 övningar from different blocks (include one experienced-only).
2. Click **Hallöversikt** → see tray with 3 chips + schematic with 5 labels.
3. Place two chips on canvas (one on Trampett area, one on Öppen yta); leave one in tray.
4. Move one placed chip; remove the other back to tray.
5. Spara utkast (if not auto) → Tillbaka → confirm builder still has 3 items.
6. Hallöversikt again → placements match last state.
7. Home → Fortsätt senaste pass → Hallöversikt → placements still there.
8. Open experienced chip detail from hall → warning visible.
9. Resize to ~390px → scroll canvas + use tray; place via drag or alternate.
10. Remove one item in Passbyggaren → reopen hall → no ghost chip.

**Pass** = all locked rules green and smoke path completes without blocker bugs.  
**Fail** = any locked rule red, or smoke path blocked.
