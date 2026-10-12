# Slice 35 — «Tyck till» footer link — SHIPPED (local branch, not pushed, DO NOT MERGE)

**Date:** 2026-10-12 (Europe/Stockholm)
**Branch:** `slice-35-code` from `origin/slice-35-docs` @ `abb3fb6` (main `7a2a813`). No upstream, no push.
**Self-smoke:** `verifier/slice-35-builder-smoke.mjs` → **PASS 41 / FAIL 0** at 390×844. Screenshots: `/workspace/screenshots/slice35_*.png` (9).

## What shipped
- `blockMeta.ts`:
  - `export const SLICE_NUMBER = '35'`.
  - `footerSliceLabel` is now `` `Träningsplaneraren · Slice ${SLICE_NUMBER}` ``.
  - New keys `feedbackLink`, `feedbackLinkAria`, `feedbackMailSubject`, `feedbackMailBodyLines`, `feedbackMailVersion`, `feedbackFallback`, `feedbackCopy`, `feedbackCopied`, all verbatim from the microcopy.
- `lib/feedback.ts` (new): `FEEDBACK_TO`, `feedbackBody()` (lines + blank line + `Version: Slice {SLICE_NUMBER}`, joined with `\r\n`), `feedbackHref()` (`encodeURIComponent` for subject and body).
- `components/FooterFeedback.tsx` (new):
  - A real `<a href="mailto:…" aria-label="Tyck till om appen via e-post">Tyck till</a>` followed by a `·`. No `target`, no `rel`, no `preventDefault`.
  - The `onClick` shows the fallback line «Hittar du ingen e-postapp? Skriv till drevmok@gmail.com». It is selectable and has a «Kopiera adressen» button. The button calls `navigator.clipboard?.writeText`; on success it shows «Kopierad» (`role="status"`) for 2 s, and on failure it does nothing.
  - The line lives in component state only.
- `App.tsx`: `<FooterFeedback />` right after the admin group and before «Visa tips igen». It shows on every view, including home.
- `export.css`:
  - `white-space: nowrap` on each footer item.
  - The fallback `<p>` gets its own row under the footer: `order` + `flex-basis: 100%`, 13 px grey.
- Tests: `lib/feedback.test.ts` (new) covers the href builder and a footer render with `react-dom/server`.

## Decisions
- **One source of truth:** `SLICE_NUMBER` drives both the footer label and the mail version line, so they can't disagree. This is the preferred option in HANDOFF §2.
- **Fallback line:** the line sits inside the footer as the last flex item on its own full-width row, so it appears directly under the footer row (HANDOFF §4). A second tap keeps a single line.
- **«Kopierad»:** it is a `role="status"` span inside the same button, so the button keeps focus. It is not a separate element that replaces the button.
- **Bundle trimming:** to stay under 512 B I dropped the copy timer ref and the extra CSS classes. The class `footer-feedback` stays on the link.

## Bundle (F1) — sum of `gzip -9c` over `dist/assets/*.js` + `*.css`, plain build

| | main 7a2a813 | slice-35-code | Δ |
|---|---|---|---|
| all JS + CSS | 213 408 B | 213 915 B | **+507 B** (< 512) |
| `index-*.js` | 133 990 B | 134 462 B | +472 B |
| `index-*.css` | 14 038 B | 14 081 B | +43 B |

The margin is tight: only 5 B under the limit. Any later wording change in these strings will need re-measuring.

## Tests
- `bun test src`: **143 pass / 0 fail** (20 files).
- `bun test tools/bank`: **21 pass / 5 skip / 0 fail**.
- `npm run build` green.
- oxlint: 0 warnings on the changed files.

## AC coverage
- **Pass (local):** 1, 2 (href decodes exactly), 3, 6, 7, 8, 10, 11, 12 (390 px with logged out, Admin · Logga ut and «inte admin», plus the fallback line), 13 (Tab, focus ring, Enter follows the link, aria name, `role=status`), 14, 15, 16 (footer label, Kör passet «Nästa», print hides the footer, strings verbatim).
- **Real device only:**
  - AC2/AC4/AC5: what the mail app actually shows, in the iPhone and Android installed PWAs.
  - AC6: a device with no mail app.
  - AC9: offline in the installed PWA. Locally, offline still follows the link and shows the line.
  - AC13: VoiceOver / TalkBack.

## Deviations
- The admin footer check uses a mocked admin session (Playwright routes on the bank build). It doesn't use the Slice 33 stand-in, because only the footer layout is under test.
- Headless Chrome can't open a mail app. The smoke records the `mailto:` navigation and compares the decoded href instead.
