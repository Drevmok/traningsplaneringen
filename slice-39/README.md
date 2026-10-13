# Slice 39 — Spara passet automatiskt

**App:** Träningsplaneraren  
**Status:** **LOCKED 2026-10-13.** A1–F1 locked per Planner (2026-10-13). Docs pack only, no app code. Branch `slice-39-docs` from `main` @ `4b056c8` (verified as `origin/main` tip with `git ls-remote` on 2026-10-13).  
**Effort:** S–M.  
**Source:** Planner.

## Why

Today a pass is only kept if the coach remembers **Spara utkast**. A pass from Starta från mall that is never saved is gone after a reload or a closed tab (Slice 37 verify, F2). The coach should never have to think about saving.

**Coach outcome:** "Jag ändrar passet och det finns kvar. Jag behöver aldrig trycka spara."

## Locks

| Lock | Decision |
|---|---|
| **A1** | Every pass change is written to local storage about 800 ms after the last change (debounce). Pending saves are flushed at once on going Home, opening Hallöversikt / Kör passet, and on `pagehide` / `visibilitychange: hidden`. Local only, no cloud. |
| **B1** | The **Spara utkast** button is removed. In its place in the builder action row: a quiet muted text **«Sparat»**. It appears after the first successful save and stays (it does not blink on every keystroke; no «Sparar…» state). Plain text, no live region. On failure the text changes to **«Inte sparat»** and one toast explains (once per pass). |
| **C1** | A pass from a mall (built-in), a föreningsmall, Mina mallar, the wizard, import or a received pass is saved **the moment it is created** (synchronous write, no debounce). Going back Home right after never loses it. Club, Mina mallar, import and wizard already do this (`adoptAsDraft` / `saveDraft`); the built-in mall is the gap that gets fixed. |
| **D1** | The autosaved pass is the same single pass the app already keeps (`gymnastics-planner-draft-v1`), shown on Home as **Fortsätt passet** · {title} · {n} min. No new list, menu or key. A pass that gets replaced is kept in the existing **Mina mallar** list (see «Replaced pass» below). |
| **E1** | A **Tomt pass** is not written until its first station is added. Until then Home still shows the previous pass, and «Sparat» is hidden. |
| **F1** | +512 B gz total, soft. Estimate +250–450 B (one hook, try/catch helper, two keys, a few CSS lines, minus the button and toast). Builder explains any overrun in the PR. |

### Replaced pass (data-loss guard, inside D1)

There is one pass slot. With autosave, starting something new (Tomt pass + first station, Starta från mall, Använd mall in the builder) silently replaces the pass on Home, where today it only happens on an explicit **Spara utkast**. To keep the coach from losing work: right before a write that would replace a stored pass with **a different `id`** and **at least one station**, call the existing `archiveSessionIfNew(old)` (`lib/savedTemplates.ts`). It lands in **Mina mallar** (existing list, deduped by `passSignature`, max 8). No new UI. The confirm text «Dina sparade utkast finns kvar» is rewritten to say where it went.

### Investigation summary

- **Keys:** pass = `gymnastics-planner-draft-v1` (`lib/session.ts:22`), Mina mallar = `gymnastics-planner-templates-v1` (`lib/savedTemplates.ts:6`). Same keys, same shape, **no migration**. An existing draft loads as today via `loadDraft` (it already runs `migrateHallFields` / `migrateSessionEquipment`).
- **Existing drafts:** untouched until the coach changes something; then overwritten in place (same `id`).
- **Duplicates:** impossible in the pass slot (one key). In Mina mallar the archive step dedupes by `passSignature`, so editing one pass never stacks copies; only a *replaced* pass is archived.
- **Storage full / private mode:** `saveDraft` throws today (uncaught). New `trySaveDraft` catches, returns `false`; UI shows «Inte sparat» + one toast. The pass stays in memory; nothing else breaks.
- **Untitled passes:** blank pass is «Nytt pass» (`session.ts:52`). If the coach clears the title, Home and the archive show «Nytt pass» instead of an empty name.
- **Strings mentioning Spara utkast / Utkast sparat:** `UI.saveDraft`, `UI.savedToast` (removed); `UI.templateBody` (rewritten); `UI.oppnaPaTelefonHonesty` «… där du trycker Spara» (`blockMeta.ts:719`, rewritten). See `content/microcopy.sv.md`.

## Files

- [`HANDOFF.md`](./HANDOFF.md) — Builder notes
- [`verification-checklist.md`](./verification-checklist.md) — AC1–AC22
- [`content/microcopy.sv.md`](./content/microcopy.sv.md) — final Swedish + keys

Living docs updated: `docs/ui-chrome.sv.md`, `verify-traningsplaneraren/features/passbyggaren.md`.

## Out of scope

Several saved passes / a pass list, cloud sync, undo/history, «Sparar…» spinners, save settings, changes to Mina mallar UI, Golvklart / Hallöversikt redskap saving rules (Använd alla förslag stays manual).
