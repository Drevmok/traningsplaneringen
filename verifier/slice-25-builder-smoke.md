# Slice 25 — Builder self-smoke

Date: 2026-09-26 10:24:36 (Europe/Stockholm)
Viewport: 390×844 phone
Preview: http://127.0.0.1:4173/traningsplaneringen/

## PASS
- E1 footer Slice 25
- F1 caption unchanged
- A1 unset: edit shows saknar banner (singular)
- B1 CTA when eligible ≥1
- B1/C1 CTA ≥44px
- B1 CTA aria Docs-locked
- C1 Golvklart still enabled with saknar
- B1 points at apply-all (focus/highlight/toast)
- B1 point toast Docs copy
- B1 no auto-apply — stationEquipment still unset
- B1 apply-all persists seeds
- B1 apply-all result toast
- A1 banner clears after save
- A1 cleared []: banner shows
- B1 cleared []: no CTA (eligible=0)
- Spot: apply-all disabled when eligible=0
- Spot: apply-all disabled title when eligible=0
- precondition: edit saknar visible before Golvklart
- A1 Golvklart: no saknar banner
- A1 Golvklart reachable / works
- Spot: Slice 24 Förråd soft path still present
- A1 saved: no saknar banner

## FAIL
- none

## Smoke gaps
- Desktop viewport not separately driven
- Slice 22 tip-strip / Slice 23 Home polish assumed intact (not re-walked)
- Compose / Redigera redskap from banner not attempted (F1 out of scope)

## Log
- footer {"hasSlice25":true,"snippet":"Träningsplaneraren · Slice 25"}
- PASS: E1 footer Slice 25
- caption Schematisk hall — inte exakt mått
- PASS: F1 caption unchanged
- unset edit saknar {"isFloor":false,"banner":true,"statusText":"1 station saknar redskap","cta":true,"ctaText":"Använd alla förslag","ctaAria":"Visa Använd alla förslag. Sparar inte automatiskt.","ctaH":44,"ctaW":161.203125,"applyDisabled":false,"applyTitle":"","golvklartEnabled":true}
- PASS: A1 unset: edit shows saknar banner (singular)
- PASS: B1 CTA when eligible ≥1
- PASS: B1/C1 CTA ≥44px
- PASS: B1 CTA aria Docs-locked
- PASS: C1 Golvklart still enabled with saknar
- shot /workspace/screenshots/slice25_unset_banner_cta.png
- afterPoint {"applyFocused":true,"applyHighlight":true,"toastText":"Tryck Använd alla förslag för att spara.","applyDisabled":false}
- PASS: B1 points at apply-all (focus/highlight/toast)
- PASS: B1 point toast Docs copy
- shot /workspace/screenshots/slice25_after_saknar_point.png
- equipment after point {"hasTech":true,"unset":true,"cleared":false,"placements":1}
- PASS: B1 no auto-apply — stationEquipment still unset
- apply clicked true
- equipment after apply {"hasTech":true,"stationEquipment":[{"pieceId":"eq-satsbrada","count":1},{"pieceId":"eq-landningsmatta","count":1}],"unset":false,"cleared":false,"placements":1}
- PASS: B1 apply-all persists seeds
- apply toast Sparade redskap på 1 station
- PASS: B1 apply-all result toast
- after apply saknar {"isFloor":false,"banner":false,"statusText":null,"cta":false,"ctaText":null,"ctaAria":"","ctaH":0,"ctaW":0,"applyDisabled":true,"applyTitle":"Inga stationer med osparade förslag","golvklartEnabled":true}
- PASS: A1 banner clears after save
- shot /workspace/screenshots/slice25_after_apply_cleared.png
- cleared [] saknar {"isFloor":false,"banner":true,"statusText":"1 station saknar redskap","cta":false,"ctaText":null,"ctaAria":"","ctaH":0,"ctaW":0,"applyDisabled":true,"applyTitle":"Inga stationer med osparade förslag","golvklartEnabled":true}
- PASS: A1 cleared []: banner shows
- PASS: B1 cleared []: no CTA (eligible=0)
- PASS: Spot: apply-all disabled when eligible=0
- PASS: Spot: apply-all disabled title when eligible=0
- shot /workspace/screenshots/slice25_cleared_banner_no_cta.png
- PASS: precondition: edit saknar visible before Golvklart
- enter Golvklart true
- golvklart saknar {"isFloor":true,"banner":false,"statusText":null,"cta":false,"ctaText":null,"ctaAria":"","ctaH":0,"ctaW":0,"applyDisabled":null,"applyTitle":"","golvklartEnabled":false}
- PASS: A1 Golvklart: no saknar banner
- PASS: A1 Golvklart reachable / works
- shot /workspace/screenshots/slice25_golvklart_no_saknar.png
- open Förråd true
- forrad soft path {"softCta":true,"softHint":true}
- PASS: Spot: Slice 24 Förråd soft path still present
- shot /workspace/screenshots/slice25_forrad_soft_path_intact.png
- saved no saknar {"isFloor":false,"banner":false,"statusText":null,"cta":false,"ctaText":null,"ctaAria":"","ctaH":0,"ctaW":0,"applyDisabled":true,"applyTitle":"Inga stationer med osparade förslag","golvklartEnabled":true}
- PASS: A1 saved: no saknar banner
- shot /workspace/screenshots/slice25_saved_no_banner.png
- smoke complete

## Screenshots
- `/workspace/screenshots/slice25_*.png`
