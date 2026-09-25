# Slice 21 — Builder self-smoke

Date: 2026-09-25T23:12:13.364Z (box local Europe/Stockholm)
Viewport: 390×844 phone
Preview: http://127.0.0.1:4173/traningsplaneringen/

## PASS
- E1 footer: Träningsplaneraren · Slice 21·Visa tips igen
- B1 collapsed default: "Ej placerade (3)", trayH=62, mq=true, vw=390
- B1 expand: 62→300, Dölj bricka, chips=true
- B1 collapse again: 300→62
- F1 caption unchanged
- A1 +/− zoom 100%→150%
- C1 overflow pan available: {"scrollLeft":50,"scrollTop":0,"scrollW":537,"clientW":358}
- A1 clamp MAX=2
- Pinch host .hall-canvas-wrap present
- A1 view-only placements persist: [{"id":"item-zo7kic80-muhksfyv","x":0.39963503649635035,"y":0.39972627346991146}]
- C1 short tap opens detail: {"hasRedigera":true,"hasStang":false}
- Golvklart: no edit tray/remove; +/− present
- A1 Golvklart zoom → 150%

## FAIL
- none

## Smoke gaps
- Pinch multi-touch not exercised in headless automation — code has touchstart/move/end on .hall-canvas-wrap; Verifier phone-check

## Log
- Loaded clean http://127.0.0.1:4173/traningsplaneringen/
- template card: true
- modal confirm: true
- Hallöversikt btn: {"ok":true,"disabled":false}
- hallState: {"expand":true,"compactCount":"Ej placerade (3)","trayH":62,"trayClass":"hall-tray hall-tray--sticky hall-tray--compact no-print","zoomW":"100%","mqNarrow":true,"vw":390,"title":"Hallöversikt","bodySnippet":"← Tillbaka till Passbyggaren\nHallöversikt\n\nNybörjare — ca 55 min\n3 stationer\n\nDölj flöde\nFörrådslista\nAnvänd alla förslag\nGolvklart\nHallayout\nStandard trupp\nTävling / linjer\nLiten hall\n\nPlacerade övningar flyttas till samma zon i den nya layouten när det går.\n\nVälj den hallayout som liknar er hall mest. Övningar på trampett, tumbling och liknande fäster i zonen; på öppen yta placerar du fritt.\n\nSt"}
- placements before reload: [{"id":"item-zo7kic80-muhksfyv","x":0.39963503649635035,"y":0.39972627346991146}]

## Screenshots
- `/workspace/screenshots/slice21_*.png`