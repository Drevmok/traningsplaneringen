# Starta från mall

**What:** Clone a template into a new pass via mall sheet + confirm.

**Reach:** Home → **Starta från mall** → pick mall → confirm apply.

**Drive:**
1. Open mall sheet; choose a mall; confirm apply.  
2. Land in Passbyggaren with cloned content.  
3. Confirm mall/library sheet is **closed**.  
4. Scroll Passbyggaren on phone width.  
5. Check `document.body` style overflow is not stuck `hidden`.  
6. Once: cancel/close without apply → builder/home still scrollable.

**Prove:** Sheet closed after apply; pass content present; scroll works; one-shot template flag does not force sheet open again on remount (Slice 20 C1).

**Slice 47 — Använd mall sheet (A1):** Passbyggaren → Mer → **Använd mall** opens a sheet «Använd mall» (replaces the old Mallar tab of the library): Föreningens mallar (club, when the bank has any; cards not tappable for admin tools), Mina mallar (each with «Kopiera delningskod» and «Ta bort»), Nybörjare, Kort pass. No admin tools in the sheet (those live in Admin → Föreningens mallar). Picking on a non-fresh pass → «Ersätta det här passet?» → toast «Mallen är i Passbyggaren. · Ångra»; Ångra restores the previous pass. The Planera pass → Starta från mall step (Slice 46) is unchanged — compare its text/geometry with main.

**Slice 55:** Planera pass → Starta från mall is Hall → Mall → Passlängd («Fråga 3 av 3», 60/90/120 min, no preselect). After the pick Passbyggaren shows «60 / 60 min» (resp. 90/120); each exercise ≈ its share of the mall (≤1 min off), ≥1 min. Tillbaka on Passlängd → Mall step. Saved mall unchanged. The Använd mall sheet (D1) is unchanged: mall's own times, no length question.

**Slice 49:** no empty «Föreningens mallar» section (shown only with ≥1 club template). A mall start does not fill redskap (C1): text-only saknar row + one «Använd alla förslag».

**Stabila väljare** (Slice 50; roll + synlig svensk etikett först, sedan aria/id/klass som smokes redan använder; inga `data-testid`)

| Vad | Väljare | Källa |
|---|---|---|
| Mallkort | `.template-card` | `App.css`, `components/ClubTemplates.tsx` |
| Mallarket | `.mall-sheet` | `components/MallSheet.tsx`, `export.css` |
| Klubbens mallar | `section.club-templates` | `components/ClubAdminSection.tsx`, `components/ClubTemplates.tsx` |
| Mina mallar | `.template-saved .template-card` | `App.css`, `components/ClubAdminSection.tsx` |
| Dolda klubbmallar | `details.club-hidden` | `components/ClubAdminSection.tsx`, `export.css` |
| Knapp «Starta från mall» | `role=button «Starta från mall»` | `components/HomeWizard.tsx`, `data/blockMeta.ts` |
