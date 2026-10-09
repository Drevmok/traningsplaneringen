# UI-chrome — Builder (svenska)

Kort ordlista för Träningsplanerarens gränssnitt. Inga nya funktioner — bara svenska etiketter för det som redan finns i Slice 01.

**Arbetsnamn i UI:** Träningsplaneraren  
**Stub-etikett:** Utkast  
**Intern flagga:** Behöver tränargranskning (`needsCoachReview`)

**Terminologi (låst av Christoffer):** använd **gymnaster** (inte aktiva/elever) och **pass** (inte session) i all Slice 01-svenska. Engelska lånord i gymmet (hollow, jumping jacks m.m.) får vara kvar.

---

## Ordlista

| English key / concept | Swedish |
| --- | --- |
| App / product name (working UI) | Träningsplaneraren |
| Home | Startsida |
| New session | Nytt pass |
| Browse templates | Bläddra bland mallar |
| Plan your first session | Planera ditt första pass |
| Empty home body (invite) | Börja med en mall eller skapa ett tomt pass. Du kan alltid ändra senare. |
| Gathering (block) | Samling |
| Warm-up (block) | Uppvärmning |
| Techniques (block) | Teknik |
| Strength (block) | Styrka |
| Fun and games (block) | Lek och spel |
| Session builder | Passbyggaren |
| Save draft | Spara utkast |
| Use template | Använd mall |
| Export / share (stub) | Exportera / dela |
| Coming soon | Kommer snart |
| Total time | Total tid |
| min (minutes abbreviation) | min |
| Add activity | Lägg till övning |
| Browse ideas | Bläddra bland idéer |
| Library | Bibliotek |
| Tips | Tips |
| Templates | Mallar |
| Search | Sök |
| Filters | Filter |
| Soft mismatch banner | Den här övningen används vanligtvis i {intendedBlock}. Du kan ändå lägga till den här. |
| Stub label | Utkast |
| needsCoachReview (internal UI label) | Behöver tränargranskning |
| Replace session — title | Ersätta det här passet? |
| Replace session — body | Om du börjar från en mall ersätts blocken och övningarna du har nu. Dina sparade utkast finns kvar. |
| Replace session — confirm | Använd mall |
| Replace session — cancel | Fortsätt redigera |
| Summary (section) | Sammanfattning |
| How to (section) | Så gör du |
| Watch for (section) | Se upp för |
| Add to current block | Lägg till i valt block |
| Add and edit duration | Lägg till och ändra tid |
| Top bar help | Ny som tränare? Börja från en mall |
| Difficulty: intro | Intro |
| Difficulty: easy | Lätt |
| Difficulty: medium | Medel |
| Difficulty: hard | Svår |
| targetLevel: new_coach_safe | Trygg för nya tränare |
| targetLevel: beginner | Nybörjare |
| targetLevel: intermediate | Medel |

---

## Korta anteckningar

- Blocknamnen ovan är låsta: använd **Samling**, **Uppvärmning**, **Teknik**, **Styrka**, **Lek och spel**.
- Datamodellens enum-värden (`gathering`, `warmup`, `techniques`, `strength`, `fun_and_games`, `intro`/`easy`/`medium`/`hard`) behålls på engelska i data; tabellen är bara UI-text.
- **Utkast** (inte ”Provisorisk”) för stub-etiketten.
- Exportera / dela får visa **Kommer snart** tills funktionen finns.
- Inga nya skärmar eller flöden här — bara chrome-copy.

---

## Hallöversikt (Slice 05)

Full microcopy: [`hall-oversikt-copy.sv.md`](./hall-oversikt-copy.sv.md) (also under `slice-05/content/`).

| Key | Swedish |
| --- | --- |
| Hall overview (CTA) | Hallöversikt |
| Back to builder | Tillbaka till Passbyggaren |
| Unplaced tray | Ej placerade |
| Disabled CTA tooltip | Lägg till minst en övning först |
| Schematic caption | Schematisk hall — inte exakt mått |

---

## Hallayout & snap (Slice 06)

Full microcopy: [`hall-presets-copy.sv.md`](./hall-presets-copy.sv.md) (also under `slice-06/content/`).

| Key | Swedish |
| --- | --- |
| Hall layout picker | Hallayout |
| Preset: standard | Standard trupp |
| Preset: competition lines | Tävling / linjer |
| Preset: small hall | Liten hall |
| New zone | Mattberg |
| Snap hint | Släpp på en zon för att fästa övningen där. På öppen yta kan du placera fritt. |

---

## Golvklart & flöde (Slice 07)

