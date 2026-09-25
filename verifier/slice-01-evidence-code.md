# Slice 01 — Code/content evidence pack (Verifier)

**Date:** 2026-09-23 22:56 CEST (Europe/Stockholm)  
**Agent:** code/data verifier (executor subagent)  
**Authority:** checklist v2 + decisions.md + data-model.md + screen-spec + SLICE01-SHIPPED.md + seed-safety-hold + content/*.sv.md  
**Scope:** files, `npm run build`, localStorage/data layer — **not** full browser UX walkthrough  

---

## Environment / build

| Check | Result | Evidence |
| --- | --- | --- |
| App path | `/workspace/gymnastics-planner/app` | — |
| `npm install` | Already present (`node_modules/` exists); not re-run | `ls app/` |
| `npm run build` | **PASS** | `tsc -b && vite build` → exit 0; dist written (`index-jAKTPBNC.js` 254.20 kB) |
| Dev server | **PASS** — already listening | `127.0.0.1:5173` (node pid); `curl` → HTTP **200**, `<html lang="sv">`, title **Träningsplaneraren** |
| How to run | `cd app && npm run build && npm run dev` | SLICE01-SHIPPED.md |

**Server URL for UI agent:** `http://127.0.0.1:5173/` (also reachable as `http://localhost:5173/`)

---

## Legend

- **PASS** — satisfied from code/content with concrete evidence  
- **PARTIAL** — present but incomplete / needs UI confirmation  
- **FAIL** — clear violation of locked checklist  
- **BLOCKED** — cannot judge without browser/human  
- **N/A (out of scope)** — checklist says must not cause FAIL  

---

## Content (checklist § Content)

| Item | Verdict | Evidence |
| --- | --- | --- |
| Empty-state tip string per block type (Swedish) | **PASS** | `app/src/data/blockMeta.ts` `EMPTY_TIPS` L72–93 — all five types; matches `slice-01/content/slice-01-empty-states.sv.md` (Samling…Lek och spel). Wired in `BlockCard.tsx` L77–80. |
| ≥6 activities per block type OR dated stub-set note | **PASS** | `seedActivities.ts`: gathering 6, warmup 6, techniques 6, strength 6, fun_and_games 6 (total **30**). Scripted count. Safety hold note: `slice-01/2026-09-23-seed-safety-hold.md` (replacements keep 6 techniques). |
| Every `watchForRequired: true` has non-empty `watchFor` | **PASS** | Six required: `tech-hollow-hold`, `tech-lunge-hands-down`, `tech-cartwheel-progress`, `tech-floor-line-walk`, `tech-runway-stick`, `str-hollow-rocks-strength` — all non-empty Swedish `watchFor` (`seedActivities.ts` L208–209, 241–243, 257–258, 273–275, 290–292, 369–370). `missingWatch: []`. Matches Docs Verifier list in seed `.sv.md` L410. |
| Activities have `blockType`, default duration, `visualKey` | **PASS** | All 30 objects set `blockType`, `durationMinutesDefault`, `visualKey`; `missingVisual`/`missingDur` empty. Type requires them (`types.ts` L15–21). |
| Stubs labeled in data/UI strings | **PASS** | All 30 have `stub: true`. UI badge **Utkast** via `UI.stub` (`blockMeta.ts` L135) on `ActivityCard.tsx` L22, `BlockCard.tsx` L120–122, `ActivityDetail.tsx` L31. |
| Seed safety hold honored | **PASS** | Held ids `tech-handstand-prep-lunge`, `tech-vault-run-punch`, `tech-beam-walks` **absent** from seed UI data; comment + replacements present (`seedActivities.ts` L3–6, 231–295). |
| Language Swedish in coach-facing strings | **PASS** | `html lang="sv"`; `UI` chrome Swedish (`blockMeta.ts` L112–160); activity titles/summaries/howTo/watchFor Swedish; block labels Samling/Uppvärmning/Teknik/Styrka/Lek och spel. No English chrome leftovers in `src/**/*.{ts,tsx}` for Save draft / Coming soon / etc. Loanwords (hollow, jumping jacks) allowed per decisions. |

---

## Data / persistence (checklist § Data / persistence)

| Item | Verdict | Evidence |
| --- | --- | --- |
| Save draft + reload restores title, blocks, items, durations | **PASS (code path)** | `saveDraft` → `localStorage.setItem('gymnastics-planner-draft-v1', …)` (`session.ts` L78–81); `loadDraft` parses + `withComputedTotal` (L83–93). Home **Fortsätt senaste pass** calls `loadDraft` (`App.tsx` L32–37, `Home.tsx` L38–54). *Runtime round-trip after browser reload = UI agent.* |
| Continue last draft from home | **PASS (code path)** | `hasDraft()` / disabled CTA when empty (`Home.tsx` L11, L42–52); `goContinue` loads draft (`App.tsx` L32–37). |
| Template clone sets `basedOnTemplateId`; template not mutated | **PASS** | `cloneTemplate` sets `basedOnTemplateId: template.id` (`session.ts` L50–71); new session/block/item ids via `uid`; budgets/labels copied; `seedTemplates` array never written. Confirm path: `SessionBuilder.handleConfirmTemplate` → `cloneTemplate` (L129–136). |
| Removing an item does not delete library Activity | **PASS** | `removeItem` only filters `SessionBlock.items` (`session.ts` L174–188). No writes to `seedActivities`. Library remains static export. |
| Session total = sum of items only (computed) | **PASS** | `computeTotal` sums `item.durationMinutes` across blocks only (`session.ts` L38–44). Blank session `totalMinutes: 0` (`createBlankSession` L28–35). UI: `{session.totalMinutes} / {DEFAULT_TARGET_MINUTES} min` (`SessionBuilder.tsx` L156–158); target default 60 (`blockMeta.ts` L109). No independent total editor. |

---

## Locked product rules checkable from code

| Item | Verdict | Evidence |
| --- | --- | --- |
| Soft mismatch on add-override **and** move | **PASS (implementation exists)** | Add path: `handleAddFromDetail` keeps item then `setMismatch` if `detailActivity.blockType !== dest.type` (`SessionBuilder.tsx` L83–104). Move path: `handleMoveToBlock` same (`L107–121`). Banner: inline on destination block, dismissible, item stays (`MismatchBanner.tsx`; `BlockCard.tsx` L73–75). Message: `mismatchMessage` Swedish (`blockMeta.ts` L162–164). |
| Soft overflow when items exceed block budget | **PASS** | `filled > block.durationMinutes` → class `overflow` + tag **Över budget** (`BlockCard.tsx` L44–45, L52, L67–69; `UI.overflow` L155). |
| Block budget defaults 5 / 10 / 20 / 15 / 10 | **PASS** | `BLOCK_BUDGETS` (`blockMeta.ts` L11–17); applied in `createEmptyBlocks` (`session.ts` L17–25) and template clone (L55). |
| Block order locked; items reorder within block | **PASS (code)** | `BLOCK_ORDER` fixed (`blockMeta.ts` L3–9). Within-block reorder via ↑↓ → `moveItemWithinBlock` (`session.ts` L119–141; `BlockCard.tsx` L142–156). *Note: buttons, not drag — checklist requires reorder, not specifically drag.* |
| Color/icon map | **PASS** | Tokens amber/sky/violet/rose/green + CSS vars (`blockMeta.ts` `BLOCK_COLORS` L27–61); icons 👋🔥✨💪😄 (`BLOCK_ICONS` L63–69). Applied in `BlockCard.tsx` L43–65. |
| Visual via `visualKey` → emoji map | **PASS (code)** | `VISUAL_EMOJI` covers all seed keys (`blockMeta.ts` L166–197); `ActivityCard` shows emoji + title + duration (not title-only). |
| Export stub | **N/A (out of scope — must not FAIL)** | Disabled button + **Kommer snart** (`SessionBuilder.tsx` L172–187). |
| Home three CTAs | **PASS (code)** | Nytt pass · Starta från mall · Fortsätt senaste pass (`Home.tsx` L21–54; `UI` L115–118). |
| Tips panel per selected block | **PASS (code)** | `TIPS_TAB` (`blockMeta.ts` L96–107); Library panel tips tab (`LibraryPanel.tsx`). Selecting block sets tips tab (`SessionBuilder.tsx` L201–203). |
| Activity detail sections + actions | **PASS (code)** | Sammanfattning / Så gör du / Se upp för; Lägg till i valt block · Lägg till och ändra tid (`ActivityDetail.tsx`). |
| Template ≤2 taps + confirm/cancel | **PARTIAL / UI confirm** | Code: home → Starta från mall opens builder with `initialTemplatePicker` → templates tab (`App.tsx` L26–29; `SessionBuilder` L43–44). Confirm dialog `TemplateConfirm` with Använd mall / Fortsätt redigera. *Tap count & cancel-leaves-unchanged need UI agent.* |
| Picker filtered to block type by default | **PASS (code)** | `openAddForBlock` sets `filterBlockType` to that block’s type (`SessionBuilder.tsx` L71–77). |
| Empty block tip + Add CTA returns after last remove | **PASS (code)** | Empty UI when `items.length === 0` (`BlockCard.tsx` L46, L77–103); remove only drops item → empty state reappears. |

---

## Product / UX items — deferred to UI agent

| Item | Code status | UI agent must verify |
| --- | --- | --- |
| Minimal home works end-to-end | Implemented | Visual/layout, disabled continue when no draft |
| Five blocks blank order & live `0 / 60` | Implemented | Rendered order & badge |
| Soft mismatch **behavior** (banner placement, dismiss, item stays) | Implemented | Both override-add and move in browser |
| Soft overflow visible | Implemented | Exceed budget visually |
| Stub badges visible | Implemented | Library + timeline + detail |
| Template path ≤2 taps; cancel unchanged | Implemented | Timed taps; cancel no mutate |
| Reorder UX | ↑↓ buttons | Acceptable vs coach expectation of drag |
| New-coach timed test [45,60] ≤10:00 | **BLOCKED** — human | Device + tester type + wall clock |
| Phone polish | Out of scope | Do not FAIL |
| Explain blocks (coach words) | Tips present | Human new-coach test |

---

## Templates note (observation, not auto-fail)

| Template | Claimed | Computed item sum | In [45,60]? |
| --- | --- | --- | --- |
| `tmpl-beginner-60` «Nybörjare — ca 55 min» | ~55 | **47** | Yes |
| `tmpl-short-45` «Kort pass — ca 45 min» | ~45 | **39** | **No** |

New-coach pass criterion is coach-built item-sum in [45,60], not template title accuracy. Flag for Planner: short template under-delivers vs its “ca 45” label if used as-is without edits.

---

## Automatic-fail scan (code/content only)

| Auto-fail rule | Verdict |
| --- | --- |
| No path to five blocks + CTA | **Not triggered** — home → blank session with five empty blocks + Add CTAs |
| Library title-only (no visuals) | **Not triggered** — emoji via `visualKey` on cards |
| No ≤2-tap template path | **Likely OK in code**; UI agent confirms taps |
| Soft mismatch missing on both override-add and move | **Not triggered** — both paths set mismatch |
| Save draft does not restore | **Code OK**; UI agent confirms reload |
| Any `watchForRequired` missing Watch for | **Not triggered** — all six filled |

---

## Out of scope (do not auto-fail)

- Export stub (disabled + Kommer snart)  
- Phone polish  
- New-coach timed human test  
- Video player / auth / timer / athletes (non-goals)

---

## Blockers for UI agent

1. **None for starting** — build green; server up at `http://127.0.0.1:5173/`.  
2. Prefer **desktop/tablet** viewport (phone polish out of scope).  
3. Exercise: save draft → full page reload → Continua from home; soft mismatch via filter=”Alla typer” add + move menu; overflow by stacking items past budget; template confirm **and** cancel.  
4. Human: new-coach timed test + block-purpose explanation (cannot be automated here).  
5. Optional awareness: `tmpl-short-45` sums to **39** min — coach may need to add time to hit [45,60].

---

## Section rollup (code/content verifier)

| Section | Verdict |
| --- | --- |
| Content | **PASS** |
| Data / persistence (code paths) | **PASS** |
| Locked soft-warning / budgets / colors / Swedish | **PASS** |
| Product/UX interactive | **PARTIAL** — deferred to UI agent |
| New-coach test | **BLOCKED** — human |
| Build / server | **PASS** |

**Top gaps for Planner (non-blocking for code slice):**  
1. Short template item-sum 39 vs “ca 45” label.  
2. Reorder is button-based (not drag) — confirm if acceptable.  
3. `needsCoachReview` flagged in Docs but not modeled on `Activity` type / seed TS (review process note only).  
4. Human new-coach timed test still outstanding.

**Evidence file path:** `/workspace/gymnastics-planner/verifier/slice-01-evidence-code.md`
