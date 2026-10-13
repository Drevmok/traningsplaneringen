# Slice 39 — microcopy (Swedish): Spara passet automatiskt

**Status:** LOCKED 2026-10-13. Words are Docs final.  
**Owner:** Docs owns the words. Builder ships the keys in `UI` (`app/src/data/blockMeta.ts`).  
**Tone:** du, short, warm, quiet chrome. No exclamation marks. No tech words.

**ny** = new key. **ändrad** = same key, new text. **borttagen** = delete key and its use.

| Key | Svenska | Where / when |
|---|---|---|
| `saveDraft` **borttagen** | ~~Spara utkast~~ | Button removed (B1) |
| `savedToast` **borttagen** | ~~Utkast sparat~~ | Toast removed |
| `autosaveSaved` **ny** | Sparat | Muted text in the builder action row, after the first save. Stays. |
| `autosaveFailed` **ny** | Inte sparat | Same place, when the last write failed |
| `autosaveFailedToast` **ny** | Passet kunde inte sparas här. Skicka det till telefonen eller ladda ner en fil, så finns det kvar. | Existing toast, once per pass on the first failure |
| `untitledPass` **ny** | Nytt pass | Home «Fortsätt passet» meta and Mina mallar name when the title is empty. Same text as the blank pass today |
| `templateBody` **ändrad** | Om du börjar från en mall ersätts blocken och övningarna du har nu. Passet du hade finns kvar under Mina mallar. | Använd mall confirm. Was: «… Dina sparade utkast finns kvar.» |
| `oppnaPaTelefonHonesty` **ändrad** | Appen på telefonen är tom tills du skickar passet dit. Passet sparas bara i den webbläsare där du planerar det. | Öppna på telefonen. Was: «… där du trycker Spara.» |
| `footerSliceLabel` **ändrad** (via `SLICE_NUMBER = '39'`) | Träningsplaneraren · Slice 39 | Footer |
| `feedbackMailVersion` (via `SLICE_NUMBER`) | Version: Slice 39 | Tyck till-mejlet |

Unchanged on purpose: `continuePass` «Fortsätt passet», `draftHonestyBodyShort` «Sparas lokalt i webbläsaren — inte i molnet.», `draftHonestyTitle`, `omUtkast`, `replaceDraft*` («utkast» stays the coach word for the pass kept in this browser), `updateReady`, `importDone`, `saveAsTemplate` / `saveOwnTemplate`, Hallöversikt «Använd alla förslag» strings (still manual).

## Aria

No new aria strings. «Sparat» / «Inte sparat» are plain text, no live region, no `role="status"`. The failure toast uses the existing toast `role="status"` once.

## Not allowed

No «Sparar…», no «Autosparat», no «Sparat lokalt i localStorage», no time stamps («Sparat 18:04»), no exclamation marks, no changes to locked terms (Passbyggaren, Starta från mall, pass, Mina mallar, Tomt pass).
