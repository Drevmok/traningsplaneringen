# Slice 59 — HANDOFF till Builder (LÅST: A1 B1 C1 D1 E1 F1 G1 H1)

**Status:** **LÅST** 2026-11-05 — «Ja, lås A1 B1 C1 D1 E1 F1 G1 H1. Ändra Slice 57-flödet så Klar utan ändring bevarar skissen i alla skissvyer.» (Christoffer via PO). Se `decisions.md`. **Builder får bygga** när PO skickat byggkortet (Docs pingar inte Bob). Bas main @ `3f0a729`, docs-gren `slice-59-docs`. **Ingen merge utan Christoffers OK.**
**Rev 2026-11-05:** G1 H1 tillagda (avsnitt 3b). A–F oförändrade. H1 ersätter Slice 57 «Klar» utan ändring i alla skissvyer; «Ställ i rad igen» behåller 57-betydelsen.
**SQL:** ingen. **Bundle:** inom +512 B gzip (uppskattat +0,25–0,45 kB) — **inget undantag**; rapportera exakta byte mot main i PR.
Rör inte ledarens vy (`StationSketch`, `ActivityDetail`, `PassPrint`/`stationCards`), Hallöversikt, Redigera redskap, Planera pass eller `EQUIPMENT_PIECES`. I `StationLayoutSheet` och `data/stationLayout.ts` ändras **bara** det som står i 3b. `syncLayout`, `defaultLayoutFrom`, sanering och ritning rörs inte. Månadssvep 2026-11 #1–#3 ingår inte.

Texten nedan följer det låsta ★-valet A1 B1 C1 D1 E1 F1 G1 H1.

## 1. Urval (B1) — ny ren fil i admin-chunken
- `app/src/lib/admin/layoutQueue.ts`:
  ```ts
  export function needsLayout(e: AdminEntry): boolean
  ```
  Sant när `e.status !== 'hidden'`, `e.activity.blockType === 'techniques'`, `(e.activity.defaultStationEquipment?.length ?? 0) > 0` och `!e.activity.defaultStationLayout`.
- Ingen egen sanering: `toAdminEntries` → `rowToEntry` (`lib/bankRow.ts:181`) har redan kastat layouter som inte stämmer mot redskapen. Läs inte rå-JSON (B3 ingår inte).
- Ordning = `bank.entries` (redan sorterad på `sortOrder`).
- Lägg **inte** till något i `counts` i `state.ts`/`adminBank.ts`.

## 2. Kön i Admin (C1) — `components/AdminArea.tsx`
- Ny sektion **mellan** sektionen med Ny egen övning/Importera (`:78–87`) och `ClubAdminSection` (`:89–91`).
- Visas bara när `bank.loaded` och minst en rad uppfyller `needsLayout`.
- Markup: `<section className="admin-area-section admin-layout-queue">` med `<details>` (stängd som standard). `<summary>` innehåller `<h2>` med `UI.adminLayoutQueue` där `{n}` ersätts med antalet. Inuti: `<p className="muted">{UI.adminLayoutQueueHint}</p>` och samma `library-list`/`ActivityCard`-markup som listorna `:67–73`, med `adminBadges={badges(e)}` (pending visar «Väntar»).
- Använd **inte** klassen `admin-area-list` på den nya sektionen (slice-47-smoken letar efter `.admin-area-list` med «Dolda»).
- `LISTS` `:15–19` och tomtexten `:63` ändras inte. «Inget väntar just nu.» gäller fortfarande bara Väntar/Granskas/Dolda.
- CSS: återanvänd `.admin-area-section`/`.admin-area-list h2`-stilen för rubriken (`export.css:2212–2223`). `summary` ska ha minst 44 px tryckyta.

