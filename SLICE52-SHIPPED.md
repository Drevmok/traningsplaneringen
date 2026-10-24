# Slice 52 — Kvarvarande smoke-fel (infra)

Base: main 84b44e7 · docs: slice-52-docs 1ec4ed8 · branch: slice-52-code. App bundle diff: 0 B (`git diff --stat origin/main -- app/` is empty, 215152 B gzip TOTAL both). SLICE_NUMBER stays '49'.

## What changed
- **A1 (anpassa):** s43 AC5 checks the exact visible header labels per state («Ändra stationer», «Visa/Dölj flöde», «Förrådslista», «Golvklart», + «Använd alla förslag» with the saknar banner; Slice 48 B1 / 49 D1). s45 wizard waits for «Fokus» then «Hall». s46 AC10 expects «90 / 90 min» (Slice 49 A1); s46 AC17 uses «Använd mall». s45 AC14-tall: tall sheet = not compact, bottom 844, height ≥ 85 % vh.
- **B1:** `verifier/fixtures/old-share-links.json` — real `#dela=` tokens made once by 0d88da5 (s44) and 7213051 (s45, parent of cd19319), hall standard-trupp, dated 2026-10-24, no ports. s44 AC6/AC12 and s45 AC10 open the branch build + token; the main step and 4410/4444 rewriting are gone.
- **C1:** s43 AC3/`ratioOk` removed, AC1/AC2 only Gymmix halls; s43 AC7 requires `.hall-flow-coach-tip`; s37 AC9a/b/e require the toast text `TOAST` (AC9b: no `OLD_NOTE`).
- **D1:** run-smokes without `--baseline` exits 1 when any script exits ≠ 0; with `--baseline` unchanged. Playwright pinned (`PW_VERSION=1.63.0-alpha-2026-08-31`, `PW_REV=1243`) in lib.sh/install-once/pw_ok.
- **E1:** `verifier/slice-52-admin-import-smoke.mjs` + `verifier/fixtures/s52-import.json` (IMP1–IMP6) on the s47 fake Supabase.
- **F1:** Doctor builds the baseline with `$MC/wt/verifier/tools/run-smokes.sh` and validates it (`baseline_ok`); bad file → `smoke-baseline.invalid.txt` + BLOCKED. `run-smokes --baseline` refuses a bad file (exit 2). The 055af39 file on the box is renamed `smoke-baseline.invalid.txt` (not checked in).

## Evidence (`verifier/slice-52-checks/`)
- `before/` — s37, s43–s46 on 84b44e7 (from the Doctor baseline run): 7 FAIL (s43 AC5; s44 AC6; s45 AC1, AC10, AC14-tall; s46 AC10, AC17), same causes as the README table. s37 was 24/24 already (the weak checks let it pass).
- `c1-fault.txt` (AC8), `e1-fault.txt` (AC13), `d1-rc.txt` (AC9/AC10/AC14a), `d1-install.txt` (AC11), `f1-doctor-blocked.txt` (AC14b), `greps.txt` (AC3/AC4/AC6/AC15), `loop.txt` (AC16).

## Deviation (AC16)
The runner (Slice 51 rule) calls «fewer PASS than the baseline» NY FAIL. s43 has 18 checks now instead of 21 (AC3 removed and AC1/AC2 only over the two Gymmix halls, per C1), so against the 84b44e7 baseline (20/21) s43 is reported `NY FAIL (PASS 20→18, FAIL 1→0)` in every run although it is 18/18, exit 0. Not changed (out of scope); it goes away with the next main cache after merge. Suggestion for Slice 53: count removed check ids separately.

## Open for Slice 53
Known FAIL in s33 (12), s34 (2), s35 (13), s36 (4), s38 (1), s39 (5), s40 (4), s41 (2), s47 (3) — unchanged (SAMMA).
