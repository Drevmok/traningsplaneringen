# Slice 20 — Phone polish (dirty Stäng + canvas remove + template scroll freeze)

**App:** Träningsplaneraren  
**Approval:** **APPROVED 2026-09-26** — recommended A–F locked  
**Date drafted:** 2026-09-26  
**Date approved:** 2026-09-26  
**Status:** **APPROVED** — Christoffer approved via Planner lock widget; Docs may start.

**Backlog:** Bundled Effort-S phone polish (dirty Stäng + canvas remove) Approved 2026-09-25, plus Christoffer-reported **Passbyggaren scroll freeze after Starta från mall** (2026-09-26).

## Goal

Make three phone-path rough edges feel coach-safe on ~390px:

1. **Dirty Stäng** on **Redigera redskap** — replace browser `window.confirm` with an **in-sheet Swedish** discard / keep-editing step. **Klar** remains the only primary save.
2. **Canvas remove** — make removing a placed markör from the hall **touch-friendly** (≥44px hit target and/or clear **Ta bort från hall** when selected). Keep tap→detail and drag≠detail; **edit canvas only**.
3. **Template → Passbyggaren freeze** — after **Starta från mall** / applying a mall, Passbyggaren must stay **scrollable** and not leave body scroll-lock or the mall sheet stuck open.

**Coach outcome:** “Jag kan stänga osparade redskap utan systemdialog, ta bort markörer med tummen, och starta från mall utan att Passbyggaren låser sig.”


## Locked A–F (Christoffer 2026-09-26)

| # | Lock |
|---|---|
| **A** | **A1** In-sheet dirty Stäng (discard / keep editing); Klar unchanged; no `window.confirm` |
| **B** | **B1** Canvas remove hit target ≥44×44px (edit only); tap→detail; drag≠detail; no Golvklart remove; **no B2** |
| **C** | **C1** Clear one-shot template flag; close sheet on apply; restore body overflow |
| **D** | **D1** Thin Docs in station-compose (+ hall/tiles aria only if needed); no new required tip |
| **E** | **E1** Footer `Träningsplaneraren · Slice 20` |
| **F** | **F1** No Passbyggaren compose; no badge/CAD; no library growth; no auto-apply; no republish unless asked; caption unchanged; preserve 11–19 |

## Direction lock (standing product / hard locks)

- Compose entry = hall detail **Redigera redskap** only — **no** Passbyggaren compose
- Placeable = **Teknik** only
- Fixed ~10-piece Swedish redskap library — no growth
- Caption **Schematisk hall — inte exakt mått** unchanged
- **NO** canvas equipment-count badge / CAD pins
- Swedish UI; gymnaster / pass; device-local; no accounts / cloud
- Golvklart / Förrådslista / print still **saved** composition only
- Footer `Träningsplaneraren · Slice 20` when shipped (recommended E)
- **Netlify / GitHub Pages republish out of pack scope** unless Christoffer asks (distribution already on GitHub Pages as of 2026-09-25)

## Problem

| Pain | Baseline today |
|---|---|
| Dirty Stäng | `StationComposeSheet` calls `window.confirm('Du har osparade ändringar…')` — native dialog, easy to miss / inconsistent on phone |
| Canvas remove | `.hall-chip--canvas .hall-chip-remove` is **22–24px** while tray remove is **≥44px** — hard to hit on phone |
| Template freeze | Home sets `openTemplates` and never clears it; confirm applies mall → new `session.id` remounts builder with template sheet forced open; `handleConfirmTemplate` calls `openPanel('library')`; nested `document.body.style.overflow = 'hidden'` (sheet + `TemplateConfirm`) can leave scroll stuck |

## Current baseline (do not regress)

| Symbol | Location | Role |
|---|---|---|
| `handleClose` + `window.confirm` | `app/src/components/StationComposeSheet.tsx` | Dirty Stäng |
| `dirty` / `sameRecipe` | same | Unsaved compose detection |
| `UI.composeClose` / Klar | `blockMeta` + compose sheet | Close / save |
| `.hall-chip--canvas .hall-chip-remove` | `App.css` (~22–24px) | Canvas × |
| `.hall-chip--tray .hall-chip-remove` | `App.css` (≥44px) | Tray remove (reference) |
| `HallChip` `onRemove` | `HallChip.tsx` | Remove placement (edit only) |
| `openTemplates` | `App.tsx` | Home → Starta från mall |
| `key={session.id + (openTemplates ? '-tmpl' : '')}` | `App.tsx` | Remounts builder when mall applied while flag still true |
| `initialTemplatePicker` / `panelOpen` | `SessionBuilder.tsx` | Opens mall sheet on narrow |
| Body overflow lock | `SessionBuilder` (narrow panel) + `TemplateConfirm` | Nested scroll lock |
| `handleConfirmTemplate` → `openPanel('library')` | `SessionBuilder.tsx` | Leaves sheet open after apply |

## In scope

1. In-sheet dirty-Stäng confirm (Swedish) inside Redigera redskap; discard closes without save; keep editing dismisses confirm; clean Stäng still closes immediately; Klar unchanged.
2. Touch-friendly canvas remove on **edit** hall (≥44px hit area and/or selected-state **Ta bort från hall** — see decisions A/B).
3. Fix Starta från mall / apply-mall scroll freeze: clear one-shot template picker flag; close sheet on successful apply; restore body overflow reliably (shared lock helper OK).
4. Docs: thin Swedish strings for dirty confirm + remove affordance (and aria).
5. Footer → Slice 20 when shipped.
6. Verification checklist covering all three parts.

## Out of scope

- Passbyggaren compose entry / Redigera redskap from Passbyggaren
- Canvas equipment-count badge / CAD equipment pins
- Library growth; seed-table edits; auto-apply förslag on place
- Changing unset vs `[]` / Använd förslag / Använd alla förslag semantics
- Golvklart / Förrådslista / print behavior beyond “no regression”
- Netlify / Pages republish unless Christoffer asks
- Reworking all modals’ scroll-lock (only fix the mall path + don’t leave body stuck); optional shared helper is OK if small

## Effort

**S+S+S → one polish pack** (one Docs → Builder → Verifier loop).
