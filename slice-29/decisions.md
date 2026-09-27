# Slice 29 — decisions (APPROVED 2026-09-27 · A1–F1 locked)

**Status:** **APPROVED 2026-09-27** — A1/B1/C1/D1/E1/F1 locked. Docs → Builder → Verifier may proceed.  
**Direction lock (product):** Home 3-question wizard becomes the **standard start**: ålder/nivå → fokus redskap/tema → hallayout → **complete pass** + **Teknik pre-placed** in the right zones. Soft Samling blank and old malls remain escapes (E1 locked). Teknik-only placeable; device-local; no CAD/cloud; preserve 22–28.

Christoffer (2026-09-27 via Planner) **Approved** the wizard backlog item after Slice 28 mall budget. Slice 28 Verifier **PASS** 2026-09-27 — this pack is next.

## Locked A–F (A1–F1)

| # | Choice | Meaning |
|---|---|---|
| A | **A1** | Wizard = primary Home CTA; Nytt pass + Starta från mall = quieter secondary |
| B | **B1** | Q1: 4–6 / 7–9 / Nybörjare / Träning · Q2: Satsbräda / Trampett / Tumbling / Blandat |
| C | **C1** | ~4 curated focus paths + light age filter; not full 4×4 matrix |
| D | **D1** | Q3 chooses preset **and** auto-places Teknik into matching zones |
| E | **E1** | Soft blank + two malls stay as escape/advanced |
| F | **F1** | MVP ship; defer full matrix / Använd-alla-on-finish / Pages; footer 29; preserve 22–28 |

---

## A. Home CTA layout? — **A1 locked**

| Option | Note |
|---|---|
| **A1 locked** | New primary card **Planera pass** / **Skapa pass** (wizard). Demote **Nytt pass** + **Starta från mall** to secondary row (same quiet chrome family as Hall/Golvklart secondary). **Fortsätt senaste** stays. | Makes template path standard without deleting escapes |
| A2 | Replace both cards with wizard only; blank/mall only behind “Avancerat” link | Cleaner; higher risk for coaches who want Soft blank in one tap |
| A3 | Keep today’s two primaries; add wizard as third equal card | Crowds Home; fails “template path = standard” |
| A4 | Wizard replaces only **Starta från mall**; Nytt pass stays primary | Weak — blank remains the default story |

**Rationale for A1:** Product vision says template path becomes standard, not that blank dies. Soft Samling (27) and mall browse (28) stay valuable escapes. Primary visual weight on wizard matches CoachVault “answer three questions” without boiling Home chrome.

**Copy sketch (Docs owns final):** Primary title e.g. **Planera pass** · desc **Tre frågor — färdigt pass med stationer på hallen.** Secondary: existing Nytt pass / Starta från mall strings (maybe slightly quieter desc).

---

## B. Question option sets (Swedish)? — **B1 locked**

### Q1 — Ålder / nivå

| Option set | Labels |
|---|---|
| **B1 locked** | **4–6 år** · **7–9 år** · **Nybörjare** · **Träning** |
| B2 | Only ålder bands: 4–6 · 7–9 · 10–12 · 13+ |
| B3 | Only nivå: Nybörjare · Fortsättning · Tävling |
| B4 | Merge into 3: Lek (4–6) · Nybörjare (7–9) · Träning |

**Rationale for B1:** Matches coach feedback language (age bands **and** nivå words). Four chips fit phone. MVP maps all four onto coach-safe seeds; “Träning” does not unlock experienced-only in Slice 29 (F).

### Q2 — Fokus redskap / tema

| Option set | Labels |
|---|---|
| **B1 locked** | **Satsbräda** · **Trampett** · **Tumbling** · **Blandat** |
| B2 | Add **Styrka** as fifth focus |
| B3 | Broader themes: Volt · Balans · Kondition · Blandat |
| B4 | Only apparatus: Satsbräda · Trampett · Tumbling (no Blandat) |

