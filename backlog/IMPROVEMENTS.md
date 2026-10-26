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

### Scout polish pass 2026-10-13 (Slice 37 live)

Walked https://drevmok.github.io/traningsplaneringen/ (footer «Slice 37») at 390×844, fresh localStorage, headless Chrome, as a brand-new coach. Screenshots: `/workspace/screenshots/polish-2026-10/` (box). Ranked by impact on feel. Bundle headroom ~43 B (+3 029 / 3 072 B) — anything beyond copy/CSS needs a byte trim elsewhere. Not re-proposing Parked/Declined/Shipped.

#### 1. **Polish** — Spara passet automatiskt (no silent loss on ←) — **Shipped → Slice 39** (Approved 2026-10-13)
- **Effort:** S–M · bundle ~+80–150 B (persist draft on change instead of only via «Spara utkast»; hide/rename the button to «Sparat ✓»). Over cap → needs a trim.
- **Evidence:** Passbyggaren → apply Nybörjare mall → Hallöversikt → back → ← to Home: no prompt, localStorage has no session (only bank cache + tips) — the pass is gone. Verifier known item: built-in mall not saved until «Spara utkast». `16-mall-applied.png`, `18-leave.png`.
- **Simplicity test:** removes a step (remember to tap «Spara utkast») and the worst new-coach dead end.
- **Standing lock?** No — still local-only storage.

#### 2. **Polish** — Teknik markers stack in Blå/Vit hall — **Shipped → Slice 40** (Approved 2026-10-13)
- **Effort:** S · bundle ~+40–80 B (fan out auto-placed markers in a small grid/offset inside the open area).
- **Evidence:** Wizard (7–9 år · Blandat · Blå hall) → Mer → Hallöversikt: 3 stations auto-placed on one spot; only «3» visible, 1–2 hidden under it (Verifier known item; same after mall apply in Slice 37). `09-hall.png`, `17-hall-from-mall.png`.
- **Simplicity test:** coach no longer has to drag markers apart to find them — shortens the place step.
- **Standing lock?** No — one marker per station kept.

#### 3. **Polish** — Ångra after ×-remove (and after «Använd mall») — **Shipped → Slice 41** (Approved 2026-10-13)
- **Effort:** S · bundle ~+90–120 B (toast «Borttagen · Ångra» holding last session snapshot ~5 s).
- **Evidence:** Passbyggaren → tap × on «Ljushopp på satsbräda»: removed instantly, no confirm, no undo (53→47 min). × sits next to ⓘ on every row — easy mis-tap on phone. Verifier known item: no undo. `19-after-delete.png`.
- **Simplicity test:** replaces fear/re-adding from Bibliotek with one tap; no confirm dialog added.
- **Standing lock?** No.

#### 4. **Polish** — Right tip for the moment: drop «Tomt pass?» on full passes; skip «Ersätta det här passet?» on a fresh pass — **Shipped → Slice 42** (Approved 2026-10-13)
- **Effort:** S · bundle ~+10–30 B (condition on session pristine/empty).
- **Evidence:** Wizard → Skapa pass shows «Tomt pass? Börja från en mall…» above a full 53-min pass (`07-passbyggaren.png`). Home → «Från mall» → pick Nybörjare asks «Ersätta det här passet?» although the coach just started (only default Samling) (`14-mall-confirm.png`).
- **Simplicity test:** removes one confirm tap and one confusing message from the first-pass path.
- **Standing lock?** No.

#### 5. **Polish** — Hallöversikt: hall above the fold, one «Använd alla förslag» — **Shipped → Slice 43** (Approved 2026-10-13) — one button / no «Inga förslag att spara»: part of Slice 49.
- **Effort:** S · CSS/markup only, ~0 to −30 B (drop duplicate button; fold layout notes into the select helper; hide «Inga förslag att spara» once done).
- **Evidence:** Hallöversikt at 390×844: the hall canvas starts ~y 570 under toolbar, layout select, two notes, saknar-banner with a 2nd «Använd alla förslag», «Tips om placering» and tip card (`09-hall.png`). After applying, a dead «Inga förslag att spara» button stays in the toolbar (`10b-forrad-after.png`).
- **Simplicity test:** fewer things to read before placing; one button instead of two.
- **Standing lock?** No — Slice 22 quieter-chrome direction.

