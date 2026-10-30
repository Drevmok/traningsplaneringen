# Slice 54 — beslut

**Låst 2026-10-30 av Christoffer** i PO-chatten, ordagrant: «Ja, lås A1 B1 C1 D1 E1 F1».

| Fråga | Val |
|---|---|
| A | A1 — alla startklick och «Nästa» går via `smoke-start.mjs` (s33–36, s38–41) |
| B | B1 — sidfotskontroller läser `sliceNumber(ROOT)`; mallsträngar hanteras |
| C | C1 — s35-selektorer begränsas till `.app-footer-row` och `.footer-feedback-hint` |
| D | D1 — s36 loggar in med `codeLogin` från `smoke-login.mjs` |
| E | E1 — s40 AC8-main läser golden-filen; s47 öppnar Hallöversikt via headerknappen |
| F | F1 — `weekly.sh` får `cnt()` (fixar dubbel-0); `smoke-map.json` får baseline ok för de nio skripten |

Bundle 0 B. `SLICE_NUMBER` stannar på 53. Bara `verifier/` ändras. Inga anrop mot live-projektet. Appen orörd.
