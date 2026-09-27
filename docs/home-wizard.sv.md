# Home 3-question wizard — svensk Docs (Slice 29)

**Status:** Docs lock — Christoffer approved A1/B1/C1/D1/E1/F1 (2026-09-27). Builder may ship from these keys.  
**Tone:** Warm, short, coach-to-coach. Prefer *du*. Quiet chrome — three chips, no essays.  
**Product lock:** Home primary CTA **Planera pass** opens a 3-question wizard (ålder/nivå → fokus → hallayout) and finishes into a **complete pass** with **Teknik** pre-placed in matching zones. Soft blank **Nytt pass** and **Starta från mall** stay as quieter escapes. Stations are **proposals** for the chosen focus — empty non-focus zones are OK.  
**Carry-forward:** Quiet chrome (22). Home polish secondary Hall/Golvklart + Öppna på telefon (23). Förråd / saknar / place-step (24–26). Soft Samling blank (27). Mall Samling budget (28).  
**Locked terms:** gymnaster · pass · övning · Samling · Uppvärmning · Teknik · Styrka · Lek och spel · Passbyggaren · Hallöversikt · Golvklart · Förrådslista · Redigera redskap · Starta från mall · Kom igång · Använd alla förslag · Nytt pass · Nybörjare  
**Keep hall caption exactly:** **Schematisk hall — inte exakt mått**  
**Out of scope copy:** seed selection math · placement algorithms · full age×focus matrix · Använd-alla-on-finish · Pages/Netlify · Soft blank inject rewrite · mall gathering rewrite · CAD/cloud/accounts · app code in this Docs pass

Pack mirror: [`slice-29/content/home-wizard.sv.md`](../slice-29/content/home-wizard.sv.md).  
Living companions: [`copy-home-polish.sv.md`](./copy-home-polish.sv.md) · [`ui-chrome.sv.md`](./ui-chrome.sv.md) · [`hall-presets-copy.sv.md`](./hall-presets-copy.sv.md) · [`soft-samling.sv.md`](./soft-samling.sv.md) · [`mall-samling-budget.sv.md`](./mall-samling-budget.sv.md).

---

## Locked answers (Docs-facing)

| # | Lock |
| --- | --- |
| **A1** | Wizard = **primary** Home CTA (**Planera pass**); **Nytt pass** + **Starta från mall** = quieter secondary escapes; **Fortsätt senaste pass** stays |
| **B1** | Q1: **4–6 år** · **7–9 år** · **Nybörjare** · **Träning** · Q2: **Satsbräda** · **Trampett** · **Tumbling** · **Blandat** · Q3: existing presets **Standard trupp** · **Tävling / linjer** · **Liten hall** |
| **C1** | ~4 curated focus paths + light age filter; not full 4×4 matrix |
| **D1** | Q3 picks preset **and** finish auto-places Teknik into matching zones (tag → zone map) |
| **E1** | Soft blank + two malls remain escape/advanced — handlers unchanged |
| **F1** | MVP only; no full matrix / Använd-alla-on-finish / Pages unless asked; preserve 22–28; footer **Slice 29** |

---

## Intent

Från Hem svarar du på tre korta frågor och får ett **färdigt pass** där **Teknik** redan ligger i rätt zon på vald hallayout. Tomt golv är inte längre standardvägen — men Soft blank och mallarna finns kvar om du vill dem.

---

## Home CTA layout (A1 / E1)

```
[✨ Planera pass]          ← primary (opens wizard)
     Tre frågor — färdigt pass med stationer på hallen.
[➕ Nytt pass]             ← secondary escape (Soft Samling blank)
[📋 Starta från mall]      ← secondary escape (two malls)
[📝 Fortsätt senaste pass]
(secondary Hallöversikt / Golvklart when draftExists — Slice 23 unchanged)
```

Honesty aside + **Öppna på telefon** + **Visa tips igen**: unchanged ([`copy-home-polish.sv.md`](./copy-home-polish.sv.md) · [`distribution-copy.sv.md`](./distribution-copy.sv.md)).

### Primary — Planera pass

| Key | Swedish |
| --- | --- |
| `homeWizardPrimary` | Planera pass |
| `homeWizardPrimaryDesc` | Tre frågor — färdigt pass med stationer på hallen. |
| `homeWizardPrimaryAria` | Planera pass med tre frågor |

### Secondary escapes — keep locked labels (E1)

| Key | Swedish | Note |
| --- | --- | --- |
| `newSession` | Nytt pass | Soft Samling blank — [`soft-samling.sv.md`](./soft-samling.sv.md) |
| `newSessionDesc` | Börja tomt med Samling. | Optional quieter desc under secondary card |
| `startFromTemplate` | Starta från mall | Two malls — Slice 28 gathering intact |
| `startFromTemplateDesc` | Välj Nybörjare eller Kort. | Optional quieter desc |
| `continueDraft` | Fortsätt senaste pass | Unchanged |

