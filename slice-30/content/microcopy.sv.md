# Slice 30 — microcopy (Swedish · Docs final)

**Status:** **Docs final 2026-10-02** — follows the lock A1 / B3 / C1 / D1 / E1 / F1. Builder may ship from these keys.  
**Owner:** Docs owns the words. Builder ships the keys in `UI` (`app/src/data/blockMeta.ts`).  
**Living doc:** [`docs/ovningsimport.sv.md`](../../docs/ovningsimport.sv.md) (coach guide + the same key table for Builder).  
**Tone:** du, short, coach-to-coach. Quiet chrome (Slice 22): no exclamation marks, no stacked paragraphs.  
**Locked terms (unchanged):** övning · egen övning · pass · gymnaster · Bibliotek · Teknik · Redskap · Förrådslista · Golvklart · Ändra · Ta bort · Redigera redskap · Passbyggaren · Hallöversikt · Starta från mall · Kom igång · Hämta ett pass · Klar.

Keys marked **ny (Docs)** were added where the pack implies a string but had no key. Everything else keeps the Planner key and meaning; only the wording is tightened.

## Bibliotek — import entry (A1)

| Key | Svenska | Note |
|---|---|---|
| `ownImport` | Importera övningar | Button beside **Ny egen övning** |
| `ownImportAria` **ny (Docs)** | Importera övningar från en fil eller en kod | Optional; the visible label is enough if Builder prefers |
| `ownImportTitle` | Importera övningar | Sheet heading |
| `ownImportHint` | Välj filen eller klistra in koden du fick. Inget sparas förrän du trycker Importera. | |
| `ownImportFile` | Välj fil | File input button (`.json`) |
| `ownImportPaste` | Klistra in kod | Label for the paste box |
| `ownImportRead` | Läs in | Parses file/paste, shows the preview |
| `ownImportCancel` | Avbryt | Closes; nothing saved |
| `ownImportCloseAria` **ny (Docs)** | Stäng importen utan att spara | × button, same family as `composeCloseAria` |

## Fel på filnivå

Shown in the sheet where `receiveBad` shows on Home. One line, no stacking.

| Key | Svenska | When (`parseExerciseFile` reason) |
|---|---|---|
| `ownImportBad` | Filen eller koden gick inte att läsa. | `bad`: not JSON, wrong `format`, `schemaVersion` missing or lower than 1. Same text as `receiveBad` |
| `ownImportNewer` | Filen kommer från en nyare version av appen. Uppdatera appen och försök igen. | `newer`: `schemaVersion` > 1 |
| `ownImportEmpty` | Det finns inga övningar i filen. | `empty`: `exercises` missing or `[]` |
| `ownImportIsPass` | Det här är ett pass. Öppna det under Hämta ett pass på startsidan. | `isPass`: a pass file (`v`, `blocks`) |
| `importIsExercises` (Home · Hämta ett pass) | Det här är övningar. Importera dem under Bibliotek → Importera övningar. | Draft stays untouched |

## Förhandsvisning — rader

| Key | Svenska | Note |
|---|---|---|
| `ownImportRoom` | Plats för {n} till | Counter above the rows |
| `ownImportRoomNone` **ny (Docs)** | Du har redan 100 egna övningar. Ta bort några för att importera fler. | Replaces the counter when room is 0 (avoids "Plats för 0 till") |
| `ownImportInclude` | Ta med | Row choice |
| `ownImportSkip` | Hoppa över | Row choice |
| `ownImportReplace` | Ersätt | Row choice, only on **Finns redan** |
| `ownImportChoiceAria` **ny (Docs)** | Välj vad som händer med {title} | aria-label on the per-row choice control |
| `ownImportStateNew` | Ny | |
| `ownImportStateSameName` | Samma namn finns redan | Schema calls this state "Samma namn finns"; the chip text is this key |
| `ownImportStateExists` | Finns redan | Default **Hoppa över** |
| `ownImportStateInvalid` | Kan inte importeras | Choice locked off; reason note below |
| `ownImportStateNoRoom` | Ingen plats | Choice locked off |

### Notes (one muted line each)

| Key | Svenska | When |
|---|---|---|
| `ownImportNoteClipped` | Förkortad. | A text field was clipped (title 80, Varför / Se upp för / Säkerhet 240, step 180) |
| `ownImportNoteSteps` | Högst fyra steg. Resten togs bort. | Step 5+ dropped (E1) |
| `ownImportNoteUnknownPiece` | Okänt redskap togs bort: {list} | `{list}` = the dropped piece ids, comma-separated |
| `ownImportNoteNotTeknik` | Redskapen togs bort. De används bara i Teknik. | `defaultStationEquipment` on a non-Teknik row |
| `ownImportNoteLink` | Kopplingen till en annan övning togs bort. | `progressionOf` / `regressionOf` did not resolve |
| `ownImportNoteSource` | Källan togs bort. Den behöver en https-länk och ett namn. | `source` failed sanitizing |
| `ownImportNoteDupId` | Samma övning finns två gånger i filen. | Later row with a repeated `id` |
| `ownImportNoteBadFormat` | Övningen har fel format. | Bad `id`, unknown `blockType`, missing/invalid minutes, any other row-level failure |
| `ownImportNoteMissing` | Saknar {fält}. | Field names: namn · varför · så gör du · se upp för · säkerhet. Several: "Saknar varför och säkerhet." |
| `ownImportNoteSameName` **ny (Docs)** | Tar du med den får du två övningar med samma namn. | Under **Samma namn finns redan** |
| `ownImportNoteExists` **ny (Docs)** | Ersätt skriver över din version. Pass som använder övningen får den nya texten. | Under **Finns redan** (optional; can show only when Ersätt is chosen) |