Full microcopy: [`golvklart-copy.sv.md`](./golvklart-copy.sv.md) (also under `slice-07/content/`).

| Key | Swedish |
| --- | --- |
| Floor-ready mode | Golvklart |
| Exit floor mode | Avsluta golvklart |
| Show / hide flow | Visa flöde / Dölj flöde |
| Print | Skriv ut |
| Station order hint | Stationsordning följer passet |
| Unplaced banner | {n} övningar ej placerade |

---

## Kom igång & tips (Slice 09)

Full microcopy: [`coach-tips.sv.md`](./coach-tips.sv.md) (also under `slice-09/content/`).

| Key | Swedish |
| --- | --- |
| Checklist title | Kom igång |
| Show tips again | Visa tips igen |
| Dismiss tip | Dölj tips |
| Dismiss checklist | Dölj Kom igång |

---

## Distribution & utkast (Slice 10)

Full microcopy: [`distribution-copy.sv.md`](./distribution-copy.sv.md) (also under `slice-10/content/`).

| Key | Swedish |
| --- | --- |
| Honesty title | Utkastet stannar i den här webbläsaren |
| Honesty short | Sparas lokalt i webbläsaren — inte i molnet. |
| Om utkast (footer) | Om utkast |
| Öppna på telefon | Öppna på telefon |
| Footer | Träningsplaneraren · Slice 10 |

---

## Hallöversikt declutter (Slice 11)

Full microcopy: [`hall-declutter.sv.md`](./hall-declutter.sv.md) (also under `slice-11/content/`).

| Key | Swedish |
| --- | --- |
| Stations-only hint | Endast Teknik-stationer placeras på hallen… |
| Empty no Teknik | Inga Teknik-stationer ännu |
| Tray empty | Alla Teknik-stationer är placerade. |
| Unplaced banner | {n} stationer ej placerade |
| Footer | Träningsplaneraren · Slice 11 |

---

## Stationmarkörer (Slice 12)

Full microcopy: [`station-tiles.sv.md`](./station-tiles.sv.md) (also under `slice-12/content/`).

| Key | Swedish |
| --- | --- |
| Tile hint | Stationerna visas som små markörer på hallen. Tryck på en för detaljer. |
| Detail close | Stäng |
| Footer | Träningsplaneraren · Slice 12 |

---

## Redskap / stationsuppsättning (Slice 13)

Full microcopy: [`station-compose.sv.md`](./station-compose.sv.md) (also under `slice-13/content/`).

| Key | Swedish |
| --- | --- |
| Detail CTA / sheet | Redigera redskap |
| Section | Redskap |
| Empty | Inga redskap angivna ännu. |
| Footer | Träningsplaneraren · Slice 13 |
| Library (10) | Trampett · Satsbräda · Plint · Landningsmatta · Tumblingmatta · Madrass · Mattberg · Flickiskudde · Airtrack · Kon |
| Library +5 (Slice 30) | Kilmatta · Skumblock · Bom · Räcke · Rockring (after Kon) — [`ovningsimport.sv.md`](./ovningsimport.sv.md) |

---

## Golvklart redskap (Slice 14) + short titles (Slice 17)

Full microcopy: [`golvklart-redskap.sv.md`](./golvklart-redskap.sv.md) (also under `slice-14/content/`).

| Key | Swedish |
| --- | --- |
| Count > 1 | {n}× {label} |
| Count === 1 | {label} |
| Optional tip | Under siffrorna syns redskapen ni angett… |
| Short titles | Golvklart screen + print; edit canvas hidden — [`golvklart-short-titles.sv.md`](./golvklart-short-titles.sv.md) |
| Footer | Träningsplaneraren · Slice 17 when Slice 17 ships |

---

## Använd alla förslag (Slice 19)

Full microcopy: [`anvand-alla-forslag.sv.md`](./anvand-alla-forslag.sv.md) (also under `slice-19/content/`).

| Key | Swedish |
| --- | --- |
| CTA | Använd alla förslag |
| Result (N>1) | Sparade redskap på {n} stationer |
| Result (N=1) | Sparade redskap på 1 station |
| Disabled / N=0 | Inga stationer med osparade förslag / Inga osparade förslag just nu. |
| Placement | Hallöversikt **edit** only |
| Footer | Träningsplaneraren · Slice 19 |

---

## Dirty Stäng + canvas remove (Slice 20)

Full microcopy: [`dirty-stang.sv.md`](./dirty-stang.sv.md) (also under `slice-20/content/`).

| Key | Swedish |
| --- | --- |
| Dirty body | Du har osparade ändringar. |
| Discard | Stäng utan att spara |
| Keep editing | Fortsätt redigera |
| Canvas remove aria | Ta bort från hall (`hallRemove`) |
| Footer | Träningsplaneraren · Slice 20 |

