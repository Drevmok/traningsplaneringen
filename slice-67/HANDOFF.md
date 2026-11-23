# Slice 67 — HANDOFF till Builder (FÖRESLAGEN: A1 B1 C1 D1 E1 F1)

**Status:** **FÖRESLAGEN**. Builder bygger när PO skickat byggkortet efter lås (Docs pingar inte Bob). Bas main @ `329a259`, docs-gren `slice-67-docs`. **Ingen merge utan Christoffers OK.**
**SQL:** ingen schema-SQL. Data-UPDATE `content/update-station-layouts.sql` skrivs **efter** visuellt ja (finns inte i FÖRESLAGEN-packen). Christoffer klistrar in **efter merge**, och bara efter sitt **separata** ja. **Builder kör varken SQL eller `push-promote --replace`.** Agenter kör aldrig filen. Ta med filen oförändrad i ev. bygg-PR; skriv inte en ny. Anteckna **sha256** i den här filen när SQL:en finns.
**Kod:** ingen appändring vid E1. Ingen egen worktree för kod behövs förrän (om) en PR bara ska bära SQL-filen till main.
**Bundle:** orörd vid E1. `SLICE_NUMBER` kvar `'66'`. Lägg inte skiss-JSON i `seedActivities.ts`.
Huvudklonen `/workspace/gymnastics-planner` lämnas som den är. Inte S4, S5, S7–S9. Ett märke per station. Ingen 3D, ingen CAD.

## 1. Skisser (A1, B1, D1)

Efter lås: föreslå en `StationLayout` (`v: 1`, `poses` som matchar `defaultStationEquipment` ett-till-ett) per id i den **bekräftade** live-kön. Utgå från `how_to` och redskapen; den automatiska raden är start. Förhandsvisa i Admin «Saknar skiss» / StationSketch. Skriv inget till banken i det läget.

## 2. SQL-fil (C1)

När Christoffer godkänt skisserna: en idempotent `UPDATE` som **bara** sätter `public.exercises.default_station_layout` för de id:na, med `AND default_station_layout IS NULL`. Övriga kolumner orörda. Inget `DELETE`. `RETURNING id` (färre rader än listan är OK: saknad id eller skiss fanns redan). Form som `slice-61/content/update-how-to-waiting.sql` och `slice-62/content/update-progression-links.sql`. sha256 i HANDOFF. Hoppa över id som redan har skiss i live.

## 3. Footer och seed (E1)

- Rör inte `SLICE_NUMBER`, `blockMeta.ts`, `App.css` eller annan appkod.
- Rör inte `seedActivities.ts` och laga inte `export-seed.ts` i den här slicen.
- `SLICE67-SHIPPED.md` om en PR bär SQL-filen: urval (A–F), sha256, att ingen SQL körts av agenter, ev. live-kö före/efter (efter hans ja).

## 4. Tester

Inga nya enhetstester om appen är orörd. Befintliga `layoutQueue`-tester förblir gröna om någon kör `bun test src`. Ingen ny smoke (F1).

## 5. Bygg och PR

- Om E1: ev. PR mot main innehåller bara SQL-filen (plus `SLICE67-SHIPPED.md`). Ingen appdiff, ingen bundle-rad att rapportera.
- Gren i så fall `slice-67-code` från `329a259`, eller den väg PO anger. Ingen merge. Head-SHA till PO, inte till Verifier direkt.

## Avvisat (byggs inte, om ★ låses)

A2, A3, B2, B3, C2, C3, D2, D3, E2, E3, F2 och F3.
