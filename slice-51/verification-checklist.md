# Slice 51 — verifieringslista (FÖRESLAGEN)

**Status:** FÖRESLAGEN. Gäller A1 B1 C1 D1 E1 F1 om de låses.

Ingen ändring i appen. Allt körs på boxen mot lokal stand-in. Ingen SQL mot det riktiga projektet. Ingen nyckel i repot; bara prefixen `sb_publishable_`/`sb_secret_` får synas i loggar och rapporter.

| AC | Steg | Väntat |
|---|---|---|
| AC1 | Hela loggar från s30, s30-fix, seed, s31, s32, s37, s42–45 på 055af39 (`verifier/slice-51-checks/before/`) | Orsaken per skript stämmer med README-tabellen, eller avvikelsen står i ship notes |
| AC2 | `run-smokes.sh` med s30, s30-fix, seed, s31 på kodgrenen | Alla fyra exit 0, 0 FAIL |
| AC3 | `run-smokes.sh` med s32 | Exit 0, 0 FAIL; borttagna AC listade i rapporten |
| AC4 | `run-smokes.sh` med s37, s42, s43, s44, s45 | Alla exit 0, 0 FAIL; ingen förväntan ändrad utan hänvisning till ett låst beslut |
| AC5 | `grep -c "Från mall\|'Tomt pass'" verifier/slice-4[2-5]-builder-smoke.mjs verifier/slice-37-builder-smoke.mjs` utanför `smoke-start.mjs` | Inga klick på startsidan; alla går via `smoke-start.mjs` |
| AC6 | `verifier/smoke-map.json` | De elva skripten har `"baseline": "ok"` och inget `inLoop: false`; inget skript har värdet `trasig` |
| AC7 | Hela loopen tre gånger i rad på kodgrenen | De elva skripten ger 0 FAIL alla tre gångerna |
| AC8 | Ett skript med en FAIL (t.ex. s33 på main) | Exit ≠ 0 |
| AC9 | `run-smokes.sh --baseline <main smoke-baseline.txt> all` utan ändring | Varje rad `SAMMA` eller `LAGAD`, exit 0 |
| AC10 | Felinjektion som i Slice 50 (`WIZARD_BLOCK_MINUTES[90].techniques` 36 → 30 i scratch-worktree), `--baseline` | s49 `NY FAIL`, exit 1 |
| AC11 | Ett skript som kraschar | Raden visar felmeddelandet, inte bara `Node.js v20.19.2` |
| AC12 | Karantän på s33 AC16d i en testkarta, två körningar med tvingad FAIL i AC16d | Första: `KARANTÄN-FAIL`, exit 0. Andra: `NY FAIL`, exit 1. Rader i `quarantine.tsv` |
| AC13 | Flytta bort `chromium_headless_shell-*` och kör install-once och Doctor | Båda säger att Chromium saknas (install-once installerar, Doctor BLOCKED) |
| AC14 | `git diff --stat origin/main -- app/` på kodgrenen | Tomt. Bundle 0 B. Sidfoten «Träningsplaneraren · Slice 49» oförändrad |
| AC15 | Main-cachen efter Doctor på ny SHA | `test.txt` från `bun test src` (ca 245/0), `test-bank.txt` från `bun test tools/bank` |
| AC16 | Doctor med två olika `TPV_HOME` samtidigt | Båda PASS; olika Postgres-portar i respektive `env.json` |
| AC17 | `grep -n "/tmp/s32" tools/bank/` | Inga träffar; `S32_GATEWAY=… bun test tools/bank` mot lokal stand-in går som förut |
| AC18 | Netlog för AC2–AC10 | 0 anrop till det riktiga projektets värd |
| AC19 | `slice-50/decisions.md` | Karantängränsen står som «≥2 av 20» |
