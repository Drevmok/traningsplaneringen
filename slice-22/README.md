# Slice 22 — Copy quieter / feature-first chrome

**App:** Träningsplaneraren  
**Approval:** **APPROVED 2026-09-26** — recommended A–F locked  
**Date drafted:** 2026-09-26  
**Status:** **APPROVED** — Christoffer approved via Planner lock widget; Docs may start.

**Backlog:** Christoffer (2026-09-26) approved three related Effort-S polish themes (progressive Hall hints · quieter Kom igång · one chrome layer at a time). Bundled per [`backlog/SCOUT-PLAYBOOK.md`](../backlog/SCOUT-PLAYBOOK.md) “Bundle related S polish”. Phone live baseline: https://drevmok.github.io/traningsplaneringen/ (Slice 21).

**Leaves Proposed (out of this pack):** Scout #1 saknar-redskap banner · Scout #2 Kom igång place-step heuristic.

## Goal

Keep coaching copy, but stop it from competing with the feature on Hallöversikt and Home:

1. **Progressive Hall hints** — after the coach has placed once, hide multi-line instructional paragraphs; keep them behind an info control (≥44px). First-time / zero placements keep today’s full hints.
2. **Quieter Kom igång** — once any checklist step is done (or card was collapsed), default next Home visit to a **collapsed** summary (title + progress + expand ≥44px). Brand-new 0/n stays expanded.
3. **One chrome layer at a time** — tip strip **OR** status banner **OR** multi-line tray/canvas hints — never stacked teaching chrome. Primary CTAs (Placera här, chips, expand/collapse) always stay.

**Coach outcome:** “När jag väl har placerat en gång och kommit igång ser jag hallen och stegen — tipsen finns kvar bakom info, men de tar inte över vyn.”

## Locked A–F (Christoffer 2026-09-26)

