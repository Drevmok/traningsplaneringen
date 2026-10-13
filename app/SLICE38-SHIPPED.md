# Slice 38 — Kör passet «Kvar: X min» (SHIPPED, local only)

Worktree `/workspace/gp-s38`, branch `slice-38-code` off `origin/slice-38-docs` (2bb6123, main 1769eca). Not pushed, no upstream, not merged. No SQL.

## Change (exactly per HANDOFF)
- `lib/runPass.ts`: `runRemainingSeconds(steps, index, left)` and `runLeftText(...)` (ceil to whole minutes).
- `components/RunPass.tsx`: `<p className="run-left">` directly after `.run-next`; no role / aria-live / aria-label; clock label unchanged.
- `data/blockMeta.ts`: `runLeftLabel: 'Kvar: {n} min'` (after `runLastActivity`); `SLICE_NUMBER = '38'`.
- `export.css`: `.run-left` (#a8a29e, 0.9rem, tabular-nums, nowrap).
- Tests: Slice 38 asserts in `feedback.test.ts` (25/45/46) and `clubTemplates.test.ts:316`; new `lib/runLeft.test.ts` (5 tests).

## Open items
1. 390×844 with long text: Föregående / Nästa övning stay on screen (nav bottom 828 ≤ 844); only `.run-script` scrolls (overlay has no overflow). No CSS change needed.
2. Contrast: #a8a29e on the run background #1c1917 = 6.93:1, which passes WCAG 2.x AA for small text (4.5:1). Kept; the #d6d3d1 fallback was not needed.
3. Verifier feature map: not touched (Verifier's call; outside Builder scope).

## Bundle (gzip -9, dist/assets JS+CSS; main 1769eca → branch)
Total 216 895 → 216 969 (+74 B) · coach-facing eager 152 994 → 153 079 (+85 B; RunPass is in the eager bundle; lazy −11 B). Limit +512 B: OK.

## Verification
bun test src 170/0 (23 files) · bun test tools/bank 21 pass/5 skip/0 fail · tsc OK · lint 0 errors · npm run build OK.
Smoke `verifier/slice-38-builder-smoke.mjs` (plain preview :4198, fake clock, 390×844): 26/26 PASS; screenshots /workspace/screenshots/slice38_01…06.

## Deviations
- AC9/AC11 long title and long safety text are injected into the DOM (as in the Slice 34 smoke) rather than coming from a seed drill.
- AC12 (VoiceOver) checked structurally (no role/live/aria-label, DOM order clock → Nästa → Kvar), not with a real screen reader.
- AC14 checked on Passbyggaren only; Home/Hall/Golvklart/Bibliotek untouched by the diff (only RunPass + a new key + .run-left CSS).
- AC17: tone/wake lock not re-driven; Nästa/Sista aktiviteten/pause covered.
