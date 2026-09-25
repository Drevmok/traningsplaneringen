# Träningsplaneraren

Swedish gymnastics coaching planner (pass builder + hall overview). Client-only; drafts stay on the device.

## Live phone URL

After Pages is enabled: **https://drevmok.github.io/traningsplaneringen/**

## Develop

```bash
cd app
npm ci
npm run dev
```

## Build for GitHub Pages

```bash
cd app
VITE_BASE=/traningsplaneringen/ npm run build
```

Default `base` in `vite.config.ts` is already `/traningsplaneringen/`.

## Deploy

Push to `main` runs `.github/workflows/pages.yml` (build + GitHub Pages).

First time: **Settings → Pages → Source: GitHub Actions**.