Also noticed (not ranked): Hallöversikt hidden behind «Mer» on Passbyggaren; empty «Föreningens mallar» section («Föreningen har inga mallar än.») sits above built-in malls (`13-mallar.png`); «Spara som egen mall» appears in both Mer and Exportera/dela, and «Skriv ut passet» is both heading and button (`20-dela.png`); wizard step 1 shows a «Nivå» button under Ålder (`02-wizard-1.png`).

### Scout polish pass 2026-10-23 (Slice 48 live)

Source: `/workspace/scout-drafts/2026-10-23-ideas.md` #1–#3, evidence in `slice-49/evidence/` (390×844). All three are in Slice 49 (`slice-49/README.md`, LOCKED A1 B1 C1 D1 E1 F1).

#### 1. **Polish** — Planera pass fyller vald passlängd — **Approved (2026-10-23) · In flight: Slice 49 (A1, B1)**
- **Coach benefit:** When I answer «120 min» I get a 120-minute pass, not a 53-minute pass I have to fill by hand.
- **Evidence:** Planera pass → … → 120 min → «53 / 120 min» (`10-builder-120.png`); 60 min gives «53 / 60» (`06-builder.png`); Kör passet says «Kvar: 53 min» (`16-run.png`).
- **Slice 49:** A1 fixed table per length and block (same drills, whole minutes, sum = the length). B1: changing the length afterwards only changes the target. Replaces Slice 46 D1.

#### 2. **Polish** — Redskap klara direkt efter Planera pass — **Approved (2026-10-23) · In flight: Slice 49 (C1, D1)**
- **Coach benefit:** Förrådslista shows what to fetch straight after the wizard, instead of an empty list and a trip back to a button.
- **Evidence:** «3 stationer saknar redskap» and «Använd alla förslag» twice (`07-hall.png`); Förrådslista empty (`13-forrad.png`).
- **Slice 49:** C1 applies the suggestions after auto-place on the Planera pass (Frågor) path only, no toast. D1: one «Använd alla förslag» in the toolbar, saknar row text only. Deliberately replaces Slice 29 F1/D4 and Scout 2026-10-13 #1 / Slice 37 («leave Använd alla förslag manual»).

#### 3. **Polish** — Dölj tom «Föreningens mallar» — **Approved (2026-10-23) · In flight: Slice 49 (E1)**
- **Coach benefit:** In «Använd mall» the coach sees usable malls first instead of an empty club section.
- **Evidence:** «Föreningens mallar · … · Föreningen har inga mallar än.» at the top of the sheet (`12-mall.png`).
- **Slice 49:** E1 shows the section only with ≥1 club template; the Admin empty text stays.

### Scout run 2026-10-13 (post Slice 36 PASS)

Ranked by new-coach impact vs build cost after Slice 35 «Tyck till» + Slice 36 «Föreningens mallar». Bundle headroom after Slice 36 is ~43 B on the +3 072 B slice cap — prefer tiny JS / copy / CSS; note size risk. Does **not** re-propose Parked (incl. banksnapshot, CAD, coach accounts), Declined (none), or Shipped. Each idea: experience-first + standing-lock check (`PSTACK-OPS.md`).

#### 1. Mall-apply — auto-place Teknik like the wizard already does — **Shipped → Slice 37** (PR #41)

