# Träningsplaneraren — improvement backlog

**Owner:** Planner (Christoffer approves / declines)  
**Scout id:** `8d938891-4fba-490d-a96d-5f261cd2da81`  
**Rule:** Nothing here becomes a slice until Christoffer Approves. Scout proposes; Planner drafts packs.

Statuses: `Proposed` · `Approved` · `In flight` · `Declined` · `Parked` · `Shipped`

---

## How to use

1. Scout appends 2–3 items under **Proposed** (dated run).
2. Christoffer (via Planner chat) Approves / Declines / Parks each.
3. Planner moves Approved → next slice pack when Christoffer says “what’s next?”
4. Declined items stay listed with reason so Scout does not re-propose soon.

---

## Proposed

### Scout run 2026-09-26 (post Slice 20 PASS · Slice 21 candidates)

Ranked by new-coach impact vs build cost. Redskap spine + phone polish (18–20) are shipped. Does **not** re-propose Parked or Shipped. Each idea: experience-first + standing-lock check (pstack / `PSTACK-OPS.md`).

#### 1. Hall — soft “saknar redskap” banner

- **Coach benefit:** On Hallöversikt edit you see how many placed Teknik-stationer still have no saved redskap, so Golvklart/Förrådslista are not a surprise empty floor.
- **Experience-first:** After place → Använd alla förslag (Slice 19), the only pass-wide signal is a short toast; nothing stays visible that N stations are still unset. New coaches jump to Golvklart with quiet under-markör lines.
- **Standing lock?** **No fight.** Complements hall-detail-only compose and Teknik-only hall; does not add Passbyggaren compose, badge, CAD, or library growth. Banner is soft (like unplaced) — never blocks Golvklart.
- **Evidence:** Slice 19 applies only to **placed** unset Teknik with seeds and then clears (`SLICE19-SHIPPED.md`, `slice-19/decisions.md` C); Golvklart/Förråd/print stay quiet on unset (`SLICE18` lock C). Unplaced banner exists (`hallUnplacedBanner` station wording in `blockMeta.ts`); no parallel “saknar redskap” count. Kom igång step 5 completes after **any** one saved composition (`SLICE16-SHIPPED.md`).
- **Effort:** S
- **Suggested slice shape:** Soft `role="status"` banner on Hallöversikt **edit** when count of placed Teknik with no non-empty saved `stationEquipment` is ≥1 (treat unset and `[]` as missing for this signal, or unset-only — lock in pack). Copy e.g. “{n} stationer saknar redskap” + optional secondary affordance pointing at **Använd alla förslag** when that CTA is enabled. Hide on Golvklart. Docs Swedish; Builder HallBoard; Verifier partial/full/empty. Bundle candidate with #3 only if Planner wants one hall-phone polish pack (different loops — default keep separate).

#### 2. Kom igång — place step needs a real placement

- **Coach benefit:** The checklist only checks off “placera på hallen” after at least one Teknik-station is actually on the schematic, not merely after opening Hallöversikt.
- **Experience-first:** New coaches currently get credit for opening the hall (`openedHall`), which teaches the wrong habit before Redigera redskap / Använd alla förslag.
- **Standing lock?** **No fight.** Home-only checklist; does not change Teknik-only placeable set, compose entry, or drafts model.
- **Evidence:** `coachTips.ts` marks `openHallAndPlace` when `placementCount >= 1` **or** `openedHall` (`markHallOpened` / sync heuristics). Slice 09 shipped that heuristic (`SLICE09-SHIPPED.md`); Slice 16 added compose step but left place heuristic unchanged (`docs/kom-igang-redskap.sv.md`, `verify-traningsplaneraren/features/home-kom-igang.md`).
- **Effort:** S
- **Suggested slice shape:** Docs clarify step copy if needed; Builder: auto-progress place step only when `placementCount >= 1` (stop counting bare `openedHall`). Keep soft — do not block Hall/Golvklart. Optional: if previously checked via open-only, leave as-is (no regress old tips state) or recompute on next sync — pick in pack. Verifier: open hall alone leaves step unchecked; place one Teknik checks it.

#### 3. Hall phone — pinch-zoom — **absorbed into Slice 21 APPROVED**

