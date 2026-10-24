# Feature map — Träningsplaneraren

Each file is a coach-facing feature: what it is, how to reach it, how to drive it, what end state proves it.

| File | Feature |
|---|---|
| [home-kom-igang.md](home-kom-igang.md) | Home + Kom igång |
| [passbyggaren.md](passbyggaren.md) | Passbyggaren (session builder) |
| [starta-fran-mall.md](starta-fran-mall.md) | Starta från mall |
| [hall-redigera-redskap.md](hall-redigera-redskap.md) | Hallöversikt + Redigera redskap |
| [golvklart-forrad.md](golvklart-forrad.md) | Golvklart + Förrådslista |
| [delad-bank.md](delad-bank.md) | Delad övningsbank + admin (Slice 31 + 32, updated 47): Biblioteket from the shared bank, code login, RLS, bot pushes; admin tools now in admin.md |
| [autosave.md](autosave.md) | Spara passet automatiskt (Slice 39): debounce + flush, «Sparat» / «Inte sparat», save on create, replaced pass → Mina mallar, two tabs, races |
| [admin.md](admin.md) | Admin view (Slice 47): gating, Ny egen övning / import as pending rows, Godkänn (D2), Dölj / Visa igen, offline |
| [kor-passet.md](kor-passet.md) | Kör passet (run mode): clock, «Nästa», «Kvar: X min» (Slice 38), tone, wake lock, entry points |
| [liggande-844x390.md](liggande-844x390.md) | Liggande läge 844×390 (Slice 48 F1): row, detail view, Biblioteket, hall edit mode and sheets reachable by scrolling |

Update this index when adding/removing feature files.

**Stabila väljare** (Slice 50): every feature file ends with a table *Vad | Väljare | Källa*. Order: role + visible Swedish label (`role=button «Hallöversikt»`), `aria-label`, id, class — the ones smokes already use. No `data-testid` in the app. Shared across features:

| Vad | Väljare | Källa |
|---|---|---|
| Sidfot | `footer.app-footer` | `App.tsx` |
| Toast | `.toast` | `App.tsx` |
| Stäng ark | `.sheet-close` | `components/` |
| Dialog | `.modal-backdrop[role=dialog]` | `components/` |

Check: `node verifier/tools/check-selectors.mjs` greps every selector in these tables in `app/src` (AC17). Update the table when a smoke starts using a new handle.
