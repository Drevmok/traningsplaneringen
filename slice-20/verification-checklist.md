# Slice 20 — verification checklist (APPROVED)

**Authority:** Overall PASS only if all locked rules pass after Builder ships an **APPROVED** pack.  
**Status:** **APPROVED pack 2026-09-26.** Do **not** run Verifier until Planner pings after Builder ships.  
**Republish:** Not required unless Christoffer asks.

## Rules (locked)

### Dirty Stäng

| # | Rule | Pass if |
|---|---|---|
| 1 | No `window.confirm` on dirty Stäng | Dirty Stäng uses in-sheet Swedish confirm only |
| 2 | Discard | **Stäng utan att spara** closes sheet; recipe not persisted |
| 3 | Keep editing | **Fortsätt redigera** hides confirm; sheet stays open; edits kept |
| 4 | Clean Stäng | Not dirty → closes immediately, no confirm |
| 5 | Klar | Still saves; does not open discard confirm |
| 6 | Phone targets | Confirm actions ≥44px min-height |

### Canvas remove

| # | Rule | Pass if |
|---|---|---|
| 7 | Hit target | Edit-canvas remove hit area ≥44×44px (or B2 text control present and ≥44px) |
| 8 | Edit only | Golvklart / floor: no remove control |
| 9 | Tap vs drag | Tap markör opens detail; drag moves without treating as tap-open |
| 10 | Remove works | Remove deletes placement; item returns to placeable set as today |

### Template scroll freeze

| # | Rule | Pass if |
|---|---|---|
| 11 | Starta från mall happy path | Home → Starta från mall → pick mall → Använd mall → Passbyggaren shows cloned pass **and scrolls** on phone (~390px) |
| 12 | No stuck sheet | After apply, mall/library sheet is **closed** (not forced open on remount) |
| 13 | Body unlock | `document.body` overflow not left `hidden` after apply / close |
| 14 | Cancel path | Cancel confirm or close sheet without apply → builder still scrollable |
| 15 | Flag consumed | Applying mall does not leave `openTemplates`/`initialTemplatePicker` forcing template mode on session.id change |

### Scope / chrome

| # | Rule | Pass if |
|---|---|---|
| 16 | Scope | No Passbyggaren compose; no badge/CAD; no library growth; caption unchanged; Slices 11–19 intact |
| 17 | Footer | `Träningsplaneraren · Slice 20` when shipped |
| 18 | Build | `npm run build` green |

## Smoke path

1. **Dirty Stäng:** Hall → place Teknik → Redigera redskap → change recipe → Stäng → in-sheet confirm → Fortsätt redigera → still open → Stäng → Stäng utan att spara → closed, not saved. Repeat change → Klar → saved. Clean open → Stäng → no confirm.
2. **Canvas remove:** Edit hall, place markör, remove via enlarged control (and B2 control if locked). Confirm tray still OK. Enter Golvklart — no remove. Tap vs short-drag smoke.
3. **Template freeze:** Home → Starta från mall → choose mall → Använd mall. Confirm pass content filled, sheet closed, **scroll Passbyggaren** through all blocks on narrow viewport. Repeat cancel-on-confirm once. Confirm body scroll works on Home after Back.
4. Footer Slice 20; caption unchanged; build green.

## Fail if

- `window.confirm` still used for dirty compose Stäng.  
- Canvas remove still &lt;44px with no alternate ≥44px remove (if B1/B2 locked).  
- After Starta från mall apply, Passbyggaren does not scroll or mall sheet remounts open.  
- Body `overflow: hidden` stuck after sheet/dialog close.  
- Remove available on Golvklart; Passbyggaren gains compose; badge/CAD/library growth; caption change.  
- Verifier run before APPROVED + Builder ship.
