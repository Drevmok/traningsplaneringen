# Slice 30 — acceptance criteria + verification checklist (DRAFT · recommended A1/B3/C1/D1/E1/F1)

**Authority:** Overall PASS only if every AC below passes after Builder ships (adjust to the locked A–F).  
**Status:** DRAFT — Verifier runs only after Christoffer locks A–F + Docs ships + Builder ships + Planner ping.  
**Skill:** `verify-traningsplaneraren/` (Verifier adds feature map `features/bibliotek-ovningsimport.md`); rigor per `backlog/PSTACK-OPS.md`.  
**Fixtures:** `slice-30/content/example-import.json` (2 valid) · `slice-30/content/example-import-edge.json` (rules).  
**Republish:** not required unless Christoffer asks.

## Acceptance criteria (numbered, testable)

### Källa / source (F1)

| AC | Pass if |
|---|---|
| 1 | `Activity` has optional `source { url, creator, title?, startSeconds? }`; seeds and own drills may carry it |
| 2 | Exercise detail and the pass-row info panel show one quiet line **Källa: {creator} · {m:ss}** (no time part when `startSeconds` absent); drills without source show nothing |
| 3 | The line is a link to `source.url`, opens in a new tab with `rel="noopener noreferrer"`; only `https://` URLs render as links |
| 4 | No `<iframe>`, `<video>`, thumbnail or remote image anywhere for a source (grep + DOM check) |
| 5 | Källa is **not** shown on Golvklart, stationskort or Kör passet |
| 6 | Share link (`#dela=`) and pass JSON carry `source` for own drills in the pass; receiving device shows the same Källa line |

### Own exercises keep their fields (B · E1)

