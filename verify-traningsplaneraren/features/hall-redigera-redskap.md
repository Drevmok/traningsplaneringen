# Hallöversikt + Redigera redskap

**What:** Place Teknik stations on hall; compose equipment via **Redigera redskap** only (hall detail entry).

**Reach:** Pass with Teknik items → Hallöversikt → marker → Redigera redskap.

**Drive:**
1. Place or select a Teknik station marker.  
2. Open **Redigera redskap**; change recipe; exercise **Klar** (save) and dirty **Stäng** paths per current slice locks (in-sheet confirm, no `window.confirm`).  
3. Edit canvas: remove control ≥44×44; ett tryck öppnar detaljvyn, en dragning flyttar (one tap opens detail, a drag moves the marker; Slice 48 C1 pointer drag, 6 px threshold, Esc cancels; drag to the tray unplaces); no remove on Golvklart.  
4. Selective förslag / Använd alla förslag when those slices are in build.

**Prove:** Composition saves only via Klar; dirty Stäng matches locked copy; canvas remove edit-only; standing locks intact (Teknik-only placements; no Passbyggaren compose entry; fixed library).

**Slice 48 — station order (edit mode):**
1. Hallöversikt → **Ändra stationer** opens the station list (handle, rank number, name, ↑ ↓, **Ta bort**); **Klar** (or Esc) closes it and returns focus to «Ändra stationer».
2. Reorder by handle drag (touch: only the handle drags, the rest of the row scrolls; mouse on desktop the same) and by ↑ ↓; a drop line shows the target. Markers keep their positions; numbers on markers, Golvklart and Passbyggaren's Teknik block follow the new order.
3. **Ta bort** removes the station from the pass and hall; «Borttagen · Ångra» shows ~5 s; Ångra restores item, order and placement exactly. A new edit or a marker drag ends the toast.
4. **Lägg till station** opens «Lägg till övning» filtered to Teknik (filter locked); choosing closes the sheet, the new station is last and placed on a free spot without moving others.
5. Outside edit mode «Ta bort från hall» (chip ×) lifts the marker only.
**Prove:** no placement lost across reorder/add/remove/undo/reload, including old Blå/Vit passes made on main with hand placements.

**Slice 49:** one «Använd alla förslag» in the toolbar, only when ≥1 station has an unsaved förslag; the saknar row has no button; no «Inga förslag att spara». After Planera pass: no saknar row and no button.

**Stabila väljare** (Slice 50; roll + synlig svensk etikett först, sedan aria/id/klass som smokes redan använder; inga `data-testid`)

| Vad | Väljare | Källa |
|---|---|---|
| Hallöversikt | `.hall-board` | `App.css`, `components/HallBoard.tsx` |
| Hallytan | `.hall-canvas` | `App.css`, `components/HallBoard.tsx` |
| Redskapschip | `.hall-chip--canvas` | `App.css` |
| Saknas-banner | `.hall-saknar-banner` | `App.css`, `components/HallBoard.tsx` |
| Knapp «Redigera redskap» | `role=button «Redigera redskap»` | `components/ActivityDetail.tsx`, `data/blockMeta.ts` |
| Passinfo i hallen | `.hall-session-meta` | `App.css`, `components/HallBoard.tsx` |

**Slice 56:** Lägg till i Teknik (Biblioteket eller «Lägg till station») kör `applyAllSuggestedStationEquipment` på hela passet → ingen saknar-rad för nya stationen; rensad `[]` och egen lista står kvar. Tillägg i andra block ändrar inga redskap. Starta från mall utan tillägg: saknar-raden syns som förut.

**Slice 57:** Oförändrad. **Ingen** knapp «Ställ upp stationen», inget skissblad här. Ändrar ledaren redskap för passet ritas heuristiken (E1); «Använd förslag» → receptets layout igen.