Do **not** invent synonyms (“Skapa från noll”, “Wizard”, “Smart start”, “Öppna hall”).  
Do **not** hide or delete **Nytt pass** / **Starta från mall**.

### Optional Home invite (quiet align)

| Key | Swedish |
| --- | --- |
| `homeInvite` | Tre frågor ger dig ett färdigt pass. Du kan fortfarande börja tomt eller från mall. |

Replaces the older “Börja med en mall…” invite when Builder wires A1. Prefer this over inventing a fifth Kom igång step.

### Slice 23 secondary when draftExists

When `draftExists`, **Hallöversikt** + **Golvklart** stay as secondary under the start cards — keys and flash hints unchanged (`homeOpenHall*`, `homeOpenGolvklart*`, `komIgangNeedActivity`, `komIgangNeedHall`). Authoritative: [`copy-home-polish.sv.md`](./copy-home-polish.sv.md).

---

## Wizard — three questions (B1)

Quiet chrome: large tap targets; single select; Next after pick; Back on step 1 → Home; Cancel/Stäng discards answers (no draft overwrite until finish). Swedish only.

| Key | Swedish |
| --- | --- |
| `wizardStepProgress` | Fråga {n} av 3 |
| `wizardBack` | Tillbaka |
| `wizardNext` | Nästa |
| `wizardCancel` | Avbryt |
| `wizardClose` | Stäng |
| `wizardFinish` | Skapa pass |

### Q1 — Ålder / nivå

| Key | Swedish |
| --- | --- |
| `wizardQ1Label` | Ålder / nivå |
| `wizardQ1Age46` | 4–6 år |
| `wizardQ1Age79` | 7–9 år |
| `wizardQ1Beginner` | Nybörjare |
| `wizardQ1Training` | Träning |

### Q2 — Fokus redskap / tema

| Key | Swedish |
| --- | --- |
| `wizardQ2Label` | Fokus |
| `wizardQ2Vault` | Satsbräda |
| `wizardQ2Trampett` | Trampett |
| `wizardQ2Tumbling` | Tumbling |
| `wizardQ2Mixed` | Blandat |

### Q3 — Hallayout (reuse locked presets)

| Key | Swedish |
| --- | --- |
| `wizardQ3Label` | Hallayout |
| `wizardQ3Hint` | Välj den layout som liknar er hall. Teknik fäster i zon efter fokus. |
| `hallPresetStandard` | Standard trupp |
| `hallPresetTavling` | Tävling / linjer |
| `hallPresetLiten` | Liten hall |

Reuse existing preset keys/labels from [`hall-presets-copy.sv.md`](./hall-presets-copy.sv.md). Do **not** invent new hall names.

---

## Honesty — focus proposals, empty zones OK

| Key | Swedish |
| --- | --- |
| `wizardFocusHonesty` | Stationerna är förslag för ditt valda fokus. Andra zoner kan vara tomma — det är ok. |

Show once near Q2, Q3 hint, or after finish on Hallöversikt (muted one-liner). Do **not** promise that every zone is filled. Do **not** say “fyller hela hallen”.

---

## Finish → compose + pre-place (C1 / D1)

| Control | Behavior |
| --- | --- |
| **Skapa pass** | Compose curated path → apply Q3 preset → auto-place Teknik → save draft → land **Passbyggaren** |
| Cancel / Stäng | Discard wizard answers; no session replace |
| Land | Passbyggaren (all five blocks filled); Hallöversikt one tap away with chips placed |

### Session title (Docs-owned pattern)

| Key / pattern | Swedish |
| --- | --- |
| `wizardSessionTitle` | Pass — {fokus} |

Examples: `Pass — satsbräda` · `Pass — trampett` · `Pass — tumbling` · `Pass — blandat`. Editable like any draft title.

### Shared skeleton (all focus paths) — stay ≤ budgets

| Block | Budget | Default items (sum) |
| --- | ---: | --- |
| Samling | 6 | Närvaro 3 + Dagens pass 3 = **6** (Soft pair) |
| Uppvärmning | 10 | `warm-hall-varv` **10** = **10** (**not** short-mall 6+5=11) |
| Styrka | 15 | `strength-styrkelatar` 5 + `strength-burpee-emom` 8 = **13** |
| Lek | 10 | one fun seed ≤10 |

### Teknik by Q2 (sum ≤20, new-coach-ok) — curated path table

| Focus | Teknik seeds (example) | Zone targets |
| --- | --- | --- |
| Satsbräda | ljushopp-satsbrada · satsbrada-volt-rygg · handstaende-falla-rygg | vault · vault · open |
| Trampett | ljushopp-trampett · trampett-volt-mattberg · falla-bakat-hojd | trampett · trampett · open |
| Tumbling | flickis-kudde · handstaende-falla-rygg · falla-bakat-hojd | tumbling · open · open |
| Blandat | ljushopp-satsbrada · handstaende-falla-rygg · falla-bakat-hojd | vault · open · open |

