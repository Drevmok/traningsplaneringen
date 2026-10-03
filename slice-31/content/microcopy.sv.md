# Slice 31 + 32 — microcopy (Swedish)

**Status:** **Slice 31: Docs final 2026-10-02** (lock A1 / B2 / C1 / D1 / E1 / F1). Builder may ship the Slice 31 keys. **Slice 32: Docs final 2026-10-03.** Builder may ship the Slice 32 keys.  
**Owner:** Docs owns the words. Builder ships the keys in `UI` (`app/src/data/blockMeta.ts`).  
**Living doc:** [`docs/delad-bank.sv.md`](../../docs/delad-bank.sv.md) (coach note + the same key table for Builder).  
**Tone:** du, short, coach-to-coach; quiet chrome (Slice 22): no exclamation marks, one line where possible.  
**Locked terms (unchanged):** övning · egen övning · pass · gymnaster · Bibliotek(et) · Teknik · Redskap · Ändra · Behöver granskas · Markera som granskad · Källa.  
**New terms (Slice 32):** **banken** (the shared bank) · **admin** · **Väntar på godkännande** · **Godkänn** · **Dölj för alla** / **Visa igen** · **Dold**.

## Slice 31 — coaches (Docs final)

| Key | Svenska | Where / when |
|---|---|---|
| `bankStale` | Visar sparade övningar. Du kan planera som vanligt. | Biblioteket only, muted, small, one line under the list header (screen-spec §1). Shows only when `bankStatus() === 'stale'`: the bank is configured **and** this load's fetch failed (offline, timeout, error, or 0 valid rows). Same text whether the app is showing its saved copy or, on a first visit, the built-in exercises. Never on Home, Golvklart, Kör passet, print or share |
| `footerSliceLabel` | Träningsplaneraren · Slice 31 | Footer |

### When the line shows (per `bankStatus()`)

| State | What the coach sees | Text |
|---|---|---|
| `bundled`: build without the two repo variables (bank off) | Built-in exercises | None |
| `cached` / `bundled` while the first fetch is still running (≤ 8 s) | Saved copy or built-in exercises | None. No spinner, no "laddar" |
| `fresh`: fetch succeeded | Cards update in place; scroll, open sheets and form input kept | None. No toast |
| `stale`: fetch failed, `navigator.onLine === false`, or 0 valid rows | Saved copy (or built-in on a first visit) | `bankStale` |

The line stays until the next app load (one fetch per load, no retry loop).

### Deliberately no other text in Slice 31

- **Loading:** none. The list is always filled from the saved copy or the built-in exercises before first render.
- **Errors:** none beyond `bankStale`. No dialog, no toast, no retry button. A failed fetch is not an error for the coach.
- **Empty:** none new. The bank never shows an empty list (0 valid rows = failed fetch → built-in/saved copy + `bankStale`). Existing Biblioteket empty/filter texts (Slice 01–30) are unchanged.
- **No tech words in UI:** no new coach-facing text says "Supabase", "databas", "server", "cache", "offline" or "synk". Existing Slice 10 honesty lines stay as they are.

Docs note for Builder: render `bankStale` as plain muted text, not `role="status"` / `aria-live`. It is a quiet note, not an alert.

## Slice 32 — admins (Docs final 2026-10-03)

Only admins ever see these strings. A coach who isn't logged in sees exactly one new thing in the whole app: the muted footer link `adminLoginLink`. No admin chip, badge, filter, button or line reaches a coach view.

**ny (Docs)** = key Docs added to the pack's list. Keys without the mark are the pack's keys (some reworded).  
**Spelling:** always **Godkänn** / **Godkänd**, with plain o (no ö).  
**Reuse:** `Avbryt` buttons use `adminCancel`; Slice 30 keys `markReviewed`, `ownReviewedToast`, `sourceLabel`, `sourceLine(At)` and the own-form field labels stay as they are.

### Footer (screen-spec §2)

