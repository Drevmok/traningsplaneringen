# Slice 10 — Code evidence pack (Verifier)

**Date:** 2026-09-24 11:47 CEST (Europe/Stockholm)  
**Agent:** code verifier (executor subagent)  
**Authority:** `slice-10/verification-checklist.md` (APPROVED 2026-09-24) + `app/SLICE10-SHIPPED.md` + `slice-10/decisions.md`  
**Scope:** `VITE_BASE=/ npm run build`, dist/manifest/icons, footer + honesty strings, PWA-lite static, scope guard, 28-drill spot-check — **not** live HTTPS UI smoke / phone glance  
**Product rewrite:** none (evidence only)

---

## Environment / build

| Check | Result | Evidence |
| --- | --- | --- |
| App path | `/workspace/gymnastics-planner/app` | — |
| `VITE_BASE=/ npm run build` | **PASS** (exit **0**) | `tsc -b && vite build` → vite v8.3.0; 42 modules; `dist/index.html` 0.88 kB; `index-DnHZwNs7.css` 26.69 kB; `index-DWLqFphY.js` 302.44 kB; built in ~230 ms; `EXIT:0` |
| `dist/index.html` + hashed assets | **PASS** | `dist/index.html`; `dist/assets/index-DWLqFphY.js` (302448 B); `dist/assets/index-DnHZwNs7.css` (26699 B) |
| Manifest + icons in dist | **PASS** | `dist/manifest.webmanifest` (558 B); `dist/icon-192.png` (192×192, 669 B); `dist/icon-512.png` (512×512, 2648 B) |
| Vite `base` matches live publish | **PASS** | Ship: `VITE_BASE=/`; dist HTML asset hrefs `/assets/…` (no `/traningsplaneraren/`); `vite.config.ts` `base: process.env.VITE_BASE ?? '/traningsplaneraren/'` |
| Errors | none | clean build stdout |

---

## Legend

- **PASS** — satisfied from code/static with concrete evidence  
- **PARTIAL** — present in code; needs UI/browser or live URL confirmation  
- **FAIL** — clear violation (none on code/static side)  
- **N/A / DEFERRED** — out of this pack (live smoke / phone); not a code FAIL here  
- **NOTE** — host fallback vs locked GH Pages (documented)

---

## 1. Build / deploy (static)

| Checklist row | Verdict | Evidence |
| --- | --- | --- |
| `npm run build` exits 0 | **PASS** | Rebuilt with `VITE_BASE=/`; exit 0 (above) |
| `app/dist/index.html` + hashed assets | **PASS** | Present under `dist/` + `dist/assets/` |
| Vite `base` matches host (ship notes) | **PASS** | Live publish records `VITE_BASE=/`; dist paths root-absolute |
| Host locked GH Pages / documented fallbacks | **PASS (NOTE)** | Locked path = GitHub Pages (`decisions.md` §B); **Netlify** is listed documented fallback. `SLICE10-SHIPPED.md` Live publish block records: Host Netlify, URL `https://fancy-blancmange-4d516b.netlify.app/`, Build `VITE_BASE=/`. Per task: documented fallback OK when ship notes record it |
| Ship notes: host, repo, `base`, live URL | **PASS** | Ship notes + Live publish section list host, base, URL; repo visibility still TBD for GH Pages path (Netlify path does not require GH repo) |
| No runtime secrets committed for SPA | **PASS** | No `.env*`; `package.json` deps = react/react-dom only; no API keys in src |

**Static ship / no SSR:** **PASS** — Vite SPA → `app/dist` only; no Next/SSR/backend.

---

## 2. Footer / honesty / chrome

| Checklist row | Verdict | Evidence |
| --- | --- | --- |
| Footer **Träningsplaneraren · Slice 10** | **PASS** | `blockMeta.ts:239` `footerSliceLabel: 'Träningsplaneraren · Slice 10'`; `App.tsx` footer renders `{UI.footerSliceLabel}` with `className="app-footer no-print"`; dist JS contains exact string once |
| Swedish honesty note (Home): browser-local; clear data loses draft; no cloud sync | **PASS** | Home always-on `<aside className="home-honesty no-print">` (`Home.tsx:154-164`); strings: title `Utkastet stannar i den här webbläsaren`; body includes lokal webbläsare + `Rensar du webbplatsdata försvinner utkastet` + `Ingen sparning i molnet`; other-device line (no sync implication) (`blockMeta.ts:240-245`) |
| Honesty / distribution chrome hidden in Golvklart **print** | **PASS (code)** | Honesty + footer both `no-print`; `@media print` sets `.no-print { display: none !important; }` (`App.css` ~2086+). Live print preview **not** exercised here → UI pack may confirm |
| Vocabulary OK; no false sync claims | **PASS** | Uses utkast / webbläsare / pass / tips; body explicitly no cloud; other-device starts empty |

Dist bundle spot-check: `Träningsplaneraren · Slice 10`, `Utkastet stannar`, `Rensar`, `inte i molnet`, `webbläsaren` present; `home-honesty` in JS + CSS.

---

## 3. PWA-lite

