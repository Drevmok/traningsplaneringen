# Slice 68 — mikrotext (sv)

**Status:** **FÖRESLAGEN** (A1 B1 C1 D2 E1 F1).

Låsta termer orörda (Redigera redskap, Passbyggaren, Hallöversikt, Golvklart, Förrådslista, Starta från mall, Kom igång, Föreningens mallar, Bygg hallen, Biblioteket, Admin, Skriv ut passet). «redskap», inte «utrustning». Inte Slice 47-formuleringarna «Vad finns i hallen ikväll?» eller «Visa bara övningar vi kan köra ikväll».

Befintlig banner `hallSaknarRedskapBanner` / `hallSaknarRedskapBannerOne` («N stationer saknar redskap») betyder osparad redskapslista och återanvänds inte här.

## Nya `UI.`-nycklar (förslag, korta)

| Nyckel | Text | Var |
|---|---|---|
| `clubEquipmentTitle` | Föreningens redskap | Admin-sektion |
| `clubEquipmentHint` | Kryssa för det ni har. Stationsbygget visar sedan vad som saknas. Inte ifyllt än räknas alla 15 som tillgängliga. | Under rubriken, Admin |
| `clubEquipmentSave` | Spara redskap | Admin, primär knapp (använd befintlig Spara om den redan passar) |
| `clubMissingLine` | Föreningen saknar: {labels} | Redigera redskap, Bygg hallen, utskriftens «Bygg hallen». `{labels}` = etiketter i biblioteksordning, avgränsade med «, » |
| `clubMissingAria` | Föreningen saknar {label} | Aria på märkt rad/knapp i Redigera redskap |

Inga nya strängar i Förrådslista eller i Biblioteket. Ingen «Förslag:»-rad vid D2.

Toasts för sparning återanvänder befintliga club-/admin-toasts om de passar (`clubOffline`, `clubWriteFailed` eller motsvarande Spara-toast). Annars en kort «Sparad.» — ingen ny utropstext.
