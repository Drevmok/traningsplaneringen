# Slice 03 — shipped (real Swedish drills)

## How to run

```bash
cd /workspace/gymnastics-planner/app
npm install
npm run dev
```

Build: `npm run build` (green at ship time).

## Counts

| Block | Antal |
| --- | ---: |
| Samling (`gathering`) | 3 |
| Uppvärmning (`warmup`) | 5 |
| Teknik (`techniques`) | 9 |
| Styrka (`strength`) | 3 |
| Lek och spel (`fun_and_games`) | 8 |
| **Totalt** | **28** |

All 28 have `stub: false` (no Utkast badge).

Source: `slice-03/content/slice-03-seed-activities.sv.md`

## Experienced-coach-only (visible badge + warning, not hidden)

Exactly these two:

- `tech-rondat-flickis` (Rondat–flickis)
- `tech-salto-fran-hojd` (Salto från höjd)

Flags: `experiencedCoachOnly: true`, `newCoachOk: false`, `difficulty: hard`.  
UI: rose **Erfaren ledare** badge on card + detail; strong warning alert in detail; **Lägg till** still allowed. Library default shows all 28 (no filter-out).

## Template remapping

Old Slice 01 stub ids replaced with Slice 03 new-coach-safe ids only (no experienced-only drills in templates).

### `tmpl-beginner-60` — title “Nybörjare — ca 55 min” · item sum **55**

| Block | Activities |
| --- | --- |
| Samling | `gather-valkomstcheck-in` (5), `gather-dagens-teknik` (3) |
| Uppvärmning | `warm-hall-varv` (10) |
| Teknik | `tech-ljushopp-satsbrada` (6), `tech-handstaende-falla-rygg` (6), `tech-falla-bakat-hojd` (6) |
| Styrka | `strength-styrkelatar` (5), `strength-burpee-emom` (8) |
| Lek | `fun-rundpingis-medicinboll` (6) |

### `tmpl-short-45` — title “Kort pass — ca 45 min” · item sum **45**

| Block | Activities |
| --- | --- |
| Samling | `gather-valkomstcheck-in` (5) |
| Uppvärmning | `warm-uppvarmningsdans` (6), `warm-tojning-coach` (5) |
| Teknik | `tech-ljushopp-satsbrada` (6), `tech-handstaende-falla-rygg` (6) |
| Styrka | `strength-burpee-emom` (8) |
| Lek | `fun-handstaende-utmaning` (5), `fun-123-forflyttning` (4) |

## Files changed

- `src/types.ts` — added `experiencedCoachOnly?`, `newCoachOk?`, `needsCoachReview?`
- `src/data/seedActivities.ts` — **replaced** entire stub catalog with 28 real drills
- `src/data/seedTemplates.ts` — both templates remapped to Slice 03 ids
- `src/data/blockMeta.ts` — UI chrome (`Erfaren ledare`, warning); new `VISUAL_EMOJI` keys
- `src/components/ActivityCard.tsx` — experienced badge
- `src/components/ActivityDetail.tsx` — experienced badge + warning (add still allowed)
- `src/App.css` — `.experienced-badge`, `.experienced-warning`, `.howto-steps`
- `src/App.tsx` — footer → Slice 03
- `SLICE02-SHIPPED.md` — note that `tmpl-short-45` ~45 sum bump was a Slice 01 follow-up, not Slice 02
- `SLICE03-SHIPPED.md` — this file

## Gaps / notes

- Optional library filter chip for coach level was **not** added (default shows all with badge; out-of-scope polish).
- `needsCoachReview` is stored on seed activities but not surfaced as a picker badge (Docs label exists in `UI.needsCoachReview` for later).
- `warm-123-voltpositioner` vs `fun-123-forflyttning` distinguished by title + id (no collision).
- Drafts saved under Slice 01/02 that reference old stub activity ids will show as missing titles until re-planned — expected after catalog replace.

## Do not break (unchanged)

- Session total = item sum only; soft mismatch; templates confirm/cancel; draft save / Fortsätt
- Five locked blocks; reorder within block only
- Slice 02 phone sheets / layout