| Key | Svenska | Where / when |
|---|---|---|
| `footerSliceLabel` | Träningsplaneraren · Slice 32 | Footer, replaces the Slice 31 label |
| `adminLoginLink` | Logga in som admin | Footer, muted link after the slice label. Shown when nobody is logged in (`useAdmin()` = `none`). This is the only way into login: no button on Home, in Biblioteket or in a menu |
| `adminBadge` | Admin | Footer while logged in as admin: `Träningsplaneraren · Slice 32 · Admin · Logga ut`. Same word as the chip in Biblioteket |
| `adminLogout` | Logga ut | Footer link while logged in (`admin` or `notAdmin`). Replaces `adminLoginLink`. Logs out at once, no confirm, no toast; the footer goes back to `adminLoginLink` |
| `adminNotAdmin` | Du är inloggad men inte admin. | Footer, muted, when the session is valid but the e-mail is not on the admin list (`notAdmin`). Followed by `adminLogout`. No admin UI anywhere |

While the app checks the session (`checking`), the footer shows only the slice label. No "laddar".

### Login sheet (screen-spec §3)

| Key | Svenska | Where / when |
|---|---|---|
| `adminLoginTitle` | Logga in som admin | Sheet heading |
| `adminLoginHint` | Skriv din e-post så skickar vi en inloggningslänk. | Under the heading. This is the field's hint too (`aria-describedby` on the input) |
| `adminEmailLabel` | E-post | Input label. `type="email"`, `autocomplete="email"`. No placeholder (don't ship the wireframe's `christoffer@…`) |
| `adminSendLink` | Skicka länk | Primary button. Disabled while the field is empty and while sending |
| `adminLinkSent` | Om adressen hör till en admin kommer en länk strax. Öppna den i den här webbläsaren. Den gäller i en timme. | Replaces the form after send. Same text for every address, known or not, so nobody can test who is admin. Text block, `role="status"` |
| `adminWait` | Vänta en stund innan du ber om en ny länk. | Under the button when the send is rate-limited (429 / `over_email_send_rate_limit`). Form stays |
| `adminSendFailed` **ny (Docs)** | Kunde inte skicka länken. Kolla nätet och försök igen. | Under the button, only when the request never reached the login service (network error, timeout, 5xx). Any answer about the address itself still shows `adminLinkSent` |
| `adminLinkFailed` | Länken fungerar inte längre. Be om en ny. | Back from the e-mail link, when the `?code=` exchange fails (expired, already used, or opened in another browser). App opens normally; the login sheet opens with this line above the form, so a new link is one tap away |
| `adminCloseAria` | Stäng inloggningen | × button `aria-label` |

Coming back from a good link shows no text: the app opens on Home, the address bar is cleaned and the footer shows `Admin · Logga ut`.

### Biblioteket in admin mode (screen-spec §4)

| Key | Svenska | Where / when |
|---|---|---|
| `adminBadge` | Admin | Quiet chip after the Biblioteket heading, admin mode only |
| `adminFilterPending` | Väntar på godkännande ({n}) | Filter chip. Hidden when n = 0 |
| `adminFilterReview` | Behöver granskas ({n}) | Filter chip: bank exercises with `needsCoachReview`. Hidden when n = 0 |
| `adminFilterHidden` | Dolda ({n}) | Filter chip. Hidden when n = 0 |
| `adminPendingBadge` | Väntar | Badge on card and detail, pending rows (only under its chip) |
| `adminPendingBadgeAria` **ny (Docs)** | Väntar på godkännande | `aria-label` / `title` on the `Väntar` badge, so the short word isn't the only cue |
| `adminHiddenBadge` | Dold | Badge on card and detail, hidden rows (only under the Dolda chip) |
| `needsCoachReview` | Behöver granskas | Existing key. In admin mode also on **bank** cards. Coaches: still own exercises only |

### Exercise detail, admin actions (screen-spec §5)

Buttons by status. Published rows also keep **Lägg till i valt block**; pending and hidden rows never get it.

| Status | Buttons |
|---|---|
| pending | `adminApprove` · `adminEdit` |
| published | `adminEdit` · `adminHide` |
| hidden | `adminUnhide` · `adminEdit` |

