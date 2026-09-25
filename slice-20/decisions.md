# Slice 20 — decisions (APPROVED)

**Status:** **APPROVED 2026-09-26** — Christoffer approved via Planner lock widget; A–F locked as recommended  
**Direction:** Phone polish — dirty Stäng + canvas remove + template scroll freeze

Docs may start. Builder waits for Docs strings (or Planner parallel OK). Verifier only after Builder ships.

## Locked A–F (Christoffer 2026-09-26)

| # | Lock |
|---|---|
| A | **A1** In-sheet dirty Stäng (discard / keep editing); Klar unchanged; no `window.confirm` |
| B | **B1** Canvas remove hit target ≥44×44px (edit only); tap→detail; drag≠detail; no Golvklart remove; **no B2** |
| C | **C1** Clear one-shot template flag; close sheet on apply; restore body overflow |
| D | **D1** Thin Docs in station-compose (+ hall/tiles aria only if needed); no new required tip |
| E | **E1** Footer `Träningsplaneraren · Slice 20` |
| F | **F1** No Passbyggaren compose; no badge/CAD; no library growth; no auto-apply; no republish unless asked; caption unchanged; preserve 11–19 |



## A. What Slice 20 adds

| Surface | Slice 20 change? |
|---|---|
| Redigera redskap sheet | **Yes** — in-sheet dirty Stäng confirm (replace `window.confirm`) |
| Hallöversikt **edit** canvas | **Yes** — touch-friendlier remove |
| Hallöversikt Golvklart / floor | **No** remove chrome change required (remove remains edit-only) |
| Passbyggaren / Starta från mall | **Yes** — fix scroll freeze / stuck sheet after apply mall |
| Använd förslag / Använd alla / seeds | **No** |
| Library / caption / badge / CAD | **No** |

---

## DECISION RATIONALE — recommended A–F (for Christoffer lock)

### A. Dirty Stäng confirm UX?

**Locked A1: In-sheet confirm panel** inside the existing Redigera redskap sheet (not a second full-screen route, not `window.confirm`).

When dirty and coach taps **Stäng** (or backdrop dismiss that today goes through `handleClose`):

- Show short Swedish copy + two actions: **discard** (close without save) and **keep editing** (hide confirm, stay in sheet).
- **Klar** unchanged — primary save; never routes through discard confirm.
- Clean (not dirty) **Stäng** — close immediately (no confirm).

| Option | Note |
|---|---|
| **A1 (recommended)** | In-sheet confirm | Matches backlog; phone-safe |
| A2 | Bottom sticky bar only | OK variant of A1 |
| A3 | Keep `window.confirm` | Reject — the bug we are fixing |
| A4 | Auto-save on Stäng | Reject — Klar is save |

**Docs strings (recommended Swedish for Docs to finalize):**

| Key | Recommended |
|---|---|
| Title / body | Du har osparade ändringar. |
| Discard | Stäng utan att spara |
| Keep editing | Fortsätt redigera |

---

### B. Canvas remove affordance?

**Locked B1: Enlarge canvas remove hit target to ≥44×44px** (padding / hit-area OK if visual × stays slightly smaller), **edit canvas only**. Preserve: tap markör → detail; drag ≠ open detail; Golvklart has no remove.

| Option | Note |
|---|---|
| **B1 (recommended)** | ≥44px hit target on canvas × | Smallest change; matches tray |
| B2 | B1 + when markör selected, secondary **Ta bort från hall** in detail chrome | Extra clarity; slightly more Docs/UI |
| B3 | Remove ×; only detail **Ta bort från hall** | Clearer but more taps for power users |
| B4 | Leave 22–24px × | Reject — the bug |

**Locked B1** (B2 not chosen).

---

### C. Template scroll-freeze fix?

**Locked C1: One-shot picker + close sheet on apply + reliable body unlock**

Required Builder behaviors:

1. **Clear `openTemplates` (or equivalent)** when the initial mall picker has been consumed (apply **or** coach closes sheet / leaves Starta-från-mall entry) so `session.id` change after `cloneTemplate` does **not** remount with `initialTemplatePicker` forced true.
2. On successful **Använd mall** / confirm: **`closePanel()`** (do **not** `openPanel('library')`).
3. Ensure `document.body.style.overflow` is restored when panel + `TemplateConfirm` unmount (refcount helper OK; nested prev=`hidden` must not stick).
4. After apply: Passbyggaren (blocks list) is **scrollable** on phone without an invisible overlay.

| Option | Note |
|---|---|
| **C1 (recommended)** | Clear flag + close sheet + unlock body | Fixes reported freeze |
| C2 | Only unlock body; leave library sheet open | Partial — still feels stuck |
| C3 | Remount-only hack without clearing flag | Fragile |

---

### D. Docs surface?

**Locked D1:** Thin updates:

- `docs/station-compose.sv.md` — dirty Stäng confirm strings  
- `docs/hall-oversikt-copy.sv.md` or `docs/station-tiles.sv.md` — canvas remove aria / optional **Ta bort från hall** if B2  
- No new required Kom igång tip for PASS  
- Optional one line in distribution / chrome if footer copy lives there  

---

### E. Footer?

**Locked E1:** `Träningsplaneraren · Slice 20` when Builder ships.

---

### F. Hard non-goals (this pack)?

**Locked F1 — all stand:**

- No Passbyggaren compose entry  
- No auto-apply förslag on place; no unset→Golvklart promotion without Klar / Använd förslag / Använd alla  
- No badge / CAD / library growth / caption change  
- No Netlify/Pages republish unless Christoffer asks  
- Preserve Slices 11–19 behavior  
- Do not replace every modal’s scroll lock system-wide unless needed for C1  

---

