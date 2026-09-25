# Slice 02 — Code/CSS evidence pack (Verifier)

**Date:** 2026-09-23 23:16 CEST (Europe/Stockholm)  
**Agent:** code/CSS verifier (executor subagent)  
**Authority:** `slice-02/verification-checklist.md` + `slice-02/screen-spec-phone.md` + `app/SLICE02-SHIPPED.md`  
**Scope:** `npm run build`, CSS/component inspection, seed mtime/content spot-check — **not** full browser viewport walkthrough  

---

## Environment / build

| Check | Result | Evidence |
| --- | --- | --- |
| App path | `/workspace/gymnastics-planner/app` | — |
| `npm install` | Already present (`node_modules/`); not re-run | `ls app/` |
| `npm run build` | **PASS** | `tsc -b && vite build` → exit 0; `dist/assets/index-DkHaw4Tu.css` 13.22 kB, `index-CYmgcelp.js` 255.56 kB |
| Dev server | **PASS** — already running; not duplicated | Terminal pid running `vite --host 127.0.0.1 --port 5173`; `curl` → HTTP **200**, `<html lang="sv">` |
| Server URL | `http://127.0.0.1:5173/` | Also `http://localhost:5173/` |

---

## Legend

- **PASS** — satisfied from code/CSS with concrete evidence  
- **PARTIAL** — present but incomplete / needs UI confirmation / claim mismatch  
- **FAIL** — clear violation  
- **BLOCKED** — cannot judge without browser/human  

---

## Breakpoints / layout (authority claims)

### ≤768px: Library/Tips/Templates as sheet with Stäng + backdrop (not skinny sidebar)

| Item | Verdict | Evidence |
| --- | --- | --- |
| Narrow MQ drives sheet mode | **PASS** | `SessionBuilder.tsx` L34 `NARROW_MQ = '(max-width: 768px)'`; `isNarrow` via `matchMedia` L70–76 |
| Panel hidden until open on narrow | **PASS** | `App.css` L820–822 `.side-panel-slot:not(.is-open) { display: none }` inside `@media (max-width: 768px)` |
| Bottom sheet overlay when open | **PASS** | L824–855: `position: fixed; inset: 0`; frame `bottom: 0`, `border-radius: 16px 16px 0 0`, `max-height: min(92svh, 100%)` |
| Backdrop | **PASS** | JSX `sheet-backdrop` button closes panel (`SessionBuilder.tsx` L257–262); CSS L831–840 `display: block` + dim overlay |
| Stäng chrome | **PASS** | `sheet-chrome` + `sheet-close` renders `{UI.close}` (`SessionBuilder.tsx` L277–284); `UI.close: 'Stäng'` (`blockMeta.ts` L154); CSS L857–870 `min-height: 44px` |
| Body scroll lock while sheet open | **PASS** | `SessionBuilder.tsx` L78–85 sets `document.body.style.overflow = 'hidden'` when `panelOpen && isNarrow` |
| Open library filtered from block Add | **PASS (code)** | `openAddForBlock` sets `filterBlockType` to block type then `openPanel('library')` (L101–107); wired from `onAdd` / `onBrowse` (L235–236) |
| Not a permanent skinny sidebar at ≤768 | **PASS (code)** | Closed panel `display: none`; open = full-width bottom sheet, not second grid column |

### ≤480px: Home CTAs full-width, ≥44px taps; title ~16px+

| Item | Verdict | Evidence |
| --- | --- | --- |
| Home CTAs full-width stack | **PASS** | `@media (max-width: 480px)` `App.css` L1058–1060 `.home-actions { grid-template-columns: 1fr }`; L1063–1066 `.home-card { width: 100%; min-height: 44px }` |
| Tap height ≥44px | **PASS (CSS)** | `.home-card` `min-height: 44px` + `padding: 16px` (L1063–1067). *Rendered hit-box still UI-confirm.* |
| Title / inputs ≈16px+ (iOS zoom) | **PASS** | Builder `.title-input { font-size: 16px }` at ≤768 (L776–777); home invite `16px` at ≤480 (L1053–1054); search/filter/duration inputs `16px` in ≤768 block (L895–902, L943–945) |
| Home three CTAs still present | **PASS** | `Home.tsx` L21–54 unchanged (mtime 22:54) |

