# Slice 34 — microcopy (Swedish): Kör passet signal + Nästa

**Status:** LOCKED 2026-10-09. Words are Docs final.  
**Owner:** Docs owns the words. Builder ships the keys in `UI` (`app/src/data/blockMeta.ts`), next to the existing `run*` keys.  
**Tone:** du, short, quiet chrome (Slice 22). No exclamation marks. No tech words in the UI (no ljud-API, ton, vibration, inställning).

**ny** = new key. **ändrad** = same key, new text. Everything else unchanged (`runNext` «Nästa övning», `runLast` «Sista övningen», `runTimeUp` «Tiden är ute», `runPaused`, `runPause`, `runResume`).

| Key | Svenska | Where / when |
|---|---|---|
| `runNextLabel` **ny** | Nästa: {title} | One grey line under the timer. `{title}` = next step's full title (same as its heading). One line, ellipsis if long |
| `runLastActivity` **ny** | Sista aktiviteten | Same line, on the last step |
| `footerSliceLabel` **ändrad** | Träningsplaneraren · Slice 34 | Footer |

## Aria

No new aria string. When the timer hits 0, the existing `runTimeUp` («Tiden är ute», `role="status"`) is the announcement; it is already quiet and short. The Nästa line is plain text (no live region).

## Screen-lock note (E1)

No coach-facing text in this slice. The sound is best effort when the screen is on; this is documented for Verifier/Planner only. If Planner later wants a line, the proposed text is: «Ljudet hörs bara när skärmen är på.» (not shipped in Slice 34).

## Not allowed

No "Ljud på/av", no "Tryck för att aktivera ljud", no toast or banner about sound.
