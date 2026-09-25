# Verification checklist — Slice 03 (real drill library)

**Sole authority for Slice 03.** Do not regress Slice 01/02.

## Library content
- [ ] Activity library has **28** drills: samling 3 · uppvärmning 5 · teknik 9 · styrka 3 · lek 8
- [ ] All show as real drills (**not** Utkast/stub)
- [ ] Swedish copy; terminology **gymnaster** + **pass**
- [ ] Distinct warm-up **1-2-3 (voltpositioner)** vs fun **1-2-3 (förflyttningslek)**
- [ ] Exactly two **experiencedCoachOnly**: `tech-rondat-flickis`, `tech-salto-fran-hojd`
- [ ] Those two show a clear badge + warning in picker and detail; still visible (not hidden)
- [ ] Other teknik drills are new-coach OK

## Behavior smoke
- [ ] Add drills from each block into a pass
- [ ] Soft mismatch / block filter still works
- [ ] Templates still open; beginner/short templates avoid experienced-only drills
- [ ] `tmpl-short-45` item-sum ≈ 45; `tmpl-beginner-60` uses new-coach-safe drills
- [ ] Draft save/restore still works
- [ ] Phone sheet (Slice 02) still opens library

## Automatic fail
- Stubs still dominate the default library
- Experienced-only drills lack badge/warning
- Wrong count per block (±0 required)
- Desktop or phone builder regresses core flows

## Verifier notes
Record: how to run, counts observed, screenshots of badge + one drill per block, pass/fail.
