# Slice 56 — verifieringslista (FÖRESLAGEN)

Viewport **390×844**, och **844×390** där det står. Lokal förhandsvisning port 4173. Rensad lagring före varje AC. ★-vägen (A1 B1 C1 D1 E1 F1).

| AC | Steg | Väntat |
|---|---|---|
| AC1 | Planera pass, Frågor-vägen, «Gymmix – Stora hallen», 90 min → Hallöversikt | Ingen «saknar redskap»-rad (samma som main) — regression |
| AC2 | AC1 → Passbyggaren → välj Teknik-blocket → Biblioteket → Kullerbytta framåt → Lägg till → Hallöversikt | Ny station placerad med redskap; ingen «1 station saknar redskap»; Använd alla förslag syns inte |
| AC3 | AC2 → Golvklart / Förrådslista | Kullerbyttans redskap finns i listan |
| AC4 | AC1 → Hallöversikt → «Lägg till station» → Kullerbytta framåt | Som AC2–AC3 |
| AC5 | AC1 → Passbyggaren → Uppvärmning → Biblioteket → en uppvärmningsövning → Lägg till | Inga redskap ändras; Förrådslista som före |
| AC6 | AC1 → Redigera redskap på en station → rensa alla → spara. Lägg sedan till en Teknik-övning | Den rensade stationen är fortfarande tom; den nya får redskap |
| AC7 | AC1 → Redigera redskap → egen lista → spara. Lägg till Teknik | Egna listan oförändrad |
| AC8 | AC2 → Redigera redskap på nya stationen | Förslaget kan ändras och rensas som vanligt |
| AC9 | Starta från mall → «Gymmix – Grophallen» → en mall → Hallöversikt (inget tillägg) | Som main: stationer utan redskap, saknar-raden syns (E1) |
| AC10 | AC9 → lägg till en Teknik-övning | Enligt låst svar på öppen fråga 3 (★: alla stationer får förslag) |
| AC11 | AC2 och AC4 | Ingen toast, inga nya texter (C1) |
| AC12 | AC2 och AC4 i **844×390** | Lägg till går att trycka; saknar-raden försvinner; inget hopp i sidan |
| AC13 | Sidfoten | «Träningsplaneraren · Slice 56» |
| AC14 | `npm run build`, `npm run lint`, `bun test src` | Gröna; bundle gz ≤ +512 B mot main (väntat +20–80 B) |

Smokes: enligt `node verifier/tools/pick-smokes.mjs origin/main HEAD`. Väntade filer: `components/SessionBuilder.tsx`, `components/HallBoard.tsx`, `data/blockMeta.ts`, tester.
