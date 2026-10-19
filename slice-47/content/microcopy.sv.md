# Slice 47 — microcopy (Swedish): Lägg till övning och Admin

**Status:** LOCKED 2026-10-19 by Christoffer: A1 B1 C1 D2 E1 F1. D2: no `adminApproveOther`; the author may Godkänn. Warm, du-form, no exclamation marks, no tech words. Locked terms unchanged: gymnaster, pass, Redigera redskap, Passbyggaren, Hallöversikt, Golvklart, Förrådslista, Starta från mall, Kom igång, Biblioteket, Godkänn, Dölj för alla, Visa igen, Logga in som admin, Logga ut. Also kept from Slice 30–32: egen övning, Ändra i banken, Väntar.

## New

| Key | Svenska | Where |
|---|---|---|
| `adminArea` | Admin | Heading of the Admin view; item in Passbyggaren «Mer» |
| `adminAreaOpenAria` | Öppna Admin | `aria-label` on the footer «Admin» button |
| `adminAreaEmpty` | Inget väntar just nu. | Admin view when all three lists are empty |
| `adminNewHint` | Övningen väntar under Väntar på godkännande tills en admin har godkänt den. Sedan finns den i Biblioteket för alla. | Under «Ny egen övning» |
| `adminImportHint` | Övningarna från filen väntar på godkännande på samma sätt. | Under «Importera övningar» |
| `adminNewSave` | Spara och skicka till granskning | Save button in the new-exercise form |
| `adminNewSaved` | Sparad. Den väntar på godkännande. | Toast after saving |
| `adminImportDone` | {n} övningar väntar på godkännande. | Toast after import |
| `adminImportDoneOne` | 1 övning väntar på godkännande. | Toast after import of one |
| `adminImportNoteSameName` | Finns redan i banken. Tar du med den får banken två övningar med samma namn. | Import row with a title already in the bank |

## Changed

| Key | Today | New |
|---|---|---|
| `importIsExercises` | Det här är övningar. Importera dem under Bibliotek → Importera övningar. | **Det här är en fil med övningar. En admin lägger in den under Admin.** |
| `ownImportHint` | Välj filen eller klistra in koden du fick. Inget sparas förrän du trycker Importera. | **Välj filen eller klistra in koden du fick. Inget skickas förrän du trycker Importera.** |
| `adminFormTitle` (new mode only) | Ändra övning i banken | **Ny egen övning** (edit mode keeps «Ändra övning i banken») |

## Reused (exact, already in the app)

| Key | Svenska | New place |
|---|---|---|
| `addActivity` | Lägg till övning | `aria-label` of the library sheet (no tabs) |
| `useTemplate` | Använd mall | Title of the new mall sheet |
| `myTemplates`, `copyTemplateCode`, `deleteTemplate`, `savedTemplatesHint` | Mina mallar · Kopiera delningskod · Ta bort · Egna mallar stannar i den här webbläsaren. Delningskoden tar med en kopia till telefonen. | Använd mall sheet |
| `adminBadge` | Admin | Footer row 2, now a button for admins |
| `adminFilterPending`, `adminFilterReview`, `adminFilterHidden` | Väntar på godkännande ({n}) · Behöver granskas ({n}) · Dolda ({n}) | List headings in the Admin view |
| `adminPendingBadge`, `adminHiddenBadge`, `ownNeedsReview` | Väntar · Dold · Behöver granskas | Badges, unchanged |
| `adminApprove`, `adminApproved`, `adminEdit`, `adminHide`, `adminUnhide`, `adminUnhidden`, `adminHideConfirm`, `adminHidden`, `adminOffline`, `adminSaveFailed` | Godkänn · Godkänd. Tränarna ser den nästa gång de öppnar appen. · Ändra i banken · Dölj för alla · Visa igen · … | Exercise detail from the Admin view, unchanged |
| `ownNew` | Ny egen övning | Admin view button |
| `ownImport`, `ownImportTitle`, `ownImportFile`, `ownImportPaste`, `ownImportRead`, `ownImportInclude`, `ownImportSkip`, `ownImportConfirm*`, `ownImportStateNew`, `ownImportStateSameName`, `ownImportStateInvalid`, `ownImportNote*` (except `NoteExists`, `NoteSameName`) | Importera övningar · Välj fil · Klistra in kod · Läs in · Ta med · Hoppa över · Importera {n} övningar · Ny · Samma namn finns redan · … | Admin import sheet |
| `clubTemplatesTitle` | Föreningens mallar | Admin view section |
| `wizardBack` | Tillbaka | Admin view header |
| `ownBadge`, `ownEditAction`, `ownDelete`, `ownInUse`, `ownEdit` | Egen · Ändra · Ta bort · Övningen sitter i ett pass eller en mall. · Ändra egen övning | Coaches' existing own exercises in Biblioteket (E1) |

## Removed (no longer shown)

| Key | Text today | Why |
|---|---|---|
| `tips`, `templates` | Tips · Mallar | Tabs gone (A1); check `rg` before deleting `library` «Bibliotek» |
| `selectBlockForTips`, `tipsBlockLead`, `tipsExercisesLead`, `tipsNoExercises`, `TIPS_TAB` | Välj ett block — då syns tipsen … · För hela blocket · Övningarna · Inga övningar i blocket ännu … · the five block tips | Tips tab gone |
| `libraryTonight`, `libraryTonightHint` | Visa bara övningar vi kan köra ikväll · Döljer övningar som behöver redskap du kryssat bort i Förrådslistan. | «ikväll» checkbox gone (B1) |
| `ownedEquipmentTitle`, `ownedEquipmentHint` | Vad finns i hallen ikväll? · Avmarkera det ni inte har. Biblioteket kan då visa bara övningar ni kan köra. | Förrådslista list gone (B1) |
| `ownHint` | Så ni gör i er hall. Övningen stannar i den här webbläsaren. | Own buttons leave Biblioteket |
| `ownFull` | Du har 100 egna övningar. Ta bort en först. | Coaches cannot add (E1) |
| `ownImportRoom`, `ownImportRoomNone`, `ownImportReplace`, `ownImportStateExists`, `ownImportStateNoRoom`, `ownImportNoteExists`, `ownImportNoteSameName`, `ownImportDone`, `ownImportDoneOne` | Plats för {n} till · Du har redan 100 egna övningar … · Ersätt · Finns redan · Ingen plats · Ersätt skriver över din version … · Tar du med den får du två övningar … · {n} övningar importerade … | Import now goes to the bank (F1) |

## Options that need other strings

- **D2:** no `adminApproveOther`.
- **E2:** button «Skicka till granskning» per own exercise in Admin, toast «Skickad. Den väntar på en annan admin.»
- **B2:** `ownedEquipmentHint` → «Avmarkera det ni inte har.»

## Not allowed

Exclamation marks; «databas», «rad», «status», «pending», «RLS», «Supabase» or e-mail addresses in coach or admin text; renaming Godkänn, Dölj för alla, Visa igen, Ändra i banken, Biblioteket, Logga in som admin, Logga ut; «Egen övning» with a capital E mid-sentence.
