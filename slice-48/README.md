# Slice 48 — Hallöversikt

**App:** Träningsplaneraren  
**Status:** **LÅST 2026-10-22 av Christoffer: A1 B1 C1 D1 E1 F1** (★-förslagen; C1 ca +1,3 kB gz godkänd). Ingen SQL. Bara dokumentation, ingen appkod. Bas: main @ e605b3f. Gren: `slice-48-docs`.
**Effort:** **M** (se nedan).  
**Källa:** `feedback/2026-10-17-christoffer.md` rad E: «48 Hallöversikt: visible outside Mer on mobile, edit mode (add/remove/drag&drop/reorder), touch drag, fix iPhone pinch.» Dessutom (PO): detaljvyn för en övning ska gå att använda i liggande läge, 844×390.

## Varför

På mobilen ligger Hallöversikt bara under «Mer». Stationerna kan bara flyttas på planen. Att lägga till, ta bort eller byta ordning kräver att du går tillbaka till Passbyggaren. Att dra med fingret fungerar inte. Att nypa för att zooma på en iPhone zoomar hela sidan eller stannar efter ett steg. I liggande läge går det inte att nå «Lägg till i valt block».

**Vad tränaren får:** «Jag når hallen direkt från passet. Jag trycker Ändra stationer, drar stationerna i den ordning vi kör, lägger till en och tar bort en, och trycker Klar. Siffrorna i hallen och i Passbyggaren stämmer.»

## Uppmätt idag (main @ e605b3f, `evidence/`)

Bygget är gjort från en `git archive`-kopia av e605b3f i `/tmp`, alltså inte i `app/`. Preview kördes på :4548 eftersom 4173 kan vara upptagen av andra agenter. Skript: `evidence/capture-48.mjs`. Mätvärden: `evidence/measurements.txt`.

| Var | 390×844 | 844×390 |
|---|---|---|
| Knappen «Hallöversikt» i Passbyggarens rad | `display:none` (export.css:1461). Den finns bara i «Mer» | Syns (≤768 px gäller inte) |
| «Mer» | Syns, 44 px | Ingen yta (0 px) |
| Detaljvyn `.modal.activity-detail` | Ark 0–776 px, `overflow:auto`. «Lägg till i valt block» vid 474–519 px. Går att nå | **Ark 16–552 px i en vy på 390 px, `overflow:visible`, inget max-height.** Knappen ligger vid 488–528 px och är **utanför skärmen. Det går inte att scrolla dit** (scrollHeight = clientHeight = 536) |
| Biblioteket (Lägg till övning) | Ark 68–844 px, listan scrollar inuti | Ligger i sidans flöde (inget ark), sidan scrollar |
| `<meta name="viewport">` | `width=device-width, initial-scale=1.0` | samma |

Bundle idag: index 132,35 kB gz, vendor (`dist-*.js`) 55,01 kB gz, CSS 13,9 kB gz.

## Orsaken till nypningen på iPhone (läst i koden)

Huvudorsak: **lyssnaren på nypningen kopplas loss och kopplas på igen under själva nypningen.**

- `HallCanvas.tsx:74–133` registrerar `touchstart` och `touchmove` (`passive:false`) i en `useEffect` med beroendet `[onViewZoomChange]` (rad 133).
- `HallBoard.tsx:233–235` skickar `handlePinchZoom` som en ny funktion vid varje render. Det finns ingen `useCallback` och ingen React Compiler i `package.json`.
- Första steget i nypningen anropar `setViewZoom`. Det ger en ny render och ett nytt `onViewZoomChange`, så effekten städar upp och sätter `pinchRef.current = null` (rad 131). Därefter kör den igen.
- Nästa `touchmove` hittar inget `pinchRef`. Den gör `return` **före** `e.preventDefault()`, och `touchstart` kommer inte igen eftersom fingrarna redan ligger kvar. iOS Safari tar då över gesten och zoomar hela sidan. Det märks som att hallen zoomar ett steg och sedan zoomar sidan.

Två saker gör det värre:

1. På telefon har `.hall-canvas-wrap` `padding-bottom: 14rem` (App.css:2452–2458) men ingen `touch-action`. En nypning som börjar där, eller på zoomraden, blir alltid sidzoom.
2. iOS skickar `gesturestart`/`gesturechange`, och ingen kod stoppar dem.

Viewport-meta är inte orsaken. Lägg inte till `user-scalable=no` eller `maximum-scale`. iOS bryr sig inte om dem, och de stänger zoomen för den som behöver den.

Om du vill bekräfta på en riktig iPhone: nyp i hallen. Före fixen hoppar zoomen ett steg och sedan zoomar sidan. Efter fixen följer zoomen fingrarna mellan 1× och 2×, och sidan står still. Chromium-emulering kan inte återskapa iOS-gester, så det här steget måste göras på enheten.

## Val (★ = Docs rekommendation)

### A — Var Hallöversikt syns på mobilen
- **A1 ★** Visa «Hallöversikt» i Passbyggarens rad på telefon, mellan «Kör passet» och «Mer», och ta bort den från «Mer». Ta bort `.builder-hall` ur regeln `display:none` (export.css:1459–1463). Ingen ny knapp och ingen ny text.
- A2 Behåll knappen i «Mer» och visa den också i raden. Det blir två vägar till samma sak.
- A3 En fast knapp längst ner på skärmen. Den tar yta från passet och krockar med Ångra-rutan.

