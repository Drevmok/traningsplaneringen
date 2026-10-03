-- Slice 32 · steg 9b kontroll. Ska visa en rad: din e-post · owner.
-- Inga rader = e-posten i 03-admin-insert.sql stämmer inte exakt med steg 9a. Rätta och kör 03 igen.
select email, note from public.admins;
