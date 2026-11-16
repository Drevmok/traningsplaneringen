# Slice 63 — Ny vecka: «Gör Teknik ett steg svårare» (A1 B1 C1 D1 E1 F1)

Beslut: [`slice-63/decisions.md`](slice-63/decisions.md) (Docs `slice-63-docs` @ `fb4598f`, låst av Christoffer 2026-11-16 07:16: «Ja, lås A1 B1 C1 D1 E1 F1»). Bas main @ `2917296`. Kod-commit `339ae6a`; head-SHA står i PR:en.

**Merga inte** — väntar på verifiering och Christoffers OK. **Ingen SQL** i slicen; ingen körd.

## Vad
- **D1:** `lib/variantLinks.ts` får `teknikItemsWithHarder` (Teknik-block, blockordning sedan `item.order`, bara där `harderOf` ger annat id) och `stepTeknikHarder` (ett steg per träff via `swapSessionActivity`; `item.id`, minuter, anteckning, ordning, `stationEquipment` och hallmärken kvar). `harderOf` och `swapSessionActivity` återanvänds oförändrade; `replaceItemActivity` används inte. Inget i `session.ts`.
- **A1:** efter Ny vecka → «Skapa kopia» visar Passbyggaren `UI.stepTeknikHarder` «Gör Teknik ett steg svårare» (`btn-secondary` under «Passbyggaren») på just den kopian, bara när minst en Teknik-rad har svårare mål. Flaggan är kopians `session.id` (överlever builderns remount, t.ex. Hallöversikt och tillbaka). Döljs efter tryck och när passet byts. Ingen ny CSS.
- **B1:** toast «Teknik är ett steg svårare.» · «Ångra» (Slice 41-mönstret, `armUndo`). Ångra lägger tillbaka kopian före steget och visar raden igen. Annan ändring avslutar ångra. `startNewWeek` och arkivet (förra veckans pass) är orörda och ostegade.
- **C1:** Kör passet, Skriv ut passet och Ny vecka-bekräftelsen orörda.
- **E1:** `SLICE_NUMBER = '63'`, nycklar `stepTeknikHarder`, `stepTeknikHarderDone`.

## Resultat
- `bun test src`: **338/0** (main 335/0; +3 i `lib/variantLinks.test.ts`; `weekCopy.test.ts` orörd och grön). Footer-litteraler 62→63.
- `npm run build` exit 0. `npm run lint` exit 0, 8 varningar (samma som main).
- Bundle (assets js+css, gzip -9): main **220602** → gren **220908** = **+306 B** gzip (budget +512 B). Raw 794549 → 795350 = +801 B.

## Doctor och smokes
Doctor **PASS** (main-cache 2917296 byggd). `pick-smokes 2917296 HEAD` → **hela loopen** (`app/src/data/blockMeta.ts` är delad kärna). 22 skript mot main-baseline: **22/22 SAMMA, inga NY FAIL**. Netlog 3967 anrop, **0 till live-projektet**. (slice-33 körs inte av pick-smokes; bara main-baslinjen.)

## UI-väg (Builder, lokal preview, 390×844 och 844×390)
18/18 PASS: ingen rad före Ny vecka; raden efter «Skapa kopia» med oförändrade övningar; tryck → Hjul, Formhopp över block, Bro orörd, samma minuter, raden borta; toast med Ångra → tillbaka och raden igen; Kör passet utan nya kontroller; Ny vecka från Hjul/Formhopp/Bro → ingen rad; Ljushopp i rockringar → satsbräda (ett steg); footer «Slice 63»; 0 anrop till live-värden.
