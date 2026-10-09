# Träningsplaneraren — improvement backlog

**Owner:** Planner (Christoffer approves / declines)  
**Scout id:** `8d938891-4fba-490d-a96d-5f261cd2da81`  
**Rule:** Nothing here becomes a slice until Christoffer Approves. Scout proposes; Planner drafts packs.

Statuses: `Proposed` · `Approved` · `Locked` · `In flight` · `Declined` · `Parked` · `Shipped`

---

## How to use

1. Scout appends 2–3 items under **Proposed** (dated run).
2. Christoffer (via Planner chat) Approves / Declines / Parks each.
3. Planner moves Approved → next slice pack when Christoffer says “what’s next?”
4. Declined items stay listed with reason so Scout does not re-propose soon.

---

## Proposed

### Scout outside sweep 2026-10 (similar apps)

First monthly **outside** sweep (2026-10-09): what similar coaching / session-planning tools do, filtered hard for **simplicity** (no new screens, settings, coach accounts or social features). Checked against all backlog sections and shipped Slices 01–33 plus the post-28 main-branch work (Kör passet timer + cue, Exportera/dela + QR, Egna mallar, Ny vecka, Planera pass wizard, delad övningsbank + admin). Two ideas only — the rest were dropped (see end of this run).

#### 1. Kör passet — hörbar signal när tiden är ute + ”Nästa: …”