### ≥901px: two-column intact, no sheet chrome

| Item | Verdict | Evidence |
| --- | --- | --- |
| Two-column builder | **PASS** | `.builder-main { grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.9fr) }` (`App.css` L183 area / ~L181–183) |
| Stack only ≤900 | **PASS** | `@media (max-width: 900px) { .builder-main { grid-template-columns: 1fr } }` L204–207 — so **≥901** keeps two columns |
| Sheet chrome/backdrop hidden on desktop | **PASS** | Base `.sheet-backdrop, .sheet-chrome { display: none }` L199–201; only re-enabled inside ≤768 block |
| Side panel sticky (not sheet) | **PASS** | `.side-panel { position: sticky; top: 12px; … }` L398–405; overridden to `position: static` only under ≤768 (L872–874) |
| Checklist ≥1100 desktop smoke | **PARTIAL** | Same CSS path as ≥901; **UI agent** must smoke at ≥1100px |

### overflow-x hidden; item controls ≥44px on narrow

| Item | Verdict | Evidence |
| --- | --- | --- |
| `overflow-x: hidden` on body | **PASS** | `index.css` L17–20 `body { overflow-x: hidden }` |
| Also on app shell | **PASS** | `App.css` L762–763 `.app-shell { overflow-x: hidden }` |
| Title flex children `min-width: 0` | **PASS** | Base `.title-input { min-width: 0 }` L126; reinforced ≤768 L778 |
| Item ↑↓ / remove / move ≥44px on narrow | **PASS (CSS)** | ≤768 `.item-actions button { min-width: 44px; min-height: 44px }` L957–961; select `min-height: 44px` L964–968 |
| Add / empty CTAs ≥44px | **PASS (CSS)** | L929–934; builder actions L797–801 |
| Mismatch dismiss ≥44px | **PASS (CSS)** | L979–983 |
| Modal actions full-width ≥44px on narrow | **PASS (CSS)** | L1013–1023; ActivityDetail/TemplateConfirm use `modal-actions` |

### Builder top bar / blocks / modals (code)

| Item | Verdict | Evidence |
| --- | --- | --- |
| Title + `n / 60` stay on one row (narrow) | **PASS (CSS intent)** | ≤768 `.builder-title-row { flex-wrap: nowrap }` L771–773; `.total-badge { flex-shrink: 0 }` L782–786; title shrinkable `min-width: 0` |
| Actions reachable (wrap row, no ⋯ menu) | **PASS / noted gap** | Actions in flex wrap (`builder-actions`); SLICE02 known gap: no overflow menu — matches shipped note |
| Empty tip + Add visible | **PASS (code)** | `BlockCard.tsx` empty tip via `EMPTY_TIPS` + Add CTAs (unchanged product) |
| Activity detail phone sheet + scroll lock | **PASS (code)** | `ActivityDetail.tsx` L15–20 body lock; backdrop click closes L28–30; ≤768 modal → bottom sheet CSS L986–1001 |
| Template confirm phone layout + scroll lock | **PASS (code)** | `TemplateConfirm.tsx` L12–17 body lock; backdrop cancels L25–27; same modal sheet CSS |
| Focus-visible / active | **PASS** | `App.css` L633–653 (+ sheet-close) |

---

## Behavior smoke (code paths still present — Slice 01 must not regress)

| Item | Verdict | Evidence |
| --- | --- | --- |
| Add / remove / reorder within block | **PASS (code)** | `SessionBuilder` + `session.ts` `addItemToBlock` / `removeItem` / `moveItemWithinBlock` — files mtimes: session 22:54 (Slice 01) |
| Soft mismatch on override-add and move | **PASS (code)** | Same handlers as Slice 01 in `SessionBuilder` |
| Template ≤2 taps + confirm/cancel | **PARTIAL** | Code path intact (`initialTemplatePicker`, `TemplateConfirm`); **UI agent** confirms tap count |
| Draft save + Fortsätt senaste pass | **PASS (code)** | `saveDraft` / `loadDraft` / Home continue CTA unchanged |
| Session total = item sum only | **PASS** | `computeTotal` in `session.ts` L38+; UI badge `{session.totalMinutes} / {DEFAULT_TARGET_MINUTES}` |

---

## Product / seed regression vs Slice 01 + SLICE02 claim

