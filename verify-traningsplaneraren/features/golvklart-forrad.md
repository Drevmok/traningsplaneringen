# Golvklart + Förrådslista

**What:** Floor-ready view for the group; aggregate equipment list for the pass.

**Reach:** From home/hall flows that expose **Golvklart** and **Förrådslista** (requires pass content / hall as gated by Kom igång).

**Drive:**
1. Open Golvklart — short station titles if Slice 17+; redskap under stations if Slice 14+.  
2. Confirm schematic caption unchanged (Schematisk hall — inte exakt mått or locked equivalent).  
3. Open Förrådslista — flat aggregate; no remove controls meant only for edit canvas.

**Prove:** Coach-readable floor view; lists match **saved** composition; no edit-only chrome on floor; caption lock held.

**Slice 47 (B1):** Förrådslista no longer has «Vad finns i hallen ikväll?»; `ownedEquipment.ts` and its keys (`gymnastics-planner-owned-equipment-v1`, `…-seen-v1`, `gymnastics-planner-library-tonight-v1`) are no longer read. Prove: with an old owned list in localStorage (nothing ticked, ikväll on) Biblioteket shows the same number of exercises as a clean profile; the rest of Förrådslista matches main. Golvklart, Kör passet and Skriv ut passet show own exercises.

**Slice 48:** station numbers on Golvklart (and Förrådslista where it shows stations) follow the Teknik order set in Ändra stationer. Golvklart has no edit mode (no «Ändra stationer», no list, no ↑↓/Ta bort). Exit via «Avsluta golvklart».

**Slice 49:** Förrådslista is filled straight after Planera pass (no empty state).

**Stabila väljare** (Slice 50; roll + synlig svensk etikett först, sedan aria/id/klass som smokes redan använder; inga `data-testid`)

| Vad | Väljare | Källa |
|---|---|---|
| Knapp «Golvklart» | `role=button «Golvklart»` | `App.css`, `App.tsx` |
| Förrådslista | `text «Förrådslista»` | `App.css`, `components/ForradslistaSheet.tsx` |
| Exportarket | `.export-sheet` | `App.css`, `components/ExportSheet.tsx` |
| Stäng export | `.export-sheet .modal-close` | `App.css`, `components/ActivityDetail.tsx` |
| Dialog | `.modal-backdrop[role=dialog]` | `App.css`, `components/ActivityDetail.tsx` |

**Slice 56:** Lägg till i Teknik (Biblioteket eller «Lägg till station») kör `applyAllSuggestedStationEquipment` på hela passet → ingen saknar-rad för nya stationen; rensad `[]` och egen lista står kvar. Tillägg i andra block ändrar inga redskap. Starta från mall utan tillägg: saknar-raden syns som förut.

**Slice 64 (B1):** the redskap lines under the markör on Golvklart and print also show a type icon (`VisualIcon size="gear"`, `EQUIPMENT_ICON`) before the text. Same rule as Slice 14 (only a set `stationEquipment`); never in the edit canvas, tray or Redigera redskap.

**Slice 65 (A1 B1 C1 D1):** Golvklart has «Bygg hallen» (aria «Bygg hallen, station för station»). It opens a step panel (`section.hall-station-list`) under the floor map: «Station n av N» or «Saknar plats», the title, `StationSketch` when there are slots, a redskap line, a «Byggd» checkbox (memory only, cleared on «Avsluta Bygg hallen»), and Föregående / Nästa. Order is `hallSetupSteps` (`lib/hallSetup.ts`): placed Teknik by `stationRanks`, then unplaced ones. The current marker gets `.is-selected`; no new marker. Edit mode has no button. Skriv ut passet adds `.pass-sheet-build` («Bygg hallen», ☐ per station, sketch, redskap). Golvklart stays the view for the group.

**Slice 66 (A1 C1):** in short landscape (`max-height: 500px`) the Bygg hallen panel stands beside the map while the guide is open (`:has(.hall-station-list)`), and the print section writes unplaced stations as «☐ Titel — Saknar plats».
