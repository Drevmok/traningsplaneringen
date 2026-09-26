# Slice 09 — coach tips & Kom igång (svenska)

**Status:** Docs lock — Christoffer approved Slice 09 (2026-09-24). **Slice 22** adds Kom igång collapse/expand + chrome layering — see section below. Builder may ship these keys.  
**Tone:** Warm, short, coach-to-coach. Prefer *du/ni*. No marketing superlatives.  
**Locked terms:** gymnaster · pass · övning · Hallöversikt · Golvklart · Erfaren · Passbyggaren · Kom igång · Redigera redskap · Visa tips igen  
**Out of scope:** nya teknikprogressioner, övningsbibliotek, CAD, blocking tour-copy.

Existing Slice 01 `EMPTY_TIPS` / Tips-flik and Slice 05–07 hall one-liners **stay**. These strings are additive dismissible chrome.

Keep hall caption exactly: **Schematisk hall — inte exakt mått**

**Slice 11:** Hall tips / Kom igång steg 3 say **Teknik-stationer** — not all pass övningar. See also [`hall-declutter.sv.md`](./hall-declutter.sv.md).
**Slice 12:** Placed stations are **markörer** (icon-first); tap for details. See [`station-tiles.sv.md`](./station-tiles.sv.md).
**Slice 13:** Hall detail can list **redskap**; CTA **Redigera redskap**. See [`station-compose.sv.md`](./station-compose.sv.md).
**Slice 16:** Kom igång gets a soft fifth step — discover **Redigera redskap**. See [`kom-igang-redskap.sv.md`](./kom-igang-redskap.sv.md). Supersedes “no fifth step” below.
**Slice 22:** Quieter Kom igång (collapse after progress) + progressive Hall hints info control. See [`copy-quieter-chrome.sv.md`](./copy-quieter-chrome.sv.md).
**Slice 26:** Place-step auto-progress = on-hall placement only (`placementCount >= 1`). Step 3 Swedish unchanged. See [`kom-igang-place-step.sv.md`](./kom-igang-place-step.sv.md).

---

## Kom igång (checklist card)

| Key | Swedish |
| --- | --- |
| `komIgangTitle` | Kom igång |
| `komIgangIntro` | Fem korta steg — från tomt pass till något du kan visa på golvet. |
| `komIgangStep1` | Välj eller bygg ett pass |
| `komIgangStep1Hint` | Börja tomt, från en mall, eller fortsätt ditt utkast. |
| `komIgangStep2` | Lägg till övningar i blocken |
| `komIgangStep2Hint` | Samling → Uppvärmning → Teknik → Styrka → Lek och spel. |
| `komIgangStep3` | Öppna Hallöversikt och placera stationer |
| `komIgangStep3Hint` | Dra Teknik-stationerna ungefär dit ni brukar vara i hallen. |
| `komIgangStepCompose` | Ange redskap på Teknik-stationerna |
| `komIgangStepComposeHint` | Tryck en markör och välj **Redigera redskap**. |
| `komIgangStepComposeHintShort` | Tryck markör, välj Redigera redskap. |
| `komIgangStep4` | Använd Golvklart på golvet |
| `komIgangStep4Hint` | Visa gruppen — eller skriv ut. Schemat är inte exakta mått. |
| `komIgangProgress` | {done} av {total} klart |
| `komIgangDismiss` | Dölj Kom igång |
| `komIgangDismissAlt` | Jag klarar mig |
| `komIgangNeedActivity` | Lägg till minst en övning först |
| `komIgangNeedHall` | Öppna Hallöversikt när du har övningar i passet |
| `komIgangNeedComposeHall` | Öppna Hallöversikt när du har övningar i passet |
| `komIgangAllDone` | Snyggt — du har gått hela vägen till golvet. |
| `komIgangAllDoneHint` | Du kan visa tips igen under **Visa tips igen**. |

- Primary dismiss label: **Dölj Kom igång**. **Jag klarar mig** is an allowed alternate (same action).
- `komIgangNeedActivity` matches the Hallöversikt disabled-CTA sense (`hallCtaDisabled`).
- **Slice 16:** Five soft steps (place → **Ange redskap** → Golvklart). Soft only — never block Golvklart. Compose auto-progress when any non-empty saved `stationEquipment`. Full lock: [`kom-igang-redskap.sv.md`](./kom-igang-redskap.sv.md).
- **Slice 26:** Step 3 (`openHallAndPlace`) checks only after ≥1 Teknik on the schematic — not open-only. `komIgangStep3` / `komIgangStep3Hint` **unchanged**. Full lock: [`kom-igang-place-step.sv.md`](./kom-igang-place-step.sv.md).
- Slice 09 “Do not invent a fifth step” is **superseded** by the Slice 16 Approved step.

---

## Visa tips igen

| Key | Swedish |
| --- | --- |
| `visaTipsIgen` | Visa tips igen |
| `visaTipsIgenDone` | Tips visas igen |
| `visaTipsIgenAlready` | Tips syns redan |

Quiet link on Home or near app footer — not a settings page.

---

## Contextual tips