## 3. Hoppet (D1)
- `AdminArea`: `form`-state blir `{ mode: 'new' } | { mode: 'edit'; id: string; layout?: boolean }`. Kort i kön → `setForm({ mode: 'edit', id, layout: true })`. Kort i de andra listorna öppnar detaljvyn som i dag.
- `AdminBankForm.tsx`: ny valfri prop `openLayout?: boolean`. `placing` `:63` startar som `openLayout === true && draft.blockType === 'techniques' && draft.equipment.length > 0`. Utöver 3b ändras inget: «Klar» sätter `layout` (oförändrad om inget ändrats, 3b) och stänger bladet; stäng utan «Klar» → formuläret kvar; «Avbryt» → inget sparas.
- Spara: befintlig `submit` → `saveRow` → `loadAdminBank()`. Raden lämnar kön av sig själv. Toast `UI.adminSaved` («Sparat i banken.») som i dag.
- Konflikt/fel/offline: befintliga `adminSaveConflict`/`adminSaveFailed`/`adminOffline`, inget nytt.
- `SessionBuilder.tsx` (Biblioteket i admin-läge) skickar inte `openLayout` och är oförändrad.

## 3b. «Klar» utan ändring (G1 H1)
Regeln sitter i skissbladet och gäller därför överallt där det öppnas (H1): Admin-kön, Admin «Ny egen övning», Biblioteket «Ändra i banken» och egen övning (`OwnActivityForm`). Ingen prop, ingen skillnad mellan vägarna.

**a. Ren jämförelse i `data/stationLayout.ts`** (ny export, bredvid `syncLayout`):
```ts
export function sameLayout(a: StationLayout, b: StationLayout): boolean
```
Sant när: `a.poses.length === b.poses.length`; för varje index samma `pieceId`, `|Δx| ≤ 0.005`, `|Δz| ≤ 0.005`, `|normalizeYaw(a.yaw − b.yaw)| ≤ 0.01`, `Math.round((y ?? 0) * MAX_LAYERS)` lika; och `surface?.w ?? 0` och `surface?.h ?? 0` lika. Ordningen jämförs index för index. Bladet ändrar aldrig ordningen på `poses` (`poseOrder` sorterar bara för ritning, `:124`), så det räcker. Toleranserna som namngivna konstanter.

**b. `StationLayoutSheet.tsx`, «Klar» (`:244–249`)** räknar `result = { v: 1, poses, surface? }` som i dag och kallar sedan, i den här ordningen:
1. `empty` → `onDone(undefined)` (som i dag).
2. `reset` → `onDone(undefined)` (som i dag: «Ställ i rad igen» = tillbaka till automatisk skiss, Slice 57).
3. `sameLayout(result, start)` → `onDone(initialLayout)`, alltså exakt det värde bladet fick: `undefined` om det inte fanns någon layout, annars **samma objekt**. Bygg inget nytt objekt.
4. annars → `onDone(result)` (som i dag).
- `start` `:33` är redan startläget (`syncLayout(initialLayout)` eller `defaultLayoutFrom`). Ingen ny state och ingen flagga i handlers.
- «Standardyta» `:224–226` nollar inte `reset` i dag. Lämna det. Med punkt 3 spelar det ingen roll, eftersom yta 0 + `reset` ändå betyder rad + standardyta.
- Uppdatera kommentaren vid `onDone` `:22`: `undefined` = automatisk skiss (ingen layout eller «Ställ i rad igen»); oförändrat = `initialLayout` tillbaka.
- Stäng via bakgrunden (`onClose`) är oförändrat och rör aldrig layouten.

**c. Formulären:** `set('layout', layout)` i `onDone` (`AdminBankForm.tsx:252–255`, `OwnActivityForm.tsx:193–196`) ändras inte. Med 3b blir det en no-op när inget ändrats. Chip-regeln (`:268–271` resp. `:208–212`) ändras inte: utan layout förblir `undefined`, med layout `syncLayout`.

