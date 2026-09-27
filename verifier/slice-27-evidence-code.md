# Slice 27 — code evidence (Soft Samling)

**Run:** 2026-09-26 23:38 CEST  
**Authority:** `slice-27/verification-checklist.md` · locks A2/B1/C1/D2/E1/F1  
**Ship marker:** `app/SLICE27-SHIPPED.md`  
**Docs lock:** `docs/soft-samling.sv.md`  
**Scope:** source verification only; this verifier wrote evidence and did **not** change product code.

## Verdict

**Overall: PASS.** All locked A2/B1/C1/D2/E1/F1 checks pass in the shipped source (code alone).

## A2 — seed retitle `gather-dagens-teknik` → pass-rundown: PASS

Same id; title/summary/howTo/watchFor are pass-rundown framed. `gather-narvaro` remains **Närvaro**.

- `app/src/data/seedActivities.ts:50-61` — seed id unchanged; title and copy match Docs:
  > `id: 'gather-dagens-teknik',`  
  > `title: 'Dagens pass — snabb genomgång',`  
  > `summary: 'Kort genomgång av vad ni ska göra på passet — så alla vet planen innan ni börjar.',`  
  > `howTo: '1. Samla gymnasterna… 2. Säg i enkla ord vad passet innehåller… 3. Håll det kort…',`  
  > `watchFor: 'För lång genomgång — håll det till ”vad vi gör idag”, inte hela övningarna.',`
- `app/src/data/seedActivities.ts:31-32` — Närvaro unchanged:
  > `id: 'gather-narvaro',`  
  > `title: 'Närvaro',`
- No parallel seed `gather-dagens-pass` in `app/src` (`rg` empty). Three Samling seeds remain: `gather-valkomstcheck-in`, `gather-narvaro`, `gather-dagens-teknik` (`seedActivities.ts:12`, `:31`, `:50`).

**Blast-radius note (expected under A2):** templates that reference `gather-dagens-teknik` by id resolve the new title via the seed library. Beginner mall still lists that id (`app/src/data/seedTemplates.ts:35-36`):
> `item('gather-valkomstcheck-in', 5, 0),`  
> `item('gather-dagens-teknik', 3, 1),`  
Template item lists were **not** rewritten; only the shared seed title changes.

## B1 — soft-prefill only in `createBlankSession`: PASS

Närvaro + Dagens pass (3+3) injected only on blank create. `createEmptyBlocks()` stays empty; `cloneTemplate` / `loadDraft` do not inject the soft pair.

- `app/src/lib/session.ts:27-35` — empty blocks for all types:
  > `items: [],`
- `app/src/lib/session.ts:38-47` — soft inject **only** here:
  > `// Slice 27 Soft Samling (B1): blank Nytt pass only — Närvaro + pass-rundown.`  
  > `// createEmptyBlocks stays empty for all blocks; templates/loadDraft untouched.`  
  > `gathering.items = [`  
  > `  createSessionItem('gather-narvaro', 3, 0),`  
  > `  createSessionItem('gather-dagens-teknik', 3, 1),`  
  > `]`
- `app/src/lib/session.ts:72-97` — `cloneTemplate` maps template `b.items` as-authored; no soft-pair assignment.
- Call sites for blank create: `app/src/App.tsx:35`, `:84`, `:92`, `:114` → `createBlankSession()`. Template path uses `cloneTemplate` (`SessionBuilder.tsx:181`).

## C1 — no migrate on load for empty Samling: PASS

- `app/src/lib/session.ts:109-117` — `loadDraft` only parses, then:
  > `return withComputedTotal(migrateHallFields(migrateSessionEquipment(parsed)))`
- `migrateSessionEquipment` (`session.ts:151+`) sanitizes `stationEquipment` only — does not touch gathering item lists.
- `migrateHallFields` (`hall.ts:448+`) migrates hall fields only — no gathering inject.
- No soft-pair inject / empty-Samling backfill appears on the load path. Soft inject exists solely inside `createBlankSession` (`session.ts:38-47`).

## D2 — `BLOCK_BUDGETS.gathering` === 6: PASS

- `app/src/data/blockMeta.ts:11-12`:
  > `export const BLOCK_BUDGETS: Record<BlockType, number> = {`  
  > `  gathering: 6,`
- Soft default 3+3 = 6 fits budget 6 (no “Över budget” on intended blank start). Over-budget remains soft-allowed elsewhere (e.g. beginner mall 5+3 = 8).

## E1 — `EMPTY_TIPS.gathering.tip` Docs Swedish; addLabel unchanged: PASS

- `app/src/data/blockMeta.ts:65-67`:
  > `tip: 'Få allas uppmärksamhet — gärna med upprop och en kort genomgång av passet — innan ni börjar med färdigheter.',`  
  > `addLabel: 'Lägg till din första samlingsövning',`
- Matches Docs (`docs/soft-samling.sv.md:68-69`). `TIPS_TAB.gathering` unchanged (`blockMeta.ts:89-90`):
  > `'Samla i cirkel, ta ögonkontakt och säg vad dagens pass handlar om — i en mening.'`

## F1 — footer Slice 27; Samling not placeable; Välkomst kept; no hard-lock: PASS

**Footer**

- `app/src/data/blockMeta.ts:361`:
  > `footerSliceLabel: 'Träningsplaneraren · Slice 27',`
- Rendered at `app/src/App.tsx:246-248`: `{UI.footerSliceLabel}`

**Hall / placeable (Teknik-only unchanged)**

- `app/src/lib/hall.ts:106-109`:
  > `/** Slice 11: only Teknik (techniques) items are placeable on the hall. */`  
  > `return activity?.blockType === 'techniques'`
- Soft Samling seeds have `blockType: 'gathering'` (`seedActivities.ts:14`, `:33`, `:52`) → not placeable.

**Library seed kept**

- `gather-valkomstcheck-in` still in seeds (`seedActivities.ts:12-13` title `Välkomstcheck-in`) and in beginner/short templates (`seedTemplates.ts:35`, `:53`). Not in soft default pair (`session.ts:44-47` only Närvaro + Dagens pass).

**No hard-lock flags on soft items**

- `SessionItem` (`types.ts:52-65`) has no lock/immutable/cannotRemove field — only `id`, `activityId`, `durationMinutes`, `note`, `order`, optional `stationEquipment`.
- Soft seeds carry normal flags only (`newCoachOk`, `needsCoachReview`, …) — no hard-lock property (`seedActivities.ts:31-68`).
- `removeItem` still filters freely (`session.ts:325-339`); `SessionBuilder` wires remove (`SessionBuilder.tsx:289`). No code path disables remove/add/reorder for Samling soft items.

## Blast-radius (documented)

Templates referencing `gather-dagens-teknik` by id (e.g. `tmpl-beginner-60` at `seedTemplates.ts:36`) show the new title **Dagens pass — snabb genomgång** via seed lookup. **Expected** under A2 same-id retitle; template authored item lists were not rewritten to the soft pair (B1).

## Lock summary

| Lock | Result |
|---|---|
| A2 | PASS |
| B1 | PASS |
| C1 | PASS |
| D2 | PASS |
| E1 | PASS |
| F1 | PASS |

**Evidence file:** `/workspace/gymnastics-planner/verifier/slice-27-evidence-code.md`
