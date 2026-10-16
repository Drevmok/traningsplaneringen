# Slice 43 — Hela hallen syns direkt (Hallöversikt på telefon)

**App:** Träningsplaneraren  
**Status:** **LOCKED 2026-10-16 by Christoffer: A1 B1 C1 D1 E1 F1 (the ★ recommendations).** Effort M. Docs pack only, no app code. Branch `slice-43-docs` from `origin/main` @ `db11398` (Slice 42 merge).  
**Effort:** **M** (see below).  
**Source:** Planner brief (Polish #5). **No Polish #5 entry exists under `backlog/`** on main @ db11398 (searched `backlog/IMPROVEMENTS.md`, `SCOUT-PLAYBOOK.md`, `PSTACK-OPS.md`); scope is taken from the brief.

## Why

On a 390×844 phone, Hallöversikt (edit) shows **no hall at all on first paint**. The hall starts at **y = 765** (measured, see `evidence/`), under ~750 px of header, buttons, layout picker, notes, the Slice 25 saknar-redskap banner, Visa tips, the flow tip strip and the zoom bar. The coach has to scroll to see what they came for. Golvklart already fits (hall 293–715).

**Coach outcome:** "Jag öppnar Hallöversikt och ser hela hallen direkt, utan att scrolla."

## Measured today (main @ db11398, headless Chrome 390×844, DPR 2, Nybörjare-mallen, edit mode)

| Element | y top–bottom | Height |
|---|---|---|
| ← back (`.btn-text.back`) | 12–60 | 48 |
| Title «Hallöversikt» + meta (pass title, count) | 68–129 | 61 |
| Actions (Visa flöde · Förrådslista · Använd alla förslag · Golvklart), 2 rows | 137–233 | 96 |
| Layout row (label + select + migrate note + Blå/Vit coach tip) | 245–402 | 157 |
| Saknar-redskap banner (text + CTA, Slice 25/37) | 416–504 | 87 |
| Visa tips (hints info button) | 522–562 | 40 |
| Flow tip strip (`tipHallFlowGolvklart`) | 588–705 | 117 |
| Zoom bar (− / +) | 717–757 | 40 |
| **Hall canvas** | **765 – 1029…1187** | see below |
| Schematisk hall caption | below hall | 21 |
| Sticky compact tray (bottom: 0) | over viewport bottom | 58 |
| Footer | end of page | 110 |

Hall canvas width at 390 = **358 px** (16 px side padding). Heights per template (≤768 px rules, `App.css:2290` + `export.css:1113/1118`):

| Template | CSS rule | Height at 358 wide | Bottom today |
|---|---|---|---|
| Blå hall | `aspect-ratio: 2132/1572`, `min-height: 0` | **264** | 1029 |
| Vit hall | `aspect-ratio: 2108/2200`, `min-height: 0` | **374** (taller than wide) | 1139 |
| Standard trupp | `aspect-ratio: 3/2` but `min-height: 50vh` wins | **422** (3:2 would be 239) | 1187 |
| Tävling / linjer | same | **422** | 1187 |
| Liten hall | same | **422** | 1187 |

Landscape 844×390: hall 507–918 (411 tall), no zoom bar; not fitable without scrolling.

## Pixel budget at 844 tall

| Context | Visible height | Minus sticky tray 58 | Room for chrome above tallest hall |
|---|---|---|---|
| Headless 390×844 (AC baseline) | 844 | 786 | 786 − 422 = 364 (Vit with B1: 412) |
| Installed PWA (`display: standalone`, no `viewport-fit=cover`) — status bar ~47 eaten by iOS, home indicator inset ~34 | ~763–797 | ~705–739 | ≥ 283 (422) / 331 (Vit) |
| Safari tab, toolbars shown | ~664 | ~606 | 606 − 374 = 232 (tight) |

**Target (A1):** hall bottom ≤ **739 px** in a 390×844 viewport (= PWA fold minus the compact tray). That means chrome above the hall ≤ **317 px** if the generic halls stay at 422, or ≤ **365 px** for Vit (tallest once B1 removes the 50vh floor).

Recommended stack (A1+B1+C1+D1) estimate: back+title row 12–60 · meta 64–86 · actions 94–190 · layout select + zoom one row 198–242 · saknar one line 250–294 · hall from **302**. Bottoms: Blå 566, Standard/Tävling/Liten 541, Vit **676**. All ≤ 739, with ~60 px to spare.

## Options (★ = Docs recommendation)

### A — What counts as «above the fold»
- **A1 ★** Hall canvas bottom ≤ 739 px at 390×844 (PWA fold − compact tray), all 5 templates, edit and Golvklart, with the saknar banner showing. Testable in the headless baseline.
- **A2** Bottom ≤ 786 (raw 844 − tray). Easier; misses in the installed PWA.
- **A3** Also fit Safari with toolbars (≤ 606). Forces hall shrink for Vit; not worth it.

### B — Hall height
- **B1 ★** Drop the phone `min-height: 50vh` on the generic halls so 3:2 applies (422 → 239). Blå/Vit keep their drawing ratios. Markers are still 44 px targets (Slice 20); pinch zoom (Slice 21) covers detail.
- **B2** Keep 50vh (422). Chrome must fit in 317 px; needs D2 as well.
- **B3** Cap hall height at `min(…, 100svh − chrome)`. Shrinks Vit width; more code, letterboxing.

### C — Move secondary content below the hall
- **C1 ★** Move under the hall (above the tray caption area): layout migrate note + Blå/Vit coach tip, Visa tips (hints info), flow tip strip. Order below hall: caption · flow tip · hints · notes. No text changes.
- **C2** Move only the flow tip strip (saves 117+8). Not enough on its own (hall top ~640).
- **C3** Hide them on phone. Loses content; rejected for coach tips and the coach-tip lock.

### D — Compact the header and banner
- **D1 ★** (a) Back button and «Hallöversikt» on one row; (b) layout select and the existing zoom − / + on one row (label visually compact, still a `<label>`); (c) saknar-redskap banner as one line: text left, «Använd alla förslag» CTA right, text ellipsis if needed (full text in `aria`). Actions rows unchanged (4 locked labels, ≥ 44 px).
- **D2** D1 plus actions forced to one scrolling row. Saves 52 but hides buttons off-screen; risky.
- **D3** No header compaction; only C. Hall top ~470 → Vit bottom 844; fails A1.

### E — Landscape and wide
- **E1 ★** No fit target in landscape (390 tall cannot hold any hall plus chrome). Landscape and > 768 px keep today's layout except the moves in C1 (same DOM order). Must not get worse than today.
- **E2** Landscape: hall first, all chrome below. Separate layout; scope creep.
- **E3** Change desktop too. Out of scope.

### F — Copy, terms, budget
- **F1 ★** No new controls, no new strings, no changed text, no locked term changes (Hallöversikt, Golvklart, Förrådslista, Visa flöde, Använd alla förslag, Redigera redskap, markör, station, «Schematisk hall — inte exakt mått»). +512 B gz soft; estimate **+150–300 B gz** (mostly CSS; JSX moves ≈ 0).
- **F2** Allow shortening the saknar text on phone (e.g. «3 saknar redskap»). New string; needs Docs lock.
- **F3** Allow icon-only actions. New pattern; rejected.

## Effort: M

Not S because: HallBoard.tsx edit branch has 6+ conditional chrome blocks whose order changes; the saknar banner layout changes for one-line; B1 touches a shared ≤768 rule that also feeds print/export (`export.css` print rules must stay); 5 templates × (edit, Golvklart, with/without banner, tray collapsed/expanded) to verify; sticky tray interaction. Not L: no new state, no new component, no data or text change.

## Files

- [`HANDOFF.md`](./HANDOFF.md) — Builder notes, file:function refs
- [`verification-checklist.md`](./verification-checklist.md) — AC1–AC16 (against ★)
- [`content/microcopy.sv.md`](./content/microcopy.sv.md) — no new strings
- [`evidence/`](./evidence/) — main @ db11398 screenshots + `measurements-390x844.txt`
- Living doc: [`docs/hall-phone-chrome.sv.md`](../docs/hall-phone-chrome.sv.md) (Slice 43 note appended)

## Out of scope

New controls, new tips, text changes, Passbyggaren, Golvklart layout (already fits), print/export, desktop layout, Safari-toolbar fit (A3), viewport-fit=cover/safe-area rework.

## Open items

1. Christoffer to lock A–F (B1 is the product-visible one: generic halls get flatter on phones).
2. Real-device check on an installed PWA (iPhone 390×844) — headless numbers are a stand-in.
3. Whether the flow tip strip (dismissable coach tip) may move below the hall under the coach-tip lock (`docs/coach-tips.sv.md`).
