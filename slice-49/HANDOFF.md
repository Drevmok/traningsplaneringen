# Slice 49 — HANDOFF (LOCKED)

**Status:** LOCKED A1 B1 C1 D1 E1 F1 (PO 2026-10-23, se README). Radnummer från c86175a — sök om dem på din tip.

## 1. A1 — passlängden fyller passet
- `data/wizardPaths.ts`: ny `WIZARD_BLOCK_MINUTES: Record<PassLength, Record<BlockType, number>>` enligt README A1-tabellen. Ta bort `WIZARD_TEKNIK_DURATION` (:94) eller låt den bli `WIZARD_BLOCK_MINUTES[len].techniques / 3`.
- `lib/wizard.ts` `composeWizardSession` (~88–140): sätt varje blocks övningstider från tabellen. Fördela blockminuterna på övningarna efter skelettets förhållande, hela minuter, största rest (oavgjort: första övningen). Teknik: lika delar.
- Uppdatera kommentaren på `WizardAnswers.targetMinutes` (Slice 46 D1) → «Slice 49 A1: längden styr tiderna».
- Tomt pass och mallsteget: ingen ändring (öppen fråga 3).
- B1: `setSessionLength` (`lib/session.ts:81`) oförändrad.

## 2. C1 — redskap direkt efter Planera pass
- `lib/wizard.ts:139`: `session = applyAllSuggestedStationEquipment(autoPlaceUnplaced(session)).session` (endast Frågor-vägen).
- Ingen toast. Redskapen ska synas i Förrådslista och Golvklart utan tryck.

## 3. D1 — en knapp
- `HallBoard.tsx:639–658`: ta bort `hall-saknar-point-cta`; raden blir bara text (`hallSaknarRedskapBannerText`).
- `HallBoard.tsx:611–628`: rendera knappen bara när `eligibleSuggestedCount >= 1`. `applyAllBtnRef`/highlight finns kvar för Förrådslistas pekare (Slice 24, :439).
- Efter tryck: resultattoast som i dag («Sparade redskap på {n} stationer»), knappen försvinner.

## 4. E1 — Föreningens mallar
- `components/ClubTemplates.tsx:35–37`: `return club.items.length > 0`.
- Grenen `club.items.length === 0` (:48–49) i `ClubTemplatesSection` blir oåtkomlig → ta bort. `UI.clubTemplatesEmpty` behövs fortfarande i `ClubAdminSection.tsx:51`.

## 5. Död kod (ta bort)
- `HallBoard.tsx` `pointAtApplyAllFromSaknar` (:446–448).
- `UI.hallSaknarPointApplyAll`, `UI.hallSaknarPointApplyAllAria` (`data/blockMeta.ts:390–395`, sök).
- `UI.hallApplyAllSuggestedIdle` «Inga förslag att spara» (:379–388) och dess disabled-gren.
- CSS för `.hall-saknar-point-cta` i `App.css` (sök).
- `ClubTemplatesSection` tom-gren (§4).
- `WIZARD_TEKNIK_DURATION` om den inte längre används.
Behåll: `pointAtApplyAll`, `UI.hallSaknarPointToast` om Förrådslista använder den (sök), `forradslistaPointApplyAll`, `UI.hallApplyAllSuggestedNone`.

## 6. SLICE_NUMBER '48' → '49'
- `data/blockMeta.ts:97`.
- `lib/feedback.test.ts:25` ('Version: Slice 48'), `:45`, `:46`.
- `lib/clubTemplates.test.ts:316`.

## 7. Tester
- `lib/wizardSteps.test.ts:41–51` (Slice 46 D1, `totalMinutes === 53`): byt till Slice 49 A1 — 60/90/120 ger `totalMinutes` 60/90/120, båda hallarna, alla fokus och 4–6 år.
- Nytt: blocksummor enligt tabellen; alla tider hela minuter ≥ 1.
- Nytt: efter `composeWizardSession` har varje placerad Teknik med `defaultStationEquipment` sparade redskap.
- Nytt: `clubSectionVisible` falskt för `fresh` + 0 mallar, sant för ≥ 1.
- Kör `cd app && bun test src`.

## 8. Levande docs
- `docs/planera-pass.sv.md`, `docs/home-wizard.sv.md`: längden fyller passet; ta bort «53 min».
- `docs/anvand-alla-forslag.sv.md`, `docs/saknar-redskap-banner.sv.md`: Planera pass fyller i redskap; en knapp; raden är bara text.
- `docs/foreningens-mallar.sv.md`: sektionen syns bara med mallar.
- `docs/forradslista.sv.md`, `docs/forrad-empty-soft-path.sv.md`: tomtexten gäller nu bara mall/Tomt pass.
- `docs/README.md`: rad för Slice 49.
- `backlog/IMPROVEMENTS.md`: Polish #5 → del av Slice 49; Scout 2026-10-23 #1–#3 → Slice 49.

## 9. Verifier feature maps (`verify-traningsplaneraren/features/`)
- `home-kom-igang.md` / `passbyggaren.md`: «53 / X» → «X / X min».
- `kor-passet.md`: start «Kvar: 60/90/120 min».
- `hall-redigera-redskap.md`: en «Använd alla förslag», saknar-raden utan knapp, ingen «Inga förslag att spara».
- `golvklart-forrad.md`: Förrådslista fylld direkt efter Planera pass.
- `starta-fran-mall.md`: ingen tom «Föreningens mallar»; mall-start fyller inte redskap (C1).