**Rationale for B1:** Focus drives **Teknik seed pick + zone placement**. Styrka is always a block in the complete pass — making it a Q2 exclusive steals apparatus→zone mapping. **Blandat** covers “no single apparatus” and maps to mixed snaps (beginner-like). Tumbling maps to floor/tumbling-tagged drills (flickis kudde etc.) even though seed tags say `floor` today.

**Q3 — Hallayout** (not controversial): existing presets only — **Standard trupp** · **Tävling / linjer** · **Liten hall** (`HALL_PRESET_ORDER`). No custom CAD.

---

## C. Matrix size / curated paths? — **C1 locked**

| Option | Note |
|---|---|
| **C1 locked** | **Four curated paths keyed by Q2 focus**; Q1 lightly filters duration/which new-coach Teknik (younger → softer trio). Hall (Q3) orthogonal. | Ships value; ~4 compositions to author + verify |
| C2 | Full 4×4 = 16 authored templates | Effort explosion; content debt; reject for MVP |
| C3 | Only 2 paths (reuse beginner + short) + re-place hall | Too thin — ignores focus question |
| C4 | Procedural pick from library by tags at runtime (no authored paths) | Flexible but harder to guarantee budgets + coach voice |

**Rationale for C1:** User ask + product vision: “curated paths not full combinatorial explosion.” Four focus paths × shared Soft Samling skeleton × age tweak is enough for Slice 29.

### Curated path sketch (Builder target if C1/B1)

Shared (all paths) — **stay ≤ budgets**:

| Block | Budget | Default items (sum) |
|---|---:|---|
| Samling | 6 | Närvaro 3 + Dagens pass 3 = **6** (Soft pair) |
| Uppvärmning | 10 | `warm-hall-varv` **10** = **10** (avoid short-mall 6+5=11) |
| Styrka | 15 | `strength-styrkelatar` 5 + `strength-burpee-emom` 8 = **13** |
| Lek | 10 | one fun seed ≤10 (e.g. rundpingis 6 or handstående-utmaning 5) |

Teknik by Q2 (sum ≤20, new-coach-ok):

| Focus | Teknik seeds (example) | Zone targets |
|---|---|---|
| Satsbräda | ljushopp-satsbrada · satsbrada-volt-rygg · handstaende-falla-rygg | vault · vault · open |
| Trampett | ljushopp-trampett · trampett-volt-mattberg · falla-bakat-hojd | trampett · trampett · open |
| Tumbling | flickis-kudde · handstaende-falla-rygg · falla-bakat-hojd | tumbling · open · open |
| Blandat | ljushopp-satsbrada · handstaende-falla-rygg · falla-bakat-hojd | vault · open · open |

**Age tweak (light):** 4–6 may drop the “volt” middle drill and use a second floor/ljushopp-safe item so progression stays gentle; 7–9 / Nybörjare use table as-is; Träning may keep three Teknik at 6+6+6. Docs/content table is source for exact IDs when locked.

**Hard risk — over-budget:** Do **not** copy short-mall warmup 11/10 into wizard paths. Gathering must stay Soft 6 (Slice 27–28 story).

**Hard risk — empty zones:** Focus paths intentionally leave non-focus apparatus zones empty. That is OK — “suggested in the right zone,” not “fill every zone.”

---

## D. Hall question = preset only vs auto-place? — **D1 locked**

| Option | Note |
|---|---|
| **D1 locked** | Q3 picks preset; finish **auto-places** every Teknik item into a zone from tag/focus map via `snapPlacement` / `upsertPlacement` | Matches Approved coach benefit |
| D2 | Q3 preset only; placements stay empty | Under-delivers Approved vision |
| D3 | Auto-place always on Standard trupp; skip Q3 | Loses hallayout question |
| D4 | Pre-place + also run Använd alla förslag | Scope creep; saknar banner already soft-helps; defer (F) |

**Tag → zone map (D1):**

