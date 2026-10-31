# Slice 57 — Redigerbar 2,5D-stationsskiss (fas 1 av 2,5D→3D)

**App:** Träningsplaneraren
**Status:** **FÖRESLAGEN** 2026-10-31. Inget låst, inget byggt. Bas: main @ `9a452c7` (Slice 56 live, footer «Slice 56»). Gren: `slice-57-docs`.
**Effort:** **M**
**Källa:** Scout 2026-10-31 vinkel 1 (`/workspace/scout-drafts/2026-10-31-3d-stationsbyggare.md`). Christoffer valde **2,5D nu → 3D senare** (vinkel 3). Bilder i `evidence/`: `mock-a-2d5-builder.png` (wireframe), `c2-detail.png`, `c3-detail-scrolled.png`, `c5-print.png` (live i dag).

## Varför

I dag ritar appen stationsskissen själv. Den tar redskapen i chip-listan och ställer dem i en fast ordning, ibland med ansatskuddar framför. Det blir ofta rätt, men den som lägger in övningen kan inte bestämma ordning, avstånd eller vinkel. En ny ledare ser alltså appens gissning, inte hur stationen faktiskt ska stå.

**Vad ledaren får:** «Jag öppnar övningen och ser stationen som den som skrev övningen byggde den: ansats, redskap och landning i rätt ordning.»

**Vad admin får:** I «Ändra i banken» (Teknik) finns en liten skissyta under chip-listan. Där flyttar du redskapen och vrider dem. Sparar du, ser alla ledare samma skiss, även offline.

## Fas 1 av 2,5D → 3D

Detta är första steget. Skissytan sparar varje redskap som en position på golvet (`x`, `z`) och en vridning (`yaw`). Det är samma uppgifter som en 3D-vy behöver senare. När 3D-vyn byggs (egen slice, senare) kan den läsa samma sparade layout, så admin behöver inte bygga om stationerna. **Ingen WebGL/Three.js i den här slicen.** Hallöversikt rörs inte.

## Kod i dag (main @ `9a452c7`, läst — ingenting byggt)

- Modell: `app/src/types.ts:13–16` `StationEquipmentSlot { pieceId, count }`; `types.ts:54` `Activity.defaultStationEquipment?`; `types.ts:81` `SessionItem.stationEquipment?` (passets egen lista från **Redigera redskap**).
- Katalog: `app/src/data/equipmentPieces.ts:12` `EQUIPMENT_PIECES` (15 st); `sanitizeStationEquipment` på `:111`. Max 8 slots, antal 1–9.
- Skiss för ledaren: `app/src/components/StationSketch.tsx` (85 rader, 2 720 B). `expand(slots)` `:13–49` gör heuristiken: ansatskuddar `:19–26` (trampett/satsbräda utan bana), fast ordning med tak per redskap `:27–47`. Ritning `:51–85` lägger märkena i en rad (`EQUIPMENT_ROW_WIDTH`, gap 10). Text `UI.stationSketchCaption` / `UI.stationSketchApproach` (`data/blockMeta.ts:335–337`).
- Var skissen syns: `components/ActivityDetail.tsx:101–103` (`sketchSlots` = passets lista, annars förslaget) och `:143`; utskrift `components/PassPrint.tsx:62` via `lib/stationCards.ts:35`.
- Redskapsprimitiver: `components/equipmentMark.tsx:128` `EquipmentMark` (används också i Hallöversikt `:291`).
- Redigering: `components/StationComposeSheet.tsx` (8 781 B), Props `:18–27`. Används i tre ställen: `AdminBankForm.tsx:236` («Ändra i banken»), `OwnActivityForm.tsx:182` (Ny egen övning, bara Teknik `:128`) och `HallBoard.tsx:832` (**Redigera redskap** för passet).
- Bank: `lib/bankRow.ts:30,56,174–175,221` läser/skriver `default_station_equipment`; `lib/admin/bankWrite.ts:24,98,144`. Offline-cache `lib/bank.ts:31` `BANK_CACHE_KEY = 'gymnastics-planner-bank-cache-v1'`, läs `:88`, skriv `:117`.
- Schema: `slice-31/content/schema-31.sql:60–61` kolumn `default_station_equipment jsonb`, `:85` bara Teknik, trigger `check_exercise_redskap` `:90–123`.
- Footer: `data/blockMeta.ts:97` `SLICE_NUMBER = '56'`. Ingen `three` i `app/package.json`.

**Gapet:** skissen är heuristik. Admin kan inte styra ordning, placering eller vridning.

## A–F (★ = förslag)

### A. Var redigerar admin layouten?
- **A1 ★** På samma ställe som i dag: i «Ändra i banken» och Ny egen övning (Teknik), under chip-listan i `StationComposeSheet`. En skissyta där du drar redskapen (`EquipmentMark`) och vrider dem. Ingen ny sida. Ytan visas bara när formuläret skickar med layout, så **Redigera redskap** i Hallöversikt ser ut som i dag.
- A2 Ett eget helskärmsblad bara för skissen. Mer plats, men ett steg till.
- A3 Ledaren får också flytta redskap i **Redigera redskap**. Utanför omfånget.

