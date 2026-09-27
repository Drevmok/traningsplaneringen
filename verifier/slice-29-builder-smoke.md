# Slice 29 — Builder self-smoke

Date: 2026-09-27 23:17:40 (Europe/Stockholm)
Viewport: 390×844 phone
Preview: http://127.0.0.1:4173/traningsplaneringen/

## PASS
- Doctor HTTP 200 on /traningsplaneringen/
- Home primary CTA = Planera pass (A1)
- Nytt pass + Starta från mall secondary escapes (E1)
- homeInvite Docs string
- Q1 progress + label (B1)
- Q1 options 4–6 / 7–9 / Nybörjare / Träning
- Q2 Fokus options (B1)
- wizardFocusHonesty on Q2
- Q3 hall presets (B1)
- Trampett path: five blocks each ≥1 item
- Samling 6/6 no Över budget
- Soft Samling pair Närvaro + Dagens pass
- Warmup ≤10 no Över (10/10)
- Title Pass — trampett
- Footer Träningsplaneraren · Slice 29
- ≥1 chip in trampett zone (D1)
- Teknik placements count 3
- Samling not placed on hall (Teknik-only)
- Caption Schematisk hall — inte exakt mått
- hallTemplateId = standard-trupp from Q3
- Cancel wizard does not overwrite draft
- Vault path title Pass — satsbräda
- Satsbräda path ≥1 chip in vault zone
- Escape Nytt pass Soft 6/6
- Escape Nytt pass empty hall placements
- Escape mall Nybörjare Soft pair ≤6 (Slice 28)

## FAIL
- none

## Smoke gaps
- Desktop viewport not separately driven
- Slice 22 quiet / 23 Hall·Golvklart secondary / 24–26 Förråd·saknar·place-step not fully re-walked (hall caption + Teknik-only spot covered)

## Log
- doctor status 200
- home primary Planera pass; secondary Nytt pass + Starta från mall; invite Docs
- shot /workspace/screenshots/slice29_home_primary.png
- q1 Fråga 1 av 3 · Ålder / nivå · 4–6 / 7–9 / Nybörjare / Träning
- shot /workspace/screenshots/slice29_wizard_q1.png
- q2 Fokus · Satsbräda / Trampett / Tumbling / Blandat + honesty
- shot /workspace/screenshots/slice29_wizard_q2.png
- q3 Hallayout · Standard trupp / Tävling / linjer / Liten hall
- shot /workspace/screenshots/slice29_wizard_q3.png
- trampett path title Pass — trampett; blocks 2/1/3/2/1; Samling 6/6; warmup 10/10
- shot /workspace/screenshots/slice29_trampett_passbyggaren.png
- footer Slice 29
- shot /workspace/screenshots/slice29_footer.png
- hall trampett: placements zoneId trampett×2 + open×1; gatheringPlaced=false; caption OK; template standard-trupp
- shot /workspace/screenshots/slice29_trampett_hall.png
- cancel keeps CANCEL-SEED draft
- vault path Pass — satsbräda; vault×2 + open×1
- shot /workspace/screenshots/slice29_vault_passbyggaren.png
- shot /workspace/screenshots/slice29_vault_hall.png
- blank Soft 6/6 Närvaro+Dagens pass; placements=[]
- shot /workspace/screenshots/slice29_escape_nytt_pass.png
- mall Nybörjare Soft 6/6
- shot /workspace/screenshots/slice29_escape_mall_beginner.png

## Summary
**PASS** — 26 PASS / 0 FAIL
