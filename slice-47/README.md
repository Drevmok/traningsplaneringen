# Slice 47 — Lägg till övning och Admin

**App:** Träningsplaneraren  
**Status:** **LOCKED 2026-10-19 by Christoffer: A1 B1 C1 D2 E1 F1** (★ except D: D2, any admin may Godkänn, also their own row; he is the only admin). **No SQL.** Docs pack only, no app code. Branch `slice-47-docs` from `origin/main` @ `9aa3996` (Slice 46 live, PR #50). **No Supabase change in ★.**  
**Effort:** **M+** (see below).  
**Source:** `feedback/2026-10-17-christoffer.md` row D: «Lägg till övning + Admin: library only (drop Tips/mallar tabs, drop "ikväll" checkbox); Egen övning + Import move to new Admin area (start screen / Mer) with peer-admin review.»

## Why

Lägg till övning is where a coach picks a drill for a block. Today that sheet also holds a Tips tab, a Mallar tab, two buttons for making and importing exercises, and a checkbox about tonight's equipment. Christoffer wants the sheet to be the library and nothing else. Making and importing exercises becomes an admin job, and another admin looks at a new exercise before every coach sees it.

**Coach outcome:** «Jag trycker Lägg till övning och ser övningarna direkt.»  
**Admin outcome:** «Jag lägger in en ny övning under Admin. När en admin har godkänt den finns den i Biblioteket för alla.»

## Measured today (main @ 9aa3996, 390×844, `evidence/`)

Passbyggaren → Samling → «+ Lägg till övning». The sheet runs from y 68 to 844 (776 px).

| Element | y | What it is |
|---|---|---|
| «Stäng» | 68–118 | sheet chrome |
| Tabs «Bibliotek · Tips · Mallar» | 118–165 | `LibraryPanel.tsx:126–145`, `SideTab = 'library' \| 'tips' \| 'templates'` (`types.ts:119`) |
| Sök | 178–222 | search |
| Filter | 232–276 | block select |
| «Ny egen övning» · «Importera övningar» | 294–338 | `LibraryPanel.tsx:202–215`, open `OwnActivityForm` / `OwnImportSheet` (`SessionBuilder.tsx:677–678`, `:808–838`) |
| «Så ni gör i er hall. Övningen stannar i den här webbläsaren.» | 342–360 | `UI.ownHint` |
| ☐ «Visa bara övningar vi kan köra ikväll» + «Döljer övningar som behöver redskap du kryssat bort i Förrådslistan.» | 386–442 | the «ikväll» checkbox, `LibraryPanel.tsx:218–231`; state `loadTonightFilter` / `saveTonightFilter` (`lib/ownedEquipment.ts:79–`, key `gymnastics-planner-library-tonight-v1`); filter `activityFitsOwned` against the «Vad finns i hallen ikväll?» list in Förrådslista (`ForradslistaSheet.tsx:86–106`) |
| First exercise card | **464** | |

- **Tips tab** (`LibraryPanel.tsx:261–289`): the block's tip from `TIPS_TAB` (`data/blockMeta.ts:88`) under «För hela blocket», then «Övningarna» with each drill's short tip. The drill tips also show on the block card (`BlockCard.tsx:108`) and in the exercise detail, so only the per-block text is lost.
- **Mallar tab** (`LibraryPanel.tsx:291–303`, Slice 46 `MallList`): Föreningens mallar (for admins: `ClubAdminSection`, publish/hide tools), Mina mallar with **«Kopiera delningskod»** and **«Ta bort»**, the hint «Egna mallar stannar i den här webbläsaren…», Nybörjare and Kort pass. Opened by Passbyggaren's **«Använd mall»** (`SessionBuilder.tsx:444–450`). The Planera pass Mall step (Slice 46) has no Kopiera delningskod / Ta bort, so these two exist only here.
- **Admin today** (Slice 32): logged-in admins get a bar on top of Biblioteket: «Admin» + «Väntar på godkännande (n)», «Behöver granskas (n)», «Dolda (n)» (`LibraryPanel.tsx:149–177`). The exercise detail carries `AdminDetailPanel`: pending → Godkänn · Ändra i banken; published → Ändra i banken · Dölj för alla; hidden → Visa igen · Ändra i banken; badge «Väntar» (`AdminStatusBadge`). Login: footer «Logga in som admin» → code by e-mail (Slice 33).
- **Egen övning today** is local: `localStorage` key `gymnastics-planner-own-activities-v1`, max 100, ids `own-…` (`lib/ownActivities.ts`). Import (Slice 30) also writes there. Nothing reaches the shared bank from the app: `lib/admin/bankWrite.ts` only UPDATEs («No insert from the app»).

## Database check (read only, no SQL run)

From `slice-31/content/schema-31.sql` and `schema-32.sql` (the files Christoffer ran; Docs did not query the live project):

- `public.exercise_status` = `'published' | 'hidden' | 'pending'`. **`pending` already exists**: «waiting for an admin's Godkänn (never visible to coaches)».
- `exercises_read_public`: anon and authenticated read only `published` and `hidden`. `exercises_admin_read_all`: admins read all, pending included.
- `exercises_admin_insert` (`with check private.is_admin()`) and `grant insert, update … to authenticated`: **an admin may already INSERT a row, with any status**. `exercises_admin_update`: admins may update. No DELETE anywhere.
- `private.stamp_updated_by()` (before insert or update): `updated_by` = the admin's e-mail, set by the database, not the app. The admin app already reads it (`ADMIN_COLUMNS`, «Senast ändrad {datum} av {vem}»).
- Row rules a new row must meet: id `^(gather|warm|tech|strength|fun)-[a-z0-9-]{2,60}$` (so `own-…` ids cannot be reused), `visual_key` not null, `safety_line` required except Samling, redskap only on Teknik, `source.url` https and `creator` 1–80.

So the ★ flow needs **no Supabase change**: new exercises are inserted as `pending` with the existing policy, and the existing Godkänn sets `published`. The one thing the database cannot do without SQL is stop an admin from approving their own row; ★ D1 does that in the app (see D3 for the database version).

## Options (★ = Docs recommendation)

### A — Lägg till övning: only Biblioteket
- **A1 ★** The sheet shows Biblioteket only: «Stäng», Sök, Filter, the list. No tab row, no «Ny egen övning» / «Importera övningar», no hint, no «ikväll» checkbox. The first exercise moves up from y 464 to about y 230. **«Använd mall»** in Passbyggaren opens its own sheet «Använd mall» with the Slice 46 mall list, including «Kopiera delningskod» and «Ta bort» for Mina mallar, so nothing is lost. The Tips tab's per-block text goes; drill tips stay on the block card and in the detail.
- **A2** As A1, but «Använd mall» opens the Planera pass Mall step (Hall → Mall). Same hall question as the start page, but replacing a pass in the middle of Passbyggaren then asks for the hall again.
- **A3** As A1, and «Använd mall» leaves Passbyggaren (mall only from the start page). Kopiera delningskod / Ta bort then move into the Planera pass Mall step.

### B — The «ikväll» filter
- **B1 ★** Remove the checkbox and the filter. Also remove the «Vad finns i hallen ikväll?» list in Förrådslista: its only use is that filter, and its hint («Biblioteket kan då visa bara övningar ni kan köra») would no longer be true. Saved values in `localStorage` are left alone and no longer read.
- **B2** Remove the checkbox only; keep the Förrådslista list with the hint cut to «Avmarkera det ni inte har.» The list then changes nothing visible.
- **B3** Keep the filter on in the background with no checkbox. Coaches would miss drills without knowing why. Not recommended.

### C — The Admin area: where and what
- **C1 ★** A new full-screen view «Admin», shown only when you are logged in as admin (`admin.state === 'admin'`, which is `private.is_admin()` through `public.admins`, Slice 32 login unchanged). Two ways in: on the start page the footer's «Admin» in «Admin · Logga ut» becomes a button; in Passbyggaren «Mer» gets «Admin». «Tillbaka» returns to where you came from. Top to bottom:
  1. «Väntar på godkännande (n)», «Behöver granskas (n)», «Dolda (n)» (the Slice 32 lists, moved out of Biblioteket); a tap opens the exercise with the Slice 32 actions and the «Väntar» badge.
  2. «Ny egen övning» and «Importera övningar».
  3. «Föreningens mallar» with the Slice 36 admin tools (moved from the Mallar tab).
  
  Biblioteket then looks the same for admins and coaches; an admin opening a published exercise there still sees Ändra i banken and Dölj för alla.
- **C2** Admin only as a sheet from Passbyggaren «Mer»; nothing on the start page.
- **C3** No new view: keep the admin bar in Biblioteket and show the two buttons there to admins only. Smallest, but not «a new Admin area».

### D — Review by another admin
- **D1 ★** «Ny egen övning» and «Importera övningar» in Admin write **new bank rows with status `pending`** (insert, existing policy). Every admin sees them under «Väntar på godkännande» with the «Väntar» badge. **Godkänn is not shown to the admin who last changed the row** (`updated_by` = your e-mail); they see «Väntar på att en annan admin godkänner den.» instead. Another admin can Godkänn (→ published, in Biblioteket for all coaches the next time they open the app), Ändra i banken, or Dölj för alla. After «Ändra i banken» the editor becomes the last changer, so the first admin can approve. Enforced in the app only; the database still allows it.
- **D2** As D1 without the peer rule: any admin, also the author, may Godkänn. Works with one admin.
- **D3** As D1, and the database refuses an approval by the last changer. **KRÄVER SQL – Christoffer godkänner separat**: a new update policy or trigger on `public.exercises`. Not drafted; Docs writes `slice-47/sql/` only if Christoffer picks D3.

### E — Coaches' own exercises, and who can make one
- **E1 ★** Only admins make new exercises, as the feedback says («Egen övning + Import move to new Admin area»). A coach's existing own exercises stay on their device: in Biblioteket with the «Egen» badge, in their passes, mallar and share links, with «Ändra» and «Ta bort» on the card. They just cannot add new ones. Nothing is deleted or moved.
- **E2** As E1, and in Admin an admin can send the own exercises on their own device to the bank («Skicka till granskning»): each becomes a pending row with a new bank id. The local copy stays, so passes keep working.
- **E3** Coaches keep «Ny egen övning» in Biblioteket, local only; only Import moves to Admin. Against the feedback.

### F — Import, copy, dead code, budget
- **F1 ★** Import lives only in Admin and writes pending bank rows (D1): same file or code input and «Ta med» / «Hoppa över»; each row gets a new bank id (`{gather|warm|tech|strength|fun}-egen-…`); a row whose title already exists in the bank shows «Samma namn finns redan», starts on «Hoppa över» and says «Finns redan i banken. Tar du med den får banken två övningar med samma namn.»; no «Ersätt», no «Plats för {n} till» (the 100 cap is local only). «Hämta ett pass» on the start page tells you that an exercise file belongs under Admin. Strings as `content/microcopy.sv.md`; locked terms unchanged; dead code per `HANDOFF.md` §9; `SLICE_NUMBER = '47'`. Coach chunk **−1.5 to −2.5 kB gz**, lazy admin chunk **+2 to +3.5 kB gz** (estimate).
- **F2** Import moves to Admin but keeps writing local own exercises on the admin's device, as today. No review for imports.

## Effort: M+

Not M: a new admin view with two entry points, the first insert path from the app (id, defaults, row rules), the peer rule, import rewired from local storage to the bank, the Använd mall sheet, and removals across LibraryPanel, Förrådslista, SessionBuilder and App. Not L: no Supabase change, no new storage key, the admin actions and forms are reused.

## Files

- [`HANDOFF.md`](./HANDOFF.md) — Builder notes, file:line refs, dead code, tests, bundle
- [`verification-checklist.md`](./verification-checklist.md) — AC1–AC26 at 390×844 (against ★)
- [`content/microcopy.sv.md`](./content/microcopy.sv.md) — new, changed, kept and removed strings
- [`evidence/`](./evidence/) — main @ 9aa3996 screenshots and `measurements-390x844.txt`
- Living docs: new [`docs/admin.sv.md`](../docs/admin.sv.md); Slice 47 notes in `docs/delad-bank.sv.md`, `docs/ovningsimport.sv.md`, `docs/ui-chrome.sv.md`, `docs/README.md`

## Verifier

`verify-traningsplaneraren/features/` will need a refresh after this slice (Verifier owns them): `passbyggaren.md` (Lägg till övning without tabs, Använd mall sheet), `starta-fran-mall.md` (Mallar tab gone), `delad-bank.md` (admin bar moves to Admin, insert of pending rows, peer rule), `golvklart-forrad.md` (Förrådslista without «Vad finns i hallen ikväll?» if B1), and a new map for the Admin view.

## Out of scope

Supabase schema, policies or the admins list; who is admin (SQL Editor only, Slice 32); the login flow; Hallöversikt (Slice 48); bank fields Ändra i banken cannot change (tags, difficulty, order); deleting rows; moving coaches' own exercises off their devices (E2 is admin-only).

## Open items for Christoffer

1. Lock A–F.
2. **How many admins are there?** D1 needs at least two in `public.admins`; with one, nothing new can be approved. Docs cannot check (no SQL). If you are the only one, pick D2 for now or add a second admin first.
3. Should coaches without admin keep a way to suggest an exercise? With ★ they cannot add any. A suggestion inbox for non-admins would need SQL (an insert policy for non-admins) and is not in this pack.
4. E2: do you want to send the own exercises on your phone to the bank?
5. B1 also removes «Vad finns i hallen ikväll?» from Förrådslista. OK, or keep it (B2)?
6. Tips tab: the per-block tips («För hela blocket») disappear with the tab. Fine, or should they appear somewhere else later?
