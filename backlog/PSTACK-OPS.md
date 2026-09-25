# pstack operating note — Träningsplaneraren

**Status:** Active from Slice 21 onward (optional dry-run on hotfixes).  
**Owner:** Planner · **Maintainer of verify skill:** Verifier  
**Plugin:** pstack (Cursor plugin, 47 skills) · **Project verify skill:** `verify-traningsplaneraren/`

pstack is the **rigor layer** inside the existing loop. It does **not** replace Planner’s Christoffer gates, Scout’s Propose → Approve/Park/Decline, or Docs → Builder → Verifier handoffs.

Core habit: **deep before fast · evidence before claims · small verified units**.

---

## When to invoke pstack

| Situation | Use | Skip |
|---|---|---|
| Nontrivial Builder work (new UI behavior, state bugs, architecture) | Playbook match + `how` / `architect` / TypeScript discipline + prove on real app | — |
| Investigation / regression (e.g. scroll freeze) | Investigation playbook + fix-root-causes | Guessing patches |
| Verifier formal run | Project skill `verify-traningsplaneraren` + slice checklist + `blast-radius` | Footer-only checks |
| Novel UX with no pack precedent | Light `arena` / exhaust-design-space **before** locking A–F | Every microcopy tweak |
| Docs Swedish coach copy | `technical-writing` + `unslop` | Rewriting locked product terms |
| Scout idea filtering | experience-first + “what lock does this fight?” | Implementing ideas |
| Approve/Park/Decline, Pages republish, FYI chat | — | Full poteto-mode |
| Same correction twice | `reflect` → encode into playbook / pack template / verify feature map | Chat-only memory |

Sticky when rigor is needed; stay out of the way for Christoffer product decisions.

---

## Role map

| Role | Id | pstack / verify duties |
|---|---|---|
| **Planner** | (this chat) | Orchestrates. May `interrogate` recommended A–F before ask. Does not implement app code. Points Builder/Verifier at this note + verify skill. |
| **Scout** | `8d938891-4fba-490d-a96d-5f261cd2da81` | experience-first + lock conflict note on each idea. No code. |
| **Docs** | `844ef060-4bc2-465e-b9b4-a68643c097c9` | technical-writing + unslop; never change locked terms (gymnaster, pass, Redigera redskap, …). |
| **Builder** | `e65fc503-309a-4284-8fe9-ad5ec47c174c` | On nontrivial slices: match playbook, `how`/`architect` before coding, TypeScript practices, self-smoke via verify skill **Drive** for the slice surface, then ship notes. |
| **Verifier** | `2f693fbc-ccbd-4814-83b0-8af5f17610ca` | Owns `verify-traningsplaneraren/`. Every formal verify: read skill → doctor → drive slice rules + mapped features → evidence → PASS/FAIL to Planner only. Periodic `maintain-verification-skill` after feature-heavy slices. |

---

## Pipeline (unchanged order)

1. Scout → Christoffer batch gate  
2. Planner drafts pack + A–F → Christoffer lock  
3. Docs → Builder → **Planner-only** Verifier ping  
4. Verifier uses **slice checklist** as authority and **verify skill** as how to drive/prove  
5. PASS → backlog Shipped; Pages/Netlify only if Christoffer asks  
6. Optional short `reflect` into this note / Scout playbook / feature map when a lesson repeats

---

## Builder minimum bar (Slice 21+)

Before claiming shipped:

1. Pack decisions A–F honored; no scope creep (F locks).  
2. `npm run build` green in `app/`.  
3. At least one **real UI path** exercised for the slice surface (not “it compiles”). Prefer the verify skill Drive recipe.  
4. Ship notes list deviations (or “none”).  
5. Do **not** ping Verifier — Planner does.

---

## Verifier minimum bar (Slice 21+)

1. Wait for Planner ping after Builder ships.  
2. Read `verify-traningsplaneraren/SKILL.md` + relevant `features/*`.  
3. Doctor (dev or preview up, correct base path).  
4. Drive every locked checklist row; capture evidence under `verifier/` + screenshots.  
5. Note blast-radius: what else could this break (compose, Golvklart, mall, Förrådslista, …).  
6. Report PASS/FAIL to Planner only.

---

## Project verification skill

Path: `/workspace/gymnastics-planner/verify-traningsplaneraren/`

- **Create pattern:** pstack `create-verification-skill` (drive app as coach).  
- **Maintain:** pstack `maintain-verification-skill` after slices that change coach-facing surfaces.  
- **Shared bot pointer:** skill [verify-traningsplaneraren](sand-workflow:verify-traningsplaneraren) (thin wrapper → read repo skill).

---

## Out of scope for pstack here

- Replacing Christoffer’s Approve/Park/Decline  
- Auto-publishing to GitHub Pages / Netlify  
- Cloud accounts, CAD hall editor, growing the fixed redskap library without a pack  
- Running full arena/swarm on every Effort-S polish

---

## Changelog

| Date | Change |
|---|---|
| 2026-09-26 | Initial note + project verify skill seeded after Slice 20 PASS / Pages live |
