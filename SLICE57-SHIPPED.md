# Slice 57 — Redigerbar 2,5D-stationsskiss (A2 B1 C1 D1 E1 F1)

Beslut: /workspace/gp-s57d/slice-57/decisions (låsta: «Ja, lås A2 B1 C1 D1 E1 F1. OK över +512 B. SQL före merge. 3D senare.»)

**Merga inte förrän SQL är inklistrad.** Christoffer klistrar in `slice-57/content/schema-57.sql` (kolumnen `exercises.default_station_layout`) före merge/deploy.
Appen har en fallback-fetch: om bankhämtningen felar på kolumnen hämtas igen utan den. Admin-listan (ADMIN_COLUMNS) kräver kolumnen, så SQL först.

- A2: eget blad `StationLayoutSheet` («Ställ upp stationen» efter Välj redskap, Teknik) i AdminBankForm + OwnActivityForm. StationComposeSheet-props oförändrade.
- B1: SVG 2,5D (z → y −20·z, skala 1−0,15·z), drag med pekare, piltangenter 0,02, Vrid +90°.
- C1: syncLayout behåller poser per redskap, nya läggs till höger.
- D1: `StationLayout {v:1,poses}` i `default_station_layout` (jsonb), sanerad vid läsning; delad egen aktivitet bär layout.
- E1: layout används bara när stationens redskap matchar receptet (`layoutForStation`), annars rad som förut.
- F1: utskrift + detalj ritar layouten; utan layout pixel-lik main (golden-test mot fixture).
- Inte rört: Hallöversikt/Redigera redskap, EQUIPMENT_PIECES, Planera pass/förslag, ingen WebGL/three.
- Mikrocopy från Docs-filen (hint/empty skiljer sig från briefens formulering — Docs-texten vald).
- export_bank_seed.ts orörd (seeds har inga layouter; kolumnen default null).

Resultat: bun test 296/0, tsc ren, lint bara varningar (samma som main + fixture-kopia), build 0.
Bundle gzip: 218195 vs main 215573 = **+2622 B** (index +2326, css +64, AdminBankForm +145, bankWrite +47, övriga ±).
