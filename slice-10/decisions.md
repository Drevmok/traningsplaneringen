# Slice 10 — locked decisions

**App:** Träningsplaneraren  
**Status:** **APPROVED by Christoffer 2026-09-24**  
**Source:** Planner product locks (Distribution) + audit (Vite SPA, localStorage-only, localhost-only today).

Implementation follows the locked GitHub Pages path; the free hosts listed below remain documented fallbacks only, and must not reopen the locks.

---

## A. Static production build only

- Ship the **existing** Vite + React SPA as static files from `npm run build` (`app/dist`, ~356K today).
- **No** rewrite to SSR, Next.js, or any backend for Slice 10.
- **No** new API, database, or auth service.

## B. Hosting — GitHub Pages locked; documented fallbacks only

- **Locked host:** GitHub Pages from a new repo owned or connected by Christoffer, after he authenticates GitHub (`gh` / GitHub MCP / browser OAuth as available).
- **Documented fallbacks only (same `dist` artifact, free tier):** Cloudflare Pages, Netlify, or Vercel.
- Pack must **not** require paid services.
- Builder records which host was used in ship notes (`SLICE10-SHIPPED.md` or equivalent).

## C. Vite `base` is a Builder decision (recorded)

| Host pattern | Typical `base` |
|---|---|
| User/org site, custom domain, or host root (Cloudflare/Netlify/Vercel default) | `/` |
| GitHub project Pages (`https://user.github.io/repo-name/`) | `/repo-name/` |

- Wrong `base` breaks assets and client routing — treat as ship-blocking.
- Exact `base` value is a **Builder decision** once the GitHub repo name is known; it must be written into ship notes.

## D. Coach-facing honesty (localStorage)

- Short Swedish note in-app (Home preferred; footer secondary OK):
  - Utkast och tips sparas **i den här webbläsaren**.
  - Rensar man webbplatsdata försvinner utkastet.
  - **Ingen** molnsynk i Slice 10.
- Same browser profile on the same device keeps the draft; a different phone/browser starts empty. Do not imply sync.

## E. Privacy posture

- **Recommend** unlisted / private-friendly hosting when the platform allows it without paid plans.
- If the URL is **public:** anyone with the link can open the empty app. There is **no coach data on the server** (client-only localStorage). Still **OK for MVP**.
- **Honest constraint:** GitHub Pages on a **private** repo may need **GitHub Pro**. If blocked → public repo (acceptable: empty shell) **or** Cloudflare/Netlify/Vercel free tier.

## F. PWA-lite (optional, thin)

- **In scope if thin:** `manifest.webmanifest` + icons + meta tags so “Lägg till på hemskärmen” / Add to Home Screen works on iOS/Android.
- **Not required for PASS:** service worker / offline cache.
- Must not break print, Golvklart, or existing routing.

## G. Footer

- When Slice 10 ships, footer reads exactly: **Träningsplaneraren · Slice 10**.
- Do not rewrite historical `SLICE01–09-SHIPPED.md` headings.

## H. Success criterion

Christoffer can open a real `https://…` URL on his phone, complete:

**Kom igång → build a pass → Hallöversikt → Golvklart / print smoke**

without using the agent computer’s localhost.

---

## Rejected alternatives

| Alternative | Decision |
|---|---|
| Tunnel (ngrok / Cloudflare Tunnel / similar) as **permanent** product distribution | Rejected: fragile, agent-machine-bound, not a coach-facing URL. Temporary debug OK outside this pack; not the ship path. |
| App Store / Play Store | Rejected: out of scope; PWA-lite Add to Home Screen is enough if done. |
| Cloud sync / accounts / multi-device draft | Rejected: localStorage honesty is the Slice 10 product lock. |
| SSR / backend rewrite | Rejected: static `dist` only. |
| Paid hosting or custom domain purchase as requirement | Rejected: free-tier path must exist. |
| Complex CI (matrix, preview envs, multi-stage pipelines) | Rejected: simple Pages / drag-drop / one workflow deploy of `dist` is enough. |
| Changing drill library, hall geometry, Golvklart, or Slice 09 tip behavior | Rejected: distribution slice only. |

---

## Builder / Verifier notes

- Do not change app feature behavior beyond: footer label, honesty copy placement, optional thin manifest/meta, and Vite `base` for deploy.
- Auth prerequisite is **Christoffer’s** GitHub connection — agents cannot complete GitHub Pages deploy until that exists.
- Verifier smoke runs against the **live HTTPS URL**, not only `vite preview` on localhost.
