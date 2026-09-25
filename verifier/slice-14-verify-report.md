# Slice 14 — Formal verification report (Golvklart/print redskap under markör)

**Date:** 2026-09-25 ~09:54 CEST (Europe/Stockholm)  
**Verifier:** Verifier  
**Authority:** `/workspace/gymnastics-planner/slice-14/verification-checklist.md` (APPROVED)  
**Build:** `/workspace/gymnastics-planner/app` — `npm run build` exit 0  
**URL:** `http://127.0.0.1:5173/` (local; Netlify optional/non-blocking)  
**Evidence:** `slice-14-evidence-code.md` + `/workspace/screenshots/slice14_*.png`  
**Ship notes:** `app/SLICE14-SHIPPED.md`  
**Docs copy:** `docs/golvklart-redskap.sv.md`

---

## Overall verdict: **PASS**

| Section | Verdict |
| --- | --- |
| Golvklart / print under-markör redskap | **PASS** |
| Quiet unset / no förslag on floor | **PASS** |
| Edit canvas clean / format / layout | **PASS** |
| Slice 11–13 intact / caption / footer | **PASS** |
| Phone ~390px | **PASS** |
| Locked rules | **None failed** |

---

## Locked rules

| # | Rule | Result | Notes |
| --- | --- | --- | --- |
| 1 | Golvklart shows redskap | **PASS** | Non-empty `stationEquipment` → lines under markör in floor mode. |
| 2 | Print shows redskap | **PASS** | Print preview: equipment after short titles; edit chrome hidden. |
| 3 | Quiet unset | **PASS** | Unset Rondat station: no floor/print equipment lines, no «inga redskap». |
| 4 | Quiet saved empty `[]` | **PASS** | Code: no DOM block for `[]`. UI third-station clear **N/A** (not exercised). |
| 5 | No förslag on floor | **PASS** | Code + UI: unset stayed quiet; defaults not promoted. |
| 6 | Edit canvas clean | **PASS** | No under-marker redskap list; no equipment-count badge. |
| 7 | Format | **PASS** | `2× Trampett`; single counts omit `1×` (code + UI). |
| 8 | Many pieces ≤8, no +N till | **PASS** | Code: soft cap 8; no truncation string. |
| 9 | Layout under markör | **PASS** | Under marker, not side list. |
| 10 | Short title print-only on screen | **PASS** | Golvklart screen: equipment without forcing short titles; print shows titles. |
| 11 | Teknik-only | **PASS** | `hall.ts` intact; tray Teknik only. |
| 12 | Slice 12–13 intact | **PASS** | One marker; detail Redskap + Redigera redskap; drag≠detail preserved in code. |
| 13 | No CAD / pins | **PASS** | |
| 14 | Caption | **PASS** | `Schematisk hall — inte exakt mått` unchanged. |
| 15 | Phone ~390px | **PASS** | Lines visible; tap opens detail. |
| 16 | Scope | **PASS** | No Netlify / accounts / Förrådslista / catalog expansion. |
| 17 | Footer | **PASS** | Exact `Träningsplaneraren · Slice 14`. |

---

## Smoke path

| Step | Result |
| --- | --- |
| Compose one + leave one unset | PASS |
| Edit: no equipment under markers / no badge | PASS |
| Golvklart: lines under composed; quiet unset | PASS |
| Format count===1 / count>1 | PASS |
| Tap → detail Redigera redskap | PASS |
| Print: title + lines; caption; chrome hidden | PASS |
| Phone Golvklart | PASS |
| npm run build green | PASS |
| Reload → compositions + Golvklart mirror | PASS |
| Clear to `[]` third station | N/A UI (code PASS) |

---

## Non-blocking / notes

- **Live Netlify:** not required for Slice 14 PASS.
- Saved-empty `[]` quiet state verified in code; UI did not clear a third station — not a FAIL given code evidence and checklist soft path (“if easy”).
- Optional `tipGolvklartEquipment` skipped (non-required).

---

## Screenshots

- `slice14_home.png` — footer Slice 14  
- `slice14_edit.png` — clean edit canvas  
- `slice14_golvklart.png` — under-markör redskap  
- `slice14_detail.png` — Redigera redskap intact  
- `slice14_print.png` — print preview  
- `slice14_phone.png` — ~390px Golvklart  

---

## Verdict for Planner

**PASS** — all locked rules satisfied. Report: `verifier/slice-14-verify-report.md`.
