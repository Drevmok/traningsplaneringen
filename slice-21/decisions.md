# Slice 21 — decisions (APPROVED)

**Status:** **APPROVED 2026-09-26** — Christoffer approved via Planner lock widget; A–F locked as recommended  
**Direction:** Hallöversikt phone usability — pinch-zoom + more canvas / less chrome + reliable pan while zoomed

Docs may start. Builder after Docs (or parallel only if Planner says). Verifier only after Planner ping.

## Locked A–F (Christoffer 2026-09-26)

| # | Rec | Meaning |
|---|---|---|
| A | **A1** | Pinch-to-zoom on hall canvas (edit + Golvklart), same min/max clamp as +/−; keep +/− buttons; view-only scale (stored x,y unchanged); desktop optional but phone required |
| B | **B1** | Phone ≤768px: collapsible sticky tray — collapsed by default when canvas needs space (compact bar with unplaced count + expand ≥44px); expanded = today’s tray; Golvklart still hides edit tray |
| C | **C1** | When zoomed: one-finger pan on empty canvas / background; marker drag still moves markers; pinch reserved for zoom; pan ≠ open detail; +/− still work |
| D | **D1** | Thin Docs: Swedish strings for tray collapse/expand + any new aria; no new required Kom igång tip |
| E | **E1** | Footer `Träningsplaneraren · Slice 21` |
| F | **F1** | No CAD/pins/badge; no Passbyggaren compose; no library growth; no saknar-redskap banner; no Kom igång heuristic change; caption unchanged; preserve 11–20; no Pages republish unless asked |

---

## A. What Slice 21 adds

| Surface | Slice 21 change? |
|---|---|
| Hallöversikt **edit** canvas | **Yes** — pinch-zoom; pan-while-zoomed; collapsible sticky tray on phone |
| Hallöversikt **Golvklart** / floor | **Yes** — pinch-zoom + pan-while-zoomed; edit tray remains hidden (unchanged) |
| +/− zoom bar | **Keep** — same clamp; remains for a11y / Verifier / desktop |
| Redigera redskap / Använd alla / Förråd | **No** behavior change required |
| Kom igång / Passbyggaren / library / caption | **No** |
| Scout Proposed #1 saknar-redskap banner | **Out** — stays Proposed |
| Scout Proposed #2 place-step heuristic | **Out** — stays Proposed |

---

## DECISION RATIONALE — locked A–F

### A. Pinch-zoom?

**Locked A1: Pinch-to-zoom beside existing +/−**

- Same clamp as today: `ZOOM_MIN=1` … `ZOOM_MAX=2` (step may stay 0.25 for buttons; pinch may be continuous within clamp).
- **View-only** scale — stored placement x,y unchanged after zoom + reload (same Slice 07 lock).
- Edit **and** Golvklart (coaches read dense titles/redskap on phone).
- **Keep +/−** buttons (`hall-zoom-bar`, `hallZoomIn` / `hallZoomOut`) for a11y, Verifier, and coaches who prefer taps.
- **Phone required**; desktop pinch optional (nice-if-easy; not a FAIL if desktop-only mouse path stays button-only).

| Option | Note |
|---|---|
| **A1 (recommended)** | Pinch + keep +/−; same clamp; view-only | Matches Scout #3 + Slice 07 deferred gap |
| A2 | Pinch-only; remove +/− buttons | Reject — loses a11y/Verifier path; Slice 07 chose buttons for reliability |
| A3 | +/− only; no pinch | Reject — this pack’s core coach ask |
| A4 | Change stored coords with zoom / measure CAD | Reject — standing lock (no CAD; view-only) |

**Rationale:** Coaches already pinch maps; +/− alone is high friction on dense Golvklart chrome (Slices 14–17). Keeping buttons preserves Slice 07 Verifier path.

---

### B. Sticky tray chrome?

**Locked B1: Collapsible sticky tray on phone ≤768px**

- **Collapsed by default** when canvas needs space (edit mode, narrow): show a **compact bar** with unplaced count + **expand** control (≥44px hit target).
- **Expanded** = today’s sticky tray (title, hints, chips, Placera här / drag).
- Coach can collapse again (control ≥44px).
- **Golvklart** still **hides** the edit tray entirely (Slice 07) — no collapse chrome in floor mode.
- Desktop (>768px) tray layout unchanged unless trivial.