### B — Ändra-läget: in och ut
- **B1 ★** Knappen «Ändra stationer» i hallens rubrikrad. Läget visar en lista «Stationer i ordning» under hallen, med drag­handtag, ↑ ↓ och «Ta bort» på varje rad, och «Lägg till station» sist. Du lämnar läget med «Klar». Allt sparas direkt, som idag. Golvklart stänger läget.
- B2 Inget särskilt läge: listan syns alltid. Den tar mer plats än hallen på 390×844.
- B3 Bara på planen: tryck länge på en markör för att få meny. Det är svårt att hitta och svårt att använda med tangentbord.

### C — Dra med fingret
- **C1 ★** Ett litet eget hjälpverktyg för Pointer Events (`lib/pointerDrag.ts`). Det används både för listan och för att flytta markörer på planen med fingret, med `setPointerCapture`, `touch-action:none` bara på handtaget eller markören och en tröskel på 6 px innan dragningen börjar. HTML5-dragningen i hallen tas bort (se dödkod). Inget nytt beroende: idag är det bara react, react-dom och supabase-js.
- C2 Pointer Events bara i listan. Planen behåller HTML5-dragning på dator och «Placera här» på telefon. Ger mindre kod, men markörerna går fortfarande inte att dra med fingret.
- C3 Ett bibliotek (t.ex. dnd-kit, ca 10 kB gz). Det spräcker budgeten och avråds.

### D — Ordningen i hallen och i Passbyggaren
- **D1 ★** En enda ordning. Stationsordningen i hallen *är* Teknik-blockets ordning (`item.order`). Att byta plats i listan skriver om Teknik-blocket, så siffrorna på markörerna, i Golvklart och i Förrådslista, och raden i Passbyggaren, följer med. Bara Teknik-stationer finns i listan (`placeableItems`, lib/hall.ts:137). Ordningen i hallen ändrar inte var markörerna står.
- D2 En egen ordning för hallen (`hallOrder`). Då blir siffrorna olika på olika ställen. Avråds.

### E — Lägga till och ta bort
- **E1 ★** «Lägg till station» öppnar samma ark som «Lägg till övning» (`LibraryPanel`), med filtret satt till Teknik. Det valda läggs sist i Teknik-blocket och placeras på en fri ruta med `autoPlaceUnplaced` (lib/hallSuggest.ts). «Ta bort» tar bort stationen **ur passet** och visar «Borttagen · Ångra» i ca 5 s, ett steg, som i Slice 41. Utanför läget gör «Ta bort från hall» samma sak som idag, det vill säga lyfter av markören.
- E2 «Ta bort» i läget lyfter bara av markören från planen. Då finns två knappar för samma sak och ingen väg att ta bort ur passet.

### F — Nypa på iPhone och liggande läge
- **F1 ★** Nypning: en stabil lyssnare. Funktionen ligger i en `ref`, effekten har `[]` som beroende, och `pinchRef` nollställs bara vid `touchend`/`touchcancel`. `gesturestart`/`gesturechange` stoppas med `preventDefault` på `.hall-canvas-wrap`. `touch-action: pan-x pan-y` sätts på hela `.hall-canvas-wrap`. Liggande läge: `@media (max-height: 500px)` ger `.modal` `max-height: calc(100svh - 16px)` och `overflow:auto`, och `.modal-backdrop` lägger arket överst (`align-items:start`). Då går «Lägg till i valt block» att nå i 844×390.
- F2 Bara nypningen. Liggande läge får en egen slice.
- F3 Ta bort nypningen och behåll bara − / +. Det blir minst kod, men tränarna har bett om nypningen.

## Effort: M
A och F är små CSS- och effektändringar. B–E är det mesta av arbetet: en lista, ett dragverktyg, en ordningsfunktion och Ångra i hallen.

## Filer
`HANDOFF.md` (för Builder) · `verification-checklist.md` (AC vid 390×844 och 844×390) · `content/microcopy.sv.md` · `evidence/` (skript, skärmbilder, mätvärden).

## Verifier
Feature-kartorna behöver uppdateras när slicen är låst och byggd. Se HANDOFF §12.

## Utanför
Fler hallar, ändra hallens rutnät, flytta stationer mellan block, Ångra i flera steg, ändringar i Golvklart utöver siffrorna.

## Öppna frågor till Christoffer
1. Ska «Ta bort» i ändra-läget ta bort stationen ur passet (E1) eller bara lyfta av den från hallen (E2)?
2. Ska en ny station ställa sig på en fri ruta direkt (E1) eller vänta i brickan tills du placerar den?
3. Räcker «Ändra stationer» / «Klar» som text, eller vill du ha något annat ord? «Redigera» används redan i det låsta «Redigera redskap».
4. Budget: C1 beräknas till ca +1,3 kB gz, vilket är över den mjuka gränsen på ca +512 B. Är det okej, eller vill du ha C2 (ca +0,8 kB)?
5. Ska ändra-läget också finnas på dator (>768 px)? Förslaget är ja, med samma lista.
