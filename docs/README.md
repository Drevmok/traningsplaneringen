# Gymnastics planner — docs

Coach-facing help, activity library copy, empty-state guidance, and internal project notes.

## Current files

| File | Purpose |
| --- | --- |
| `voice-and-style.md` | How we write for new coaches |
| `slice-01-empty-states.md` | Block empty states, tips tab, builder help strings (EN) |
| `slice-01-empty-states.sv.md` | Same empty states and tips in Swedish |
| `slice-01-seed-activities.md` | Interim seed library (~30 stubs) for Slice 01 (EN) |
| `slice-01-seed-activities.sv.md` | Swedish interim seed library (~30 stubs); safer technique rewrites for held ids |
| `ui-chrome.sv.md` | Swedish UI chrome glossary for Builder (Träningsplaneraren) |

Swedish copies also live under `/workspace/gymnastics-planner/slice-01/content/` (same filenames).

## Source of truth

- Specs: `/workspace/gymnastics-planner/slice-01/`  
- Shipped UI: Builder’s app under `/workspace/gymnastics-planner/app/`  
- Docs does not invent features beyond Planner’s pack

## Workflow

1. Planner writes the slice pack  
2. Docs drafts coach-facing copy for that slice  
3. Builder wires copy (or `[Docs: …]` placeholders)  
4. Verifier checks acceptance criteria, including new-coach start time
