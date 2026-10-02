# Slice 30 — decisions (LOCKED · A1–F1)

**Status:** **LOCKED 2026-10-02** — A1 / B3 / C1 / D1 / E1 / F1.  
**Direction (Christoffer 2026-10-02):** "Övningsimport" — fill the exercise bank from YouTube/social videos. Coach sends a video link to **Planner (chat, outside the app)** → Planner writes drafts in the app's Activity format → coach approves → exercises enter the app.  
**Reference input:** `import-trials/2DJ_oMM81mI/` (12 Teknik drafts, `drafts.json` / `drafts.sv.md` / `build_drafts.py`).  
**Standing locks:** Swedish UI · Teknik-only hall placements · soft/quiet chrome · device-local drafts · no CAD / accounts / cloud · **no in-app AI, no API keys, no video fetching in the browser**.

## Locked A–F

| # | Locked | Meaning |
|---|---|---|
| A | **A1** | Import surface = **file + pasted code** in Bibliotek (no new `#importera=` link) |
| B | **B3** | Land in **both**: own exercises now (device-local); curated picks → seed bank via Builder PR |
| C | **C1** | Add **5 redskap**: Kilmatta · Räcke · Bom · Rockring · Skumblock (fixed library, no free text) |
| D | **D1** | "Behöver granskas" badge on **own** exercises; cleared by **Markera som granskad** or saving an edit |
| E | **E1** | Own-exercise cap **40 → 100**; **Så gör du stays max 4 steps** (golvkort lock) |
| F | **F1** | Quiet **Källa** link (kanal · tid), opens YouTube in new tab; never embed; text always own words |

---

## A. Import surface

| Option | Note |
|---|---|
| **A1 Rekommenderat** | **Importera övningar** in Bibliotek (next to Ny egen övning): pick a `.json` file **or** paste the code Planner sent (raw JSON; a compressed token is nice-later). Home "Hämta ett pass" recognises an exercise file and points to Bibliotek. | Works offline and on phone; no 10 kB URLs in chat; reuses the existing receive pattern (file + paste) |
| A2 | `#importera=<token>` link that opens the preview | One tap, but long links break in chat apps / QR; a link that writes data is easier to open by mistake |
| A3 | Both A1 and A2 | Double the surface + test cost for MVP; add the link later if paste feels slow |

**Rationale (A1):** Planner already produces JSON; file/paste is the smallest safe surface and mirrors "Ta emot ett pass".

## B. Where imported exercises land

| Option | Note |
|---|---|
| B1 | Only own exercises (device-local) | Fast, but good drills never reach other coaches / devices |
| B2 | Only seed bank via build | Curated, but coach waits for a PR + republish for every video |
| **B3 Rekommenderat** | **Both:** in-app import → own exercises instantly; drills Christoffer marks "bank-worthy" → Planner writes a promote file → Builder adds them to `seedActivities.ts` (with `source`) in a PR | Instant for the coach, curated for everyone (see `content/seed-promotion.md`) |

**Rationale (B3):** Own = try it tonight; seed = proven, reviewed, shipped to all.

## C. Redskap expansion set

| Option | Note |
|---|---|
| **C1 Rekommenderat** | **5 pieces:** `eq-kilmatta` Kilmatta · `eq-racke` Räcke · `eq-bom` Bom · `eq-rockring` Rockring · `eq-skumblock` Skumblock — icons + sketch marks in the #12 style; zone + Förrådslista wired | Covers every miss in the trial (10 of 12 stations needed one) |
| C2 | Minimal 3: Kilmatta · Räcke · Bom | Rockringar/skumblock still mapped to "Kon"/"Plint" with notes |
| C3 | C1 + generic **Övrigt** free-text redskap | Breaks Förrådslista aggregation/sketch/zone logic; reopens Parked "custom coach-authored catalog" |

**Rationale (C1):** Fixed catalog stays a fixed catalog (Parked item respected); just five pieces wider.  
**Naming:** `eq-bom` labelled **Bom** (not "Låg bom") — one piece; height lives in the drill text; sketch draws it low.

## D. "Behöver granskas" badge

| Option | Note |
|---|---|
| **D1 Rekommenderat** | Badge on **own** exercises with `needsCoachReview` (library card + exercise detail). Cleared by **Markera som granskad** in detail **or** by saving via Ändra. Never blocks adding to a pass; not shown on Golvklart / stationskort / Kör passet / print | Soft nudge, one tap to clear; editing = reviewing |
| D2 | Cleared only by the explicit button (editing keeps it) | Stricter, but extra tap after you already fixed the text |
| D3 | No badge — warning only in the import preview | Quietest, but the reminder disappears after import |

**Rationale (D1):** Quiet, honest, never in the way on the floor.  
**Note:** 5 seed drills already carry `needsCoachReview: true` (e.g. Närvaro). The badge is **own-only** so seeds do not suddenly sprout badges.

## E. Own-exercise limits

| Option | Note |
|---|---|
| **E1 Rekommenderat** | Cap **100** own exercises; **Så gör du stays 1–4 steps** (≤180 chars each). Import clips step 5+ with a note | All 12 trial drafts fit in 3–4 steps; 4 is the golvkort lock (`MAX_FLOOR_STEPS` in `activityTips.ts`) |
| E2 | Cap 100 **and** 6 steps | Must also raise the floor-tip validation for every drill; longer cards on the floor |
| E3 | Keep cap 40, 4 steps | One import of 12 already uses a third of the room |

**Rationale (E1):** Room for several videos; floor cards stay short. (100 × ~1.5 kB ≈ 150 kB localStorage — fine.)

## F. Source display + credit rules

| Option | Note |
|---|---|
| **F1 Rekommenderat** | Quiet line **Källa: {kanal} · {m:ss}** linking to the video (new tab, `rel="noopener noreferrer"`). Shown in detail + info panel. **Never** embed video, store thumbnails/frames or copy captions. Drill text always in own words. Carried in share link / JSON | Credit + one tap to see the original; no copyright or offline issues |
| F2 | F1 + video title and thumbnail image | Image rights, bigger share links, not offline-safe |
| F3 | Creator name only, no link | Weaker credit; coach cannot check the original movement |

**Rationale (F1):** Credit the creator, link out, keep the app text-only and our own words.

---

## Planner notes (not A–F, fixed by this pack)

1. **Own exercises keep** `defaultStationEquipment` (Teknik only), `tags` (+ `egen`), `difficulty`, `progressionOf` / `regressionOf`, `needsCoachReview`, `experiencedCoachOnly`, `source`. Editing preserves fields the form does not show.
2. **Form gains** a Redskap picker (Teknik only). Tags / difficulty / links / source are **not** editable in the form in MVP — preserved on edit.
3. **Owned-equipment migration:** coaches who saved an explicit "Vad finns i hallen ikväll?" list must not lose the new 5 pieces (otherwise "Visa bara övningar vi kan köra ikväll" flips on by itself). New ids are treated as owned until the coach unticks them.
4. **Schema** has `format` + `schemaVersion: 1`; unknown fields (Planner's `confidence`, `unmappedEquipment`, `level`, `station`, `keyframe`) are ignored by the app.
5. **Footer** → `Träningsplaneraren · Slice 30` when shipped (repo still says 29 after PRs #2–#30).
