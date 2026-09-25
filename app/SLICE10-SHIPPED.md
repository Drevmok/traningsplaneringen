# Slice 10 — SHIPPED

**Date:** 2026-09-24 (Europe/Stockholm)  
**App:** Träningsplaneraren (`/workspace/gymnastics-planner/app`)  
**Pack:** `slice-10/` (distribution) — Docs copy locked in `docs/distribution-copy.sv.md` (+ `slice-10/content/distribution-copy.sv.md`)

## Ship notes (deploy-spec §7)

```text
Host: GitHub Pages (planned; not deployed by Builder)
Repo: TBD (Planner)
Visibility: TBD (Planner / Christoffer)
base: /traningsplaneraren/
Live URL: not yet (Planner deploys)
SPA fallback: no — app uses in-memory React view state (home | builder | hall), not BrowserRouter/HashRouter; no client URL routes to fall back
PWA-lite: yes (manifest + icons 192/512 + meta; no service worker)
Auth: Planner/Christoffer after green (GitHub Pages)
```

Override `base` at build time: `VITE_BASE=/other-path/ npm run build` (trailing slash).

## How to run / build

```bash
cd /workspace/gymnastics-planner/app
npm install   # if needed
npm run build # production — green; artifact in app/dist
npm run preview  # optional local sanity under base path
```

## Features shipped

1. **Footer** — exactly **Träningsplaneraren · Slice 10** via `UI.footerSliceLabel`. `Visa tips igen` kept. Footer remains `no-print`.

2. **Honesty note (Home, always-on)** — quiet strip below cards / Visa tips igen:
   - Title: `draftHonestyTitle`
   - Body: `draftHonestyBody`
   - Extra line: `draftHonestyOtherDevice`
   - **Choice:** always-on (not dismissible) for MVP simplicity — no footer **Om utkast** needed. Documented here. Print: `no-print` (hidden in Golvklart print).

3. **Öppna på telefon** — **skipped** (optional for PASS; no live HTTPS URL yet). Strings wired in `UI` for later use (`oppnaPaTelefon*`).

4. **PWA-lite** — `public/manifest.webmanifest` (name/short_name/description from Docs; `lang: sv`; `display: standalone`; relative `start_url`/`scope`/`icons` so they honor Vite `base`). Icons: `icon-192.png`, `icon-512.png` (simple brand mark, purple). `index.html`: theme-color, apple-mobile-web-app-capable/title, link rel=manifest, apple-touch-icon. **No service worker.**

5. **Vite `base`** — default `/traningsplaneraren/` (GitHub project Pages). Configurable via `VITE_BASE`. Rebuild verified: assets resolve under `/traningsplaneraren/assets/…`.

6. **SPA fallback** — not added (no BrowserRouter). See ship notes box above.

## Verification (Builder)

- `npm run build` — exit 0.
- `dist/index.html` exists; hashed assets under `dist/assets/`.
- Manifest + icons present in `dist/`.
- No service worker.
- Did **not** deploy to GitHub / touch `gh` auth / create repos.

## Files changed / added

**Added**

- `public/manifest.webmanifest`
- `public/icon-192.png`
- `public/icon-512.png`
- `SLICE10-SHIPPED.md`

**Updated**

- `vite.config.ts` — `base: process.env.VITE_BASE ?? '/traningsplaneraren/'`
- `index.html` — PWA-lite meta + manifest / apple-touch-icon links
- `src/App.tsx` — footer → `UI.footerSliceLabel` (Slice 10)
- `src/components/Home.tsx` — always-on honesty strip (`no-print`)
- `src/data/blockMeta.ts` — Slice 10 strings from Docs lock
- `src/App.css` — `.home-honesty*` quiet strip styles

## Deviations

- Öppna på telefon UI block not rendered (optional; no live URL yet). Keys present in `UI`.
- Honesty is always-on (preferred MVP); `omUtkast` / dismiss not used.
- No `404.html` SPA fallback (not needed without URL client routing).
- Docs seed already mirrored at `docs/distribution-copy.sv.md` — no extra Docs edit.

## Scope guard

No deploy, no service worker, no accounts/sync, no library/hall/Golvklart/tips behavior changes beyond footer + honesty chrome + manifest/base. Did not rewrite SLICE01–09 ship note headings.
## Live publish (2026-09-24)

- Host: Netlify (upload), not GitHub Pages
- URL: https://fancy-blancmange-4d516b.netlify.app/
- Build: VITE_BASE=/ (root paths)
- Published from Planner computer after Christoffer Netlify signup on box

- Public access: visitor gate disabled; unauthenticated HTTP 200
