# Slice 61 — «Medan du väntar» i Teknik-text (A1 B1 C2 D1 E1 F1)

Beslut: [`slice-61/decisions.md`](slice-61/decisions.md) (Docs `slice-61-docs` @ `49ecc0d`, låst av Christoffer 2026-11-12 12:35: «A1 B1C2 D1 E1 F1»). Bas main @ `9d4813b`. Kod-commit `25a40d7`; head-SHA står i PR:en.

**Merga inte** — väntar på verifiering och Christoffers OK.

## Vad
- **A1:** ny `app/src/lib/waitingLine.ts` (`WAITING_PREFIX`, `isWaitingLine`, `waitingText`, `waitingLine`, `howToSteps`, `composeHowTo`). `parseHowLines` hoppar över raden `Medan du väntar: …`, så den aldrig räknas som steg. Det behövs eftersom **14 av 24 Teknik redan har 4 steg**: en femte rad hade annars fått `rowToEntry` att släppa hela övningen. `floorTip` använder `parseHowLines`.
- **Formulär:** valfritt fält «Medan du väntar» (max 120 tecken, hint från microcopy) under «Så gör du» i Ny egen övning och Ändra övning i banken. Sparas med `composeHowTo` (steg + ev. rad, totalt ≤ 800; vänt-texten kortas, inte stegen). Tomt fält tar bort raden.
- **D1:** raden visas som egen text (inte som `li`) under «Så gör du» i detaljvyn (`.howto-waiting`), på golvkortet före «Se upp för» (`.activity-tip-waiting`) och i Kör passet direkt under cue (`.run-waiting`). Cue är fortfarande första steget. Hallöversikt, Redigera redskap, Planera pass och Skriv ut passet är orörda.
- **B1:** de 16 id:na i `slice-61/content/microcopy.sv.md` har exakt raden som sista `howTo`-rad i `seedActivities.ts`. De 8 övriga Teknik (5 spotting-tunga + bro, balansgång, åsnesparkar) har ingen.
- **E1:** `SLICE_NUMBER = '61'`. `UI.waitingLabel` och `UI.waitingHint`.

## Live-banken (C2)
`slice-61/content/update-how-to-waiting.sql` följer med **oförändrad** (byte-identisk med `49ecc0d`). Den har **inte** körts. Christoffer (inte Builder eller någon bot) klistrar in den i Supabase SQL Editor **efter merge**, när appen är live, och bara efter sitt eget ja (eller PO via Supabase MCP efter hans OK). Den rör bara `exercises.how_to` för de 16 id:na och är idempotent. Körs den före appen är live räknas raden som ett femte steg och 14 Teknik med fyra steg försvinner ur Biblioteket.

## Resultat
- `bun test src`: **327/0** (main 319/0; +8 nya i `lib/waitingLine.test.ts`). Tre testlitteraler för footern 59→61 uppdaterade (`feedback.test.ts`, `clubTemplates.test.ts`); `seedActivities.test.ts` (2DJ «≤4 steps») räknar nu med `parseHowLines`.
- `npm run build` (tsc -b + vite) exit 0. `npm run lint` exit 0, 8 varningar (samma antal som main).
- Bundle gzip (assets js+css, gzip -9): main **219746** → gren **220256** = **+510 B** (budget +512 B). Raw 790830 → 793278 = +2448 B. Per chunk gz: index.js +495, AdminBankForm.js +77, index.css +16, AdminDetailPanel.js −14, övriga ±1.

## Doctor
`verifier/tools/doctor.sh`: **PASS** (main-cache 9d4813b byggd, baseline 23 rader giltig).

## Smokes (mot main-baseline 9d4813b; enligt byggkortet)
| Smoke | Resultat |
|---|---|
| seed-2DJ_oMM81mI-smoke | 64/0 SAMMA |
| slice-30-builder-smoke | 46/0 SAMMA |
| slice-30-fix-b1-smoke | 11/0 SAMMA |
| slice-34-builder-smoke | 31/0 SAMMA |
| slice-38-builder-smoke | 26/0 SAMMA |
| slice-47-builder-smoke | 32/32 SAMMA |

Netlog: 507 anrop, 0 till live-projektet. Obs: `pick-smokes 9d4813b <head>` säger **hela loopen**, eftersom `data/blockMeta.ts` och `App.css` är delad kärna. Byggkortet begränsade körningen till de sex ovan.

## UI-väg (Builder, 390×844 och 844×390, lokal preview)
Ljushopp på satsbräda: detaljvyn visar raden under «Så gör du» och steglistan har 3 rader; golvkortet har 3 `li` och raden före «Se upp för»; Kör passet visar cue = första steget och raden under, utan rad på övningar som saknar den; footer «Slice 61»; inga sidfel. 16/16 PASS.

## Kända begränsningar
- `ownImport` (JSON-import av egna övningar) normaliserar `howTo` med `normalizeHowTo` och tappar därför en ev. vänt-rad. Det ligger utanför packen och har inte ändrats.
