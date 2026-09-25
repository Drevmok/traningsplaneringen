# verify-traningsplaneraren — setup proof (2026-09-26)

## Doctor
- `npm run build` in `app/` — exit 0
- `vite preview --host 127.0.0.1 --port 4173`
- `curl` `http://127.0.0.1:4173/traningsplaneringen/` → **200**
- Built bundle contains footer string `Träningsplaneraren · Slice 20`

## Drive (home feature)
- Home loads: **Träningsplaneraren**, Kom igång checklist, Starta från mall path available
- Navigated into Passbyggaren (empty pass blocks visible)
- Screenshots: `/workspace/screenshots/verify_skill_home_smoke.png`, `/workspace/screenshots/verify_skill_nav_smoke.png`

## Artifacts
- `backlog/PSTACK-OPS.md` — team operating note (Slice 21+)
- `verify-traningsplaneraren/` — project verification skill + feature map
- Pointers in `backlog/SCOUT-PLAYBOOK.md`, `verifier/default-lens.md`
- Bot profiles (Verifier, Builder, Docs, Scout) point at ops note / verify skill
- Shared skill pointer: verify-traningsplaneraren

## Git
- Pushed on `main` as `130a90f` (docs-only; phone app unchanged)
