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
| **#3** | Förråd tom — peka på Använd alla förslag | → **Shipped** as **Slice 24** (Verifier PASS 2026-09-26 · live on Pages) |

Full write-ups: #1–#2 under **Shipped** (Slice 23); #3 under **Shipped** (Slice 24) below (not re-listed here).

---

### Scout run 2026-09-26 (post Slice 20 PASS · Slice 21 candidates)

Ranked by new-coach impact vs build cost. Redskap spine + phone polish (18–20) are shipped. Does **not** re-propose Parked or Shipped. Each idea: experience-first + standing-lock check (pstack / `PSTACK-OPS.md`).

**Note (2026-09-26):** Quiet-chrome polish shipped as **Slice 22**. Christoffer (2026-09-26 via Planner) **Approved** leftover **#1** and **#2** below → **Slice 25** / **Slice 26** (separate packs — Hall vs Home/Kom igång; no auto-bundle). Status moves:

| Scout # | Idea | Status move |
|---|---|---|
| **#1** | Hall — soft “saknar redskap” banner | → **Shipped** as **Slice 25** (Verifier PASS 2026-09-26) |
| **#2** | Kom igång — place step needs a real placement | → **Shipped** as **Slice 26** (Verifier PASS 2026-09-26) |
| **#3** | Hall phone — pinch-zoom | → **Shipped** as **Slice 21** (absorbed earlier) |

Full write-ups: #2 under **Shipped** (Slice 26); #1 under **Shipped** (Slice 25); #3 under **Shipped** (Slice 21). Not re-listed as Proposed.

#### 1. Hall — soft “saknar redskap” banner — **Shipped → Slice 25**

- **Status:** **Shipped** · Verifier **PASS 2026-09-26**; report `verifier/slice-25-verify-report.md`; pack `slice-25/`. Was out of Slice 22/23/24 (Hall chrome ≠ Förråd empty path; quiet-chrome pack did not absorb). Phone/Pages still Slice 24 until Christoffer asks republish (repo already footer Slice 26; includes Slice 25). See **Shipped** section.
- **Coach benefit:** On Hallöversikt edit you see how many placed Teknik-stationer still have no saved redskap, so Golvklart/Förrådslista are not a surprise empty floor.
- **Effort:** S · separate pack (do not auto-bundle with Slice 26).

#### 2. Kom igång — place step needs a real placement — **Shipped → Slice 26**

- **Status:** **Shipped** · Verifier **PASS 2026-09-26**; report `verifier/slice-26-verify-report.md`; pack `slice-26/`. Phone/Pages still Slice 24 until Christoffer asks republish (repo already footer Slice 26; includes Slice 25). See **Shipped** section.
- **Coach benefit:** The checklist only checks off “placera på hallen” after at least one Teknik-station is actually on the schematic, not merely after opening Hallöversikt.
- **Effort:** S · separate pack (do not auto-bundle with Slice 25).

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

_(none — Slice 26 shipped after Verifier PASS 2026-09-26.)_

---

## Approved (ready for a slice pack)

No approved item remains here.

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
| Kom igång — place step needs a real placement | 26 | Verifier PASS 2026-09-26; report `verifier/slice-26-verify-report.md`; pack `slice-26/`. Phone/Pages still Slice 24 until Christoffer asks republish (repo already footer Slice 26; includes Slice 25). |
| Hall — soft “saknar redskap” banner | 25 | Verifier PASS 2026-09-26; report `verifier/slice-25-verify-report.md`; pack `slice-25/`. Phone/Pages still Slice 24 until Christoffer asks republish (repo already footer Slice 26; includes Slice 25). |
| Förråd tom — soft path to Använd alla förslag | 24 | Verifier PASS 2026-09-26; live on GitHub Pages · https://drevmok.github.io/traningsplaneringen/. Pack `slice-24/`. Report `verifier/slice-24-verify-report.md`. |
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
