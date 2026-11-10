# Slice 60 — verifieringschecklista (LÅST 2026-11-10: A1 B1 C1 D1 E1 F1 G1 H1)

Ingen SQL mot riktiga projektet. Allt körs mot den lokala stand-in-mallen och körningarnas egna databaser. Netlog: 0 anrop till live-projektet. Bas main @ `34ec865`.

| # | Kontroll | Förväntat |
|---|---|---|
| 1 | Före ändringen: `run-smokes.sh slice-31-builder-smoke` på `34ec865` | C1a och C2a FAIL, netloggen har två exercises-GET (med och utan `default_station_layout`) |
| 2 | Före ändringen: läsande PostgREST-fråga efter `default_station_layout` i egen körningsdatabas | 400 med `42703` och kolumnnamnet (sparat i `verifier/slice-60-checks/`) |
| 3 | `slice-31-builder-smoke` efter ändringen | 47 PASS, 0 FAIL. C1a, C2a PASS |
| 4 | `slice-32-builder-smoke` efter ändringen | 0 FAIL. AC26b, AC29, AC29a, AC29c, AC29d, AC30b, AC31, AC33, AC33b0, AC34, AC35, AC36, AC37, AC48c PASS |
| 5 | `slice-33-builder-smoke` efter ändringen | 0 FAIL. AC21c, S32-AC29, S32-AC29a, S32-AC29c, S32-AC29d, S32-AC30b, S32-AC31, S32-AC33, S32-AC33b0, S32-AC34, S32-AC35, S32-AC36, S32-AC37 PASS |
| 6 | `run-smokes.sh --baseline` för s31–33 mot main-cachen för `34ec865` | LAGAD för alla tre, inga NY FAIL |
| 7 | Hela loopen (`run-smokes.sh all`, som `weekly.sh`) | 23 skript, 0 FAIL, inga NY FAIL, inga KARANTÄN-FAIL |
| 8 | s36 och s37 (andra stand-in-smokes) | Gröna som i v45 |
| 9 | Doctor efter ändringen | Mallen ombyggd (ny sha256), `PASS stand-in har appens exercises-kolumner` |
| 10 | Doctor mot en mall utan schema-57 (egen `TPV_HOME`, inte den delade) | `BLOCKED stand-in saknar kolumn default_station_layout — …`, exit 1 |
| 11 | `schema-58.sql` | Inte i mallen, inte i hashen |
| 12 | `git diff 34ec865 -- app/` | Tom. Bundle gz 0 B mot main. `SLICE_NUMBER` `'59'`, footer «Slice 59» |
| 13 | `git diff 34ec865 -- verifier/slice-31-builder-smoke.mjs verifier/slice-32-builder-smoke.mjs verifier/slice-33-builder-smoke.mjs` | Tom (förväntningarna orörda) |
| 14 | `slice-57/content/schema-57.sql` | Oförändrad |
| 15 | `npm run build`, `npm run lint`, `bun test src`, `bun test tools/bank` | Gröna, samma antal som main-cachen |
| 16 | `verifier/README.md`, `verify-traningsplaneraren/SKILL.md`, `verifier/smoke-map.json` | Uppdaterade enligt HANDOFF 4 |
| 17 | `SLICE60-SHIPPED.md` | Utfallet av 1–2, smokes före och efter, head-SHA, och noten om Slice 59 schema-notes (reserv bara i ledarvägen) |
| 18 | Nästa veckokörning efter merge (Christoffer/rutinen, inte Verifier-grind) | 0 FAIL, «Diff mot förra veckan» listar 29 lagade |