| # | Rec | Meaning |
|---|---|---|
| **A** | **A1** | Progressive Hall hints: durable `hallHintsCompact` after first successful Teknik place → hide multi-line instructional paragraphs; info control (≥44px) reveals them; zero placements keep today’s full hints |
| **B** | **B1** | Quieter Kom igång: collapsed-by-default once progress > 0 **or** previously collapsed; summary = title + “x/n” + expand ≥44px; brand-new 0/n stays expanded; keep Dölj / Visa tips igen |
| **C** | **C1** | One chrome layer: blocking UI always wins; else at most ONE of {tip strip, status banner, multi-line hints}; tip strip → suppress multi-line hints (info still available); unplaced banner → suppress tip strip on that surface |
| **D** | **D1** | Thin Docs: Swedish for info control + Kom igång collapse/expand (+ aria); update living hall-declutter / coach-tips / kom-igang; no saknar-redskap copy; no new required tip |
| **E** | **E1** | Footer `Träningsplaneraren · Slice 22` |
| **F** | **F1** | Preserve 11–21 except quiet-chrome rules; no pinch/pan/tray-collapse regressions; no saknar banner; no place-heuristic (#2 stays Proposed); no Passbyggaren compose / library / CAD / caption / cloud; no Pages republish unless asked |

Full options + rationale: [`decisions.md`](./decisions.md).

## Direction lock (standing product / hard locks)

- Compose entry = hall detail **Redigera redskap** only — **no** Passbyggaren compose
- Placeable = **Teknik** only
- Fixed ~10-piece Swedish redskap library — no growth
- Caption **Schematisk hall — inte exakt mått** (or existing locked wording) unchanged
- **NO** canvas equipment-count badge / CAD pins
- Swedish UI; gymnaster / pass; device-local drafts; no accounts / cloud
- Golvklart / Förrådslista / print still **saved** composition only
- Footer `Träningsplaneraren · Slice 22` when shipped (recommended E)
- **Netlify / GitHub Pages republish out of pack scope** unless Christoffer asks
- Slice 21 pinch / pan / tray-collapse behavior preserved except where chrome-layering touches tray **hints**

## Problem baseline

| Pain | Baseline today |
|---|---|
| Hall multi-line hints | Edit header stacks `hallStationOrderHint` + `hallStationsOnlyHint` + `hallTileHint` (+ optional `CoachTipStrip` `tipHallFlowGolvklart`). Expanded tray stacks `hallDragHint` + `hallSnapHint` (+ optional `tipHallPlace`). Always visible — never quiet after first place. |
| Kom igång chrome | `KomIgangCard` always fully expanded (intro + all 5 steps + hints) whenever `checklistDismissed` is false — even after progress > 0. Persistence: `gymnastics-planner-tips-v1` (`coachTips.ts`). |
| Stacked teaching layers | Tip strip can sit beside multi-line always-on hints (and on Golvklart, unplaced banner). Coach tip takes visual precedence over place/compose actions. |

## Current baseline (do not regress)

| Symbol | Location | Role |
|---|---|---|
| `hallDragHint` / `hallSnapHint` | `blockMeta.ts` + `HallBoard.tsx` tray | Always-on tray instructional paragraphs |
| `hallStationsOnlyHint` / `hallStationOrderHint` / `hallTileHint` | `blockMeta.ts` + `HallBoard` header | Always-on above-canvas instructional paragraphs |
| `hallUnplacedBanner*` | `blockMeta.ts` + Golvklart header | Soft status banner (unplaced count) |
| `CoachTipStrip` | `CoachTipStrip.tsx` | Dismissible tip strip (`tipHallPlace`, `tipHallFlowGolvklart`, …) |
| `KomIgangCard` | `KomIgangCard.tsx` + Home | Always-expanded checklist when not dismissed |
| `TIPS_STORAGE_KEY` / `CoachTipsStateV1` | `coachTips.ts` | Local tip dismissals + checklist |
| `hallTrayExpand` / `hallTrayCollapse` | Slice 21 | Tray chrome — **keep**; this pack only quiets **hints** inside expanded tray |
| Pinch / pan / viewZoom | Slice 21 `HallBoard` / `HallCanvas` | **No behavior change** |
| Caption | Hall chrome | Schematisk hall — inte exakt mått |

## In scope

1. Progressive disclosure of Hall multi-line instructional hints after first successful Teknik place (durable compact flag + info control).
2. Kom igång collapsed-by-default once progress > 0 or previously collapsed; expand/collapse ≥44px; persist preference.
3. Chrome layering priority so tip strip, status banner, and multi-line hints do not stack.
4. Thin Docs: info + Kom igång collapse/expand Swedish (+ aria); living-doc touch-ups.
5. Footer → Slice 22 when shipped.
6. Verification checklist covering recommended A1/B1/C1/E1/F1 + build green.

## Out of scope

- Scout Proposed #1 **saknar-redskap** banner (would **add** chrome — stays Proposed)
- Scout Proposed #2 Kom igång **place-step heuristic** (different axis — stays Proposed)
- Changing Slice 21 pinch / pan / tray **collapse** behavior (except tray **hint** visibility under A1/C1)
- CAD / equipment pins / canvas badge
- Passbyggaren compose entry; library growth; caption change
- Seed-table edits; auto-apply förslag
- Netlify / Pages republish unless Christoffer asks
- Removing Kom igång or all tips entirely

## Pipeline note

After APPROVED (done 2026-09-26):

1. **Docs** → Swedish strings (info + Kom igång collapse/expand + aria) → living `docs/`  
2. **Builder** → implement locked A–F; self-smoke via `verify-traningsplaneraren/`; footer Slice 22  
3. **Planner** pings **Verifier** only after Builder ships  
4. **Verifier** uses this pack’s `verification-checklist.md` as authority + project skill `verify-traningsplaneraren/`

**Docs may start now.** Builder after Docs. Verifier only after Planner ping.

pstack rigor: see [`backlog/PSTACK-OPS.md`](../backlog/PSTACK-OPS.md).

## Effort

**S** (bundled) — three related quiet-chrome polish items, one Docs → Builder → Verifier loop after APPROVED.
