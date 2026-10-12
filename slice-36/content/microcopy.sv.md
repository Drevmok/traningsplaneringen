# Slice 36 — microcopy (Swedish): Föreningens mallar

**Status:** LOCKED 2026-10-12. Words are Docs final.  
**Owner:** Docs owns the words. Builder ships the keys in `UI` (`app/src/data/blockMeta.ts`), in a `// Slice 36 — club templates` group after the Slice 32 admin keys.  
**Tone:** du, short, quiet chrome (Slice 22). No exclamation marks. No tech words in the UI (no "databas", "server", "synka", "cache", "JSON", "Supabase").  
**Locked terms, never changed:** gymnaster, pass, Redigera redskap, Passbyggaren, Hallöversikt, Golvklart, Förrådslista, Starta från mall, Kom igång, Biblioteket, Godkänn, Dölj för alla, Visa igen, Logga in som admin, Logga ut.

**ny** = new key. **ändrad** = same key, new text. **återanvänd** = existing key, same text, used in a new place.

## Coach (everyone)

| Key | Svenska | Where / when |
|---|---|---|
| `clubTemplatesTitle` **ny** | Föreningens mallar | Section heading in the Mallar list (Starta från mall), above Mina mallar and the built-in mallar |
| `clubTemplatesHint` **ny** | Pass som föreningen har provat. Du gör dem till dina när du använder dem. | One muted line under the heading |
| `clubTemplateBadge` **ny** | Föreningens | Small tag on each club card, next to the minutes |
| `clubTemplateCardAria` **ny** | Föreningens mall {title}, {n} min | `aria-label` on a club card |
| `clubTemplatesEmpty` **ny** | Föreningen har inga mallar än. | Shown under the heading only when the list is empty **and** the app has reached the list at least once. Never shown on a first load without nät |
| `clubTemplatesStale` **ny** | Visar sparade mallar. Du kan planera som vanligt. | Grey line under the heading when the background refresh failed (same tone as `bankStale`) |
| `clubTemplatePlacementsNote` **ny** | Stationerna placerar du själv i Hallöversikt. | Muted line in the Använd mall confirm, only for a club mall |
| `clubTemplateApplied` **ny** | Mallen är i Passbyggaren. Placera stationerna i Hallöversikt när du vill. | Toast after a club mall is applied |
| `templateTitle` / `templateBody` / `templateConfirm` / `templateCancel` **återanvänd** | (unchanged) | Same Ersätta-confirm as for other mallar |

## Admin only

| Key | Svenska | Where / when |
|---|---|---|
| `clubPublish` **ny** | Publicera som föreningsmall | Action on an open pass, admin mode only (same menu as Spara som egen mall) |
| `clubPublishTitle` **ny** | Publicera som föreningsmall | Dialog heading |
| `clubPublishNameLabel` **ny** | Namn på mallen | Title field, prefilled with the pass title |
| `clubPublishBody` **ny** | Alla tränare ser mallen under Starta från mall nästa gång de öppnar appen. Placeringarna i hallen följer inte med. | Dialog text |
| `clubPublishConfirm` **ny** | Publicera | Primary button |
| `adminCancel` **återanvänd** | Avbryt | Secondary button |
| `clubOverwriteTitle` **ny** | Det finns redan en mall som heter ”{title}” | Shown instead of the publish text when the name is taken |
| `clubOverwriteBody` **ny** | Vill du ersätta den med det här passet? Tränare som redan har använt den behåller sitt pass. | Overwrite confirm text |
| `clubOverwriteConfirm` **ny** | Ersätt mallen | Primary button in the overwrite confirm |
| `clubPublished` **ny** | Publicerad. Tränarna ser den nästa gång de öppnar appen. | Toast after a new publish |
| `clubOverwritten` **ny** | Mallen är ersatt. Tränarna ser den nya nästa gång de öppnar appen. | Toast after an overwrite |
| `adminHide` **återanvänd** | Dölj för alla | Text button on a club card, admin mode only |
| `clubHideAria` **ny** | Dölj för alla: {title} | `aria-label` |
| `clubHideConfirm` **ny** | Dölja ”{title}” för alla tränare? Pass som redan har gjorts från mallen ligger kvar. | Hide confirm |
| `adminHideConfirmYes` **återanvänd** | Dölj | Confirm button |
| `adminHidden` **återanvänd** | Dold för alla. | Toast after hide |
| `clubHiddenTitle` **ny** | Dolda föreningsmallar ({n}) | Collapsed group under the club list, admin mode only, only when n > 0 |
| `adminHiddenBadge` **återanvänd** | Dold | Tag on a hidden card (admin only) |
| `adminUnhide` **återanvänd** | Visa igen | Text button on a hidden card |
| `clubUnhideAria` **ny** | Visa igen: {title} | `aria-label` |
| `adminUnhidden` **återanvänd** | Syns igen för alla. | Toast after Visa igen |
| `clubOffline` **ny** | Du behöver nät för att ändra föreningens mallar. | Inline line in the dialog when a write can't reach the list; nothing is changed |
| `clubWriteFailed` **ny** | Det gick inte att spara. Försök igen om en stund. | Any other refused write (also "not admin any more") |
| `adminLastChanged` **återanvänd** | Senast ändrad {datum} av {vem} | Muted line on club cards in admin mode |
| `footerSliceLabel` **ändrad** | Träningsplaneraren · Slice 36 | Footer |

## Not allowed

No exclamation marks. No "publicerad i molnet", "synkas", "server", "laddar upp", "radera", "ta bort för alla". Never call a club mall "din" or "egen". Coaches see no admin words (Publicera, Dold, Senast ändrad).
