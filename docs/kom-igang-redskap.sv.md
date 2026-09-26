# Kom igång — discover Redigera redskap (Slice 16)

**Status:** Docs lock — Christoffer approved Slice 16 (2026-09-25). **Slice 22** adds collapse/expand chrome only. **Slice 26** tightens place-step auto-progress (placement-only); step 3 Swedish **unchanged** — see [`kom-igang-place-step.sv.md`](./kom-igang-place-step.sv.md). Builder may ship from these keys.  
**Tone:** Warm, short, coach-to-coach. Prefer *du/ni*. No marketing superlatives.  
**Product lock:** Soft Home **Kom igång** discoverability for **Redigera redskap**. New soft checklist step (**5 total**) between place and Golvklart. Auto-progress when any saved non-empty `stationEquipment`. **Never** block Golvklart. Tip strip keeps `tipStationCompose` as-is. No Home visual redesign beyond copy/checklist/progress.  
**Carry-forward:** Compose CTA stays **Redigera redskap** (hall detail only — Slice 13). Floor quiet / Förrådslista unchanged (Slices 14–15).  
**Locked terms:** gymnaster · pass · övning · station / stationer · markör · redskap · Hallöversikt · Golvklart · Erfaren · Passbyggaren · Kom igång · Redigera redskap · Förrådslista · Visa tips igen  
**Keep hall caption exactly:** **Schematisk hall — inte exakt mått**  
**Out of scope copy:** CAD, badge, Passbyggaren-compose, hard Golvklart gate, broader förslag catalog, Netlify, accounts, custom “eget redskap”.

**Supersedes** Slice 09 “Do not invent a fifth step” for this Approved idea.  
**Authority merge:** Living Kom igång / tip keys also live in [`coach-tips.sv.md`](./coach-tips.sv.md). This file is the Slice 16 lock + companion.

---

## Locked answers (A–F)

| # | Topic | Lock |
| --- | --- | --- |
| A | Step shape | **New soft checklist step** (5 total) between place and Golvklart |
| B | Auto-progress | **Any non-empty saved `stationEquipment`** |
| C | Tip strip | **Keep `tipStationCompose` as-is** |
| D | Gate | **Soft only — never block Golvklart** |
| E | Footer | **Träningsplaneraren · Slice 16** |
| F | Home visuals | **No** redesign beyond copy/checklist/progress |

---

## Kom igång — intro & progress

| Key | Swedish | Notes |
| --- | --- | --- |
| `komIgangTitle` | Kom igång | Unchanged |
| `komIgangIntro` | Fem korta steg — från tomt pass till något du kan visa på golvet. | Was “Fyra …” |
| `komIgangProgress` | {done} av {total} klart | Pattern unchanged; `total` → **5** |
| `komIgangDismiss` | Dölj Kom igång | Unchanged |
| `komIgangDismissAlt` | Jag klarar mig | Unchanged |
| `komIgangNeedActivity` | Lägg till minst en övning först | Unchanged |
| `komIgangNeedHall` | Öppna Hallöversikt när du har övningar i passet | Unchanged; reuse when new step is disabled |
| `komIgangNeedComposeHall` | Öppna Hallöversikt när du har övningar i passet | Alias OK — same disabled reason |
| `komIgangAllDone` | Snyggt — du har gått hela vägen till golvet. | Floor-focused; do not imply a redskap gate |
| `komIgangAllDoneHint` | Du kan visa tips igen under **Visa tips igen**. | Unchanged |

Do **not** ship all-done copy that implies Golvklart was blocked until redskap.

---

## Steps 1–3 (carry-forward)

| Key | Swedish | Notes |
| --- | --- | --- |
| `komIgangStep1` | Välj eller bygg ett pass | Unchanged |
| `komIgangStep1Hint` | Börja tomt, från en mall, eller fortsätt ditt utkast. | Unchanged |
| `komIgangStep2` | Lägg till övningar i blocken | Unchanged |
| `komIgangStep2Hint` | Samling → Uppvärmning → Teknik → Styrka → Lek och spel. | Unchanged |
| `komIgangStep3` | Öppna Hallöversikt och placera stationer | Unchanged — placera = on-hall (Slice 26) |
| `komIgangStep3Hint` | Dra Teknik-stationerna ungefär dit ni brukar vara i hallen. | Unchanged — drag/place on hall; redskap lives in step 4 |

---

## New step 4 — Ange redskap (locked A)

| Key | Swedish | Notes |
| --- | --- | --- |
| `komIgangStepCompose` | Ange redskap på Teknik-stationerna | New visible step label |
| `komIgangStepComposeHint` | Tryck en markör och välj **Redigera redskap**. | Must name locked CTA |
| `komIgangStepComposeHintShort` | Tryck markör, välj Redigera redskap. | If space is tight |

Checklist key (Builder): e.g. `composeStationEquipment` (internal; not shown to coach).

**Step order:** after place (step 3), before Golvklart (step 5).

**CTA:** opens **Hallöversikt** — soft path; coach completes compose in hall detail. No Home deep-link past hall detail. No Passbyggaren compose.

