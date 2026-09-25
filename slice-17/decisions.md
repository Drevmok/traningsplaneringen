# Slice 17 — decisions (APPROVED)

**Status:** **APPROVED 2026-09-25** — recommended A–F locked (Christoffer skipped lock prompt; Planner proceeded)  
**Direction:** Golvklart screen — short station titles (Scout / backlog idea 3 Approved 2026-09-25)

## A. What Slice 17 adds

**Proposed:** Show the **existing** short station title (`.hall-chip-title--print`) on **Golvklart screen** under each placed Teknik markör. Edit canvas stays title-hidden. Print unchanged. Stack title above Slice 14 redskap lines when present.

| Surface | Slice 17 change? |
|---|---|
| Golvklart screen (`.is-floor`) | **Yes** — show short title under markör |
| Print | **No** behavior change (already shows title + redskap) |
| Hallöversikt edit canvas | **No** — titles stay hidden |
| Passbyggaren / Home / Kom igång | **No** |
| Förrådslista | **No** |
| Redskap line format (Slice 14) | **No** — only vertical stack offset if needed |

**Rejected (standing):** CAD pins / Passbyggaren compose / canvas badge / custom library.  
**Rejected (this pack):** Broader selective förslag (idea 1).  
**Rejected (this pack):** Titles on edit canvas (declutter lock from Slice 12).

## B. Data / model

**Lock proposal:** No new persistence. Reuse `activity.title` already rendered in `.hall-chip-title--print`. CSS / layout only (+ Docs matrix update).

---

## OPEN QUESTIONS — Planner recommendations

### A. Where do short titles appear on screen?

**Recommend: Golvklart (`.is-floor`) only** — still hidden on edit Hallöversikt canvas.

**Why:** Matches Approved backlog shape and Slice 12 declutter. Floor holders need names; editors already open detail / tray.

**Alternatives:** Also show on edit canvas (rejected for declutter); print-only (status quo — does not solve phone-on-floor).

---

### B. Layout when a station also has redskap lines?

**Recommend: Stack like print** — short title directly under markör, then redskap lines below (reuse print `top` offset pattern on `.is-floor`).

**Why:** Print already solved stacking; one mental model for screen and paper. Avoid overlapping title and equipment at the same `top`.

**Alternatives:** Title only when no redskap (weaker for named stations with gear); side-by-side (too wide on phone).

---

### C. Truncation / max width?

**Recommend: Keep existing print chrome** — same ellipsis / ~9–10ch `max-width` as `.hall-chip-title--print` today (Builder may nudge 1–2ch on floor if phone tests need it, without inventing a second title string).

**Why:** Reuse shipped chrome; full name remains in detail + a11y. Avoid a parallel “display title” field.

**Alternatives:** Longer wrap (2 lines) on floor only; full untruncated title (risks overlap).

---

### D. Show title when redskap is empty / unset?

**Recommend: Always show short title** for every placed Teknik markör on Golvklart (and print already does). Quiet redskap stays quiet — no “Inga redskap”.

**Why:** The whole point is readable names without compose. Quiet stations must not stay nameless on floor.

**Alternatives:** Only when redskap non-empty (defeats empty-station naming).

---

### E. Footer label when shipped?

**Recommend: `Träningsplaneraren · Slice 17`**

---

### F. Caption, tips, a11y?

**Recommend:**

- Caption **Schematisk hall — inte exakt mått** **unchanged**
- **No** new required tip for PASS (optional soft tip out of scope)
- Keep markör a11y name via existing `hallTileA11yText` (title already in accessible name); decorative under-markör title may stay `aria-hidden` if a11y already covers it — Builder/Docs do not invent a second spoken title
- **No** Home / edit-canvas visual redesign

---

## Recommended lock summary (for one-tap approve)

| # | Recommendation |
|---|---|
| A | Golvklart screen only (edit canvas stays hidden) |
| B | Stack like print (title then redskap) |
| C | Keep existing short-title ellipsis chrome |
| D | Always show title on Golvklart markörer |
| E | Footer `Träningsplaneraren · Slice 17` |
| F | Caption unchanged; no required new tip; no edit-canvas titles |


---

## LOCKED ANSWERS — A–F

### A. Where do short titles appear on screen?

**Lock: Golvklart (`.is-floor`) only** — still hidden on edit Hallöversikt canvas.

### B. Layout when a station also has redskap lines?

**Lock: Stack like print** — short title under markör, then redskap lines below (reuse print `top` offset on `.is-floor`).

### C. Truncation / max width?

**Lock: Keep existing print chrome** — same ellipsis / ~9–10ch as `.hall-chip-title--print` today (Builder may nudge 1–2ch on floor if phone tests need it, without a second title string).

### D. Show title when redskap is empty / unset?

**Lock: Always show short title** for every placed Teknik markör on Golvklart.

### E. Footer label when shipped?

**Lock: `Träningsplaneraren · Slice 17`**

### F. Caption, tips, a11y?

**Lock:** Caption **Schematisk hall — inte exakt mått** unchanged; no new required tip for PASS; under-markör title may stay `aria-hidden` if a11y name already covers it; no edit-canvas titles; no badge/CAD.

## Carry-forwards (unchanged — hard locks)

- Placeable = Teknik only
- Caption: **Schematisk hall — inte exakt mått**
- Compose = hall detail **Redigera redskap** only
- No canvas equipment badge; no CAD pins
- Slice 14 quiet redskap rules intact
- Slice 15 Förrådslista intact
- Slice 16 Kom igång intact
- gymnaster / pass / Swedish UI
- Device-local drafts; no accounts / cloud
- **Netlify out of this pack**
