# Verification checklist — Slice 10 (Distribution)

**Slice passes when** Christoffer can open a real **`https://…` URL** on his phone, use Kom igång → pass → Hallöversikt → Golvklart/print, see the localStorage honesty note, and keep Slices 01–09 working on the **hosted** build — with a green production build and footer **Träningsplaneraren · Slice 10**.

Use this checklist as sole Slice 10 authority after Christoffer approval.

**Status:** **APPROVED by Christoffer 2026-09-24**  
**Hosting decision:** **GitHub Pages** is locked; Cloudflare Pages / Netlify / Vercel remain documented fallbacks only.  
**Verifier:** record PASS/FAIL per row when implement + deploy are done.  
**Auth note:** Live URL rows stay blocked until Christoffer connects GitHub for the locked GitHub Pages path.

---

## Locked pass/fail rules

- **Static ship:** Fail if the shipped product depends on a new backend/SSR instead of `app/dist`.
- **Build:** Fail if `npm run build` in `app/` is not green on the shipped revision.
- **Live URL:** Fail if success smoke only runs on agent localhost and no `https://…` URL was verified on a real phone or equivalent external browser.
- **Honesty:** Fail if no Swedish note communicates that drafts stay in this browser / clearing site data loses the draft / no cloud sync.
- **Footer:** Fail if footer is not **Träningsplaneraren · Slice 10** on the hosted build.
- **base / assets:** Fail if hosted Home is blank due to wrong Vite `base` or 404 assets.
- **PWA-lite:** Absence of manifest/service worker is **not** FAIL. Broken install metadata that 404s critical assets **is** FAIL if PWA files were added.
- **Scope guard:** App Store, accounts, cloud sync, custom domain purchase, tunnel-as-permanent-distribution, library/hall feature rewrites — presence as new Slice 10 work → FAIL. Absence → not FAIL.
- **Regression:** Slices 01–09 behaviors below must still PASS on the hosted build.

---

## Build / deploy

| Result | Check |
|---|---|
| [ ] PASS [ ] FAIL | `cd app && npm run build` exits 0 |
| [ ] PASS [ ] FAIL | `app/dist/index.html` + hashed assets present |
| [ ] PASS [ ] FAIL | Vite `base` matches host (recorded in ship notes) |
| [ ] PASS [ ] FAIL | Host is the locked **GitHub Pages** path (documented fallbacks only) — no paid requirement |
| [ ] PASS [ ] FAIL | Ship notes list: host, repo visibility, `base`, live URL |
| [ ] PASS [ ] FAIL | No runtime secrets committed for the SPA |

## Live URL smoke (HTTPS, not agent localhost)

| Result | Check |
|---|---|
| [ ] PASS [ ] FAIL | Live `https://…` opens Home on phone or external laptop browser |
| [ ] PASS [ ] FAIL | **Kom igång** visible / usable (or restored via Visa tips igen) |
| [ ] PASS [ ] FAIL | Build a pass in **Passbyggaren** (add ≥1 övning) |
| [ ] PASS [ ] FAIL | **Hallöversikt** places / shows schematic caption |
| [ ] PASS [ ] FAIL | **Golvklart** + print smoke (print preview or device print UI) |
| [ ] PASS [ ] FAIL | Reload keeps draft in **same** browser (localStorage) |
| [ ] PASS [ ] FAIL | Hard-refresh does not 404 JS/CSS |

## Honesty / chrome

| Result | Check |
|---|---|
| [ ] PASS [ ] FAIL | Swedish honesty note visible (Home primary): browser-local draft; clear data loses draft; no cloud sync |
| [ ] PASS [ ] FAIL | Footer **Träningsplaneraren · Slice 10** |
| [ ] PASS [ ] FAIL | Honesty / distribution chrome hidden in Golvklart **print** |
| [ ] PASS [ ] FAIL | Vocabulary OK (utkast, webbläsare, pass, övning) — no false sync claims |

## PWA-lite (optional)

| Result | Check |
|---|---|
| [ ] PASS [ ] FAIL [ ] N/A | If manifest added: valid JSON, `start_url` respects `base`, icons load |
| [ ] PASS [ ] FAIL [ ] N/A | No service worker required; if SW absent → mark N/A not FAIL |

## Phone (~390px) on live URL

| Result | Check |
|---|---|
| [ ] PASS [ ] FAIL | Home CTAs reachable; honesty note does not block them |
| [ ] PASS [ ] FAIL | Hall **Ej placerade** tray still usable (Slice 08 regression) |
| [ ] PASS [ ] FAIL | Primary tap targets usable |

## Technical / scope guard

| Result | Check |
|---|---|
| [ ] PASS [ ] FAIL | No App Store / Play Store packaging as Slice 10 deliverable |
| [ ] PASS [ ] FAIL | No accounts / cloud sync / backend API added |
| [ ] PASS [ ] FAIL | No tunnel documented as the permanent coach URL |
| [ ] PASS [ ] FAIL | Drill library counts/content unchanged (28 seed activities) |
| [ ] PASS [ ] FAIL | Hall presets/snap/Golvklart rules unchanged |
| [ ] PASS [ ] FAIL | Slice 09 tips keys/dismiss behavior intact |

## Regression — Slices 01–09 on hosted build

| Result | Check |
|---|---|
| [ ] PASS [ ] FAIL | **01** Passbyggaren blocks, empty tips, draft save |
| [ ] PASS [ ] FAIL | **02** Phone layout usable |
| [ ] PASS [ ] FAIL | **03** Real Swedish drills present |
| [ ] PASS [ ] FAIL | **04** Icons/visuals render |
| [ ] PASS [ ] FAIL | **05–06** Hallöversikt zones, snap, presets |
| [ ] PASS [ ] FAIL | **07** Stationsordning / flow / Golvklart / print |
| [ ] PASS [ ] FAIL | **08** Footer pattern + polish regressions not reintroduced |
| [ ] PASS [ ] FAIL | **09** Kom igång + tips + Visa tips igen |

---

## Verifier sign-off

| Field | Value |
|---|---|
| Live URL | |
| Device used | |
| Host / `base` | |
| Date (Europe/Stockholm) | |
| Result | PASS / FAIL |
| Notes | |
