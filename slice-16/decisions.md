# Slice 16 — locked decisions (APPROVED)

**Status:** **APPROVED 2026-09-25** (Christoffer)  
**Direction:** Kom igång — discover **Redigera redskap** (Scout idea 2 Approved 2026-09-25)

Pack is **locked**. Docs polish → Builder implement → Planner pings Verifier after ship.

## A. What Slice 16 adds

**Lock:** Soft onboarding on the Home **Kom igång** card so coaches discover **Redigera redskap** before Golvklart — without blocking floor mode. **New soft checklist step** (5 total) between place and Golvklart (locked A).

| Surface | Slice 16 change? |
|---|---|
| Home **Kom igång** card | **Yes** — new soft step + auto-progress + intro/progress copy |
| Hall tip strip `tipStationCompose` | Soft chrome only — **keep as-is** (locked C) |
| Hallöversikt / Golvklart chrome | **No** mandatory gate; no new compose entry |
| Passbyggaren | **No** compose entry |
| Canvas under markör | **No** (Slice 14 owns floor lines) |
| Förrådslista (Slice 15) | **No** behavior change |

**Rejected (standing):** Blocking Golvklart until compose.  
**Rejected (standing):** CAD pins / Passbyggaren compose / canvas badge / custom library.  
**Rejected (this pack):** Broader selective förslag (idea 1); Golvklart screen short titles (idea 3).  
**Rejected (this pack):** Extend-copy-only (4 steps) — Christoffer locked new soft step.

## B. Data / heuristics (reuse Slice 13 — no new model)

**Lock:** Read existing `SessionItem.stationEquipment` on the draft (device-local). No new persistence schema beyond the checklist flag in `coachTips` localStorage.

| State on a station | Checklist compose progress? |
|---|---|
| `undefined` (unset) | No |
| `[]` (coach cleared) | No |
| Non-empty array | **Yes** — locked B |

**Lock:** Do **not** treat seed `defaultStationEquipment` / förslag alone as progress — only **saved** non-empty `stationEquipment` (after Klar or Använd förslag persist).

**Lock:** Extend `syncChecklistHeuristics` with e.g. `hasComposedEquipment: boolean` derived from session items. New checklist key e.g. `composeStationEquipment` (Builder pick exact name). Normalize missing key → `false` for older localStorage.

## C. Carry-forwards (unchanged — hard locks)

- Placeable = Teknik only; silent prune non-Teknik
- Caption: **Schematisk hall — inte exakt mått**
- Tap placed → detail; drag ≠ detail (edit)
- Compose = hall detail **Redigera redskap** only
- No canvas equipment badge; no CAD pins
- Slice 14 under-markör redskap on Golvklart + print intact
- Slice 15 Förrådslista intact
- gymnaster / pass / Swedish UI
- Device-local drafts; no accounts / cloud
- **Netlify out of this pack**
- No new placeable blocks
- Footer `Träningsplaneraren · Slice 16` when shipped
- No Home visual redesign beyond copy/checklist/progress

---

## LOCKED ANSWERS — A–F

### A. New checklist step vs extend existing hall / Golvklart step copy only?

**Lock: New soft checklist step** between `openHallAndPlace` and `useGolvklart` (5 steps total).

**Why:** Clear discoverability; auto-progress attaches to a real key; extend-only still lets coaches tick Golvklart without ever seeing a compose milestone. Slice 09 Docs said “Do not invent a fifth step” — **this Approved idea intentionally supersedes that**.

**Locked step order:**

1. Välj eller bygg ett pass  
2. Lägg till övningar i blocken  
3. Öppna Hallöversikt och placera stationer  
4. **Ange redskap på Teknik-stationerna** *(new)*  
5. Använd Golvklart på golvet  

Intro → “Fem korta steg …”. `CHECKLIST_TOTAL = 5`.

**Step CTA:** Tapping the new step opens **Hallöversikt** (same soft path as place) — coach then uses markör → **Redigera redskap**. Do **not** invent Passbyggaren compose or a Home deep-link past hall detail.

---

### B. Auto-progress trigger

**Lock: Any non-empty saved `stationEquipment`** on the draft (heuristic in `syncChecklistHeuristics`).

**Why:** Matches existing heuristic style (draft / counts / placement); survives reload; Klar and Använd förslag both persist non-empty arrays so both count. Do **not** require a separate first-Klar event flag.

---

### C. Tip strip

**Lock: Keep `tipStationCompose` as-is** (Slice 13 wording) — soft hall chrome.

**Why:** Checklist is Home-only and dismissible; hall tip still helps coaches who dismissed Kom igång. Retiring early risks silent skip for dismissed-checklist coaches.

---

### D. Require compose before marking Kom igång complete / opening Golvklart?

**Lock: Soft only — never block Golvklart.**

**Why:** Standing hard lock from product / backlog / Slice 13–15. Compose remains optional for floor use; checklist is guidance, not a gate. All-done requires the new step for the card’s “all done” state — but entering Golvklart must still work with the compose step unchecked.

---

### E. Footer `Träningsplaneraren · Slice 16` when shipped?

**Lock: Yes.**

Matches Slice 14–15 shipping convention. Netlify republish still out of pack unless Christoffer asks.

---

### F. Any Home card visual change beyond copy / checklist?

**Lock: No visual redesign beyond copy/checklist/progress.**

**Why:** Effort S; discoverability is copy + progress. Avoid Home layout churn. Same card chrome; only steps, hints, intro, progress total, and optional all-done wording.

---

## Migration / existing coaches (locked)

| Case | Lock |
|---|---|
| `checklistDismissed === true` | Stay dismissed — do **not** force Kom igång back |
| Non-dismissed, already 4/4 done, no compositions | New step appears unchecked (gentle catch-up); all-done waits until compose **or** they dismiss |
| Non-dismissed, already has non-empty `stationEquipment` | Heuristic marks new step done on next sync |
| Older localStorage without new key | `normalize` defaults new key to `false` |

---

## Summary table (LOCKED)

| # | Topic | Locked answer |
|---|---|---|
| **A** | Step shape | **New soft checklist step** (5 total) between place and Golvklart |
| **B** | Auto-progress | **Any non-empty saved `stationEquipment`** on draft |
| **C** | Tip strip | **Keep `tipStationCompose` as-is** |
| **D** | Golvklart gate | **Soft only — never block** |
| **E** | Footer | **Yes** — `Träningsplaneraren · Slice 16` when shipped |
| **F** | Home visuals | **No** redesign beyond copy/checklist/progress |

Christoffer approved all Planner recommendations on 2026-09-25. A–F are binding for Slice 16.

## Standing locks (confirmed — do not reopen)

| Topic | Answer |
|---|---|
| Library | Fixed 10 pieces; no custom CRUD |
| Compose entry | Hall detail **Redigera redskap** only |
| Badge / CAD / Passbyggaren compose | Out |
| Teknik-only + Slice 11–15 | Intact |
| Caption | Unchanged (**Schematisk hall — inte exakt mått**) |
| Golvklart gate | Do not block |
| Broader förslag (idea 1) / Golvklart short titles (idea 3) | Not this pack |
| Netlify | Out of pack |
| Swedish / gymnaster / pass / device-local | Intact |
| New placeable blocks | Out |
| Home visual redesign | Out (locked F) |
