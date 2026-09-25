# Slice 12 — Formal verification report (visual station markers + tap-to-detail)

**Date:** 2026-09-24 ~15:12 CEST (Europe/Stockholm)  
**Verifier:** Verifier  
**Authority:** `/workspace/gymnastics-planner/slice-12/verification-checklist.md`  
**Build:** `/workspace/gymnastics-planner/app` — `npm run build` exit 0  
**URL:** `http://127.0.0.1:5173/` (local; Netlify optional/non-blocking)  
**Evidence:** `slice-12-evidence-code.md` + `/workspace/screenshots/slice12_*.png`  
**Ship notes:** `app/SLICE12-SHIPPED.md`  
**Docs copy:** `docs/station-tiles.sv.md`

---

## Overall verdict: **PASS**

| Section | Verdict |
| --- | --- |
| Visual markers / tap-detail / drag≠detail | **PASS** |
| Erfaren / Teknik-only / tray | **PASS** |
| Golvklart / detail read-only | **PASS** |
| Footer / scope | **PASS** |
| Phone ~390px | **PASS** |
| Locked rules | **None failed** |

---

## Locked rules

| # | Rule | Result | Notes |
| --- | --- | --- | --- |
| 1 | Visual markers | **PASS** | Code: icon-first ~52px canvas marker, title hidden on screen, duration hidden. UI: compact icon-led markers with ranks, not wide text cards. |
| 2 | Tap → detail | **PASS** | Tap opened ActivityDetail with correct activity; still placed after close. |
| 3 | Drag ≠ detail | **PASS** | Code: dragstart suppress flag in HallChip. UI: drag moved marker; detail stayed closed. |
| 4 | Erfaren | **PASS** | Mark on tile and in detail (UI + code). |
| 5 | Teknik-only | **PASS** | `hall.ts` untouched; tray Teknik only in UI. |
| 6 | Tray usable | **PASS** | Phone ~390px showed Placera här / usable tray. |
| 7 | Golvklart | **PASS** | Markers + ranks readable; Teknik flow. |
| 8 | Detail read-only | **PASS** | No add-to-pass from hall detail. |
| 9 | Footer | **PASS** | Exact `Träningsplaneraren · Slice 12`. |
| 10 | Scope | **PASS** | No equipment composition / CAD / new placeable blocks. |

---

## Smoke path

| Step | Result |
| --- | --- |
| Pass ≥2 Teknik + other block; tray Teknik only | PASS |
| Place two → icon-first markers with ranks | PASS |
| Tap → detail; close → still placed | PASS |
| Drag → moves; detail does not open | PASS |
| Golvklart + phone tray | PASS |
| npm run build green | PASS |

---

## Non-blocking / notes

- **Live Netlify:** not required for Slice 12 PASS.
- Canvas remove × is compact (~22–24px) per ship notes; tray remove stays ≥44px — not a checklist FAIL.
- Drag vs tap uses dragstart suppress flag (not movement threshold) — matches ship notes.

---

## Screenshots

- `slice12_home.png` — footer Slice 12  
- `slice12_builder.png` — pass with Teknik + other  
- `slice12_markers.png` — icon-first markers  
- `slice12_detail.png` — tap detail read-only  
- `slice12_after_drag.png` — drag without opening detail  
- `slice12_erfaren.png` — Erfaren on tile/detail  
- `slice12_golvklart.png`  
- `slice12_phone.png` — ~390px tray  

---

## Verdict for Planner

**PASS** — all locked rules satisfied. Report: `verifier/slice-12-verify-report.md`.
