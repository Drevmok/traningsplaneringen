# Slice 59 — HANDOFF till Builder (FÖRESLAGEN, ★ A1 B1 C1 D1 E1 F1)

**Status:** **FÖRESLAGEN** 2026-11-05. **Bygg inte förrän låst.** Christoffer låser via PO, ordagrant. Då skrivs `decisions.md` och HANDOFF uppdateras. PO skickar byggkortet; Docs pingar inte Builder. Bas main @ `3f0a729`, docs-gren `slice-59-docs`. **Ingen merge utan Christoffers OK.**
**SQL:** ingen. **Bundle:** väntas inom +512 B gzip; rapportera exakt siffra mot main i PR.
Rör inte ledarens vy (`StationSketch`, `ActivityDetail`, `PassPrint`/`stationCards`), Hallöversikt, Redigera redskap, Planera pass, `EQUIPMENT_PIECES`, `StationLayoutSheet` eller `data/stationLayout.ts`. Månadssvep 2026-11 #1–#3 ingår inte.

Texten nedan följer ★. Väljer Christoffer något annat skriver Docs om avsnittet vid låset.

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
- `AdminBankForm.tsx`: ny valfri prop `openLayout?: boolean`. `placing` `:63` startar som `openLayout === true && draft.blockType === 'techniques' && draft.equipment.length > 0`. Inget annat ändras: «Klar» sätter `layout` och stänger bladet; stäng utan «Klar» → formuläret kvar; «Avbryt» → inget sparas.
- Spara: befintlig `submit` → `saveRow` → `loadAdminBank()`. Raden lämnar kön av sig själv. Toast `UI.adminSaved` («Sparat i banken.») som i dag.
- Konflikt/fel/offline: befintliga `adminSaveConflict`/`adminSaveFailed`/`adminOffline`, inget nytt.
- `SessionBuilder.tsx` (Biblioteket i admin-läge) skickar inte `openLayout` och är oförändrad.

## 4. Text och footer
- `data/blockMeta.ts`: `adminLayoutQueue`, `adminLayoutQueueHint` enligt `content/microcopy.sv.md`. `SLICE_NUMBER = '59'` (`:97`).

## 5. Tester (`bun test src`)
- `lib/admin/layoutQueue.test.ts`: published Teknik med redskap utan layout → sant; samma med giltig layout → falskt; pending → sant; hidden → falskt; Teknik utan redskap → falskt; uppvärmning med redskap → falskt; rå rad med layout där antalet inte stämmer, genom `toAdminEntries` → sant.
- Befintliga `stationLayout`-, `bankRow`- och `bankWrite`-tester ska vara gröna utan ändring.

## 6. Feature map, docs, smokes
- `verify-traningsplaneraren/features/admin.md`: kön «Saknar skiss (n)», urval, hopp till skissbladet.
- `docs/admin.sv.md`: stycke **Slice 59** (kön och städpasset, se README). Rad i `docs/README.md`.
- `verifier/smoke-map.json`: ingen ny smoke krävs. slice-32 och slice-47 (sökvägar `AdminArea.tsx`, `AdminBankForm.tsx`) ska vara SAMMA mot baslinjen, förutom footern 58→59.

## 7. Bygg och PR
- `npm run build`, `npm run lint`, `bun test src` gröna. Bundle gz (assets js+css) mot main i PR, uppdelat på huvudchunk och admin-chunk om det går.
- Ship notes: att «Spara i banken» nollställer «Behöver granskas» (befintligt) och att «Klar» utan ändring sparar en rad-uppställning.
- Ingen SQL, ingen ändring i `schema-57.sql`, ingen ny kolumn.
