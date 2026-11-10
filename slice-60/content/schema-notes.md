# Slice 60 — schema

**Med ★ C1: ingen SQL mot riktiga banken.** Ingen `schema-60.sql` och ingen `migration-plan.md` i packen.

- Live har `default_station_layout` sedan Slice 57 (`slice-57/content/schema-57.sql`, inklistrad av Christoffer före merge av PR #62).
- Den lokala stand-in-mallen (`bank_template`) får samma fil, körd av `verifier/slice-32-local/setup.sh --template` via Doctor. Det är en lokal testdatabas och påverkar inte live.
- `schema-58.sql` ingår inte: låst «HOPPAS ÖVER» i Slice 58 och inte inklistrad live. Mallen ska spegla live, inte valfria filer.
- Seedens rader har ingen layout. Kolumnen blir `null` för alla rader, och triggern `check_exercise_layout` släpper igenom `null`.
- Med G2 (inte ★) ändras inget schema heller. Reservhämtningen gäller bara en bank utan kolumnen.
