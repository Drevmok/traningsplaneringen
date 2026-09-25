# Scout playbook (APPROVED setup 2026-09-25; workflow tweaks 2026-09-25)

## Team

| Role | Id | Job |
|---|---|---|
| Planner | `7c185c83-69ac-4075-8bf5-25fa913d1869` | Orchestrates; only Christoffer-facing gate |
| Scout | `8d938891-4fba-490d-a96d-5f261cd2da81` | 2–3 evidence-tied improvement ideas |
| Docs | `844ef060-4bc2-465e-b9b4-a68643c097c9` | Swedish copy after slice approval |
| Builder | `e65fc503-309a-4284-8fe9-ad5ec47c174c` | Implements approved packs |
| Verifier | `2f693fbc-ccbd-4814-83b0-8af5f17610ca` | Checklist PASS/FAIL |

## When Scout runs

Planner pings Scout after:

- Verifier **PASS** on a slice, or
- Christoffer asks for ideas / “what’s next?”, or
- Meaningful phone feedback arrives

Not continuous. Not after every chat message.

## Scout output contract

Each run: **exactly 2–3** ideas in `backlog/IMPROVEMENTS.md` under **Proposed**, plus a short reply to Planner only.

Per idea:

1. Title  
2. Coach benefit (one sentence)  
3. Evidence (ship note / verifier / phone / docs)  
4. Effort S / M / L  
5. Suggested slice shape (one short paragraph)

When two Effort **S** ideas share the same surface (e.g. both Hallöversikt phone polish), Scout may note “bundle candidate with #N” in the slice-shape line so Planner can merge them.

## Christoffer gate (batch)

Planner presents the whole Scout run in **one** chat message, then **one** multi-select widget:

- Options = each Proposed idea (Approve that idea)
- Plus **Park the rest** and **Decline the rest** (or Park all / Decline all when none selected)

Do **not** send three sequential Approve/Park/Decline cards unless Christoffer asks to go idea-by-idea.

Only **Approved** items move to **Approved** in the backlog and may become a slice pack. Unselected ideas that Christoffer parks or declines move accordingly; if the widget is skipped, leave them under Proposed.

## Bundle related S polish

When Christoffer Approves **two or more Effort S** ideas that share the same coach surface (same screen / same loop, e.g. compose sheet + canvas remove), Planner drafts **one** polish slice pack covering both — one Docs → Builder → Verifier loop — unless Christoffer asks to split.

Effort **M** / **L** (or unrelated S ideas) stay separate packs.

## pstack (Slice 21+)

Team rigor layer: see `backlog/PSTACK-OPS.md`. Scout: tag each idea with experience-first benefit and whether it fights a standing lock. Verification source of truth for driving the app: `verify-traningsplaneraren/`.

## Hard no’s for Scout

- Implement code or Docs polish  
- Ping Docs / Builder / Verifier  
- CAD / accounts / cloud / App Store unless Christoffer asked  
- Re-propose Declined or Parked items without new evidence  
- More than 3 ideas unless Planner asks  

## After Approve

Normal spine: Planner drafts slice pack → Christoffer approves pack → Docs → Builder → Verifier → optional Netlify.

When bundling: one pack, one checklist, one ship note, one Verifier run.