**SLICE02-SHIPPED.md claim:** “No seed/template/product-copy changes. Swedish strings unchanged (`UI.close` → **Stäng).**”

| File | mtime (CEST) | Verdict vs claim |
| --- | --- | --- |
| `src/data/seedActivities.ts` | 22:53 | **PASS** — unchanged since Slice 01 ship window |
| `src/data/blockMeta.ts` | 22:53 | **PASS** — chrome/EMPTY_TIPS/UI.close=`Stäng` unchanged |
| `src/components/Home.tsx` | 22:54 | **PASS** — CTA copy unchanged |
| `src/lib/session.ts` | 22:54 | **PASS** — persistence/total rules unchanged |
| `src/data/seedTemplates.ts` | **23:07** | **PARTIAL / claim mismatch** — touched after Slice 01 (~22:55). Content delta vs Slice 01 evidence: `tmpl-short-45` item-sum is now **45** (was **39** in `verifier/slice-01-evidence-code.md`). Beginner still sum **47**, title still «Nybörjare — ca 55 min». |
| Slice 02 layout files | 23:14 | Expected: `App.css`, `index.css`, `App.tsx` (footer «Slice 02»), `SessionBuilder.tsx`, `ActivityDetail.tsx`, `TemplateConfirm.tsx` |

**Regression note:** Activity seed + Swedish UI chrome look Slice-01-stable. **Template seed was edited** (short pass durations bumped to match «ca 45»). That contradicts the literal SLICE02 “no seed/template changes” claim, even if it addresses a Slice 01 Docs flag. No git available for a formal diff.

---

## Checklist devices (code vs UI)

| Device / width | Code verdict | UI agent |
| --- | --- | --- |
| 390×844 | CSS rules apply (≤480 + ≤768) | **Must confirm** no H-scroll, sheet UX, taps |
| 360×740 | Same | **Must confirm** |
| 768×1024 | Sheet MQ includes 768 (`max-width: 768px`) | **Must confirm** sheet vs stacked edge |
| ≥1100 desktop | Two-column + no sheet chrome in CSS | **Must confirm** no regression |

---

## Automatic-fail scan (code/CSS only)

| Auto-fail rule | Verdict |
| --- | --- |
| Horizontal scroll required at 390px | **Not triggered in CSS** — `overflow-x: hidden` + `min-width: 0`; **UI still smoke-tests** |
| Library only as unusable tiny sidebar | **Not triggered** — sheet pattern at ≤768 |
| Primary actions below ~40px with no padding | **Not triggered** — widespread `min-height: 44px` under ≤768/≤480 |
| Desktop ≥1100 builder broken | **Not triggered in CSS** — two-column ≥901 |

---

## Section rollup

| Section | Verdict |
| --- | --- |
| Build + server | **PASS** |
| ≤768 sheet + Stäng + backdrop | **PASS (code)** |
| ≤480 home CTAs / 16px title inputs | **PASS (CSS)** |
| ≥901 two-column / no sheet chrome | **PASS (CSS)** |
| overflow-x + 44px item controls | **PASS (CSS)** |
| Behavior code paths | **PASS (code)** / UI confirms runtime |
| Seed/product vs Slice 01 | **PARTIAL** — activities/chrome OK; **seedTemplates changed** (short 39→45) vs SLICE02 claim |
| Viewport/screenshot checklist | **BLOCKED** → UI agent |

---

## UI agent must confirm

1. At **390×844** and **360×740**: Home + Passbyggaren — **no horizontal page scroll**; open Bibliotek sheet (Stäng + backdrop); Add from empty block opens filtered library.  
2. Home CTAs full-width, comfortable ≥44px taps; title field does not zoom on iOS (or desktop emulation of 16px).  
3. Item row ↑↓ / duration / move controls usable with thumb.  
4. Activity detail + mismatch banner + template confirm usable end-to-end on 390.  
5. At **≥1100px**: two-column builder, sticky side panel, **no** sheet chrome/backdrop.  
6. Optional: at **768** exact width, confirm sheet (not skinny sidebar).  
7. Awareness: short template now sums to **45** (product delta since Slice 01 evidence).

---

**Evidence file path:** `/workspace/gymnastics-planner/verifier/slice-02-evidence-code.md`  
**Server URL for UI agent:** `http://127.0.0.1:5173/`
