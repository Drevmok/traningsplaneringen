> **Superseded (Slice 32 · E1).** New exercises no longer go into `seedActivities.ts` by PR. Planner pushes an approved `promote.json` straight into the shared bank as *pending* rows with `bun tools/bank/push-promote.ts` (see [`slice-31/content/bot-writes.md`](../../slice-31/content/bot-writes.md) and [`tools/bank/README.md`](../../tools/bank/README.md)); Christoffer approves them in the app (Logga in som admin → Biblioteket → Väntar på godkännande). Step 3 below (promote.json + `seedId`) still applies; steps 4–5 do not. Kept for history.

# Seed promotion — Planner → Builder (B3 · process, no UI)

How an imported drill becomes part of the shipped bank (`app/src/data/seedActivities.ts`). In-app import (own exercises) is instant and device-local; this path is curated and reaches every coach after a PR + Pages republish.

## Steps

1. **Coach tries it.** Christoffer imports Planner's file, runs the drills, edits text in-app if needed.
2. **Coach picks.** In Planner chat: "lägg X och Y i banken" (optionally pastes the edited text, or exports the pass JSON that carries the own drills).
3. **Planner writes a promote file** next to the trial: `import-trials/<videoId>/promote.json` — same schema v1, plus per exercise:
   - `seedId`: block-prefixed id (`tech-…`, `warm-…`, `strength-…`, `fun-…`, `gather-…` — match existing prefixes), unique in `seedActivities.ts`.
   - `needsCoachReview: false` **only** for text Christoffer approved word-for-word; otherwise `true`.
   - `newCoachOk` / `experiencedCoachOnly` decided explicitly.
   - Run `python3 slice-30/content/check_import.py promote.json`.
4. **Planner pings Builder** with the promote file path (normal pipeline; Christoffer gate already passed in step 2).
5. **Builder adds seeds** (one PR, title like *Nya övningar från <kanal>*):
   - Append entries in the block's section of `seedActivities.ts` with `source` (`url`, `creator`, optional `title`, `startSeconds`).
   - Safety → `ACTIVITY_SAFETY` in `activityTips.ts` (current seed style; seeds do not use `safetyLine` today). `validateTipCatalog` must stay clean (`activityTips.test.ts`).
   - Tags: add `new-coach-ok` when `newCoachOk`; keep zone tags (`trampett` / `vault` / `floor`).
   - Redskap only from the fixed library; links (`progressionOf` / `regressionOf`) rewritten to seed ids.
   - Update the header count comment in `seedActivities.ts`.
   - `npm run build` green; tests green.
6. **Own copies stay.** No auto-merge: a coach's own `own-imp-…` copy keeps living next to the new seed; they can delete it. (Dedup is out of scope.)
7. **Verifier** spot-checks: new seeds show Källa, tips valid, no copied captions, no images added to `app/public`.

## Rules

- Text in our own words; never paste transcript lines.
- No thumbnails / frames / video files in `app/` (trial frames stay in `import-trials/`, which is **not** shipped).
- One video → one promote file → one PR. Keep PRs small.
