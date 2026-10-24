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
| `bash verifier/tools/run-smokes.sh <script…\|all>` | Runs smokes with the uniform env (own stand-in per script that needs one, netlog shim, psql shim). Env: `TPV_ROOT`, `TPV_PLAIN`, `TPV_BANK`, `TPV_MAIN`, `TPV_OUT`, `TPV_PORT_BASE`, `TPV_RUN_TAG` |
| `bash verifier/tools/build-dists.sh <worktree> <out>` | Plain + bank build, `build.exit`, `bundle.txt` (gzip -9 per chunk + TOTAL) |
| `node verifier/tools/check-selectors.mjs` | Every «Stabila väljare» selector exists in `app/src` |
| `bash verifier/tools/weekly.sh` | Doctor → full loop (`all`) against main → weekly md → diff vs last week (exit 3 = new FAIL). The Sunday 03:00 routine is created by PO after Christoffer's OK |

`verifier/smoke-map.json`: script → `feature`, `paths`, `baseline` (`ok` / `trasig`), `inLoop` (false = not in the normal loop, only main baseline / `--all`), optional `standin`, `build`, `karantan`.
