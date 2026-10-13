# Slice 38 — microcopy (Swedish): Kör passet «Kvar»

**Status:** LOCKED 2026-10-13. Words are Docs final.  
**Owner:** Docs owns the words. Builder ships the key in `UI` (`app/src/data/blockMeta.ts`), next to the other `run*` keys.  
**Tone:** du, short, quiet chrome. No exclamation marks. No tech words.

**ny** = new key. **ändrad** = same key, new text. Everything else unchanged (`runNextLabel` «Nästa: {title}», `runLastActivity` «Sista aktiviteten», `runTimeUp` «Tiden är ute», `runPaused` «Pausad»).

| Key | Svenska | Where / when |
|---|---|---|
| `runLeftLabel` **ny** | Kvar: {n} min | Muted line under «Nästa: …». `{n}` = whole minutes left of the pass, rounded up. Over time on the last step: «Kvar: 0 min» |
| `footerSliceLabel` **ändrad** (via `SLICE_NUMBER = '38'`) | Träningsplaneraren · Slice 38 | Footer |
| `feedbackMailVersion` (via `SLICE_NUMBER`) | Version: Slice 38 | Tyck till-mejlet |

Examples: «Kvar: 24 min», «Kvar: 1 min», «Kvar: 0 min». Always «min», also for 1 (Swedish abbreviation, no plural).

## Aria

No new aria string, no live region. The line is plain text.

## Not allowed

No «Passet är slut», no «Du ligger efter», no «+3 min», no clock time, no exclamation marks.
