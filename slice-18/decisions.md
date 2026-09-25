# Slice 18 — decisions (APPROVED)

**Status:** **APPROVED 2026-09-25** — Christoffer approved 2026-09-25 via Planner lock widget; A–F locked  
**Direction:** Broader selective redskap-förslag on Teknik drills (Scout / backlog idea 1 Approved 2026-09-25)

## A. What Slice 18 adds

**Decision rationale:** Add `defaultStationEquipment` seeds for **additional Teknik drills** that have an obvious floor setup, so unset stations show förslag and coaches can tap **Använd förslag**. Keep the four existing vault/trampett/mattberg seeds unchanged. No UX redesign — only more activities expose non-empty förslag when unset.

| Surface | Slice 18 change? |
|---|---|
| `seedActivities.ts` `defaultStationEquipment` | **Yes** — extend seeds for locked drills |
| Använd förslag / Klar / unset vs `[]` | **No** — same UX |
| Golvklart / print | **No** — still omit unset förslag |
| Förrådslista | **No** — still omit unset förslag |
| Equipment library (10 pieces) | **No** — no new ids |
| Passbyggaren / Home / Kom igång | **No** (Kom igång still keys off **saved** composition) |
| Hall detail Redigera redskap | **No** chrome change — more drills show förslag block |

**Rejected (standing):** CAD pins / Passbyggaren compose / canvas badge / custom library.  
**Rejected (this pack):** Auto-apply förslag on place; promoting förslag onto Golvklart / Förrådslista before Klar / Använd förslag; changing caption.

## B. Data / model

**Locked model:** No new persistence fields. Reuse existing `Activity.defaultStationEquipment?: StationEquipmentSlot[]` (`pieceId` + `count`). Builder only adds arrays on selected Teknik activities in `seedActivities.ts`. Slot shape mirrors the four existing seeds.

---

## DECISION RATIONALE — Planner recommendations (now locked)

### A. Which drills get new seeds? — locked below

**Rationale for lock A: Seed all five remaining Teknik drills** — each has an obvious setup from title and/or `howTo` in `seedActivities.ts`. Backlog said 4–8 more; only five Teknik lack seeds today.

**LOCKED seed table** (slot shape = `{ pieceId, count }`, same as existing four):

| activityId | title | locked slots | Grounding (how / title) |
|---|---|---|---|
| `tech-flickis-kudde` | Flickis med flickiskudde | `eq-flickiskudde` ×1, `eq-madrass` ×1 | Title names kudden; how: “Placera kudden…”; soft surface for bakåtrörelse |
| `tech-rondat-flickis` | Rondat–flickis | `eq-tumblingmatta` ×1, `eq-landningsmatta` ×1 | Floor tumbling line; Erfaren drill — still useful förslag for experienced coach |
| `tech-falla-bakat-hojd` | Falla bakåt från höjd till rygg | `eq-plint` ×1, `eq-madrass` ×1 | how: “Använd plint/höjd…; tjock och lång madrass bakom” |
| `tech-salto-fran-hojd` | Salto från höjd | `eq-plint` ×1, `eq-landningsmatta` ×1 | how: höjd + “madrassuppställning”; Landningsmatta matches vault-family landing style |
| `tech-handstaende-falla-rygg` | Handstående falla till rygg | `eq-madrass` ×1 | how: “Lägg madrass bakom innan någon går upp i handstående” |

**Cap:** 1–3 pieces per drill (existing seeds are 2–3). No library growth.

**Existing four — KEEP unchanged:**

| activityId | slots (do not edit) |
|---|---|
| `tech-ljushopp-satsbrada` | `eq-satsbrada` ×1, `eq-landningsmatta` ×1 |
| `tech-ljushopp-trampett` | `eq-trampett` ×1, `eq-landningsmatta` ×1 |
| `tech-satsbrada-volt-rygg` | `eq-satsbrada` ×1, `eq-landningsmatta` ×1 |
| `tech-trampett-volt-mattberg` | `eq-trampett` ×1, `eq-mattberg` ×1, `eq-landningsmatta` ×1 |

**Why all five:** Every remaining Teknik names or implies gear in title/`howTo`. Seeding all maximizes Använd förslag coverage without ambiguous empty sheets. Piece choices stay small and club-default-ish; coach can still Klar-edit after Använd förslag.

**Alternatives:**

| Option | Drills | When to pick |
|---|---|---|
| **A1 (recommend)** | All five above | Default — obvious setups |
| **A2** | Only three safest: `tech-flickis-kudde`, `tech-falla-bakat-hojd`, `tech-handstaende-falla-rygg` | If Christoffer wants to skip Erfaren / tumbling-line ambiguity |
| **A3** | Skip `tech-rondat-flickis` and/or `tech-salto-fran-hojd` (Erfaren) | Leave those empty; coach composes manually |
| **A4** | Swap pieces (e.g. Airtrack instead of Tumblingmatta; Mattberg instead of Plint for salto; Landningsmatta instead of Madrass on flickis-kudde) | Club preference on naming |

---

### B. Does Använd förslag / unset vs `[]` / Klar change?

**Rationale for lock B: No UX change.** Only more activities expose non-empty förslag when `stationEquipment` is unset. `[]` still means coach cleared. Klar / Använd förslag still persist saved composition.

