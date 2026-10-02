# Slice 30 — microcopy needs (Swedish · DRAFT placeholders)

**Owner:** Docs finalises (technical-writing + unslop) into `docs/ovningsimport.sv.md`; Builder ships the keys in `UI` (`blockMeta.ts`).  
**Tone:** du, kort, coach-to-coach, inga essäer. Quiet chrome (Slice 22).  
**Locked terms (unchanged):** övning · egen övning · pass · gymnaster · Bibliotek · Teknik · Redskap · Förrådslista · Golvklart · Ändra · Ta bort.  
Placeholders below are Planner drafts — Docs may tighten, not change meaning.

## Bibliotek — import entry (A1)

| Key | Svenska (utkast) |
|---|---|
| `ownImport` | Importera övningar |
| `ownImportTitle` | Importera övningar |
| `ownImportHint` | Välj filen eller klistra in koden du fick. Inget sparas förrän du trycker Importera. |
| `ownImportFile` | Välj fil |
| `ownImportPaste` | Klistra in kod |
| `ownImportRead` | Läs in |
| `ownImportCancel` | Avbryt |

## Fel på filnivå

| Key | Svenska (utkast) |
|---|---|
| `ownImportBad` | Filen eller koden gick inte att läsa. |
| `ownImportNewer` | Filen är från en nyare version av appen. Uppdatera appen och försök igen. |
| `ownImportEmpty` | Filen innehåller inga övningar. |
| `ownImportIsPass` | Det här är ett pass. Öppna det under Hämta ett pass på startsidan. |
| `importIsExercises` (Home · Hämta ett pass) | Det här är övningar. Importera dem under Bibliotek → Importera övningar. |

## Förhandsvisning — rader

| Key | Svenska (utkast) |
|---|---|
| `ownImportInclude` | Ta med |
| `ownImportSkip` | Hoppa över |
| `ownImportReplace` | Ersätt |
| `ownImportStateNew` | Ny |
| `ownImportStateSameName` | Samma namn finns redan |
| `ownImportStateExists` | Finns redan |
| `ownImportStateInvalid` | Kan inte importeras |
| `ownImportStateNoRoom` | Ingen plats |
| `ownImportRoom` | Plats för {n} till |
| `ownImportNoteClipped` | Förkortad |
| `ownImportNoteSteps` | Högst fyra steg. Resten togs bort. |
| `ownImportNoteUnknownPiece` | Okänt redskap togs bort: {list} |
| `ownImportNoteNotTeknik` | Redskap hör till Teknik och togs bort. |
| `ownImportNoteLink` | Länken till en annan övning togs bort. |
| `ownImportNoteSource` | Källan togs bort. Den behöver en https-länk och ett namn. |
| `ownImportNoteDupId` | Samma övning finns två gånger i filen. |
| `ownImportNoteBadFormat` | Övningen har fel format. |
| `ownImportNoteMissing` | Saknar {fält}. — reuse: varför · så gör du · se upp för · säkerhet · namn |
| `ownImportConfirm` | Importera {n} övningar |
| `ownImportConfirmOne` | Importera 1 övning |
| `ownImportDone` | {n} övningar importerade. Läs igenom dem innan ni kör. |
| `ownImportDoneOne` | 1 övning importerad. Läs igenom den innan ni kör. |

## Granskning (D1)

| Key | Svenska (utkast) |
|---|---|
| `ownNeedsReview` | Behöver granskas |
| `ownNeedsReviewHint` | Importerad övning. Läs igenom och ändra så den passar er hall. |
| `ownMarkReviewed` | Markera som granskad |
| `ownReviewedToast` | Markerad som granskad. |

(Existing `needsCoachReview: 'Behöver tränargranskning'` stays unused — seeds get no badge.)

## Källa (F1)

| Key | Svenska (utkast) |
|---|---|
| `sourceLabel` | Källa |
| `sourceLine` | Källa: {creator} |
| `sourceLineAt` | Källa: {creator} · {time} |
| `sourceAria` | Öppna videon hos {creator} i en ny flik |

## Progression (own + seed when present)

| Key | Svenska (utkast) |
|---|---|
| `progressionOfLabel` | Bygger på |
| `regressionOfLabel` | Lättare variant av |

## Egen övning — formulär (E1 + redskap)

| Key | Svenska (utkast) |
|---|---|
| `ownEquipment` | Redskap |
| `ownEquipmentHint` | Förslag till stationen. Bara i Teknik. |
| `ownEquipmentPick` | Välj redskap |
| `ownEquipmentNone` | Inga redskap |
| `ownFull` (**ändras**) | Du har 100 egna övningar. Ta bort en först. |
| `ownStepsHint` | Oförändrad: Ett steg per rad. Högst fyra. |

## Redskap — nya namn (C1)

Kilmatta · Skumblock · Bom · Räcke · Rockring

## Chrome

| Key | Svenska |
|---|---|
| `footerSliceLabel` | Träningsplaneraren · Slice 30 |

## Docs living note (deliverable)

`docs/ovningsimport.sv.md`: what Övningsimport is (Planner in chat → file → Bibliotek), what the preview states mean, what "Behöver granskas" means, the Källa/credit rule ("vi länkar, vi bäddar aldrig in, texten är våra egna ord"), the 5 new redskap names, and the 100 / 4-step limits.