| Option | Note |
|---|---|
| **B1 (recommended)** | Collapsible; collapsed default; compact bar + expand | Frees ~14rem reserved space |
| B2 | Denser always-visible tray only (smaller padding / fewer hints) | Reject as sole fix — still permanently eats canvas |
| B3 | Full-screen FAB / overlay tray | Reject — heavier UX; more Docs/UI; risk to Placera här muscle memory |
| B4 | Remove sticky; let tray scroll away | Reject — regresses Slice 07 “tray always reachable” |
| B5 | Leave 14rem reserved always | Reject — the chrome pain |

**Rationale:** `--hall-tray-reserved` default `14rem` is the largest remaining phone chrome tax after Slice 20. Collapse-by-default keeps Placera här one expand-tap away without permanently shrinking the schematic.

**Draft Swedish (Docs finalize):** see [`content/hall-phone-chrome.sv.md`](./content/hall-phone-chrome.sv.md) — e.g. “Visa stationsbricka” / “Dölj bricka”.

---

### C. Pan while zoomed?

**Locked C1: One-finger pan on empty canvas when zoomed**

- When `viewZoom > 1` (or whenever pan is needed): **one-finger pan** on empty canvas / background.
- **Marker drag** still moves markers (not pan) — chips keep `touch-action: none` / drag path.
- **Pinch** reserved for zoom (two-finger); do not treat pinch as pan.
- **Pan ≠ open detail** — a pan gesture must not fire markör tap→detail; tap without drag still opens detail (edit + Golvklart as today).
- **+/−** still change zoom; after zoom-out to 1, behavior remains sensible (page scroll / existing pan OK).

| Option | Note |
|---|---|
| **C1 (recommended)** | One-finger pan empty; drag markers; pinch=zoom | Matches map-app muscle memory |
| C2 | Two-finger-only pan | Reject — fighting one-hand phone use while holding a folder |
| C3 | Pan only via +/− recenter / no free pan | Reject — unreliable aiming |
| C4 | Pan also moves markers / pan opens detail | Reject — conflict with place/detail |

**Rationale:** Without reliable pan at zoom >1, pinch is half-useless. Gesture priority: pinch→zoom; one-finger on chip→drag; one-finger on empty→pan; short tap→detail.

---

### D. Docs surface?

**Locked D1: Thin Docs**

- Swedish for tray **collapse / expand** labels + aria (and any new pinch/pan aria if Builder needs it).
- Prefer updates to `docs/hall-oversikt-copy.sv.md` / `docs/ui-chrome.sv.md` (Docs picks living file).
- **No** new required Kom igång tip for PASS.
- Pack draft strings in `content/hall-phone-chrome.sv.md` — Docs finalizes.

| Option | Note |
|---|---|
| **D1 (recommended)** | Thin strings only | Enough for B1 chrome |
| D2 | New Kom igång tip for pinch/tray | Reject — not required; tips already dense |
| D3 | No Docs pass | Reject — new visible Swedish needs Docs |

---

### E. Footer?

**Locked E1:** `Träningsplaneraren · Slice 21` when Builder ships.

| Option | Note |
|---|---|
| **E1 (recommended)** | Footer Slice 21 | Standard |
| E2 | Keep Slice 20 footer | Reject — ship marker |

---

### F. Hard non-goals (this pack)?

**Locked F1 — all stand:**

- No CAD / equipment pins / canvas equipment-count badge  
- No Passbyggaren compose entry  
- No library growth  
- No **saknar-redskap** banner (Scout Proposed #1 stays Proposed)  
- No Kom igång place-heuristic change (Scout Proposed #2 stays Proposed)  
- Caption **Schematisk hall — inte exakt mått** unchanged  
- Preserve Slices 11–20 behavior  
- No Netlify / GitHub Pages republish unless Christoffer asks  
- No removing +/− (A2 rejected)  
- Device-local drafts only  

| Option | Note |
|---|---|
| **F1 (recommended)** | All non-goals above | Keeps pack phone-usability-only |
| F2 | Bundle saknar-redskap or Kom igång heuristic | Reject for this pack — separate Proposed ideas |

---

## Rejected alternatives (brief)

| Rejected | Why |
|---|---|
| A2 pinch-only / remove +/− | Loses a11y + Verifier button path |
| A3 no pinch | Misses the coach ask |
| B2 denser always-visible tray only | Does not free canvas enough |
| B3 full-screen FAB tray | Heavier; invents new place flow |
| B4 non-sticky tray | Regresses Slice 07 reachability |
| C2 two-finger-only pan | Poor one-hand phone use |
| D2 new required tip | Scope creep |
| F2 bundle Proposed #1/#2 | Different loops; keep separate |