- **Title:** After Starta från mall / Föreningsmall, Teknik markers land on the hall automatically (same helper as Planera pass).
- **Coach benefit:** A new coach who picks a club-tested pass still faces a blank Hallöversikt today — auto-place closes that gap so Golvklart and Förråd are one soft step away, not a cold start.
- **Evidence:** Slice 36 E1 clears hall placements on publish/apply (`clearHallPlacements` in `clubTemplates.ts`); toast copy admits the blank floor (`clubTemplatePlacementsNote` / `clubTemplateApplied`: «Stationerna placerar du själv…»). Built-in/local malls via `cloneTemplate` also clear placements (`session.ts`). Wizard already calls `autoPlaceUnplaced` (`wizard.ts`) — mall apply does not. Club malls were sold as lowering the blank-pass barrier (Scout outside sweep 2026-10 / Sportadmin Passbank). Kom igång still teaches place; saknar banner (Slice 25) still soft-helps redskap. Do **not** auto «Använd alla förslag» — that was deferred Slice 29 F1/D4.
- **Effort:** S
- **Simplicity check:** No new screen, setting or control — one existing helper on apply; coach can still drag/remove markers. Toast copy updates to match (no longer «placera själv»).
- **Standing lock?** No fight. Placements stay device-local (never in club payload); Teknik-only placeable unchanged; hall template / CAD locks untouched.
- **Size risk:** Tiny (one function call + short copy tweak). Comfortable under current bundle headroom.
- **Suggested slice shape:** Pipe `clubTemplateToSession` and `cloneTemplate` (and saved-template apply if it shares the clear path) through `autoPlaceUnplaced` before `adoptAsDraft`. Update Slice 36 toast/note strings. Leave «Använd alla förslag» manual. Docs: 2–3 strings. Verifier: apply a Föreningsmall and a built-in mall → markers present, hall template unchanged, redskap still via saknar / Använd alla förslag.

#### 2. Kör passet — redskap line on the current step — **Parked (2026-10-13)**

- **Title:** Kör passet shows the station's redskap under the title when the step has any (saved slots or drill default).
- **Coach benefit:** On the floor you often run from the phone without a printed Golvklart — seeing «2 madrasser · 1 satsbräda» on the active step avoids a trip back to Hallöversikt mid-pass.
- **Evidence:** `stationCards.ts` already builds an equipment line for Golvklart / print / StationDeck (`equipmentLine`); `RunPass.tsx` / `runPass.ts` expose only why / first how-step / watch / safety — no redskap. Slices 14–15 made redskap core to the hall loop; Slice 34 polished the timer, not gear. Many Teknik seeds carry `defaultStationEquipment`, so the line helps even before «Använd alla förslag».
- **Effort:** S
- **Simplicity check:** No new button or setting — one muted line, hidden when there is no redskap (Samling / Lek stay clean).
- **Standing lock?** No fight (Kör passet only; no hall/CAD/accounts change).
- **Size risk:** Small (reuse label helper + one UI string). Prefer measuring against a fresh slice budget; still likely well under a few hundred bytes gzip.
- **Suggested slice shape:** Extend `RunStep` with optional equipment text (same rules as `stationCards`); render a grey `.run-equipment` line under the title. Docs: 1 string. Verifier: Teknik step with defaults shows the line; step without redskap shows none; tone/Nästa (Slice 34) unchanged.
- **Bundle candidate with #3** (same Kör passet surface).

#### 3. Kör passet — «Kvar: …» for the rest of the pass — **In progress (Slice 38)**

- **Title:** Under the timer, a muted remaining-pass time (current left + later steps) so the coach can see if the booked hall slot still fits.
- **Coach benefit:** Spotting gymnasts, you cannot sum the remaining stations in your head — a single «Kvar: 24:00» line tells you whether to shorten the next Lek or wrap up.
- **Evidence:** Gymnastikförbundet's truppgymnastik pass is clock-driven station work; the app already stores per-item minutes and pass length, but `RunPass` only shows the active step clock (`formatRunClock` / Slice 34 Nästa line). Coaches book halls by wall-clock; overrun is a real floor problem the outside-sweep timer work only partly addressed (per-station alert, not whole-pass remaining).
- **Effort:** S
- **Simplicity check:** No new control — one grey line, always derived from existing step seconds; hidden only if you prefer «only when >1 step left» (recommend always show after first paint for predictability).
- **Standing lock?** No fight (Kör passet only).
- **Size risk:** Tiny pure helper + one string; fine alone or bundled with #2.
- **Suggested slice shape:** `runRemainingText(steps, index, left)` → «Kvar: mm:ss»; place under Nästa line (or beside it on wide). No auto-advance, no new alerts. Docs: 1 string. Verifier: advance steps → Kvar shrinks; pause does not drift; last step shows only current left.
- **Bundle candidate with #2** (same Kör passet surface — one polish pack if both Approved).

