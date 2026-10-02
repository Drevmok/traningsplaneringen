# Slice 31 + 32 — microcopy (Swedish)

**Status:** **Slice 31: Docs final 2026-10-02** (lock A1 / B2 / C1 / D1 / E1 / F1). Builder may ship the Slice 31 keys. **Slice 32: Planner draft**, Docs finalises when Slice 32 starts.  
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

## Slice 32 — login (admins)

| Key | Svenska | Where / when |
|---|---|---|
| `adminLoginLink` | Logga in som admin | Footer, muted link next to the slice label |
| `adminLoginTitle` | Logga in som admin | Sheet heading |
| `adminLoginHint` | Skriv din e-post så skickar vi en inloggningslänk. | Under heading |
| `adminEmailLabel` | E-post | Input label |
| `adminSendLink` | Skicka länk | Primary button |
| `adminLinkSent` | Om e-posten har admin-behörighet kommer en länk strax. Öppna den i den här webbläsaren — den gäller i en timme. | After send (same text for unknown e-mails — no account guessing) |
| `adminWait` | Vänta en minut och försök igen. | Rate limit (429 / "over_email_send_rate_limit") |
| `adminLinkFailed` | Länken fungerade inte. Den kan ha gått ut — be om en ny. | `?code=` exchange failed |
| `adminNotAdmin` | Kontot har inte admin-behörighet. | Logged in but not in `admins`; offer `adminLogout` |
| `adminOffline` | Du är offline. Ändringar i banken kräver nät. | Admin actions disabled |
| `adminBadge` | Admin | Quiet chip in Biblioteket header when admin mode is on |
| `adminLogout` | Logga ut | Footer (replaces `adminLoginLink` while logged in) |
| `adminCloseAria` | Stäng inloggningen | × button |

## Slice 32 — admin mode in Biblioteket

| Key | Svenska | Where / when |
|---|---|---|
| `adminFilterPending` | Väntar på godkännande ({n}) | Filter chip; hidden when n = 0 |
| `adminFilterReview` | Behöver granskas ({n}) | Filter chip; bank exercises with `needsCoachReview` |
| `adminFilterHidden` | Dolda ({n}) | Filter chip |
| `adminPendingBadge` | Väntar | Card + detail badge (pending) |
| `adminHiddenBadge` | Dold | Card + detail badge (hidden) |
| `needsCoachReview` | Behöver granskas | Existing key; in admin mode now also on **bank** cards (coaches: still own-only) |

## Slice 32 — exercise detail (admin)

| Key | Svenska | Where / when |
|---|---|---|
| `adminApprove` | Godkänn | Pending only. Pending → published |
| `adminApproved` | Godkänd — syns för alla tränare nästa gång de öppnar appen. | Toast |
| `adminEdit` | Ändra i banken | Opens bank form |
| `adminHide` | Dölj för alla | Published only |
| `adminHideConfirm` | Dölja ”{title}” för alla tränare? Pass som redan använder övningen visar den fortfarande. | Confirm dialog body |
| `adminHideUsedIn` | Övningen används i en mall eller i Planera pass och finns kvar där tills mallen ändras. | Extra line in the confirm when the id is in `seedTemplates`/`wizardPaths` |
| `adminHideConfirmYes` | Dölj | Confirm button |
| `adminHidden` | Dold för alla. | Toast |
| `adminUnhide` | Visa igen | Hidden only |
| `adminUnhidden` | Syns igen för alla. | Toast |
| `markReviewed` | Markera som granskad | Existing key; now also for bank exercises in admin mode |
| `adminReviewHint` | Läs igenom texten. Markera som granskad när den stämmer. | Above the button (bank exercises) |
| `adminLastChanged` | Senast ändrad {datum} av {vem} | Muted line at the bottom; `{vem}` = e-post, `Planner` for `bot:planner`, `första versionen` for `seed-script` |

## Slice 32 — bank form

| Key | Svenska | Note |
|---|---|---|
| `adminFormTitle` | Ändra övning i banken | Heading |
| `adminFormHint` | Ändringen syns för alla tränare. | Muted, under heading |
| (fields) | Reuse own-form labels: Namn · Block · Minuter · Varför · Så gör du · Se upp för · Säkerhet · Redskap | Same limits/validation as own form |
| `adminFormSourceUrl` | Källa — länk | https only |
| `adminFormSourceCreator` | Källa — kanal | Required if link |
| `adminFormSourceTime` | Starttid (m:ss) | Optional |
| `adminFormExperienced` | Bara för erfarna ledare | Checkbox → `experiencedCoachOnly` |
| `adminFormSave` | Spara i banken | Primary |
| `adminSaved` | Sparat i banken. | Toast |
| `adminSaveConflict` | Någon annan har ändrat övningen. Stäng och öppna den igen. | 0 rows updated (stale `updated_at`) |
| `adminSaveFailed` | Kunde inte spara. Kolla nätet och försök igen. | Network / 4xx / 5xx |
| `footerSliceLabel` | Träningsplaneraren · Slice 32 | Footer |
