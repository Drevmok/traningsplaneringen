# Slice 65 — schema

**FÖRESLAGEN, E1/D1: ingen SQL.** Ingen `schema-65.sql`, ingen `migration-plan.md`, ingen data-UPDATE, ingen ny kolumn, ingen ny CHECK, ingen triggerändring. `BANK_LIMITS` orörd.

Slicen återanvänder befintlig `default_station_layout` / `defaultStationLayout` (Slice 57) via `layoutForStation`, och den befintliga redskapslistan på posten. Avbockning i «Bygg hallen» är UI-minne, inte ett sessionsfält och inte en databaskolumn. Inga seed-layouter läggs till.

- `push-promote --replace` används inte.
- Hallmärken, `stationEquipment` och körningen lever på enheten. Ingen bankskrivning.
- S9 (föreningens tillgängliga redskap; ev. SQL) ligger utanför packen. S6, S7 och S8 likaså.
