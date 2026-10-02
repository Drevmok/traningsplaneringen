# Övningsimport — svensk Docs (Slice 30)

**Status:** Docs lock 2026-10-02. Christoffer låste A1 / B3 / C1 / D1 / E1 / F1. Builder får bygga från nycklarna längst ner.  
**Ton:** Varm, kort, tränare till tränare. *Du*. Lugn chrome.  
**Låsta termer:** gymnaster · pass · övning · egen övning · Bibliotek · Teknik · Redskap · Passbyggaren · Hallöversikt · Golvklart · Förrådslista · Redigera redskap · Starta från mall · Kom igång · Hämta ett pass  
**Hallens bildtext oförändrad:** **Schematisk hall — inte exakt mått**

Pack: [`slice-30/`](../slice-30/README.md) · nycklar: [`slice-30/content/microcopy.sv.md`](../slice-30/content/microcopy.sv.md) · schema: [`slice-30/content/import-schema.md`](../slice-30/content/import-schema.md) · redskap: [`slice-30/content/redskap-library.md`](../slice-30/content/redskap-library.md).  
Närliggande: [`station-compose.sv.md`](./station-compose.sv.md) · [`forradslista.sv.md`](./forradslista.sv.md) · [`ui-chrome.sv.md`](./ui-chrome.sv.md).

---

## Kort om Övningsimport

Du ser en bra övning i en video eller ett inlägg. Du skickar länken till Planner i chatten. Planner skriver övningen med egna ord i appens format och skickar tillbaka en fil eller en kod. Du importerar den i Biblioteket. Sedan finns övningen bland dina egna övningar, med redskap, skiss och en länk till källan.

Appen öppnar aldrig videon själv. Den behöver ingen nyckel, ingen inloggning och ingen AI.

---

## 1. Skicka en länk till Planner

1. Kopiera länken till videon eller inlägget.
2. Skicka den till Planner i chatten. Säg gärna vilka övningar du vill ha, eller ungefär var i videon de finns.
3. Planner skriver utkast och visar dem för dig i chatten. Säg till om något ska ändras.
4. När du är nöjd får du en `.json`-fil eller en kod att klistra in.

Det här steget sker helt utanför appen.

---

## 2. Importera i Biblioteket

1. Öppna **Passbyggaren** och gå till **Bibliotek**.
2. Tryck **Importera övningar** (bredvid **Ny egen övning**).
3. Tryck **Välj fil**, eller klistra in koden i rutan **Klistra in kod**.
4. Tryck **Läs in**. Nu ser du förhandsvisningen.
5. Välj **Ta med** eller **Hoppa över** för varje övning.
6. Tryck **Importera {n} övningar**.

Inget sparas förrän du trycker **Importera**. **Avbryt** stänger utan att ändra något.

Fick du en övningsfil men öppnade den under **Hämta ett pass** på startsidan? Då säger appen var den ska in. Ditt pass ligger kvar.

### Förhandsvisningen

Överst står ibland en kort rad från Planner om filen. Under den ser du hur många platser du har kvar: **Plats för {n} till**.

| Det står | Det betyder | Förval |
|---|---|---|
| **Ny** | Övningen finns inte hos dig. | Ta med |
| **Samma namn finns redan** | En övning med samma namn finns redan, men det är en annan övning. Tar du med den får du två med samma namn. | Ta med |
| **Finns redan** | Du har redan importerat just den här övningen. | Hoppa över. Välj **Ersätt** om du vill byta till den nya versionen. |
| **Kan inte importeras** | Något fattas eller har fel format. Skälet står under. | Går inte att välja |
| **Ingen plats** | Du har nått 100 egna övningar. | Går inte att välja |

Ibland står en liten grå rad under en övning. Den säger vad appen ändrade:

| Rad | Vad hände |
|---|---|
| Förkortad. | En text var för lång och kortades. |
| Högst fyra steg. Resten togs bort. | **Så gör du** har högst fyra steg. |
| Okänt redskap togs bort: … | Redskapet finns inte i appens lista. |
| Redskapen togs bort. De används bara i Teknik. | Redskap hör bara till Teknik-stationer. |
| Kopplingen till en annan övning togs bort. | Övningen den byggde på finns inte här. |
| Källan togs bort. Den behöver en https-länk och ett namn. | Länken till videon var ofullständig. |