**Why:** Slice 13–15 locks are correct; this slice is seed breadth only.

**Alternatives:** Auto-apply on place (rejected — promotes förslag too early); rename buttons (out of scope).

---

### C. Golvklart / Förrådslista / print before Klar?

**Rationale for lock C: Unchanged** — still omit unset förslag until saved (Slice 14–15 locks). Golvklart, print, Förrådslista, and Kom igång progress continue to use **SAVED** `stationEquipment` only.

**Why:** Förslag is a detail/sheet helper, not floor truth.

**Alternatives:** Show förslag on Golvklart as “förslag”-styled lines (rejected — confuses floor helpers).

---

### D. Docs surface?

**Rationale for lock D: Thin update to `docs/station-compose.sv.md`** — replace “selective vault / trampett / mattberg-style” phrasing with a short table of drills that ship förslag (existing four + locked new set). No new required user-facing tip for PASS. Optional thin `docs/redskap-forslag.sv.md` only if Docs wants a dedicated page; otherwise one table in station-compose is enough.

**Why:** Compose UX copy already documents Använd förslag; coaches need the *which drills* list updated, not new chrome.

**Alternatives:** New tip (`tipRedskapForslag`) — soft optional, not required for PASS; skip docs table (weaker for Verifier / future Scout).

---

### E. Footer?

**Rationale for lock E: `Träningsplaneraren · Slice 18`**

---

### F. Scope guards?

**Rationale for lock F:**

- **No** new library pieces (`eq-*` stays at 10)
- **No** Passbyggaren compose
- **No** canvas badge / CAD pins
- **No** auto-apply förslag on place
- **No** Netlify in pack
- Caption **Schematisk hall — inte exakt mått** unchanged
- Do **not** edit the four existing seed arrays
- Do **not** add `defaultStationEquipment` to non-Teknik activities

---

## Locked summary

| # | Lock |
|---|---|
| A | Seed **all five** remaining Teknik drills with the locked piece table (flickis-kudde, rondat-flickis, falla-bakat-hojd, salto-fran-hojd, handstaende-falla-rygg); keep existing four unchanged |
| B | **No** UX change to Använd förslag / unset vs `[]` / Klar |
| C | Golvklart / Förrådslista / print **unchanged** — omit unset förslag until Klar / Använd förslag |
| D | Thin Docs update to `station-compose.sv.md` (drill→förslag table); no required new tip |
| E | Footer `Träningsplaneraren · Slice 18` |
| F | No library growth; no Passbyggaren compose; no badge/CAD; no auto-apply; no Netlify; caption unchanged |

---

## LOCKED ANSWERS — A–F

**Lock:** Christoffer approved via Planner lock widget on 2026-09-25. These answers are authoritative for Builder, Docs, and Verifier.

### A. Which drills get new seeds?

**Lock:** Seed all five remaining Teknik drills with the locked table above:

| activityId | title | locked slots |
|---|---|---|
| `tech-flickis-kudde` | Flickis med flickiskudde | `eq-flickiskudde` ×1, `eq-madrass` ×1 |
| `tech-rondat-flickis` | Rondat–flickis | `eq-tumblingmatta` ×1, `eq-landningsmatta` ×1 |
| `tech-falla-bakat-hojd` | Falla bakåt från höjd till rygg | `eq-plint` ×1, `eq-madrass` ×1 |
| `tech-salto-fran-hojd` | Salto från höjd | `eq-plint` ×1, `eq-landningsmatta` ×1 |
| `tech-handstaende-falla-rygg` | Handstående falla till rygg | `eq-madrass` ×1 |

Keep the existing four unchanged. Use `defaultStationEquipment` with `{ pieceId, count }`.

### B. Använd förslag / unset vs `[]` / Klar

**Lock:** No UX change. `Använd förslag`, unset vs `[]`, and `Klar` remain unchanged; unset may show the seed, while `[]` means coach cleared it.

### C. Golvklart / Förrådslista / print before Klar

**Lock:** Golvklart / Förrådslista / print unchanged — omit unset förslag until saved via `Klar` / `Använd förslag`; all three use saved composition only.

### D. Docs surface

**Lock:** Thin update to `docs/station-compose.sv.md` with a drill→förslag table; no required new tip.

### E. Footer

**Lock:** `Träningsplaneraren · Slice 18`.

### F. Scope guards

**Lock:** No library growth; no Passbyggaren compose; no badge/CAD; no auto-apply; no Netlify; caption **Schematisk hall — inte exakt mått** unchanged. Do not edit the four existing seed arrays or add seeds to non-Teknik activities.

## Carry-forwards (unchanged — hard locks)

- Placeable = Teknik only
- Caption: **Schematisk hall — inte exakt mått**
- Compose = hall detail **Redigera redskap** only
- Fixed 10-piece library
- No canvas equipment badge; no CAD pins
- Slice 14 quiet redskap rules intact
- Slice 15 Förrådslista intact (saved composition only)
- Slice 16 Kom igång intact (saved composition for progress)
- Slice 17 Golvklart short titles intact
- gymnaster / pass / Swedish UI
- Device-local drafts; no accounts / cloud
- **Netlify out of this pack**
