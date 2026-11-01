# Slice 58 — HANDOFF till Builder (LÅST: A1 B1 C1 D1 E1 F1)

**Status:** **LÅST** 2026-11-01 — «Ja, lås A1 B1 C1 D1 E1 F1» (Christoffer via PO). Se `decisions.md`. **Builder får bygga** när PO skickat byggkortet (Docs pingar inte Builder). Bas main @ `b610103`, docs-gren `slice-58-docs` (tips = denna låscommit). **Ingen merge utan Christoffers OK.**
**Bundle:** undantag över +512 B gzip godkänt — rapportera exakta byte mot main i PR.
Rör inte Hallöversikt, `EQUIPMENT_PIECES`, Planera pass, Redigera redskap eller heuristikgrenen i `StationSketch`. Ingen hall-CAD, ingen `three`/WebGL. Städning (Scout #2) och Admin-kö (Scout #3) ingår inte.
**SQL:** ingen. A1 + D1 ryms i befintlig jsonb och trigger. Valfria `content/schema-58.sql` hoppas över i detta lås och ska inte klistras in.

## 1. Typer och sanering (A1, D1)
- `types.ts:19–30`: `StationPose.y?: number` (0–1, saknas = 0). `StationLayout.surface?: { w: number; h: number }` (heltal 0–2). `v` stannar `1`.
- `data/stationLayout.ts`:
  - `sanitizeStationLayout` `:72–96`: läs `y` om det är ett ändligt tal → klämd 0–1, avrundad till närmaste 1/8; annars utelämna (inte NaN → undefined; saknad y är giltig). Läs `surface.w/h` → heltal klämt 0–2; ogiltigt → utelämna. Skriv **inte** ut `y: 0` eller `surface: {0,0}` — håll gamla layouter byte-identiska vid rundtur.
  - `syncLayout` `:99–118` och `defaultLayoutFrom` `:121–134`: nya poser utan `y`. `syncLayout` behåller `surface`.
  - Ny ren funktion `layoutBounds(layout): { x0; y0; w; h }` i viewBox-enheter: union av varje mark efter `poseTransform` (bredd `EQUIPMENT_ROW_WIDTH[kind]·scale`, markhöjd + lagerlyft), plus marginal 16, plus `surface` · steg (förslag: 80 bredd, 40 höjd per steg). Golv: aldrig mindre än dagens ytor (blad `0 60 640 130`, detalj `0 78 640 112`). Testbar utan DOM; yaw räknas som omslutande ruta.

## 2. Geometri (C1)
- `components/stationPose.ts`: `LAYER_PX` (förslag 6 = en landningsmatta), `poseTransform` drar av `8 · LAYER_PX · (y ?? 0)` från `cy`. Skala och x oförändrade.
- `sortedPoses` `:18–20`: sortera `(y ?? 0)` stigande, sedan `z` fallande, sedan index (stabil). Använd samma jämförare i bladets `order` `:86` (exportera `poseOrder`).

## 3. StationLayoutSheet (B1, D1)
- Knappar i `station-layout-actions` för valt redskap: «Höjd +», «Höjd −» (aria med redskapsnamn), disabled vid 8 resp. 0 lager. Text «Lager N» när N > 0.
- Tangenter på `<g>`: PageUp/PageDown = höjd. Pilar och drag ändrar **bara** x/z som i dag. `toFloor` `:37–43` ska räkna bort lagerlyftet så ett staplat redskap inte hoppar i z vid drag.
- Yta: «Bredare yta», «Högre yta», «Standardyta» (den sista bara när surface ≠ 0). viewBox och bakgrunds-`rect` från `layoutBounds`. Golvremsan följer bredden. Vid drag: frys viewBox under pågående drag (räkna om vid pointerup) så ytan inte hoppar under fingret.
- «Klar» skickar `{ v: 1, poses, surface? }`. «Ställ i rad igen» nollar även `surface`.
- 844×390: knappraden får brytas; «Klar» nåbar.

## 4. StationSketch och utskrift (C1, D1, E1)
- Layoutgrenen `:13–40`: viewBox och `rect` från `layoutBounds(valid)`, samma ritordning. Heuristikgrenen orörd (golden).
- `lib/stationCards.ts` / `PassPrint.tsx`: inget nytt fält behövs, layouten följer redan med. Kontrollera att utskriften inte klipper en stapel.

## 5. Bank, cache
- Inga nya kolumner. `bankRow.ts:181,230`, `bankWrite.ts:94–104,152`, `ownActivities.ts:213,277,378` skickar redan hela objektet — verifiera bara rundtur med `y`/`surface`.
- `BANK_CACHE_KEY` `-v1` oförändrad. Gammal cache utan `y` → platt som i dag.
- Äldre klient (Slice 57) som läser en Slice 58-layout: `sanitize` släpper `y`/`surface` → platt, ingen krasch. Sparar en sådan klient om layouten tappas `y`. Acceptabelt (bara admin skriver); notera i ship notes.

## 6. Tester (`bun test src`)
- `stationLayout.test.ts`: `y` saknas → utelämnad; `y` 1,7 → 1; `y` 0,3 → 0,25 (1/8-steg); `y` NaN/sträng → utelämnad; `surface` 5 → 2, −1 → 0; rundtur av Slice 57-layout utan nya fält är identisk; `syncLayout` behåller `surface`; `layoutBounds` för tom/gles/tät/staplad layout, aldrig mindre än golvet.
- `stationPose`: `poseOrder` y före z; `poseTransform` med y 0 = dagens sträng.
- `StationSketch`: heuristik-golden oförändrad; Slice 57-layout utan y ger samma markup som main **förutom** viewBox om bounds kräver större yta (dokumentera i test).
- `bankRow.test.ts`: rundtur med `y` och `surface`.

## 7. Feature map, docs, footer, budget
- `verify-traningsplaneraren/features/admin.md`, `delad-bank.md`, egen-övning: höjdknappar, ytknappar.
- `docs/station-compose.sv.md`, `docs/admin.sv.md`; rad i `docs/README.md` för Slice 58.
- `data/blockMeta.ts:97` `SLICE_NUMBER = '58'`. Strängar enligt `content/microcopy.sv.md`.
- `npm run build`, `npm run lint`, `bun test src` gröna. Bundle gz mot main i PR. Över +512 B är godkänt (decisions.md fråga 5); exakt siffra i PR.
