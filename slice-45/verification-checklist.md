# Slice 45 — Verification checklist

**Status:** PROPOSED — written against ★ A1 B1 C1 D1 E1 F1; re-check after lock.  
**Viewport:** 390×844 portrait, DPR 2, touch, clean site data unless noted. Baseline: `evidence/measurements-390x844.txt` (main @ 0d88da5).

| # | Check |
|---|---|
| AC1 | Planera pass → Q3 is titled «Hall» and shows exactly two chips: «Gymmix – Stora hallen», «Gymmix – Grophallen» (en dash) |
| AC2 | Q2 (Fokus) and Q3 show no «Stationerna är förslag…» line and no «Välj den layout…» line; Tillbaka / Nästa / Skapa pass work as before |
| AC3 | Pass made with Grophallen: Hallöversikt shows the Grophallen drawing and «Gymmix – Grophallen» in the meta line; Golvklart meta shows the same name |
| AC4 | Tomt pass and Från mall → Nybörjare: hall is «Gymmix – Stora hallen»; Teknik markers auto-placed on the fixed grid in pass order |
| AC5 | Hallöversikt has no «Hallayout» label and no layout select; zoom − / + still there and ≥ 44×44; hall canvas top ≤ 310 (not lower than main) |
| AC6 | Under the hall only: «Schematisk hall — inte exakt mått» and (until dismissed) the flow tip about the numbers. No migrate note, no Blå/Vit tip, no «Tips om placering», no multi-line hints |
| AC7 | Expanded tray: no drag/snap hint lines and no «Stationerna föreslås i zonen…» tip; tray collapse/expand, Placera här, drag and remove work as Slice 20/21/40 |
| AC8 | Legacy draft: inject a draft with `hallTemplateId: 'standard-trupp'` and placements with zone `trampett`; reload → pass opens, hall «Gymmix – Stora hallen», markers on the open grid in pass order, nothing on walls; draft now stores `forening-bla` |
| AC9 | Same for `tavling-linjer`, `liten-hall`, `generic-trupp`, and a draft with no `hallTemplateId` |
| AC10 | Old `#dela=` link made on main with Standard trupp: Delat pass view shows Stora hallen with markers; «Spara på den här enheten» stores `forening-bla` |
| AC11 | A Mina mall and a föreningens mall saved with a generic hall: Använd mall gives a Stora hallen pass with markers (no SQL, no Supabase change) |
| AC12 | Passes already on Blå/Vit (`forening-bla` / `forening-vit`) keep their exact placements after reload (ids unchanged) |
| AC13 | Rensa passet: dialog is a bottom sheet as tall as its content (≤ 260 px at 390×844), Avbryt and Rensa side by side, both ≥ 44 px; text unchanged; Rensa clears, Avbryt and backdrop tap keep the pass |
| AC14 | Same compact sheet for «Ersätta utkastet här?», Ny vecka confirm, mall confirm, admin Dölj confirm; tall sheets (Förrådslista, övningsdetalj, Dela, wizard) unchanged |
| AC15 | Landscape 844×390 and desktop 1280×800: Hallöversikt and dialogs usable; no regression vs main beyond the removed items |
| AC16 | Print «Skriv ut passet» (Slice 44) and Golvklart show the Gymmix halls with their drawing ratios |
| AC17 | No new strings beyond `content/microcopy.sv.md`; locked terms as on main; `rg` finds no `standard-trupp` / `tavling-linjer` / `liten-hall` outside the legacy alias and tests |
| AC18 | Bundle ≤ +512 B gz (expected shrink), numbers in PR; `npx tsc -b`, `bun test src`, `npm run lint`, `npm run build` green; footer «Träningsplaneraren · Slice 45»; asserts `feedback.test.ts:25/45/46`, `clubTemplates.test.ts:316` |
