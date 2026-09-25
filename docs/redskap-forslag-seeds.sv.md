# Redskap-förslag — seed-tabell (Slice 18)

**Status:** Docs lock — Slice 18 **APPROVED 2026-09-25**. Living table also in [`station-compose.sv.md`](./station-compose.sv.md).  
**Tone:** Warm, short, coach-to-coach. Prefer *du*.  
**Product lock:** Broader selective `defaultStationEquipment` on Teknik drills. Unset may show förslag; `[]` = coach cleared. **Använd förslag** / **Klar** persist. Golvklart / Förrådslista / print use **SAVED** composition only.  
**Carry-forward:** Library labels from [`station-compose.sv.md`](./station-compose.sv.md). Quiet rules from [`golvklart-redskap.sv.md`](./golvklart-redskap.sv.md) + [`forradslista.sv.md`](./forradslista.sv.md).  
**Locked terms:** gymnaster · pass · övning · station / stationer · markör · redskap · Hallöversikt · Golvklart · Erfaren · Passbyggaren · Använd förslag · Klar · Redigera redskap  
**Keep hall caption exactly:** **Schematisk hall — inte exakt mått**  
**Out of scope copy:** New library pieces, Passbyggaren-compose CTA, canvas badge, CAD, auto-apply förslag on place, Netlify, accounts.

Builder authority for arrays: `app/src/data/seedActivities.ts` — this file is the Docs-facing table.

---

## Locked answers (A–F)

| # | Topic | Locked answer |
| --- | --- | --- |
| A | Which drills | Seed **all five** remaining Teknik (table below) |
| B | UX | No change to Använd förslag / unset vs `[]` / Klar |
| C | Floor / list | Omit unset förslag until Klar / Använd förslag |
| D | Docs | Thin table in station-compose; no required tip |
| E | Footer | Träningsplaneraren · Slice 18 |
| F | Guards | No library growth; no badge/CAD; caption unchanged |

---

## Övningar som redan har förslag (KEEP)

Ändra **inte** dessa fyra arrayer.

| activityId | Övning | Förslag (redskap) |
| --- | --- | --- |
| `tech-ljushopp-satsbrada` | Ljushopp på satsbräda | Satsbräda ×1, Landningsmatta ×1 |
| `tech-ljushopp-trampett` | Ljushopp på trampett | Trampett ×1, Landningsmatta ×1 |
| `tech-satsbrada-volt-rygg` | Satsbräda volt till rygg | Satsbräda ×1, Landningsmatta ×1 |
| `tech-trampett-volt-mattberg` | Trampett volt upp på mattberg | Trampett ×1, Mattberg ×1, Landningsmatta ×1 |

---

## Nya fröer (Slice 18)

Alla kvarvarande Teknik. Coach kan alltid ändra efter **Använd förslag**.

| activityId | Övning | Förslag (redskap) | pieceId-slots | Motivering (kort) |
| --- | --- | --- | --- | --- |
| `tech-flickis-kudde` | Flickis med flickiskudde | Flickiskudde ×1, Madrass ×1 | `eq-flickiskudde`×1, `eq-madrass`×1 | Titeln namnger kudden; mjuk yta för bakåtrörelse |
| `tech-rondat-flickis` | Rondat–flickis | Tumblingmatta ×1, Landningsmatta ×1 | `eq-tumblingmatta`×1, `eq-landningsmatta`×1 | Tumbling-linje på golv (Erfaren) |
| `tech-falla-bakat-hojd` | Falla bakåt från höjd till rygg | Plint ×1, Madrass ×1 | `eq-plint`×1, `eq-madrass`×1 | how: plint/höjd + tjock/lång madrass bakom |
| `tech-salto-fran-hojd` | Salto från höjd | Plint ×1, Landningsmatta ×1 | `eq-plint`×1, `eq-landningsmatta`×1 | Höjd + madrassuppställning; landningsmatta som i volt-familjen |
| `tech-handstaende-falla-rygg` | Handstående falla till rygg | Madrass ×1 | `eq-madrass`×1 | how: madrass bakom innan handstående |

**Efter ship:** 9 / 9 Teknik-övningar har `defaultStationEquipment`.

### Avfärdade alternativ (ersatta av låsning A)

- **A2 — tre säkraste:** endast `tech-flickis-kudde`, `tech-falla-bakat-hojd`, `tech-handstaende-falla-rygg`.
- **A3 — hoppa Erfaren:** utelämna `tech-rondat-flickis` och/eller `tech-salto-fran-hojd`.
- **A4 — byt bitar:** t.ex. Airtrack i stället för Tumblingmatta; Mattberg i stället för Plint på salto; Landningsmatta i stället för Madrass på flickis-kudde.

---

## Copy keys (reuse — no new required tip)

| Key | Swedish (already shipped) |
| --- | --- |
| `stationEquipmentSuggested` | Förslag — du kan ändra |
| `stationEquipmentUseSuggested` | Använd förslag |
| `stationEquipmentEdit` | Redigera redskap |
| `composeDone` | Klar |

- Visa förslag **bara** när `stationEquipment` är unset **och** aktiviteten har `defaultStationEquipment`.
- Visa **inte** förslag när värdet är `[]` (coach har rensat).
- Golvklart / utskrift / Förrådslista: **bara sparad** uppsättning.

### Soft tip (optional — **not** required for PASS)

| Key | Swedish |
| --- | --- |
| `tipRedskapForslag` | Fler Teknik-övningar har ett färdigt redskapsförslag — tryck Använd förslag om det stämmer för er hall. |

At most one soft tip; dismissible; omit entirely if Docs/Builder prefers quiet.

---

## Docs polish target

Living drill→förslag table lives in `docs/station-compose.sv.md` (existing four + locked new). Keep library of 10 unchanged.

---

## Footer

| Key | Swedish |
| --- | --- |
| `footerSliceLabel` | Träningsplaneraren · Slice 18 |

---

## Out of scope (do not invent)

- Nya `eq-*` / “eget redskap”
- Passbyggaren-compose CTA
- Canvas badge / CAD
- Auto-spara förslag vid placering
- Ändra caption **Schematisk hall — inte exakt mått**
- Netlify / konton / moln
