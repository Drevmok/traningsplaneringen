# Slice 46 — microcopy (Swedish): startsidan och Planera pass

**Status:** PROPOSED 2026-10-17, written against ★ (A1, B1, C1, D1, E1, F1). Warm, du-form, no exclamation marks. Locked terms unchanged: gymnaster, pass, Redigera redskap, Passbyggaren, Hallöversikt, Golvklart, Förrådslista, Starta från mall, Kom igång, Biblioteket, Godkänn, Dölj för alla, Visa igen, Logga in som admin, Logga ut. Hall names come from Slice 45.

## New

| Key | Svenska | Where |
|---|---|---|
| `wizardMallLabel` | Mall | Heading of the Mall step (Starta från mall path) |

## Changed

| Key | Today | New |
|---|---|---|
| `wizardStepProgress` | Fråga {n} av 3 | **Fråga {n} av {total}** (4 on the questions path, 2 on Tomt pass and mall) |

## Reused (exact, already in the app)

| Key | Svenska | New place |
|---|---|---|
| `homeWizardPrimary` | Planera pass | Start page button (also as secondary under Fortsätt passet), sheet `aria-label` |
| `startFromTemplate` | Starta från mall | Link under the age chips |
| `emptyPass` | Tomt pass | Link under the age chips |
| `wizardQ1Label`, `wizardQ1Age46/79/1012/1318`, `wizardQ1Level`, `wizardLevelsHint` | Ålder · 4–6 år · 7–9 år · 10–12 år · 13–18 år · Nivå · Nivå 9 är den lägsta. Nivå 1 är den högsta. | Step 1 (unchanged) |
| `wizardQ2Label`, `wizardQ2Vault/Trampett/Tumbling/Mixed` | Fokus · Satsbräda · Trampett · Tumbling · Blandat | Step 2 (unchanged) |
| `wizardQ3Label` (Slice 45) + `HALL_PRESETS[id].label` | Hall · Gymmix – Stora hallen · Gymmix – Grophallen | Step 3, and step 1 of Tomt pass / mall |
| `passLength` | Passlängd | Step 4 heading, and step 2 of Tomt pass |
| `PASS_LENGTHS` + `passLengthMinutes` | 60 min · 90 min · 120 min | Step 4 chips |
| `wizardBack`, `wizardCancel` | Tillbaka · Avbryt | Bottom row |
| `clubTemplatesTitle`, `myTemplates`, built-in titles and «~{min} min · Trygg för nya tränare» | Föreningens mallar · Mina mallar · Nybörjare — ca 55 min · Kort pass — ca 45 min | Mall step |
| `draftHonestyBodyShort` | Sparas lokalt i webbläsaren — inte i molnet. | Last line of the start-page foot, small grey |
| `feedbackLink`, `updateApp`, `adminLoginLink`, `adminBadge`, `adminNotAdmin`, `adminLogout`, `visaTipsIgen`, `footerSliceLabel` | Tyck till · Uppdatera appen · Logga in som admin · Admin · Du är inloggad men inte admin. · Logga ut · Visa tips igen · Träningsplaneraren · Slice 46 | Footer rows (E1) |
| `continuePass`, `clearPass`, `fetchPass` | Fortsätt passet · Rensa passet · Hämta ett pass | Start page (unchanged) |

## Removed (no longer shown)

| Key | Text today | Why |
|---|---|---|
| `wizardNext` | Nästa | Answers move on by themselves (C1) |
| `wizardFinish` | Skapa pass | The last answer makes the pass (C1) |
| `wizardClose` | Stäng | The × goes; Avbryt stays (C1) |
| `fromTemplate` | Från mall | The start-page link goes; the sheet uses «Starta från mall» |
| `wizardQ3Hint`, `wizardFocusHonesty` | Välj den layout som liknar er hall. Teknik fäster i zon efter fokus. · Stationerna är förslag för ditt valda fokus. Andra zoner kan vara tomma — det är ok. | Only if Slice 45 D1 has not removed them |

Unused strings to delete (no reader on main): `homeWizardPrimaryDesc`, `homeWizardPrimaryAria`, `homeInvite`, `planFirst`, `newSession`, `browseTemplates`, `continueDraft`, `startFromTemplateDesc`, `draftHonestyTitle`, `draftHonestyBody`, `draftHonestyOtherDevice`, `draftHonestyDismiss`, `omUtkast`.

## Options that need other strings

- **A2:** a first step «Hur vill du börja?» with «Svara på fyra frågor», «Starta från mall», «Tomt pass».
- **C2:** keep `wizardClose` «Stäng» (×), drop the Avbryt button.
- **Open item 5:** note as «Passen sparas bara på den här enheten.» instead of today's line.

## Not allowed

Exclamation marks, «Skapa» or «Nästa» on the chips, «Hallayout», shortening the hall names to «Stora hallen» / «Grophallen», «Nytt pass» instead of «Tomt pass» on the link, renaming Starta från mall, Passbyggaren, Logga in som admin or Logga ut, words like «synka», «lagring», «cache».
