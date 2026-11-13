-- Slice 61 — how_to-endast UPDATE: «Medan du väntar» på 16 Teknik
-- Christoffer klistrar in själv i Supabase SQL Editor EFTER merge, när Slice 61-appen
-- är live, och bara efter sitt eget ja. Körs INTE av agenter (Docs, Builder, Verifier, PO).
-- PO får köra den via Supabase MCP bara efter Christoffers ja.
--
-- Ingen schemaändring. Rör bara public.exercises.how_to för de 16 id:na.
-- Idempotent: hoppar över rad som redan har en vänt-rad, och rad där tillägget
-- skulle spräcka taket 800 tecken (CHECK char_length 1–800).
-- RETURNING visar vilka rader som faktiskt uppdaterades (färre än 16 är OK:
-- saknad id, vänt-rad finns redan, eller tillägget skulle bli längre än 800).
--
-- Viktigt: kör INTE före appen är live. Utan hjälpfunktionen räknas vänt-raden som
-- ett femte steg, och 14 Teknik med redan fyra steg försvinner ur Biblioteket.

UPDATE public.exercises AS e
SET how_to = e.how_to || E'\n' || v.line
FROM (VALUES
  ('tech-ljushopp-satsbrada',     'Medan du väntar: stå på en fot och fäll kroppen fram som till sats.'),
  ('tech-ljushopp-trampett',      'Medan du väntar: öva ljushopp på stället: armarna upp, landa mjukt.'),
  ('tech-satsbrada-volt-rygg',    'Medan du väntar: sitt i kön, haka i och öva rund rygg.'),
  ('tech-trampett-volt-mattberg', 'Medan du väntar: sitt i kön, rulla ihop och öppna igen.'),
  ('tech-grenhopp-trampett',      'Medan du väntar: öva grenhopp på golvet, landa mjukt på två fötter.'),
  ('tech-formhopp-over-block',    'Medan du väntar: hoppa ljushopp på stället och landa stilla på två fötter.'),
  ('tech-l-hang-racke',           'Medan du väntar: sitt med raka ben och håll L-formen i fem andetag.'),
  ('tech-stod-racke-pendel',      'Medan du väntar: stå i plankan på golvet och räkna till fem.'),
  ('tech-soldatsparkar-bom',      'Medan du väntar: öva soldatsparkar på golvet, armarna ut.'),
  ('tech-krabbgang-bom',          'Medan du väntar: gå krabbgång på golvet, i kön.'),
  ('tech-landning-plint',         'Medan du väntar: hoppa på stället och landa stilla: böjda knän, armarna fram.'),
  ('tech-kullerbytta',            'Medan du väntar: sitt på huk i kön, haka i och håll ryggen rund.'),
  ('tech-hjul',                   'Medan du väntar: stå i stjärna och flytta blicken mot händerna.'),
  ('tech-minihjul',               'Medan du väntar: på huk, sätt händerna i golvet en i taget och tillbaka.'),
  ('tech-aggrullning-kil',        'Medan du väntar: sitt, dra upp knäna och håll äggformen i fem andetag.'),
  ('tech-ljushopp-rockringar',    'Medan du väntar: hoppa jämfota på stället: armarna upp, benen ihop.')
) AS v(id, line)
WHERE e.id = v.id
  AND e.how_to !~ E'(^|\n)[[:space:]]*([0-9]+[.][[:space:]]*)?Medan du väntar:'
  AND char_length(e.how_to || E'\n' || v.line) <= 800
RETURNING e.id, char_length(e.how_to) AS how_to_len;
