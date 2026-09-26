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

### Scout run 2026-09-26 (post Slice 22 PASS · Slice 23 candidates) — **status moves**

Christoffer (2026-09-26) approved all three ideas. Per `SCOUT-PLAYBOOK.md` bundle rule:

| Scout # | Idea | Status move |
|---|---|---|
| **#1** | Home — Hallöversikt / Golvklart när utkast finns | → **Shipped** as **Slice 23** (bundled with #2) |
| **#2** | Home — Öppna på telefon (wire existing copy) | → **Shipped** as **Slice 23** (bundled with #1) |
| **#3** | Förråd tom — peka på Använd alla förslag | → **Approved** (ready for **Slice 24** pack — do **not** draft `slice-24/` yet) |

Full write-ups for #1–#3 live under **In flight** / **Approved** below (not re-listed here).

---

### Scout run 2026-09-26 (post Slice 20 PASS · Slice 21 candidates)

Ranked by new-coach impact vs build cost. Redskap spine + phone polish (18–20) are shipped. Does **not** re-propose Parked or Shipped. Each idea: experience-first + standing-lock check (pstack / `PSTACK-OPS.md`).

**Note (2026-09-26):** Quiet-chrome polish shipped as **Slice 22** (progressive Hall hints · quieter Kom igång · one chrome layer). **#1** and **#2** below stay **Proposed** (not absorbed — #1 would add chrome; #2 is a different heuristic axis). **Still out of Slice 23** (Home polish pack; F1).

#### 1. Hall — soft “saknar redskap” banner — **stays Proposed**

- **Status:** Stays **Proposed**. Explicitly **out** of Slice 22 (would ADD chrome; quiet-chrome pack suppresses stacking) and **out** of Slice 23 (Home polish only).
- **Coach benefit:** On Hallöversikt edit you see how many placed Teknik-stationer still have no saved redskap, so Golvklart/Förrådslista are not a surprise empty floor.
- **Experience-first:** After place → Använd alla förslag (Slice 19), the only pass-wide signal is a short toast; nothing stays visible that N stations are still unset. New coaches jump to Golvklart with quiet under-markör lines.
- **Standing lock?** **No fight.** Complements hall-detail-only compose and Teknik-only hall; does not add Passbyggaren compose, badge, CAD, or library growth. Banner is soft (like unplaced) — never blocks Golvklart.
- **Evidence:** Slice 19 applies only to **placed** unset Teknik with seeds and then clears (`SLICE19-SHIPPED.md`, `slice-19/decisions.md` C); Golvklart/Förråd/print stay quiet on unset (`SLICE18` lock C). Unplaced banner exists (`hallUnplacedBanner` station wording in `blockMeta.ts`); no parallel “saknar redskap” count. Kom igång step 5 completes after **any** one saved composition (`SLICE16-SHIPPED.md`).
- **Effort:** S
- **Suggested slice shape:** Soft `role="status"` banner on Hallöversikt **edit** when count of placed Teknik with no non-empty saved `stationEquipment` is ≥1 (treat unset and `[]` as missing for this signal, or unset-only — lock in pack). Copy e.g. “{n} stationer saknar redskap” + optional secondary affordance pointing at **Använd alla förslag** when that CTA is enabled. Hide on Golvklart. Docs Swedish; Builder HallBoard; Verifier partial/full/empty. Bundle candidate with Förråd empty CTA (Approved → Slice 24) only if Planner wants one “redskap readiness” pack — **default keep separate** (Förråd vs Hall chrome).

#### 2. Kom igång — place step needs a real placement — **stays Proposed**

- **Status:** Stays **Proposed**. Explicitly **out** of Slice 22 (heuristic axis ≠ collapse/quiet chrome) and **out** of Slice 23.
- **Coach benefit:** The checklist only checks off “placera på hallen” after at least one Teknik-station is actually on the schematic, not merely after opening Hallöversikt.
- **Experience-first:** New coaches currently get credit for opening the hall (`openedHall`), which teaches the wrong habit before Redigera redskap / Använd alla förslag.
- **Standing lock?** **No fight.** Home-only checklist; does not change Teknik-only placeable set, compose entry, or drafts model.
- **Evidence:** `coachTips.ts` marks `openHallAndPlace` when `placementCount >= 1` **or** `openedHall` (`markHallOpened` / sync heuristics). Slice 09 shipped that heuristic (`SLICE09-SHIPPED.md`); Slice 16 added compose step but left place heuristic unchanged (`docs/kom-igang-redskap.sv.md`, `verify-traningsplaneraren/features/home-kom-igang.md`).
- **Effort:** S
- **Suggested slice shape:** Docs clarify step copy if needed; Builder: auto-progress place step only when `placementCount >= 1` (stop counting bare `openedHall`). Keep soft — do not block Hall/Golvklart. Optional: if previously checked via open-only, leave as-is (no regress old tips state) or recompute on next sync — pick in pack. Verifier: open hall alone leaves step unchecked; place one Teknik checks it.

#### 3. Hall phone — pinch-zoom — **absorbed into Slice 21 Shipped**

