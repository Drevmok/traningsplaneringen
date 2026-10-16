# Slice 42 — Verification checklist

**Viewport:** 390×844 portrait (iPhone 12–15 class). Clean site data unless the row says otherwise. «Stored» = `gymnastics-planner-draft-v1` in localStorage; Mina mallar = its saved-templates key. «Tip» = «Tomt pass? …» strip; «confirm» = «Ersätta det här passet?».

| # | Check |
|---|---|
| AC1 | Hem → Nytt pass (Tomt pass with Närvaro + Dagens pass) → tip shows (screenshot) |
| AC2 | Add one station from the bank → tip hides at once; remove it with × → tip shows again |
| AC3 | First visit ever (clean data) via Starta från mall → Använd mall → Passbyggaren shows the mall pass with stations and **no** tip (was the bug) |
| AC4 | Wizard pass (Hem wizard to the end) → no tip |
| AC5 | Tomt pass, remove Närvaro and Dagens pass → tip still shows (soft pair not content); type a title only → tip still shows |
| AC6 | Dismiss the tip → it stays hidden on later empty passes (dismiss kept) |
| AC7 | Tomt pass untouched → Starta från mall → pick a built-in mall → applied at once, **no confirm**; toast «Mallen är i Passbyggaren. · Ångra» |
| AC8 | AC7 with Mina mallar and with a föreningsmall → no confirm, same toast |
| AC9 | Untouched mall pass (from AC7) → pick another mall → no confirm; untouched wizard pass → pick a mall → no confirm |
| AC10 | Tomt pass with a typed title, or a pass note, or a block note → pick a mall → confirm shows |
| AC11 | Mall pass, change one station's minutes (or add/remove/move a station, drag a marker in Hallöversikt) → pick a mall → confirm shows; Fortsätt redigera keeps the pass |
| AC12 | Mall pass, edit then put the value back by hand → confirm still shows (fresh is not restored) |
| AC13 | Untouched mall pass, reload → pick a mall → confirm shows (fresh not kept over reload) |
| AC14 | AC7 → Ångra → the Tomt pass is back (Slice 41 unchanged) |
| AC15 | Mina mallar after AC7 and AC9: no auto-copy of the blank or untouched pass; count unchanged |
| AC16 | Edited pass (AC11) → confirm → Använd mall → Mina mallar +1 auto-copy (Slice 39 kept); confirm body text still true |
| AC17 | No new buttons, no new or changed text anywhere; tip and confirm words as on main |
| AC18 | Bundle delta ≤ +512 B gz (soft), numbers in PR; `npm run build`, `npm test` green; footer «Träningsplaneraren · Slice 42»; asserts in `feedback.test.ts:25/45/46` and `clubTemplates.test.ts:316` |
