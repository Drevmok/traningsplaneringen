# Slice 68 — schema

**LÅST A1 (25 nov 2026 13:42):** ny tabell `public.club_equipment`. Ingen ändring av `club_templates`, `exercises` eller `redskap`. `BANK_LIMITS` orörd. `EQUIPMENT_PIECES` (15) förblir appens bibliotek; `public.redskap` förblir katalogen.

Filer (aldrig körda av agenter):

- `sql/68-01-club-equipment.sql` — tabell, index, trigger, RLS, grants. Additivt, `IF NOT EXISTS` / `DROP POLICY IF EXISTS`. Ingen `DELETE`.
- `sql/68-02-smoke.sql` — bara läsande kontroller (tabell, RLS, grants, ingen delete-policy).

En rad, `id = 'club'`. `piece_ids` jsonb-array (tom array är giltig och betyder «inget av de 15»). Ingen rad betyder *inte ifylld* — appen behandlar då alla 15 som tillgängliga. Okända id saneras i klienten, inte med en hårdkodad id-lista i SQL.

Samma mönster som Slice 36: `public.touch_row()` och `private.stamp_updated_by()` återanvänds; anon + authenticated läser; write bara via `private.is_admin()`; `service_role` får inget; ingen delete-policy och ingen delete-grant. Hemlig nyckel ingår inte.

Efter merge, bara efter Christoffers **separata** ja (han klistrar in, eller PO via Supabase MCP efter hans OK). Builder tar med filerna oförändrade och kör dem inte.
