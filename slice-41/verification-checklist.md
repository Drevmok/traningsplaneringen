# Slice 41 — Verification checklist

**Viewport:** 390×844 portrait (iPhone 12–15 class). Clean site data unless the row says otherwise. «Stored» = `gymnastics-planner-draft-v1` in localStorage; Mina mallar = its saved-templates key. Timings ±0.5 s.

| # | Check |
|---|---|
| AC1 | Pass with ≥ 3 stations in a block → tap × on the middle one → it is gone at once, no dialog; toast «Borttagen · Ångra» at the bottom (screenshot) |
| AC2 | Toast closes by itself after about 5 s; the station stays removed; stored pass has no such station |
| AC3 | × → Ångra within 5 s → station back in the same block, same position in the order, same minutes, redskap and text; toast «Ångrat.» shows briefly |
| AC4 | Teknik station with a hall placement (Hallöversikt shows it) → × → Ångra → Hallöversikt shows the marker at the same x/y (stored `hallPlacements` entry equal) |
| AC5 | After Ångra, reload at once (< 1 s) → the restored station is there (saved at once, B1) |
| AC6 | × on station A, then × on station B within 5 s → one toast, fresh 5 s; Ångra brings back B only; A stays removed (C1) |
| AC7 | × → change minutes on another station before tapping → toast closes; no Ångra left (guard) |
| AC8 | × → open Hallöversikt / Hem / Kör passet within 5 s → come back → no toast, station still removed (undo expired) |
| AC9 | Built-in mall: pass with stations → Starta från mall → Använd mall → toast «Mallen är i Passbyggaren. · Ångra»; Ångra → previous pass back (title, blocks, stations, hall) |
| AC10 | Same as AC9 from **Mina mallar** |
| AC11 | Same as AC9 from a **föreningsmall**; only one toast (the old «Mallen är i Passbyggaren.» is not shown twice or after Ångra) |
| AC12 | Mall with Teknik auto-placed (Slice 37) over a pass with its own placements → Ångra → Hallöversikt shows the old pass's markers only, none from the mall |
| AC13 | Mall undo, then reload → the previous pass is the stored pass (same id as before the mall) and Fortsätt passet on Hem opens it |
| AC14 | Mall undo, Mina mallar: the Slice 39 auto-copy of the previous pass is still there (left on purpose); no copy of the mall pass was added; count = before mall + 1 |
| AC15 | Mall undo, then Använd mall again over the restored pass → no second identical auto-copy in Mina mallar |
| AC16 | Mall applied over a blank pass (0 stations) → Ångra → blank pass back, Mina mallar unchanged |
| AC17 | Mall → edit the new pass (add a station) before Ångra → toast gone; mall pass stays with the edit |
| AC18 | Keyboard (desktop, then 390 px with an external keyboard if possible): Tab to × and press Enter → focus lands on Ångra; Enter undoes. Timer does not close the toast while Ångra has focus; Escape closes it without undo |
| AC19 | Screen reader (VoiceOver iOS): after ×, «Borttagen, Ångra» is announced once (not repeated, not on each timer tick); Ångra is reachable by swipe and reads as a button; after Ångra «Ångrat.» is announced |
| AC20 | No confirm dialog for ×; Använd mall confirm unchanged (E1). Other toasts (Sparad som mall, Kopierat, import, failure) still 2.2 s, no button. Tap target of Ångra ≥ 44 px tall; toast does not cover the bottom action row in a way that blocks it after it closes |
| AC21 | Bundle delta ≤ +512 B gz (soft): main vs branch, sum of `gzip -9c` for `dist/assets/*.js` + `*.css`; numbers in PR |
| AC22 | `npm run build`, `npm test` green; footer «Träningsplaneraren · Slice 41»; Slice 41 asserts in `feedback.test.ts:25/45/46` and `clubTemplates.test.ts:316` |
