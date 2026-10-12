# Slice 35 — «Tyck till»: feedbacklänk i sidfoten

**App:** Träningsplaneraren  
**Status:** **LOCKED 2026-10-11.** Approved 2026-10-11 per Planner; A1–F1 locked on the recommended answers. Docs pack only, no app code. Branch `slice-35-docs` from `main` @ `7a2a813` (Slice 34 code merge, PR #37).  
**Effort:** S.

## Why

Coaches have no quiet way to tell us what worked and what didn't. One footer link that opens their own mail app, already prefilled, lowers the bar without accounts, tracking or nagging.

**Coach outcome:** "Jag trycker på «Tyck till», skriver några rader i mejlet och skickar."

## Locks

| Lock | Decision |
|---|---|
| **A1** | Footer link «Tyck till» → `mailto:drevmok@gmail.com`, subject «Tyck till om Träningsplaneraren», short Swedish body with three prompts (vad fungerade, vad var krångligt, vad saknade du) and a version line «Version: Slice {n}» from the same source as `footerSliceLabel`. |
| **B1** | No accounts, no storage, no backend, no analytics. |
| **C1** | One link, in the footer only. No popups, no prompts, no nagging. |
| **D1** | Works in the installed PWA (iOS + Android). A real `<a href="mailto:…">`. A mail app can't be detected, so after a tap one quiet line with the address is shown (selectable, plus «Kopiera adressen» via Clipboard API, failing silently). See HANDOFF §4. |
| **E1** | The app works fully offline as today; the link needs only a mail app (the mail is queued by the mail app). |
| **F1** | Bundle grows by **< 0.5 kB gzipped** (512 bytes), measured main vs branch. |

## Files

- [`HANDOFF.md`](./HANDOFF.md) — Builder notes
- [`verification-checklist.md`](./verification-checklist.md) — AC1–AC16
- [`content/microcopy.sv.md`](./content/microcopy.sv.md) — final Swedish + keys

## Out of scope

In-app forms, ratings, feedback backends, analytics, prompts to give feedback, screenshots/attachments, device info in the mail.