---

## 3. Behöver granskas

Importerade övningar får märket **Behöver granskas** i Biblioteket och i övningsvyn. Det är en påminnelse: läs igenom texten och se att den passar er hall och era gymnaster.

- Tryck **Markera som granskad** i övningsvyn när du har läst. Märket försvinner.
- Ändrar du övningen (**Ändra → Spara övning**) räknas det också som granskad.
- Märket stoppar ingenting. Du kan lägga övningen i ett pass direkt.
- Märket syns inte på Golvklart, stationskort, Kör passet eller utskrift.
- Övningarna som följer med appen får aldrig märket.

---

## 4. Källa: vi länkar, vi kopierar inte

Varje importerad övning är skriven med **egna ord**. Den länkar till originalet:

**Källa: {kanal} · {tid}** (till exempel *Källa: Prime Coaching Sport · 0:50*)

- Raden är en länk. Den öppnar videon i en ny flik. Tiden visar var i videon övningen finns.
- Appen bäddar **aldrig** in videon och sparar inga bilder eller klipp ur den.
- Ingen text kopieras från videon, inte heller undertexter eller beskrivning.
- Källan följer med när du skickar passet till telefonen eller laddar ner det som fil.

Raden syns i övningsvyn och i tipsrutan på passraden. Den syns inte på Golvklart, stationskort eller Kör passet.

---

## 5. Dubbletter och gränser

- **Samma övning två gånger i filen:** den andra kan inte importeras.
- **Samma namn som en befintlig övning:** båda finns kvar om du tar med den. Byt namn med **Ändra** om det blir rörigt.
- **Finns redan:** **Ersätt** byter text i din egen övning. Pass som använder den visar den nya texten.
- **100 egna övningar** är max. När det är fullt står det *Du har 100 egna övningar. Ta bort en först.*
- **Så gör du** har högst **fyra steg**, precis som tidigare. Det håller korten korta på golvet.

Egna övningar sparas i den här webbläsaren, som utkasten. De som ligger i ett pass följer med när du skickar passet till telefonen eller laddar ner det som fil.

---

## 6. Fem nya redskap

Redskapslistan har nu 15 redskap. De nya ligger sist, efter Kon:

**Kilmatta · Skumblock · Bom · Räcke · Rockring**

De syns i **Redigera redskap**, i stationsskissen, på stationskorten och i **Förrådslista**. I **Vad finns i hallen ikväll?** är de ikryssade från start. Kryssa ur det ni inte har.

Det finns fortfarande inget fritt "eget redskap". **Bom** är ett redskap oavsett höjd; höjden står i övningstexten.

I formuläret för egen övning kan du välja redskap när blocket är **Teknik**: tryck **Välj redskap**.

---

## 7. Från egen övning till appens bank

En importerad övning blir först din egen, bara på din enhet. Övningar som fungerar bra kan senare läggas in i appens bank för alla tränare. Christoffer väljer, Planner förbereder och Builder lägger in dem (se [`seed-promotion.md`](../slice-30/content/seed-promotion.md)). Din egen kopia ligger kvar tills du tar bort den.

---

## Builder

### Låsta nycklar (spegel av `slice-30/content/microcopy.sv.md`)

**ny (Docs)** = nyckel som Docs lade till där packet behövde en sträng.

#### Bibliotek + importblad

| Key | Svenska |
|---|---|
| `ownImport` | Importera övningar |
| `ownImportAria` **ny (Docs)** | Importera övningar från en fil eller en kod |
| `ownImportTitle` | Importera övningar |
| `ownImportHint` | Välj filen eller klistra in koden du fick. Inget sparas förrän du trycker Importera. |
| `ownImportFile` | Välj fil |
| `ownImportPaste` | Klistra in kod |
| `ownImportRead` | Läs in |
| `ownImportCancel` | Avbryt |
| `ownImportCloseAria` **ny (Docs)** | Stäng importen utan att spara |

