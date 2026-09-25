# Slice 04 — Code evidence pack (Verifier)

**Date:** 2026-09-24 06:12 CEST (Europe/Stockholm)  
**Agent:** code verifier (executor subagent)  
**Authority:** `slice-04/verification-checklist.md` + `slice-04/icon-map.md` + `slice-04/screen-spec-visuals.md` + `slice-04/decisions.md` + `app/SLICE04-SHIPPED.md`  
**Scope:** `npm run build`, icon map/src/dist inspection, `resolveIconId` script proof — **not** full browser interaction walkthrough  
**Product rewrite:** none (verify only; seed left clean)

---

## Environment / build

| Check | Result | Evidence |
| --- | --- | --- |
| App path | `/workspace/gymnastics-planner/app` | — |
| `npm run build` | **PASS** | `tsc -b && vite build` → exit 0; `dist/assets/index-AL8CISrE.css` 13.67 kB, `index-D39xTRTI.js` 270.13 kB (~203 ms) |
| Dev server | **PASS** — already on `127.0.0.1:5173` | `ss` LISTEN (vite pid); `curl` → HTTP **200**, `<html lang="sv">` |
| Server URL | `http://127.0.0.1:5173/` | Also `http://localhost:5173/` |
| Footer | Still **Slice 03** (cosmetic) | `App.tsx` → `{UI.appName} · Slice 03` — not a locked Slice 04 fail |

---

## Legend

- **PASS** — satisfied from code with concrete evidence  
- **PARTIAL** — present in code; needs UI confirmation  
- **FAIL** — clear violation  
- **N/A** — explicit non-fail / out of scope

---

## Locked rules (checklist)

| Rule | Verdict | Evidence |
| --- | --- | --- |
| Local assets only (no CDN / icon font) | **PASS** | `package.json` deps = `react` + `react-dom` only; no lucide/fontawesome/iconify/etc. Icons = local React SVG in `src/icons/` (`Icon.tsx`, `VisualIcon.tsx`, `map.ts`, `types.ts`, `index.ts`) |
| No bare emoji as primary visual (28 + 5 blocks) | **PASS (code)** | `VISUAL_EMOJI` / `visualEmoji` / `BLOCK_ICONS` **fully removed** from `src/`. `BlockCard` / `ActivityCard` / `ActivityDetail` render `<VisualIcon />` only. No bare emoji glyphs in those components. Home card emoji (📋📝➕) left — **explicit non-fail** |
| All 28 mapped | **PASS** | `VISUAL_ICON` has **28** keys; all 28 `seedActivities` `visualKey`s resolve to non-`fallback` iconIds; matches `icon-map.md` row-for-row (0 mismatches) |
| Fallback exists | **PASS** | `resolveIconId('slice04-verifier-unknown-key')` → `'fallback'`; empty/`undefined` → `'fallback'`. Glyph: rounded rect + plus in `Icon.tsx` `case 'fallback'`. Seed **not** mutated |
| Block color language preserved | **PASS (code)** | `BLOCK_COLORS` still amber/sky/violet/rose/green; `VisualIcon` tints tile from `blockType` |
| Experienced-only clear; icons not warning glyphs | **PASS (code)** | `tech-rondat-flickis` → visualKey `tech-rondat-flickis` → **`flip`**; `tech-salto-fran-hojd` → visualKey `tech-salto-height` → **`salto-height`**. Badges + `role="alert"` warning unchanged in `ActivityCard` / `ActivityDetail`. Glyphs are skill arcs/platform+loop — not ⚠/🚨 |
| Text labels remain | **PASS (code)** | Titles adjacent to tiles in all three components |
| Phone + desktop layout | **PARTIAL** | CSS sizes match screen-spec (36/40/44/64 tiles); ≥44px taps / sheet from prior slices not re-broken in code. Needs UI smoke at ~390px |
| Scope guard | **PASS** | No new drills/filters/export; Home emoji out of scope |
| Offline / no icon network | **PASS (build)** | Dist spot-check: no `cdn`/`unpkg`/`jsdelivr`/`fontawesome`/`iconify`/`googleapis` font URLs. Dist HTTP refs = W3 SVG/MathML namespaces + `react.dev/errors` only |

---

## Data / mapping

### Blocks (5/5)

