# Slice 29 — handoff

**Status:** **Shipped after Verifier PASS (2026-09-27)** — report `verifier/slice-29-verify-report.md`; pack `slice-29/`. A1/B1/C1/D1/E1/F1 locked.

Backlog: **Home 3-question wizard** → **Shipped** (Slice 29, Verifier PASS 2026-09-27). Phone/Pages still Slice 27 until Christoffer asks to republish; repo footer is Slice 29 (includes Slice 28). Slice 28 Mall Samling → **Shipped** (Verifier PASS 2026-09-27).

## Execution order

1. **Docs (starting now)** — Swedish wizard copy + living note (wizard intent, Q labels, path table, tag→zone map) per locked A–F.  
2. **Builder** — only after Docs; Home wizard CTA + compose + pre-place; footer Slice 29; self-smoke via `verify-traningsplaneraren/`.  
3. **Planner** pings **Verifier**.  
4. **Verifier** — this checklist + `verify-traningsplaneraren/`.

## Locked answers (A1–F1)

| # | Choice | Meaning |
|---|---|---|
| A | **A1** | Wizard primary CTA; Nytt pass + Starta från mall secondary |
| B | **B1** | Q1: 4–6 / 7–9 / Nybörjare / Träning · Q2: Satsbräda / Trampett / Tumbling / Blandat · Q3: existing three presets |
| C | **C1** | ~4 curated focus paths + light age filter |
| D | **D1** | Preset + auto-place Teknik by tag/zone map |
| E | **E1** | Soft blank + two malls remain as escape |
| F | **F1** | MVP only; no full matrix / Använd-alla-on-finish / Pages; preserve 22–28; footer 29 |

## Paths

| Path | Role |
|---|---|
| `slice-29/` | This pack |
| `slice-29/content/` | Docs reference / wizard copy placeholder until Docs ships |
| `app/src/components/Home.tsx` | Primary CTA → wizard; secondary escapes |
| `app/src/App.tsx` | Wire wizard finish → session + navigate |
| `app/src/lib/session.ts` | Soft blank + `cloneTemplate` **unchanged**; add wizard compose helper (new) |
| `app/src/lib/hall.ts` | `snapPlacement` / `upsertPlacement` / presets — reuse for pre-place |
| `app/src/data/hallPresets.ts` | Q3 options (unchanged presets) |
| `app/src/data/seedTemplates.ts` | Old two malls stay for escape; wizard paths may live here **or** new `wizardPaths.ts` |
| `app/src/data/seedActivities.ts` | Tags `vault`/`trampett`/`floor` drive zone map |
| `app/src/data/blockMeta.ts` | Budgets; footer → 29; new UI strings for wizard |
| `docs/` | Living wizard note (`home-wizard.sv.md`) — Docs deliverable now starting |
| `verify-traningsplaneraren/` | Verifier skill |
| `backlog/PSTACK-OPS.md` | Rigor |
| `backlog/IMPROVEMENTS.md` | Wizard → Shipped Slice 29 after Verifier PASS; Mall Samling → Shipped 28 |

## Not this pack

- Full CoachVault age×focus matrix.  
- Auto Använd alla förslag on wizard finish.  
- Changing Soft blank inject (Slice 27).  
- Rewriting Slice 28 mall gathering.  
- Non-Teknik placeable / CAD / cloud / accounts.  
- Migrating existing drafts.  
- Netlify / Pages republish unless Christoffer asks.  
- Self-pinging agents — Planner coordinates Docs → Builder → Verifier.  
- Fixing short-mall warmup 11/10 unless a path would reuse it (**do not reuse**).
