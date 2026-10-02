# Slice 30 — content

Pack **LOCKED 2026-10-02** — A1/B3/C1/D1/E1/F1. **Docs shipped 2026-10-02**: [`microcopy.sv.md`](./microcopy.sv.md) is final; living doc [`docs/ovningsimport.sv.md`](../../docs/ovningsimport.sv.md) mirrors the keys and adds the coach guide.

| File | Role |
|---|---|
| [`import-schema.md`](./import-schema.md) | Schema v1: envelope, exercise fields, limits, row states |
| [`example-import.json`](./example-import.json) | Two trial drills (Formhopp över block · Äggrullning nerför kil) in schema v1 — uses new ids `eq-skumblock`, `eq-kilmatta` |
| [`example-import-edge.json`](./example-import-edge.json) | One row per import rule (Verifier + `ownImport.test.ts`) |
| [`check_import.py`](./check_import.py) | `python3 slice-30/content/check_import.py <file>` — Planner self-check |
| [`redskap-library.md`](./redskap-library.md) | +5 redskap: ids, labels, sketch, zones, Förrådslista, migration |
| [`seed-promotion.md`](./seed-promotion.md) | B3 Planner → Builder process for the shipped bank |
| [`microcopy.sv.md`](./microcopy.sv.md) | Swedish strings — **Docs final** (Builder ships these keys) |
| Living target | [`docs/ovningsimport.sv.md`](../../docs/ovningsimport.sv.md) — coach guide, key mirror, do-not-touch list |

Trial adjustments in the example: redskap remapped to the new pieces; progression links pointed at seed ids that exist (`tech-ljushopp-trampett`, `tech-kullerbytta`); Planner-only fields (`confidence`, `unmappedEquipment`) kept to show they are ignored.
