# Slice 01 — empty states and in-app tips

Status: Ready for Builder to wire in  
Source: `/workspace/gymnastics-planner/slice-01/` screen spec + verification checklist  
Audience: brand-new coaches

Field names match the data model: Summary · How to · Watch for.

---

## Top bar (session builder)

**Help line (subtle):** New to coaching? Start from a template

**CTA labels:** Save draft · Use template · Export (stub ok)

---

## Empty block tips (required: one per block type)

Show tip + one clear Add action on each empty block. Suggested primary CTA: **Add activity**. Optional secondary: **Browse ideas** (opens library filtered to that block).

### Gathering
**Tip:** Get everyone’s attention and set the tone before skills start.  
**Add label:** Add your first gathering activity

### Warm-up
**Tip:** Wake up the body gently so athletes are ready to move well.  
**Add label:** Add your first warm-up

### Techniques
**Tip:** Pick a few skills to focus on — quality beats quantity.  
**Add label:** Add your first technique

### Strength
**Tip:** Keep it short and clear so form stays good.  
**Add label:** Add your first strength activity

### Fun and games
**Tip:** End with something joyful so they leave wanting the next session.  
**Add label:** Add your first game

---

## Tips tab (block-level coaching tips)

Show when a block is selected:

| Block | Tip |
| --- | --- |
| Gathering | Circle up, make eye contact, and say what today’s session is about in one sentence. |
| Warm-up | Start easy, then raise energy. If someone looks cold or stiff, give them one more round. |
| Techniques | Name the skill, show once, then let them try. Coach one cue at a time. |
| Strength | Watch knees, back, and breathing. Stop a set early if form falls apart. |
| Fun and games | Clear rules, short rounds, celebrate effort. Safety still matters when they’re excited. |

---

## Activity detail labels

Use these section headings exactly:

- **Summary**
- **How to**
- **Watch for**

Button labels: **Add to current block** · **Add and edit duration**

---

## Soft warning (mismatched block type)

**Message:** This activity is usually used in {intendedBlock}. You can still add it here.

---

## Template confirm

**Title:** Replace this session?  
**Body:** Starting from a template replaces the blocks and activities you have now. Your saved drafts stay safe.  
**Confirm:** Use template  
**Cancel:** Keep editing

---

## Builder placeholders (for UI until wired)

```
[Docs: empty-state — gathering]
[Docs: empty-state — warmup]
[Docs: empty-state — techniques]
[Docs: empty-state — strength]
[Docs: empty-state — fun_and_games]
[Docs: tips-tab — {blockType}]
[Docs: topbar-help]
```
