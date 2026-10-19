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
