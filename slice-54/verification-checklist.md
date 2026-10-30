# Slice 54 — verifieringslista (LÅST, breddad)

**Status:** LÅST A1–F1 + breddning 2026-10-30.

Ingen ändring i appen. Allt körs på boxen mot lokal stand-in. Ingen SQL mot det riktiga projektet. Ingen nyckel i repot.

| AC | Steg | Väntat |
|---|---|---|
| AC1 | Hela loggar för de nio skripten på 03c0864 (`verifier/slice-54-checks/before/`) | Orsaken per FAIL stämmer med README, eller avvikelsen står i ship notes |
| AC2 | `grep -nE "'Tomt pass'\|Från mall\|'Nästa'" verifier/slice-3[3-9]-builder-smoke.mjs verifier/slice-4[01]-builder-smoke.mjs` | Inga klick på startsidan eller «Nästa»; allt via `smoke-start.mjs` |
| AC3 | `run-smokes.sh` med s33, s34, s35, s36, s38, s39, s40, s41, s47 | Alla exit 0, 0 FAIL |
| AC4 | `grep -nE "Slice (3[3-9]\|4[0-7])['»]" ` i samma skript, utom texter i `check`-beskrivningar | Inga fasta slicenummer i förväntade värden |
| AC5 | Felinjektion i scratch-worktree: `footerSliceLabel` → `Träningsplanerare · Slice ${SLICE_NUMBER}`, kör s34 | AC20 FAIL, exit 1 |
| AC6 | Felinjektion i scratch-worktree: ta bort «Tomt pass» ur guiden, kör s41 | FAIL, exit 1 |
| AC7 | s35 på 390×844 och 844×390 | AC1a, AC9-local, AC11a, AC12 PASS; ingen strict mode-krasch |
| AC8 | s40 AC1-main, AC2-main, AC8-main | PASS utan att main byggs eller öppnas; läser golden-filen |
| AC9 | s47 AC3 och AC7 | PASS; Hallöversikt öppnas via rubrikknappen |
| AC10 | `weekly.sh` mot en logg utan PASS-rader och mot en saknad logg | En cell `0` per kolumn, aldrig `0⏎0`; tabellen har en rad per skript |
| AC11 | `verifier/smoke-map.json` | De nio skripten `"baseline": "ok"`; inget skript `kända-fel` |
| AC12 | Hela loopen tre gånger med `--baseline` mot main-cachen för 03c0864 | De nio skripten 0 FAIL alla tre; inga `NY FAIL` utom borttagna id (listas) |
| AC13 | `git diff --stat origin/main -- app/` | Tomt. Bundle 0 B. Sidfot «Träningsplaneraren · Slice 53» oförändrad |
| AC14 | Netlog för AC3–AC12 | 0 anrop till det riktiga projektets värd |
| AC15 | s33 AdminArea-kontroller (AC4b-local, S32-AC29a/c/d/f, AC31, AC33–AC35) | PASS via Admin-vyn; AC29f visar «Godkänn \| Ändra i banken \| Dölj för alla» |
| AC16 | s33 AC21c | PASS; bara GET mot `club_templates`, `exercises`, `redskap` |
| AC17 | s36 hela körningen (A–C) | 0 FAIL; orsak till tidigare C-fel dokumenterad i ship notes; inget appfel eller appfel listat |