**d. Sparvägen i `AdminBankForm.submit` (`:107–111`)** ska inte skicka en layout som inte ändrats. Logik (ingen kod i packen):
- `teknik && draft.layout` och `draft.layout === a?.defaultStationLayout` (samma referens) → skicka **inte** `default_station_layout` (kolumnen rörs inte, byte för byte samma, även om banken skulle ha fält som saneringen tar bort).
- `teknik && draft.layout` och annan referens → skicka `draft.layout` (som i dag).
- annars, om `a?.defaultStationLayout` → skicka `null` (som i dag: «Ställ i rad igen», Teknik utan redskap, byte till annat block).
- annars → skicka inte fältet (som i dag; `null` står kvar).
- Ny rad (`mode: 'new'`): `pendingRow` (`bankWrite.ts:94–105`) är oförändrad.
- `OwnActivityForm` / `saveOwnActivity` (`lib/ownActivities.ts:277`) är oförändrade: `undefined` sparas som ingen layout.

**e. Kön:** inget extra. En rad som sparas utan ändrad layout har fortfarande ingen giltig layout, så `needsLayout` är sant och raden står kvar efter `loadAdminBank()`.

**f. Tester** (`data/stationLayout.test.ts`, inga React-tester):
- `sameLayout`: identisk → sant; `defaultLayoutFrom(s)` mot sig själv → sant; x +0,02 → falskt; x +0,02 −0,02 → sant; yaw +π/2 fyra gånger via `normalizeYaw` → sant; ett lager upp → falskt; upp och ner → sant; `surface {w:1,h:0}` mot ingen yta → falskt; `{w:0,h:0}` mot saknad → sant; olika `pieceId`-ordning → falskt; olika längd → falskt.
- Befintliga tester för `syncLayout`, `defaultLayoutFrom` och sanering är gröna utan ändring.
- Om bladets «Klar»-val bryts ut till en ren hjälpfunktion (t.ex. `doneLayout(start, result, initialLayout, reset, empty)`) testas de fyra grenarna där. Valfritt.

## 4. Text och footer
- `data/blockMeta.ts`: `adminLayoutQueue`, `adminLayoutQueueHint` enligt `content/microcopy.sv.md`. `SLICE_NUMBER = '59'` (`:97`).

## 5. Tester (`bun test src`)
- `lib/admin/layoutQueue.test.ts`: published Teknik med redskap utan layout → sant; samma med giltig layout → falskt; pending → sant; hidden → falskt; Teknik utan redskap → falskt; uppvärmning med redskap → falskt; rå rad med layout där antalet inte stämmer, genom `toAdminEntries` → sant.
- Befintliga `stationLayout`-, `bankRow`- och `bankWrite`-tester ska vara gröna utan ändring. Nya `sameLayout`-tester: se 3b f.

## 6. Feature map, docs, smokes
- `verify-traningsplaneraren/features/admin.md`: kön «Saknar skiss (n)», urval, hopp till skissbladet, och i Slice 57-stycket: «Klar» utan ändring behåller ingen layout / samma layout (G1).
- `docs/admin.sv.md`: stycke **Slice 59** (kön, städpasset och att «Klar» utan ändring inte sparar någon skiss, se README). Rad i `docs/README.md`.
- `verifier/smoke-map.json`: ingen ny smoke krävs. slice-32 och slice-47 (sökvägar `AdminArea.tsx`, `AdminBankForm.tsx`) ska vara SAMMA mot baslinjen, förutom footern 58→59.

## 7. Bygg och PR
- `npm run build`, `npm run lint`, `bun test src` gröna. Bundle gz (assets js+css) mot main i PR, uppdelat på huvudchunk och admin-chunk om det går.
- Ship notes: att «Spara i banken» nollställer «Behöver granskas» (befintligt), att «Klar» utan ändring nu behåller den automatiska skissen överallt där skissbladet öppnas (G1 H1, ändrar Slice 57-beteende), och att rader som redan fått en rad-uppställning av misstag rättas för hand med «Ställ i rad igen».
- Ingen SQL, ingen ändring i `schema-57.sql`, ingen ny kolumn.
