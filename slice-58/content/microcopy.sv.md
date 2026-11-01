# Slice 58 — mikrotext (sv)

**Status:** LÅST 2026-11-01 (A1 B1 C1 D1 E1 F1).

Befintliga Slice 57-strängar (`stationLayout*`, `stationSketchCaption`) behålls. Hinten får en mening till.

| Nyckel (`UI.`) | Text | Var |
|---|---|---|
| `stationLayoutHint` (ändrad) | Dra redskapen dit de ska stå. Ansats till vänster, landning till höger. Stapla med Höjd. | Under rubriken i skissbladet |
| `stationLayoutRaise` | Höjd + | Knapp, valt redskap (aria: «Lägg {redskap} högre») |
| `stationLayoutLower` | Höjd − | Knapp, valt redskap (aria: «Lägg {redskap} lägre») |
| `stationLayoutLayer` | Lager {n} | Bredvid höjdknapparna när n > 0 |
| `stationLayoutWider` | Bredare yta | Knapp, gör skissytan bredare |
| `stationLayoutTaller` | Högre yta | Knapp, gör skissytan högre |
| `stationLayoutSurfaceReset` | Standardyta | Bara när ytan är ändrad |

Regler: «redskap», inte «utrustning». «Höjd» betyder stapling uppåt, aldrig djup. Ingen text om 3D. Ledaren ser ingen ny text.
