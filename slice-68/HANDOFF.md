# Slice 68 — HANDOFF till Builder (FÖRESLAGEN: A1 B1 C1 D2 E1 F1)

**Status:** **FÖRESLAGEN**. Builder bygger när PO skickat byggkortet efter lås (Docs pingar inte Bob). Bas main @ `0f3be79`, docs-gren `slice-68-docs`. **Ingen merge utan Christoffers OK.**
**SQL:** `slice-68/sql/68-01-club-equipment.sql` och `68-02-smoke.sql` (schema, inte data). Christoffer klistrar in **efter merge**, och bara efter sitt **separata** ja. **Builder kör varken SQL eller `push-promote --replace`.** Agenter kör aldrig filerna. Ta med dem oförändrade i bygg-PR; skriv inte om dem.
**Bundle:** inom +512 B gzip mot `0f3be79` (`verifier/tools/build-dists.sh`, `gzip -9`, js+css TOTAL). Uppskattning före bantning +0,50–0,90 kB. Banta minst lika mycket som slicen lägger till (E1). Går det över: korta ny copy/CSS först, därefter släpp utskriftsraden, rapportera — inget undantag utan Christoffers ja.
**Egen worktree från `0f3be79`.** Huvudklonen `/workspace/gymnastics-planner` lämnas som den är. Städa den inte, och kör inte Doctor eller smokes därifrån.
Ett märke per station. Inte hall-CAD. Inte S4, S5, S7, S8. Återuppliva inte «Vad finns i hallen ikväll?» / «Visa bara övningar vi kan köra ikväll». Lyft inte den parkerade egna katalogen; `EQUIPMENT_PIECES` (15) står kvar. Inte parkerad Förrådslista-stationsuppdelning.

## 1. Modell (A1)

Ny modul, t.ex. `app/src/lib/clubEquipment.ts` (inte ett återupplivat `ownedEquipment.ts`):

- Sanera `piece_ids`: bara kända `EQUIPMENT_PIECES`-id, unika, bibliotekets ordning.
- Tre tillstånd: *inte ifylld* (ingen rad / ingen cache) → behandla alla 15 som tillgängliga; *ifylld lista* (även tom) → jämför mot den; okända id slängs.
- `missingClubPieces(slots, set) → { pieceId, labelSv }[]` i biblioteksordning. Används av markering och av saknas-raden. Rör inte `placedTeknikMissingSavedEquipment` / `eligibleSuggestedStationEquipmentItems`.
- Cache under en *ny* nyckel, t.ex. `gymnastics-planner-club-equipment-v1`. Läs aldrig `gymnastics-planner-owned-equipment-v1`, `-seen-v1` eller `gymnastics-planner-library-tonight-v1`.
- Hämtning som `club_templates`: efter första render, bara när banken är på, publishable key på `apikey`, ingen `Authorization`, timeout som banken. `GET {url}/rest/v1/club_equipment?select=piece_ids,updated_at&id=eq.club`. 0 rader = inte ifylld. Stale cache får användas; utan cache = inte ifylld (inga falska saknas).

## 2. Admin (B1)

Kort sektion «Föreningens redskap» i befintlig Admin, intill Föreningens mallar (`ClubAdminSection` eller samma yta). Kryssrutor för de 15, finns/saknas, inte antal. Admin upsert:ar raden `id = 'club'`. Ingen `DELETE`. Tränare får ingen redigeringsyta. Inte i Förrådslista.

Mikrotext: `slice-68/content/microcopy.sv.md`. Låsta termer orörda. Inte formuleringarna från Slice 47.

## 3. Stationsbygget (C1, D2)

- `StationComposeSheet`: märk valda rader (och ev. rutnätsknapp) som saknas i föreningens lista. Inget filter, inget förbud att lägga till.
- Bygg hallen-panelen i `HallBoard` och sektionen `.pass-sheet-build` i `PassPrint`: under `equipmentLine`, visa `UI.clubMissingLine` («Föreningen saknar: {labels}») när minst en slot saknas. Annars ingen rad.
- Förrådslista, hallkarta, ett märke per station, `hallSetupSteps`-ordningen och bannern «N stationer saknar redskap» orörda.
- D2: ingen «Förslag:»-rad, ingen `swapSessionActivity` i den här slicen.

## 4. Footer och bantning (E1)

- `SLICE_NUMBER = '68'` (nu `'66'`).
- Kort ny CSS/copy. Leta död CSS och oanvända `UI.`-nycklar (samma grepp som Slice 66; de kandidaterna är redan bantade).
- Rapportera exakta gzip-byte mot `0f3be79` och vad som bantades.

## 5. Tester (`bun test src`)

- Ny testfil för hjälpen (F1 i README): inte ifylld, kända id, okända id, tom lista, saknade etiketter i biblioteksordning.
- `PassPrint`: saknas-rad bara när föreningens lista är ifylld och minst en slot saknas; annars oförändrad sektion.
- Befintliga `hallSetupSteps`-, `PassPrint`-, `clubTemplates`- och `ownedEquipment.test.ts` (bibliotek = 15) gröna.
- Coach-GET-smokes / asserts som räknar `exercises` + `redskap` + `club_templates` utökas med `club_equipment` (publishable key, ingen `Authorization`). Stand-in och ev. `verifier/slice-47-fake-supabase.mjs`-liknande mockar behöver tabellen (tomt svar = inte ifylld).
- Ingen ny egen smoke (F1). `pick-smokes 0f3be79 <head>` styr — troligen hela loopen.
- Feature-karta: en mening i `verify-traningsplaneraren/features/` som täcker Redigera redskap / Golvklart-Bygg hallen (saknas-rad, inget biblioteksfilter).
- `SLICE68-SHIPPED.md`: urval (A–F), bantning, bundle-byte, att ingen SQL körts av agenter, att körning väntar på hans ja efter merge, head-SHA.

## 6. Bygg och PR

- `npm run build`, `npm run lint`, `bun test src` gröna.
- Bundle gz mot main @ `0f3be79` i PR; gå inte över +512 B (E1).
- SQL-filerna följer med oförändrade. Gren `slice-68-code` från `0f3be79`, PR mot main med `SLICE68-SHIPPED.md`. Ingen merge. Head-SHA och bevis till PO, inte till Verifier direkt.

## Avvisat (byggs inte, om ★ låses)

A2, A3, B2, B3, C2, C3, D1, D3, E2, E3, F2 och F3.
