# Slice 57 — mikrotext (sv)

**Status:** LÅST 2026-10-31 (A2: eget skissblad).

Få nya strängar. Befintliga behålls: `stationSketchCaption` «Skiss — så kan stationen stå.», `stationSketchApproach` (bara utan layout).

| Nyckel (`UI.`) | Text | Var |
|---|---|---|
| `stationLayoutOpen` | Ställ upp stationen | Knapp i «Ändra i banken» / Ny egen övning (Teknik), under redskapsraden; öppnar skissbladet |
| `stationLayoutTitle` | Så ska stationen stå | Rubrik i skissbladet |
| `stationLayoutDone` | Klar | Stänger skissbladet och behåller layouten i formuläret |
| `stationLayoutHint` | Dra redskapen dit de ska stå. Ansats till vänster, landning till höger. | Under rubriken |
| `stationLayoutRotate` | Vrid | Knapp på valt redskap (aria-label: «Vrid {redskap}») |
| `stationLayoutReset` | Ställ i rad igen | Återgår till appens förslag (tar bort sparad layout) |
| `stationLayoutEmpty` | Välj redskap först, sedan kan du ställa upp dem här. | När chip-listan är tom |

Regler: «redskap», inte «utrustning». Ingen text om 3D. Ledaren ser ingen ny text: samma bildtext som i dag, utan ansatsraden när layout finns (D1).
