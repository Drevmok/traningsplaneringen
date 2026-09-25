# Distribution — svensk microcopy (Slice 10)

**Status:** Docs lock — Christoffer approved Slice 10 (2026-09-24). Host lock: **GitHub Pages**. Builder may ship from these keys.  
**Tone:** Warm, short, coach-to-coach. Prefer *du*. Honest about local-only storage — no marketing.  
**Locked terms:** gymnaster · pass · övning · Hallöversikt · Golvklart · Passbyggaren · Kom igång · utkast · webbläsare  
**Keep hall caption exactly:** **Schematisk hall — inte exakt mått**  
**Out of scope copy:** App Store, konton, “sparas i molnet”, tunnel-/localhost-instruktioner som permanent lösning.

---

## Honesty note (required)

Show on **Home** (preferred): quiet strip near the bottom of content, below primary cards / Kom igång — never over CTAs, never in Golvklart or print.

| Key | Swedish |
| --- | --- |
| `draftHonestyTitle` | Utkastet stannar i den här webbläsaren |
| `draftHonestyBody` | Pass och tips sparas lokalt i den här webbläsaren. Rensar du webbplatsdata försvinner utkastet. Ingen sparning i molnet i den här versionen. |
| `draftHonestyBodyShort` | Sparas lokalt i webbläsaren — inte i molnet. |
| `draftHonestyOtherDevice` | Öppnar du länken i en annan telefon eller webbläsare börjar du tomt — utkastet följer inte med. |
| `draftHonestyDismiss` | Jag förstår |

Notes:

- Prefer `draftHonestyTitle` + `draftHonestyBody` on Home.
- On a tight phone layout, `draftHonestyBodyShort` is OK, with `draftHonestyOtherDevice` as an optional second line.
- Dismissible forever is allowed **only if** a quiet way back remains (e.g. footer **Om utkast**). Always-on short note is fine for MVP.
- Do **not** say the pass “synkas”, “backas upp”, or “sparas på kontot”.

---

## Home — Öppna på telefon (optional help)

Use when a real `https://…` URL exists (or will at ship). Do **not** tell coaches to use localhost or tunnels.

| Key | Swedish |
| --- | --- |
| `oppnaPaTelefonTitle` | Öppna på telefon |
| `oppnaPaTelefonBody` | Öppna samma länk i telefonens webbläsare. Du kan lägga till appen på hemskärmen för snabbare start. |
| `oppnaPaTelefonBookmark` | Spara länken som bokmärke så hittar du tillbaka till passet. |
| `oppnaPaTelefonHonesty` | Kom ihåg: utkastet bor i just den telefonens webbläsare. |
| `oppnaPaTelefonAddHome` | På iPhone: Dela → Lägg till på hemskärmen. På Android: menyn → Installera app / Lägg till på startsidan. |

Optional for PASS if honesty note + live URL already meet acceptance. Place near the honesty note or under Kom igång.

---

## Footer / chrome

| Key | Swedish |
| --- | --- |
| `footerSliceLabel` | Träningsplaneraren · Slice 10 |
| `omUtkast` | Om utkast |

`footerSliceLabel` matches the visible footer pattern from earlier slices (`no-print`).  
Keep Slice 09 **Visa tips igen** — distribution copy must not displace it.  
`omUtkast` is an optional quiet link that re-shows the honesty note if Builder makes the note dismissible.

---

## Privacy one-liner (optional)

For pack/README sharing — may mirror in-app under honesty or phone help.

| Key | Swedish |
| --- | --- |
| `privacyPublicUrl` | Har du en öppen länk kan vem som helst öppna den tomma appen. Dina övningar och placeringar sparas bara i din webbläsare — inte på servern. |

---

## Manifest strings (optional PWA-lite)

| Key | Swedish / value |
| --- | --- |
| `manifestName` | Träningsplaneraren |
| `manifestShortName` | Passplan |
| `manifestDescription` | Planera truppgymnastikpass — utkastet sparas i webbläsaren. |

`manifestShortName` should stay ≤12 characters when possible for home-screen labels.  
Service-worker / offline cache is **out** for Slice 10 PASS.

---

## Do not ship

- English-only honesty banners.
- “Logga in för att spara”.
- “Fungerar offline överallt” unless a service worker is added later (out of Slice 10 PASS).
- Instructions that name ngrok, localhost URLs, or the agent machine as the coach-facing path.
- Synonyms that imply a cloud account (“molnkonto”, “synka till telefonen”, “säkerhetskopiera passet”).

---

## Notes for Builder

- Prefer these strings over inventing synonyms (“Lagring”, “Cloud sync off”, “Install PWA”).
- Primary surface: Home honesty. Optional phone block only when HTTPS URL is real.
- Do not put honesty essay inside Golvklart floor view or print output.
- localStorage keys stay authoritative: `gymnastics-planner-draft-v1`, `gymnastics-planner-tips-v1` (new dismiss flag only if needed).
