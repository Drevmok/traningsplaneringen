# Slice 28 — Mall Samling within budget: code evidence

**Scope:** formal code-only verification of locks A1/B1/C1/D1/E1/F1. No product code was changed while gathering this evidence.

**Result:** all six locks **PASS** from source and repository scope.

## Evidence basis / Slice 28 scope

The Slice 28 product-code diff is limited to `app/src/data/seedTemplates.ts` and `app/src/data/blockMeta.ts` (2 files, 2 insertions, 2 deletions). `seedActivities.ts`, `session.ts`, Home, and hall components are not changed product-code files in this slice. The citations below are from the current source tree.

## A1 — beginner mall uses the Soft pair (PASS)

- `app/src/data/seedTemplates.ts:32-37` — `beginnerBlocks` gathering is authored as:
  > `item('gather-narvaro', 3, 0)`
  > `item('gather-dagens-teknik', 3, 1)`
- `app/src/data/seedTemplates.ts:76-84` — the template is `id: 'tmpl-beginner-60'` and uses `blocks: beginnerBlocks`.
- Therefore the beginner default gathering is Närvaro 3 + Dagens pass 3 = **6**, and `gather-valkomstcheck-in` is not in that gathering default. The same source shows Välkomstcheck-in separately in the short mall at `app/src/data/seedTemplates.ts:51-54`.
- Other beginner blocks remain authored with their existing spot-check contents: warmup 1 item (`warm-hall-varv`) at `app/src/data/seedTemplates.ts:38`; techniques 3 items (`tech-ljushopp-satsbrada`, `tech-handstaende-falla-rygg`, `tech-falla-bakat-hojd`) at `:39-43`; strength 2 items (`strength-styrkelatar`, `strength-burpee-emom`) at `:44-47`; fun 1 item (`fun-rundpingis-medicinboll`) at `:48`.

**A1: PASS**

## B1 — short mall remains Välkomstcheck-in only (PASS)

- `app/src/data/seedTemplates.ts:51-54` — `shortBlocks` gathering is exactly:
  > `block('gathering', [item('gather-valkomstcheck-in', 5, 0)])`
- `app/src/data/seedTemplates.ts:87-93` — `tmpl-short-45` uses `blocks: shortBlocks`.

Thus the short mall remains one Välkomstcheck-in item at 5 minutes, unchanged and within the 6-minute budget.

**B1: PASS**

## C1 — budget and Soft blank/clone behavior (PASS)

- `app/src/data/blockMeta.ts:11-17` — `BLOCK_BUDGETS.gathering` is `6`; the other block budgets are also present and unchanged in the same record.
- `app/src/lib/session.ts:38-48` — `createBlankSession` still has the Slice 27 Soft blank inject:
  > `createSessionItem('gather-narvaro', 3, 0)`
  > `createSessionItem('gather-dagens-teknik', 3, 1)`
- `app/src/lib/session.ts:72-85` — `cloneTemplate` generically maps `orderedTemplateBlocks(template)` and copies `b.items`; it resets `durationMinutes` from `BLOCK_BUDGETS[b.type]` at `:77`, with no Soft/gathering-specific injection. The Slice 28 template composition is therefore authored in `seedTemplates.ts`, not injected by `cloneTemplate`.

**C1: PASS**

## D1 — no new seed retitle (PASS)

- `app/src/data/seedActivities.ts:50-53` still defines:
  > `id: 'gather-dagens-teknik'`
  > `title: 'Dagens pass — snabb genomgång'`
  > `durationMinutesDefault: 3`
- `seedActivities.ts` is not among the Slice 28 product-code diff files, so this slice adds no seed retitle. The mall row uses the same `activityId` at `app/src/data/seedTemplates.ts:36`; its title consequently resolves from this existing seed.

**D1: PASS**

## E1 — budget document exists (PASS)

- `docs/mall-samling-budget.sv.md:1-5` exists and identifies the Slice 28 Mall Samling budget lock.
- `docs/mall-samling-budget.sv.md:46-59` documents the Soft pair and the unchanged beginner non-Samling blocks.

**E1: PASS**

## F1 — footer, library seed, Teknik-only hall, and scope (PASS)

- `app/src/data/blockMeta.ts:360-362` — footer value is:
  > `footerSliceLabel: 'Träningsplaneraren · Slice 28'`
- `app/src/data/seedActivities.ts:9-15` — `gather-valkomstcheck-in` remains in exported `seedActivities`, with title `Välkomstcheck-in`, block type `gathering`, and default duration 5.
- `app/src/lib/hall.ts:106-118` — placement remains Teknik-only:
  > `return activity?.blockType === 'techniques'`
  and `placeableItems` filters through that predicate.
- Scope check: the only changed product-code files are the template data file and block metadata file; neither adds Home wizard logic or hall pre-placement. `cloneTemplate` also initializes `hallPlacements: []` at `app/src/lib/session.ts:86-96`, rather than auto-placing any item.

**F1: PASS**

## Final lock summary

| Lock | Result |
|---|---|
| A1 | **PASS** |
| B1 | **PASS** |
| C1 | **PASS** |
| D1 | **PASS** |
| E1 | **PASS** |
| F1 | **PASS** |

**Evidence path:** `/workspace/gymnastics-planner/verifier/slice-28-evidence-code.md`
