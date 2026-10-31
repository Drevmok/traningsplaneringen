# Slice 57 — migrering och offline-cache

## SQL (Christoffer, manuellt)
1. Läs packet och ge OK.
2. Klistra in `content/schema-57.sql` i Supabase SQL Editor (före merge/deploy, se README öppen fråga 5). Kör de två verifieringsfrågorna längst ner.
3. Ingen backfill. Alla rader har `default_station_layout = null` → dagens heuristik.
4. Återställning vid behov (tar bort sparade skisser):
   `drop trigger if exists exercises_layout_check on public.exercises; alter table public.exercises drop constraint if exists exercises_layout_teknik_only; alter table public.exercises drop column if exists default_station_layout;`

Agenter kör aldrig SQL mot riktiga projektet. Inga nycklar eller URL:er i docs.

## Offline-cache (Slice 31-mönstret)
- `lib/bank.ts:31` `BANK_CACHE_KEY` stannar på `-v1`. Fältet är valfritt: gammal cache utan layout läses som förut (heuristik). Ingen versionshöjning behövs eftersom `bankRow.ts` sanerar varje rad vid läsning.
- `bankRow.ts`: lägg `'default_station_layout'` i `BANK_EXERCISE_COLUMNS` (`:43–66`), läs med `sanitizeStationLayout(raw.default_station_layout, slots)` bredvid `:174–175`, skriv i `:221`.
- Reserv om kolumnen saknas (SQL inte inklistrad): fetch-fel som nämner `default_station_layout` → hämta igen utan kolumnen, ingen layout. Testas med fixtur.
- Synk: admin sparar → `bankWrite.ts` skickar kolumnen → nästa banksynk hos ledaren skriver cachen → offline visar layouten.
