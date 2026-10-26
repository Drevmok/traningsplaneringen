# Slice 53 — Auto-spara + Teknikmarkörer (det som återstår)

**App:** Träningsplaneraren  
**Status:** **FÖRESLAGEN** — inget låst. Docs-paket, ingen appkod. Gren `slice-53-docs` från `origin/main` @ `7bf99cd` (efter Slice 52).  
**Effort:** **S** (★-vägen), se nedan.  
**Källa:** `backlog/IMPROVEMENTS.md` Scout polish 2026-10-13 #1 och #2 (Approved), Christoffer 2026-10-26 «Hellre polish / produkt», «Båda i samma slice».

## Viktigt först: båda idéerna finns redan i appen

Jag har läst koden på `main` @ `7bf99cd`. Båda önskemålen är redan byggda och ute:

| Önskemål | Var det byggdes | Så fungerar det i dag |
|---|---|---|
| #1 Spara passet automatiskt, ersätt knappen med «Sparat» | **Slice 39** | `lib/useAutosave.ts`: varje ändring skrivs ca 800 ms efter senaste ändringen, och direkt när du går hem, öppnar Hallöversikt eller Kör passet och när fliken göms (`pagehide` / `visibilitychange`). «Spara utkast» är borttagen. Passbyggaren visar «Sparat», eller «Inte sparat» om skrivningen misslyckas (`SessionBuilder.tsx:567–571`, `blockMeta.ts:181–182`). Pass från mall, Planera pass och import sparas direkt när de skapas. |
| #2 Sprid ut Teknikmarkörer i öppen yta | **Slice 40** | `lib/hall.ts:311–358` + `lib/hallSuggest.ts:86–98`: i hallar med bara Öppen yta får varje ny markör första lediga ruta i ett fast rutnät, i passets ordning. Redan placerade markörer flyttas aldrig. |

Båda appens hallar (`data/hallPresets.ts`: «Gymmix – Stora hallen», «Gymmix – Grophallen») har bara Öppen yta, så rutnätet gäller överallt. Den äldre förskjutningen på 0,035 (`offsetFromSlot`) används inte av någon hall i dag.

Backloggens lista **Approved** visar fortfarande punkterna 1–5 från 2026-10-13 som ej byggda. De är byggda i Slice 39–43 (Spara automatiskt, Teknikmarkörer, Ångra, Rätt tips, Hela hallen syns direkt). Listan behöver städas (öppen fråga 1).

Det här paketet bygger alltså **inte om** något. Det beskriver de små luckor som finns kvar och låter PO välja mellan att göra dem eller stänga punkterna.

## Vad som återstår mot Scout #1/#2

Läst i koden, inte kört i webbläsare (bygge och förhandsvisning ingick inte i uppgiften):

1. **«Sparat» syns inte i Hallöversikt.** Autosparningen är aktiv där (`App.tsx:78`, `view === 'hall'`), men statusen skickas bara till Passbyggaren (`App.tsx:409`). Flyttar du en markör eller ändrar redskap ser du ingen bekräftelse. Misslyckas skrivningen i Hallöversikt märks det inte förrän du går tillbaka till Passbyggaren.
2. **«Sparat ✓» med bock.** Scout föreslog «Sparat ✓». Slice 39 B1 valde «Sparat» utan bock. Ren textfråga.
3. **Fullt rutnät.** Stora hallen har 12 rutor (4 × 3), Grophallen 9 (3 × 3). Fler Teknikstationer än så hamnar på rutan med minst överlapp, och kan då ligga exakt på en annan markör (`pickOpenCell`, `hall.ts:345–358`). Planera pass ger 3 Teknikstationer, så det händer bara i stora egna pass.

## Vad tränaren får (★-vägen)

«Jag flyttar en station i hallen och ser att det är sparat. Även med många stationer ser jag varje markör.»

## A–F (★ = förslag)

### A. «Sparat» i Hallöversikt
- **A1 ★** Samma tysta text «Sparat» / «Inte sparat» i Hallöversikts verktygsrad. Skicka `autosave.status` till `HallBoard`, återanvänd `.save-status`. Inga nya texter.
- A2 Bara «Inte sparat» i Hallöversikt (visas när något gått fel), inget när allt är bra.
- A3 Ingen ändring.

### B. Bock i texten
- **B1 ★** Behåll «Sparat» utan bock (Slice 39 B1). Texten är redan lugn och tydlig.
- B2 Byt till «Sparat ✓» överallt där texten visas.

### C. När rutnätet är fullt
- **C1 ★** Rutor efter den sista läggs på halv rutas förskjutning (mellan befintliga rutor), i passets ordning. Ingen markör hamnar exakt på en annan. Hallar och de första 9/12 platserna ger samma positioner som i dag.
- C2 Ingen ändring: så många Teknikstationer är ovanligt, och du kan dra isär dem.

### D. Sparade pass
- **D1 ★** Inget flyttas i redan sparade pass. Bara nya placeringar påverkas (samma regel som Slice 40 D1).

### E. Backloggen
- **E1 ★** Builder rör inte backloggen. PO flyttar 2026-10-13 #1–#5 från **Approved** till **Shipped** (Slice 39–43) när paketet låses.
- E2 Docs gör den ändringen i en egen liten docs-PR.

### F. Omfång och budget
- **F1 ★** A1 + B1 + C1 + D1. Sidfot **Slice 53**. Budget +512 B gz mjukt; uppskattning **+60–140 B gz** (A1 ca +30–60, C1 ca +30–80).
- F2 Bara A1 (ca +30–60 B), C väntar.
- F3 Bygg ingenting nu. Stäng #1/#2 som levererade och lägg Slice 53 på nästa produktidé i stället (Scout tar fram 2–3 förslag).

## Effort

**S.** En prop och en `span` i `HallBoard.tsx`, en gren i `pickOpenCell` / `openGridCells` i `lib/hall.ts`, tester. Ingen ny skärm, inga nya texter, ingen SQL.

## Öppna frågor

1. Backloggen: får PO flytta 2026-10-13 #1–#5 till Shipped (Slice 39–43)? I dag ser det ut som om de väntar.
2. Räcker luckorna för en egen slice, eller väljer du F3 och tar en ny produktidé som Slice 53?
3. B: vill du ha bocken «Sparat ✓» som Scout föreslog, eller behålla dagens «Sparat»?
4. Smoke-felen som skjutits upp: ligger de kvar till en senare slice enligt plan?
