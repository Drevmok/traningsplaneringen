# Slice 22 — Builder self-smoke

Date: 2026-09-25T23:38:24.003Z (box local Europe/Stockholm)
Viewport: 390×844 phone
Preview: http://127.0.0.1:4173/traningsplaneringen/

## PASS
- E1 footer: Träningsplaneraren · Slice 22 · Visa tips igen
- B1 first-run expanded at 0/n
- B1 collapsed after progress ≥44: 1 av 5 klart
- B1 expand full card ≥44
- B1 collapse persists
- A1 full multi-line hints (tips dismissed, not compact)
- F1 caption unchanged
- A1 place → hallHintsCompact + placement
- A1 multi-line hidden + info ≥44
- A1 info reveals full hint set
- A1 durable compact in storage
- C1 tip → suppress multi-line; info available
- C1 Golvklart banner on, no tip strip
- F1 tray collapse control present
- F1 zoom bar present
- F1 no saknar banner
- Q4 Visa tips igen clears compact + collapse + restores checklist

## FAIL
- none

## Smoke gaps
- Pinch multi-touch not exercised (assumed intact from Slice 21)
- Desktop viewport not separately driven
- Canvas place via mouse may need Verifier phone check if placements forced via draft sync

## Log
- PASS: E1 footer: Träningsplaneraren · Slice 22 · Visa tips igen
- homeFresh {"present":true,"collapsed":false,"intro":true,"steps":5,"progress":"0 av 5 klart","toggle":"Dölj steg"}
- PASS: B1 first-run expanded at 0/n
- shot /workspace/screenshots/slice22_home_fresh_expanded.png
- collapsed {"collapsed":true,"intro":false,"progress":"1 av 5 klart","expandLabel":"Visa steg","expandH":44}
- PASS: B1 collapsed after progress ≥44: 1 av 5 klart
- shot /workspace/screenshots/slice22_home_collapsed.png
- PASS: B1 expand full card ≥44
- shot /workspace/screenshots/slice22_home_expanded_again.png
- PASS: B1 collapse persists
- fullHints {"order":true,"stations":true,"tile":true,"drag":true,"snap":true,"info":false,"tipStrip":false}
- PASS: A1 full multi-line hints (tips dismissed, not compact)
- shot /workspace/screenshots/slice22_hall_full_hints.png
- PASS: F1 caption unchanged
- chipClicked true
- canvas click 16,484.84375 548x422
- afterPlace {"multi":{"order":0,"stations":0,"tile":0,"drag":0},"info":true,"infoH":44,"compact":true,"placements":1}
- PASS: A1 place → hallHintsCompact + placement
- PASS: A1 multi-line hidden + info ≥44
- shot /workspace/screenshots/slice22_hall_compact.png
- PASS: A1 info reveals full hint set
- shot /workspace/screenshots/slice22_hall_info_open.png
- PASS: A1 durable compact in storage
- c1 {"tip":true,"multiOrder":0,"multiDrag":0,"info":true,"placeChrome":true}
- PASS: C1 tip → suppress multi-line; info available
- shot /workspace/screenshots/slice22_hall_c1_tip.png
- floor {"isFloor":true,"banner":"2 stationer ej placerade","tip":false}
- PASS: C1 Golvklart banner on, no tip strip
- shot /workspace/screenshots/slice22_golvklart.png
- PASS: F1 tray collapse control present
- PASS: F1 zoom bar present
- PASS: F1 no saknar banner
- PASS: Q4 Visa tips igen clears compact + collapse + restores checklist

## Screenshots
- `/workspace/screenshots/slice22_*.png`
