# Verification checklist — Slice 01 (v2 — locked)

**Slice passes when** a new coach can open the app, understand the five blocks, add visual activities, and leave with a coherent ~45–60 min session — without help outside the app.

**Locked rules (pass/fail definitions)**
- **Soft mismatch warning:** Non-blocking inline banner on the destination block; names the usual block type; item **stays**; dismissible. Covers (a) add via override from filtered picker and (b) move across blocks.
- **Obvious template path:** From blank builder chrome, start a template in ≤2 taps (top-bar CTA and/or Templates tab).
- **Visual:** Every seed card has a non-text visual (emoji/icon via `visualKey` OK). Title-only library = fail.
- **~45–60 min:** Item-sum total in **[45, 60]** inclusive. Empty block budgets do not count toward the sum.
- **Under 10 min:** Wall clock from first builder open → session they’d run (Save draft enough if Save works) ≤ 10:00.
- **Explain blocks:** Own words, one correct purpose each; in-app tips allowed. Wrong purpose fails that item only.
- **High-risk:** Only activities with `watchForRequired: true` auto-fail if `watchFor` is empty. Seed list must mark these before ship.
- **Seed count:** Prefer ≥6 activities per block type; if fewer, dated note in `slice-01/` naming the stub set (Docs).
- **Session total:** **Computed only** from item durations in Slice 01 (not independently editable). Blank shows `0 / 60`.
- **Block order:** Locked. Items reorder within a block only.
- **Home:** Minimal home is **in scope**: New · Start from template · Continue last draft.
- **Scope guard:** Stub export, no video player, no auth/timer/athletes must **not** cause FAIL.

**Block budgets (empty defaults):** Gathering 5 · Warm-up 10 · Techniques 20 · Strength 15 · Fun and games 10.

**Block color/icon map**
| Block | Color token | Icon hint |
|---|---|---|
| Gathering | amber | users / wave |
| Warm-up | sky | flame / stretch |
| Techniques | violet | spark / skill |
| Strength | rose | dumbbell |
| Fun and games | green | smile / play |

## Product / UX
- [ ] Minimal home: New session · Start from template · Continue last draft
- [ ] Blank session shows five blocks in order: Gathering → Warm-up → Techniques → Strength → Fun and games
- [ ] Session title editable in top bar
- [ ] Live total vs target shown (e.g. `0 / 60`, then `45 / 60`)
- [ ] Each block shows budget vs filled; soft overflow when items exceed block budget
- [ ] Empty block shows tip + one clear Add CTA; returns after removing last item
- [ ] Activity cards: visual + title + duration (not title-only)
- [ ] Stubs visibly labeled as stubs in UI
- [ ] Picker opened from a block filtered to that block type by default
- [ ] Soft mismatch warning on add-override and on move (see locked rule)
- [ ] Reorder items within a block
- [ ] Template path ≤2 taps from blank builder; confirm before replace; cancel leaves session unchanged
- [ ] Tips panel shows block-level tip for selected block
- [ ] Activity detail: Summary, How to, Watch for; actions Add + Add-and-edit-duration
- [ ] Color/icon language matches the map above
- [ ] Export is stub (disabled / Coming soon) — does not fail the slice

## Data / persistence
- [ ] Save draft + reload restores title, blocks, items, durations
- [ ] Continue last draft from home works
- [ ] Template clone sets `basedOnTemplateId`; template not mutated
- [ ] Removing an item does not delete the library Activity
- [ ] Session total = sum of items only (computed)

## Content
- [ ] Empty-state tip string per block type
- [ ] ≥6 activities per block type OR dated stub-set note in `slice-01/`
- [ ] Every `watchForRequired: true` activity has non-empty Watch for

## New-coach test (manual)
- [ ] Device class recorded (desktop/tablet)
- [ ] Tester type recorded (real new coach vs stand-in); no external coaching
- [ ] Creates item-sum total in [45, 60] in ≤10:00 wall clock
- [ ] Explains each block’s purpose in own words (tips allowed)

## Automatic fail
- Builder/home opens with no path to five blocks + CTA
- Library is title-only (no visuals)
- No ≤2-tap template path
- Soft mismatch warning missing on both override-add and move (when those actions exist)
- Save draft does not restore after reload
- Any `watchForRequired` technique missing Watch for

## Verifier notes
Record: date, build path/URL how to run, environment, device, tester type, pass/fail per section, concrete gaps for Planner.
