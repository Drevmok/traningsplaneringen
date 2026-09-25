# Använd alla förslag — svensk microcopy (Slice 19)

**Status:** Docs lock — Slice 19 **APPROVED 2026-09-25**. Living keys also in [`docs/hall-oversikt-copy.sv.md`](../../docs/hall-oversikt-copy.sv.md) and [`docs/anvand-alla-forslag.sv.md`](../../docs/anvand-alla-forslag.sv.md).  
**Tone:** Warm, short, coach-to-coach. Prefer *du*.  
**Product lock:** Hallöversikt **edit** secondary CTA bulk-accepts unset Teknik seeds via the same persist path as **Använd förslag**. Immediate apply + one-line result; no confirm. Edit chrome only — not markör sheet, not Golvklart, not Passbyggaren.  
**Carry-forward:** Unset vs `[]` + per-station Använd förslag / Klar (13). Quiet Golvklart / Förrådslista / print until saved (14–15). Nine Teknik seeds (18). Caption unchanged.  
**Locked terms:** gymnaster · pass · övning · station / stationer · markör · redskap · Hallöversikt · Golvklart · Förrådslista · Kom igång · Erfaren · Passbyggaren · Använd förslag · Använd alla förslag · Klar · Redigera redskap  
**Keep hall caption exactly:** **Schematisk hall — inte exakt mått**  
**Out of scope copy:** Auto-apply on place, Passbyggaren compose, canvas badge, CAD, library growth, Netlify, accounts, required tip.

---

## Locked answers (A–F)

| # | Topic | Locked answer |
| --- | --- | --- |
| A | Placement | Edit chrome secondary near hall actions |
| B | Confirm UX | Immediate apply + one-line result; soft no-op if N=0; no confirm |
| C | Eligibility | Placed Teknik + unset + non-empty seed; skip saved and `[]` |
| D | Docs | Thin Swedish CTA + result (+ disabled / N=0); no required tip |
| E | Footer | Träningsplaneraren · Slice 19 |
| F | Guards | Caption unchanged; no Passbyggaren compose; no badge/CAD; no library growth; no Netlify; preserve 11–18 |

---

## CTA (Hallöversikt edit chrome)

| Key | Swedish |
| --- | --- |
| `hallApplyAllSuggested` | Använd alla förslag |
| `hallApplyAllSuggestedAria` | Använd alla osparade redskapsförslag på placerade Teknik-stationer |
| `hallApplyAllSuggestedDisabled` | Inga stationer med osparade förslag |

- Secondary button near Visa/dölj flöde + Förrådslista; primary stays **Golvklart**.
- Prefer **disabled** (not hidden) when count of eligible stations is 0 — use `hallApplyAllSuggestedDisabled` as `title` / `aria-describedby`.
- **Do not** show this CTA on Golvklart floor chrome, in markör detail, or on Passbyggaren.

---

## Result feedback

| Key | Swedish |
| --- | --- |
| `hallApplyAllSuggestedResult` | Sparade redskap på {n} stationer |
| `hallApplyAllSuggestedResultOne` | Sparade redskap på 1 station |
| `hallApplyAllSuggestedNone` | Inga osparade förslag just nu. |

- Prefer `hallApplyAllSuggestedResultOne` when N === 1; otherwise `hallApplyAllSuggestedResult`.
- Soft `role="status"` toast/banner — do not block Golvklart or the canvas.
- Use `hallApplyAllSuggestedNone` only for the N=0 race after tap (edge case); not an error.

---

## Eligibility (copy reminder for Builder)

Apply **only** when a placed Teknik item has:

1. `stationEquipment === undefined` (unset)  
2. non-empty `activity.defaultStationEquipment`

Skip saved lists, `[]` (coach cleared), seedless drills, unplaced Teknik, and non-Teknik. Same persist path as per-station **Använd förslag**.

---

## Soft tip (optional — **not** required for PASS)

| Key | Swedish |
| --- | --- |
| `tipAnvandAllaForslag` | Har du flera Teknik-stationer med förslag? Tryck Använd alla förslag en gång — sedan syns redskapen i Golvklart och Förrådslista. |

At most one soft tip; dismissible; omit entirely if Docs/Builder prefers quiet.

---

## Footer

| Key | Swedish |
| --- | --- |
| `footerSliceLabel` | Träningsplaneraren · Slice 19 |

---

## Out of scope (do not invent)

- Confirm-dialog copy / browser `confirm`
- Golvklart or Passbyggaren variants of this CTA
- Overwrite-saved / re-apply-onto-`[]` wording
- Auto-spara förslag vid placering
- Ändra caption **Schematisk hall — inte exakt mått**
- Netlify / konton / moln