| Checklist row | Verdict | Evidence |
| --- | --- | --- |
| Manifest valid JSON; `start_url` respects base; icons load | **PASS** | `dist/manifest.webmanifest` parses; `start_url`/`scope` = `./` (relative → honors host root with `VITE_BASE=/`); icons `icon-192.png` / `icon-512.png` present in dist at declared sizes; `index.html` links `rel=manifest`, apple-touch-icon, theme-color, apple-mobile-web-app-* |
| No service worker required | **N/A → not FAIL** | No `serviceWorker` / workbox hits in `src`/`public`/`dist`; no `dist/sw.js`; SHIPPED: PWA-lite without SW |

---

## 4. Technical / scope guard

| Checklist row | Verdict | Evidence |
| --- | --- | --- |
| No App Store / Play packaging | **PASS** | Manifest + icons only; no store packaging |
| No accounts / cloud sync / backend API | **PASS** | Deps react/react-dom; no fetch/axios/supabase/firebase auth API; draft key `gymnastics-planner-draft-v1` remains local; “sync” hits are tips/media-query heuristics only |
| No tunnel as permanent coach URL | **PASS** | Ship notes record Netlify HTTPS URL, not tunnel |
| Drill library unchanged (28 seed) | **PASS** | `seedActivities.ts`: **28** activity ids; **2** `experiencedCoachOnly: true` |
| Hall presets / snap / Golvklart unchanged | **PASS (spot)** | Presets `standard-trupp` / `tavling-linjer` / `liten-hall` retained; `hallFloorReady: 'Golvklart'`; schematic caption string retained |
| Slice 09 tips keys / dismiss intact | **PASS (spot)** | `TIPS_STORAGE_KEY = 'gymnastics-planner-tips-v1'`; `tip-builder-empty`; Kom igång / Visa tips igen strings + wiring retained |
| Views unchanged | **PASS** | `View = 'home' \| 'builder' \| 'hall'` only (`App.tsx:30`) |
| Historical SLICE01–09 ship notes | **PASS** | Files retained; not mass-renamed |

---

## 5. Live URL smoke — **out of this pack**

| Checklist live rows | Verdict here | Note |
| --- | --- | --- |
| Open live `https://…` Home / Kom igång / Passbyggaren / Hall / Golvklart / reload / hard-refresh | **DEFERRED** | External / UI smoke separate. Curl to `https://fancy-blancmange-4d516b.netlify.app/` → **HTTP 401** (Netlify edge access / visitor gate). Code/static cannot assert phone usability while gated |
| Phone ~390px live | **DEFERRED** | Same |

Code/static does **not** FAIL the slice for the gate; live PASS remains blocked until an authenticated external browser can smoke the URL.

---

## 6. Regression 01–09 (code spot-check only)

| Slice | Verdict | Evidence |
| --- | --- | --- |
| **01** Passbyggaren / draft | **PASS (code)** | Views + localStorage draft key in bundle; builder path retained |
| **02** Phone layout | **PASS (code)** | Narrow MQ sync retained in builder/hall |
| **03** Swedish drills | **PASS (code)** | 28 seed activities unchanged |
| **04** Icons | **PASS (code)** | Visual icon path untouched in this slice surface |
| **05–06** Hall / presets | **PASS (code)** | Three presets + schematic note retained |
| **07** Flow / Golvklart / print | **PASS (code)** | Golvklart strings + print `no-print` rules retained |
| **08** Footer pattern / polish | **PASS (code)** | Footer `no-print` + Visa tips igen; honesty additive |
| **09** Kom igång + tips | **PASS (code)** | Tips key + Kom igång + Visa tips igen intact |

---

## 7. Files inspected (Slice 10 surface)

| Path | Role |
| --- | --- |
| `vite.config.ts` | `VITE_BASE` / default GH Pages base |
| `index.html` / `dist/index.html` | PWA meta + root asset paths |
| `public/manifest.webmanifest` → `dist/` | PWA-lite manifest |
| `public/icon-192.png`, `icon-512.png` → `dist/` | Icons |
| `src/data/blockMeta.ts` | Footer + honesty + Öppna på telefon strings |
| `src/components/Home.tsx` | Always-on honesty strip `no-print` |
| `src/App.tsx` | Footer Slice 10 `no-print` |
| `src/App.css` | `.home-honesty*` + print hide `.no-print` |
| `src/data/seedActivities.ts` | 28-drill spot-check |
| `app/SLICE10-SHIPPED.md` | Host / base / live URL record |
| `slice-10/decisions.md` | GH Pages lock + Netlify fallback |

---

## Verifier sign-off (code pack)

| Field | Value |
| --- | --- |
| Live URL (recorded) | `https://fancy-blancmange-4d516b.netlify.app/` |
| Live access from this agent | **401 gated** (curl) — external smoke separate |
| Device used | Agent box (build + static inspect only) |
| Host / `base` | **Netlify** (documented fallback) / `VITE_BASE=/` |
| Date | 2026-09-24 11:47 CEST (Europe/Stockholm) |
| **Code/static result** | **PASS** |
| Full checklist (incl. live phone smoke) | **BLOCKED / DEFERRED** on live gate — not a code FAIL |
| Notes | Rebuild green with root base matching ship Live publish; footer + honesty + PWA-lite static OK; 28 drills untouched; Netlify fallback documented in ship notes vs GH Pages lock |

