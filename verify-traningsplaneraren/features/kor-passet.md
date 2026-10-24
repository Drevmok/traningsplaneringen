# Kör passet (run mode)

**What:** full-screen overlay that walks the pass one övning at a time: kicker `n / N · block`, title, big step clock (tap = pause/resume), «Pausad» / «Tiden är ute», «Nästa: {title}» or «Sista aktiviteten» (Slice 34), **«Kvar: X min»** (Slice 38), then `.run-script` (Varför / Så gör du / Säkerhet) and the nav (**Föregående** / **Nästa övning**). Time-up tone + vibrate once per step at 00:00 (Slice 34); screen wake lock while open.

## Reach it (all entry points)

- Passbyggaren → «Kör passet» (aria «Kör passet, en övning i taget»).
- Shared link `#dela=<token>` → share page → «Kör passet» in `.share-actions`; «Spara och kör» only when the pass has station cards.
- Saved pass: share page → «Spara på den här enheten» → Passbyggaren (survives reload) → «Kör passet».
- Home → «Hämta ett pass» → paste link → «Öppna» → «Kör passet».
- Biblioteket («+ Lägg till övning» side panel), Hallöversikt, Golvklart, Home and the share page itself have **no** run line.

Build a deterministic pass with `verifier/slice-38-v-mktoken.ts '{"title":…,"plan":{"warmup":[["#0",2]],"techniques":[["#0",1],["#1",1]]}}'` (`#n` = n-th seed of that block, `TOP` = longest seed title, any unknown id is shown verbatim as the title, so a real long title needs no DOM injection).

## «Kvar: X min» (Slice 38)

- `X = ceil((left of current step + planned seconds of every later step) / 60)`. Skipped time is dropped (Nästa övning mid-step → only later steps count); 0-min steps add 0; Föregående restarts that step's clock, so X rises.
- 1–60 s total → «Kvar: 1 min»; exactly 0 → «Kvar: 0 min» (stays visible, same colour `#a8a29e`, never negative). Earlier step at 00:00 → later steps only.
- Frozen while paused (same `left`), continues on resume.
- Plain `<p class="run-left">` directly after `.run-next`; no role / aria-live / aria-label, no live ancestor. Clock aria-label unchanged («02:00. Pausa timern»).

## How to prove it

Headless Chromium, 390×844 (+320, 360), `page.clock.install` then `runFor`. See `verifier/slice-38-verify.mjs`:
- sample every second through a step and compare to the formula; edges 4:01→5, 4:00→4, 0:01→1, 0:00→0;
- pause across a minute boundary for 5 min → text and clock identical;
- measure `.run-next` / `.run-left` / `.run-script` / `.run-nav` boxes (no overlap, 1 line each, `scrollWidth ≤ innerWidth`, nav bottom ≤ 844, only `.run-script` scrolls);
- tone: wrap `AudioContext.createOscillator().start` (ignore the silent unlock buffer-source), count per step; wake lock: stub `navigator.wakeLock.request` and `document.visibilityState`.

## Needs a real device (PENDING-real)

VoiceOver reading order/announcements, audible tone and vibration, real wake-lock behaviour with screen-off timers.

**Slice 49:** a fresh Planera pass starts at «Kvar: 60/90/120 min» (the chosen length).

**Stabila väljare** (Slice 50; roll + synlig svensk etikett först, sedan aria/id/klass som smokes redan använder; inga `data-testid`)

| Vad | Väljare | Källa |
|---|---|---|
| Körläget | `.run-pass` | `components/RunPass.tsx`, `export.css` |
| Klockan | `.run-clock` | `components/RunPass.tsx`, `export.css` |
| Nästa | `.run-next` | `components/RunPass.tsx`, `export.css` |
| Kvar: X min | `.run-left` | `components/RunPass.tsx`, `export.css` |
| Navigering | `.run-nav` | `components/RunPass.tsx`, `export.css` |
| Knapp «Kör passet» | `role=button «Kör passet»` | `components/SessionBuilder.tsx`, `data/blockMeta.ts` |
