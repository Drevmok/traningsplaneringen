# Slice 58 — migrering och offline-cache

## SQL
**Ingen** (LÅST A1, 2026-11-01). Valfria `content/schema-58.sql` hoppas över i detta lås — krävs inte och klistras inte in. Filen ligger kvar som referens för en ev. senare skärpning.

## Bakåtkompatibilitet
- Befintliga layouter (Slice 57): ingen `y`, ingen `surface` → golvet, auto-yta. Ingen backfill.
- Rundtur: sanering skriver inte ut `y: 0` eller tom `surface`, så orörda rader ändras inte vid spara.
- Äldre klient (Slice 57-bundle i cache): läser ny layout platt; sparar den om tappas `y`/`surface`. Bara admin skriver; notera i ship notes.

## Offline-cache
- `BANK_CACHE_KEY` stannar `-v1`. `bankRow.ts` sanerar varje rad vid läsning.
- Egna övningar (`ownActivities.ts`) följer samma sanering; lokal lagring oförändrad nyckel.
