# Slice 68 — Föreningens redskap

**App:** Träningsplaneraren
**Status:** **LÅST** 25 nov 2026 13:42 («Ja, lås A1 B1 C1 D2 E1 F1»). Bas: main @ `0f3be79` (Slice 67 live, PR #75; footer «Slice 66», för 67 rörde inte appen). Gren: `slice-68-docs`.
**Uppdrag:** Backlog S9 «Föreningens redskap». Godkänd av Christoffer 25 nov 2026 11:44 (Europe/Stockholm), via PO. Inte S4, S5, S7 eller S8.
**Effort:** **M**. Håll slicen liten. SQL bara som fil, aldrig körd här. Inte en andra redskapskatalog, inte hall-CAD, ett märke per station.

## Varför

En ny ledare ska på stationsbygget se om föreningen saknar ett redskap — inte upptäcka luckan först på golvet.

## Kod i dag (main @ `0f3be79`, läst — ingenting byggt)

- `EQUIPMENT_PIECES` är 15 fasta delar (10 från Slice 13, +5 i Slice 30). Står kvar.
- `lib/ownedEquipment.ts` togs bort i Slice 47 (B1) tillsammans med «Vad finns i hallen ikväll?» och filtret «Visa bara övningar vi kan köra ikväll». Kvar är `ownedEquipment.test.ts` (bara att biblioteket har 15 delar) och ev. olästa nycklar i localStorage (`gymnastics-planner-owned-equipment-v1`, `-seen-v1`, `gymnastics-planner-library-tonight-v1`). Återanvänd eller migrera inte dem: den gamla listan var enhetens «ikväll», inte föreningens.
- `club_templates` / `clubStore` håller publicerade föreningsmallar (titel, minuter, SharePass-payload). Ingen föreningsprofil, ingen redskapskolumn. Att lägga inventariet i en mall-payload är fel kornstorlek (skrivs över vid publicering; tom mallista ger ingen lista).
- `public.redskap` är katalogen (samma 15), inte vad föreningen har.
- `eligibleSuggestedStationEquipmentItems` och `placedTeknikMissingSavedEquipment` (bannern «N stationer saknar redskap») betyder att stationen saknar *sparad* redskapslista. Inte föreningens lucka. Överlagra inte.
- `variantLinks` är Lättare/Svårare, inte redskapsbyte. En lättare variant behöver ofta samma redskap. Ingen substitutkarta finns.
- `StationComposeSheet` visar alla 15 utan markering. «Bygg hallen» och `PassPrint` använder `equipmentLine` från stationens slots, utan föreningsjämförelse. Förrådslista är fortfarande en platt summering av sparade slots för hela passet.

## Scope (★)

- Föreningens tillgängliga redskap ur de 15 fasta delarna (finns/saknas, inte antal).
- Stationsbygget visar tydligt vad som saknas: Redigera redskap, Bygg hallen, utskriftens sektion «Bygg hallen».
- Admin fyller i listan. `SLICE_NUMBER = '68'`.

## Ej scope (står tills Christoffer säger annat i A–F)

- Återuppliva inte «Vad finns i hallen ikväll?» eller filtret «Visa bara övningar vi kan köra ikväll» (borttaget i Slice 47, B1).
- Lyft inte den parkerade egna redskapskatalogen. `EQUIPMENT_PIECES` (15 delar) står kvar.
- Ett märke per station. Inte hall-CAD. Inte den parkerade Förrådslista-stationsuppdelningen.
- Inte S4, S5, S7 eller S8.

## A–F (★ = Docs förslag; låses av Christoffer)

### A. Lagring
- **A1 ★** Ny tabell `public.club_equipment` i samma Supabase-projekt som `club_templates`. En rad (`id = 'club'`), `piece_ids` jsonb-array med id från `EQUIPMENT_PIECES` som föreningen har. Anon läser, admin skriver, ingen `DELETE`. Cache på enheten under en *ny* nyckel. Saknas rad (inte ifylld) = alla 15 tillgängliga, så inga falska «saknas» innan någon fyllt i. SQL i `sql/`, körs inte av agenter; Christoffer klistrar in **efter merge**, bara efter sitt **separata** ja.
- A2 Bara localStorage (ny nyckel). Ingen SQL. Listan följer inte föreningen: en ny ledare på en annan telefon ser den inte. Svagare mot S9.
- A3 Gömma listan i en `club_templates`-payload eller en fejkad mall. Fel kornstorlek. Avråds.

### B. Vem ställer in
- **B1 ★** Bara admin, kort sektion «Föreningens redskap» i befintlig Admin (intill Föreningens mallar). Kryssa de 15. Tränare redigerar inte. Inte i Förrådslista.
- B2 Valfri tränare kryssar på enheten. Upprepar Slice 47. Avråds.
- B3 Ingen yta, bara SQL. För dolt. Avråds.

### C. Var visas saknas
- **C1 ★** I Redigera redskap: märk valda redskap (och ev. rutnätsknappen) som föreningen inte har. I Bygg hallen-steget och i `PassPrint`-sektionen «Bygg hallen»: raden «Föreningen saknar: {etiketter}» under stationens redskap när minst en slot saknas. Ett märke per station. Förrådslista oförändrad (platt lista). Biblioteket filtreras inte. Befintlig banner «N stationer saknar redskap» orörd.
- C2 Bara i Redigera redskap. Mindre, men luckan syns inte i hallguiden eller på papperet.
- C3 Även ny banner på Hallöversikt eller flaggor i Förrådslista. För brett, liknar det som togs bort. Avråds.

### D. Alternativ
- **D2 ★** Bara «Föreningen saknar …» i den här slicen. Lättare/Svårare är ofta samma redskap, och det finns ingen karta trampett→satsbräda. Alternativ blir trovärdigare när listan och markeringarna finns.
- D1 Om övningen har en Lättare- eller Svårare-variant vars `defaultStationEquipment` ryms i föreningens lista: en rad «Förslag: {titel}» som byter med befintlig `swapSessionActivity`. Ingen påhittad redskapsersättning. Större bundle; förslaget kan kännas snett.
- D3 Egen substitutkarta mellan redskap. Finns inte. Avråds.

### E. Bundle, footer, SQL
- **E1 ★** Inom +512 B gzip mot main `0f3be79` (`build-dists.sh`, `gzip -9`, js+css TOTAL). `SLICE_NUMBER = '68'`. Footer 66→68 samma längd. Uppskattad tillägg *före* bantning **+0,50–0,90 kB** gzip (hämtning + cache, adminlista, markering på tre ytor, några `UI.`-strängar). Slice 65 slutade på +511/512; Slice 66 landade −22 B och åt upp dåvarande bantningskandidater. Banta minst lika mycket som slicen lägger till (död CSS, oanvända strängar, kort ny copy). Går det ändå över: korta ny copy/CSS först, därefter släpp utskriftsraden (behåll Redigera redskap och Bygg hallen), och rapportera — inget undantag utan Christoffers ja. SQL påverkar inte bundlen.
- E2 Höj det stående +512 B-taket. Kräver Christoffers ja. Inte förstaval.
- E3 Undantag bara för Slice 68. Avråds om E1 räcker.

### F. Tester
- **F1 ★** Enhetstester för hjälpen: inte ifylld → inga saknade; kända id; okända id slängs; tom lista är giltig (allt saknas); slots som föreningen saknar ger rätt etiketter. `PassPrint` / Bygg hallen visar raden bara när något saknas. Befintliga tester gröna. `pick-smokes 0f3be79 <head>` styr — troligen hela loopen (`blockMeta.ts`, ev. `App.css`). Coach-GET-smokes (s31/s33/s36: `exercises`, `redskap`, `club_templates`) måste tillåta en fjärde GET `club_equipment` (publishable key, ingen `Authorization`), samma mönster som när Slice 36 lade till `club_templates`. Stand-in behöver tabellen. SQL-smoke `sql/68-02-smoke.sql` körs inte mot live. `SLICE68-SHIPPED.md`.
- F2 Ny egen UI-smoke. Onödigt om befintliga utökas.
- F3 Bara checklistan. Avråds.

Låssträng, om ★ antas: «Ja, lås A1 B1 C1 D2 E1 F1».

Öppna frågor:

1. **Lagring:** A1 (SQL, delas i föreningen, ★) eller A2 (bara på enheten, ingen SQL)?
2. **Alternativ:** D2 (bara saknas, ★) eller D1 (även «Förslag» via Lättare/Svårare)?
