# What lives where — device (localStorage) vs shared bank (Supabase)

## Moves to the shared bank (Slice 31)

| Data | Before | After |
|---|---|---|
| 51 seed exercises | `app/src/data/seedActivities.ts` | `public.exercises` (source of truth from Slice 32; bundled file = fallback snapshot) |
| Seed Säkerhet lines | `ACTIVITY_SAFETY` in `activityTips.ts` | `exercises.safety_line` |
| 15 redskap labels | `app/src/data/equipmentPieces.ts` | `public.redskap` (labels/validation only; icons, sketch, zones stay code) |

## Stays on the device (unchanged keys)

| Key | What | Notes |
|---|---|---|
| `gymnastics-planner-draft-v1` | Current pass (Passbyggaren, hall placements) | Stores activity **ids** only → resolves via bank |
| `gymnastics-planner-own-activities-v1` | Egna övningar (cap 100) | Never uploaded. Own ids `own-…` never collide with bank ids |
| `gymnastics-planner-templates-v1` | Egna mallar | ids only |
| `gymnastics-planner-tips-v1` | Coach tips state | — |
| `gymnastics-planner-owned-equipment-v1` · `…-seen-v1` | "Vad finns i hallen ikväll?" | Code catalog of 15 still decides known ids |
| `gymnastics-planner-library-tonight-v1` | Tonight filter | — |

## New on the device

| Key | Slice | What |
|---|---|---|
| `gymnastics-planner-bank-cache-v1` | 31 | `{ v: 1, fetchedAt, exercises: Activity[], redskapLabels: {id: labelSv} }` — last good bank. ~70 kB. Corrupt/unknown `v` → ignored |
| `gymnastics-planner-admin-auth-v1` | 32 | Supabase session (admins only, set via `storageKey`). Removed on **Logga ut**. Coaches never get this key |
| PKCE verifier (`…-code-verifier`) | 32 | Short-lived, written by supabase-js while a login link is pending |

## Lookup order (sync, unchanged signature)

`getActivityById(id)` → **own** (`findOwnActivity`) → **bank** (published + hidden, from fresh fetch or cache) → **bundled** seeds → `undefined`.  
Lists (Biblioteket, `activitiesForBlock`, import duplicate check) use **published** bank rows (+ own). Hidden rows never listed; pending rows never reach a coach's device.
