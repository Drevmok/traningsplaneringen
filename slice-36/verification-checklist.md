# Slice 36 — verification checklist

Viewport **390×844 portrait** unless noted. Strings: [`content/microcopy.sv.md`](./content/microcopy.sv.md). RLS checks use only the publishable key (`sb_publishable_…`), never the secret key. Prereq: Christoffer has run `sql/36-01…03` and `36-03-smoke.sql` shows 8 × ok = true.

| AC | Check | Pass |
|---|---|---|
| AC1 | Admin mode: an open pass shows «Publicera som föreningsmall» next to Spara som egen mall. Coach mode (logged out): the action is not in the DOM. | ☐ |
| AC2 | Publish a new pass: dialog shows «Namn på mallen» prefilled with the pass title, body text verbatim; «Publicera» → toast «Publicerad. Tränarna ser den nästa gång de öppnar appen.» The row exists in `club_templates` with `updated_by` = the admin e-mail. | ☐ |
| AC3 | Stored payload is SharePass v1 (`v: 1`, `blocks`), with **no** `hallPlacements` key, even when the pass had placed stations. Blocks, minutes, notes, station redskap match the pass. | ☐ |
| AC4 | Publish again with the same name (any case/extra spaces): overwrite confirm «Det finns redan en mall som heter ”…”» appears; «Avbryt» changes nothing; «Ersätt mallen» updates the same row (same id, new `updated_at`) and toasts «Mallen är ersatt. …». No second row. | ☐ |
| AC5 | Admin «Dölj för alla» on a club card → confirm verbatim → «Dölj» → toast «Dold för alla.»; card moves to «Dolda föreningsmallar (n)» with tag «Dold»; row has `hidden = true`. | ☐ |
| AC6 | «Visa igen» on a hidden mall → toast «Syns igen för alla.»; card back in the list; `hidden = false`. Nothing is ever deleted (row count never drops). | ☐ |
| AC7 | Admin cards show «Senast ändrad {datum} av {vem}». Coaches never see it, nor «Dold», «Publicera», the hidden group. | ☐ |
| AC8 | Admin offline: publish / Dölj / Visa igen show «Du behöver nät för att ändra föreningens mallar.» and change nothing (DB and local list). | ☐ |
| AC9 | Coach (fresh browser, logged out, online): Mallar / Starta från mall shows «Föreningens mallar» with hint, then Mina mallar, then built-in mallar. Each club card: title, minutes, tag «Föreningens», aria «Föreningens mall {title}, {n} min». No Ta bort / Kopiera delningskod on club cards. | ☐ |
| AC10 | Coach load: first render uses the cache (no wait for nät); one GET to `club_templates` after render with `apikey` header, **no** `Authorization`, `hidden=is.false`. | ☐ |
| AC11 | Hide/overwrite by admin → coach reload shows the change (hidden mall gone; overwritten mall has the new content). | ☐ |
| AC12 | Empty table (all hidden): coach online sees «Föreningen har inga mallar än.»; cache cleared. | ☐ |
| AC13 | Offline (airplane mode, installed PWA, after one online load): club cards still listed from cache, grey line «Visar sparade mallar. Du kan planera som vanligt.»; applying works. | ☐ |
| AC14 | First ever load offline (no cache): no club section, no empty text, no error; built-in mallar and Mina mallar work. Also: DB timeout (throttle > 8 s) → stale line, list kept. | ☐ |
| AC15 | Bank env missing (local build without `VITE_SUPABASE_*`): no request, no club section, no stale line. | ☐ |
| AC16 | Apply a club mall from **Starta från mall** on Home (Slice 20 path) and from the Mallar tab: Ersätta-confirm shows «Stationerna placerar du själv i Hallöversikt.»; after confirm the pass is in Passbyggaren with the mall's blocks and timings; toast «Mallen är i Passbyggaren. …». | ☐ |
| AC17 | After apply: Hallöversikt has **no** placed stations (all in the tray), hall template and Teknik-only rule unchanged; Golvklart and Förrådslista work for the pass. | ☐ |
| AC18 | RLS with publishable key (curl): `select … hidden=is.true` → `[]`; `POST` insert → refused; `PATCH` update → refused or 0 rows; `DELETE` → refused. Same as signed-in non-admin. Admin `DELETE` also refused. | ☐ |
| AC19 | Admin insert with a payload containing `hallPlacements` is refused by the DB (check constraint). | ☐ |
| AC20 | Coach edits an applied club mall: only their local pass changes; DB row unchanged. Spara som egen mall saves it under Mina mallar on the device. No coach path writes to the cloud (DevTools: no POST/PATCH from a coach session). | ☐ |
| AC21 | Coach bundle: logged-out visit downloads no admin chunk and no supabase-js chunk (Network tab), as in Slice 32. `rg "\.delete\(" app/src` finds no club-template delete. | ☐ |
| AC22 | 390×844: club section, cards, dialogs and confirms fit, no horizontal scroll, buttons ≥ 44 px, long titles (80 chars) wrap. Keyboard reaches cards and actions with visible focus; screen reader reads card and hide/show aria labels; toasts announced (`role="status"`). | ☐ |
| AC23 | All strings verbatim from microcopy; no `!`; no tech words; locked terms unchanged. | ☐ |
| AC24 | Footer reads «Träningsplaneraren · Slice 36»; «Tyck till» mail ends «Version: Slice 36». | ☐ |
| AC25 | Bundle (README § Bundle budget): sum of `gzip -9c` over `dist/assets/*.js` + `*.css`, main @ `6daaa59` (213 915 B; eager 151 696 B) vs branch: total grows ≤ **+3 072 B**, eager ≤ **+2 048 B**. No new dependency in `package.json`. Both numbers in the PR. | ☐ |
| AC26 | `npm run build`, lint and tests green; new `clubTemplates` tests (HANDOFF §6) pass. | ☐ |
| AC27 | Earlier slices unaffected: bank + `bankStale` (31), admin login/Godkänn/Dölj för alla/Visa igen in Biblioteket (32/33), Kör passet (34), Tyck till (35), Mina mallar save/copy/delete, built-in mallar, share links `#dela=`, Kom igång, print/export. | ☐ |
| AC28 | `36-03-smoke.sql` output (8 × true) and Security Advisor without new `club_templates` warnings, screenshot in `verifier/`. | ☐ |
