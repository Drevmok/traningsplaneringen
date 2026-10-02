# Övningsimport — file schema v1 (Planner → app)

**Owner:** Planner (produces) · Builder (parses) · Verifier (fixtures).  
**Example:** [`example-import.json`](./example-import.json) (2 drills from trial `2DJ_oMM81mI`).  
**Edge fixture:** [`example-import-edge.json`](./example-import-edge.json) (one row per rule below).  
**Planner self-check:** `python3 slice-30/content/check_import.py <file>` (stdlib only; mirrors the app rules).

## Envelope

| Field | Type | Rule |
|---|---|---|
| `format` | string | **Must** be `"traningsplaneraren.ovningar"` — this is how the app (and Home "Hämta ett pass") tells an exercise file from a pass file |
| `schemaVersion` | integer | **Must** be `1`. Higher → "Filen är från en nyare version av appen." Lower/missing → unreadable |
| `createdAt` | string | Optional, ISO date. Display only (not shown in MVP) |
| `producedBy` | string | Optional (`"Planner"`). Ignored |
| `batchNote` | string | Optional, ≤240. Shown once as a muted line on top of the preview |
| `exercises` | array | **Required**, 1–100 entries. Empty → "Filen innehåller inga övningar." |

Pass files (`v: 1`, `blocks`) are **not** accepted here; exercise files are **not** accepted as a pass.

## Exercise (subset of `Activity`)

Limits match `ownActivities.ts` today; the only new limits are in **bold**.

| Field | Type | Req. | Rule (import behaviour) |
|---|---|---|---|
| `id` | string | yes | `^own-[a-z0-9-]{3,60}$`. Not matching → row **invalid**. Duplicate inside the file → later rows invalid |
| `title` | string | yes | trim, clip 80 |
| `blockType` | enum | yes | `gathering · warmup · techniques · strength · fun_and_games`; else invalid |
| `durationMinutesDefault` | int | yes | clamp 1–180 (`ITEM_MINUTES_MAX`) |
| `summary` | string | yes | clip 240 (Varför) |
| `howTo` | string | yes | `"1. …\n2. …"`; parsed with `parseHowLines`; **1–4 steps** (E1); step clip 180; steps 5+ dropped → note *Förkortad* |
| `watchFor` | string | yes | clip 240 |
| `safetyLine` | string | yes* | clip 240. *Required unless `blockType = gathering` (same as own form / `needsSafetyLine`) — missing → invalid |
| `difficulty` | enum | no | `intro · easy · medium · hard`; missing/unknown → `easy` |
| `tags` | string[] | no | **≤8 tags, each ≤24 chars**, lower-cased, trimmed, dedup; `egen` always added. Tags drive hall zone (`vault`/`trampett`/`floor`) |
| `defaultStationEquipment` | `{pieceId,count}[]` | no | Only kept when `blockType = techniques`; else dropped → note. Through `sanitizeStationEquipment` (≤8 slots, count 1–9). **Unknown pieceIds dropped → note "Okänt redskap togs bort: …"** |
| `progressionOf` | string | no | "Bygger på" — id of an **easier** drill. Kept if the id is a seed id, an existing own id, or another *included* row; else dropped → note |
| `regressionOf` | string | no | "Lättare variant av" — id of a **harder** drill. Same rule |
| `needsCoachReview` | boolean | no | **Missing → `true`** (imports start unreviewed) |
| `experiencedCoachOnly` | boolean | no | default `false`; `true` shows the existing Erfaren ledare warning |
| `source.url` | string | no** | `https://` only, ≤300; else whole `source` dropped → note |
| `source.creator` | string | no** | ≤80; required if `source` present |
| `source.title` | string | no | ≤120 (video title; used in aria-label only) |
| `source.startSeconds` | int | no | 0–86400; shown as `m:ss` (or `h:mm:ss`) |
| *anything else* | — | — | **Ignored** (e.g. `confidence`, `unmappedEquipment`, `level`, `station`, `keyframe`, `own`, `visualKey`, `stub`). App sets `own: true`, `visualKey: 'own'`, `newCoachOk: true`, `stub: false`, `watchForRequired: true` |

## Row states in the preview

| State | When | Default toggle |
|---|---|---|
| Ny | valid, id and title not in the bank | **Ta med** |
| Samma namn finns | valid, title (case-insensitive) equals a seed or own title, different id | **Ta med** (note shown) |
| Finns redan | same `id` already among own exercises | **Hoppa över**; switch → **Ersätt** (same id, so passes using it update) |
| Kan inte importeras | invalid (missing field, bad id/blockType, dup id) | locked off, reason shown |
| Ingen plats | would exceed cap 100 | locked off once room is used up; counter "Plats för {n} till" |

Notes (*Förkortad*, *Okänt redskap togs bort*, *Länk togs bort*, *Källa togs bort*) are shown per row, small and muted. Import is one write on **Importera {n} övningar**; nothing is saved before that.

## IDs and seed promotion

- Planner ids: `own-imp-<videoId-short>-<nn>-<slug>` (e.g. `own-imp-2dj-02-formhopp-over-block`).
- Promotion to the seed bank renames to the block prefix (`tech-…`, `warm-…`) — see [`seed-promotion.md`](./seed-promotion.md).
