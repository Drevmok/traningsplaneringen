# Slice 24 — Builder self-smoke

Date: 2026-09-26 06:46:32 (Europe/Stockholm)
Viewport: 390×844 phone
Preview: http://127.0.0.1:4173/traningsplaneringen/

## PASS
- E1 footer Slice 24
- F1 caption unchanged
- A1 eligible empty: soft copy + CTA, no EmptyHint
- C1 soft CTA ≥44px
- C1 soft CTA aria Docs-locked
- B1 soft CTA closes Förråd
- B1 Hall edit mode after CTA
- B1 points at apply-all (focus/highlight/toast)
- B1 point toast Docs copy
- B1 no auto-apply — stationEquipment still unset
- B1 apply-all persists seeds
- B1 apply-all result toast
- A1 Förråd fills after apply-all
- A1 not-eligible empty: EmptyHint only, no soft CTA
- Q4 opened Förråd from Golvklart path (floor on)
- Q4 soft CTA visible on Golvklart-opened Förråd
- Q4 soft CTA exits floor → edit → points at apply-all
- Q4 point cue after floor exit

## FAIL
- none

## Smoke gaps
- Desktop viewport not separately driven
- Disabled apply-all title when count=0 not re-asserted beyond not-eligible empty
- Slice 22 tip-strip / Slice 23 Home polish assumed intact (not re-walked)

## Log
- footer {"hasSlice24":true,"snippet":"Träningsplaneraren · Slice 24"}
- PASS: E1 footer Slice 24
- caption Schematisk hall — inte exakt mått
- PASS: F1 caption unchanged
- eligible empty forrad {"open":true,"empty":true,"softCta":true,"softHint":true,"emptyHint":false,"emptyLead":true,"rows":0,"ctaH":44,"ctaW":227.609375,"ctaAria":"Stäng Förrådslista och visa Använd alla förslag på Hallöversikt. Sparar inte automatiskt."}
- PASS: A1 eligible empty: soft copy + CTA, no EmptyHint
- PASS: C1 soft CTA ≥44px
- PASS: C1 soft CTA aria Docs-locked
- shot /workspace/screenshots/slice24_eligible_empty_soft.png
- afterPoint {"sheetOpen":false,"isFloor":false,"applyFocused":true,"applyHighlight":true,"toastText":"Tryck Använd alla förslag för att spara.","applyDisabled":false}
- PASS: B1 soft CTA closes Förråd
- PASS: B1 Hall edit mode after CTA
- PASS: B1 points at apply-all (focus/highlight/toast)
- PASS: B1 point toast Docs copy
- shot /workspace/screenshots/slice24_after_soft_cta_point.png
- equipment after point {"hasTech":true,"unset":true,"placements":1}
- PASS: B1 no auto-apply — stationEquipment still unset
- apply clicked true
- equipment after apply {"hasTech":true,"stationEquipment":[{"pieceId":"eq-satsbrada","count":1},{"pieceId":"eq-landningsmatta","count":1}],"unset":false,"placements":1}
- PASS: B1 apply-all persists seeds
- apply toast Sparade redskap på 1 station
- PASS: B1 apply-all result toast
- forrad after apply {"open":true,"empty":false,"softCta":false,"softHint":false,"emptyHint":false,"emptyLead":false,"rows":2,"ctaH":0,"ctaW":0,"ctaAria":""}
- PASS: A1 Förråd fills after apply-all
- shot /workspace/screenshots/slice24_forrad_filled.png
- not eligible empty {"open":true,"empty":true,"softCta":false,"softHint":false,"emptyHint":true,"emptyLead":true,"rows":0,"ctaH":0,"ctaW":0,"ctaAria":""}
- PASS: A1 not-eligible empty: EmptyHint only, no soft CTA
- shot /workspace/screenshots/slice24_not_eligible_empty.png
- golvklart open true
- PASS: Q4 opened Förråd from Golvklart path (floor on)
- floor eligible forrad {"open":true,"empty":true,"softCta":true,"softHint":true,"emptyHint":false,"emptyLead":true,"rows":0,"ctaH":44,"ctaW":227.609375,"ctaAria":"Stäng Förrådslista och visa Använd alla förslag på Hallöversikt. Sparar inte automatiskt."}
- PASS: Q4 soft CTA visible on Golvklart-opened Förråd
- shot /workspace/screenshots/slice24_golvklart_eligible_empty.png
- afterFloorPoint {"sheetOpen":false,"isFloor":false,"applyFocused":true,"applyHighlight":true,"toastText":"Tryck Använd alla förslag för att spara.","applyPresent":true}
- PASS: Q4 soft CTA exits floor → edit → points at apply-all
- PASS: Q4 point cue after floor exit
- shot /workspace/screenshots/slice24_golvklart_after_soft_cta.png
- smoke complete

## Screenshots
- `/workspace/screenshots/slice24_*.png`
