# Slice 57 — Redigerbar 2,5D-stationsskiss (A2 B1 C1 D1 E1 F1)

Beslut: [`slice-57/decisions.md`](https://github.com/Drevmok/traningsplaneringen/blob/658265e/slice-57/decisions.md) (Docs `slice-57-docs` @ `658265e`) (låsta: «Ja, lås A2 B1 C1 D1 E1 F1. OK över +512 B. SQL före merge. 3D senare.»)

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

## Doctor
`verifier/tools/doctor.sh`: **PASS** (main-cache 9a452c7 byggd, baseline 48 rader). Tidigare häng: föräldralösa serve-dist höll flock — dödade, omkörd.

## Smokes (pick-smokes, mot main-baseline)
| Smoke | Resultat |
|---|---|
| slice-48-builder | 80/80 (SAMMA) |
| slice-49-builder | 34/34 (footer-förväntan 56→57, legitim) |
| slice-52-admin-import | 6/0 (SAMMA) |
| slice-55-builder | 25/25 (footer 56→57) |
| slice-56-builder | 18/18 (footer 56→57) |

Netlog: 0 anrop till live-projektet. Verktygsfix: `run-smokes.sh` exporterade inte `S56_BR`/`S57_BR`, så s56 träffade en gammal server på :4856 — lagt till 56 57 i loopen.

## AC (390×844; AC15 även 844×390; fake bank, 0 live-anrop)
| AC | Status | Not |
|---|---|---|
| 1 | PASS | Compose-bladet utan skissyta; nytt blad «Så ska stationen stå» |
| 1b | PASS | Admin Ny egen övning → Teknik, pilar+R, sparad rad har layout. OwnActivityForm-redigering: unit |
| 2 | PASS | Drag + Vrid, spara, ladda om → identisk transform (rotate(90)) |
| 3 | PASS | Ny icke-admin-profil ser layouten. Riktig fler-enhetssynk ej körd |
| 4 | PASS | 2 poser, ingen ansatstext |
| 5 | PASS | SVG identisk med main (3063 tecken) |
| 6 | PASS | 2 skisser i utskrift bär layouten |
| 7 | PASS | |
| 8 | PASS | 1→3 ger 4 poser, 3→2 ger 3 |
| 9 | PASS | |
| 10 | PASS | |
| 11 | Unit | E1-matchning täckt av unit-tester; kräver riktig bankdata att köra |
| 12 | PASS* | Ingen service worker: simulerat genom att avbryta alla supabase-anrop och ladda om; layout från cache |
| 13 | PASS | |
| 14 | PASS | 400 på kolumnen → omförsök utan → heuristik |
| 15 | PASS | 844×390: Klar i viewport, scrollWidth 844 |
| 16 | PASS | Footer «Slice 57» i Passbyggaren |
| 17 | PASS | build/lint/test gröna; check-selectors 66 OK |
| 18 | PASS | ingen three/WebGL i package.json |
