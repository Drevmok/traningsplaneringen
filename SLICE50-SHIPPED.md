# Slice 50 — Snabbare verifiering (infra) · PR body draft

Branch `slice-50-code` (from `slice-50-docs` 0a3b305, base main 9a087c3). Locked A1 B1 C1 D1 E1 F1.
**No app change:** `git diff --stat origin/main -- app/` is empty, the bundle is unchanged (215152 B gzip, per-chunk identical), and `SLICE_NUMBER` is still '49'.

## What
- `verifier/tools/`: `install-once.sh`, `doctor.sh` (tools, template DB sha, ports, main cache under flock; only Doctor writes the cache), `db-new.sh`/`db-drop.sh` (one `bank_<run>` per run from `bank_template`), `build-dists.sh`, `run-smokes.sh` (own DB per stand-in script, netlog that aborts the live host), `serve-dist.mjs`, `pw-netlog.mjs`, `pick-smokes.mjs`, `check-selectors.mjs`, `weekly.sh`, `shim/psql` (`-d bank` → `$S32_DB`).
- `verifier/smoke-map.json`: 22 scripts with feature, files, standin, baseline (ok/trasig) and inLoop (false for the scripts HANDOFF §4 lists).
- s33 OTP-flake fix (D1): waits from the first mail's mtime + 65 s, picks the newest mail with a new code, and writes a masked otp-debug file on FAIL.
- One skill pointer (HANDOFF §5); the `-2` folder is kept (PO). The psql shim is documented in PROJECT.md (subsection after «Verifieringsrecept»). PROJECT.md «Verifieringsrecept» = HANDOFF §7. A «Stabila väljare» section in every features/*.md. Docs in the slice-32-local README and `verifier/README.md`. Backlog entry added.
- Evidence: `verifier/slice-50-checks/`.

## AC
| AC | Result | Evidence |
|---|---|---|
| 1 | PASS | install-once second run installs nothing, exit 0 |
| 2 | PASS | Doctor on a ready box takes 714 ms (`ac2-ac7-doctor-second.txt`) |
| 3 | PASS | `ac3-gotrue-missing.txt` |
| 4 | PASS | `ac4-seed-copy.txt` |
| 5 | PASS | `ac5-two-runs.txt` |
| 6 | PASS | full main loop: 2076 requests, 0 to the live host (`doctor-first-run.txt`) |
| 7 | PASS | second Doctor run: «main-cache finns (läses, byggs inte)» |
| 8 | PASS | `ac8-pick-slice49.txt` (PO: inLoop:false on the 7 HANDOFF §4 scripts is correct) |
| 9 | PASS | `ac9-pick-unmapped.txt` |
| 10 | PASS | `ac10-map-coverage.txt` |
| 11 | PASS (accepted per D1) | AC16d FAIL 1/20 (run 3, right after s32: the resent code got 403 «token has expired or is invalid»; masked debug included); AC11d 0 FAIL. The bar is karantän at ≥2/20 (D1, PO answer), so 1/20 is accepted and s33 is not quarantined. `ac11-s33-20-runs.txt` |
| 12, 13, 15 | Not verifiable here | need the next real app slice |
| 14 | PASS | `ac14-app-bundle.txt` |
| 16 | PASS (deviation approved by PO) | the pointer SKILL.md has the HANDOFF §5 text; the PO chose to keep the `verify-traningsplaneraren-2` folder |
| 17 | PASS | `ac17-selectors.txt` (65 selectors) |
| 18 | PASS | text identical to HANDOFF §7 |
| 19 | Not run | needs Christoffer's OK for the routine; `weekly.sh` is not run |

## Main baseline (main 9a087c3, see `main-smoke-baseline.txt`)
Many scripts already fail on main: the old UI texts «Tomt pass»/«Från mall» are gone (s33 AC21/22/16 and S32-AC29+), and s42–s45 pass only 1–2 of their checks. These are marked `trasig` and compared against the baseline. They are not fixed in this slice.