---

### Scout outside sweep 2026-10 (similar apps)

First monthly **outside** sweep (2026-10-09): what similar coaching / session-planning tools do, filtered hard for **simplicity** (no new screens, settings, coach accounts or social features). Checked against all backlog sections and shipped Slices 01–33 plus the post-28 main-branch work (Kör passet timer + cue, Exportera/dela + QR, Egna mallar, Ny vecka, Planera pass wizard, delad övningsbank + admin). Two ideas only — the rest were dropped (see end of this run).

#### 1. Kör passet — hörbar signal när tiden är ute + ”Nästa: …”

**Approved 2026-10-09** (Christoffer) → **Slice 34** (pack LOCKED 2026-10-09, `slice-34/`).

- **Title:** Kör passet tells you when time is up (short tone + vibration) and shows what comes next.
- **Source:** [Seconds Pro – Interval Timer (Google Play)](https://play.google.com/store/apps/details?id=com.runloop.seconds&hl=en_US) · [Seconds Interval Timer (App Store)](https://apps.apple.com/us/app/seconds-interval-timer/id475816966) · [Gymnastikförbundet – Passets uppbyggnad](https://www.gymnastik.se/verksamheter/starta-upp-verksamhet/starta-upp-truppgymnastik-65-/passets-uppbyggnad)
- **Coach benefit / real problem:** A new coach is watching and spotting gymnasts, not the phone — today the clock reaches 00:00 silently (`runTimeUp` text only), so stations overrun and the pass drifts; a tone/buzz plus “Nästa: Hjulning” lets them call the switch and prep the next redskap without reading the screen.
- **Evidence:** Seconds’ gym-floor timer: “The current interval and next interval are displayed so you can see also what's up now and next” and “Loud or soothing alerts”; the App Store copy is literally titled “HEAR IT, DON’T WATCH IT”. Gymnastikförbundet’s recommended truppgymnastik pass runs stations on a clock (“Varje övning körs under 1 minut … Tiden och vilan mellan övningarna är lika lång som det tar för deltagarna att byta station”) — the coach has to call each switch. In our app `RunPass.tsx` already has the clock, wake lock and full screen, but no `vibrate`/audio and no next-step preview (`runSteps` already knows the next title).
- **Effort:** S
- **Simplicity check:** No new screen, button or setting — one short tone + `navigator.vibrate` fired once at 00:00, and one small grey line under the clock; the phone’s own volume/silent switch is the only control.
- **Standing lock?** No fight (Kör passet only; no hall, redskap, drafts or cloud change).
- **Suggested slice shape:** In Kör passet, when a step’s clock first reaches 0 (not when paused, not on manual Nästa) play one short Web Audio tone (no audio file) and `navigator.vibrate(…)` where supported; silently skip where not (iOS Safari has no vibrate). Add a muted line under the clock: “Nästa: <next title>” (hidden on the last step). Docs: 2 strings. Verifier: run a 1-min pass on phone; tone fires once per step, never while paused.

#### 2. Föreningens mallar — färdiga pass från banken i ”Starta från mall”

**Approved 2026-10-09** (Christoffer) → **Shipped as Slice 36** (Verifier PASS / merge `c6a11d5`, 2026-10-12). Full write-up under **Shipped**.

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

- **Slice 38** — Kör passet — «Kvar: …» for the rest of the pass (Scout run 2026-10-13 idea #3) · Effort: S
- **Slice 50** — Snabbare verifiering (infra, no app change, bundle 0 B): tools once per box, Doctor + template database + main cache in `/home/box/tp-verify/`, `smoke-map.json` + `pick-smokes.mjs`, s33 OTP-flake fix (D1), one skill pointer, «Stabila väljare» per feature, weekly loop script (routine after Christoffer's OK) · Pack `slice-50/` · Effort: M
- **Slice 51** — Laga trasiga smokes (infra, no app change, bundle 0 B): seed/s30/s30-fix/s31/s32/s37/s42–46 green on the stand-in, one start path (`smoke-start.mjs`) and code login (`smoke-login.mjs`), exit 1 on FAIL, `run-smokes --baseline` (SAMMA/NY FAIL/LAGAD) + crash line, karantän list + `quarantine.tsv`, `lib.sh pw_ok`, per-TPV_HOME template port, `bun test src`/`tools/bank` split · Pack `slice-51/` · Effort: M
- **Slice 52** — Kvarvarande smoke-fel (infra, no app change, bundle 0 B): s37/s43–s46 0 FAIL (adapted to Slice 45 B1/48 B1/49 A1/D1, frozen old `#dela=` links in `verifier/fixtures/old-share-links.json`), weak checks made real (C1, fault-injected), `run-smokes` rc without `--baseline`, Playwright pinned (`PW_VERSION`/`PW_REV`), Doctor validates the baseline (`baseline_ok`), new admin-import smoke · Pack `slice-52/` · Effort: M. Remaining known FAIL (s33–s36, s38–s41, s47) → Slice 53


---

## Approved (ready for a slice pack)

_(none — 2026-10-13 polish #1–#5 shipped in Slices 39–43; see Shipped)_


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
| Kör passet — redskap line on the current step | Parked by Christoffer 2026-10-13 | Scout run 2026-10-13 idea #2 |

---

## Declined

_(none yet)_

---

## Shipped (recent)

| Idea | Slice | Notes |
|---|---|---|
| Spara passet automatiskt (no silent loss on ←) | 39 | **Shipped** · Scout polish pass 2026-10-13 #1. Moved from Approved in Slice 53 (E1). |
| Teknik markers stack in Blå/Vit hall | 40 | **Shipped** · Scout polish pass 2026-10-13 #2. Moved from Approved in Slice 53 (E1). |
| Ångra after ×-remove (and after «Använd mall») | 41 | **Shipped** · Scout polish pass 2026-10-13 #3. Moved from Approved in Slice 53 (E1). |
| Right tip for the moment (no «Tomt pass?» on full pass; no «Ersätta?» on fresh pass) | 42 | **Shipped** · Scout polish pass 2026-10-13 #4. Moved from Approved in Slice 53 (E1). |
| Hallöversikt: hall above the fold, one «Använd alla förslag» | 43 | **Shipped** · Scout polish pass 2026-10-13 #5. Moved from Approved in Slice 53 (E1). |
| Auto-place Teknik on mall apply | 37 | **Shipped** 2026-10-13 · PR #41 · merge `1769eca`. Scout run 2026-10-13 idea #1. |
| Föreningens mallar (club templates) | 36 | **Shipped** 2026-10-12 · PR #39 · merge `c6a11d5`. Pack `slice-36/`. Live on Pages. Outside-sweep idea #2. |
| Tyck till (footer mailto) | 35 | **Shipped** 2026-10-12 · PR #38 · merge `6daaa59`. Pack `slice-35/`. |
| Kör passet tone + «Nästa: …» | 34 | **Shipped** 2026-10-09 · PR #37 · merge `7a2a813`. Pack `slice-34/`. Outside-sweep idea #1. |
| Admin login by 6-digit email code | 33 | **Shipped** · PR #35 · pack `slice-33/`. |
| Admin login + bank edit (+ bot writes) | 32 | **Shipped** · was Approved/Locked 2026-10-02; pack with Slice 31. |
| Delad övningsbank (Supabase read-only) | 31 | **Shipped** · was In flight; pack `slice-31/`. |
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