- **Status:** Absorbed into **Slice 21** Hallöversikt phone usability pack (`slice-21/`) together with collapsible sticky tray + pan-while-zoomed. Pack **APPROVED 2026-09-26**; Verifier **PASS 2026-09-26**; Shipped; live on Pages as Slice 21.
- **Coach benefit:** On a phone you can pinch the schematic to aim placements and read Golvklart titles/redskap without hunting only +/− buttons.
- **Experience-first:** Floor setup on a small screen is the highest-friction remaining hall loop after Slice 20 hit-target/scroll polish; pinch is how coaches already zoom maps.
- **Standing lock?** **No fight.** View-only scale (same as +/−); does not change stored x,y, caption, CAD, or placeable rules.
- **Evidence:** Slice 07 chose +/− only and deferred pinch (`SLICE07-SHIPPED.md` Gaps: “Pinch-zoom not implemented (buttons chosen)”; zoom is view-only). Slice 20 polished remove/Stäng/mall scroll but not zoom (`SLICE20-SHIPPED.md`). Phone URL now carries dense Golvklart chrome (titles + redskap, Slices 14–17).
- **Effort:** M (now part of Slice 21 pack)
- **Suggested slice shape:** See `slice-21/` recommended A1 (+ B1 tray + C1 pan). Do **not** re-propose pinch alone — Slice 21 is Shipped.

---

## In flight

_(none)_

---

## Approved (ready for a slice pack)

### Förråd tom — peka på Använd alla förslag (när eligible) — **ready for Slice 24**

- **Status:** **Approved** 2026-09-26 (Christoffer). **Queued as Slice 24** — do **not** draft `slice-24/` until Planner starts that pack. **Out** of Slice 23 (F1).
- **Coach benefit:** Empty Förrådslista offers a soft path toward persisting seeds on placed Teknik, instead of only “tryck en markör → Redigera redskap” one-by-one.
- **Experience-first:** Empty packing is often “placed but unset” — the same population Slice 19’s **Använd alla förslag** already solves on Hall edit, but Förråd does not bridge to that CTA.
- **Standing lock?** **No fight** if soft: reuse apply-all persist on Hall edit; do **not** open compose from Förråd; do **not** promote förslag without save; no Passbyggaren compose; no Parked station-breakdown UI.
- **Evidence:** `ForradslistaSheet.tsx` empty state = empty + hint only (per-markör Redigera redskap); HallBoard gates **Använd alla förslag** by `eligibleSuggestedCount` (Slice 19); eligibility = placed + unset + seed (`session.ts`); quiet floor rules still require saved composition (Slices 14–15/18).
- **Effort:** S
- **Suggested slice shape:** When Förråd empty **and** `eligibleSuggestedCount ≥ 1`, add soft secondary copy + CTA that closes sheet and focuses Hall edit apply-all (or navigates to Hall with toast pointing at existing CTA). When not eligible, keep today’s empty hint. Docs Swedish; Verifier: eligible empty vs no-placements empty vs already-saved. Optional later bundle with Proposed saknar banner as one “redskap readiness” pack — **default keep separate**.

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
| Home polish — Hallöversikt/Golvklart when draft + Öppna på telefon | 23 | Verifier PASS 2026-09-26; live on GitHub Pages · https://drevmok.github.io/traningsplaneringen/. Pack `slice-23/`. Report `verifier/slice-23-verify-report.md`. |
| Quieter chrome (progressive Hall hints · quieter Kom igång · one chrome layer) | 22 | Verifier PASS 2026-09-26; live on GitHub Pages · https://drevmok.github.io/traningsplaneringen/. Pack `slice-22/`. Report `verifier/slice-22-verify-report.md`. |
| Hallöversikt phone usability (pinch + collapsible tray + pan) | 21 | Verifier PASS 2026-09-26; live on GitHub Pages · https://drevmok.github.io/traningsplaneringen/. Pack `slice-21/`. |
| Phone polish — dirty Stäng + canvas remove + template scroll freeze | 20 | Verifier PASS 2026-09-26; live on GitHub Pages · https://drevmok.github.io/traningsplaneringen/. Pack `slice-20/`. |
| Hall — Använd alla förslag | 19 | Verifier PASS 2026-09-25; Netlify not yet republished (phone still Slice 17 until Christoffer asks). Slice 18 also still not on phone. |
| Broader selective redskap-förslag on Teknik drills | 18 | Verifier PASS 2026-09-25; Netlify not yet republished (phone still Slice 17 until Christoffer asks) |
| Golvklart screen — short station titles | 17 | Verifier PASS 2026-09-25; live on Netlify · https://fancy-blancmange-4d516b.netlify.app/ |
| Visual station markers + tap-to-detail | 12 | Live on Netlify |
| Compose Teknik station from redskap library | 13 | Live on Netlify · https://fancy-blancmange-4d516b.netlify.app/ |
| Kom igång — discover Redigera redskap | 16 | Verifier PASS 2026-09-25; live on Netlify · https://fancy-blancmange-4d516b.netlify.app/ |
| Förrådslista — aggregate redskap across the pass | 15 | Verifier PASS 2026-09-25; live on Netlify · https://fancy-blancmange-4d516b.netlify.app/ |
| Golvklart & print — redskap under each station | 14 | Verifier PASS 2026-09-25; live on Netlify · https://fancy-blancmange-4d516b.netlify.app/ |
