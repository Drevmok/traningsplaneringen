# Slice 49 — Planera pass fyller passet

Locked A1 B1 C1 D1 E1 F1 (no C2). Spec: `slice-49/README.md`, `slice-49/HANDOFF.md`.

## What changed
- **A1:** `WIZARD_BLOCK_MINUTES` (data/wizardPaths.ts) sets block minutes per length (60/90/120). `composeWizardSession` splits each block over its items by the skeleton ratio in whole minutes (largest remainder, ties to the first item). Teknik gets equal shares (90 → 3×12). `WIZARD_TEKNIK_DURATION` removed. Tomt pass and Starta från mall are unchanged.
- **B1:** `setSessionLength` unchanged: changing the length later only changes the target (e.g. «90 / 60 min»), times stay. Confirmed as intended by Christoffer.
- **C1:** Planera pass (Frågor path only) runs `applyAllSuggestedStationEquipment` after auto-place, with no toast. Förrådslista is filled straight away.
- **D1:** Hallöversikt: the saknar row is text only (its button is gone). The toolbar «Använd alla förslag» renders only when ≥1 station has an unsaved förslag. «Inga förslag att spara» and its disabled branch are gone. The Förrådslista pointer and the toast «Sparade redskap på {n} stationer» are kept.
- **E1:** `clubSectionVisible` = `club.items.length > 0`. There is no empty «Föreningens mallar» section for coaches. `UI.clubTemplatesEmpty` stays for Admin.
- **Dead code removed:** `pointAtApplyAllFromSaknar`, `UI.hallSaknarPointApplyAll*`, `UI.hallApplyAllSuggestedIdle`/`Disabled`, `.hall-saknar-point-cta` and `.is-idle` CSS.
- Footer «Träningsplaneraren · Slice 49».
- Living docs (§8) and feature maps (§9) updated.

## Checks
- `bun test src`: 263 pass, 0 fail. `bun test tools/bank`: 21 pass. `tsc -b`, lint (6 baseline warnings) and build are clean.
- Smoke `verifier/slice-49-builder-smoke.mjs` at 390×844, 844×390 and 1280×800 (supabase blocked): **34/34 pass**.
- Bundle (gzip -9 vs main c86175a): JS 132416 → 132500 (**+84 B**), CSS 14223 → 14169 (**−54 B**), net **+30 B** (cap +512 B).

## Not verified in the browser
- AC13–15 («Föreningens mallar» with ≥1 club template; admin empty text) need a club backend. They are covered by unit tests only (`clubSectionVisible`).
