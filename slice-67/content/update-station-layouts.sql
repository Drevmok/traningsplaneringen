-- Slice 67 — skiss-endast UPDATE: default_station_layout på 11 Teknik
-- Christoffer klistrar in själv i Supabase SQL Editor EFTER merge, och bara efter sitt
-- eget SEPARATA ja. Körs INTE av agenter (Docs, Builder, Verifier, PO). PO får köra den
-- via Supabase MCP bara efter Christoffers ja.
-- Builder tar med den här filen OFÖRÄNDRAD i bygg-PR:en; skriver inte en ny. Builder kör den inte.
--
-- Ingen schemaändring. Rör bara public.exercises.default_station_layout för de 11 id:na
-- som Christoffer godkände 2026-11-23 11:45 («Godkänn de 11 säkra skisserna, hoppa över de
-- osäkra och de enkla»). Övriga kolumner orörda. Inget DELETE, inget INSERT, inget --replace.
-- Idempotent: varje UPDATE har AND default_station_layout IS NULL, så en redan sparad skiss
-- skrivs aldrig över. RETURNING id visar vilka rader som faktiskt uppdaterades (färre än 11
-- är OK: saknad id, eller skissen fanns redan).
-- Skiss-JSON är exakt slice-67/layouts/<id>.json. Triggern check_exercise_layout (Slice 57)
-- avvisar en skiss vars poser inte matchar default_station_equipment.
-- Kontroll efteråt (read-only): slice-67/content/check-station-layouts.sql.

-- Ljushopp på trampett
UPDATE public.exercises
SET default_station_layout = '{
  "v": 1,
  "poses": [
    {
      "pieceId": "eq-trampett",
      "x": 0.419,
      "z": 0.5,
      "yaw": 0
    },
    {
      "pieceId": "eq-landningsmatta",
      "x": 0.678,
      "z": 0.5,
      "yaw": 0
    }
  ]
}'::jsonb
WHERE id = 'tech-ljushopp-trampett' AND default_station_layout IS NULL
RETURNING id;

-- Satsbräda volt till rygg
UPDATE public.exercises
SET default_station_layout = '{
  "v": 1,
  "poses": [
    {
      "pieceId": "eq-satsbrada",
      "x": 0.396,
      "z": 0.5,
      "yaw": 0
    },
    {
      "pieceId": "eq-landningsmatta",
      "x": 0.632,
      "z": 0.5,
      "yaw": 0
    }
  ]
}'::jsonb
WHERE id = 'tech-satsbrada-volt-rygg' AND default_station_layout IS NULL
RETURNING id;

-- Rondat–flickis
UPDATE public.exercises
SET default_station_layout = '{
  "v": 1,
  "poses": [
    {
      "pieceId": "eq-tumblingmatta",
      "x": 0.355,
      "z": 0.5,
      "yaw": 0
    },
    {
      "pieceId": "eq-landningsmatta",
      "x": 0.628,
      "z": 0.5,
      "yaw": 0
    }
  ]
}'::jsonb
WHERE id = 'tech-rondat-flickis' AND default_station_layout IS NULL
RETURNING id;

-- Falla bakåt från höjd till rygg
UPDATE public.exercises
SET default_station_layout = '{
  "v": 1,
  "poses": [
    {
      "pieceId": "eq-plint",
      "x": 0.434,
      "z": 0.5,
      "yaw": 0
    },
    {
      "pieceId": "eq-madrass",
      "x": 0.572,
      "z": 0.5,
      "yaw": 0
    }
  ]
}'::jsonb
WHERE id = 'tech-falla-bakat-hojd' AND default_station_layout IS NULL
RETURNING id;

-- Salto från höjd
UPDATE public.exercises
SET default_station_layout = '{
  "v": 1,
  "poses": [
    {
      "pieceId": "eq-plint",
      "x": 0.363,
      "z": 0.5,
      "yaw": 0
    },
    {
      "pieceId": "eq-landningsmatta",
      "x": 0.572,
      "z": 0.5,
      "yaw": 0
    }
  ]
}'::jsonb
WHERE id = 'tech-salto-fran-hojd' AND default_station_layout IS NULL
RETURNING id;

