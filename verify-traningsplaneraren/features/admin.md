# Admin view (Slice 47)

**What:** One place for bank admins: rows waiting, rows needing review, hidden rows, new exercises, import from a file, club mallar. Lazy chunk (`AdminArea`, with OwnImportSheet), never in the coach chunk.

**Reach:** Logged in as admin (footer `Admin · Logga ut`): footer button **Admin** (`.footer-admin-open`, aria «Öppna Admin», ≥ 44 px; on start page, Passbyggaren, Hallöversikt — not in a shared-link view, which keeps the plain «Admin» badge) or Passbyggaren → Mer → **Admin**. `View 'admin'` renders only when `admin.state === 'admin'`; otherwise falls back to where you came from (`adminFrom` home | builder).

**Drive:**
1. Gating matrix: logged out / non-admin (`Du är inloggad men inte admin.`) / bot key in place of the publishable key × start, builder (footer + Mer), hall, `#dela=` link × 320, 390, 844×390, 1280×800 → no Admin button, no `.admin-area`. Also Logga ut → reload → log in as non-admin in the same browser → none. Positive control: admin sees it everywhere except the shared view.
2. Direct REST against the stand-in as anon and with a real non-admin JWT: insert/update/delete `exercises`, insert `admins`/`club_templates` → refused; pending rows unreadable; DB hash unchanged.
3. Admin view order: `Väntar på godkännande (n)`, `Behöver granskas (n)`, `Dolda (n)` (only non-empty) → «Ny egen övning» (+ adminNewHint) → «Importera övningar» (+ adminImportHint) → «Föreningens mallar». All empty → «Inget väntar just nu.». «← Tillbaka» returns to start page / Passbyggaren with localStorage byte-identical.
4. Ny egen övning: block select, Namn, Varför, Så gör du, Se upp för, Säkerhet (required except Samling: «Skriv säkerheten. Den följer med till golvet.»), Välj redskap (Teknik only) → «Spara och skicka till granskning» → «Sparad. Den väntar på godkännande.»; DB row pending, nothing in localStorage.
5. Row → detail with Godkänn («Godkänd. Tränarna ser den nästa gång de öppnar appen.») / Ändra i banken («Sparat i banken.») / Dölj för alla (confirm → «Dold för alla.») / Visa igen («Syns igen för alla.»). Coach device (logged out) must not see a pending row before Godkänn, sees it after reload.
6. Import: file or «Klistra in kod» (`{"format":"traningsplaneraren.ovningar","schemaVersion":1,"exercises":[…]}`) → rows with only Ta med / Hoppa över; same title as a bank row → «Samma namn finns redan», starts on Hoppa över, note «Finns redan i banken…». «Importera {n} övningar» inserts sequentially and stops at the first failure: toast counts what went in (none → sheet stays with the write error); re-reading the same file then marks the already-imported rows «Samma namn finns redan / Hoppa över». Inject failures with a Playwright route on the n-th `POST /rest/v1/exercises`.
7. Offline (`context.setOffline(true)`): «Du behöver nät för att ändra i banken.», save/import disabled, 0 write requests even after coming back online.
8. Logga ut inside Admin → back on the start page or Passbyggaren (where you came from), session key removed.
9. Start page «Hämta ett pass» with an exercise file → «Det här är en fil med övningar. En admin lägger in den under Admin.», nothing imported.

**Prove:** Non-admins never see or reach Admin; every write lands as `pending` in the DB only; counts in toasts match DB rows; no partial rows; no request to the live project (record the browser network: Verifier used a PW_CORE shim that logs every request and blocks the live host). Real two-admin run (two people) is PENDING-real on stand-in runs.

**Smoke (Slice 52, E1):** `verifier/slice-52-admin-import-smoke.mjs` kör punkt 6 (import) på bank-bygget med Supabase fejkad i webbläsaren (`slice-47-fake-supabase.mjs`, ingen stand-in): IMP1 «Importera övningar» i Admin, IMP2 fil → 3 rader, IMP3 «Samma namn finns redan» startar på «Hoppa över», IMP4 «Ta med» på två → två `pending`-POST, IMP5 «Väntar på godkännande (2)» + «Väntar», IMP6 kod-input ger samma lista. Fixtur `verifier/fixtures/s52-import.json`. Texterna läses från `app/src/data/blockMeta.ts`.

**Stabila väljare** (Slice 50; roll + synlig svensk etikett först, sedan aria/id/klass som smokes redan använder; inga `data-testid`)

| Vad | Väljare | Källa |
|---|---|---|
| Adminvyn | `.admin-area` | `components/AdminArea.tsx`, `export.css` |
| Admin-detalj | `.admin-detail` | `components/AdminDetailPanel.tsx`, `export.css` |
| Formulär (ny övning) | `.admin-bank-form` | `components/AdminBankForm.tsx` |
| Importera | `.own-import` | `components/OwnImportSheet.tsx`, `export.css` |
| Öppna admin i sidfoten | `.footer-admin-open` | `App.tsx` |
| Logga ut | `footer .footer-admin-logout` | `App.tsx` |
