# Slice 10 — Distribution specification pack

**App:** Träningsplaneraren  
**Date drafted:** 2026-09-24 (Europe/Stockholm)  
**Status:** **APPROVED by Christoffer 2026-09-24**

## Goal

Ship the existing Vite + React SPA as a **static production build** so Christoffer (and later coaches) can open a real **`https://…` URL** on phone or laptop — without using the agent computer’s localhost.

Audience lock remains: intuitive for coaches who have never planned a pass in this app. Slice 10 does **not** add cloud sync, accounts, or a rewrite to SSR/backend.

## Brief audit (facts)

| Fact | Detail |
|---|---|
| Stack | Vite + React SPA; `npm run build` → `app/dist` (~356K) |
| Persistence | Draft + tips in **localStorage** only; no backend |
| Reachability today | localhost on the agent computer only |
| Git / GitHub | No git repo at project root yet; `gh` not logged in; GitHub MCP `needsAuth` |
| Goal | HTTPS URL outside that computer for Christoffer’s phone/laptop |

## In scope

- Static production build of the current SPA (same `dist` artifact).
- Hosting decision locked: **GitHub Pages** from a new repo owned/connected by Christoffer (after GitHub auth). Cloudflare Pages / Netlify / Vercel remain documented fallbacks only, using the same `dist`.
- Vite `base` set for locked **GitHub Pages**; Builder records the exact value in ship notes.
- Coach-facing **honesty** note (Swedish): drafts stay in this browser; clearing site data loses the draft; no cloud sync in Slice 10.
- Optional thin **PWA-lite**: `manifest.webmanifest` + icons + meta for “Add to Home Screen” (iOS/Android). **No** service-worker offline cache required for PASS.
- Privacy note in pack: prefer unlisted/private-friendly hosting when possible; public URL is OK for MVP (empty app; coach data is client-only).
- Footer: **Träningsplaneraren · Slice 10** when shipped.
- Verifier: production build green + live URL smoke + honesty note visible + no regression of Slices 01–09 on the hosted build.

## Out of scope

- App Store / Play Store
- Accounts, login, cloud sync, multi-device draft sync
- Custom domain purchase
- CI complexity beyond a simple Pages (or equivalent) deploy of `dist`
- Changing drill library, hall features, Golvklart, or Slice 09 tips behavior
- Tunnels (ngrok, Cloudflare Tunnel, etc.) as **permanent** distribution
- SSR / backend rewrite
- Paid hosting requirements

## Pack contents

| File | Purpose |
|---|---|
| [`README.md`](./README.md) | Goal, audit, in/out, pack index, acceptance, status |
| [`decisions.md`](./decisions.md) | Locked decisions + rejected alternatives |
| [`deploy-spec.md`](./deploy-spec.md) | Build steps, Vite `base`, GitHub Pages path, fallback hosts, auth needs |
| [`screen-spec-distribution.md`](./screen-spec-distribution.md) | Honesty copy placement, footer, optional manifest |
| [`verification-checklist.md`](./verification-checklist.md) | Verifier PASS/FAIL + live URL smoke + regression 01–09 |
| [`content/distribution-copy.sv.md`](./content/distribution-copy.sv.md) | Swedish seeds: honesty note + phone/help copy |

## Acceptance for Christoffer (product owner)

Approval recorded when these statements are locked:

1. **Static ship:** Slice 10 ships the existing SPA via `npm run build` → static `dist`; no SSR/backend rewrite.
2. **Hosting:** **GitHub Pages** (free) is locked after Christoffer connects GitHub. Cloudflare Pages / Netlify / Vercel remain documented fallbacks only, use the same `dist`, and must not require paid plans.
3. **Vite `base`:** Builder sets `base` for locked **GitHub Pages** (`/` vs `/repo-name/`) and records the exact value in ship notes.
4. **Honesty:** A short Swedish note is visible in-app (Home preferred): drafts stay **in this browser** (localStorage); clearing site data loses the draft; no cloud sync in Slice 10.
5. **Privacy:** Pack recommends private-friendly/unlisted hosting when possible; if the URL is public, anyone with the link can open the empty app (no coach data on the server). Acceptable for MVP.
6. **PWA-lite:** Optional if thin — manifest + icons + meta for Add to Home Screen; service-worker offline cache is **not** required for PASS.
7. **Success:** Christoffer opens a real `https://…` URL on his phone, completes Kom igång → build a pass → Hallöversikt → Golvklart/print smoke **without** localhost on the agent computer.
8. **Footer:** Shipped build shows **Träningsplaneraren · Slice 10**.
9. **Regression:** Slices 01–09 behavior remains intact on the hosted build.
10. **Out of scope holds:** No App Store, accounts, cloud sync, custom domain purchase, tunnel-as-product, or feature changes to library/hall.

### Remaining ship details

Record in ship notes when decided:

- **Hosting:** **GitHub Pages is locked**. Cloudflare Pages / Netlify / Vercel remain documented fallbacks only.
- **Repo visibility:** public vs private. **Honest note:** GitHub Pages for a **private** repo may require GitHub Pro; if private Pages is blocked, use a **public** repo (empty app; data stays client-only) or switch to Cloudflare Pages / Netlify / Vercel free tier.

**Approval recorded:** Christoffer approved this pack on 2026-09-24. Builder implements deploy + thin honesty/footer/(optional) manifest without reopening locks → Christoffer connects GitHub → Verifier records PASS/FAIL in [`verification-checklist.md`](./verification-checklist.md) against the live URL.
