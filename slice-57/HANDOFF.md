# Slice 57 — HANDOFF till Builder (★-vägen A1 B1 C1 D1 E1 F1)

**Status:** FÖRESLAGEN. Bygg inte förrän Christoffer låst (då kommer `decisions.md`). Bas main @ `9a452c7`.
Rör inte Hallöversikt, `EQUIPMENT_PIECES`, Planera pass eller förslagslogiken. Ingen `three`/WebGL.

## 1. Typer och sanering
- `types.ts`: `StationPose { pieceId: string; x: number; z: number; yaw: number }`, `StationLayout { v: 1; poses: StationPose[] }`, `Activity.defaultStationLayout?: StationLayout`.
- `data/stationLayout.ts` (ny, ren logik, inga React-importer):
  - `sanitizeStationLayout(raw, slots): StationLayout | undefined` — kräver `v === 1`, klämmer x/z till 0–1, yaw till [-π, π], tar bort poser vars pieceId saknas i slots; returnerar `undefined` om antal per pieceId ≠ count (då heuristik — ingen krasch).
  - `syncLayout(layout, slots): StationLayout` (C1) — nya redskap/ökat antal: append pose `x` = sista x + 0,08 (max 1), `z` 0,5, `yaw` 0; minskat antal: ta bort sista poserna för pieceId; borttaget redskap: alla dess poser bort.
  - `defaultLayoutFrom(slots)` — gör om heuristikens ordning från `StationSketch.expand` till poser (startläge på skissytan; **utan** ansatskuddar, de är inte redskap i listan).
- Flytta `expand` ur `StationSketch.tsx:13–49` till samma modul så pad och skiss delar ordning/tak. Beteende identiskt (gyllene test).

## 2. Skissyta (A1)
- `StationComposeSheet` Props (`:18–27`): valfria `initialLayout?: StationLayout` och `onSave(slots, layout?)`. Ytan renderas **bara** när `initialLayout !== undefined || layoutEnabled` skickas — `HallBoard.tsx:832` skickar inget → oförändrat.
- Ny `components/StationLayoutPad.tsx`: SVG med samma golvremsa som `StationSketch`. Varje pose = `EquipmentMark` i `<g transform="translate(..) rotate(..)">`. Pointer events (drag), tangentbord: pil flyttar 0,02, `R`/knapp «Vrid» = +π/2. Ingen dragbibliotek.
- 2,5D: `z` ritas som liten y-förskjutning + skala (t.ex. y −20·z, skala 1−0,15·z) så djup syns utan 3D.
- Chip-ändringar i bladet kör `syncLayout` direkt (C1). «Ställ i rad igen» → layout `undefined`.
- `AdminBankForm.tsx:50,99,236`: draft får `layout`; skickas `default_station_layout: teknik && layout ? layout : null`.
- `OwnActivityForm.tsx:41,182` + `lib/ownActivities.ts:56,205,267,365`: samma fält (öppen fråga 6); följer med i `bankWrite.ts:98,144`.
- Liggande telefon: ytan ska fungera i 844×390 (bladet scrollar, ytan full bredd).

## 3. StationSketch läser layout (D1, E1)
- Props: `slots`, valfri `layout?: StationLayout`. Med giltig layout: rita poserna sorterade på `z` (bakre först), x mappat till viewBox-bredd, inga ansatskuddar, ingen `stationSketchApproach`. Utan → dagens kod oförändrad.
- `ActivityDetail.tsx:101–103,143`: skicka `activity.defaultStationLayout` bara när `stationEquipment === undefined` eller `sameRecipe(stationEquipment, activity.defaultStationEquipment)`.
- `lib/stationCards.ts:35` → lägg `equipmentLayout` i kortmodellen med samma regel; `PassPrint.tsx:62` skickar den.

## 4. Bank, SQL, cache
- SQL: `slice-57/content/schema-57.sql` (Christoffer klistrar in; agent kör aldrig). Plan: `content/migration-plan.md`.
- `lib/bankRow.ts`: `:30` typ, `:43–66` kolumnlista, `:174–175` läs, `:221` skriv. `lib/admin/bankWrite.ts:24,98,144`.
- `lib/bank.ts`: cache-nyckel `-v1` oförändrad; reserv-hämtning utan kolumnen om den saknas.
- Seeds (`data/seedActivities.ts`): ingen layout. `slice-31/content/export_bank_seed.ts`: ta med fältet om det finns.

## 5. Tester (`bun test src`)
- `stationLayout.test.ts`: sanering (fel version, NaN, okänt pieceId, fel antal → undefined), klämning, `syncLayout` lägg till/ta bort/antal, `defaultLayoutFrom` ordning = heuristik.
- `StationSketch`: utan layout identisk markup mot main för Ljushopp på satsbräda och trampett-seed (gyllene); med layout ingen ansatstext.
- `bankRow.test.ts`: rundtur rad ↔ aktivitet med layout; icke-Teknik → ingen layout; saknad kolumn → ingen layout.
- `ActivityDetail`/`stationCards`: passets egen lista ≠ förslag → ingen layout.

## 6. Feature map och levande docs
- `verify-traningsplaneraren/features/admin.md`, `delad-bank.md`: skissyta, spara, offline.
- `verify-traningsplaneraren/features/hall-redigera-redskap.md`: oförändrad (notera: ingen skissyta).
- `docs/station-compose.sv.md`, `docs/admin.sv.md`, `docs/dela-och-utskrift.sv.md`, `docs/delad-bank.sv.md`; rad i `docs/README.md` för Slice 57.

## 7. Footer och budget
- `data/blockMeta.ts:97` `SLICE_NUMBER = '57'`.
- `npm run build`, `npm run lint`, `bun test src` gröna. Rapportera bundle gz mot main i PR. Uppskattning +0,9–1,4 kB gzip (fri drag) / +0,5–0,8 kB (knappvariant). Över +512 B kräver Christoffers OK (öppen fråga 2) — skriv siffran i PR.
