# Screen specification — Slice 08 polish / cleanup

**App:** Träningsplaneraren  
**Status:** **APPROVED by Christoffer 2026-09-24**  
**Baseline:** Slices 05–07 Hallöversikt and Golvklart; this document specifies only the cleanup delta.

## 1. Footer (P08-01)

- In the shipped app shell, render exactly: **Träningsplaneraren · Slice 08**.
- Do not alter historical slice documents or historical headings.
- Footer is normal app chrome in screen mode and is hidden as app chrome in print.

## 2. Placement save copy (P08-02)

- Remove the unused `Placering sparad` / `hallPlacementSaved` key and any unused render/reference.
- A placement, move, removal, or preset change remains an automatic draft save with no toast.
- The explicit builder **Spara utkast** action may continue to show **Utkast sparat**. Do not display it for silent hall placement changes.

## 3. Phone `Ej placerade` tray (P08-03)

### Layout contract, ≤768px

```
┌──────────────────────────────┐
│ hall canvas                  │
│                              │
│  bottom padding >= tray      │
├──────────────────────────────┤
│ Ej placerade  [chips …]      │  ← reliably bottom-reachable
│ safe-area inset              │
└──────────────────────────────┘
```

- The tray is a bottom strip, preferably the existing `position: sticky` element improved; `position: fixed` is allowed if the hall layout reserves equivalent bottom space.
- It remains reachable while canvas content pans/scrolls. It must not scroll away with the canvas.
- Add bottom safe-area handling for devices with a home indicator. The reserved canvas bottom padding must be measured or otherwise sized to at least the full tray box plus the safe-area inset.
- The last usable canvas position/drop target must be scrollable above the tray. A chip, zone, or **Placera här** target must not be permanently hidden behind it.
- Do not require covering browser/viewport chrome at all times; do require reliable reachability.
- Keep horizontal tray scrolling, existing chip content/order, **Placera här**, snap, and explicit **Ta bort från hall** behavior.
- Do not introduce keyboard drag in this slice.

### Phone interaction checks

- Empty-canvas gesture remains canvas pan/scroll; starting on a chip remains chip interaction.
- Tapping a tray chip and then the canvas still supports **Placera här**.
- Tray and its primary controls retain ≥44px targets.
- Desktop/right-panel behavior may remain as in Slice 07; sticky-bottom behavior is required only at ≤768px.

## 4. Swedish accessibility chrome (P08-05)

| Surface | Required accessible name/copy |
|---|---|
| General zoom control | **Zooma** |
| Zoom-in control, if separate | **Zooma in** |
| Zoom-out control, if separate | **Zooma ut** |
| Flow on/off | **Visa flöde** / **Dölj flöde** |
| Floor mode | **Golvklart** |
| Exit floor mode | **Avsluta golvklart** |
| Unplaced tray | **Ej placerade** |
| Placement action | **Placera här** |

- Accessible names and visible labels must agree where a control is visible.
- Do a narrow sweep of hall controls, buttons, icon-only controls, and relevant `aria-label` values for newly introduced English. Existing browser/OS text is not app copy.
- Do not remove valid `Utkast` terminology from compatibility UI or historical docs.
- Preserve experienced-only warning behavior and station number information in chip accessible names.
- Preserve the exact caption in edit mode, Golvklart, and print: **Schematisk hall — inte exakt mått**.

## 5. Golvklart screen before print (baseline guard)

- Keep the existing read-only mode and naming: **Golvklart** and **Avsluta golvklart**.
- Keep the schematic, zones, placed chips/station numbers, optional flow, session title, and soft **N övningar ej placerade** banner when relevant.
- Keep edit controls out of the floor presentation as in Slice 07; this slice does not redesign Golvklart.

## 6. Print behavior (P08-08)

### Print-only content

Prefer one compact `.print-only` strip near the top of the printed hall:

- session title;
- duration when available;
- date when available.

If a value is unavailable, omit that value without creating a second heading. The screen-only Golvklart heading must not duplicate this strip in print.

### Print visibility

With `window.print()` from **Skriv ut** and the existing print CSS:

**Hide:**

- site navigation and footer/app chrome;
- edit controls, back/edit actions, flow toggle, preset picker, and other mutation chrome;
- `Ej placerade` tray;
- **Avsluta golvklart** and **Skriv ut** action buttons;
- transient toasts and other non-content status chrome.

**Keep:**

- one title/meta strip;
- hall schematic and six-zone presentation;
- zone labels;
- placed chips and station numbers;
- flow connectors when flow is enabled;
- caption **Schematisk hall — inte exakt mått**;
- soft unplaced banner when any gymnaster/övningar remain unplaced.

### Print quality

- Remain A4 landscape-friendly with readable spacing and contrast.
- Preserve schematic fills/lines where the existing print rules support them; do not turn the hall into a measurement drawing.
- Keep print offline and CSS-driven. No PDF library, CDN, export, or share link.

## 7. Copy regression

The following are locked assertions, not proposed copy changes:

- **Schematisk hall — inte exakt mått** is unchanged and present in edit, Golvklart, and print.
- **Golvklart**, **Ej placerade**, **Placera här**, **Visa flöde**, and **Dölj flöde** remain Swedish and correctly cased.
- No new placement-save toast exists; **Utkast sparat** remains only for explicit builder save.
- No new English or stale **Slice 07** label appears in the shipped app surface after implementation.
