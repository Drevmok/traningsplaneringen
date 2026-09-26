# Distribution — svensk microcopy (Slice 10 · Slice 23 Home polish)

**Status:** Docs lock — Christoffer approved Slice 10 (2026-09-24); Slice 23 wires **Öppna på telefon** + live Pages URL (2026-09-26). Builder may ship from these keys.  
**Tone:** Warm, short, coach-to-coach. Prefer *du*. Honest about local-only storage — no marketing.  
**Locked terms:** gymnaster · pass · övning · Hallöversikt · Golvklart · Passbyggaren · Kom igång · utkast · webbläsare  
**Keep hall caption exactly:** **Schematisk hall — inte exakt mått**  
**Out of scope copy:** App Store, konton, “sparas i molnet”, tunnel-/localhost-instruktioner som permanent lösning; Förråd empty CTA (Slice 24); saknar / place-heuristic.

Pack seed (Slice 23 Home polish): [`slice-23/content/copy-home-polish.sv.md`](../slice-23/content/copy-home-polish.sv.md) · living [`copy-home-polish.sv.md`](./copy-home-polish.sv.md).

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
- Slice 23: honesty stays; **Öppna på telefon** sits with/below it — does **not** replace honesty.

---

## Home — Öppna på telefon (required · Slice 23)

Always show on Home near honesty (`no-print`). Live Pages URL is visible text **and** openable link. Do **not** tell coaches to use localhost or tunnels. No dismiss required. Not draft-gated.

### Timeless strings (host-free)

| Key | Swedish |
| --- | --- |
| `oppnaPaTelefonTitle` | Öppna på telefon |
| `oppnaPaTelefonBody` | Öppna samma länk i telefonens webbläsare. Du kan lägga till appen på hemskärmen för snabbare start. |
| `oppnaPaTelefonBookmark` | Spara länken som bokmärke så hittar du tillbaka till passet. |
| `oppnaPaTelefonHonesty` | Kom ihåg: utkastet bor i just den telefonens webbläsare. |
| `oppnaPaTelefonAddHome` | På iPhone: Dela → Lägg till på hemskärmen. På Android: menyn → Installera app / Lägg till på startsidan. |

### Host-swappable URL line (decisions Q2)

| Key | Swedish / value |
| --- | --- |
| `oppnaPaTelefonUrl` | https://drevmok.github.io/traningsplaneringen/ |

**Builder pattern:** render a dedicated link line under `oppnaPaTelefonBody`. Visible text **and** `href` both come from `oppnaPaTelefonUrl` (or one build-time constant that seeds that key). Body / bookmark / honesty / add-home stay **host-free** — if the Pages host or path changes, update only the URL key/constant; no Docs rewrite of timeless copy.

Do **not** bake the host into body. Do **not** invent sync / account / cloud wording around the link.

---

## Home — secondary Hallöversikt / Golvklart (Slice 23)

Full lock: [`copy-home-polish.sv.md`](./copy-home-polish.sv.md).

| Key | Swedish |
| --- | --- |
| `homeOpenHall` | Hallöversikt |
| `homeOpenHallAria` | Öppna Hallöversikt från Hem |
| `homeOpenGolvklart` | Golvklart |
| `homeOpenGolvklartAria` | Öppna Golvklart från Hem |

Show when `draftExists`; hide when none. Soft-fail flashes: `komIgangNeedActivity` / `komIgangNeedHall` (unchanged).

---

## Footer / chrome

| Key | Swedish |
| --- | --- |
| `footerSliceLabel` | Träningsplaneraren · Slice 23 |
| `omUtkast` | Om utkast |

`footerSliceLabel` matches the visible footer pattern from earlier slices (`no-print`).  
Keep **Visa tips igen** — distribution copy must not displace it.  
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
Service-worker / offline cache is **out** for Slice 10 / 23 PASS.

---

## Do not ship

- English-only honesty banners.
- “Logga in för att spara”.
- “Fungerar offline överallt” unless a service worker is added later.
- Instructions that name ngrok, localhost URLs, or the agent machine as the coach-facing path.
- Synonyms that imply a cloud account (“molnkonto”, “synka till telefonen”, “säkerhetskopiera passet”).
- Förråd empty CTA copy (Slice 24) · saknar-redskap · place-heuristic · tip strips for hall entry.

---

## Notes for Builder

- Prefer these strings over inventing synonyms (“Lagring”, “Cloud sync off”, “Install PWA”).
- Primary surfaces: Home honesty + Öppna på telefon (Slice 23 required) + secondary Hall/Golvklart when draft.
- Do not put honesty essay inside Golvklart floor view or print output.
- localStorage keys stay authoritative: `gymnastics-planner-draft-v1`, `gymnastics-planner-tips-v1` (new dismiss flag only if needed).
- Host swap: change `oppnaPaTelefonUrl` (or its seeding constant) only.