### B. Hur sparas layouten (redo för 3D)?
- **B1 ★** Ett eget fält bredvid redskapen: `defaultStationLayout` i appen, `default_station_layout jsonb` i banken. Form: `{ "v": 1, "poses": [{ "pieceId", "x", "z", "yaw" }] }`. En pose per redskap som står på golvet (antal 3 → tre poser). `x` 0–1 längs ansats → landning, `z` 0–1 på djupet (0 = närmast betraktaren), `yaw` i radianer. Saknas layout → dagens heuristik. Chip-listan säger **vad** som ska fram ur förrådet; layouten säger **hur det står**.
- B2 Bara ordningsnummer för SVG. Enklare, men måste kastas när 3D kommer.
- B3 Lägg poser inuti varje redskapsslot. Ändrar Slice 31:s form på `default_station_equipment` och triggern.

### C. När chip-listan ändras
- **C1 ★** Lägger du till ett redskap får det en standardplats i slutet av raden. Tar du bort ett redskap försvinner dess poser. Ändrar du antal läggs poser till eller tas bort sist. Förrådslistan och skissen visar alltid samma redskap.
- C2 Layouten lever för sig tills du sparar. Kan glida isär från förrådet.

### D. Ansatskuddar
- **D1 ★** Utan layout: dagens ansatskuddar som i dag. Med layout: bara det admin har ställt ut, inga automatiska kuddar. Admins skiss gäller. (Vill admin ha ansatskuddar lägger hen in madrasser i chip-listan.)
- D2 Visa automatiska kuddar även med layout.

### E. Var ser ledaren skissen?
- **E1 ★** Samma `StationSketch` som i dag i övningens detaljvy och i **Skriv ut passet**. Layouten används när passets redskap är samma som förslaget (orört eller «Använd förslag»). Har ledaren ändrat i **Redigera redskap** → heuristik från passets lista. Hallöversikt orörd (ett märke per station).
- E2 Skissytan även för ledare. Nej.

### F. Omfång, budget, SQL
- **F1 ★** A1 B1 C1 D1 E1. Hall orörd. Inga nya redskap i `EQUIPMENT_PIECES`. Ingen WebGL/Three.js/GLB. Footer «Slice 57». Ny kolumn `default_station_layout` + trigger (`content/schema-57.sql`); Christoffer klistrar in SQL själv efter OK. Offline-cache och banksynk följer Slice 31-mönstret. Bundle: se nedan.
- F2 Ingen SQL nu, layout bara lokalt. Fel för banken: ledarna skulle aldrig se admins skiss.

## Effort: M

Skissyta + serialisering + gren i `StationSketch` + schema/SQL + cache + Verifier-väg admin → ledare offline.

**Bundle, ärligt:** soft-budget +512 B gzip räcker troligen **inte**. Uppskattning: tunn skissyta (pekardrag, vrid-knapp, inget bibliotek) ≈ 3–4 kB rått / **+0,9–1,4 kB gzip** totalt med serialisering och `StationSketch`-grenen. Tunnaste varianten (flytta vänster/höger + vrid 90° med knappar, ingen fri drag) ≈ **+0,5–0,8 kB gzip**. Behöver Christoffers OK för att gå över +512 B (öppen fråga 2).

## Utanför omfånget

- WebGL / Three.js / 3D-vy / orbit-kontroller / GLB-modeller (egen slice senare).
- Hallöversikt med flera märken per station eller CAD på hallschemat.
- Ny egen redskapskatalog eller nya redskaps-id.
- Ledare som redigerar layout (Redigera redskap är oförändrat).
- Ändrad logik i Planera pass eller redskapsförslag.

## Öppna frågor till Christoffer

1. **A:** skissytan i befintligt bankblad (A1 ★) eller eget helskärmsblad (A2)?
2. **Bundle:** OK att gå över +512 B gzip (uppskattat +0,9–1,4 kB med fri drag)? Annars tunnaste varianten med knappar (+0,5–0,8 kB).
3. **D1:** admins layout gäller, inga automatiska ansatskuddar när layout finns. OK?
4. **3D senare:** bekräfta att 3D-vyn blir en egen slice (redan valt, noteras som låst avsikt).
5. **SQL-tidpunkt:** banken hämtar kolumner med namn (`BANK_EXERCISE_COLUMNS`). Saknas kolumnen när appen går live misslyckas hämtningen. ★-förslag: du klistrar in `schema-57.sql` **efter ditt OK på packet och före merge/deploy** (kolumnen är ny och tom, så den stör inte dagens app). Builder lägger dessutom in en reserv: misslyckas hämtningen på `default_station_layout` hämtar appen igen utan kolumnen. OK?
6. **Ny egen övning:** samma formulär används av ledare som skriver egna Teknik-övningar. Ska skissytan synas där för alla (sparas lokalt, följer med vid «Skicka till banken»), eller bara i admin «Ändra i banken»? ★-förslaget: synas där, eftersom den egna övningen blir bankens rad.