#### Fel på filnivå

| Key | Svenska |
|---|---|
| `ownImportBad` | Filen eller koden gick inte att läsa. |
| `ownImportNewer` | Filen kommer från en nyare version av appen. Uppdatera appen och försök igen. |
| `ownImportEmpty` | Det finns inga övningar i filen. |
| `ownImportIsPass` | Det här är ett pass. Öppna det under Hämta ett pass på startsidan. |
| `importIsExercises` | Det här är övningar. Importera dem under Bibliotek → Importera övningar. |

#### Förhandsvisning

| Key | Svenska |
|---|---|
| `ownImportRoom` | Plats för {n} till |
| `ownImportRoomNone` **ny (Docs)** | Du har redan 100 egna övningar. Ta bort några för att importera fler. |
| `ownImportInclude` | Ta med |
| `ownImportSkip` | Hoppa över |
| `ownImportReplace` | Ersätt |
| `ownImportChoiceAria` **ny (Docs)** | Välj vad som händer med {title} |
| `ownImportStateNew` | Ny |
| `ownImportStateSameName` | Samma namn finns redan |
| `ownImportStateExists` | Finns redan |
| `ownImportStateInvalid` | Kan inte importeras |
| `ownImportStateNoRoom` | Ingen plats |
| `ownImportNoteClipped` | Förkortad. |
| `ownImportNoteSteps` | Högst fyra steg. Resten togs bort. |
| `ownImportNoteUnknownPiece` | Okänt redskap togs bort: {list} |
| `ownImportNoteNotTeknik` | Redskapen togs bort. De används bara i Teknik. |
| `ownImportNoteLink` | Kopplingen till en annan övning togs bort. |
| `ownImportNoteSource` | Källan togs bort. Den behöver en https-länk och ett namn. |
| `ownImportNoteDupId` | Samma övning finns två gånger i filen. |
| `ownImportNoteBadFormat` | Övningen har fel format. |
| `ownImportNoteMissing` | Saknar {fält}. (namn · varför · så gör du · se upp för · säkerhet) |
| `ownImportNoteSameName` **ny (Docs)** | Tar du med den får du två övningar med samma namn. |
| `ownImportNoteExists` **ny (Docs)** | Ersätt skriver över din version. Pass som använder övningen får den nya texten. |
| `ownImportConfirm` | Importera {n} övningar |
| `ownImportConfirmOne` | Importera 1 övning |
| `ownImportConfirmNone` **ny (Docs)** | Välj minst en övning först |
| `ownImportDone` | {n} övningar importerade. Läs igenom dem före passet. |
| `ownImportDoneOne` | 1 övning importerad. Läs igenom den före passet. |

#### Granskning, Källa, progression

| Key | Svenska |
|---|---|
| `ownNeedsReview` | Behöver granskas |
| `ownNeedsReviewHint` | Importerad övning. Läs igenom den och ändra så att den passar er hall. |
| `ownMarkReviewed` | Markera som granskad |
| `ownMarkReviewedAria` **ny (Docs)** | Markera {title} som granskad |
| `ownReviewedToast` | Markerad som granskad. |
| `sourceLabel` | Källa |
| `sourceLine` | Källa: {creator} |
| `sourceLineAt` | Källa: {creator} · {time} |
| `sourceAria` | Öppna videon hos {creator} i en ny flik |
| `sourceAriaTitled` **ny (Docs)** | Öppna ”{title}” hos {creator} i en ny flik |
| `progressionOfLabel` | Bygger på |
| `regressionOfLabel` | Lättare variant av |

#### Formulär, redskap, chrome

| Key | Svenska |
|---|---|
| `ownEquipment` | Redskap |
| `ownEquipmentHint` | Förslag till stationen. Bara i Teknik. |
| `ownEquipmentPick` | Välj redskap |
| `ownEquipmentNone` | Inga redskap valda. |
| `ownFull` | Du har 100 egna övningar. Ta bort en först. |
| `ownStepsHint` | Ett steg per rad. Högst fyra. (oförändrad) |
| `eq-kilmatta` | Kilmatta |
| `eq-skumblock` | Skumblock |
| `eq-bom` | Bom |
| `eq-racke` | Räcke |
| `eq-rockring` | Rockring |
| `footerSliceLabel` | Träningsplaneraren · Slice 30 |