- **Status:** Absorbed into **Slice 21** Hallöversikt phone usability pack (`slice-21/`) together with collapsible sticky tray + pan-while-zoomed. Pack **APPROVED 2026-09-26** (recommended A–F); Docs+Builder done; Verifier in flight.
- **Coach benefit:** On a phone you can pinch the schematic to aim placements and read Golvklart titles/redskap without hunting only +/− buttons.
- **Experience-first:** Floor setup on a small screen is the highest-friction remaining hall loop after Slice 20 hit-target/scroll polish; pinch is how coaches already zoom maps.
- **Standing lock?** **No fight.** View-only scale (same as +/−); does not change stored x,y, caption, CAD, or placeable rules.
- **Evidence:** Slice 07 chose +/− only and deferred pinch (`SLICE07-SHIPPED.md` Gaps: “Pinch-zoom not implemented (buttons chosen)”; zoom is view-only). Slice 20 polished remove/Stäng/mall scroll but not zoom (`SLICE20-SHIPPED.md`). Phone URL now carries dense Golvklart chrome (titles + redskap, Slices 14–17).
- **Effort:** M (now part of Slice 21 pack)
- **Suggested slice shape:** See `slice-21/` recommended A1 (+ B1 tray + C1 pan). Do **not** re-propose pinch alone while Slice 21 is In flight.

---

## In flight

### Slice 21 — Hallöversikt phone usability (**APPROVED** · Verifier in flight)

- **Locked A–F (2026-09-26):** A1 · B1 · C1 · D1 · E1 · F1

- **Pack:** [`slice-21/`](../slice-21/) — **APPROVED 2026-09-26**.
- **Parts:** pinch-zoom beside +/− (A1) · collapsible sticky tray / more canvas (B1) · reliable pan while zoomed (C1) · thin Docs (D1) · footer Slice 21 (E1) · hard non-goals (F1).
- **Absorbs:** Scout Proposed #3 pinch-zoom (annotated above).
- **Leaves Proposed:** #1 saknar-redskap banner · #2 Kom igång place-step heuristic.
- **Next:** Verifier (in flight). No Pages republish unless asked.

## Approved (ready for a slice pack)

_(none)_

---

## Parked (known, not next)

| Idea | Why parked | Source |
|---|---|---|
| Compose stations by placing separate equipment pins on the hall (CAD-lite) | Explicitly out of Slice 13; one-marker-per-station locked | Christoffer / Slice 12–13 |
| Passbyggaren entry for Redigera redskap | Hall-detail-only locked for Slice 13 | Slice 13 decisions |
| Canvas equipment-count badge on markers | Detail-only locked for Slice 13 | Slice 13 decisions |
| Styrka / other blocks placeable on hall | Teknik-only locked Slice 11+ | Slice 11 |
| Accounts / cloud sync / App Store | Out of near-term scope | Standing product locks |
| Custom coach-authored redskap catalog | Fixed 10-piece library for Slice 13 | Slice 13 |
| Förrådslista — show which stations contribute | Useful later; keep flat list for now | Christoffer / Scout 2026-09-25 |

---

## Declined

_(none yet)_

---

## Shipped (recent)

| Idea | Slice | Notes |
|---|---|---|
| Phone polish — dirty Stäng + canvas remove + template scroll freeze | 20 | Verifier PASS 2026-09-26; live on GitHub Pages · https://drevmok.github.io/traningsplaneringen/. Pack `slice-20/`. |
| Hall — Använd alla förslag | 19 | Verifier PASS 2026-09-25; Netlify not yet republished (phone still Slice 17 until Christoffer asks). Slice 18 also still not on phone. |
| Broader selective redskap-förslag on Teknik drills | 18 | Verifier PASS 2026-09-25; Netlify not yet republished (phone still Slice 17 until Christoffer asks) |
| Golvklart screen — short station titles | 17 | Verifier PASS 2026-09-25; live on Netlify · https://fancy-blancmange-4d516b.netlify.app/ |
| Visual station markers + tap-to-detail | 12 | Live on Netlify |
| Compose Teknik station from redskap library | 13 | Live on Netlify · https://fancy-blancmange-4d516b.netlify.app/ |
| Kom igång — discover Redigera redskap | 16 | Verifier PASS 2026-09-25; live on Netlify · https://fancy-blancmange-4d516b.netlify.app/ |
| Förrådslista — aggregate redskap across the pass | 15 | Verifier PASS 2026-09-25; live on Netlify · https://fancy-blancmange-4d516b.netlify.app/ |
| Golvklart & print — redskap under each station | 14 | Verifier PASS 2026-09-25; live on Netlify · https://fancy-blancmange-4d516b.netlify.app/ |