| Key | Svenska | Where / when |
|---|---|---|
| `adminApprove` | Godkänn | Pending only. Pending → published |
| `adminApproved` | Godkänd. Tränarna ser den nästa gång de öppnar appen. | Toast (`role="status"`) |
| `adminEdit` | Ändra i banken | All three statuses. Opens the bank form |
| `adminHide` | Dölj för alla | Published only. Opens the confirm |
| `adminUnhide` | Visa igen | Hidden only. No confirm |
| `adminUnhidden` | Syns igen för alla. | Toast after `adminUnhide` |
| `adminReviewHint` | Läs igenom texten. Markera som granskad när den stämmer. | Above `markReviewed`, bank exercises with `needsCoachReview` |
| `markReviewed` | Markera som granskad | Existing key, now also for bank exercises. Toast: existing `ownReviewedToast` (Markerad som granskad.) |
| `adminLastChanged` | Senast ändrad {datum} av {vem} | Muted line at the bottom of the detail, every bank row in admin mode. `{vem}`: the admin's e-mail; `Planner` for `bot:planner` |
| `adminLastChangedFirst` **ny (Docs)** | Oförändrad sedan {datum} | Same place, when `updated_by` = `seed-script` (the first version of the bank). Replaces the draft's "av första versionen" |
| `adminLastChangedNoWho` **ny (Docs)** | Senast ändrad {datum} | Same place, when `updated_by` is empty or `service` |
| `adminOffline` | Du behöver nät för att ändra i banken. | Muted line above the admin buttons (and above `adminFormSave` in the form) while `navigator.onLine === false`. Buttons disabled. Nothing is queued |

`{datum}` = day + short month, lowercase, no period: `2 okt`. Add the year when it isn't this year: `2 okt 2025`.

### Dölj confirm (screen-spec §6)

| Key | Svenska | Where / when |
|---|---|---|
| `adminHideConfirm` | Dölja ”{title}” för alla tränare? Pass som redan har övningen visar den fortfarande. | Confirm body |
| `adminHideUsedIn` | Övningen finns också i en mall eller i Planera pass. Där ligger den kvar tills appen ändras. | Extra line, only when the id is in `seedTemplates` / `wizardPaths` |
| `adminCancel` **ny (Docs)** | Avbryt | Left button in the confirm and the bank form. Closes, nothing changes |
| `adminHideConfirmYes` | Dölj | Right button |
| `adminHidden` | Dold för alla. | Toast after hiding |

### Bank form, Ändra i banken (screen-spec §7)

| Key | Svenska | Where / when |
|---|---|---|
| `adminFormTitle` | Ändra övning i banken | Heading |
| (fields) | Namn · Block · Minuter · Varför · Så gör du · Se upp för · Säkerhet · Redskap | Own-form labels and validation messages, unchanged |
| `adminFormSourceUrl` | Källa — länk | https only (existing Källa validation) |
| `adminFormSourceCreator` | Källa — kanal | Required when there is a link |
| `adminFormSourceTime` | Starttid (m:ss) | Optional |
| `adminFormExperienced` | Bara för erfarna ledare | Checkbox → `experiencedCoachOnly` (matches the existing badge `Erfaren ledare`) |
| `adminFormHint` | Ändringen syns för alla tränare. | Muted, right above the buttons (screen-spec §7) |
| `adminFormSave` | Spara i banken | Primary. Also clears `Behöver granskas` |
| `adminSaved` | Sparat i banken. | Toast after save |

### Errors (all admin writes)

Apply to `adminApprove`, `adminHide`, `adminUnhide`, `markReviewed` on bank rows and `adminFormSave`. Inline, under the buttons, not a toast. The form keeps its input.

| Key | Svenska | Where / when |
|---|---|---|
| `adminSaveConflict` | Någon annan har ändrat övningen. Stäng och öppna den igen. | 0 rows updated (stale `updated_at`). Nothing is overwritten |
| `adminSaveFailed` | Kunde inte spara. Kolla nätet och försök igen. | Network error, timeout, 4xx or 5xx |

### Deliberately no other text in Slice 32

- No text for coaches beyond `adminLoginLink`. Coaches still need no account.
- No delete button, no "Ta bort", no "Radera" (F1).
- No tech words in UI: no Supabase, databas, server, session, token or kod in any string. "Planner" in `adminLastChanged` is admin-only.
- No exclamation marks. No loading text while the session is checked or a write is running (disable the button instead).
- The Slice 31 keys above (`bankStale`) and the Slice 22–30 strings are unchanged.
