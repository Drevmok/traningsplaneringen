# Slice 53 — beslut

**Låst 2026-10-26 av Christoffer** i PO-chatten, ordagrant: «Ja, lås A1 B1 C1 D1 E1 F1».

Tidigare sa han «Bygg de små luckorna». Autosave (Slice 39) och markörgrid (Slice 40) är redan live; den här slicen bygger bara kvarvarande luckor.

| Fråga | Val |
|---|---|
| A | A1 — visa «Sparat» / «Inte sparat» även i Hallöversiktens verktygsrad |
| B | B1 — behåll «Sparat» utan bock (inte «Sparat ✓») |
| C | C1 — när rutnätet är fullt placeras fler markörer mellan befintliga platser |
| D | D1 — rör inte redan sparade pass |
| E | E1 — PO flyttar backlog 2026-10-13 #1–#5 till Shipped |
| F | F1 — A1+B1+C1+D1, footer Slice 53 (`SLICE_NUMBER` → 53) |

## Svar på öppna frågor
1. Ja — backlog 2026-10-13 #1–#5 flyttas till Shipped.
2. Ja — luckorna är värda en egen slice (inte F3).
3. «Sparat» utan bock.
4. Ja — smoke-fel (s33–36/s38–41/s47 + weekly double-0) ligger kvar till senare.

Mjukt bundle-tak cirka +512 B gzip. Inga anrop mot live-projektet.
