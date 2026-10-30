# Slice 54 — HANDOFF (LÅST, breddad)

**Status:** LÅST A1–F1 + breddning 2026-10-30. Levererad i PR #59 (e911064). Bas main @ 03c0864.

Gränser: rör inte `app/`. Ingen SQL mot det riktiga projektet, inga anrop till live-värden (netlog ska visa 0). Inga nycklar i repot eller i incheckade loggar. Inget push till main, ingen force-push, ingen `--no-verify`. Kör allt via `verifier/tools/run-smokes.sh` mot lokal stand-in. `SLICE_NUMBER` stannar på `'53'`.

## 0. Bekräfta orsaken
Kör Doctor på 03c0864 (bygger main-cachen). Spara hela loggen för s33, s34, s35, s36, s38, s39, s40, s41, s47 i `verifier/slice-54-checks/before/<skript>.txt`. Stämmer en orsak inte med README-tabellen: skriv den verkliga orsaken i ship notes innan du rättar.

## 1. Startvägen (A1)
Importera från `verifier/tools/smoke-start.mjs` och byt:
- s33 rad 176 (`startTomt`), rad 865 (`startMall`)
- s34 rad 155–160, s38 rad 117–121, s40 rad 71–75 (`startFragor` med samma ålder, fokus och hall som i dag)
- s36 rad 311, 387, 401, 410, 438, 449, 459 (`openMallList`)
- s39 rad 124, 131, 201, 298, 305 (`startTomt`); rad 140, 150, 166, 172, 259, 314 (`openMallList`)
- s40 rad 168 (`openMallList`), s41 rad 122 (`startTomt`), s35 fas E (`startFragor`)

Ändra inga förväntade värden i AC-kontrollerna.

## 2. Sidfot (B1)
- s33 rad 1024–1027, s34 rad 188, s35 rad 229, s36 rad 467–468: hoppa över `footerSliceLabel` i verbatim-listan; kontrollera i stället `` meta.includes('`Träningsplaneraren · Slice ${SLICE_NUMBER}`') `` och att `export const SLICE_NUMBER = '` finns.
- s35 rad 79–80, s40 rad 195, s41 rad 149, s47 rad 448: nummer från `sliceNumber(ROOT)` (`smoke-login.mjs` rad 11).

## 3. s35 sidfoten (C1)
- `order()`: läs länkar/knappar i `.app-footer-row` i ordning. AC1a: `[S.link, 'Visa tips igen'?, 'Uppdatera appen']` enligt raden på startsidan; skriv den faktiska ordningen i ship notes.
- A, B, D: byt `footer.app-footer p` mot `.footer-feedback-hint`.
- AC11a: `.footer-feedback-hint` count 0 före tryck. AC9-local: count 1 efter tryck.

## 4. s36 inloggning (D1)
Byt hjälparen rad 120–137 mot `codeLogin(page, email, S32)` från `smoke-login.mjs`.

## 5. s40 och s47 (E1)
- s40 rad 101–104: läs `verifier/slice-40-golden-main-45cce9b.json`, kontrollera att de fem punkterna i `forening-bla` staplar. Ta bort bygget/öppnandet av main för AC8-main.
- s47 rad 129 och 174: `p.getByRole('button', { name: 'Hallöversikt' })` i Passbyggarens rubrik. `menu()` oförändrad.

## 6. Veckorapporten och kartan (F1)
- `weekly.sh`: lägg till `cnt()` före `{` på rad 17 och använd den i de tre kolumnerna på rad 23.
- `smoke-map.json`: de nio skripten `"baseline": "ok"`, `note` tas bort.
- Resultatfiler som skripten skriver (`slice-3x-…-results.json` m.fl.) återställs före commit.

## 7. Levande docs
- `verifier/README.md`: en rad om att alla skript i kartan är `ok`.
- `backlog/IMPROVEMENTS.md`: post «Smoke-resterna» → Slice 54.
- Ship notes: `SLICE54-SHIPPED.md` i samma form som `SLICE52-SHIPPED.md`.

## 8. Breddning (2026-10-30)
- s33: skriv om admin-kontroller till AdminArea (Slice 47): AC4b-local, S32-AC29a/c/d/f, AC31, AC33, AC34, AC35.
- s33 AC21c: tillåt GET mot `club_templates` (utöver `exercises`, `redskap`).
- s40 AC1-main/AC2-main: läs `GOLDEN[hall]` som AC8-main.
- s36: utred kvarvarande fel; fixa i skriptet, inte i appen. Utfall: kaskadfel, inget appfel.
