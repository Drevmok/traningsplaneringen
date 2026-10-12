# Slice 35 — HANDOFF (Builder)

Words: [`content/microcopy.sv.md`](./content/microcopy.sv.md). Keys go in `UI` (`app/src/data/blockMeta.ts`) next to `footerSliceLabel` / `adminLoginLink`.

## 1. Building the mailto

```ts
const FEEDBACK_TO = 'drevmok@gmail.com';
const version = UI.feedbackMailVersion.replace('{n}', SLICE_NUMBER); // see §2
const body = [...UI.feedbackMailBodyLines, '', version].join('\r\n');
const href =
  `mailto:${FEEDBACK_TO}` +
  `?subject=${encodeURIComponent(UI.feedbackMailSubject)}` +
  `&body=${encodeURIComponent(body)}`;
```

- `encodeURIComponent` for subject and body (never `encodeURI`, never `+` for spaces). åäö become UTF-8 percent escapes (`å` → `%C3%A5`).
- Line breaks are `\r\n` before encoding → `%0D%0A` in the href (RFC 6068). Blank answer lines = an empty element in the array.
- Address is not encoded (plain ASCII). Build the string once (module constant or `useMemo`); it is static.
- Keep `href` well under ~2000 chars (it is ~400).

## 2. Version line

`Version: Slice {n}` where `{n}` comes from the **same source as `footerSliceLabel`**. Today that label is a literal (`'Träningsplaneraren · Slice 34'`). Do one of:
- preferred: add `SLICE_NUMBER = '35'` (or similar) and derive both `footerSliceLabel` and the version line from it; or
- parse the number from `footerSliceLabel` (`/Slice (\d+)/`).

Either way the footer and the mail must never disagree. Builder bumps `footerSliceLabel` to «Träningsplaneraren · Slice 35».

## 3. Footer placement and order

Current order (App.tsx footer): `[Slice label ·]` (not on home) → `[Logga in som admin / Admin · Logga ut ·]` → `[Visa tips igen ·]` (not on home) → `Uppdatera appen`.

New order:

`Träningsplaneraren · Slice 35 · Logga in som admin · Tyck till · Visa tips igen · Uppdatera appen`

- «Tyck till» sits **right after the admin group** (after its trailing `·`), before «Visa tips igen». Shown on **every view, including home** (it is not gated by `view` or admin state).
- Same look as the other footer text buttons (`btn-text visa-tips-igen` styling: 12px, `padding: 4px`), but it is an `<a>`, not a `<button>`. Class e.g. `footer-feedback`.
- One `·` separator after it (`aria-hidden`), same as siblings.
- The footer already has `flex-wrap: wrap; gap: 6px`. At 390 px it may wrap to two lines; that is fine as long as no item breaks mid-word (`white-space: nowrap` on each item), no horizontal scroll, and «Logga in som admin» stays visible.
- Not in print (footer already `no-print`).

## 4. Fallback (no mail app) — chosen approach

A browser cannot tell whether a `mailto:` opened anything (no event, no error; `blur`/`visibilitychange` heuristics misfire on iOS and Android). We don't guess. **Honest pattern:**

1. The tap follows the real link (default action, no `preventDefault`).
2. In the same `onClick`, set local state `feedbackHintOpen = true`. Directly under the footer row, one quiet line appears:
   «Hittar du ingen e-postapp? Skriv till drevmok@gmail.com» with the address as selectable text (`user-select: text`), and a small text button «Kopiera adressen».
3. Copy: `navigator.clipboard?.writeText(addr)` in a `try`/`.catch`. On success the button text changes to «Kopierad» for ~2 s (an inline `role="status"` span, no toast overlay). On failure or if the API is missing: do nothing visible; the address is still selectable. No `document.execCommand` fallback needed.
4. The line stays until reload/navigation away (component state only; **not** persisted). No close button, no animation, no modal. It shows again only after another tap on «Tyck till».

This is shown to everyone who taps (including those whose mail app opened); the wording is a question, so it reads fine either way.

## 5. iOS standalone PWA

- Use a real `<a href="mailto:…">` element. **Not** `window.open`, `location.href =` from JS, or `target="_blank"` — in an iOS home-screen app these can be blocked or open an in-app Safari view. A plain anchor hands off to Mail/Gmail reliably.
- No `rel`/`target` needed. Android (Chrome WebAPK) opens the chooser/Gmail from the same anchor.
- Service worker: mailto links are not fetched; nothing to change in the SW.

## 6. No tracking

No `fetch`, beacon, analytics, `localStorage`/`sessionStorage`/IndexedDB writes, cookies or query params for the click. No user/session data in the mail beyond the version line (no device, plan or name).

## 7. Accessibility

- `<a>` has link role; accessible name via `aria-label={UI.feedbackLinkAria}` («Tyck till om appen via e-post»). Visible text «Tyck till».
- Focusable with Tab, opens with Enter. Visible focus ring like siblings.
- Fallback line is plain text (no live region on appear); only «Kopierad» is `role="status"`.

## 8. Bundle budget (F1)

< 512 bytes gzipped growth, JS + CSS.

```sh
cd app && npm ci && npm run build
for f in dist/assets/*.js dist/assets/*.css; do gzip -9c "$f" | wc -c; done | awk '{s+=$1} END {print s}'
```

Run on `main` @ `7a2a813` and on the branch; put both totals and the delta in the PR description. Strings live in the main chunk (footer is always rendered), so keep the code tiny.

## 9. Tests

Unit test the href builder: starts with `mailto:drevmok@gmail.com?subject=`, contains `%0D%0A`, decodes (`decodeURIComponent`) back to the exact subject and body including åäö and `Version: Slice 35`. Footer render test: one `a[href^="mailto:"]` in the app, inside `footer`.
