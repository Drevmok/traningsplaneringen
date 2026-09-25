# Verifier default lens (until Planner supplies a slice checklist)

Use for each slice. Report **PASS / FAIL / BLOCKED** with concrete notes. Do not rewrite the product; send findings to Planner.

## 1. New-coach cold start
- Can a coach who has never used the app start a useful session plan in a few minutes?
- Are empty states and first-run cues clear enough to act without reading docs?
- What's the shortest path from open app → usable session plan?

## 2. Happy path (slice core flow)
- Walk the primary flow end-to-end against Planner's acceptance criteria.
- Note any step that stalls, confuses, or requires out-of-band knowledge.

## 3. Edge cases
- Empty / missing data
- Invalid or incomplete input
- Back / cancel / leave mid-flow
- Duplicate or already-used items (if relevant)
- Small screen / obvious layout breakage (if UI)

## 4. Gaps vs criteria
- List each acceptance item: met / partial / missing
- Call out unspecified behavior that still blocks a coach in practice

## Report format (to Planner)
- Slice / build under test
- Overall: PASS | FAIL | BLOCKED
- Cold-start: ...
- Happy path: ...
- Edge cases: ...
- Criteria checklist: ...
- Concrete gaps (actionable, not vague)
