# Slice 48 — Verification checklist

Status: **PROPOSED**. Raderna gäller ★-valen (A1 B1 C1 D1 E1 F1). Byt rader om Christoffer väljer annat.
Recept (PROJECT.md): `npm run build`, preview `--host 127.0.0.1 --port 4173`, HTTP 200 på `/traningsplaneringen/`. Driv som tränare med synliga svenska etiketter. 390×844 om inget annat står. Liggande rader: 844×390. DPR 2, touch.
Förberedelse: Planera pass → 7–9 år → Trampett → «Gymmix – Stora hallen» → 60 min. Passet har minst 3 Teknik-stationer.

## A — Hallöversikt utanför «Mer»
- [ ] AC1 I Passbyggaren syns «Kör passet», «Hallöversikt» och «Mer» på en rad. Alla tre är ≥44 px höga, och ingen text är avklippt.
- [ ] AC2 Ett tryck på «Hallöversikt» öppnar hallen. «Tillbaka till Passbyggaren» tar dig tillbaka.
- [ ] AC3 «Mer» innehåller inte «Hallöversikt».
- [ ] AC4 I ett tomt pass är «Hallöversikt» avstängd, och skärmläsaren läser upp förklaringen (`hall-cta-hint`).
- [ ] AC5 (844×390) «Hallöversikt» syns i raden, som idag.

## B — Ändra-läget
- [ ] AC6 Hallen visar «Ändra stationer». Ett tryck på den visar «Stationer i ordning» med en rad per Teknik-station, och knappen blir «Klar».
- [ ] AC7 Varje rad har nummer, namn, handtag, ↑, ↓ och «Ta bort», och alla mål är ≥44×44. ↑ är avstängd på första raden och ↓ på sista.
- [ ] AC8 «Klar» stänger listan och fokus hamnar på «Ändra stationer». Esc i listan gör samma sak.
- [ ] AC9 «Golvklart» stänger läget. Golvklart har varken «Ändra stationer» eller «Ta bort».
- [ ] AC10 Ändringarna finns kvar efter omladdning, utan att du behöver spara.

## C — Dra med fingret
- [ ] AC11 Touch: dra handtaget på rad 3 upp till plats 1. En linje visar var raden hamnar, och efter släpp är raden etta.
- [ ] AC12 Touch: sidan scrollar inte medan du drar i handtaget. Utanför handtaget scrollar listan som vanligt.
- [ ] AC13 Touch: dra en markör på planen till en ny plats. Den hamnar där du släpper (inom rutnätet). Ett kort tryck utan rörelse öppnar detaljvyn som förut.
- [ ] AC14 Touch: en markör som dras till brickan lyfts av från planen.
- [ ] AC15 Mus på dator: AC11 och AC13 fungerar likadant.
- [ ] AC16 Inget nytt beroende i `app/package.json`.

## D — En ordning
- [ ] AC17 Efter AC11 visar markörerna 1, 2, 3 i den nya ordningen, och flödespilarna (om de visas) följer den.
- [ ] AC18 Tillbaka i Passbyggaren har Teknik-blocket samma ordning.
- [ ] AC19 Golvklart och Förrådslista använder samma nummer.
- [ ] AC20 Markörerna står kvar på sina platser när du bara byter ordning.

## E — Lägga till och ta bort
- [ ] AC21 «Lägg till station» öppnar «Lägg till övning» med Teknik valt. När du väljer en övning stängs arket, och övningen står sist i listan och på en fri plats i hallen.
- [ ] AC22 «Ta bort» tar bort stationen ur passet och ur hallen, och «Borttagen · Ångra» visas i ca 5 s.
- [ ] AC23 «Ångra» återställer stationen, dess plats och ordningen. Därefter visas «Ångrat.».
- [ ] AC24 Om du gör en annan ändring innan «Ångra» försvinner Ångra-rutan (Slice 41-regeln).
- [ ] AC25 Utanför läget gör «Ta bort från hall» samma sak som idag och tar inte bort något ur passet.

## F — Nypa och liggande läge
- [ ] AC26 (iPhone, riktig enhet) Nyp i hallen. Zoomen följer fingrarna mellan 1× och 2×, och sidan zoomar inte. Fingrarna kan röra sig fram och tillbaka utan att det hoppar.
- [ ] AC27 (iPhone) En nypning som börjar under planen, i brickans reserverade yta, zoomar inte sidan.
- [ ] AC28 Zoom − / + fungerar som förut. `index.html`-viewport är oförändrad (`width=device-width, initial-scale=1.0`).
- [ ] AC29 (844×390) Öppna «Lägg till övning» och välj en övning. I detaljvyn går det att scrolla, och «Lägg till i valt block» och «Lägg till och ändra tid» går att nå och trycka på. Baslinjen var en knapp vid 488–528 px som inte gick att nå.
- [ ] AC30 (844×390) Listan i Biblioteket går att scrolla till sista övningen.
- [ ] AC31 (844×390) Hallen med ändra-läget öppet: «Klar» går att nå.
- [ ] AC32 (390×844) Detaljvyn, Dela och de kompakta arken ser ut som förut.

## Allmänt
- [ ] AC33 Sidfoten visar «Träningsplaneraren · Slice 48».
- [ ] AC34 `bun test src` grönt (245 plus de nya). `npm run build` och `npm run lint` gröna.
- [ ] AC35 Bundle: ändringen i index gz rapporteras mot 132,35 kB.
- [ ] AC36 Låsta termer oförändrade: Hallöversikt, Passbyggaren, Golvklart, Förrådslista, Redigera redskap.
