# Slice 34: formal verification report (Kör passet tone at 0 + «Nästa: …» line)

- **Date:** 2026-10-09, ~21:50–22:30 CEST (Europe/Stockholm)
- **Verifier:** Verifier
- **Code under test:** PR #37, branch `slice-34-code` at **`41421ce`** (parent `337f8d3` = docs pack, on `main` @ `f987da8`). `git pull --ff-only` was a no-op; working tree clean. Not merged.
- **Pack:** `slice-34/` LOCKED 2026-10-09 (README A1–F1, HANDOFF, microcopy, checklist AC1–20).
- **Driver:** Playwright (playwright-core) headless Chrome, 390×844, DPR 2, touch, `page.clock` fake time. Branch `vite preview` on 127.0.0.1:4341, main (`f987da8`, worktree `/tmp/s34main`) on 4342. Both stopped after the run.
- **Instrumentation:** an init script subclasses the **real** `AudioContext` (and `webkitAudioContext` if present); every `createOscillator()` / `createBufferSource()` node gets its `.start()` wrapped and logged with `Date.now()` and the current step `<h1>`; `navigator.vibrate` is wrapped the same way. Script: `verifier/slice-34-verify.mjs` (32/32 PASS). Test pass = Builder's `#dela=` token (`verifier/slice-34-mktoken.ts`): 4 steps over 2 blocks — Uppvärmningsvarv (hallen runt) 1 min → Uppvärmningsdans 1 min → Landningar upp på och ner från plint **0 min** → Formhopp över block från trampett 1 min.

### Verdict: **PASS (headless) — ready to merge.** AC 6, 7, 8, 9, 10, 15 PENDING-real (Christoffer's iPhone + Android after merge).

| AC | Verdict at 41421ce | Short |
| --- | --- | --- |
| 1 | **PASS** | exactly 1 oscillator `.start()` per step run at 00:00 (step 1: 1, step 2: 1, step 4: 1); none before 0 (00:01 → 0 starts) |
| 2 | **PASS** | 150 s past 0 on steps 1, 2, 4: no further starts, no further vibrate |
| 3 | **PASS** | at 00:00 the step stays (h1 unchanged, «Tiden är ute», 00:00) for 150 s; only Nästa övning moves on |
| 4 | **PASS** | pause at 00:10, +130 s paused → 0 tones; resume → none at 00:01, 1 at 0. Pause/resume after 0 → no 2nd tone (Builder smoke AC4d) |
| 5 | **PASS** | Nästa övning / Föregående / arrows / Avsluta: 0 tones; 0-min step: 0 tones after 130 s |
| 6 | PENDING-real · local PASS | Kör passet tap creates 1 context + plays the 1-sample silent prime (1 buffer-source start) inside the tap; tone at first 0 with no extra tap |
| 7 | PENDING-real | code does not touch `navigator.audioSession`; nothing to test headless |
| 8 | PENDING-real · sim PASS | `vibrate(200)` exactly once with each tone (5 tones ↔ 5 vibrates, all `200`) |
| 9 | PENDING-real · sim PASS | `vibrate` undefined: 0 errors, timer OK, 4 buttons, tone still plays |
| 10 | PENDING-real · sim PASS | Builder smoke: wall clock +10 min → exactly 1 tone on return |
| 11 | **PASS** | «Nästa: Uppvärmningsdans», block boundary «Nästa: Landningar upp på och ner från plint», «Nästa: Formhopp över block från trampett» |
| 12 | **PASS** | last step «Sista aktiviteten» |
| 13 | **PASS** | `nowrap` + `ellipsis`, scrollWidth 390; Builder smoke long-title overlay: one line, no overlap |
| 14 | **PASS** | Kör passet controls main = branch (Avsluta, clock, Föregående, Nästa övning); all other surfaces identical control lists; no banner/toast |
| 15 | PENDING-real · docs PASS | E1 documented in README + microcopy; no coach-facing text added |
| 16 | **PASS** | 0 AudioContexts on home, Passbyggaren, Bibliotek, Hall, Golvklart, #dela=; screenshots main vs branch pixel-identical except the footer digit |
| 17 | **PASS** | gzip -9 all JS+CSS: 212 912 → 213 408 B (**+496 B**); eager (index js+css+jsx-runtime): 150 683 → 151 181 B (+498 B) |
| 18 | **PASS** | `npm run build` (tsc -b + vite) green; `bun test src` 139/0; oxlint 0 errors (warnings pre-existing). Note: no `npm test` script exists; `bun test src` is the suite |
| 19 | **PASS** | clock auto-starts/pauses/resumes as before; wake lock/full screen code untouched; no Slice 31–33 file in the diff; 139 tests pass |
| 20 | **PASS** | strings verbatim from `blockMeta.ts` and on screen; footer «Träningsplaneraren · Slice 34»; no «!» |