---

## Phone tray (Slice 21)

Full microcopy: [`hall-phone-chrome.sv.md`](./hall-phone-chrome.sv.md) (also under `slice-21/content/`).

| Key | Swedish |
| --- | --- |
| Expand | Visa stationsbricka |
| Collapse | Dölj bricka |
| Compact count | Ej placerade ({n}) — reuse `hallUnplacedWithCount` |
| Footer | Träningsplaneraren · Slice 21 |

---

## Quieter chrome (Slice 22)

Full microcopy: [`copy-quieter-chrome.sv.md`](./copy-quieter-chrome.sv.md) (also under `slice-22/content/`).

| Key | Swedish |
| --- | --- |
| Hall info | Tips om placering |
| Hall info aria | Visa tips om hur du placerar Teknik-stationer |
| Hall hide tips | Dölj tips |
| Kom igång expand | Visa steg |
| Kom igång collapse | Dölj steg |
| Footer | Träningsplaneraren · Slice 22 |

---

## Home polish (Slice 23)

Full microcopy: [`copy-home-polish.sv.md`](./copy-home-polish.sv.md) (also under `slice-23/content/`). Distribution living: [`distribution-copy.sv.md`](./distribution-copy.sv.md).

| Key | Swedish |
| --- | --- |
| Home Hallöversikt CTA | Hallöversikt |
| Home Hallöversikt aria | Öppna Hallöversikt från Hem |
| Home Golvklart CTA | Golvklart |
| Home Golvklart aria | Öppna Golvklart från Hem |
| Öppna på telefon | Öppna på telefon |
| Phone URL line (host-swappable) | https://drevmok.github.io/traningsplaneringen/ |
| Footer | Träningsplaneraren · Slice 23 |

Secondary CTAs when `draftExists` only; phone block always near honesty. No Förråd empty / saknar / tip-strip invent.

---

## Förråd tom → Använd alla förslag (Slice 24)

Full microcopy: [`forrad-empty-soft-path.sv.md`](./forrad-empty-soft-path.sv.md) (also under `slice-24/content/`). Living Förråd: [`forradslista.sv.md`](./forradslista.sv.md). Apply-all: [`anvand-alla-forslag.sv.md`](./anvand-alla-forslag.sv.md).

| Key | Swedish |
| --- | --- |
| Soft empty hint | Det finns osparade förslag. Stäng och tryck Använd alla förslag — då syns redskapen i Förrådslista. |
| Soft CTA | Använd alla förslag på hallen |
| Soft CTA aria | Stäng Förrådslista och visa Använd alla förslag på Hallöversikt. Sparar inte automatiskt. |
| Soft toast (optional) | Tryck Använd alla förslag för att spara. |
| Gate | Empty Förråd **and** `eligibleSuggestedCount ≥ 1` |
| Behavior | Close → Hall edit → point at **Använd alla förslag**; **no** auto-apply; **no** compose from Förråd |
| Footer | Träningsplaneraren · Slice 24 |

---

## Soft saknar redskap (Slice 25)

Full microcopy: [`saknar-redskap-banner.sv.md`](./saknar-redskap-banner.sv.md) (also under `slice-25/content/`). Hall: [`hall-oversikt-copy.sv.md`](./hall-oversikt-copy.sv.md). Apply-all: [`anvand-alla-forslag.sv.md`](./anvand-alla-forslag.sv.md).

| Key | Swedish |
| --- | --- |
| Banner (N>1) | {n} stationer saknar redskap |
| Banner (N=1) | 1 station saknar redskap |
| Optional point-CTA | Använd alla förslag |
| Point-CTA aria | Visa Använd alla förslag. Sparar inte automatiskt. |
| Gate | Hall **edit**; missing unset/`[]` ≥1; CTA only if `eligibleSuggestedCount ≥ 1` |
| Behavior | Soft `role="status"`; point at apply-all; **no** auto-apply; hide on Golvklart |
| Footer | Träningsplaneraren · Slice 25 |

---

## Soft Samling (Slice 27)

Full microcopy: [`soft-samling.sv.md`](./soft-samling.sv.md) (also under `slice-27/content/`). Seed library: [`slice-03-seed-activities.sv.md`](./slice-03-seed-activities.sv.md). Empty tip: [`slice-01-empty-states.sv.md`](./slice-01-empty-states.sv.md).

