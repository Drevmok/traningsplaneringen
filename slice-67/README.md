# Slice 67 — Fyll bankens skisser via kön «Saknar skiss»

**App:** Träningsplaneraren
**Status:** **FÖRESLAGEN**. Bas: main @ `329a259` (Slice 66 live, PR #74, footer «Slice 66»). Gren: `slice-67-docs`.
**Uppdrag:** Stationer 17 nov S6. Approved av Christoffer 2026-11-23 10:28 (Europe/Stockholm): «Godkänn S6 Fyll bankens skisser». S4, S5, S7–S9 ingår inte.
**Effort:** **S** (innehåll). Ingen schema-SQL, ingen ny yta. Befintligt fält från Slice 57.

## Varför

Teknik med redskap som saknar sparad skiss visar den automatiska raden. Kön «Saknar skiss» (Slice 59) finns redan i Admin. En ny ledare ska se en uppställning som stämmer med övningen — i ActivityDetail, Golvklart, utskrift och Kör passet — inte bara redskap på rad.

## Kön i dag (main @ `329a259`, läst i repot — ingen fråga mot live-banken)

`needsLayout` (`app/src/lib/admin/layoutQueue.ts`): publicerad eller väntande Teknik, minst ett `defaultStationEquipment`, utan giltig `defaultStationLayout`. Dolda rader räknas inte. Admin visar dem under `UI.adminLayoutQueue` «Saknar skiss ({n})».

Källa i repot: `app/src/data/seedActivities.ts` (51 övningar, offline-reserv och tester; live-banken är sanningen sedan Slice 32). **24 Teknik**, varav **23** matchar kön och **ingen** har `defaultStationLayout`. `tech-hjul` (Hjul) saknar redskapsförslag och ingår inte.

Live-banken kan skilja sig (någon kan ha sparat skisser via Admin sedan Slice 59). **Listan ska bekräftas read-only mot live innan SQL-filen skrivs.** Docs kör inte den frågan.

| id | Titel | Redskap |
|---|---|---|
| `tech-ljushopp-satsbrada` | Ljushopp på satsbräda | satsbräda, landningsmatta |
| `tech-ljushopp-trampett` | Ljushopp på trampett | trampett, landningsmatta |
| `tech-satsbrada-volt-rygg` | Satsbräda volt till rygg | satsbräda, landningsmatta |
| `tech-trampett-volt-mattberg` | Trampett volt upp på mattberg | trampett, mattberg, landningsmatta |
| `tech-rondat-flickis` | Rondat–flickis | tumblingmatta, landningsmatta |
| `tech-flickis-kudde` | Flickis med flickiskudde | flickiskudde, madrass |
| `tech-falla-bakat-hojd` | Falla bakåt från höjd till rygg | plint, madrass |
| `tech-salto-fran-hojd` | Salto från höjd | plint, landningsmatta |
| `tech-handstaende-falla-rygg` | Handstående falla till rygg | madrass |
| `tech-kullerbytta` | Kullerbytta framåt | madrass |
| `tech-bro` | Bro | madrass |
| `tech-balansgang` | Balansgång | 4 koner |
| `tech-grenhopp-trampett` | Grenhopp från trampett | trampett, landningsmatta |
| `tech-formhopp-over-block` | Formhopp över block från trampett | trampett, skumblock, landningsmatta |
| `tech-aggrullning-kil` | Äggrullning nerför kil | kilmatta, madrass |
| `tech-l-hang-racke` | L-häng i räcke | räcke, landningsmatta |
| `tech-stod-racke-pendel` | Stöd på räcke med pendel | räcke, landningsmatta |
| `tech-asnesparkar` | Åsnesparkar | tumblingmatta |
| `tech-minihjul` | Minihjul (krabbhjul) | tumblingmatta |
| `tech-soldatsparkar-bom` | Soldatsparkar på bom | bom, landningsmatta |
| `tech-krabbgang-bom` | Krabbgång längs bom | bom |
| `tech-ljushopp-rockringar` | Ljushopp i rockringar | 4 rockringar |
| `tech-landning-plint` | Landningar upp på och ner från plint | plint |

14 har mer än en redskapstyp; 9 har en typ (koner och rockringar räknas hit, count 4).

`tools/bank/out/bank-seed.sql` och `bank-seed.json` saknar kolumnen `default_station_layout`. `export-seed.ts` tar inte med den i kolumnlistan, trots att `activityToBankRow` har fältet. Exporten är efter Slice 57 eftersläpande. Inte nödvändigt att laga i den här slicen om seederna lämnas (E1).

## Framtagning och ägarskap

Utgångspunkt: övningens `how_to` och `defaultStationEquipment`. Den automatiska raden är start, inte mål — skissen ska visa uppställningen (ansats, höjd, landning). Poser ska matcha redskapen ett-till-ett (Slice 57 C1, trigger `check_exercise_layout`).

**Förslag:** Bob eller Docs tar fram JSON-skiss per övning. **Ägare av varje skiss:** Christoffer, som godkänner den visuellt i befintlig Admin-kö / `StationLayoutSheet` (samma förhandsvisning som StationSketch) innan filen skrivs. Ingen ny preview.

## Skrivning

Befintlig kolumn `public.exercises.default_station_layout` (jsonb, Slice 57). Ingen ny kolumn, ingen ny CHECK, ingen triggerändring.

Efter visuellt ja skrivs `content/update-station-layouts.sql` (finns inte i den här FÖRESLAGEN-packen). Form som Slice 61/62: idempotent `UPDATE` som **bara** sätter `default_station_layout` för godkända id, med `AND default_station_layout IS NULL`. Inget `DELETE`, inget `push-promote --replace`. sha256 av filen antecknas i HANDOFF när den finns. Christoffer klistrar in **efter merge**, när ev. PR är inne, och bara efter sitt **separata** ja (eller PO via Supabase MCP efter hans OK). Agenter kör aldrig filen. Builder tar med den oförändrad; skriver inte en ny och kör den inte.

## Kodbehov

**Inget i appen** (kön, arket, `bankWrite` och kolumnen finns). `SLICE_NUMBER` lämnas `'66'` — samma praxis som Slice 60, som inte rörde appen. Skiss-JSON hör inte hemma i `seedActivities.ts` här: filen ingår i klientbundlen och skulle spräcka +512 B gzip.

## Scope (★)

- Fylla saknade skisser för Teknik i kön, via Slice 57-fältet.
- Ingen ny yta, ingen schema-SQL, inget `--replace`. Inte S4, S5, S7–S9.

## Ej scope

- S4, S5, S7–S9, 3D, hall-CAD, extra märken, nya Admin-fält, `export-seed`-lagning, att lägga skisserna i seederna, att höja bundle-taket.

## A–F (★ = Docs förslag; låses av Christoffer)

### A. Vem tar fram skisserna
- **A1 ★** Bob eller Docs föreslår layout-JSON från `how_to` och redskapsförslaget (automatisk rad som start). Christoffer godkänner varje skiss visuellt i befintlig Admin-kö / StationSketch innan SQL skrivs.
- A2 Christoffer går kön själv och sparar i Admin (live via `bankWrite`). Ingen granskningsbar fil. Möjligt, men inte förstaval mot mönstret i Slice 61/62.
- A3 Spara den automatiska raden som officiell skiss utan justering. Ger nästan inget. Avråds.

### B. Omfång i kön
- **B1 ★** Alla 23 i seed-kön, efter live-bekräftelse. Hoppa över id som redan har skiss i live. `tech-hjul` ingår inte.
- B2 Först de 14 med mer än en redskapstyp (där raden oftare blir fel); resten i en senare slice. Rimligt om den visuella genomgången ska hållas kort.
- B3 Bara en liten första grupp (t.ex. åtta hopp/volt). Lämnar merparten av kön. Avråds som hela S6.

### C. Sökväg till banken
- **C1 ★** SQL-fil som ovan (`UPDATE` … `IS NULL`, bara `default_station_layout`). Efter merge, separat ja. Aldrig `--replace` eller delete. Builder tar med filen oförändrad och kör den inte.
- C2 Bot-skrivning via befintlig `bankWrite` efter hans ja. Sämre att granska, ingen sha256-fil. Avråds som förstaval.
- C3 Bara sparande i Admin, ingen SQL. Live uppdateras direkt; ingen arkiverad fil på main. Avråds som förstaval.

### D. Godkännande och förhandsvisning
- **D1 ★** Befintlig kö «Saknar skiss» och StationSketch. SQL skrivs först när Christoffer sagt ja till skisserna (en och en eller samlat mot förhandsvisning).
- D2 Godkänn bara från rå JSON, utan bild. Avråds.
- D3 Ny förhandsvisning eller eget verktyg. Utanför omfånget. Avråds.

### E. Kod, bundle och footer
- **E1 ★** Ingen appändring. `SLICE_NUMBER` kvar `'66'`. Skisserna läggs inte i `seedActivities.ts` (bundle-risk). Inget undantag. Offline-reserven kan få skisserna i en senare, medveten seed-uppdatering.
- E2 Sätt `SLICE_NUMBER = '67'` trots att appen är orörd. Onödigt (jämför Slice 60). Avråds.
- E3 Uppdatera även seederna och/eller `export-seed.ts`. Spräcker sannolikt +512 B gzip och kräver Christoffers ja till undantag. Avråds i den här slicen.

### F. Verifiering
- **F1 ★** Live-kön bekräftas read-only innan SQL skrivs. Efter körning (hans ja): `RETURNING` visar uppdaterade id; redan fyllda rader orörda; kön minskar med samma antal; stickprov i ActivityDetail, Golvklart, utskrift och Kör passet visar sparad skiss, inte bara automatisk rad. `tech-hjul` och icke-Teknik orörda. Befintliga tester gröna. Ingen ny enhetstestfil om appen är orörd. Ingen SQL körd av agenter. sha256 i HANDOFF stämmer.
- F2 Ny smoke eller `SLICE_NUMBER`-bump bara för att köra loopen. Onödigt om E1.
- F3 Bara checklista, utan live-bekräftelse före SQL. Avråds.

Låssträng, om ★ antas: «Ja, lås A1 B1 C1 D1 E1 F1».