## Tone counts

| Step | Event | osc `.start()` | vibrate |
| --- | --- | --- | --- |
| 1 Uppvärmningsvarv (hallen runt) | 59 s → 0 starts; 61 s → 1; +150 s → 1 | 1 | 1 |
| 2 Uppvärmningsdans | Nästa övning → 0; pause at 00:10, +130 s → 0; resume +9 s → 0; +2 s → 1; +150 s → 1 | 1 | 1 |
| 1 (back via Föregående) | clock restarts at **01:00**, no tone on return; re-run reaches 0 → 1; +120 s → 1 | 1 | 1 |
| 3 Landningar… (0 min) | open + 130 s → 0 | 0 | 0 |
| 4 Formhopp… | 61 s → 1; +150 s → 1 | 1 | 1 |
| Re-enter Kör passet after Avsluta | immediate 0, at 0 → 1, +150 s → 1; still one AudioContext total | 1 | 1 |

Silent prime: 1 buffer-source start, only in the first Kör passet tap.

**Back-navigation judgement:** going back to a finished step starts a new clock run at the full time (pre-existing behaviour) and that run sounds once at its own 0. HANDOFF §4 explicitly allows this ("Going back to a step and running it again may fire again — that is a new run of that step"); AC1 says "once per step **run**", AC5 says manual navigation never plays the tone, and it doesn't (no tone on the tap or on arrival). PASS.

## Missing APIs

| Run | API state | Clock 01:00 → 00:30 → 00:00, next step 01:00 → 00:55 | «Tiden är ute» | buttons | errors |
| --- | --- | --- | --- | --- | --- |
| no AudioContext | `AudioContext`, `webkitAudioContext` undefined | OK | 1 | 4 | 0 |
| no vibrate | `navigator.vibrate` undefined | OK (tone 1, vibrate 0) | 1 | 4 | 0 |
| neither | all three undefined | OK | 1 | 4 | 0 |

## Placement and strings

DOM order in `.run-pass`: `run-top > H1 > run-clock > run-status («Tiden är ute», at 0) > run-next > run-script > run-nav` — under the timer, above the script, as C1/HANDOFF §5. `run-next`: 16 px, `rgb(214,211,209)`, no `role`, no `aria-live`.

## Outside Kör passet

`git diff --stat f987da8..41421ce`: 18 files. App code: `RunPass.tsx`, `runPass.ts`, `runSignal.ts` (+test), `export.css` (`.run-next` only), `blockMeta.ts` (2 keys + footer), and **one-line `unlockRunSignal()` calls in the Kör passet click handlers of `SessionBuilder.tsx` and `SharePass.tsx`** (required by B1/HANDOFF §1; no visible change). Docs: `slice-34/`, `docs/ui-chrome.sv.md`, `slice-31/content/setup-christoffer.md` (both in the docs commit `337f8d3`), `app/SLICE34-SHIPPED.md`. Verifier: Builder smoke + token helper + results.
Surface smoke main vs branch: home, Planera pass/Passbyggaren, Fler-menu, Biblioteket, Hallöversikt, Golvklart, #dela= — identical control lists, 0 console/page errors, screenshot diff confined to a 13×19 px box at the footer «33» → «34».

## Secrets

`rg 'sb_secret_[A-Za-z0-9]|eyJ…\.eyJ'` over repo (minus node_modules/.git), `app/dist`, `.github`: 0 hits.

## Builder smoke

`verifier/slice-34-builder-smoke.mjs` re-run against 4341: **PASS 31 / FAIL 0** (its results file was restored to Builder's committed copy, not re-committed).

## Concerns (non-blocking)

1. **C1 (info):** `npm test` isn't a script in `app/package.json`; the checklist's "npm test" is satisfied by `bun test src`. Docs could say so.
2. **C2 (info):** `SessionBuilder.tsx` / `SharePass.tsx` are touched outside the RunPass file (one import + one call each). Spec-sanctioned (B1), invisible, no AudioContext before the tap.
3. **C3 (info):** On the last step the disabled «Sista övningen» button is near-invisible on the dark background (pre-existing, same on main).
4. **C4 (pending-real):** iOS silent switch, real vibration, backgrounding and screen-lock can only be confirmed on devices.

## Screenshots

`verifier/slice-34-screenshots/`: `s34v_nasta.png`, `s34v_timeup.png`, `s34v_sista.png`, and `s34v_{main,branch}_{home,planera,bibliotek,hall,golvklart,dela}.png`.
