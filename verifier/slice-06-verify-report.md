# Slice 06 — Formal verification report (zones, snap, presets)

**Date:** 2026-09-24 ~08:32 CEST (Europe/Stockholm)  
**Verifier:** Verifier  
**Authority:** `/workspace/gymnastics-planner/slice-06/verification-checklist.md`  
**Build:** `/workspace/gymnastics-planner/app` — `npm run build` exit 0  
**URL:** `http://127.0.0.1:5173/`  
**Evidence:** `slice-06-evidence-code.md` + screenshots under `/workspace/screenshots/slice06_*.png`  
**Ship notes:** `app/SLICE06-SHIPPED.md`  
**Docs copy:** `slice-06/content/hall-presets-copy.sv.md`

---

## Overall verdict: **PASS**

| Section | Verdict |
| --- | --- |
| Product / UX | **PASS** |
| Data / persistence | **PASS** |
| Phone | **PASS** |
| Technical / scope | **PASS** |
| Regression Slice 01–05 | **PASS** |
| Locked rules | **None failed** |

---

## Locked rules

| Rule | Result | Notes |
| --- | --- | --- |
| Six zones incl. Mattberg + caption | PASS | Standard trupp shows all six |
| Snap apparatus / free öppen yta | PASS | Trampett/tumbling snap; open stays free |
| Phone Placera här same snap | PASS | Apparatus snapped; open free |
| Three Swedish presets + layout change | PASS | Standard trupp / Tävling / linjer / Liten hall |
| Preset switch remaps; never dumps tray | PASS | Observed on both switches |
| Persist hallTemplateId + placements | PASS | Fortsätt / reopen restored |
| generic-trupp → standard-trupp migrate | PASS | Draft load; placements kept |
| Tray / remove / back (Slice 05) | PASS | |
| Experienced warning from hall | PASS | |
| Scope guard (flow/print) | PASS | Absences not failed |
| Regression 01–05 | PASS | |

---

## Product / UX

| Item | Result |
| --- | --- |
| Hallöversikt from Passbyggaren | PASS |
| Six labels on Standard trupp | PASS |
| Schematic caption | PASS |
| Hallayout picker + 3 SV labels | PASS |
| Preset switch redraws layout | PASS |
| Apparatus snap / open free | PASS |
| Open → tumbling snaps | PASS |
| Multi-chip distinguishable | PASS (offset OK) |
| Remove to tray after snap | PASS |
| Experienced badge + warning | PASS |
| Swedish chrome | PASS |

---

## Data / persistence

| Item | Result |
| --- | --- |
| hallTemplateId stored after switch | PASS |
| Storage key gymnastics-planner-draft-v1 | PASS |
| mattberg + mats zoneIds | PASS |
| generic-trupp alias | PASS (UI inject + code) |
| Preset switch keeps placements | PASS |
| Reload / Fortsätt restore | PASS |
| prune / template clear / [0,1] coords | PASS (code + orphan behavior) |

---

## Phone

| Item | Result |
| --- | --- |
| ~390px picker ≥44px | PASS |
| Canvas + tray reachable | PASS |
| Placera här apparatus → snap | PASS |
| Placera här open → free | PASS |

---

## Technical / scope

| Item | Result |
| --- | --- |
| No CDN hall art | PASS |
| npm run build | PASS |
| Flow / print absent | N/A OK |

---

## Regression

| Slice | Result |
| --- | --- |
| 01–04 Passbyggaren / tiles / drills | PASS |
| 05 tray default, CTA, orphan prune | PASS |

---

## Screenshots

- Default six zones: `slice06_default.png`
- Snap + open free: `slice06_snap-open.png`
- Tumbling snap: `slice06_tumbling.png`
- Tävling preset: `slice06_tavling.png`
- Liten hall: `slice06_liten.png`
- Persist restore: `slice06_persist.png`
- Phone: `slice06_phone.png`
- Experienced warning: `slice06_warning.png`
- generic-trupp migrate: `slice06_generic-migrate.png`
- Regression: `slice06_regression.png`

(Under `/workspace/screenshots/`.)

---

## Recommendation

Accept Slice 06 as **PASS**. Out-of-scope deferrals (flow arrows, station order, print) correctly absent.
