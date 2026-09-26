# Copy quieter / feature-first chrome — svensk microcopy (Slice 22)

**Status:** Docs lock — Christoffer approved Slice 22 A–F (2026-09-26). Builder may ship from these keys.  
**Tone:** Short, coach-facing Swedish. Prefer *du*.  
**Product lock:** Progressive Hall hints after first Teknik place; quieter Kom igång collapse; one chrome layer at a time. Info / expand / collapse ≥44px.  
**Locked terms:** gymnaster · pass · övning · station / stationer · markör · Hallöversikt · Golvklart · Passbyggaren · Placera här · Kom igång · Redigera redskap · Visa tips igen · Starta från mall · Förrådslista  
**Keep caption exactly:** **Schematisk hall — inte exakt mått**  
**Out of scope:** saknar-redskap banner copy, Kom igång place-step heuristic copy, new required tip, Netlify/Pages, Passbyggaren compose, badge/CAD, caption change.

Reuse existing hint bodies (`hallDragHint`, `hallSnapHint`, `hallStationsOnlyHint`, `hallStationOrderHint`, `hallTileHint` / `hallTileHintShort`, tip strip texts). This file only adds **controls** that reveal or collapse teaching chrome.

Living mirror: [`docs/copy-quieter-chrome.sv.md`](../../docs/copy-quieter-chrome.sv.md).

---

## Locked answers (Docs-facing)

| # | Lock |
| --- | --- |
| A | Progressive Hall hints; durable compact; info reveals full hints |
| B | Kom igång collapsed summary after progress; 0/n stays expanded |
| C | One of tip / banner / multi-line hints |
| D | Thin strings below + living-doc touch-ups |
| E | Träningsplaneraren · Slice 22 |
| F | No saknar / place-heuristic / caption invent |

---

## Hall — info control (progressive hints)

When `hallHintsCompact` (or C1 tip-suppression) hides multi-line paragraphs:

| Key | Swedish |
| --- | --- |
| `hallHintsInfo` | Tips om placering |
| `hallHintsInfoAria` | Visa tips om hur du placerar Teknik-stationer |
| `hallHintsHide` | Dölj tips |
| `hallHintsHideAria` | Dölj placeringstipsen |

- Visible label may be short (`hallHintsInfo`); use `*Aria` when icon-first.
- Control ≥44×44px. Builder picks popover / sheet / expandable — prefer non-blocking so **Placera här** stays usable.
- Revealed body = existing keys (do **not** invent parallel paragraphs):
  - Tray: `hallDragHint`, `hallSnapHint`
  - Header / above-canvas: `hallStationsOnlyHint`, `hallStationOrderHint`, `hallTileHint` / `hallTileHintShort`
- Use hall-specific aria above — do **not** reuse `tipInfoAria` (“Visa tränartips”) for this control; Hall meaning stays clear.
- Info stays available when C1 suppresses multi-line hints because a tip strip is visible.

---

## Kom igång — expand / collapse

| Key | Swedish |
| --- | --- |
| `komIgangExpand` | Visa steg |
| `komIgangCollapse` | Dölj steg |
| `komIgangExpandAria` | Visa alla Kom igång-steg |
| `komIgangCollapseAria` | Dölj stegen och visa bara sammanfattning |

Collapsed summary reuses (unchanged):

| Key | Swedish |
| --- | --- |
| `komIgangTitle` | Kom igång |
| `komIgangProgress` | {done} av {total} klart |

Keep unchanged dismiss paths:

| Key | Swedish |
| --- | --- |
| `komIgangDismiss` | Dölj Kom igång |
| `komIgangDismissAlt` | Jag klarar mig |
| `visaTipsIgen` | Visa tips igen |

- Expand / collapse ≥44px.
- Brand-new (`done === 0`, never collapsed): stay **expanded** — no new strings.
- Collapse does **not** change step labels, hints, or heuristics (Scout #2 stays out).
- Pair mirrors **Visa flöde** / **Dölj flöde** and Slice 21 **Visa stationsbricka** / **Dölj bricka**.
- **Visa tips igen** may clear compact/collapse prefs (decisions Q4) — label unchanged.

---

## Footer

| Key | Swedish |
| --- | --- |
| `footerSliceLabel` | Träningsplaneraren · Slice 22 |

---

## Out of scope (do not invent)

- Saknar-redskap banner  
- Kom igång place-step / `openedHall` heuristic copy  
- New required tip content  
- Rewriting caption / Netlify / konton  
- Renaming floor **markör**  
- Parallel hint paragraphs for the info popover  

---

## Notes for Builder

- Prefer these strings over inventing synonyms (“Visa placeringshjälp”, “Expandera checklista”, “Tour”).
- Wire keys into `blockMeta.ts` (or equivalent); persist flags in tips store — not Docs scope.
- Living companions: [`hall-declutter.sv.md`](../../docs/hall-declutter.sv.md) · [`coach-tips.sv.md`](../../docs/coach-tips.sv.md) · [`kom-igang-redskap.sv.md`](../../docs/kom-igang-redskap.sv.md) · [`hall-phone-chrome.sv.md`](../../docs/hall-phone-chrome.sv.md).
