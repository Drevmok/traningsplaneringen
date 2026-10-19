# Golvklart + Förrådslista

**What:** Floor-ready view for the group; aggregate equipment list for the pass.

**Reach:** From home/hall flows that expose **Golvklart** and **Förrådslista** (requires pass content / hall as gated by Kom igång).

**Drive:**
1. Open Golvklart — short station titles if Slice 17+; redskap under stations if Slice 14+.  
2. Confirm schematic caption unchanged (Schematisk hall — inte exakt mått or locked equivalent).  
3. Open Förrådslista — flat aggregate; no remove controls meant only for edit canvas.

**Prove:** Coach-readable floor view; lists match **saved** composition; no edit-only chrome on floor; caption lock held.

**Slice 47 (B1):** Förrådslista no longer has «Vad finns i hallen ikväll?»; `ownedEquipment.ts` and its keys (`gymnastics-planner-owned-equipment-v1`, `…-seen-v1`, `gymnastics-planner-library-tonight-v1`) are no longer read. Prove: with an old owned list in localStorage (nothing ticked, ikväll on) Biblioteket shows the same number of exercises as a clean profile; the rest of Förrådslista matches main. Golvklart, Kör passet and Skriv ut passet show own exercises.
