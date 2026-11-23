-- Slice 67 F1 — READ-ONLY kontroll efter att update-station-layouts.sql körts (bara SELECT).
-- 1) De 11 godkända id:na: alla ska ha default_station_layout satt (has_layout = true).
SELECT id, title, default_station_layout IS NOT NULL AS has_layout
FROM public.exercises
WHERE id IN (
  'tech-ljushopp-trampett',
  'tech-satsbrada-volt-rygg',
  'tech-rondat-flickis',
  'tech-falla-bakat-hojd',
  'tech-salto-fran-hojd',
  'tech-balansgang',
  'tech-grenhopp-trampett',
  'tech-formhopp-over-block',
  'tech-l-hang-racke',
  'tech-soldatsparkar-bom',
  'tech-ljushopp-rockringar'
)
ORDER BY id;

-- 2) Kvar i kön «Saknar skiss»: Teknik, inte dold, med redskapsförslag, utan skiss.
--    Före körning (live 2026-11-23, publik läsning): 25. Väntat efter: 14 (25 − 11), plus ev. väntande rader.
SELECT count(*) AS kvar_i_kon
FROM public.exercises
WHERE block_type = 'techniques'
  AND status <> 'hidden'
  AND jsonb_typeof(default_station_equipment) = 'array'
  AND jsonb_array_length(default_station_equipment) > 0
  AND default_station_layout IS NULL;
