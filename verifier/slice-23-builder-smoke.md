# Slice 23 — Builder self-smoke

Date: 2026-09-26 06:15:03 (Europe/Stockholm)
Viewport: 390×844 phone
Preview: http://127.0.0.1:4173/traningsplaneringen/

## PASS
- E1 footer: Träningsplaneraren · Slice 23 · Visa tips igen
- A1 hidden without draft
- B1 honesty present (no draft)
- B1 phone block + live URL (no draft)
- C1 primary three cards present (no draft)
- C1 Kom igång present (not removed by Slice 23)
- A1 secondary visible with empty draft
- A1 soft-fail Hall flash need-activity
- A1 soft-fail Golvklart flash need-activity
- A1 Home-level flash works (Kom igång still visible)
- B1 phone + honesty with draft
- A1 hit targets ≥44
- A1 Swedish labels Hallöversikt / Golvklart
- A1 secondary under primary with draft+activities
- C1 Kom igång not force-expanded after progress
- A1 Hallöversikt opens hall edit
- A1 Golvklart opens floor
- A1 primary cards still present after opens
- F1 no saknar/sync/Förråd empty CTA on Home
- F1 caption unchanged

## FAIL
- none

## Smoke gaps
- Desktop viewport not separately driven
- Soft-fail need-hall path not exercised (openGolvklart currently only fails on 0 activities)
- Primary Nytt full create path not walked (cards present asserted)

## Log
- PASS: E1 footer: Träningsplaneraren · Slice 23 · Visa tips igen
- noDraft {"secondary":false,"hallAria":false,"golvAria":false,"honesty":true,"phone":true,"phoneTitle":"Öppna på telefon","href":"https://drevmok.github.io/traningsplaneringen/","linkText":"https://drevmok.github.io/traningsplaneringen/","primaryCards":3,"kom":true}
- PASS: A1 hidden without draft
- PASS: B1 honesty present (no draft)
- PASS: B1 phone block + live URL (no draft)
- PASS: C1 primary three cards present (no draft)
- PASS: C1 Kom igång present (not removed by Slice 23)
- shot /workspace/screenshots/slice23_no_draft.png
- emptyDraftUi {"hasSecondary":true,"btns":[{"text":"Hallöversikt","aria":"Öppna Hallöversikt från Hem","h":140,"w":358},{"text":"Golvklart","aria":"Öppna Golvklart från Hem","h":140,"w":358}]}
- PASS: A1 secondary visible with empty draft
- flashHall Lägg till minst en övning först
- PASS: A1 soft-fail Hall flash need-activity
- shot /workspace/screenshots/slice23_soft_fail_empty.png
- flashGolv Lägg till minst en övning först
- PASS: A1 soft-fail Golvklart flash need-activity
- dismiss {"clicked":false}
- flashAfterDismiss {"kom":true,"flash":"Lägg till minst en övning först"}
- PASS: A1 Home-level flash works (Kom igång still visible)
- PASS: B1 phone + honesty with draft
- PASS: A1 hit targets ≥44
- PASS: A1 Swedish labels Hallöversikt / Golvklart
- withActs {"secondary":true,"cards":3,"hall":true,"golv":true,"komCollapsed":true,"komExpanded":false}
- PASS: A1 secondary under primary with draft+activities
- PASS: C1 Kom igång not force-expanded after progress
- shot /workspace/screenshots/slice23_with_draft_home.png
- hallState {"title":"Hallöversikt","isFloor":false}
- PASS: A1 Hallöversikt opens hall edit
- shot /workspace/screenshots/slice23_open_hall.png
- floorState {"isFloor":true,"title":"Golvklart · 55 min"}
- PASS: A1 Golvklart opens floor
- shot /workspace/screenshots/slice23_open_golvklart.png
- primary titles ["Nytt pass","Starta från mall","Fortsätt senaste pass"]
- PASS: A1 primary cards still present after opens
- PASS: F1 no saknar/sync/Förråd empty CTA on Home
- PASS: F1 caption unchanged
- shot /workspace/screenshots/slice23_hall_caption.png

## Screenshots
- `/workspace/screenshots/slice23_*.png`
