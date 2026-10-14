# Slice 41 — microcopy (Swedish): Ångra

**Status:** LOCKED 2026-10-14. Words are Docs final.  
**Owner:** Docs owns the words. Builder ships the keys in `UI` (`app/src/data/blockMeta.ts`).  
**Tone:** du, short, warm, quiet chrome. No exclamation marks. No tech words.

**ny** = new key. **ändrad** = same key, new text or new use.

| Key | Svenska | Where / when |
|---|---|---|
| `undoRemoved` **ny** | Borttagen | Toast text after × on a station, about 5 s |
| `undoAction` **ny** | Ångra | Button in the toast (× and Använd mall) |
| `undoDone` **ny** | Ångrat. | Plain toast after Ångra, 2.2 s, no button |
| `clubTemplateApplied` **ändrad (use)** | Mallen är i Passbyggaren. | Text unchanged. Now shown after Använd mall for built-in mall, Mina mallar and föreningsmall, with the Ångra button |
| `footerSliceLabel` **ändrad** (via `SLICE_NUMBER = '41'`) | Träningsplaneraren · Slice 41 | Footer |
| `feedbackMailVersion` (via `SLICE_NUMBER`) | Version: Slice 41 | Tyck till-mejlet |

Visual: «Borttagen · Ångra» and «Mallen är i Passbyggaren. · Ångra». The « · » is a separator in the markup, `aria-hidden`, not part of any key.

## Why these words

- **Borttagen** — matches «Ta bort» on the ×; short enough to sit next to the button on a 390 px pill. Not «Stationen togs bort», which pushes Ångra off one line.
- **Mallen är i Passbyggaren.** — combined, not replaced: the coach still learns where the mall went, and the same pill carries Ångra. No new mall text, no second toast.
- **Ångrat.** — tells the coach (and VoiceOver) it worked, without repeating what came back.

## Aria

No new aria strings. The toast keeps `role="status"`; it is announced once when it appears. Ångra is a real `<button>` with visible text, so its name is «Ångra».

## Not allowed

No «Ångra senaste», «Återställ», «Undo», «Är du säker?», no counters or timers in the text («Ångra (5)»), no exclamation marks, no changes to locked terms (Passbyggaren, Använd mall, Mina mallar, föreningsmall, pass, station).
