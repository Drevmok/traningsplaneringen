# Slice 66 — verifieringschecklista (FÖRESLAGEN: A1 B1 C1 D1 E1 F1)

Telefon 390×844 om inget annat sägs; kontroll 1–2 på **844×390**. Testdata som i Slice 65: placerade Teknik plus minst en oplacerad (ta bort ett märke i redigeringsläget). Ingen SQL.

**9 kontroller.** Föreslaget A1 B1 C1 D1 E1 F1 — uppdateras vid lås.

| # | Kontroll | Förväntat |
|---|---|---|
| 1 | 844×390, öppna «Bygg hallen» på Golvklart | Utan att rulla sidan: kartan med aktuellt märke, plus titel, «Station n av N» eller «Saknar plats», Byggd och Föregående / Nästa / Avsluta Bygg hallen. Skissen får vara krympt eller rullas inne i panelen |
| 2 | Samma yta, mitt i ett steg | Inget täcker Avsluta Bygg hallen. Befintligt märke har `.is-selected`. Inget extra märke |
| 3 | 390×844, Bygg hallen | Ingen försämring mot main: karta och panel ryms som idag eller bättre |
| 4 | Avsluta Bygg hallen, kvar i Golvklart | Vanlig gruppvy, kartan fullbredd (ingen sidokolumn kvar). Avsluta golvklart, Förrådslista och Skriv ut passet som på main |
| 5 | Skriv ut passet från Dela och från Golvklart, med minst en oplacerad Teknik | I sektionen «Bygg hallen»: oplacerad `☐ Titel — Saknar plats` (utan nummer). Placerad `☐ n. Titel`. Skiss och redskap som på main. En `.pass-sheet`. Tidslinje, hallkarta och Förrådslista orörda. Inte Se upp för / Säkerhet i sektionen |
| 6 | Hallöversikt i redigeringsläge, Förrådslista, Kör passet | Som på main. Inga nya märken, ingen CAD. `hallSetupSteps`-ordningen oförändrad |
| 7 | Footer | «Slice 66» |
| 8 | `npm run build`, `npm run lint`, `bun test src` (inkl. nytt `PassPrint`-fall). `pick-smokes d347892 <head>` mot baslinjen | Gröna. Troligen hela loopen p.g.a. `App.css` och `blockMeta.ts`. SAMMA förutom footer 65→66, liggande panel i vyn och utskriftsetiketten |
| 9 | Bundle gz (js+css, `build-dists.sh`) mot main @ `d347892` | Rapporterad, väntat ≤ +512 B, med redovisad bantning. Ingen SQL har körts |
