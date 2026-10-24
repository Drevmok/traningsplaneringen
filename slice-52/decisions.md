# Slice 52 — beslut

**Låst 2026-10-24 av Christoffer** i PO-chatten, ordagrant: «Lås enligt rekommendationerna».

| Fråga | Val |
|---|---|
| A | A1 — anpassa alla sju smokes; varje ändring med `// Slice 52:` och beslutet; appen orörd |
| B | B1 — gamla dellänkar från riktiga commits i `verifier/fixtures/old-share-links.json` |
| C | C1 — gör de svaga kontrollerna verkliga igen (`ratioOk` bort, tip och toast krävs); felinjektion bevisar att de kan falla |
| D | D1 — köraren ger exit 1 utan `--baseline` vid fel; Playwright pinnas till revision 1243 |
| E | E1 — ny `slice-52-admin-import-smoke.mjs` mot fake Supabase (IMP1–IMP6) |
| F | F1 — Doctor bygger baslinjen med cachen; ogiltig fil → BLOCKED; kartan slutar kalla kända FAIL «ok» |

## Svar på öppna frågor
1. s43 AC5 ska kräva exakta knappetiketter per tillstånd.
2. «Sista main före Slice 45» är föräldern till `cd19319`.
3. Övriga kända FAIL i s33–41 och s47 blir Slice 53.
4. `weekly.sh` ska inte titta på returkoden utan `--baseline`.
5. E1 svarar på Slice 51:s fråga om coach-import.

Bundle 0 B. Ingen ändring av `SLICE_NUMBER`. Inga anrop mot live-projektet. Appen orörd.
