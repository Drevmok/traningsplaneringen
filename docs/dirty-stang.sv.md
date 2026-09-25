# Dirty Stäng + canvas remove — svensk microcopy (Slice 20)

**Status:** Docs lock — Slice 20 **APPROVED 2026-09-26**. Living keys also in [`station-compose.sv.md`](./station-compose.sv.md). This file is the Slice 20 lock.  
**Tone:** Warm, short, coach-to-coach. Prefer *du*.  
**Product lock:** In-sheet dirty **Stäng** confirm (discard / keep editing); **Klar** unchanged; no `window.confirm`. Canvas remove hit ≥44×44px (edit only); keep existing **Ta bort från hall** aria — **no** B2 text button in detail. Template scroll-freeze is Builder-only (C1).  
**Carry-forward:** Redigera redskap hall-detail only; Använd förslag / Använd alla; quiet Golvklart / Förrådslista; caption unchanged.  
**Locked terms:** gymnaster · pass · övning · station / stationer · markör · redskap · Hallöversikt · Golvklart · Klar · Stäng · Redigera redskap · Ta bort från hall  
**Keep hall caption exactly:** **Schematisk hall — inte exakt mått**  
**Out of scope copy:** B2 detail “Ta bort från hall” button, Passbyggaren compose, badge/CAD, library growth, auto-apply, Netlify, required tip.

---

## Locked answers (A–F)

| # | Lock |
| --- | --- |
| A | In-sheet dirty Stäng (discard / keep editing); Klar unchanged |
| B | Canvas remove ≥44px edit only; no B2 text button |
| C | Template flag / close sheet / body overflow — Builder; no new user copy |
| D | Thin Docs in station-compose (+ remove aria if needed); no required tip |
| E | Träningsplaneraren · Slice 20 |
| F | Caption unchanged; preserve 11–19; no republish unless asked |

---

## Dirty Stäng (Redigera redskap)

Show only when the recipe is **dirty** and coach taps **Stäng** (or backdrop close that uses the same path). Clean Stäng closes immediately. **Klar** never routes through this confirm.

| Key | Swedish |
| --- | --- |
| `composeDirtyBody` | Du har osparade ändringar. |
| `composeDirtyDiscard` | Stäng utan att spara |
| `composeDirtyKeep` | Fortsätt redigera |
| `composeDirtyDiscardAria` | Stäng utan att spara ändringarna |
| `composeDirtyKeepAria` | Fortsätt redigera redskap |

- Prefer body only (no separate title) — short enough for an in-sheet banner.
- Discard = secondary / danger-ish; keep editing = secondary / default.
- Both actions ≥44px min-height on phone.
- Do **not** invent browser `confirm` wording.

Reuse unchanged:

| Key | Swedish |
| --- | --- |
| `composeDone` | Klar |
| `composeClose` | Stäng |
| `composeCloseAria` | Stäng redigering av redskap |

---

## Canvas remove (edit only)

| Key | Swedish |
| --- | --- |
| `hallRemove` | Ta bort från hall |

- Keep this label / `aria-label` / `title` on the canvas × control.
- Slice 20 only enlarges the **hit target** (≥44×44px) on **edit** canvas — no new visible text button (B2 not locked).
- Golvklart / floor: still **no** remove control.
- Tray remove already uses the same string — no required change.

---

## Footer

| Key | Swedish |
| --- | --- |
| `footerSliceLabel` | Träningsplaneraren · Slice 20 |

---

## Out of scope (do not invent)

- Detail-sheet **Ta bort från hall** secondary CTA (B2)
- Auto-save on Stäng
- Passbyggaren Redigera redskap
- New Kom igång tip for PASS
- Caption / Netlify / konton / moln
