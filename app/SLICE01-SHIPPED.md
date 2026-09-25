# Slice 01 shipped — Träningsplaneraren

**Date:** 2026-09-23 (Europe/Stockholm)  
**App path:** `/workspace/gymnastics-planner/app`

## What shipped
- Minimal home: **Nytt pass** · **Starta från mall** · **Fortsätt senaste pass**
- Passbyggaren with five locked blocks: Samling → Uppvärmning → Teknik → Styrka → Lek och spel
- Session total = sum of item durations only; blank shows `0 / 60`
- Block budgets 5 / 10 / 20 / 15 / 10 with soft overflow
- Soft mismatch banner (override-add + move); dismissible; item kept
- Item reorder within block (↑↓); move to other block via menu
- Library / Tips / Templates side panel; activity detail (Sammanfattning / Så gör du / Se upp för)
- Template confirm/cancel; clone sets `basedOnTemplateId`; template not mutated
- localStorage draft save + restore
- Export stub: disabled + **Kommer snart**
- ~30 seed activities (6/type), stub badge **Utkast**, emoji via `visualKey`
- Colors: amber / sky / violet / rose / green

## Swedish / Docs status
- Wired from Docs Swedish:
  - `slice-01/content/ui-chrome.sv.md`
  - `slice-01/content/slice-01-empty-states.sv.md`
  - `slice-01/content/slice-01-seed-activities.sv.md`
- Terminology: **pass**, **gymnaster**, app title **Träningsplaneraren**, stub **Utkast**
- Safety hold: three technique ids excluded; replacements used (see `slice-01/2026-09-23-seed-safety-hold.md`)

## How to run
```bash
cd /workspace/gymnastics-planner/app
npm install
npm run build   # production check
npm run dev     # usually http://localhost:5173
```

## Checklist v2 self-check (Builder)
- [x] Home three CTAs
- [x] Five blocks locked order + budgets + empty tips (Docs SV)
- [x] Live total computed-only `0 / 60`
- [x] Soft mismatch on override-add and move
- [x] Template ≤2 taps + confirm/cancel
- [x] Visuals (emoji) + Utkast badges
- [x] Tips panel per selected block
- [x] Save draft / Continue last pass
- [x] watchForRequired activities have non-empty Se upp för
- [x] Seed ≥6/type (with Docs replacements)
- [ ] New-coach timed test — for Verifier

## Open decisions / follow-ups
- Christoffer coach-review of `needsCoachReview` techniques before gym floor
- Whether held ids return after rewrite
- Export/share implementation (stub only)
- Phone layout polish (desktop/tablet first)
