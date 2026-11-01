# Slice 58 — Stationsskiss y + yta (stapling + anpassad bakgrund)

**App:** Träningsplaneraren
**Status:** **LÅST** 2026-11-01 av Christoffer via PO: «Ja, lås A1 B1 C1 D1 E1 F1». Se [`decisions.md`](decisions.md). Bundle över +512 B OK, ingen SQL (valfria `schema-58.sql` hoppas över). Bas: main @ `b610103` (Slice 57 live, footer «Slice 57»). Gren: `slice-58-docs`.
**Effort:** **M** (gränsfall S–M: ingen SQL, men drag/höjd/viewBox i två komponenter)
**Källa:** Scout 2026-11-01 idé 1 (`/workspace/scout-drafts/2026-11-01-s57-followup.md`). Christoffer valde idé 1. Bild: `evidence/s57-detail-live.png` (live i dag, 390×844).

## Varför

Slice 57 lät admin ställa upp stationen, men allt står på samma golv. Två landningsmattor på varandra går inte att visa. Skissytan är också fast (640 bred, låst höjd), så en gles station får tom kant och en tät station ser trång ut.

**Vad ledaren får:** «Jag ser att landningsmattorna ligger dubbelt, och skissen fyller ytan.»

**Vad admin får:** I bladet «Så ska stationen stå» höjer och sänker du det valda redskapet med egna knappar, skilda från att dra på golvet. Ytan växer med uppställningen, och du kan göra den bredare eller högre.

## Kod i dag (main @ `b610103`, läst — ingenting byggt)

- Typer: `app/src/types.ts:19–30` `StationPose { pieceId, x, z, yaw }`, `StationLayout { v: 1; poses }`.
- Logik: `app/src/data/stationLayout.ts` — `sanitizeStationLayout` `:72–96` (kräver `v === 1`, plockar bara x/z/yaw, **släpper okända fält**), `syncLayout` `:99–118`, `defaultLayoutFrom` `:121–134`.
- Geometri: `app/src/components/stationPose.ts` — `SKETCH_FLOOR_Y = 150`, `LAYOUT_VIEW_W = 640`, `poseTransform` `:9–16` (`cy = 150 − 20·z`, skala `1 − 0,15·z`), `sortedPoses` `:18–20` (bara z).
- Blad: `app/src/components/StationLayoutSheet.tsx` (173 rader) — drag `toFloor` `:37–43` (y-led på skärmen = z), pilar `:68–84` (Upp/Ned = z), ritordning `order` `:86` (bara z), fast `viewBox="0 60 640 130"` `:110`.
- Ledarens skiss: `app/src/components/StationSketch.tsx:13–40` — layoutgren med fast `viewBox="0 78 640 112"`. Heuristikgrenen `:42–75` rörs inte.
- Text: `app/src/data/blockMeta.ts:336–343` (`stationLayout*`). Footer `:97` `SLICE_NUMBER = '57'`.
- Bank: `lib/bankRow.ts:181,230`, `lib/admin/bankWrite.ts:94–104,152`, `lib/ownActivities.ts:213,277,378` — skickar hela layoutobjektet vidare.
- Schema: `slice-57/content/schema-57.sql` — triggern kräver `v = 1` och kollar bara x/z/yaw. **Extra fält (`y`, `surface`) släpps igenom.**

**Gapet:** ingen höjd, ritordning bara på z, fast skissyta.

## A–F (★ = Docs förslag, **alla ★ låsta**)

### A. Hur sparas höjden?
- **A1 ★** Valfri `y` (0–1) på varje pose i **`v: 1`**. Saknas `y` → 0 (golvet). Gamla layouter ritas exakt som i dag. Ingen SQL krävs. En äldre app (cache/gammal flik) läser en ny layout utan höjd, platt, i stället för att falla till heuristik.
- A2 Höj till `v: 2` med obligatorisk `y`. Tydligare version, men triggern i `schema-57.sql` avvisar `v ≠ 1` → **SQL före merge**. Äldre klienter tappar alla nya layouter (heuristik) tills de uppdaterats.

### B. Hur ändrar admin höjden?
- **B1 ★** Två egna knappar på valt redskap: «Höjd +» och «Höjd −», ett steg = ett lager (`y` += 1/8, max 8 lager). Tangent PageUp/PageDown. Drag på golvet ändrar fortfarande bara x/z, så höjd och djup blandas aldrig. Valt redskap visar «Lager N» bredvid knapparna när N > 0.
- B2 Ett reglage (slider) «Höjd» 0–1 under ytan. Finare steg, men mer chrome och lätt att förväxla med djup på telefon.
- B3 Lägesväxel «Flytta / Höj» där drag i y-led blir höjd. Avvisas: just den förväxlingen Scout varnar för.

