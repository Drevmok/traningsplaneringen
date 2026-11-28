# Slice 69 — mikrotext (sv)

**Status:** **FÖRESLAGEN** (A1 B1 C1 D1 E1 F1).

Låsta termer orörda (Kör passet, Hallöversikt, Golvklart, Passbyggaren, Redigera redskap, Förrådslista). Återanvänd `UI.buildHallUnplaced` («Saknar plats») — ingen ny saknas-rad.

Ingen synlig bildtext typ «Du är här» (D1: inget extra stift eller extra rubrik).

## Ny `UI.`-nyckel (förslag, kort)

| Nyckel | Text | Var |
|---|---|---|
| `runHallMiniAria` | Aktuell station i hallen | `aria-label` på minikartan när `selectedItemId` är satt. När kartan visas utan markering räcker «Saknar plats» + `UI.hallOverview` |

Om bunten blir tight: släpp nyckeln och använd `UI.hallOverview` i båda lägena (F1-bantning).
