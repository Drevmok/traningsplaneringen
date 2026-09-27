# Slice 29 — screen spec (DRAFT · recommended A–F)

**Status:** **DRAFT** — behavior follows recommended A1/B1/C1/D1/E1/F1 until Christoffer locks. Docs → Builder → Verifier only after APPROVED.  
**Viewport focus:** Home (~390px phone + desktop) · wizard steps · Passbyggaren after finish · Hallöversikt placements.

## 1) Home — primary CTA (recommended A1)

```
BEFORE (post Slice 28):
  [➕ Nytt pass]          ← primary
  [📋 Starta från mall]
  [📝 Fortsätt senaste]
  (secondary Hall / Golvklart when draft)

AFTER (A1):
  [✨ Planera pass]       ← primary (opens wizard)
       Tre frågor — färdigt pass med stationer på hallen.
  [➕ Nytt pass]          ← secondary escape (Soft Samling blank)
  [📋 Starta från mall]   ← secondary escape (two malls)
  [📝 Fortsätt senaste]
  (secondary Hall / Golvklart when draft — unchanged)
```

**If A2:** Only wizard + Fortsätt (+ advanced link).  
**If A3:** Three equal primaries — avoid.

Honesty aside + Öppna på telefon (Slice 23) + Visa tips igen: **unchanged**.

## 2) Wizard — three questions (recommended B1)

```
Step 1/3 — Ålder / nivå
  [ 4–6 år ] [ 7–9 år ] [ Nybörjare ] [ Träning ]
  (single select; Next enabled after pick; Back → Home)

Step 2/3 — Fokus
  [ Satsbräda ] [ Trampett ] [ Tumbling ] [ Blandat ]
  (single select)

Step 3/3 — Hallayout
  [ Standard trupp ] [ Tävling / linjer ] [ Liten hall ]
  (labels from hallPresets; short hint: stations fäster i zon)

Finish CTA: Skapa pass → compose + pre-place → Passbyggaren
Cancel / Stäng: discard wizard answers; no draft overwrite unless finish
```

Quiet chrome: large tap targets; progress `1 / 3`; no long essays. Swedish only.

## 3) Compose result — complete pass (recommended C1)

All five blocks filled. Example **Blandat** / Nybörjare (mirrors Soft + beginner Teknik spirit):

```
Samling     Närvaro 3 + Dagens pass 3     = 6 / 6   (no Över budget)
Uppvärmning warm-hall-varv 10             = 10 / 10
Teknik      3 × ~6 min new-coach seeds    ≤ 20 / 20
Styrka      styrkelatar 5 + burpee 8      = 13 / 15
Lek         one fun ≤ 10                  ≤ 10 / 10
```

Focus paths swap Teknik set (see `decisions.md` / content path table).  
**Must not** ship default wizard paths with gathering or warmup already Över budget.

Land: **Passbyggaren** with session title from path (e.g. `Pass — trampett` / Docs-owned). Editable like any draft.

## 4) Hall pre-place (recommended D1)

```
On finish:
  hallTemplateId = Q3 selection
  for each Teknik item:
    zoneId = mapActivityToZone(activityId)
    placement = snap into zone snap slot (+ multi-chip offset)
  hallPlacements = [...placed Teknik]
  non-Teknik items: never placed
```

| Focus example | Expected chips |
|---|---|
| Satsbräda | ≥1 chip in **Satsbräda** zone |
| Trampett | ≥1 chip in **Trampett** zone |
| Tumbling | ≥1 chip in **Tumbling** (or open if map says so for floor) |
| Blandat | mixed — at least vault and/or open |

Empty non-focus zones: **OK**. Coach can move/remove; preset switch remaps via existing `applyPreset`.

Hallöversikt after finish: tray unplaced count **0** if all Teknik placed; Kom igång place-step can complete (Slice 26) when ≥1 placement exists.

## 5) Escape paths (recommended E1)

| Action | Behavior |
|---|---|
| Nytt pass | `createBlankSession()` Soft Samling 3+3; empty placements; **unchanged** Slice 27 |
| Starta från mall | Template picker → cloneTemplate; placements cleared as today; Slice 28 gathering intact |
| Fortsätt | loadDraft unchanged |
| Wizard cancel | no session replace |

## 6) Controls that must still work

| Control | Behavior |
|---|---|
| Wizard finish | Complete pass + placements + Passbyggaren |
| Nytt pass | Soft blank intact |
| Starta från mall → Nybörjare / Kort | Slice 28 behavior |
| Hall place / move / remove | Unchanged |
| Förråd / saknar / Använd alla / Golvklart | Unchanged 22–26 |
| Teknik-only placeable | Unchanged |
| Caption | Schematisk hall — inte exakt mått |

## Surfaces that must not change

| Surface | |
|---|---|
| Soft blank inject / gathering budget 6 | Slice 27–28 preserved on blank/mall paths |
| Quiet Home honesty / phone aside | Slice 22–23 |
| CAD / cloud / accounts | Still absent |
| Full CoachVault matrix | Not introduced (F1) |

## Footer

When Builder ships: `Träningsplaneraren · Slice 29`.