-- Balansgång
UPDATE public.exercises
SET default_station_layout = '{
  "v": 1,
  "poses": [
    {
      "pieceId": "eq-kon",
      "x": 0.204,
      "z": 0.5,
      "yaw": 0
    },
    {
      "pieceId": "eq-kon",
      "x": 0.401,
      "z": 0.5,
      "yaw": 0
    },
    {
      "pieceId": "eq-kon",
      "x": 0.599,
      "z": 0.5,
      "yaw": 0
    },
    {
      "pieceId": "eq-kon",
      "x": 0.796,
      "z": 0.5,
      "yaw": 0
    }
  ]
}'::jsonb
WHERE id = 'tech-balansgang' AND default_station_layout IS NULL
RETURNING id;

-- Grenhopp från trampett
UPDATE public.exercises
SET default_station_layout = '{
  "v": 1,
  "poses": [
    {
      "pieceId": "eq-trampett",
      "x": 0.419,
      "z": 0.5,
      "yaw": 0
    },
    {
      "pieceId": "eq-landningsmatta",
      "x": 0.678,
      "z": 0.5,
      "yaw": 0
    }
  ]
}'::jsonb
WHERE id = 'tech-grenhopp-trampett' AND default_station_layout IS NULL
RETURNING id;

-- Formhopp över block från trampett
UPDATE public.exercises
SET default_station_layout = '{
  "v": 1,
  "poses": [
    {
      "pieceId": "eq-trampett",
      "x": 0.288,
      "z": 0.5,
      "yaw": 0
    },
    {
      "pieceId": "eq-skumblock",
      "x": 0.487,
      "z": 0.5,
      "yaw": 0
    },
    {
      "pieceId": "eq-landningsmatta",
      "x": 0.704,
      "z": 0.5,
      "yaw": 0
    }
  ]
}'::jsonb
WHERE id = 'tech-formhopp-over-block' AND default_station_layout IS NULL
RETURNING id;

-- L-häng i räcke
UPDATE public.exercises
SET default_station_layout = '{
  "v": 1,
  "poses": [
    {
      "pieceId": "eq-landningsmatta",
      "x": 0.5,
      "z": 0.5,
      "yaw": 0
    },
    {
      "pieceId": "eq-racke",
      "x": 0.5,
      "z": 0.5,
      "yaw": 0
    }
  ]
}'::jsonb
WHERE id = 'tech-l-hang-racke' AND default_station_layout IS NULL
RETURNING id;

-- Soldatsparkar på bom
UPDATE public.exercises
SET default_station_layout = '{
  "v": 1,
  "poses": [
    {
      "pieceId": "eq-bom",
      "x": 0.36,
      "z": 0.5,
      "yaw": 0
    },
    {
      "pieceId": "eq-landningsmatta",
      "x": 0.643,
      "z": 0.5,
      "yaw": 0
    }
  ]
}'::jsonb
WHERE id = 'tech-soldatsparkar-bom' AND default_station_layout IS NULL
RETURNING id;

-- Ljushopp i rockringar
UPDATE public.exercises
SET default_station_layout = '{
  "v": 1,
  "poses": [
    {
      "pieceId": "eq-rockring",
      "x": 0.253,
      "z": 0.1,
      "yaw": 0
    },
    {
      "pieceId": "eq-rockring",
      "x": 0.418,
      "z": 0.9,
      "yaw": 0
    },
    {
      "pieceId": "eq-rockring",
      "x": 0.582,
      "z": 0.1,
      "yaw": 0
    },
    {
      "pieceId": "eq-rockring",
      "x": 0.747,
      "z": 0.9,
      "yaw": 0
    }
  ]
}'::jsonb
WHERE id = 'tech-ljushopp-rockringar' AND default_station_layout IS NULL
RETURNING id;