### Vad Builder kopplar

- Alla nycklar ovan i `UI` (`blockMeta.ts`); `ownFull` 40 → 100; footer → Slice 30.
- **Importera övningar** bredvid **Ny egen övning**; bladet med Välj fil, Klistra in kod, Läs in, förhandsvisning, radval och en enda skrivning vid **Importera {n} övningar**.
- Felorsak → nyckel: `bad` → `ownImportBad` · `newer` → `ownImportNewer` · `empty` → `ownImportEmpty` · `isPass` → `ownImportIsPass`. Home **Hämta ett pass** med övningsfil → `importIsExercises`.
- Radnoter: stegbortfall → `ownImportNoteSteps`; textklippning → `ownImportNoteClipped`; ogiltigt id / blockType / minuter → `ownImportNoteBadFormat`; saknade fält → `ownImportNoteMissing` med fältnamn i gemener.
- Märket **Behöver granskas** bara när `own && needsCoachReview`; hint + **Markera som granskad** i övningsvyn; spara via Ändra rensar.
- Källa-raden: `sourceLineAt` när `startSeconds` finns, annars `sourceLine`; `https://` bara; ny flik med `rel="noopener noreferrer"`; ↗ är dekor (`aria-hidden`).
- Redskapsväljaren i formuläret: bara när Block = Teknik; återanvänd rutnätet från Redigera redskap med titeln **Välj redskap** och `composeDone` **Klar**.
- Toasts med `role="status"`: `ownImportDone(One)`, `ownReviewedToast`, befintliga `ownSaved`.

### Vad Docs inte äger

- Schemavalidering och regler (`import-schema.md`, `ownImport.ts`, `check_import.py`): fältnamn, gränser, radstatus.
- Seed-promotion (`seed-promotion.md`): promote-filer, seed-id, PR-flöde.
- Skisser, ikoner, zoner, sparning och migreringen av "Vad finns i hallen ikväll?".

---

## Rör inte (Slice 22–29)

Ändra inte strängarna eller beteendet i:

- **Slice 22** tystare chrome: Tips om placering · Dölj tips · Visa steg · Dölj steg — [`copy-quieter-chrome.sv.md`](./copy-quieter-chrome.sv.md)
- **Slice 23** Hem: Hallöversikt / Golvklart som sekundära knappar, Öppna på telefon — [`copy-home-polish.sv.md`](./copy-home-polish.sv.md)
- **Slice 24** Förrådslista tom → Använd alla förslag på hallen — [`forrad-empty-soft-path.sv.md`](./forrad-empty-soft-path.sv.md)
- **Slice 25** {n} stationer saknar redskap — [`saknar-redskap-banner.sv.md`](./saknar-redskap-banner.sv.md)
- **Slice 26** Kom igång, placeringssteget — [`kom-igang-place-step.sv.md`](./kom-igang-place-step.sv.md)
- **Slice 27** Soft Samling i Nytt pass — [`soft-samling.sv.md`](./soft-samling.sv.md)
- **Slice 28** Mall-Samling inom budget — [`mall-samling-budget.sv.md`](./mall-samling-budget.sv.md)
- **Slice 29** Planera pass, tre frågor, Nytt pass och Starta från mall som sekundära — [`home-wizard.sv.md`](./home-wizard.sv.md)

Också oförändrat: de tio första redskapsnamnen (Trampett … Kon) och deras ordning, `ownStepsHint`, Golvklart, stationskort, Kör passet och bildtexten **Schematisk hall — inte exakt mått**.

---

## Skicka inte

- Text om AI i appen, API-nycklar, YouTube-inloggning, inbäddad video, miniatyrbilder, moln eller konton.
- Ordet "Planner" i appens gränssnitt.
- Ett fritt fält för "Övrigt" eller "eget redskap".
- `#importera=`-länkar.
