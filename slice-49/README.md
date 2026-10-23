# Slice 49 — Planera pass fyller passet

**App:** Träningsplaneraren  
**Status:** **LOCKED A1 B1 C1 D1 E1 F1** — låst av PO 2026-10-23 17:55 (Effort S, stående tillstånd). Öppna frågor: 2 → C1 (bara Planera pass), 3 → bara Frågor-vägen, 4 → texten behålls; 1 → tabellen A1 gäller, Christoffer kan justera minuterna i `data/wizardPaths.ts` senare. Ingen SQL. Bas: main @ c86175a. Gren: `slice-49-docs`.
**Effort:** **S** (se nedan).  
**Källa:** `/workspace/scout-drafts/2026-10-23-ideas.md` #1–#3 (godkända av Christoffer enligt PO) + Polish #5 (backlog 2026-10-13, «en Använd alla förslag»). Bilder i `evidence/` (Scout 2026-10-23, live Slice 48, 390×844).

## Varför

Du väljer 60, 90 eller 120 min i Planera pass, men passet blir alltid 53 min (`06-builder.png` «53 / 60», `10-builder-120.png` «53 / 120»). Kör passet visar «Kvar: 53 min» (`16-run.png`). I Hallöversikt står «3 stationer saknar redskap» och två knappar med samma text, «Använd alla förslag», där bara den ena sparar (`07-hall.png`). Förrådslista är tom (`13-forrad.png`). Överst i Använd mall står «Föreningens mallar» med «Föreningen har inga mallar än.» (`12-mall.png`).

**Vad tränaren får:** «Jag väljer 90 min och får ett pass på 90 min. Redskapen står redan på stationerna, och Förrådslista visar vad vi ska plocka fram. Jag ser bara mallar som finns.»

## Beslut som ändrar tidigare lås (ska in i decisions.md vid låsning)

- **Redskap fylls i automatiskt efter Planera pass.** Det är ett medvetet val som **ersätter Slice 29 F1/D4** («no Använd-alla-on-finish», D4 «Pre-place + also run Använd alla förslag» skjuts upp) och **Scout 2026-10-13 #1 / Slice 37** («Leave Använd alla förslag manual»). Kod i dag: `composeWizardSession` (`lib/wizard.ts:139`) kör bara `autoPlaceUnplaced`; redskap sparas först när du trycker «Använd alla förslag» (`HallBoard.tsx:416–422` → `applyAllSuggestedStationEquipment`, `lib/session.ts:278`).
- **Passlängden styr innehållet.** Ersätter **Slice 46 D1** («bara passlängden; förslaget är detsamma, 53 min») och Slice 46 AC10 (53/90 som väntat).

## Kod i dag (c86175a, läst — ingenting byggt)

- Förslaget: samling 3+3, uppvärmning 10, Teknik 3 × 6 (`WIZARD_TEKNIK_DURATION`, `data/wizardPaths.ts:94`), styrka 5+8, lek 6 = **53** för alla längder. `setSessionLength` (`lib/session.ts:81`) sparar bara `targetMinutes`.
- «Kvar: X min» (Slice 38) räknas från stegens tider, hela minuter uppåt (`lib/runPass.ts:103–109`). Den följer alltså passets summa utan ändring.
- Två knappar «Använd alla förslag»: (a) verktygsraden `HallBoard.tsx:611–628` sparar, och visar en död «Inga förslag att spara» när inget finns; (b) saknar-raden `HallBoard.tsx:639–658` (`hall-saknar-point-cta`) pekar bara på (a) och sparar inget.
- «Föreningens mallar»: `clubSectionVisible` (`components/ClubTemplates.tsx:35–37`) visar rubriken när `status === 'fresh'` även med noll mallar; tomtexten på rad 48–49. Admin har en egen sektion (`ClubAdminSection.tsx:47–51`) som inte berörs.

## A–F (★ = förslag)

