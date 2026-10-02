# Slice 31 + 32 — microcopy (Swedish · Planner draft, Docs finalises)

**Status:** **DRAFT** — Docs finalises after lock. Builder ships keys in `UI` (`app/src/data/blockMeta.ts`).  
**Tone:** du, short, coach-to-coach; quiet chrome (Slice 22): no exclamation marks, one line where possible.  
**Locked terms (unchanged):** övning · egen övning · pass · gymnaster · Bibliotek(et) · Teknik · Redskap · Ändra · Behöver granskas · Markera som granskad · Källa.  
**New terms:** **banken** (the shared bank) · **admin** · **Väntar på godkännande** · **Godkänn** · **Dölj för alla** / **Visa igen** · **Dold**.

## Slice 31 — coaches

| Key | Svenska | Where / when |
|---|---|---|
| `bankStale` | Visar sparade övningar — kunde inte hämta de senaste. | Biblioteket only, muted, one line under the list header. Only when the bank is configured **and** the last fetch failed this session. Never on Golvklart, Kör passet, print, Home |
| `footerSliceLabel` | Träningsplaneraren · Slice 31 | Footer |

No other coach-facing text changes in Slice 31 (no spinner, no "laddar", no toast on refresh).

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
