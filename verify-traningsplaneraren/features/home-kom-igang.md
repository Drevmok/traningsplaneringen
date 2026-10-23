# Home + Kom igång

**What:** Landing screen; optional Kom igång checklist for new coaches.

**Reach:** Open app base URL `/traningsplaneringen/`.

**Drive:**
1. Confirm home eyebrow/title and primary actions (new pass / Starta från mall / continue draft if present).  
2. If Kom igång visible: walk steps without requiring docs.  
3. Footer shows `Träningsplaneraren · Slice N`.

**Prove:** Coach can start a pass or open mall flow in one clear tap; empty/draft states are understandable; footer slice label matches expected build.

**Slice 49:** Planera pass with 60/90/120 → builder «60 / 60 min», «90 / 90 min» (Teknik 3×12), «120 / 120 min» (was «53 / X»).

**Stabila väljare** (Slice 50; roll + synlig svensk etikett först, sedan aria/id/klass som smokes redan använder; inga `data-testid`)

| Vad | Väljare | Källa |
|---|---|---|
| Startsidan | `.home` | `App.css`, `App.tsx` |
| Guidens ark | `.home-wizard-sheet` | `App.css`, `components/HomeWizard.tsx` |
| Knapp «Kom igång» | `role=button «Kom igång»` | `App.css`, `data/blockMeta.ts` |
| Sidfot | `footer.app-footer` | `App.css`, `App.tsx` |
| Feedback-länk | `footer a.footer-feedback` | `components/FooterFeedback.tsx` |