| AC | Pass if |
|---|---|
| 7 | Imported own drill keeps `defaultStationEquipment` (Teknik), `tags` (+`egen`), `difficulty`, `progressionOf`, `regressionOf`, `needsCoachReview`, `experiencedCoachOnly`, `source` after reload (localStorage round trip) |
| 8 | Editing an own drill via **Ändra** and saving preserves every field the form does not show (tags, difficulty, links, source, experienced) |
| 9 | Form shows a **Redskap** picker only when block = Teknik; chosen pieces save to `defaultStationEquipment`; switching block away from Teknik and saving clears it |
| 10 | Own Teknik drill with redskap: Redskap förslag + StationSketch appear in hall detail; **Använd förslag / Använd alla förslag** and zone suggestion (#4) use it |
| 11 | Own-exercise cap is **100** (101st save → `ownFull` text with 100); **Så gör du** still max 4 steps (form + floor tip validation unchanged) |
| 12 | Detail shows **Bygger på: {title}** / **Lättare variant av: {title}** when the linked id resolves (seed or own); unresolved links render nothing |

### Import (A1 · B3)

| AC | Pass if |
|---|---|
| 13 | Bibliotek shows **Importera övningar** next to **Ny egen övning**; opens a sheet with **Välj fil** + paste box + **Läs in** |
| 14 | `example-import.json` via file **and** via paste → preview lists 2 rows, both state **Ny**, default **Ta med**, with batch note on top |
| 15 | Nothing is written to localStorage before **Importera {n} övningar**; **Avbryt** leaves own list unchanged |
| 16 | After import: both drills appear in Bibliotek with **Egen** + **Behöver granskas**, filterable by block, addable to a pass |
| 17 | Bad JSON → `ownImportBad`; `schemaVersion: 2` → `ownImportNewer`; empty `exercises` → `ownImportEmpty`; a pass file → `ownImportIsPass` |
| 18 | Home **Hämta ett pass** given an exercise file/code shows `importIsExercises` (not the generic error) and does not replace the draft |
| 19 | Edge fixture: row 01 → importable, note *Okänt redskap togs bort: eq-ringar*, saved redskap = trampett only |
| 20 | Edge row 02 → importable, note *Högst fyra steg*, saved `howTo` has exactly 4 steps |
| 21 | Edge row 03 (no safety, strength) → **Kan inte importeras** with *Saknar säkerhet*; row 04 (dup id) → **Kan inte importeras**; row 07 (`BAD-ID`) → **Kan inte importeras** |
| 22 | Edge row 05 → **Samma namn finns redan** (Kullerbytta framåt), progression link dropped with note, source dropped with note (http) |
| 23 | Edge row 06 (warmup + kon) → importable, redskap dropped with note, **no** review badge (`needsCoachReview: false` honoured) |
| 24 | Re-importing `example-import.json` → both rows **Finns redan**, default **Hoppa över**; switching one to **Ersätt** updates that drill in place (same id; a pass using it shows the new text) |
| 25 | With 99 own drills, importing 2 → first row importable, second **Ingen plats**, counter **Plats för 1 till** |
| 26 | Over-long fields are clipped to own limits (title 80, summary/watchFor/safety 240, step 180) with note *Förkortad* |

### Behöver granskas (D1)

| AC | Pass if |
|---|---|
| 27 | Badge **Behöver granskas** shows on library card + detail for own drills with `needsCoachReview`; detail shows hint + **Markera som granskad** |
| 28 | **Markera som granskad** removes the badge (persists after reload); saving via **Ändra** also clears it |
| 29 | Badge never blocks adding to a pass and is **not** shown on seeds (Närvaro etc.), Golvklart, stationskort, Kör passet or print |

### Redskap library (C1)

| AC | Pass if |
|---|---|
| 30 | `EQUIPMENT_PIECES` has 15 pieces; new ids/labels exactly: `eq-kilmatta` Kilmatta · `eq-skumblock` Skumblock · `eq-bom` Bom · `eq-racke` Räcke · `eq-rockring` Rockring, appended after Kon |
| 31 | Each new piece has an icon (`EquipmentIcon`) in compose grid, detail list, stationskort and Förrådslista — no blank tiles |
| 32 | StationSketch draws each new piece; order per `content/redskap-library.md` (e.g. trampett → skumblock → landningsmatta) |
| 33 | Zone suggestion: kilmatta(+madrass) → Mattor; räcke(+landningsmatta) → Öppen yta; bom → Öppen yta; trampett+skumblock → Trampett (unit tests in `hallSuggest.test.ts`) |
| 34 | Förrådslista sums new pieces after Kon; owned toggles list 15 |
| 35 | Migration: a saved explicit owned list of the old 10 → after upgrade all 15 owned, "Visa bara övningar vi kan köra ikväll" does **not** turn on by itself; unticking a new piece sticks after reload |
| 36 | StationComposeSheet with 15 tiles fits 390 px without horizontal scroll |

### Seed path (B3) + preserve

| AC | Pass if |
|---|---|
| 37 | `content/seed-promotion.md` process exists and is linked from HANDOFF; no new seed drills required in this slice |
| 38 | Seed type accepts `source`; if any seed has one, it renders per AC 2–5 |
| 39 | Old share links / pass files without new fields still open; own drills from them still save |
| 40 | Hall: Teknik-only placements unchanged; caption **Schematisk hall — inte exakt mått** unchanged |
| 41 | Wizard (Slice 29), Soft blank, malls, Förråd/saknar/Använd alla, Kör passet, Ny vecka, egna mallar behave as before |
| 42 | Footer `Träningsplaneraren · Slice 30` |
| 43 | `npm run build` green; existing + new `node --test` suites green (`ownImport.test.ts`, extended `ownActivities` / `sharePass` / `hallSuggest` tests) |
| 44 | No in-app AI, API keys, network calls to YouTube/social, video embed, accounts or cloud added (grep `fetch(`, `iframe`, `youtube` in `app/src`) |

## Verifier checklist (smoke path)

1. Fresh profile → Passbyggaren → Bibliotek → **Importera övningar** → Välj fil `example-import.json` → 2 × Ny → Importera 2 övningar → toast.  
2. Card shows Egen + Behöver granskas → open detail: Källa: Prime Coaching Sport · 0:30 (link, new tab), Bygger på: Ljushopp…, sketch trampett → skumblock → landningsmatta.  
3. Add both to Teknik → Hallöversikt → auto-placed: Formhopp in Trampett zone, Äggrullning in Mattor → Använd alla förslag → Förrådslista lists Skumblock + Kilmatta after Kon.  
4. Markera som granskad on one → reload → badge gone; Ändra the other → save → badge gone, tags/source still there (export pass JSON and inspect).  
5. Paste edge fixture → check rows 01–07 per AC 19–23.  
6. Re-import example → Finns redan / Ersätt (AC 24).  
7. Seed 99 own drills (devtools script) → AC 25.  
8. Set old owned list (10 ids) in localStorage → reload → AC 35.  
9. Skicka till telefonen → open link in a 2nd profile → own drills with Källa arrive (AC 6).  
10. Home → Hämta ett pass → paste example → `importIsExercises` (AC 18).  
11. Wizard + Nytt pass + mall + Kör passet regression sweep; footer 30; build + tests.

## Fail if

- Anything is saved before **Importera**.  
- Video embedded, thumbnails stored, or any network call to YouTube/social from the app.  
- Seeds start showing review badges.  
- Unknown redskap ids survive into storage, or the 4-step floor rule is relaxed without E2 lock.  
- Tonight filter flips on after upgrade (migration missing).  
- Old share links break; build or tests red; footer not 30.  
- Verifier run before lock + Docs + Builder + Planner ping.
