# Data model — Slice 01

## Core entities

### Activity
Reusable library item a coach can drop into a session block.

| Field | Type | Notes |
|---|---|---|
| id | string | Stable id |
| title | string | Short name, coach-facing |
| blockType | enum | `gathering` \| `warmup` \| `techniques` \| `strength` \| `fun_and_games` |
| durationMinutesDefault | number | Suggested minutes |
| summary | string | 1–2 sentences |
| howTo | string | Steps / coaching cues |
| watchFor | string | Common mistakes / safety |
| watchForRequired | boolean | If true, empty watchFor is an auto-fail |
| visualKey | string | Thumbnail or illustration key |
| difficulty | enum | `intro` \| `easy` \| `medium` \| `hard` |
| tags | string[] | e.g. `floor`, `vault`, `beam`, `bars`, `group`, `equipment-free` |
| equipment | string[] | Optional |
| progressionOf | string? | Optional parent activity id |
| regressionOf | string? | Optional |

### SessionTemplate
Saved starter session for new coaches.

| Field | Type | Notes |
|---|---|---|
| id | string | |
| title | string | e.g. "Beginner recreational — 60 min" |
| description | string | When to use it |
| targetLevel | enum | `new_coach_safe` \| `beginner` \| `intermediate` |
| totalMinutes | number | |
| blocks | SessionBlock[] | Ordered |

### Session
A concrete plan a coach is editing or running.

| Field | Type | Notes |
|---|---|---|
| id | string | |
| title | string | Editable |
| date | date? | Optional for MVP |
| totalMinutes | number | Computed from SessionItem durations only (not independently editable in Slice 01) |
| notes | string | Free coach notes |
| basedOnTemplateId | string? | |
| blocks | SessionBlock[] | Ordered; default five types |

### SessionBlock
One section of a session.

| Field | Type | Notes |
|---|---|---|
| id | string | |
| type | enum | Same as Activity.blockType |
| title | string | Default from type; override allowed |
| durationMinutes | number | Block budget |
| items | SessionItem[] | Ordered activities in this block |
| coachNote | string | Optional tip for this block |

### SessionItem
An activity placed in a block (can override library defaults).

| Field | Type | Notes |
|---|---|---|
| id | string | |
| activityId | string | Reference into Activity library |
| durationMinutes | number | Override of default |
| note | string | Coach personal note |
| order | number | Position in block |

## Rules
- A new blank session starts with five empty blocks in the fixed order above.
- Dragging an Activity into a block creates a SessionItem; prefer matching `blockType`, warn (don’t block) on mismatch.
- `totalMinutes` on Session = **sum of SessionItem durations only** (blank session = 0). Block budgets are targets on block cards, never added into the session total.
- Templates are read-only starters; opening one clones into a Session.

## MVP library seed (target count)
Aim for ~6 activities per block type (≈30 total) before calling the library “usable.” Content owned by Docs; structure owned by this model.