**Age tweak (light, Builder):** 4–6 år may drop the “volt” middle drill for a gentler new-coach-ok item; 7–9 / Nybörjare use table as-is; Träning may keep three Teknik at ~6+6+6. Exact IDs are Builder-owned from this table — Docs does not invent new seeds.

**Hard rules:** Wizard defaults must **not** open with Samling or Uppvärmning **Över budget**. Gathering stays Soft 6. Do **not** reuse short-mall warmup 11/10.

---

## Tag → zone map (D1)

| Seed tag / heuristic | zoneId | Hall label |
| --- | --- | --- |
| `vault` | `vault` | Satsbräda |
| `trampett` | `trampett` | Trampett |
| `floor` + flickis/rondat title/id | `tumbling` | Tumbling |
| `floor` otherwise | `open` | Öppen yta |
| fallback | `open` | Öppen yta |

- Multi-chip same zone: existing `offsetFromSlot` / `snapPlacement`.  
- Remap on later preset change: existing `applyPreset`.  
- **Samling never placed** — `isPlaceableItem` unchanged (Teknik-only).  
- Empty non-focus zones: **OK** (honesty copy above).

---

## Escapes unchanged (E1)

| Action | Behavior |
| --- | --- |
| Nytt pass | `createBlankSession()` Soft Samling 3+3; empty placements — Slice 27 |
| Starta från mall | Template picker → `cloneTemplate`; Slice 28 gathering intact |
| Fortsätt senaste pass | `loadDraft` unchanged |
| Wizard cancel | no session replace |

---

## Footer (F1)

| Key | Swedish |
| --- | --- |
| `footerSliceLabel` | Träningsplaneraren · Slice 29 |

Keep footer `no-print`. Ship when Builder lands the wizard. Docs owns the string; Builder wires.

---

## Builder contract (document only — do not implement in Docs)

```
// composeWizardSession({ age, focus, hallTemplateId })
// 1. Build five blocks from curated path table (Soft Samling + focus Teknik)
// 2. session.hallTemplateId = normalizeTemplateId(hallTemplateId)
// 3. For each Teknik item: zone = mapActivityToZone(activityId); snap + upsertPlacement
// 4. saveDraft + navigate Passbyggaren

// Home.tsx — primary → wizard; secondary → onNew / onTemplate (unchanged)
// createBlankSession / cloneTemplate — Soft + mall behavior unchanged
// footerSliceLabel → Slice 29
```

| Do | Do not |
| --- | --- |
| Wire keys above into `blockMeta` (or equivalent) | Invent synonyms or new hall names |
| Curated paths ≤ block budgets (warmup ≤10) | Ship Över budget defaults on Samling/warmup |
| Pre-place Teknik only via tag→zone map | Place Samling / warmup / styrka / lek |
| Keep Nytt pass + Starta från mall visible | Delete Soft blank or old malls |
| Preserve quiet Home honesty / phone / Hall·Golvklart secondary | Expand Kom igång with a fifth wizard step unless needed |
| `footerSliceLabel` → Slice 29 | Full 4×4 matrix · Använd-alla-on-finish · Pages unless asked |

---

## Preserve / do-not-touch (Slices 22–28)

| Slice | Keep |
| --- | --- |
| 22 | Quieter chrome — no tip-strip / chrome invent |
| 23 | Secondary Hallöversikt + Golvklart when `draftExists`; Öppna på telefon + honesty |
| 24–26 | Förråd soft path · saknar banner · place-step heuristic |
| 27 | Soft blank inject on **Nytt pass** only; gathering budget **6** |
| 28 | Nybörjare mall Soft pair ≤6; short mall leave alone |
| Caption | **Schematisk hall — inte exakt mått** |
| Placeable | Teknik-only |

---

## Do not ship (Docs / Builder this pack)

- Full CoachVault age×focus matrix (C2)  
- Auto **Använd alla förslag** on wizard finish  
- Changing Soft blank inject or Slice 28 mall gathering  
- New hall preset names or CAD  
- Cloud / accounts / sync wording  
- Migrating existing drafts  
- Netlify / Pages republish unless Christoffer asks  
- App code in the Docs pass

---

## Builder checklist (after Docs)

1. Home primary **Planera pass** + desc; secondary **Nytt pass** / **Starta från mall** (E1).  
2. Wizard Q1–Q3 labels match B1; Q3 reuses hall preset labels.  
3. Finish → complete pass + Teknik pre-place + Passbyggaren; honesty one-liner present.  
4. Curated paths ≤ budgets; Soft Samling 6; warmup ≤10.  
5. Soft blank + malls intact; Slice 23 Hall/Golvklart when draft intact.  
6. `footerSliceLabel` → `Träningsplaneraren · Slice 29`.  
7. Preserve 22–28; self-smoke via `verify-traningsplaneraren/`.
