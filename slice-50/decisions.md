# Slice 50 — beslut

**Låst 2026-10-23 av Christoffer** i PO-chatten, ordagrant: «Ja, lås enligt rekommendationerna». PO visade ★-valen och rekommendationerna på de öppna frågorna.

| Fråga | Val |
|---|---|
| A | A1 — fast stand-in med mallen `bank_template` (schema-31 → `bank-seed.sql` → schema-32); varje körning får en egen kopia via `createdb -T` |
| B | B1 — `install-once.sh` + `doctor.sh` (säger BLOCKED med fixkommando, installerar aldrig); mains build cachas per SHA i `/home/box/tp-verify/main/<sha>/` |
| C | C1 — `verifier/smoke-map.json` + `pick-smokes.mjs` väljer smokes från diffen; delad kärna eller okartlagda filer ger hela slingan |
| D | D1 — fixa s33 AC16d/AC11d-testet; OTP-livslängden ändras inte |
| E | E1 — de två verify-skillsen slås ihop, `-2` tas bort efter lås; «Stabila väljare» i `features/*.md`, inga `data-testid` i appen |
| F | F1 — ny verifieringstext i PROJECT.md (HANDOFF §7); full smoke varje vecka |

## Svar på öppna frågor
1. Karantän för s33 om testet faller i 2 av 20 körningar.
2. Full smoke söndag 03:00 (Stockholm), besked bara vid nytt fel. PO skapar rutinen efter merge.
3. Smokes som redan fallerar på main (s30/s31/seed, s32, s37) märks bara «trasig» i kartan och fixas i egna slices.
4. Builder och Verifier läser cachen i `/home/box/tp-verify/`; bara Doctor skriver.

Bundle 0 B. Ingen ändring av `SLICE_NUMBER`. Ingen SQL mot live-projektet.
