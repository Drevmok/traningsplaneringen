-- Slice 32 · steg 9b. Gör dig själv till admin.
-- Byt DIN-EPOST@exempel.se mot exakt samma e-post som du lade in under Authentication → Users (steg 9a).
-- Behåll citattecknen. Kör (Run). Säkert att köra flera gånger.
insert into public.admins (user_id, email, note)
select id, email, 'owner' from auth.users where email = 'DIN-EPOST@exempel.se'
on conflict (user_id) do nothing;
