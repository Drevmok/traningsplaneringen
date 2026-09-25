# Slice 10 — deploy specification

**Status:** **APPROVED by Christoffer 2026-09-24**  
**Artifact:** static files from `app/dist` (Vite production build).  
**Hosting decision:** **GitHub Pages** is locked. Cloudflare Pages / Netlify / Vercel remain documented fallbacks only.  
**Auth prerequisite:** Christoffer must connect GitHub before a live public/private URL can be published. Agents/MCP cannot finish Pages deploy while GitHub is `needsAuth` / `gh` logged out.

---

## 1. Build steps (locked)

From repo / workspace:

```bash
cd app
npm ci          # or npm install if lockfile workflow differs
npm run build   # tsc -b && vite build → app/dist
```

**PASS expectations:**

- Exit code 0.
- `app/dist/index.html` exists.
- Assets under `app/dist/assets/` (hashed JS/CSS).
- Size stays in the same ballpark as audit (~356K total today; no sudden multi‑MB bloat without cause).

**Do not** introduce a backend build step, Docker runtime for the app, or SSR bundler.

Local sanity (optional before publish):

```bash
cd app && npm run preview
```

Preview is **not** the success criterion — live `https://…` is.

---

## 2. Vite `base` (Builder decision — record in ship notes)

Today `app/vite.config.ts` has no `base` (defaults to `/`).

| Scenario | Set |
|---|---|
| GitHub **user/org** site, or Cloudflare/Netlify/Vercel project at host root | `base: '/'` |
| GitHub **project** Pages at `https://<user>.github.io/<repo>/` | `base: '/<repo>/'` (trailing slash) |

Checklist after changing `base`:

1. Rebuild `dist`.
2. Open hosted URL: Home renders (no blank white screen).
3. Hard-refresh: JS/CSS load (no 404 on `/assets/…` or wrong absolute paths).
4. Navigate Home → Passbyggaren → Hallöversikt → Golvklart; back navigation works.
5. Record in ship notes: host, repo name, visibility, exact `base` value, live URL.

SPA note: GitHub Pages needs a strategy so deep links / refresh on client routes do not 404. Prefer **HashRouter** only if the app already uses it; otherwise use the common Pages pattern (e.g. `404.html` copy of `index.html`, or host that supports SPA fallback). Builder picks the thinnest fix that keeps Slice 01–09 routes working — document it.

---

## 3. Locked path — GitHub Pages

### Prerequisites (Christoffer)

1. Create / connect a GitHub account session usable by the ship workflow (`gh auth login` and/or GitHub MCP auth grant).
2. Create a **new** repository for Träningsplaneraren (name TBD; e.g. `traningsplaneraren` or `gymnastics-planner`).
3. Choose visibility:
   - **Public** — Pages works on free plan; empty app is public; coach data still client-only.
   - **Private** — Pages may require **GitHub Pro**; if unavailable, use public repo or a fallback host (Decision E).

### Suggested thin workflow

Option A — **GitHub Actions** (classic static Pages):

1. Commit app source (or at least buildable `app/`) to the repo.
2. Workflow: `npm ci` + `npm run build` in `app/`, upload `app/dist` as Pages artifact, deploy with `actions/deploy-pages`.
3. Enable Pages: Source = GitHub Actions.

Option B — **branch deploy** (`gh-pages` / `docs/` / `/docs` on `main`):

1. Build locally or in CI.
2. Publish contents of `dist` to the branch/folder Pages serves.
3. Enable Pages for that source.

Either option is PASS if the live URL serves the SPA correctly. Prefer Actions if Christoffer is fine connecting secrets/permissions once.

### Secrets / permissions

- No app runtime secrets (no API keys in the SPA for Slice 10).
- Needs: Christoffer’s GitHub auth + Pages write permission for the repo.
- Do **not** commit personal access tokens into the repo.

### Example live URL shapes

- Project Pages: `https://<user>.github.io/<repo>/`
- User site (if used): `https://<user>.github.io/`

---

## 4. Documented fallback hosts (same `dist`, free tier)

Document only; use if GitHub Pages is unavailable (auth, private-repo Pro, or an explicitly recorded change).

| Host | How | `base` typical | Notes |
|---|---|---|---|
| **Cloudflare Pages** | Connect repo or direct upload of `dist` | `/` | Free; good SPA fallback support |
| **Netlify** | Drag-drop `dist` or repo build (`npm run build`, publish `dist`) | `/` | Free; `_redirects` or SPA setting for client routes |
| **Vercel** | Import repo / CLI; output `dist`, framework Vite | `/` | Free hobby tier |

All fallbacks must remain **no paid plan required** for MVP. Custom domain purchase stays out of scope (Decision H / rejected).

---

## 5. Privacy posting checklist

Before sharing the URL with other coaches:

- [ ] Confirm whether the URL is public or access-restricted.
- [ ] Honesty note visible on Home (or agreed placement).
- [ ] Understand: sharing the link shares the **empty app shell**, not Christoffer’s localStorage draft.
- [ ] Prefer not to paste the URL into world-writable public channels if a private-friendly option exists — still OK for MVP if public.

---

## 6. What Builder may change in app (thin)

Allowed for Slice 10 ship:

- `vite.config.ts` → `base` (and only related static-path config).
- Footer string → `Slice 10`.
- Honesty copy + optional Home help line (from `content/distribution-copy.sv.md`).
- Optional: `public/manifest.webmanifest`, icons, `index.html` meta / `theme-color` / apple touch icon links.
- Thin SPA fallback file for Pages if required (`404.html` duplicate) — document if used.

**Not allowed:** library/hall/Golvklart/tips feature changes; adding a service worker unless explicitly approved later (not required for PASS).

---

## 7. Ship notes template (Builder fills)

```text
Host: **GitHub Pages** (locked; Cloudflare Pages / Netlify / Vercel documented fallbacks only)
Repo: <url>   Visibility: public | private
base: / | /<repo>/
Live URL: https://…
SPA fallback: (none | 404.html | host setting)
PWA-lite: yes | no
Auth: Christoffer connected GitHub/host on <date Europe/Stockholm>
```