### C. Ritordning och placering
- **C1 ★** Sortera på `y` stigande, sedan `z` fallande (bakre först), sedan ursprunglig ordning. `poseTransform` drar av `LAYER_PX · 8 · y` från `cy` (ett lager ≈ markens höjd för en landningsmatta). Skalan styrs fortfarande bara av `z`. Samma funktion i blad, detaljvy och **Skriv ut passet**. `syncLayout`/`defaultLayoutFrom`: nya poser får `y` 0.
- C2 Sortera på `z` först, sedan `y`. Mer rätt för djupt utspridda stationer, men en stapel på olika z kan ritas fel. Inte enligt Scout-kortet.

### D. Skissytan
- **D1 ★** Auto: viewBox räknas från posernas yttre gränser (x, z, y och markens bredd) plus fast marginal, aldrig mindre än i dag (min 320 bred) och aldrig klipper en mark. Manuellt: knapparna «Bredare yta» och «Högre yta» lägger till ett steg extra marginal (0–2 steg var), «Standardyta» nollar. Sparas som valfritt `surface: { w: 0–2, h: 0–2 }` i layouten (saknas → 0). Golvremsan (`rect`) följer ytans bredd. Utskrift får samma viewBox.
- D2 Bara auto, ingen manuell knapp. Mindre kod, men Christoffers «anpassad bakgrund» uppfylls bara delvis.
- D3 Fri storlek (dra i hörnet). Nära CAD, avvisas.

### E. Utan layout
- **E1 ★** Heuristikgrenen i `StationSketch` (`:42–75`) och bankrader med `default_station_layout = null` är byte-identiska med main. Hallöversikt orörd (ett märke per station). **Redigera redskap** oförändrat. E1-regeln från Slice 57 (`layoutForStation`) oförändrad.
- E2 Låt heuristiken också använda auto-viewBox. Utanför omfånget (ändrar golden).

### F. Omfång, budget, SQL
- **F1 ★** A1 B1 C1 D1 E1. Ingen CAD på hallschemat, ingen WebGL/Three.js, fast katalog (`EQUIPMENT_PIECES` orörd). Footer «Slice 58». **Ingen SQL** (A1 + D1 ryms i befintlig jsonb och trigger). Valfri skärpning av triggern i `content/schema-58.sql` (y/surface-intervall), bara om Christoffer vill. Bundle: mjukt undantag över +512 B gzip, som Slice 57.
- F2 Samma som F1 men SQL-skärpningen obligatorisk före merge.

**Utanför omfånget:** städning av befintliga skisser (Scout #2), Admin-kö «skiss saknas» (Scout #3), 3D-vy, ledare som redigerar layout, nya redskap.

## Effort: M

Pose-fält + sanering + sync, höjdknappar och tangenter, ny ritordning, bounds-viewBox i två komponenter, `surface`-knappar, tester. Ingen SQL, ingen cache-bump.

**Bundle, ärligt:** uppskattat **+0,5–0,9 kB gzip** (bounds-funktion, tre–fem knappar, sortering, strängar). Troligen över mjuka +512 B. ★ Förslag: samma undantag som Slice 57 — Christoffer OK:ar, Builder rapporterar exakt siffra i PR. Tunnare (D2, utan manuella ytknappar) ≈ +0,4–0,6 kB.

## Öppna frågor till Christoffer — **besvarade 2026-11-01** (se `decisions.md`)

Svar: 1 A1 · 2 B1, 8 lager räcker · 3 C1 OK · 4 D1 · 5 bundle OK · 6 ingen SQL nu.


1. **A:** valfri `y` i `v: 1` (A1 ★, ingen SQL) eller `v: 2` (A2, SQL före merge)?
2. **B:** knappar «Höjd +/−» i lager (B1 ★) eller reglage (B2)? Räcker 8 lager?
3. **C:** ritordning y sedan z (C1 ★, enligt Scout) OK?
4. **D:** auto + «Bredare yta»/«Högre yta» (D1 ★) eller bara auto (D2)?
5. **Bundle:** OK över +512 B gzip som i Slice 57?
6. **SQL:** ingen SQL behövs med A1. Vill du ändå klistra in den valfria skärpningen `schema-58.sql` (y 0–1, surface 0–2) före merge? ★ Förslag: nej nu, appen sanerar redan.
