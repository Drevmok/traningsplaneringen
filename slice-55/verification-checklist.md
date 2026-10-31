# Slice 55 — verifieringslista (FÖRESLAGEN)

Viewport **390×844**, och **844×390** där det står. Lokal förhandsvisning port 4173. Rensad lagring före varje AC. ★-vägen (A1 B1 C1 D1 E1 F1).

| AC | Steg | Väntat |
|---|---|---|
| AC1 | Planera pass → Starta från mall → «Gymmix – Stora hallen» → välj en inbyggd mall | Nästa steg är Passlängd med 60 / 90 / 120 min; «Fråga 3 av 3» |
| AC2 | AC1 → 60 min | Passbyggaren visar «60 / 60 min»; toast «Mallen är i Passbyggaren.» med Ångra |
| AC3 | Samma mall → 90 min, sedan en ny start → 120 min | «90 / 90 min» resp. «120 / 120 min» |
| AC4 | Jämför tiderna i AC2 med mallens tider (main, utan skalning) | Samma övningar i samma ordning; varje övning ungefär samma andel av passet (högst 1 min ifrån) |
| AC5 | AC3 120 min → Kör passet | Start visar «Kvar: 120 min» |
| AC6 | Spara ett eget pass som Mina mall → Starta från mall → den mallen → 90 min | «90 / 90 min»; Biblioteket/Mina mallar visar mallen med sina gamla tider |
| AC7 | Föreningens mall (lokal stand-in) → «Gymmix – Grophallen» → 60 min | «60 / 60 min»; Teknik placerad i Grophallen |
| AC8 | AC2 → Ångra | Tillbaka till startsidan som i dag; inget pass kvar |
| AC9 | Passlängd-steget → Tillbaka | Mallsteget visas igen |
| AC10 | Passbyggaren → Mallar → Använd mall (D1) | Mallens egna tider som på main, ingen längdfråga |
| AC11 | Planera pass, Frågor-vägen, 90 min | Oförändrat mot main («90 / 90 min», redskap ifyllda) |
| AC12 | AC1–AC2 i **844×390** | Alla tre längdknappar syns och går att trycka utan att sidan hoppar |
| AC13 | Granska texterna på längdsteget | Inga nya ord; samma rubrik och knappar som Frågor-vägen; inga utropstecken |
| AC14 | Sidfoten | «Träningsplaneraren · Slice 55» |
| AC15 | `npm run build`, `npm run lint`, `bun test src` | Gröna; bundle gz ≤ +512 B mot main |

Smokes: enligt `verifier/tools/pick-smokes.mjs`. Väntade filer: `lib/wizard.ts`, `components/HomeWizard.tsx`, `lib/mallApply.ts`, `App.tsx`, `data/blockMeta.ts`, tester.
