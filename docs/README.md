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
| `delad-bank.sv.md` | Coach doc: shared exercise bank (Slice 31–32) |
| `foreningens-mallar.sv.md` | Coach doc: Föreningens mallar in Starta från mall (Slice 36) |
| `admin.sv.md` | Coach doc: Admin — Ny egen övning, Importera övningar, granskning och Godkänn (Slice 47, LOCKED) |
| `../slice-48/` | Slice 48 Hallöversikt: Hallöversikt i raden, ändra-läge, dra med fingret, nypningen på iPhone, liggande detaljvy (LÅST 2026-10-22) |
| `dela-och-utskrift.sv.md` | Coach doc: Dela — Kopiera länk and Skriv ut passet (Slice 44, PROPOSED) |
| `planera-pass.sv.md` | Coach doc: Planera pass — fyra frågor, mall eller tomt pass, startsidans fot (Slice 46, PROPOSED) |

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
