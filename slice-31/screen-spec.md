# Slice 31 + 32 — screen spec (DRAFT · recommended A1/B2/C1/D1/E1/F1)

**Viewport focus:** Biblioteket (~390 px phone + desktop) · footer · login sheet · exercise detail · bank form. Strings: `content/microcopy.sv.md`.

## Slice 31

### 1) Biblioteket — stale line (D1)

```
Bibliotek                                   [Ny egen övning] [Importera övningar]
Visar sparade övningar. Du kan planera som vanligt.          (muted, small, one line · `bankStale`, Docs final)
[Alla] [Samling] [Uppvärmning] [Teknik] [Styrka] [Lek]
…cards unchanged…
```

- Only when the bank is configured **and** this session's fetch failed. Fresh fetch, bundled-only build, or still loading → no line.
- No spinner, no toast, no layout jump when fresh data arrives (cards update in place; scroll position kept; open sheets/forms keep their input).

Everything else in Slice 31 is invisible: same cards, same order, same detail, same Golvklart.

## Slice 32

### 2) Footer

```
Logged out:  Träningsplaneraren · Slice 32 · Logga in som admin      (muted link)
Logged in:   Träningsplaneraren · Slice 32 · Admin · Logga ut
```

### 3) Login sheet (C1)

```
Logga in som admin                                         [×]
Skriv din e-post så skickar vi en inloggningslänk.
E-post  [ christoffer@…                ]
[Skicka länk]

— after send —
Om e-posten har admin-behörighet kommer en länk strax.
Öppna den i den här webbläsaren — den gäller i en timme.
```

Return from the link: app opens normally (Home), `?code=` removed from the address bar (hash kept), footer shows **Admin · Logga ut**. Not in `admins` → one line `Kontot har inte admin-behörighet.` + **Logga ut**.

### 4) Biblioteket — admin mode

```
Bibliotek  [Admin]                          [Ny egen övning] [Importera övningar]
[Väntar på godkännande (3)] [Behöver granskas (16)] [Dolda (1)]     (filter chips, quiet)
[Alla] [Samling] [Uppvärmning] [Teknik] [Styrka] [Lek]
┌──────────────────────────────────────────────┐
│ Grenhopp på trampett        [Väntar]          │
│ Närvaro                     [Behöver granskas]│
│ Frysdans                    [Dold]            │   ← only under the Dolda filter
└──────────────────────────────────────────────┘
```

- Pending and hidden rows appear **only** under their filter chip (never in the normal list, never addable to a pass).
- Badges on bank cards are admin-only; coaches' view is unchanged.

### 5) Exercise detail — admin actions

```
Grenhopp på trampett   [Väntar]
Teknik · 6 min
(StationSketch …)   Varför / Så gör du / Se upp för / Säkerhet   (unchanged)
Källa: Prime Coaching Sport · 0:16 ↗
┌ Läs igenom texten. Markera som granskad när den stämmer.
└ [Markera som granskad]                         (when needsCoachReview)
[Godkänn]  [Ändra i banken]                      (pending)
[Ändra i banken]  [Dölj för alla]                (published)
[Visa igen]  [Ändra i banken]                    (hidden)
Senast ändrad 2 okt av Planner                   (muted)
```

Regular **Lägg till i valt block** buttons stay for published rows only.

### 6) Dölj confirm

```
Dölja ”Frysdans” för alla tränare? Pass som redan använder övningen visar den fortfarande.
Övningen används i en mall eller i Planera pass och finns kvar där tills mallen ändras.   (only if used)
[Avbryt]                               [Dölj]
```

### 7) Bank form (Ändra i banken)

Same modal family and fields as `OwnActivityForm` (Namn · Block · Minuter · Varför · Så gör du (1–4) · Se upp för · Säkerhet · Redskap (Teknik)), plus:

```
Källa — länk     [https://youtu.be/…        ]
Källa — kanal    [Prime Coaching Sport      ]
Starttid (m:ss)  [0:16]
[ ] Bara för erfarna ledare
Ändringen syns för alla tränare.                 (muted)
[Avbryt]                          [Spara i banken]
```

Saving clears **Behöver granskas** (Slice 30 D1 parity). Tags, difficulty, progression links, visual and order are preserved, not shown.
