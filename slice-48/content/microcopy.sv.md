# Slice 48 — microcopy (svenska): Hallöversikt

Status: **PROPOSED**. Ton enligt PROJECT.md: varm och kort, «du», inga utropstecken, inga tekniska ord.

## Nytt
| Nyckel | Text | Var |
|---|---|---|
| `hallStationsEdit` | Ändra stationer | Knapp i hallens rubrikrad |
| `hallStationsDone` | Klar | Samma knapp i läget |
| `hallStationsTitle` | Stationer i ordning | Rubrik på listan |
| `hallStationAdd` | Lägg till station | Sist i listan |
| `hallStationUp` | Flytta upp | aria-label på ↑ («Flytta upp: {title}») |
| `hallStationDown` | Flytta ner | aria-label på ↓ («Flytta ner: {title}») |
| `hallStationRemove` | Ta bort | Knapp på raden (aria «Ta bort {title} ur passet») |
| `hallStationMoved` | {title} är nu nummer {n}. | Skärmläsare (aria-live) efter flytt |
| `hallStationDragAria` | Dra för att byta ordning | aria-description på handtaget |

## Återanvänt (exakt som i appen)
Hallöversikt · Kör passet · Mer · Tillbaka till Passbyggaren · Lägg till övning · Lägg till i valt block · Lägg till och ändra tid · Borttagen · Ångra · Ångrat. · Ta bort från hall · Placera här · Golvklart · Förrådslista · Redigera redskap · Zooma in · Zooma ut

## Borttaget
«Hallöversikt» i «Mer»-panelen (samma text finns kvar i raden).

## Andra val kräver
- B2: ingen «Ändra stationer»/«Klar». Rubriken «Stationer i ordning» syns alltid.
- E2: «Ta bort» blir «Ta bort från hall» (finns redan), och aria «Ta bort {title} ur passet» utgår.

## Inte tillåtet
«Redigera stationer» (krockar med låsta «Redigera redskap»), «Drag & drop», «Sortera», «Spara», utropstecken, «Klicka».