### A. Hur fylls passlängden?
- **A1 ★** Fast tabell per längd och block, samma övningar som i dag (3 Teknik-stationer), längre tid per övning. Hela minuter. Summan blir exakt vald längd.

  | Block | 60 | 90 | 120 |
  |---|---|---|---|
  | Samling | 6 (3+3) | 6 (3+3) | 8 (4+4) |
  | Uppvärmning | 10 | 15 | 20 |
  | Teknik | 21 (3×7) | 36 (3×12) | 45 (3×15) |
  | Styrka | 15 (6+9) | 20 (8+12) | 27 (10+17) |
  | Lek | 8 | 13 | 20 |
  | **Summa** | **60** | **90** | **120** |

  Flera övningar i ett block delas efter dagens förhållande (styrka 5:8), avrundat med största rest så att blocket stämmer. Tabellen ligger i `data/wizardPaths.ts` och kan ändras utan ny logik.
- A2 Skala alla tider med faktorn längd/53 och avrunda. Enkelt, men uppvärmningen blir 23 min på 120 och siffrorna blir udda.
- A3 Scouts förslag: töj Teknik och Styrka med tak per övning, lägg sedan till övningar från banken efter fokus och ålder tills ±5 min. Fler stationer i hallen, mer kod (+150–300 B), svårare att testa.

### B. Om du byter längd i Passbyggaren efteråt
- **B1 ★** Inget ändras i passet, bara målet (som i dag). Det skalade passet gäller bara när Planera pass skapar det.
- B2 Byt tider enligt tabellen när längden ändras, med Ångra. Kan skriva över tider du själv ändrat.

### C. Var fylls redskapen i automatiskt?
- **C1 ★** Bara efter Planera pass (Frågor-vägen): `applyAllSuggestedStationEquipment` direkt efter `autoPlaceUnplaced` i `composeWizardSession`. Stationer utan förslag förblir tomma och syns i saknar-raden.
- C2 Även när du startar från mall (`clubTemplateToSession`/`cloneTemplate`, Slice 37) och vid «Lägg till station».
- C3 Ingen automatik; bara en knapp i Förrådslista (Scouts reserv).

### D. Polish #5 — en «Använd alla förslag»
- **D1 ★** Saknar-raden blir bara text («3 stationer saknar redskap»); knappen i raden (b) tas bort. Knappen i verktygsraden (a) finns kvar för mall, Tomt pass och nya stationer, och döljs helt när det inte finns något att spara (ingen «Inga förslag att spara»). Förrådslistas pekare finns kvar.
- D2 Behåll båda men låt raden spara direkt (två knappar som gör samma sak).
- D3 Ingen ändring nu.

### E. Föreningens mallar utan mallar
- **E1 ★** Visa sektionen bara när det finns minst en mall: `clubSectionVisible` → `club.items.length > 0`. Inget visas medan den laddar. Gäller MallSheet och mallsteget i Planera pass. Adminsidan oförändrad.
- E2 Visa en enrads rubrik längst ner i stället.

### F. Omfång, kod som försvinner, budget
- **F1 ★** A1–E1 enligt ovan, inga nya texter i appen, sidfot **Slice 49**. Död kod tas bort (se HANDOFF §5). Budget: +512 B gz mjukt; uppskattning **+100–200 B gz** (A1 ca +120–180, C1 ca +30, D1 ca −40 till −60, E1 ca −10).
- F2 Bara A och C nu; D och E senare.

## Effort

**S.** Två funktioner i `lib/` (tabell + avrundning, ett anrop), en rad i `ClubTemplates.tsx`, markup bort i `HallBoard.tsx`, tester uppdateras. Inga nya skärmar, ingen SQL.

## Öppna frågor

1. A1: stämmer tabellens minuter för er (t.ex. 15 min per Teknik-station på 120)?
2. C: ska mall-start också fylla redskap (C2), eller räcker Planera pass nu?
3. Mallsteget i Planera pass: får `targetMinutes` från en mall också styra tider, eller bara Frågor-vägen? Förslag: bara Frågor-vägen (mallen har sina egna tider).
4. D1: Kom igång-steget om redskap (Slice 25/26) säger fortfarande «Använd alla förslag». Behålls, eftersom knappen finns kvar i verktygsraden.

## Lokal kontroll

Bygga är inte tillåtet i den här uppgiften, och ingen befintlig `dist` för c86175a fanns på boxen. Polish #5 är därför kontrollerad i koden och mot Scouts bild `07-hall.png`, inte i en lokal förhandsvisning.
