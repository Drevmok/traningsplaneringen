# Slice 37 — verification checklist

Viewport **390×844 portrait** unless noted. Locks: [`README.md`](./README.md). No new strings; two shortened/removed (HANDOFF §4).

| AC | Check | Pass |
|---|---|---|
| AC1 | Home → **Starta från mall** → built-in mall → confirm. Without opening Hallöversikt, Golvklart / hall preview shows one marker per Teknik item. Then open Hallöversikt: same markers, no extra or duplicate. | ☐ |
| AC2 | **Föreningsmall** (Slice 36 club mall with ≥ 2 Teknik) → **Använd mall**: all Teknik markers placed on apply, in the pass's hall template. | ☐ |
| AC3 | **Egen mall** saved *with* placements: the saved markers keep their exact spots; only Teknik that was unplaced in the mall gets a new marker. Egen mall saved *without* placements: all Teknik placed. | ☐ |
| AC4 | Only Teknik items get markers; Samling/Uppvärmning/Styrka/Lek och spel never. Hall template is the one the mall carried (built-in: default hall). | ☐ |
| AC5 | **Använd alla förslag** is not triggered: station redskap stay unsaved as before; saknar-banner / Förrådslista behave as before the slice. | ☐ |
| AC6 | Markers are placed like the wizard's (same zones as the same drills get from **Planera pass**); chips in one zone do not stack. | ☐ |
| AC7 | Move a marker, Placera här, remove one, undo: all work as today. A removed marker does not come back on reopening Hallöversikt. No new buttons or settings anywhere. | ☐ |
| AC8 | Reload after each apply (AC1–AC3): placements are still there (saved in the draft). | ☐ |
| AC9 | Club apply toast reads exactly «Mallen är i Passbyggaren.» (~2 s). Club confirm shows no «Stationerna placerar du själv i Hallöversikt.» line. Built-in and Egen mall show no new toast. | ☐ |
| AC10 | Mall with a Teknik drill that has no redskap: no error, no message; behaviour matches the wizard/helper (HANDOFF §5). | ☐ |
| AC11 | Club data unchanged: admin publish still sends no `hallPlacements`; `clubPayload` test green. | ☐ |
| AC12 | Footer «Träningsplaneraren · Slice 37»; Tyck till mail ends «Version: Slice 37». | ☐ |
| AC13 | Bundle: JS+CSS gzip total grows ≤ +512 B, main @ `c6a11d5` vs branch; both numbers in ship notes (overrun only with written reason). | ☐ |
| AC14 | `npm run build`, lint, tests green. Earlier slices unaffected: Planera pass, Nytt pass (empty hall), add drill auto-place, Kom igång place step, Golvklart, Förrådslista, club mall offline list (36), admin publish. No `app/` change outside the planned files. | ☐ |