| Seed tag / heuristic | ZoneId | Hall label |
|---|---|---|
| `vault` | `vault` | Satsbräda |
| `trampett` | `trampett` | Trampett |
| `floor` + flickis/rondat title/id | `tumbling` | Tumbling |
| `floor` otherwise | `open` | Öppen yta |
| fallback | `open` | Öppen yta |

Multi-chip same zone: existing `offsetFromSlot` in `snapPlacement`. Remap on later preset change already handled by `applyPreset`.

**Samling never placed** — `isPlaceableItem` unchanged.

---

## E. Soft blank + old malls? — **E1 locked**

| Option | Note |
|---|---|
| **E1 locked** | Keep **Nytt pass** (Soft Samling blank) + **Starta från mall** (two malls) as secondary/escape; wizard does not delete them | Preserves 27–28; advanced coaches keep one-tap blank |
| E2 | Hide mall browse; keep only Soft blank escape | Loses Slice 28 mall entry |
| E3 | Remove both; wizard-only Home actions (+ Fortsätt) | Fights Soft Samling standing path; reject unless he insists |
| E4 | Wizard finish can “also save as mall” | Out of scope |

**Rationale for E1:** Standing lock “Soft Samling still applies where blank path remains.” Blank path must remain. Old malls still valid for coaches who know them.

**Kom igång:** `chooseOrBuild` can scroll/focus wizard primary (Docs/Builder detail); do not invent a fifth checklist step unless needed.

---

## F. Out of scope / phased ship? — **F1 locked**

| Option | Note |
|---|---|
| **F1 locked** | MVP: 3 questions → one complete pass + Teknik placements; curated paths; no full matrix; no Använd-alla-on-finish; no Pages unless asked; preserve **22–28**; footer **Slice 29** |
| F2 | Also author full 4×4 matrix in same slice | Reject — Effort beyond one L loop |
| F3 | Also auto-fill redskap suggestions on every placed station | Defer; Slice 25 saknar + 19 Använd alla remain coach-driven |
| F4 | Also retire Soft blank / old malls | Reject — see E |

**Rejected:** F2/F3/F4 for this pack.

---

## Implementation sketch (Builder — after Docs, if A1/B1/C1/D1/E1)

```
// New: composeWizardSession({ age, focus, hallTemplateId })
// 1. Build five blocks from curated path table (Soft Samling + focus Teknik)
// 2. session.hallTemplateId = normalizeTemplateId(hallTemplateId)
// 3. For each Teknik session item:
//      zone = zoneForActivity(activityId)  // tag map
//      snap = snapPlacement(preset, zone.snap.x, zone.snap.y, occupied)
//      upsertPlacement(...)
// 4. saveDraft + navigate Passbyggaren (or Hallöversikt — recommend Passbyggaren first)

// Home.tsx
// primary → open wizard overlay/route
// secondary → onNew / onTemplate (unchanged handlers)

// createBlankSession / cloneTemplate — unchanged Soft + mall behavior
// footerSliceLabel → Slice 29
```

Prefer Passbyggaren as land screen (coach sees complete blocks); Hallöversikt one tap away with chips already placed (Kom igång place-step may auto-satisfy if ≥1 placement — Slice 26).

---

## Product risks (call out for Christoffer)

| Risk | Mitigation in pack |
|---|---|
| Empty non-focus zones look “broken” | Copy: stations suggested for **chosen focus**; other zones free to fill |
| Over-budget blocks (short warmup 11/10 precedent) | Curated paths must sum ≤ budget; checklist fails on default Över budget for wizard paths |
| Wizard feels heavy vs quiet chrome | 3 single-select steps; large tap targets; no extra essays |
| Soft blank “demoted” confuses returning coaches | E1 keeps Nytt pass visible as secondary |
| Pre-place fights “coach placed” culture | Placements editable; remove/move unchanged; Teknik-only |

---

## Approval record

**APPROVED 2026-09-27** — **A1/B1/C1/D1/E1/F1 locked**. Docs may start; Builder follows Docs.
