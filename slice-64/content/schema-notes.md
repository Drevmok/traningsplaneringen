# Slice 64 — schema

**FÖRESLAGEN, E1/D1: ingen SQL.** Ingen `schema-64.sql`, ingen `migration-plan.md`, ingen data-UPDATE, ingen ny kolumn, ingen ny CHECK, ingen triggerändring. `BANK_LIMITS` orörd.

Slicen återanvänder befintlig `default_station_layout` / `defaultStationLayout` (Slice 57) via `layoutForStation`, och den befintliga redskapslistan på posten. Inga seed-layouter läggs till. Att fylla bankens skisser via kön «Saknar skiss» är S6 (Proposed), inte den här slicen.

- `push-promote --replace` används inte.
- Hallmärken, `stationEquipment` och körningen lever på enheten. Ingen bankskrivning.
- S7 (rotationsklocka, ev. SQL) och S8 (3D / `.glb`, bundleundantag + lyft av «3D senare») ligger utanför packen.
