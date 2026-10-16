# Slice 42 — microcopy (Swedish): rätt tips i rätt läge

**Status:** LOCKED 2026-10-16. Words are Docs final.  
**Owner:** Docs owns the words. Builder ships the keys in `UI` (`app/src/data/blockMeta.ts`).

**No new strings and no changed text.** This slice only changes *when* two existing pieces of chrome show.

| Key | Svenska | Change |
|---|---|---|
| `tipBuilderEmpty` | Tomt pass? Börja från en mall, eller lägg till en övning i ett block. Varje övning visar varför, hur och vad du ska se upp för. | Text unchanged. Shows only at 0 coach stations (README A1) |
| `templateTitle` / `templateBody` / `templateConfirm` / `templateCancel` | Ersätta det här passet? / Om du börjar från en mall ersätts blocken och övningarna du har nu. Passet du hade finns kvar under Mina mallar. / Använd mall / Fortsätt redigera | Text unchanged. Skipped when the pass is fresh (B1) |
| `clubTemplateApplied` + `undoAction` | Mallen är i Passbyggaren. · Ångra | Unchanged (Slice 41); now also the only feedback when the confirm is skipped |
| `footerSliceLabel` (via `SLICE_NUMBER = '42'`) | Träningsplaneraren · Slice 42 | Footer |
| `feedbackMailVersion` (via `SLICE_NUMBER`) | Version: Slice 42 | Tyck till-mejlet |

## Aria

No new aria strings.

## Not allowed

New tip text, a "Visa inte igen" control, a toast saying the confirm was skipped.
