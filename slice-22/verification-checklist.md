# Slice 22 — verification checklist (DRAFT · recommended locks)

**Authority:** Overall PASS only if all **locked** rules pass after Builder ships.  
**Status:** Pack **APPROVED 2026-09-26** — Verifier runs only after Christoffer A–F lock → Docs → Builder ship **and** Planner ping.  
**Skill:** `verify-traningsplaneraren/` + this checklist; pstack rigor per `backlog/PSTACK-OPS.md`.  
**Republish:** Not required unless Christoffer asks.

**Recommended locks (Christoffer locked):** **A1 / B1 / C1 / D1 / E1 / F1**.  
Update PASS rows if Christoffer locks a different letter.

## Rules (recommended)

### Progressive Hall hints (A1)

| # | Rule | Pass if |
|---|---|---|
| 1 | Full hints first | With `hallHintsCompact` false / zero successful Teknik places ever: multi-line instructional hints still visible (subject to C1 tip suppression) |
| 2 | Compact after place | After ≥1 Teknik place: multi-line tray/header instructional paragraphs (`hallDragHint`, `hallSnapHint`, `hallStationsOnlyHint`, `hallStationOrderHint`, `hallTileHint`) are hidden by default |
| 3 | Info control | Info control ≥44×44px reveals the full hint set on demand |
| 4 | Durable | Reloading / new draft in same browser keeps compact once set (until Visa tips igen clears it) |
| 5 | Primary CTAs | Placera här, chips, tray expand/collapse still work when compact |

### Quieter Kom igång (B1)

| # | Rule | Pass if |
|---|---|---|
| 6 | First-run expanded | Brand-new 0/5 (never collapsed): Kom igång shows full intro + steps |
| 7 | Collapsed default | After progress > 0 (or prior collapse): next Home visit shows collapsed summary (title + progress + expand ≥44px) |
| 8 | Expand / collapse | Expand shows full card; collapse control ≥44px; preference persists |
| 9 | Dölj path | Dölj Kom igång / Jag klarar mig still hides the card (`checklistDismissed`) |
| 10 | Visa tips igen | Restores card visibility; recommended also resets compact/collapse prefs per decisions Q4 |

### One chrome layer (C1)

| # | Rule | Pass if |
|---|---|---|
| 11 | No tip+hints stack | On Hall edit, when a tip strip is visible, multi-line A1 paragraphs are not also shown (info still available) |
| 12 | Banner vs tip | On Golvklart, when unplaced banner is visible, tip strip is suppressed on that surface |
| 13 | Blocking wins | Dirty confirm / required UI still appears; soft teaching yields |
| 14 | CTAs never hidden | Placera här / primary Hall CTAs remain visible and usable |

### Scope / chrome (E1 / F1) + build

| # | Rule | Pass if |
|---|---|---|
| 15 | Footer | `Träningsplaneraren · Slice 22` when shipped |
| 16 | Caption | Schematisk hall — inte exakt mått (or locked wording) unchanged |
| 17 | Scope F1 | No saknar-redskap banner; no Kom igång place-heuristic change; no Passbyggaren compose; no library/CAD/caption/cloud; Slices 11–21 intact except quiet rules |
| 18 | Slice 21 intact | Pinch, pan, tray collapse still work on phone; no regression except hint visibility |
| 19 | Build | `npm run build` green in `app/` |
| 20 | No window regressions | No new `window.confirm` for this chrome |

## Phone / Home smoke

1. **First place:** Fresh tips state → Hall edit shows full hints → place one Teknik → hints compact + info works → reload → still compact.  
2. **C1:** With tip strip undismissed on Hall, multi-line paragraphs absent; dismiss tip (or no tip) → A1 rules apply.  
3. **Kom igång:** Fresh Home expanded at 0/5 → complete one step → leave Home and return → collapsed summary → expand → full card.  
4. **Golvklart:** Unplaced banner present → no tip strip stacked; place all → banner gone.  
5. Footer Slice 22; caption unchanged; pinch/pan/tray collapse OK; build green.

## Fail if

- Multi-line Hall hints still always-on after first place when A1 locked.  
- No info path to recover hints when compact.  
- Kom igång always fully expanded after progress > 0 when B1 locked.  
- Tip strip + multi-line hints + (on Golvklart) banner stacked when C1 locked.  
- Placera här / tray collapse / pinch / pan broken.  
- Saknar banner added; place-heuristic changed; caption/CAD/Passbyggaren compose/library growth.  
- Footer not Slice 22; build red.  
- Verifier run before APPROVED + Builder ship + Planner ping.
