# Slice 39 — Verification checklist

**Viewport:** 390×844 portrait (iPhone 12–15 class). Start each run with clean site data unless the row says otherwise. «Reload» = full page reload; «close» = close the tab and reopen the app URL.

| # | Check |
|---|---|
| AC1 | Passbyggaren: no **Spara utkast** button anywhere (action row, Fler, sheets) |
| AC2 | Add a station to a pass → within ~1 s «Sparat» shows, muted, in the action row; reload → Home **Fortsätt passet** shows the change |
| AC3 | Rapid edits (title typing, 5 duration taps) → one write after ~800 ms quiet, not one per keystroke (localStorage spy or devtools) ; «Sparat» does not blink |
| AC4 | Edit, then tap **Till startsidan** within 300 ms → Home shows the new title / minutes (flush) |
| AC5 | Edit, then close the tab within 300 ms → reopen → change is kept (pagehide / visibilitychange flush) |
| AC6 | **Starta från mall** (built-in) → apply → at once tap Home → Fortsätt passet shows that mall's pass; reload keeps it, placements included |
| AC7 | Föreningsmall, Mina mallar and the wizard: same as AC6 |
| AC8 | **Tomt pass** with a stored pass on Home → go back Home without adding → Home still shows the old pass; «Sparat» was not shown |
| AC9 | Tomt pass → add first station → «Sparat» appears, Home now shows the new pass; the old pass (had stations) is in **Mina mallar** under its title |
| AC10 | Editing the same pass many times → Mina mallar gets no new entries; Home shows one pass |
| AC11 | Replacing twice with the same old pass contents → only one archived copy (dedupe) |
| AC12 | Pass with empty title → Home meta and archived mall show «Nytt pass» |
| AC13 | Existing draft from main (seed `gymnastics-planner-draft-v1` before deploying branch) → loads unchanged via Fortsätt passet; no data lost; first edit overwrites in place (same id) |
| AC14 | Storage full (stub `setItem` to throw) → «Inte sparat» in the row, one toast with the exact text; no crash; further edits do not repeat the toast; un-stub → next edit shows «Sparat» |
| AC15 | Private mode (Safari private) → app works; either saves or shows AC14 fallback; no blank screen |
| AC16 | Remove last station from a stored pass → still saved (Home shows 0 min pass), not skipped |
| AC17 | Screen reader (VoiceOver): «Sparat» read in order, not announced on each save; failure toast announced once |
| AC18 | At 390 px the action row fits on one line or wraps cleanly; «Sparat» never overlaps **Kör passet** / Hallöversikt / Fler |
| AC19 | Hallöversikt, Golvklart, Kör passet, Ny vecka, import, receive-a-pass behave as before; **Använd alla förslag** still needs a tap |
| AC20 | Bundle delta ≤ +512 B gz (soft): main vs branch, sum of `gzip -9c` for `dist/assets/*.js` + `*.css`; numbers in PR, overrun explained |
| AC21 | `npm run build`, `npm test` (and lint/typecheck if present) green; Slice 39 asserts in `feedback.test.ts` and `clubTemplates.test.ts` |
| AC22 | Strings verbatim per `content/microcopy.sv.md`; `saveDraft` / `savedToast` keys gone; footer «Träningsplaneraren · Slice 39»; no exclamation marks |