**Auto-progress (locked B):** any non-empty **saved** `stationEquipment` on the draft. Do **not** count unset, `[]`, or förslag / `defaultStationEquipment` alone.

---

## Step 5 — Golvklart (was step 4)

| Key | Swedish | Notes |
| --- | --- | --- |
| `komIgangStep4` | Använd Golvklart på golvet | Keep label; UI order becomes step 5 |
| `komIgangStep4Hint` | Visa gruppen — eller skriv ut. Schemat är inte exakta mått. | Keep honesty; no “must compose first” |

**Hard:** Do **not** disable Golvklart because compose is unchecked. Do **not** ship “Ange redskap först” as a blocking reason.

---

## Tip strip (locked C — keep as-is)

| Key | Swedish |
| --- | --- |
| `tipStationCompose` | Redigera redskapen ni faktiskt använder. Det sparas i utkastet och syns när du trycker på markören. |

- Soft dismissible; Home checklist does not replace this.  
- Do not add a second Home-only compose tip.  
- Do not strengthen or retire in this slice.

---


---

## Slice 22 — collapse does not change steps

Slice 22 quiets the card chrome (collapsed summary after progress > 0 or prior collapse; 0/n stays expanded). **Step labels, hints, order, and soft Golvklart gate are unchanged by Slice 22.** No saknar-redskap copy here. Place-step heuristic → Slice 26 ([`kom-igang-place-step.sv.md`](./kom-igang-place-step.sv.md)).

| Key | Swedish |
| --- | --- |
| `komIgangExpand` | Visa steg |
| `komIgangCollapse` | Dölj steg |
| `komIgangExpandAria` | Visa alla Kom igång-steg |
| `komIgangCollapseAria` | Dölj stegen och visa bara sammanfattning |

Summary reuses `komIgangTitle` + `komIgangProgress`. Full lock: [`copy-quieter-chrome.sv.md`](./copy-quieter-chrome.sv.md).

## Slice 26 — place step needs real placement

**Placera** in step 3 means on-hall placement of ≥1 Teknik-markör — not merely opening Hallöversikt. User-facing `komIgangStep3` / `komIgangStep3Hint` stay **unchanged** (already clear). Full Docs lock: [`kom-igang-place-step.sv.md`](./kom-igang-place-step.sv.md).

**Builder heuristic (A1/B1):**
- `syncChecklistHeuristics` advances `openHallAndPlace` only when `placementCount >= 1`.
- `markOpenedHall` may set `openedHall`; must **not** alone set `openHallAndPlace: true`.
- Legacy already-true left as-is (no regress). Soft — never block Hallöversikt / Golvklart.
- Compose remains a separate Slice 16 step — do not require `stationEquipment` to check place.

Footer when Slice 26 ships: `Träningsplaneraren · Slice 26` (see place-step Docs). No saknar banner (Slice 25). No tip strip.

---

## Footer (locked E — Slice 16 ship marker)

| Key | Swedish |
| --- | --- |
| `footerSliceLabel` | Träningsplaneraren · Slice 16 |

Keep footer `no-print`. Later slices override the footer ship marker (Slice 26 → `Träningsplaneraren · Slice 26`).

---

## Unchanged locks (copy)

- Visa tips igen / tip dismiss chrome  
- Detail: **Redskap** · **Redigera redskap** · empty/förslag from Slice 13  
- Floor under-markör format from Slice 14  
- Förrådslista from Slice 15  
- Caption: **Schematisk hall — inte exakt mått**  
- No Passbyggaren “Redigera redskap” entry copy  
- No canvas “har redskap” badge copy  
- Broader förslag = Slice 18 ([`station-compose.sv.md`](./station-compose.sv.md) drill table)
- Golvklart short titles = Slice 17 ([`golvklart-short-titles.sv.md`](./golvklart-short-titles.sv.md))  
- No Home illustration / accent redesign (locked F)

---

## Do not ship

- Hard gate “måste ange redskap innan Golvklart”  
- Implying Kom igång opens compose without going through hall detail  
- Custom “eget redskap” / inventory stock language  
- CAD / exakta mått / Netlify / konton language  
- English “Get started equipment tour” as primary chrome  
- Fifth **placeable** block or new library piece names  
- Idea 1 selective-förslag catalog (shipped Slice 18 — do not re-seed here) / idea 3 was Slice 17  
- Extend-copy-only / 4-step variant (A locked new step)

---

## Notes for Builder

- Prefer these strings over inventing synonyms (“Kom igång-guide”, “Equipment checklist tour”).  
- Wire new checklist key + `CHECKLIST_TOTAL = 5`.  
- Compose heuristic: non-empty saved `stationEquipment` only (locked B).  
- Place heuristic (Slice 26): `openHallAndPlace` only when `placementCount >= 1` — see [`kom-igang-place-step.sv.md`](./kom-igang-place-step.sv.md).  
- Golvklart path stays soft (locked D).  
- Living keys also merged in [`coach-tips.sv.md`](./coach-tips.sv.md). This file is the Slice 16 companion lock.
