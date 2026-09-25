# Screen spec — Hallöversikt (Slice 05)

Swedish UI throughout. Desktop-first; phone usable.

## 1. Entry from Passbyggaren

**Location:** Builder top action row (`builder-actions`), near Spara utkast / Använd mall.

| Control | Spec |
|---|---|
| Label | **Hallöversikt** |
| Style | Primary or secondary button — distinct but not louder than "Använd mall"; Builder may use `btn-primary` when enabled and keep export stub as disabled secondary |
| Enabled when | `session.blocks` have combined `items.length >= 1` |
| Disabled when | Zero activities — `title`/`aria-describedby`: "Lägg till minst en övning först" |
| Action | Set App view to `hall` with current session state |

Do **not** require an explicit Spara before opening hall; work from in-memory session (persist placements as decided in `decisions.md`).

## 2. App navigation

```
home ⇄ builder ⇄ hall
         ↑_________|
```

- Hall ← Back control: **Tillbaka till Passbyggaren** (or shorter **Till Passbyggaren**)
- Do not drop the coach on Home when leaving hall
- Footer may read `Träningsplaneraren · Slice 05` (Builder cosmetic)

## 3. Hall board layout (desktop)

```
┌─────────────────────────────────────────────────────────────┐
│ ← Till Passbyggaren     {session.title}     N övningar      │
│                         Hallöversikt                        │
├──────────────────────────────┬──────────────────────────────┤
│                              │ Ej placerade (tray)          │
│   Hall canvas                │ ┌────┐ ┌────┐ ┌────┐         │
│   (generic-trupp schematic)  │ │chip│ │chip│ …              │
│                              │ └────┘ └────┘               │
│   [placed chips]             │                              │
│                              │ Hjälp: Dra övningar till     │
│                              │ hallen. Placering sparas     │
│                              │ med utkastet.                │
└──────────────────────────────┴──────────────────────────────┘
```

- **Left/main (~65–75%):** canvas with schematic + placed chips
- **Right (~25–35%):** unplaced tray + short help
- Alternate acceptable: tray as a horizontal strip **below** canvas if width is tight — keep both regions visible without hiding the CTA back button

## 4. Canvas

- Background: generic truppgymnastik schematic per [`hall-template-generic.md`](./hall-template-generic.md)
- Aspect: landscape ~ **16:10** or **3:2** preferred; Builder picks one and keeps it stable
- Zones drawn as soft labeled regions (dashed or light fill) — not CAD walls
- Small caption on canvas (muted): **Schematisk hall — inte exakt mått**
- Coordinate system: origin top-left of drawable canvas; chip position = center; store 0–1

### Interactions

| Action | Behavior |
|---|---|
| Drag chip from tray → canvas | Create placement at drop point; clamp center so chip stays mostly on-canvas |
| Drag placed chip | Update x,y; optionally refresh soft `zoneId` if center enters a zone bbox |
| Drop chip onto tray / "Ta bort från hall" | Remove placement; chip returns to tray |
| Click/tap chip | Optional: open ActivityDetail (read-only add actions disabled or hidden) — if opened, experienced warning must show |
| Click empty canvas | No-op (no marquee select in 05) |
| Double-click zone | No-op (no snap/auto-fill in 05) |

Drag implementation: HTML5 DnD and/or pointer events — Builder choice. Must work with mouse on desktop.

## 5. Placeable chips

Content (in order):

1. `VisualIcon` (size `item` or compact ~32–36px tile) tinted with activity's `blockType` via `BLOCK_COLORS`
2. Title (Swedish from Activity; truncate ~18–24 ch)
3. Optional duration: `{n} min` if space
4. If `experiencedCoachOnly`: compact badge **Erfaren** / **Erfaren ledare**

Chip chrome:

- Rounded card, light block `bg`, stronger `border`, readable `text`
- Cursor grab/grabbing on desktop
- Minimum hit area ~44×44px (phone)

Fallback title if activity missing: **Övning saknas**
Fallback icon: existing VisualIcon fallback

Tray sort: same as pass order (block order × item.order).

## 6. Unplaced tray

- Header: **Ej placerade** + count `(N)`
- Empty tray (all placed): "Alla övningar är placerade i hallen."
- Chips in tray are the same component as on canvas (slightly denser list OK)
- Help blurb (always visible on desktop; collapsible on phone):
  **Dra övningar till hallen. Placeringen sparas med utkastet.**

## 7. Empty / edge states

| State | UI |
|---|---|
| Opened with 0 activities (should not if CTA disabled; guard anyway) | Full-page empty: "Inga övningar i passet ännu." + button **Till Passbyggaren** |
| ≥1 activities, all unplaced | Canvas shows schematic + caption; tray lists all chips; soft hint "Dra en övning hit" on canvas |
| Some placed | Canvas chips + tray remainder |
| All placed | Tray empty message; canvas full |
| Missing activity id | Chip shows **Övning saknas** + fallback icon; still draggable |
| Orphan placement after load | Pruned on load — never show a chip without a session item |

## 8. Phone notes (≤768px)

- Stack: header → canvas (full width, min-height ~50vh) → tray strip below
- Canvas: overflow auto / touch pan so zones off-screen are reachable
- Tray: horizontal scroll of chips OK
- Primary controls ≥44px
- Do **not** require perfect drag-and-drop on touch for Slice 05 pass — if drag is flaky, provide **alternate place action**: tap chip in tray → tap zone/canvas position ("Placera här") as acceptable fallback. Document which path Builder ships.
- Advanced gestures / sticky chrome → Slice 07

## 9. Persistence UX

- Placing, moving, or removing from hall updates `session.hallPlacements` and should persist (call `saveDraft` on change **or** on leaving hall — prefer on change so crash-safe)
- No separate "Spara hall" button required if auto-persist on edit
- Optional toast once: **Placering sparad** — not required if silent save matches draft habits

## 10. Copy keys (suggested for `UI` / Docs)

| Key | Swedish |
|---|---|
| hallOverview | Hallöversikt |
| hallBack | Tillbaka till Passbyggaren |
| hallUnplaced | Ej placerade |
| hallAllPlaced | Alla övningar är placerade i hallen. |
| hallEmptyPass | Inga övningar i passet ännu. |
| hallDragHint | Dra övningar till hallen. Placeringen sparas med utkastet. |
| hallSchematicNote | Schematisk hall — inte exakt mått |
| hallCtaDisabled | Lägg till minst en övning först |
| hallRemove | Ta bort från hall |
| hallMissingActivity | Övning saknas |
| hallPlaceHere | Placera här |

## 11. Accessibility

- Back button and CTA have clear accessible names
- Decorative schematic regions: labels as visible text (or `aria-label` on zone groups)
- Chips: accessible name = activity title (+ "Erfaren ledare" if flagged)
- Do not rely on color alone — title always present
- Keyboard: Tab to chips; if full keyboard drag is heavy, phone alternate place path + mouse drag is enough for 05 (note for Verifier)

## 12. Out of this screen

- Snap highlights / magnetic zones
- Station numbers / flow arrows
- Print / floor-ready layout
- Editing pass structure (add/remove activities) — send coach back to Passbyggaren
