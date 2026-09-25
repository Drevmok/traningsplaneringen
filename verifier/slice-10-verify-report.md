# Slice 10 — Formal verification report (Distribution / live smoke)

**Date:** 2026-09-24 ~11:53 CEST (Europe/Stockholm)  
**Verifier:** Verifier  
**Authority:** `/workspace/gymnastics-planner/slice-10/verification-checklist.md` (APPROVED)  
**Build:** `/workspace/gymnastics-planner/app` — `VITE_BASE=/ npm run build` exit 0  
**Live URL:** `https://fancy-blancmange-4d516b.netlify.app/`  
**Device used:** Box browser (external HTTPS session — not agent localhost)  
**Host / base:** Netlify (documented fallback) · `base: /`  
**Evidence:** `slice-10-evidence-code.md` + `/workspace/screenshots/slice10_*.png`  
**Ship notes:** `app/SLICE10-SHIPPED.md` (Live publish section)

---

## Overall verdict: **PASS**

| Section | Verdict |
| --- | --- |
| Build / deploy | **PASS** |
| Live URL smoke (HTTPS) | **PASS** |
| Honesty / chrome | **PASS** |
| PWA-lite | **PASS** |
| Phone ~390px on live | **PASS** |
| Scope guard | **PASS** |
| Regression 01–09 on hosted build | **PASS** |
| Locked rules | **None failed** |

---

## Locked rules

| Rule | Result | Notes |
| --- | --- | --- |
| Static ship (`app/dist`) | PASS | No SSR/backend |
| npm run build green | PASS | With `VITE_BASE=/` matching live |
| Live https verified (not localhost-only) | PASS | Box browser on Netlify URL |
| Swedish honesty note | PASS | Browser-local; clear data loses draft; no cloud sync |
| Footer Träningsplaneraren · Slice 10 | PASS | Live |
| base / assets | PASS | Root `/`; Home renders; hard-refresh OK |
| PWA-lite | PASS | Manifest + icons 200; SW absent = N/A OK |
| Scope guard | PASS | No App Store/accounts/sync/tunnel-permanent |
| Regression 01–09 | PASS | On hosted build |

---

## Build / deploy

| Check | Result |
| --- | --- |
| npm run build exit 0 | PASS |
| dist/index.html + hashed assets | PASS |
| Vite base matches host (`/`) | PASS (live publish; default GH Pages base `/traningsplaneraren/` overridden via `VITE_BASE`) |
| Host = GH Pages **or** documented fallback | PASS | **Netlify** recorded in ship notes (fallback allowed) |
| Ship notes: host, base, live URL | PASS |
| No runtime secrets in SPA | PASS |

---

## Live URL smoke

| Check | Result |
| --- | --- |
| https opens Home | PASS |
| Kom igång / Visa tips igen | PASS |
| Passbyggaren ≥1 övning | PASS |
| Hallöversikt place + caption | PASS |
| Golvklart + print preview | PASS |
| Reload keeps draft (same browser) | PASS |
| Hard-refresh no 404 JS/CSS | PASS |

---

## Honesty / chrome

| Check | Result |
| --- | --- |
| Swedish honesty on Home | PASS |
| Footer Slice 10 | PASS |
| Honesty hidden in Golvklart print | PASS |
| Vocabulary / no false sync | PASS |

---

## PWA-lite

| Check | Result |
| --- | --- |
| Manifest JSON + icons load | PASS (HTTP 200) |
| Service worker | N/A (absent; not FAIL) |

---

## Phone (~390px) on live

| Check | Result |
| --- | --- |
| Home CTAs; honesty does not block | PASS |
| Ej placerade tray usable | PASS |
| Primary taps usable | PASS |

---

## Regression 01–09 (hosted)

| Slice | Result |
| --- | --- |
| 01–04 Passbyggaren / phone / drills / icons | PASS |
| 05–06 Hall / snap / presets | PASS |
| 07–08 Flow / Golvklart / polish | PASS |
| 09 Kom igång + tips | PASS |

---

## Non-blocking notes

1. **Netlify visitor gate:** Unauthenticated `curl` receives **401** / edge-access redirect. The box browser session (established after Christoffer Netlify signup) opened the app successfully. Coaches without visitor access would be blocked until the site is public or they have the share password — product-privacy choice, not a checklist FAIL for this smoke (browser HTTPS path verified).
2. **Host:** Locked path was GitHub Pages; **Netlify** used as documented free-tier fallback with ship notes updated — accepted.
3. **Default Vite base** remains `/traningsplaneraren/` for GH Pages; live publish correctly used `VITE_BASE=/`.

---

## Screenshots

- Home + honesty: `slice10_home.png`
- Builder: `slice10_builder.png`
- Hall: `slice10_hall.png`
- Golvklart: `slice10_golvklart.png`
- Print preview: `slice10_print_preview.png`
- Reload draft: `slice10_reload.png`
- Phone hall: `slice10_phone_hall.png`
- Tips: `slice10_tips.png`
- Initial probe: `slice10_live_probe.png`

(Under `/workspace/screenshots/`.)

---

## Recommendation

Accept Slice 10 as **PASS**. Optional follow-up for Christoffer: confirm whether the Netlify visitor gate should stay (privacy) or be opened for unrestricted coach links.
