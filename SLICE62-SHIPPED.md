# Slice 62 — «Lättare» / «Svårare» på Teknik-raden + import behåller «Medan du väntar» (A1 B1 C1 D1 E1 F1)

Beslut: [`slice-62/decisions.md`](slice-62/decisions.md) (Docs `slice-62-docs` @ `6b97735`, låst av Christoffer 2026-11-15 09:41: «Ja, lås A1 B1 C1 D1 E1 F1»). Bas main @ `04af122`. Kod-commit `ef0f789`; head-SHA står i PR:en.

**Merga inte** — väntar på verifiering och Christoffers OK.

## Vad
- **A1/B1:** ny `app/src/lib/variantLinks.ts`: `easierOf` / `harderOf` (egen länk först, annars omvänd länk i katalogen `activitiesForBlock`, som skydd om en seed glider; aldrig sig själv eller saknat id) och `swapSessionActivity` (byter bara `activityId`; `item.id`, minuter, anteckning, ordning och `stationEquipment` kvar). Inte i `session.ts`.
- **B1:** `BlockCard` visar «Lättare» / «Svårare» under titeln på Teknik-rader, bara den som har mål (ingen rad alls för t.ex. Bro). Återanvänder `.item-tip-more`; ingen ny CSS. `stopPropagation`. Inte i Kör passet eller Skriv ut passet. Hallöversikt orörd (märket sitter på `item.id`).
- **C1:** 9 reciproka par / 16 Teknik i `seedActivities.ts` enligt `slice-62/content/microcopy.sv.md` (12 nya fält, inkl. `hjul.progressionOf` och `balansgang.regressionOf`, och par 8–9). Inga par strukna.
- **D1:** `ownImport.ts` sparar `howTo` med `composeHowTo(raw.howTo, waitingText(raw.howTo))`. Utan vänt-rad identiskt med `normalizeHowTo`.
- **E1:** `SLICE_NUMBER = '62'`. `UI.easier` «Lättare», `UI.harder` «Svårare».

## Live-banken (A1)
`slice-62/content/update-progression-links.sql` följer med **oförändrad** (sha256 `eb00c186795465129f95ca015e5a6b621786ab712aef7fa97826b9f2041ab152`, samma som i `6b97735`). Den hade **inte** körts vid skeppet. Christoffer (inte Builder eller någon bot) skulle klistra in den **efter merge**, när appen är live, och bara efter sitt **separata** ja (eller PO via Supabase MCP efter hans OK). Den rör bara `progression_of` och `regression_of` för de 16 id:na och är idempotent.

**Uppdatering 2026-11-16 (PO):** `update-progression-links.sql` kördes på live 2026-11-15 ca 15:15 (Europe/Stockholm) med Christoffers ja. 11 rader uppdaterades, 5 hade redan rätt värde, och alla 16 Teknik är länkade.

## Resultat
- `bun test src`: **335/0** (main 327/0; +7 i `lib/variantLinks.test.ts`, +1 i `ownImport.test.ts`). Footer-litteraler 61→62 i `feedback.test.ts` och `clubTemplates.test.ts`.
- `npm run build` exit 0. `npm run lint` exit 0, 8 varningar (samma som main).
- Bundle (assets js+css, gzip -9): main **220256** → gren **220602** = **+346 B** gzip (budget +512 B). Raw 793278 → 794549 = +1271 B.

## Doctor och smokes
Doctor **PASS** (main-cache 04af122). `pick-smokes 04af122 HEAD` → **hela loopen** (`app/src/data/blockMeta.ts` är delad kärna). Alla 22 skript körda mot main-baseline: **22/22 SAMMA, inga NY FAIL**. slice-33 körs inte av pick-smokes (bara main-baslinjen). Netlog 3967 anrop, **0 till live-projektet**.

seed-2DJ 64/0 · s30 46/0 · s30-fix-b1 11/0 · s31 47/0 · s32 78/0 · s34 31/0 · s35 41/0 · s36 46/46 · s37 24/24 · s38 26/0 · s39 38/0 · s40 20/0 · s41 34/34 · s42 24/24 · s43 18/18 · s44 32/32 · s45 41/41 · s46 37/37 · s47 32/32 · s48 80/80 · s49 34/34 · s52-admin-import 6/0.

## UI-väg (Builder, lokal preview, 390×844 och 844×390)
Minihjul: bara «Svårare» → Hjul (samma rad, minuter kvar) → bara «Lättare» → Minihjul. Grenhopp: båda chippen. Bro: inga. Chip täcker inte ×. Kör passet: inga chip. Footer «Slice 62». 0 anrop till live-värden. 19/19 PASS.
