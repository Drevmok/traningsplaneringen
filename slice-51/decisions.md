# Slice 51 — beslut

**Låst 2026-10-24 av Christoffer** i PO-chatten, ordagrant: «Lås enligt rekommendationerna».

| Fråga | Val |
|---|---|
| A | A1 — gemensam hjälpare `smoke-start.mjs` (Planera pass → Tomt pass / Starta från mall) för s37 och s42–45 |
| B | B1 — s30, s30-fix, seed och s31 läser `PW_CORE`, URL:er och `SMOKE_ROOT` från miljön; s31 körs på stand-in |
| C | C1 — s32 loggar in med kod som s33/s47; sidfoten följer `SLICE_NUMBER` |
| D | D1 — exit 1 vid FAIL; `run-smokes.sh --baseline` skriver SAMMA / NY FAIL / LAGAD och ger exit 1 vid NY FAIL |
| E | E1 — AC i karantän körs ändå som `KARANTÄN-FAIL`, räknas i `quarantine.tsv` |
| F | F1 — fem småfixar (Playwright-kontroll, `bun test src`, uppdelning av trasig, port från `TPV_HOME`, `S32_DIR`) |

## Svar på öppna frågor
1. Kända FAIL i s33–47 tas i Slice 52, inte här.
2. s46 (kraschar på main) tas med i den här slicen.
3. AC som bara testar magisk länk tas bort ur s32.
4. Karantängränsen är fortfarande ≥2 av 20. «Två i rad» gäller bara när en AC i karantän blir NY FAIL.
5. Doctors baslinje får ge exit 1 för skript med kända fel.

Bundle 0 B. Ingen ändring av `SLICE_NUMBER`. Inga anrop mot live-projektet.
