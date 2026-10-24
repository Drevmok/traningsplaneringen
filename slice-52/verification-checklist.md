# Slice 52 — verifieringslista (FÖRESLAGEN)

**Status:** FÖRESLAGEN. Gäller A1 B1 C1 D1 E1 F1 om de låses.

Ingen ändring i appen. Allt körs på boxen mot main-cachens dist eller lokal stand-in. Ingen SQL mot det riktiga projektet. Ingen nyckel i repot; bara prefixen `sb_publishable_`/`sb_secret_` får synas i loggar och rapporter.

| AC | Steg | Väntat |
|---|---|---|
| AC1 | Hela loggar för s37, s43–s46 på 84b44e7 (`verifier/slice-52-checks/before/`) | De sju FAIL och orsakerna stämmer med README-tabellen, eller avvikelsen står i ship notes |
| AC2 | `run-smokes.sh` med s43, s44, s45, s46 på kodgrenen | Alla exit 0, 0 FAIL |
| AC3 | `git diff origin/main -- verifier/slice-4[3-6]-builder-smoke.mjs` | Varje ändrad förväntan har en `// Slice 52:`-kommentar som hänvisar till ett låst beslut (Slice 44, 45 B1, 47 A1, 47 B1, 48 B1, 49 A1/D1) |
| AC4 | `rg -n "4410\|4444\|hall-layout-select\|Exportera / dela" verifier/slice-44-builder-smoke.mjs verifier/slice-45-builder-smoke.mjs` | Inga träffar i AC6/AC10-blocken (AC1-menu får nämna «Exportera» som frånvarokontroll) |
| AC5 | `verifier/fixtures/old-share-links.json` | Två token med commit (0d88da5 och föräldern till cd19319) och datum; inga URL:er med port |
| AC6 | `rg -n "true \|\|\|v !== false\|count\(\)\) === 0 \|\|\|toastAfterApply === 0" verifier/slice-43-builder-smoke.mjs verifier/slice-37-builder-smoke.mjs` | Inga träffar |
| AC7 | s37 och s43 på kodgrenen | 0 FAIL |
| AC8 | Felinjektion: toasttexten ändrad i scratch-worktree, s37 med `--baseline` | AC9a, AC9b, AC9e FAIL; `NY FAIL`; rc 1 |
| AC9 | `run-smokes.sh` utan `--baseline` med ett skript som ger exit 1 (t.ex. s33) | rc 1 |
| AC10 | `run-smokes.sh` utan `--baseline` med bara skript som ger exit 0 (s48, s49) | rc 0 |
| AC11 | Flytta bort `chromium_headless_shell-*`, kör `install-once.sh` | Laddar ner revision 1243 (inte senaste); efteråt `pw_ok` och Doctor PASS |
| AC12 | `run-smokes.sh` med `slice-52-admin-import-smoke` | Exit 0; IMP1–IMP6 PASS; netlog 0 anrop till live-värden |
| AC13 | Felinjektion: dubblettkontrollen i `ownImport.ts` bortkopplad i scratch-worktree | IMP3 FAIL, exit 1 |
| AC14 | `--baseline` med 055af39-filen (med syntaxfelsraden), och Doctor på en cache där filen saknar en skriptrad | run-smokes exit 2 med meddelande; Doctor BLOCKED och `smoke-baseline.invalid.txt` |
| AC15 | `git diff --stat origin/main -- app/` på kodgrenen | Tomt. Bundle 0 B. Sidfoten «Träningsplaneraren · Slice 49» oförändrad |
| AC16 | Hela loopen tre gånger i rad med `--baseline` mot main-cachen för 84b44e7 | s37, s43–s46 och den nya smoken 0 FAIL alla tre gångerna; inga `NY FAIL` |
| AC17 | `verifier/smoke-map.json` | s37, s43–s46 och `slice-52-admin-import-smoke` har `"baseline": "ok"`; inget skript med kända FAIL har `"ok"` |
| AC18 | Netlog för AC2–AC16 | 0 anrop till det riktiga projektets värd |
