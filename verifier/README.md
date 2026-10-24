# verifier/

Evidence and smokes per slice (`slice-NN-*`), the local Supabase stand-in (`slice-32-local/`) and, from Slice 50, shared tools for faster verification (`tools/`).

## /home/box/tp-verify/ (shared by all agents on the box)

| Path | What | Written by |
|---|---|---|
| `bin/gotrue/auth`, `bin/postgrest` | GoTrue v2.197.0, PostgREST v12.2.3 | `tools/install-once.sh` |
| `standin/` | template cluster (pg :54741) with `bank_template`, `template.sha256`, `runs/<run>/` | Doctor (`setup.sh --template`), `db-new.sh` / `db-drop.sh` for runs |
| `main/<sha>/` | main cache per `origin/main` SHA: `dist/`, `bank-build/`, `bundle.txt`, `test.txt`, `tsc.txt`, `lint.txt`, `smoke-baseline.txt`, `smoke-out/`, `.complete` | Doctor only (under `flock`) |
| `weekly/<år>-v<vecka>.md` | weekly full loop against main | `tools/weekly.sh` |

Builder and Verifier read `standin/` and `main/`; only Doctor writes them (runs under `standin/runs/` are each agent's own).

## Tools

| Command | What |
|---|---|
| `bash verifier/tools/install-once.sh` | Once per box, idempotent: Postgres 17 (apt), GoTrue, PostgREST, Playwright Chromium |
| `bash verifier/tools/doctor.sh` | One line per check; `BLOCKED <x> — kör <cmd>` = exit 1. Installs nothing. Rebuilds a stale template, builds the main cache once per SHA. `TPV_BANK_SEED`, `TPV_PORT_BASE`, `TPV_DIST`, `TPV_NO_MAIN=1` |
| `eval "$(bash verifier/tools/db-new.sh <run>)"` / `bash verifier/tools/db-drop.sh <run>` | Own database `bank_<run>` from the template (~1 s) / teardown |
| `node verifier/tools/pick-smokes.mjs <bas> <head> [--all] [--json]` | Smokes for a diff, with the reason per script (rules: `slice-50/README.md` C1); last line `RUN: …` |
| `bash verifier/tools/run-smokes.sh [--baseline <fil>] <script…\|all>` | Runs smokes with the uniform env (own stand-in per script that needs one, netlog shim, psql shim). Env: `TPV_ROOT`, `TPV_PLAIN`, `TPV_BANK`, `TPV_MAIN`, `TPV_OUT`, `TPV_PORT_BASE`, `TPV_RUN_TAG` |
| `bash verifier/tools/build-dists.sh <worktree> <out>` | Plain + bank build, `build.exit`, `bundle.txt` (gzip -9 per chunk + TOTAL) |
| `node verifier/tools/check-selectors.mjs` | Every «Stabila väljare» selector exists in `app/src` |
| `bash verifier/tools/weekly.sh` | Doctor → full loop (`all`) against main → weekly md → diff vs last week (exit 3 = new FAIL). The Sunday 03:00 routine is created by PO after Christoffer's OK |

`verifier/smoke-map.json`: script → `feature`, `paths`, `baseline` (`ok` / `kända-fel` / `kraschar`, Slice 51), `inLoop` (false = not in the normal loop, only main baseline / `--all`), optional `standin`, `build`. Top-level `"karantan": {"ids": [...], "limit": "≥2/20"}` is not a script (run-smokes `all`, pick-smokes and weekly skip it).

### Slice 51: --baseline, krascher, karantän
- Every mapped smoke sets `process.exitCode = 1` when any AC is FAIL (KARANTÄN-FAIL does not count). The full log is in `$TPV_OUT/logs/<script>.txt`.
- A crash (exit ≠ 0 and no summary line) prints `KRASCH: <first Error line>` instead of `Node.js v20…`; a timeout prints `KRASCH: timeout 400 s`.
- `--baseline <fil>` (normally `$TPV_HOME/main/<sha>/smoke-baseline.txt`) adds one line per script: `SAMMA`, `LAGAD` or `NY FAIL`. NY FAIL = more FAIL or fewer PASS than the baseline, a crash where the baseline had counts, or exit ≠ 0 where the baseline was exit 0 with 0 FAIL. run-smokes exits 1 on any NY FAIL. A baseline itself may contain exit 1 for scripts with known errors.
- Karantän: ids in `"karantan".ids` print `KARANTÄN-FAIL [id]` (scripts read the list via `SMOKE_MAP` or `verifier/smoke-map.json`). run-smokes appends one row per KARANTÄN-FAIL to `$TPV_HOME/quarantine.tsv` (datum, sha, skript, id; override with `TPV_QUARANTINE`); the same id in two runs of a script in a row (state in `$TPV_HOME/quarantine.last/`) → `NY FAIL`, exit 1. The limit for putting an id in quarantine is ≥2 of 20 runs (slice-50/decisions.md).
- Start paths: smokes start a pass only via `verifier/tools/smoke-start.mjs` (`startTomt`, `startMall`, `openMallList`, `startFragor`); admin login via `verifier/tools/smoke-login.mjs` (6-digit code from the stand-in mail).
- `verifier/tools/lib.sh`: `pw_ok` (chromium_headless_shell + /usr/bin/google-chrome), shared by Doctor and install-once.
- Doctor: `test.txt` = `bun test src` in `app/`, `test-bank.txt` = `bun test tools/bank` from the worktree. `setup.sh --template` without `S32_PG_PORT` uses port 54741 + (cksum of `TPV_HOME`) % 100, written to `env.json`.
