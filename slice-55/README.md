# Slice 55 — Passlängd även på Starta från mall

**App:** Träningsplaneraren  
**Status:** **LÅST** 2026-10-31 av Christoffer (svar via PO-chatten: «Ja, lås A1 B1 C1 D1 E1 F1»): A1 B1 C1 D1 E1 F1. Bas: main @ 5e57fd0. Gren: `slice-55-docs`. Se `decisions.md`.
**Effort:** **S–M** (se nedan).  
**Källa:** Scout 2026-10-30 idé 3 (`/workspace/scout-drafts/2026-10-30-ideas.md`), vald av Christoffer. Bilder: `/workspace/screenshots/scout-2026-10-30/` (`30-starta-mall.png`, `39-mall-replace.png` «53 /»).

## Varför

Sedan Slice 49 blir ett pass från Planera pass precis 60, 90 eller 120 min. Väljer du i stället **Starta från mall** får du mallens egna tider, för de inbyggda mallarna ca 53 min (`39-mall-replace.png`). Har du en timme eller en och en halv i hallen får du korta eller förlänga övningarna en i taget i Passbyggaren.

**Vad tränaren får:** «Jag väljer hall, mall och hur lång tid vi har. Passet blir lika långt, och mallens upplägg är kvar.»

## Det här ändrar ett tidigare beslut

Slice 49 (öppen fråga 3, låst «bara Frågor-vägen») bestämde att passlängden **inte** skulle styra mallvägen: «mallen har sina egna tider». Slice 55 ändrar det för **Starta från mall i Planera pass**. Mallen själv ändras inte; bara passet du startar från den får nya tider. Mallar-fliken i Passbyggaren (Använd mall) behåller dagens beteende med ★-vägen (D1).

## Kod i dag (main @ 5e57fd0, läst — ingenting byggt)

- Stegen: `lib/wizard.ts:41–43` — `questions: ['age','focus','hall','length']`, `empty: ['hall','length']`, `mall: ['hall','mall']`.
- `components/HomeWizard.tsx:52–58` `result()`: mallvägen lämnar `{ path: 'mall', hallTemplateId, pick }` utan längd.
- `App.tsx:195–203`: `applyMall(plan.pick, plan.hallTemplateId)` (`lib/mallApply.ts`), sparas, «Mallen är i Passbyggaren. · Ångra».
- Hjälpen från Slice 49: `splitMinutes(total, weights)` och `WIZARD_BLOCK_MINUTES` i `data/wizardPaths.ts:98–117`. `splitMinutes` delar hela minuter efter vikter med största rest.
- `setSessionLength` (`lib/session.ts:81`) sparar bara målet.

## A–F (★ = förslag)

### A. Hur skalas mallen?
- **A1 ★** Hela passet skalas mot vald längd med samma vikter som mallen har: `splitMinutes(längd, alla övningars minuter)`. Varje övning får minst 1 min. Summan blir exakt vald längd, och blockens inbördes storlek är som i mallen (en mall med lång uppvärmning behåller lång uppvärmning).
- A2 Blocktabellen från Slice 49 (`WIZARD_BLOCK_MINUTES`), sedan `splitMinutes` inom blocket. Samma blocktider som Planera pass, men mallens egen balans mellan blocken försvinner.
- A3 Bara Teknik töjs/krymps tills summan stämmer. Minst ändring, men stora hopp i Teknik på 120.

### B. Var i flödet kommer frågan?
- **B1 ★** Sist: Hall → Mall → Passlängd (60/90/120, samma knappar som Frågor-vägen). «Fråga 3 av 3». Ett extra tryck.
- B2 Före mallen: Hall → Passlängd → Mall.
- B3 Ingen fråga; en rad i Passbyggaren «Gör passet 60/90/120 min» efteråt.

### C. När mallen redan är lika lång, eller saknar övningar
- **C1 ★** Alltid skala till vald längd (även 53 → 60). Övningar med 0 min räknas som 1 i vikten. En mall utan övningar får bara målet satt, inga tider.
- C2 Lämna mallen orörd om den ligger inom ±5 min.

### D. Mallar-fliken i Passbyggaren (Använd mall)
- **D1 ★** Ingen ändring. Där finns redan ett pass och en Passlängd-rad; skalning där är en egen fråga.
- D2 Samma skalning där, mot passets nuvarande längd.

### E. Ångra och sparade mallar
- **E1 ★** «Mallen är i Passbyggaren. · Ångra» som i dag; Ångra tar bort hela passet. Mallen i Biblioteket / Mina mallar / föreningens mallar ändras aldrig. `targetMinutes` på passet = vald längd.
- E2 Ångra återställer mallens ursprungliga tider i stället.

### F. Omfång och budget
- **F1 ★** A1–E1. Inga nya texter (återanvänder `UI.passLength` / `passLengthMinutes`). Sidfot **Slice 55**. Budget +512 B gz mjukt; uppskattning **+120–250 B gz** (nytt steg i wizard ca +40, `scaleToLength` ca +80–150, anrop i App ca +20).
- F2 A2 i stället för A1 (ca samma storlek).

## Effort

**S–M** (som Scout sa). Ett steg till i `WIZARD_STEPS.mall`, längd i `PlanResult` för mallvägen, en ren funktion i `lib/mallApply.ts` som återanvänder `splitMinutes`, tester och feature map. M-delen är testningen: tre mallsorter (inbyggd, Mina mallar, föreningens) × två hallar × tre längder, och att Ångra fortfarande fungerar. Ingen SQL, ingen ny skärm.

## Utanför omfånget

- Mallar-fliken i Passbyggaren (D1).
- Att ändra längden i Passbyggaren efteråt (Slice 49 B1 gäller: bara målet).
- Att lägga till eller ta bort övningar för att fylla tiden.
- Redskap vid mallstart (Slice 49 C1 gäller: fylls inte).
- Ändringar i sparade eller publicerade mallar.

## Öppna frågor

1. A: ska mallens egen balans mellan blocken gälla (A1) eller samma blocktider som Planera pass (A2)?
2. B: om en Mina mall eller föreningsmall redan har sparad längd 90 eller 120 — ska den knappen vara förvald? Förslag: nej, inget förval, ett tryck som i Frågor-vägen.
3. D: vill du ha samma skalning i Mallar-fliken senare (egen slice)?
