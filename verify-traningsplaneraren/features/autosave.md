# Spara passet automatiskt (autosave, Slice 39)

**What:** the one pass slot (`gymnastics-planner-draft-v1`) is written ~800 ms after the last change while Passbyggaren or Hallöversikt is on screen. There is no **Spara utkast** button any more. A quiet muted **«Sparat»** (`.save-status`, `#78716c`) sits at the end of `.builder-actions` after the first save; **«Inte sparat»** (`.save-status-failed`) + one toast «Passet kunde inte sparas här. Skicka det till telefonen eller ladda ner en fil, så finns det kvar.» when a write fails (once per pass id). A pass that gets replaced (other id, ≥ 1 station) is copied to **Mina mallar** (`gymnastics-planner-templates-v1`, max 8, dedupe by contents) right before the write.

## Reach it

- Any edit in Passbyggaren: title, 60/90/120, add / remove station, minutes in the station's description panel. (No station reorder or pass-notes UI exists in Passbyggaren.)
- Flushes at once: «Till startsidan», opening Hallöversikt, «Kör passet», `pagehide`, `visibilitychange: hidden`.
- Saved at creation (no debounce): Starta från mall (built-in), Föreningsmall, Mina mallar, Planera pass (wizard), import, received pass (`adoptAsDraft` / `saveDraft`).
- **Tomt pass** is not written until it has more stations than it started with (it starts with Närvaro + Dagens pass). A title edit alone never writes it, and «Sparat» stays hidden.
- HallBoard still writes directly (`saveDraft` on every placement / remove / Placera här / Använd alla förslag / preset / flow); the autosave hook then re-writes the same pass (no harm).

## How to prove it

`verifier/slice-39-verify.mjs` (and Builder's `slice-39-builder-smoke.mjs`). Init-script spy on `Storage.prototype.setItem` for the draft key records `performance.now()` per write and can throw (`window.__failDraft = true`) for storage-full. A MutationObserver counts `.toast` insertions and mutations inside `[aria-live]/[role=status|alert]`.

- Per edit kind: wait > 1 s, edit, measure first write − edit (≈ 750–800 ms), exactly 1 write.
- Burst: keys 120 ms apart + 5 length taps → 1 write ~800 ms after the last change.
- Edges: edit → `page.reload()` at once; edit → `goto('about:blank')`; edit → `page.close({ runBeforeUnload: true })`; fake `document.visibilityState='hidden'` + dispatch `visibilitychange` → write in the same task. Note: `page.close()` *without* `runBeforeUnload` fires no pagehide in Playwright.
- Creation paths: apply → `reload()` at once → slot holds the new id.
- Replaced pass / cap: 9 × (Tomt pass + distinct station) after one hand-saved mall → list stays 8, oldest (also a hand-saved one) silently dropped.
- Two tabs: two pages in one context; no `storage` listener, last write wins.
- Race: an id change (Använd mall in Passbyggaren, Ny vecka) less than ~800 ms after an edit lets the pending stale write overwrite the new pass in the slot (Slice 39 verify F1).
- Storage full: «Inte sparat» + exactly one toast (`role=status`), no repeat; un-stub → «Sparat».

## Needs a real device (PENDING-real)

iOS home-screen app swipe-away within 1 s (`pagehide`), Safari private mode, VoiceOver reading «Sparat» in order and the failure toast once.
