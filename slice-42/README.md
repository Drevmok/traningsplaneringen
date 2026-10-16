# Slice 42 — Rätt tips i rätt läge (Tomt pass? och Ersätta det här passet?)

**App:** Träningsplaneraren  
**Status:** **LOCKED 2026-10-16.** A1–F1 are Docs' recommended answers derived from the Planner scope (Polish #4); Planner/Christoffer may still adjust. Docs pack only, no app code. Branch `slice-42-docs` from `main` @ `1814e50` (Slice 41 merge, verified as `origin/main` tip on 2026-10-16).  
**Effort:** S.  
**Source:** Planner (Polish #4 «right tip for the moment»). Note: no Polish #4 entry was found under `backlog/` on main @ 1814e50; scope taken from the Planner brief.

## Why

Two pieces of chrome speak at the wrong moment:

1. The «Tomt pass?» tip shows on a pass that already has stations. On the first visit to Passbyggaren it shows whatever the pass holds (`showFirstVisitTip`), and on a blank Tomt pass the count is never 0 anyway, because Slice 27 puts Närvaro + Dagens pass in Samling. So the rule is wrong both ways.
2. «Ersätta det här passet?» asks before replacing a pass that holds no coach work: a Tomt pass, or a mall/wizard pass the coach has not touched. The question is noise there, and its body («Passet du hade finns kvar under Mina mallar») is not even true for an empty pass.

**Coach outcome:** "Tipset kommer när passet är tomt, och appen frågar bara när jag har något att förlora."

## Definitions

- **Soft pair** = items with `activityId` `gather-narvaro` or `gather-dagens-teknik` (Slice 27, `createBlankSession`; also in the wizard skeleton and seed mallar).
- **Coach station** = any item that is not a soft-pair item.
- **Has content** (for the tip) = ≥ 1 coach station. Title, notes, minutes, pass length, hall choice and the soft pair are not content.
- **Empty pass** = 0 coach stations, title is empty or the default (`UI.untitledPass`), pass notes empty, every block `coachNote` empty. Soft-pair minutes, pass length, hall choice and placements of soft-pair items do not count.
- **Fresh pass** = empty, **or** unchanged since it was created in this app session by a mall (built-in, Mina mallar, föreningsmall), the wizard or Tomt pass: same `id` and the same fresh signature (`passSignature(sessionToShare(s))` + title + notes + block coachNotes) as at creation. Any edit (add/remove/move a station, minutes, title, note, hall drag) makes it not fresh, also if undone by hand. Not kept across reload: after a reload only «empty» counts (conservative, the confirm shows).
- **Real coach work** = not fresh. The confirm always shows then.

## Locks

| Lock | Decision |
|---|---|
| **A1** | «Tomt pass?» (`tip-builder-empty`) shows only when the pass has 0 coach stations and the tip is not dismissed. The first-visit override (`showFirstVisitTip`) no longer shows it on a pass with content. One render site: `SessionBuilder.tsx:519–527`. The tip hides the moment a coach station is added and comes back if the last one is removed (not dismissed). |
| **B1** | «Ersätta det här passet?» (`TemplateConfirm`) is skipped when the pass on screen is fresh: Använd mall applies at once, same as a confirm tap. Shown whenever the pass is not fresh. Same rule for all three mall kinds. |
| **C1** | Slice 41 Ångra is unchanged and is the safety net for the skipped confirm: the mall toast «Mallen är i Passbyggaren. · Ångra» shows as today and brings back the fresh pass. |
| **D1** | Slice 39 auto-copy: a fresh pass is **not** copied to Mina mallar when it is replaced (an empty pass is noise; an untouched mall/wizard pass is already a mall or one tap away). `archiveReplacedDraft` uses «fresh» instead of `countSessionItems(old) < 1`. |
| **E1** | No new controls, no new strings, no text changes. The confirm and the tip keep their words. |
| **F1** | +512 B gz total, soft. Estimate +150–250 B. |

## Key choices

- **Soft pair is not content.** The tip exists to say "start here"; Närvaro + Dagens pass are filled in for the coach, not by them.
- **Fresh is a snapshot, not a heuristic.** Comparing to the creation signature means "untouched" is exact. No guessing from timestamps or item counts.
- **Title counts as work for the confirm, not for the tip.** A typed title is something the coach would lose; it does not make the pass less empty to plan.
- **Reload is conservative.** The fresh snapshot is in memory only. After reload, a mall pass with stations gets the confirm again. Cheap, and never loses work.
- **Mina mallar text stays true.** The confirm body promises the old pass is under Mina mallar; with D1 the confirm only shows when a copy is made (or already exists).

## Files

- [`HANDOFF.md`](./HANDOFF.md) — Builder notes with file:function refs
- [`verification-checklist.md`](./verification-checklist.md) — AC1–AC18
- [`content/microcopy.sv.md`](./content/microcopy.sv.md) — no new strings
- Living docs: [`docs/coach-tips.sv.md`](../docs/coach-tips.sv.md) (when the tip shows), [`docs/ui-chrome.sv.md`](../docs/ui-chrome.sv.md) (when the confirm shows; body text synced with the app)

## Out of scope

New tips or settings, changing tip/confirm wording, fresh state across reload, «Nytt pass» from Hem asking before replacing, Ny vecka, import, HallBoard tips, removing existing auto-copies.
