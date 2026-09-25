# Golvklart — korta stationsnamn på skärm (Slice 17)

**Status:** Docs lock — Slice 17 APPROVED 2026-09-25 (A–F locked). Builder may ship from these notes.  
**Tone:** Warm, short, coach-to-coach. Prefer *du*.  
**Product lock:** Show the **existing** short station title (`.hall-chip-title--print` / `activity.title`) under each placed Teknik markör on **Golvklart screen**. Edit Hallöversikt canvas stays title-hidden. Print unchanged. Stack title above Slice 14 redskap when present.  
**Carry-forward:** Redskap quiet / count×label from [`golvklart-redskap.sv.md`](./golvklart-redskap.sv.md). Marker chrome from [`station-tiles.sv.md`](./station-tiles.sv.md).  
**Locked terms:** gymnaster · pass · övning · station / stationer · markör · redskap · Hallöversikt · Golvklart · Erfaren · Passbyggaren  
**Keep hall caption exactly:** **Schematisk hall — inte exakt mått**  
**Out of scope copy:** Edit-canvas titles, equipment badge, CAD, “Inga redskap” under quiet markörer, broader förslag seeds, Netlify, accounts.

**Supersedes** Slice 14 “short title stays print-only on Golvklart **screen**” — edit canvas remains hidden; print already showed titles.

---

## Locked answers (A–F)

| # | Topic | Lock |
| --- | --- | --- |
| A | Where (screen) | **Golvklart (`.is-floor`) only** — edit canvas titles stay hidden |
| B | Stack | Like print — **title then redskap** |
| C | Truncation | Keep existing short-title ellipsis chrome (~9–10ch) |
| D | Empty redskap | **Always** show title on Golvklart markörer |
| E | Footer | **Träningsplaneraren · Slice 17** |
| F | Caption / tips | Caption unchanged; **no** required tip; no badge/CAD |

---

## Visibility matrix

| Mode | Kort stationsnamn | Redskap-rader |
| --- | --- | --- |
| Hallöversikt (redigera) | **Dolt** | Dolt |
| Golvklart (skärm) | **Synligt** | Synligt om ifyllda (**under** namnet) |
| Utskrift | Synligt | Synligt om ifyllda (**under** namnet) |

Authority for this matrix also lives in [`golvklart-redskap.sv.md`](./golvklart-redskap.sv.md) (updated for Slice 17).

---

## Layout (no new title string)

```
[3]  (icon)
     Volthop…          ← short title (~9–10ch ellipsis)
     2× Trampett       ← Slice 14 (only if non-empty)
     Landningsmatta
```

When redskap quiet:

```
[3]  (icon)
     Volthop…          ← title still shown (locked D)
```

- Title source = `activity.title` (reuse existing chrome; do not invent a second display title).  
- Full name stays in detail + existing markör a11y (`hallTileA11y…`). Decorative under-markör title may stay `aria-hidden` if a11y already covers it.  
- Prefer ellipsis over growing the ~52px hit target.

---

## Soft tip (optional — not required for PASS)

| Key | Swedish |
| --- | --- |
| `tipGolvklartShortTitles` | Under markörerna syns stationsnamnen — bra när du håller upp skärmen för gruppen. |

- At most one soft tip; dismissible; **not** required for Verifier PASS.  
- Do not add a modal.  
- Do not change caption.  
- Do not replace `tipGolvklartEquipment` — at most one soft Golvklart tip if Builder adds any.

---

## Footer

| Key | Swedish |
| --- | --- |
| `footerSliceLabel` | Träningsplaneraren · Slice 17 |

Keep footer `no-print`.

---

## Unchanged locks (copy)

- Golvklart / Avsluta golvklart / Skriv ut  
- Slice 14 quiet redskap (no “Inga redskap”; no “+N till”)  
- Slice 15 Förrådslista · Slice 16 Kom igång  
- Detail: **Redigera redskap** (hall only)  
- Caption: **Schematisk hall — inte exakt mått**  
- No Passbyggaren compose · no canvas badge · no CAD

---

## Do not ship

- Short titles on **edit** Hallöversikt canvas  
- Implying titles require composed redskap  
- New parallel “display title” field / English “station name under marker” as primary chrome  
- Broader förslag catalog (idea 1)  
- CAD / badge / Netlify / konton language

---

## Notes for Builder

- Prefer CSS show of `.hall-chip-title--print` on `.is-floor` + stack equipment under title (mirror print `top`).  
- Prefer **no** new TSX title field.  
- Companion: this file under `docs/golvklart-short-titles.sv.md`. Visibility matrix also in `golvklart-redskap.sv.md`.