### Confirm + toast

| Key | Svenska | Note |
|---|---|---|
| `ownImportConfirm` | Importera {n} övningar | Primary; one write |
| `ownImportConfirmOne` | Importera 1 övning | |
| `ownImportConfirmNone` **ny (Docs)** | Välj minst en övning först | Disabled primary when nothing is chosen (same pattern as `hallCtaDisabled`) |
| `ownImportDone` | {n} övningar importerade. Läs igenom dem före passet. | Toast (`role="status"`), counts new + replaced |
| `ownImportDoneOne` | 1 övning importerad. Läs igenom den före passet. | Toast |

## Granskning (D1)

| Key | Svenska | Note |
|---|---|---|
| `ownNeedsReview` | Behöver granskas | Badge: library card + exercise detail, own only, same family as `ownBadge` |
| `ownNeedsReviewHint` | Importerad övning. Läs igenom den och ändra så att den passar er hall. | Detail only, above the button |
| `ownMarkReviewed` | Markera som granskad | Detail button |
| `ownMarkReviewedAria` **ny (Docs)** | Markera {title} som granskad | Optional aria-label |
| `ownReviewedToast` | Markerad som granskad. | Toast (`role="status"`) |

Saving via **Ändra → Spara övning** also clears the badge and shows the existing `ownSaved` toast (no extra string).  
The existing `needsCoachReview: 'Behöver tränargranskning'` stays unused. Seeds get no badge.

## Källa (F1)

| Key | Svenska | Note |
|---|---|---|
| `sourceLabel` | Källa | |
| `sourceLine` | Källa: {creator} | No `startSeconds` |
| `sourceLineAt` | Källa: {creator} · {time} | `{time}` = `m:ss` or `h:mm:ss`. Example: `Källa: Prime Coaching Sport · 0:50` |
| `sourceAria` | Öppna videon hos {creator} i en ny flik | aria-label on the link |
| `sourceAriaTitled` **ny (Docs)** | Öppna ”{title}” hos {creator} i en ny flik | When `source.title` exists (schema: title is used in aria only) |

Link: `target="_blank" rel="noopener noreferrer"`. A trailing ↗ is decorative (`aria-hidden`). Muted line in exercise detail and the pass-row info panel only.

## Progression (own + seed when present)

| Key | Svenska | Render |
|---|---|---|
| `progressionOfLabel` | Bygger på | `Bygger på: {title}` |
| `regressionOfLabel` | Lättare variant av | `Lättare variant av: {title}` |

Hide the line when the id does not resolve.

## Egen övning — formulär (E1 + redskap)

| Key | Svenska | Note |
|---|---|---|
| `ownEquipment` | Redskap | Field label, only when Block = Teknik |
| `ownEquipmentHint` | Förslag till stationen. Bara i Teknik. | Under the chips |
| `ownEquipmentPick` | Välj redskap | Button and picker sheet title |
| `ownEquipmentNone` | Inga redskap valda. | Empty state where the chips go |
| `ownFull` (**ändras**) | Du har 100 egna övningar. Ta bort en först. | Was 40 |
| `ownStepsHint` | Ett steg per rad. Högst fyra. | **Unchanged** |

Picker reuses the Redigera redskap grid + count stepper and its existing keys (`composeDone` **Klar**, stepper arias). Title it **Välj redskap**, not **Redigera redskap**: the form sets förslag on an övning, not a saved station.

## Redskap — nya namn (C1)

Appended after Kon. Singular labels; counts render `{n}× {label}` (e.g. `4× Rockring`).

| id | labelSv |
|---|---|
| `eq-kilmatta` | Kilmatta |
| `eq-skumblock` | Skumblock |
| `eq-bom` | Bom |
| `eq-racke` | Räcke |
| `eq-rockring` | Rockring |

`eq-bom` is **Bom**, not "Låg bom". Height belongs in the drill text.

## Chrome

| Key | Svenska |
|---|---|
| `footerSliceLabel` | Träningsplaneraren · Slice 30 |

## Do not ship

- Text about in-app AI, API keys, YouTube login, video embeds, thumbnails, cloud or accounts.
- "Planner" in app UI. The app says "koden du fick"; Planner lives in the chat, outside the app.
- A free-text "Övrigt" / "eget redskap" field.
- Any change to Slice 22–29 strings (see the do-not-touch list in the living doc).