### Passbyggaren — `tip-builder-empty`

| Key | Swedish |
| --- | --- |
| `tipBuilderEmpty` | Tomt pass? Börja från en mall, eller lägg till en övning i ett block. Under **Tips** finns korta råd per block. |
| `tipBuilderEmptyShort` | Börja från mall eller lägg till en övning. Mer råd under Tips. |

Keep existing (do not replace):

- Top bar: `Ny som tränare? Börja från en mall`
- Block `EMPTY_TIPS` / Tips-flik `TIPS_TAB` from Slice 01

### Hallöversikt placement — `tip-hall-place`

| Key | Swedish |
| --- | --- |
| `tipHallPlace` | Placera Teknik-stationerna ungefär där ni brukar köra dem. De visas som små markörer — tryck för detaljer och redskap. Släpp på en zon för att fästa; på öppen yta kan du placera fritt. |

Prefer one dismissible paragraph. Keep always-on one-liners if useful:

- `Dra Teknik-stationer till hallen. Placeringen sparas med utkastet.`
- `Släpp på en zon för att fästa stationen där. På öppen yta kan du placera fritt.`

Do not leave three redundant paragraphs visible at once. After first Teknik place, Slice 22 hides multi-line Hall instructional paragraphs behind the info control ([`copy-quieter-chrome.sv.md`](./copy-quieter-chrome.sv.md)).


Optional after first hall detail (Slice 13):

| Key | Swedish |
| --- | --- |
| `tipStationCompose` | Redigera redskapen ni faktiskt använder. Det sparas i utkastet och syns när du trycker på markören. |

### Flow / Golvklart — `tip-hall-flow-golvklart`

| Key | Swedish |
| --- | --- |
| `tipHallFlowGolvklart` | Siffrorna följer Teknik-stationernas ordning i passet, inte var markörerna står i hallen. **Golvklart** är till för att visa gruppen — skriv ut eller håll upp skärmen. |

Always-on OK: `Stationsordning följer passet`

Wire/adapt existing `hallFloorCoachTip` to this wording.

### Optional Erfaren — `tip-experienced-safety`

| Key | Swedish |
| --- | --- |
| `tipExperiencedSafety` | **Erfaren** betyder aktiv spotting och rätt uppbyggnad. Lägg bara in om du (eller en kollega) kan leda säkert — du kan fortfarande välja övningen medvetet. |

Do **not** add new drills, cues, or progression lists. Echo existing safety language only.

---


---

## Slice 22 — quieter Kom igång + chrome layering

Once checklist progress > 0 **or** the coach previously collapsed the card, default next Home visit to a **collapsed** summary. Brand-new 0/n stays expanded. Collapse does not change step semantics or heuristics.

Full lock: [`copy-quieter-chrome.sv.md`](./copy-quieter-chrome.sv.md). Companion step wording: [`kom-igang-redskap.sv.md`](./kom-igang-redskap.sv.md).

| Key | Swedish |
| --- | --- |
| `komIgangExpand` | Visa steg |
| `komIgangCollapse` | Dölj steg |
| `komIgangExpandAria` | Visa alla Kom igång-steg |
| `komIgangCollapseAria` | Dölj stegen och visa bara sammanfattning |

Collapsed summary reuses `komIgangTitle` (**Kom igång**) + `komIgangProgress` (`{done} av {total} klart`). Keep `komIgangDismiss` / `komIgangDismissAlt` / `visaTipsIgen` unchanged.

**Layering (C1):** At most one of tip strip / status banner / multi-line Hall hints. On Home: brand-new 0/n prefers expanded Kom igång over stacking a tip strip; once progress > 0, collapsed summary + tip strip OK as the single teaching layer. Hall info control stays available when tip strip suppresses multi-line hints.

**Do not** invent a new required tip for “hints moved” or quieter chrome.

## Shared chrome

| Key | Swedish |
| --- | --- |
| `tipDismiss` | Dölj tips |
| `tipDismissAria` | Dölj det här tipset |
| `tipInfoAria` | Visa tränartips |
| `tipClose` | Stäng |

---

## Kort principer

1. Each tip ≤ ~2 short sentences so it fits a phone strip.
2. Soft guidance only — never copy that blocks Passbyggaren, Hallöversikt, or Golvklart.
3. Hide tip chrome in print CSS and prefer hide in Golvklart floor mode.
4. Vocabulary lock: gymnaster, pass, övning — never aktiva/elever/session as product words.

---

## Notes for Builder

- Prefer these strings over inventing synonyms (“Kom igång-guide”, “Floor ready tips”, “Tour”).
- Checklist step order: Slice 16 A–F (5 steps; soft Golvklart). Wording here + [`kom-igang-redskap.sv.md`](./kom-igang-redskap.sv.md).
- Place-step heuristic: Slice 26 — [`kom-igang-place-step.sv.md`](./kom-igang-place-step.sv.md). Do not invent new step-3 synonyms.
- Keep `tipStationCompose` as-is (Slice 16 locked C).
- Slice 09 base + Slice 16 compose step; Erfaren tip optional if time-boxed.