- **Title:** Kör passet tells you when time is up (short tone + vibration) and shows what comes next.
- **Source:** [Seconds Pro – Interval Timer (Google Play)](https://play.google.com/store/apps/details?id=com.runloop.seconds&hl=en_US) · [Seconds Interval Timer (App Store)](https://apps.apple.com/us/app/seconds-interval-timer/id475816966) · [Gymnastikförbundet – Passets uppbyggnad](https://www.gymnastik.se/verksamheter/starta-upp-verksamhet/starta-upp-truppgymnastik-65-/passets-uppbyggnad)
- **Coach benefit / real problem:** A new coach is watching and spotting gymnasts, not the phone — today the clock reaches 00:00 silently (`runTimeUp` text only), so stations overrun and the pass drifts; a tone/buzz plus “Nästa: Hjulning” lets them call the switch and prep the next redskap without reading the screen.
- **Evidence:** Seconds’ gym-floor timer: “The current interval and next interval are displayed so you can see also what's up now and next” and “Loud or soothing alerts”; the App Store copy is literally titled “HEAR IT, DON’T WATCH IT”. Gymnastikförbundet’s recommended truppgymnastik pass runs stations on a clock (“Varje övning körs under 1 minut … Tiden och vilan mellan övningarna är lika lång som det tar för deltagarna att byta station”) — the coach has to call each switch. In our app `RunPass.tsx` already has the clock, wake lock and full screen, but no `vibrate`/audio and no next-step preview (`runSteps` already knows the next title).
- **Effort:** S
- **Simplicity check:** No new screen, button or setting — one short tone + `navigator.vibrate` fired once at 00:00, and one small grey line under the clock; the phone’s own volume/silent switch is the only control.
- **Standing lock?** No fight (Kör passet only; no hall, redskap, drafts or cloud change).
- **Suggested slice shape:** In Kör passet, when a step’s clock first reaches 0 (not when paused, not on manual Nästa) play one short Web Audio tone (no audio file) and `navigator.vibrate(…)` where supported; silently skip where not (iOS Safari has no vibrate). Add a muted line under the clock: “Nästa: <next title>” (hidden on the last step). Docs: 2 strings. Verifier: run a 1-min pass on phone; tone fires once per step, never while paused.

#### 2. Föreningens mallar — färdiga pass från banken i ”Starta från mall”

- **Title:** Club passes from the shared bank show up in the existing **Starta från mall** list (admin publishes, coaches just pick).
- **Source:** [Lime Sportadmin – Guide: Träningsplanering (Passbank)](https://www.lime-sportadmin.com/sv/hjalp/planeringsverktyg/guide-traningsplanering/) · [Gymnastikförbundet – Lektionsförslag](https://www.gymnastik.se/verksamheter/starta-upp-verksamhet/starta-upp-truppgymnastik-65-/lektionsforslag)
- **Coach benefit / real problem:** A brand-new coach’s hardest moment is the blank pass; a few club-tested, ready passes (made by an experienced leader) that appear where they already look — Starta från mall — let them start from something proven instead of the two built-in templates.
- **Evidence:** Sportadmin sells exactly this to Swedish clubs: “Passbank … färdiga träningspass redo för föreningens ledare”, only admins manage it, all leaders see it in their app, and the stated benefit is “sänker tröskeln för nya ledare då de enkelt i sin app hittar färdiga mallar och pass redo att användas.” Gymnastikförbundet itself publishes ready lektionsförslag (“Skriv ut lektionsförslaget och ta med till hallen”) — passes, not just drills, are what new leaders ask for. We already have the plumbing: Slice 31 read-only shared bank (offline-first, cached) + Slice 32/33 admin login; passes are already serialisable (`sharePass.ts`), and `SaveTemplateDialog` already turns a pass into a local mall.
- **Effort:** L (new table + RLS, admin “publish as club mall” action, bank fetch/cache for mallar, Verifier on offline fallback).
- **Simplicity check:** Coaches get zero new screens, settings or logins — just a few more cards (tagged “Föreningens”) in the Starta från mall list they already use; all publishing happens behind the existing admin login.
- **Standing lock?** **Note:** stretches the 2026-10-02 narrow lift of “Accounts / cloud” (Slices 31–32: read-only *exercise* bank + admin-only login) from exercises to whole passes. Still no coach accounts or sync; coach drafts stay device-local. Needs Christoffer’s explicit OK on that scope. Hall placements in a club mall: suggest dropping them (template apply already clears placements, `clearHallPlacements`) so hall/Teknik locks are untouched.
- **Suggested slice shape:** Admin-only: on a pass, **Publicera som föreningsmall** writes the same `SharePass` v1 payload that local Egna mallar already store (`savedTemplates.ts`) to a `club_templates` table (anon read-only, admin write, Dölj instead of delete — same F1 pattern as the bank). Coaches: Starta från mall lists bundled templates + cached club templates (same D1 “show cache, refresh in background”); applying one uses today’s replace-draft confirm. No editing of club mallar by coaches (they can still Spara som mall locally). Do after the parked banksnapshot item if Christoffer prefers offline parity first.

**Dropped for simplicity / locks (this sweep):**

- Station rotation timer with groups/roster and “två varv” ([TPT Station Rotation Timer](https://www.teacherspayteachers.com/Product/Station-Rotation-Timer-Group-Maker-Editable-Station-Signs-Center-Rotation-17131354), [Gymnastikförbundet cirkelträning](https://www.gymnastik.se/verksamheter/starta-upp-verksamhet/starta-upp-truppgymnastik-65-/lektionsforslag)) — needs a group/varv model and settings; idea #1 covers the core “call the switch” need.
- Attendance / availability tracking ([TeamSnap](https://www.teamsnap.com/teams/features/member-availability), IdrottOnline / Laget.se) — rosters + accounts; that’s the club system’s job.
- Video analysis, athlete Spaces and messaging ([CoachNow](https://coachnow.com/coach-features)) — accounts, uploads, social.
- Per-gymnast skill assessment / progress tracking (GymAssessor-style) — rosters, personal data on minors, new screens.
- Session archive / history and a Sportplan-style “purpose” field ([Sportplan Session Planner](https://www.sportplan.net/drills/planner/index.jsp)) — new screen; the wizard focus already lands in the pass title.
- Intensity spread hint (“två tuffa övningar inte direkt efter varandra”, [Passets uppbyggnad](https://www.gymnastik.se/verksamheter/starta-upp-verksamhet/starta-upp-truppgymnastik-65-/passets-uppbyggnad)) — needs intensity tagging of every drill + a new warning.
- Equipment checklist / practice plans with timing (TeamSnap ONE) — already shipped (Förrådslista, Slice 15; timings per item).

---

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

- **Status:** **Shipped** · Verifier **PASS 2026-09-26**; report `verifier/slice-25-verify-report.md`; pack `slice-25/`. Was out of Slice 22/23/24 (Hall chrome ≠ Förråd empty path; quiet-chrome pack did not absorb). Live on GitHub Pages · https://drevmok.github.io/traningsplaneringen/. See **Shipped** section.
- **Coach benefit:** On Hallöversikt edit you see how many placed Teknik-stationer still have no saved redskap, so Golvklart/Förrådslista are not a surprise empty floor.
- **Effort:** S · separate pack (do not auto-bundle with Slice 26).

#### 2. Kom igång — place step needs a real placement — **Shipped → Slice 26**

- **Status:** **Shipped** · Verifier **PASS 2026-09-26**; report `verifier/slice-26-verify-report.md`; pack `slice-26/`. Live on GitHub Pages · https://drevmok.github.io/traningsplaneringen/. See **Shipped** section.
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

| Idea | Slice | Status / notes |
|---|---|---|
| Delad övningsbank i databas (Supabase, bara läsa) | 31 | **Approved/Locked 2026-10-02 20:25** (A1 · D1 of pack A1/B2/C1/D1/E1/F1); next: Christoffer Supabase setup → Docs → Builder → Verifier. Pack `slice-31/` (branch `slice-31-pack`). |

---

## Approved (ready for a slice pack)

| Idea | Slice | Status / notes |
|---|---|---|
| Admin-inloggning + redigering av banken (magic link, Godkänn/Ändra/Dölj, bot skriver som Väntar) | 32 | **Approved/Locked 2026-10-02 20:25** (B2 · C1 · E1 · F1). Pack written — `slice-31/` (shared with Slice 31). Starts after Slice 31 is live; E1 replaces the PR seed path (`slice-31/content/bot-writes.md`). |

---

## Parked (known, not next)

| Idea | Why parked | Source |
|---|---|---|
| Compose stations by placing separate equipment pins on the hall (CAD-lite) | Explicitly out of Slice 13; one-marker-per-station locked | Christoffer / Slice 12–13 |
| Passbyggaren entry for Redigera redskap | Hall-detail-only locked for Slice 13 | Slice 13 decisions |
| Canvas equipment-count badge on markers | Detail-only locked for Slice 13 | Slice 13 decisions |
| Styrka / other blocks placeable on hall | Teknik-only locked Slice 11+ | Slice 11 |
| Accounts / cloud sync / App Store | Out of near-term scope. **Narrowly lifted 2026-10-02** by Slices 31–32: read-only shared bank + admin-only login. Coach accounts / sync stay parked | Standing product locks · `slice-31/decisions.md` |
| Custom coach-authored redskap catalog | Fixed 10-piece library for Slice 13 | Slice 13 |
| Förrådslista — show which stations contribute | Useful later; keep flat list for now | Christoffer / Scout 2026-09-25 |
| Bundle latest DB snapshot into app offline fallback | **Parked / Later** (Christoffer 2026-10-03). Slice 32 AC 45 accepted as partial: `tools/bank/export-db.ts` writes a read-only backup (`out/bank-snapshot.json`) and `seed-promotion.md` has the superseded banner, but the app's offline fallback stays the bundled 51 seeds (no `app/src/data/bankSnapshot.json`; bundle budget AC 49). Later: a small "Banksnapshot <datum>" PR that bundles the snapshot as the fallback | Slice 32 verify report (AC 45) · `slice-31/content/bot-writes.md` |

---

## Declined

_(none yet)_

---

## Shipped (recent)

| Idea | Slice | Notes |
|---|---|---|
| Övningsimport | 30 | **Shipped**, live on GitHub Pages · https://drevmok.github.io/traningsplaneringen/ (Verifier PASS 5f7198e, 2026-10-02). Pack `slice-30/`. Report `verifier/slice-30-verify-report.md`. Merged via PR #31. |
| Home 3-question wizard — full pass + hall placements | 29 | Verifier PASS 2026-09-27; live on GitHub Pages · https://drevmok.github.io/traningsplaneringen/ (includes Slice 28). Pack `slice-29/`. Report `verifier/slice-29-verify-report.md`. |
| Mall Samling within budget | 28 | Verifier PASS 2026-09-27; live on GitHub Pages · https://drevmok.github.io/traningsplaneringen/. Pack `slice-28/`. Report `verifier/slice-28-verify-report.md`. |
| Soft Samling — default upprop + kort genomgång | 27 | Verifier PASS 2026-09-26 evening; live on GitHub Pages · https://drevmok.github.io/traningsplaneringen/. Pack `slice-27/`. Report `verifier/slice-27-verify-report.md`. |
| Kom igång — place step needs a real placement | 26 | Verifier PASS 2026-09-26; live on GitHub Pages · https://drevmok.github.io/traningsplaneringen/. Pack `slice-26/`. Report `verifier/slice-26-verify-report.md`. |
| Hall — soft “saknar redskap” banner | 25 | Verifier PASS 2026-09-26; live on GitHub Pages · https://drevmok.github.io/traningsplaneringen/. Pack `slice-25/`. Report `verifier/slice-25-verify-report.md`. |
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
