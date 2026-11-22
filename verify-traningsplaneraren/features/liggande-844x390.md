# Liggande läge 844×390

**What:** Phone in landscape (844×390). Since Slice 48 F1, `.modal` scrolls when the height is ≤500 px.

**Reach:** Any flow at viewport 844×390 (touch).

**Drive:**
1. Passbyggaren: «Hallöversikt» is visible in the row.
2. «Lägg till övning» → pick a drill: the detail view scrolls; «Lägg till i valt block» and «Lägg till och ändra tid» can be reached and tapped (baseline: unreachable button at 488–528 px).
3. Biblioteket scrolls to the last drill.
4. Hallöversikt with Ändra stationer open: «Klar» is reachable; every hall button, the add-station sheet, Förrådslista, the tray and Golvklart controls are reachable by scrolling.

**Prove:** nothing needed is off-screen; 390×844 detail, Dela and compact sheets look as before.

**Stabila väljare** (Slice 50; roll + synlig svensk etikett först, sedan aria/id/klass som smokes redan använder; inga `data-testid`)

| Vad | Väljare | Källa |
|---|---|---|
| Åtgärdsraden | `.builder-actions` | `App.css`, `components/SessionBuilder.tsx` |
| Hallen under ytan | `.hall-below` | `components/HallBoard.tsx` |
| Hallhuvud | `.hall-header button` | `App.css`, `components/HallBoard.tsx` |
| Stäng ark | `.sheet-close` | `App.css`, `components/HallBoard.tsx` |
| Mer-knappen | `.more-menu > button` | `components/SessionBuilder.tsx`, `export.css` |

**Slice 66 (A1 B1):** Golvklart → Bygg hallen at 844×390: the map and step panel sit side by side with no page scroll. The sketch shrinks or scrolls inside the panel; the schematic note is hidden while the guide is open. Ordinary Golvklart stays full width.
