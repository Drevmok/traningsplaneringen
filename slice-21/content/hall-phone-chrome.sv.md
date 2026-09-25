# Hallöversikt phone chrome — svensk microcopy (Slice 21)

**Status:** Docs lock — Slice 21 **APPROVED 2026-09-26**. Living keys in [`docs/hall-oversikt-copy.sv.md`](../../docs/hall-oversikt-copy.sv.md).  
**Tone:** Short, coach-facing Swedish. Prefer *du*.  
**Product lock:** Phone ≤768px edit tray is collapsible (collapsed by default). Expand/collapse ≥44px. Golvklart hides the edit tray. Pinch-zoom / pan reuse existing zoom chrome — no new tip.  
**Locked terms:** gymnaster · pass · övning · station / stationer · markör · Hallöversikt · Golvklart · Passbyggaren · Placera här  
**Keep caption exactly:** **Schematisk hall — inte exakt mått**  
**Out of scope:** saknar-redskap banner, Kom igång place-step changes, required tip, Netlify/Pages, Passbyggaren compose, badge/CAD.

Floor markers stay **markörer**. Here **bricka** means the sticky tray of unplaced stations — not a floor tile.

---

## Locked answers (Docs-facing)

| # | Lock |
| --- | --- |
| B | Collapsible sticky tray; collapsed default; compact bar + expand ≥44px |
| D | Thin tray collapse/expand + aria; no required tip |
| E | Träningsplaneraren · Slice 21 |
| F | Caption unchanged; no saknar / Kom igång heuristic copy |

---

## Tray collapse / expand

| Key | Swedish |
| --- | --- |
| `hallTrayExpand` | Visa stationsbricka |
| `hallTrayCollapse` | Dölj bricka |
| `hallTrayExpandAria` | Visa brickan med ej placerade stationer |
| `hallTrayCollapseAria` | Dölj brickan med ej placerade stationer |

- Visible label may match the short key; use `*Aria` when the control is icon-first or needs more context.
- Pair mirrors **Visa flöde** / **Dölj flöde**.

### Compact bar (collapsed)

Reuse existing keys — do **not** invent a parallel title:

| Key | Swedish |
| --- | --- |
| `hallUnplacedWithCount` | Ej placerade ({n}) |
| `hallUnplacedStations` | Ej placerade stationer |
| `hallTrayEmptyStations` | Alla Teknik-stationer är placerade. |

- Prefer **`hallUnplacedWithCount`** on the compact bar when showing a count.
- `hallUnplacedStations` is fine as the expanded tray heading (unchanged).
- When zero unplaced: keep expand available if Builder still shows the bar; empty meaning stays `hallTrayEmptyStations` once expanded.

---

## Pinch / pan (no new required strings)

Reuse:

| Key | Swedish |
| --- | --- |
| `hallZoom` | Zooma |
| `hallZoomIn` | Zooma in |
| `hallZoomOut` | Zooma ut |

No new Kom igång tip. Optional live-region for zoom level is Builder-only if needed — omit unless a concrete string is requested.

---

## Footer

| Key | Swedish |
| --- | --- |
| `footerSliceLabel` | Träningsplaneraren · Slice 21 |

---

## Out of scope (do not invent)

- Saknar-redskap banner  
- Kom igång place-step / heuristic copy  
- Golvklart tray collapse chrome (tray stays hidden)  
- Renaming floor **markör** to bricka  
- Caption / Netlify / konton  
