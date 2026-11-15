-- Slice 62 — länk-endast UPDATE: progression_of / regression_of på 16 Teknik
-- Christoffer klistrar in själv i Supabase SQL Editor EFTER merge, när Slice 62-appen
-- är live, och bara efter sitt eget ja. Körs INTE av agenter (Docs, Builder, Verifier, PO).
-- PO får köra den via Supabase MCP bara efter Christoffers ja.
--
-- Ingen schemaändring. Rör bara public.exercises.progression_of och
-- public.exercises.regression_of för de 16 id:na. Övriga kolumner orörda.
-- Idempotent: hoppar över rad där båda kolumnerna redan har målvärdet.
-- RETURNING visar vilka rader som faktiskt uppdaterades (färre än 16 är OK:
-- saknad id, eller värdena fanns redan).
--
-- Till skillnad från Slice 61-vänt-raden är pasten inte farlig före live-appen
-- (kolumnerna finns redan). Kör den ändå efter merge, så chip och data kommer
-- samtidigt. Målen är befintliga seed-id; saknas ett mål slår FK:n,
-- och inget i satsen ska tvingas igenom.

UPDATE public.exercises AS e
SET progression_of = v.progression_of,
    regression_of  = v.regression_of
FROM (VALUES
  ('tech-landning-plint',         NULL,                          'tech-grenhopp-trampett'),
  ('tech-grenhopp-trampett',      'tech-landning-plint',         'tech-formhopp-over-block'),
  ('tech-formhopp-over-block',    'tech-grenhopp-trampett',      NULL),
  ('tech-minihjul',               NULL,                          'tech-hjul'),
  ('tech-hjul',                   'tech-minihjul',               NULL),
  ('tech-balansgang',             NULL,                          'tech-soldatsparkar-bom'),
  ('tech-soldatsparkar-bom',      'tech-balansgang',             NULL),
  ('tech-aggrullning-kil',        NULL,                          'tech-kullerbytta'),
  ('tech-kullerbytta',            'tech-aggrullning-kil',        NULL),
  ('tech-ljushopp-rockringar',    NULL,                          'tech-ljushopp-satsbrada'),
  ('tech-ljushopp-satsbrada',     'tech-ljushopp-rockringar',    'tech-ljushopp-trampett'),
  ('tech-ljushopp-trampett',      'tech-ljushopp-satsbrada',     NULL),
  ('tech-flickis-kudde',          NULL,                          'tech-rondat-flickis'),
  ('tech-rondat-flickis',         'tech-flickis-kudde',          NULL),
  ('tech-falla-bakat-hojd',       NULL,                          'tech-salto-fran-hojd'),
  ('tech-salto-fran-hojd',        'tech-falla-bakat-hojd',       NULL)
) AS v(id, progression_of, regression_of)
WHERE e.id = v.id
  AND (
    e.progression_of IS DISTINCT FROM v.progression_of
    OR e.regression_of IS DISTINCT FROM v.regression_of
  )
RETURNING e.id, e.progression_of, e.regression_of;