| BlockType | iconId | Match icon-map |
| --- | --- | --- |
| gathering | users-wave | yes |
| warmup | flame | yes |
| techniques | spark | yes |
| strength | dumbbell | yes |
| fun_and_games | smile | yes |

### Activities (28/28)

All seed `visualKey` → `iconId` pairs match `slice-04/icon-map.md`. Highlights:

| id | visualKey | iconId |
| --- | --- | --- |
| tech-rondat-flickis | tech-rondat-flickis | **flip** |
| tech-salto-fran-hojd | tech-salto-height | **salto-height** |

Shared by design: `stretch` ×2 (athlete/coach töjning); `music` ×2 (dance + styrkelåtar).

### Icon vocabulary

| Kind | Count | Notes |
| --- | ---: | --- |
| `IconId` union | 31 | incl. `fallback` |
| `Icon.tsx` switch cases | 31 | 1:1 with union; no missing glyphs |
| Activity map keys | 28 | all used by seed |
| Block map | 5 | — |

---

## Technical

| Check | Verdict | Evidence |
| --- | --- | --- |
| No remote icon CDN dep | **PASS** | `package.json` / lock grep; dist CDN grep clean |
| `npm run build` with icons | **PASS** | green (see Environment) |
| Decorative `aria-hidden` | **PASS** | `VisualIcon` tile span `aria-hidden`; inner `Icon` SVG also `aria-hidden` + `focusable="false"` |
| Abstract strokes (not form cues) | **PASS (code)** | Stroke glyphs, 24×24 viewBox, round caps — matches decisions |
| Vite scaffold `public/icons.svg` | **N/A** | Present, unused (explicit non-fail) |

### Render sites

| Surface | Component | Size prop |
| --- | --- | --- |
| Block header | `BlockCard` → `VisualIcon` + `BLOCK_ICON_IDS` | `block` |
| Session item row | `BlockCard` → `VisualIcon` + `visualKey` | `item` |
| Library card | `ActivityCard` | `card` |
| Activity detail | `ActivityDetail` | `detail` |

### Fallback proof (script, seed clean)

```text
npx tsx -e 'import { resolveIconId } from "./src/icons/map.ts" ...'
# resolved non-fallback 28
# unknown → fallback
# rondat → flip
# salto → salto-height
```

No temporary seed inject; `resolveIconId` + glyph coverage sufficient.

---

## Regression (prior slices — code spot)

| Slice | Spot-check | Verdict |
| --- | --- | --- |
| 01 | Five blocks, budgets, mismatch, draft | **PARTIAL** — structure untouched in icon swap; UI not re-walked |
| 02 | Phone sheet ~390px | **PARTIAL** — needs UI |
| 03 | Counts 3/5/9/3/8; experienced on two drills | **PASS (data)** — seed unchanged; experienced flags still true |

---

## Gaps / UI focus items (for browser / human)

1. **Visual scan Passbyggaren:** 5 block header SVG tiles + colors (amber/sky/violet/rose/green).  
2. **Library:** all 28 cards show tiles (not emoji); spot-check filters/block types.  
3. **Session rows:** add one activity per block — tiles on rows.  
4. **Experienced detail:** open rondat–flickis + salto från höjd — badge + alert + **non-warning** icons (`flip` / `salto-height`).  
5. **Phone ~390px:** sheet library tiles + tap targets still ≥44px.  
6. **Network panel:** no icon CDN requests with cache disabled.  
7. **Cosmetic:** footer still says “Slice 03” — consider bump to Slice 04 (not a locked fail).  
8. **Home:** emoji on action cards remains (allowed).

---

## Summary for parent

| Item | Result |
| --- | --- |
| Build OK? | **Yes** (`npm run build` exit 0) |
| Dev server | **Up** `http://127.0.0.1:5173/` HTTP 200 |
| Map coverage | **28/28** activities + **5/5** blocks |
| Experienced iconIds | `flip`, `salto-height` (not warning glyphs) |
| CDN check | **Clean** (package.json + dist) |
| Fallback proof | **Yes** — unknown key → `fallback`; seed clean |
| Gaps | Footer label Slice 03; UI visual/phone smoke still needed |
| Code verdict vs locked technical/data rules | **PASS** |
| Full checklist PASS | Needs UI focus items above (Product/UX phone+desktop) |

**Product left unbroken:** build green; seed untouched; no code changes by verifier.