| Key | Swedish |
| --- | --- |
| Soft pair (blank Nytt pass) | Närvaro (`gather-narvaro`, 3) + Dagens pass — snabb genomgång (`gather-dagens-teknik`, 3) |
| Seed retitle id | `gather-dagens-teknik` (**same id** — no new seed) |
| `EMPTY_TIPS.gathering.tip` | Få allas uppmärksamhet — gärna med upprop och en kort genomgång av passet — innan ni börjar med färdigheter. |
| `EMPTY_TIPS.gathering.addLabel` | Lägg till din första samlingsövning (**unchanged**) |
| `BLOCK_BUDGETS.gathering` | **6** (was 5) — Builder D2 |
| Inject | Blank **Nytt pass** only; Soft inject path unchanged |
| Footer (Slice 27 ship) | Träningsplaneraren · Slice 27 |

No hard-lock UI. No hall copy. Soft = editable. Kom igång `addActivities` auto-check from soft items = intentional.

**Slice 28:** Beginner **mall** Samling authored to Soft pair (within budget 6) — [`mall-samling-budget.sv.md`](./mall-samling-budget.sv.md). Soft blank inject stays blank-only.

---

## Mall Samling within budget (Slice 28)

Full lock: [`mall-samling-budget.sv.md`](./mall-samling-budget.sv.md) (also under `slice-28/content/`). Soft blank: [`soft-samling.sv.md`](./soft-samling.sv.md).

| Key | Swedish / rule |
| --- | --- |
| Nybörjare mall Samling (A1) | Närvaro (`gather-narvaro`, 3) + Dagens pass — snabb genomgång (`gather-dagens-teknik`, 3) = **6 / 6** |
| Short mall (B1) | Välkomstcheck-in 5 — leave alone |
| `BLOCK_BUDGETS.gathering` | **6** (unchanged) |
| Library | Välkomstcheck-in remains; not beginner mall default |
| Seed retitle | **None** (D1 — Slice 27 already) |
| Footer | Träningsplaneraren · Slice 28 |

No Home/wizard/hall copy. No Soft blank inject change.

---

## Home 3-question wizard (Slice 29)

Full lock: [`home-wizard.sv.md`](./home-wizard.sv.md) (also under `slice-29/content/`). Home polish secondary: [`copy-home-polish.sv.md`](./copy-home-polish.sv.md). Soft blank: [`soft-samling.sv.md`](./soft-samling.sv.md). Mall budget: [`mall-samling-budget.sv.md`](./mall-samling-budget.sv.md).

| Key | Swedish |
| --- | --- |
| Primary CTA | Planera pass |
| Primary desc | Tre frågor — färdigt pass med stationer på hallen. |
| Finish CTA | Skapa pass |
| Step progress | Fråga {n} av 3 |
| Q1 options | 4–6 år · 7–9 år · Nybörjare · Träning |
| Q2 options | Satsbräda · Trampett · Tumbling · Blandat |
| Q3 presets | Standard trupp · Tävling / linjer · Liten hall |
| Focus honesty | Stationerna är förslag för ditt valda fokus. Andra zoner kan vara tomma — det är ok. |
| Escapes (secondary) | Nytt pass · Starta från mall |
| Footer | Träningsplaneraren · Slice 29 |

Wizard = primary Home start. Soft blank + malls remain escapes. Slice 23 Hall/Golvklart when `draftExists` unchanged. Teknik-only pre-place; empty non-focus zones OK.

---

## Övningsimport (Slice 30)

Full lock: [`ovningsimport.sv.md`](./ovningsimport.sv.md) (keys also in `slice-30/content/microcopy.sv.md`).

| Key | Swedish |
| --- | --- |
| Bibliotek CTA | Importera övningar |
| Confirm | Importera {n} övningar · Importera 1 övning |
| Review badge | Behöver granskas |
| Review action | Markera som granskad |
| Källa | Källa: {creator} · {time} |
| Redskap +5 | Kilmatta · Skumblock · Bom · Räcke · Rockring |
| Own cap | Du har 100 egna övningar. Ta bort en först. |
| Footer | Träningsplaneraren · Slice 30 |

---

## Delad övningsbank (Slice 31)

Full lock: [`delad-bank.sv.md`](./delad-bank.sv.md) (keys also in `slice-31/content/microcopy.sv.md`).

| Key | Swedish |
| --- | --- |
| Bibliotek, grå rad (`bankStale`) | Visar sparade övningar. Du kan planera som vanligt. |
| Footer | Träningsplaneraren · Slice 31 |

**Slice 34 (2026-10-09):** Kör passet — kort ton vid 00:00 och raden «Nästa: …» / «Sista aktiviteten» under klockan. Se [`slice-34/`](../slice-34/README.md).
