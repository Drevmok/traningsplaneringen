# Seed promotion 2DJ_oMM81mI — Builder smoke

**Date:** 2026-10-02 · **Branch:** `seed-2DJ_oMM81mI` (from origin/main e4f06ff, includes merge 1febe46)
**Batch:** 11 Teknik seeds from Prime Coaching Sport, “Fun gymnastics stations” (https://youtu.be/2DJ_oMM81mI); all drafts except #4 Spindelmannen uppför kil.
**How:** `node verifier/seed-2DJ_oMM81mI-smoke.mjs`, headless Chrome (playwright-core), 390×844, local `npm run preview` on 127.0.0.1:4173. Fresh browser profile (no own drills).

**Result: PASS 64 / FAIL 0**

Also: `bun test src` 57 pass / 0 fail (new `src/data/seedActivities.test.ts`), `npm run build` green.

## Behöver granskas (seed-promotion.md)

seed-promotion.md step 3: `needsCoachReview: false` only for text Christoffer approved word-for-word, otherwise `true`. No word-for-word approval was given (batch approval only), so all 11 seeds carry `needsCoachReview: true` (unit test). Slice 30 D1 / AC 29 shows the badge on **own** drills only, so the seeds show **no** badge, hint or Markera som granskad anywhere (checks Dna, Dnc, P1) — same as the existing review-flagged seeds (Närvaro etc.).

## Sketch check

Each sketch mark is classified by its colours from `equipmentMark.tsx` (cushion = madrass / approach cushion, wedge = kilmatta, block = skumblock, bar = räcke, beam = bom, hoop = rockring, landing = landningsmatta). #2 draws the 4 approach cushions (no runway piece), as for every trampett/satsbräda station.

## Checks

| ID | Check | Result | Detail |
| --- | --- | --- | --- |
| F | Footer still Träningsplaneraren · Slice 30 | PASS |  |
| L1 | All 11 promoted seeds listed in Bibliotek (Teknik) | PASS | 24 Teknik drills |
| L2 | Spindelmannen (#4) not listed | PASS |  |
| L3 | Search "Spindel" finds nothing | PASS |  |
| L4 | New seeds are not marked Egen (fresh device, no own drills) | PASS | own badges=0 |
| D1a | #1 Grenhopp från trampett: exactly one card, no Behöver granskas badge | PASS |  |
| D1b | #1 Källa line | PASS | "Källa: Prime Coaching Sport · 0:16 ↗" https://youtu.be/2DJ_oMM81mI?t=16 |
| D1c | #1 no badge / hint / Markera som granskad in detail; no video embed | PASS |  |
| D1d | #1 Teknik · 6 min | PASS | Teknik · 6 min |
| D2a | #2 Formhopp över block från trampett: exactly one card, no Behöver granskas badge | PASS |  |
| D2b | #2 Källa line | PASS | "Källa: Prime Coaching Sport · 0:30 ↗" https://youtu.be/2DJ_oMM81mI?t=30 |
| D2c | #2 no badge / hint / Markera som granskad in detail; no video embed | PASS |  |
| D2d | #2 Teknik · 6 min | PASS | Teknik · 6 min |
| D2e | #2 sketch draws cushion cushion cushion cushion trampett block landing | PASS | cushion cushion cushion cushion trampett block landing |
| D3a | #3 Äggrullning nerför kil: exactly one card, no Behöver granskas badge | PASS |  |
| D3b | #3 Källa line | PASS | "Källa: Prime Coaching Sport · 0:50 ↗" https://youtu.be/2DJ_oMM81mI?t=50 |
| D3c | #3 no badge / hint / Markera som granskad in detail; no video embed | PASS |  |
| D3d | #3 Teknik · 6 min | PASS | Teknik · 6 min |
| D3e | #3 sketch draws cushion wedge | PASS | cushion wedge |
| D5a | #5 L-häng i räcke: exactly one card, no Behöver granskas badge | PASS |  |
| D5b | #5 Källa line | PASS | "Källa: Prime Coaching Sport · 1:39 ↗" https://youtu.be/2DJ_oMM81mI?t=99 |
| D5c | #5 no badge / hint / Markera som granskad in detail; no video embed | PASS |  |
| D5d | #5 Teknik · 6 min | PASS | Teknik · 6 min |
| D5e | #5 sketch draws bar landing | PASS | bar landing |
| D6a | #6 Stöd på räcke med pendel: exactly one card, no Behöver granskas badge | PASS |  |
| D6b | #6 Källa line | PASS | "Källa: Prime Coaching Sport · 1:55 ↗" https://youtu.be/2DJ_oMM81mI?t=115 |
| D6c | #6 no badge / hint / Markera som granskad in detail; no video embed | PASS |  |
| D6d | #6 Teknik · 6 min | PASS | Teknik · 6 min |
| D6e | #6 sketch draws bar landing | PASS | bar landing |
| D7a | #7 Åsnesparkar: exactly one card, no Behöver granskas badge | PASS |  |
| D7b | #7 Källa line | PASS | "Källa: Prime Coaching Sport · 2:26 ↗" https://youtu.be/2DJ_oMM81mI?t=146 |
| D7c | #7 no badge / hint / Markera som granskad in detail; no video embed | PASS |  |
| D7d | #7 Teknik · 6 min | PASS | Teknik · 6 min |
| D8a | #8 Minihjul (krabbhjul): exactly one card, no Behöver granskas badge | PASS |  |
| D8b | #8 Källa line | PASS | "Källa: Prime Coaching Sport · 2:45 ↗" https://youtu.be/2DJ_oMM81mI?t=165 |
| D8c | #8 no badge / hint / Markera som granskad in detail; no video embed | PASS |  |
| D8d | #8 Teknik · 6 min | PASS | Teknik · 6 min |
| D9a | #9 Soldatsparkar på bom: exactly one card, no Behöver granskas badge | PASS |  |
| D9b | #9 Källa line | PASS | "Källa: Prime Coaching Sport · 3:04 ↗" https://youtu.be/2DJ_oMM81mI?t=184 |
| D9c | #9 no badge / hint / Markera som granskad in detail; no video embed | PASS |  |
| D9d | #9 Teknik · 6 min | PASS | Teknik · 6 min |
| D9e | #9 sketch draws beam landing | PASS | beam landing |
| D10a | #10 Krabbgång längs bom: exactly one card, no Behöver granskas badge | PASS |  |
| D10b | #10 Källa line | PASS | "Källa: Prime Coaching Sport · 3:25 ↗" https://youtu.be/2DJ_oMM81mI?t=205 |
| D10c | #10 no badge / hint / Markera som granskad in detail; no video embed | PASS |  |
| D10d | #10 Teknik · 6 min | PASS | Teknik · 6 min |
| D10e | #10 sketch draws beam | PASS | beam |
| D11a | #11 Ljushopp i rockringar: exactly one card, no Behöver granskas badge | PASS |  |
| D11b | #11 Källa line | PASS | "Källa: Prime Coaching Sport · 3:47 ↗" https://youtu.be/2DJ_oMM81mI?t=227 |
| D11c | #11 no badge / hint / Markera som granskad in detail; no video embed | PASS |  |
| D11d | #11 Teknik · 6 min | PASS | Teknik · 6 min |
| D11e | #11 sketch draws hoop hoop hoop hoop | PASS | hoop hoop hoop hoop |
| D12a | #12 Landningar upp på och ner från plint: exactly one card, no Behöver granskas badge | PASS |  |
| D12b | #12 Källa line | PASS | "Källa: Prime Coaching Sport · 4:05 ↗" https://youtu.be/2DJ_oMM81mI?t=245 |
| D12c | #12 no badge / hint / Markera som granskad in detail; no video embed | PASS |  |
| D12d | #12 Teknik · 6 min | PASS | Teknik · 6 min |
| D12e | #12 sketch draws plint | PASS | plint |
| B1 | Grenhopp links: Bygger på Landningar… / Lättare variant av Formhopp… | PASS | Bygger på: Landningar upp på och ner från plint / Lättare variant av: Formhopp över block från trampett |
| B2 | Minihjul: Lättare variant av: Hjul | PASS | Lättare variant av: Hjul |
| P1 | Seed can be added to Teknik (no badge on pass row) | PASS |  |
| P2 | Pass-row info panel: Källa line + seed safety line | PASS | Källa: Prime Coaching Sport · 3:47 ↗ |
| I1 | Importing the old trial file now shows Samma namn finns redan (seed exists) | PASS | Samma namn finns redan/Samma namn finns redan |
| W1 | Planera pass wizard → five blocks filled, Teknik pre-placed | PASS | filled=5 zones=trampett,trampett,open |
| E | No page errors | PASS |  |

## Screenshots (`/workspace/screenshots/`)

`seed2dj_library.png`, `seed2dj_detail_01.png`, `seed2dj_detail_02.png`, `seed2dj_detail_03.png`, `seed2dj_detail_05.png`, `seed2dj_detail_09.png`, `seed2dj_detail_11.png`, `seed2dj_detail_12.png`, `seed2dj_pass_row_tip.png`, `seed2dj_import_samename.png`, `seed2dj_wizard.png`

## Notes

- First run was 63/1: D11e failed because the hoop mark is a bare `<ellipse>`, not a `<g>`, and the classifier skipped it. The screenshot showed four rings. The classifier was fixed and the rerun is 64/0. This was a harness bug, not an app bug.
- `/usr/local/lib/node_modules/playwright-core` was gone from the box, so playwright-core was installed to `/tmp/pw`. The script reads `PW_CORE` to override that path.
- I1: importing the old trial file (`slice-30/content/example-import.json`) now shows **Samma namn finns redan** for both rows, because those titles are now seeds. This is the intended dubblett behaviour. A coach's existing own copies stay next to the seeds (seed-promotion step 6).
- Preview storage on 127.0.0.1:4173 holds test data only; this is not Christoffer's device. The preview server is stopped.
