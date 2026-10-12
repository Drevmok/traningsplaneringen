# Slice 35: formal verification report («Tyck till» footer mailto + fallback line)

- **Date:** 2026-10-12, ~11:12–11:45 CEST (Europe/Stockholm)
- **Verifier:** Verifier
- **Code under test:** PR #38, branch `slice-35-code` at **`d0ed438`** (parent `abb3fb6` = docs pack, on `main` @ `7a2a813`). `git pull --ff-only` was a no-op and the working tree was clean. Not merged.
- **Pack:** `slice-35/` LOCKED 2026-10-11 (README, HANDOFF, microcopy, checklist AC1–16).
- **Driver:** Playwright (playwright-core) with headless Chrome at 390×844, DPR 2, touch. `vite preview` ran the plain build on 127.0.0.1:4351 and the bank build on 4352 (`VITE_SUPABASE_URL=https://bank-mock.supabase.co`, with a mocked admin session through Playwright routes and no real project). Main (`7a2a813`) was built in worktree `/tmp/s35main` for the bundle check. The servers were stopped and the worktree removed afterwards.
- **Script:** `verifier/slice-35-verify.mjs` = Builder's smoke plus Verifier extras V1–V6 (decoded mailto, supabase-js, tap target, overlap, offline reload, `#dela=`). **46/47 PASS.** The one FAIL, `E` («no console errors»), was two `net::ERR_FAILED` caused by the test itself: an offline reload in V5 and a route abort for the bank host in E. A separate clean run (home and `#dela=`, online, then offline, then tapping «Tyck till») gave **0 console errors and 0 page errors**.

### Verdict: **PASS (headless). Ready to merge.** AC 2, 4, 5, 6, 9 and 13 are PENDING-real on Christoffer's iPhone and Android after merge. Their headless parts all pass.

| AC | Verdict at d0ed438 | Short |
| --- | --- | --- |
| 1 | **PASS** | «Tyck till» shows on home, Passbyggaren, Hallöversikt, with Bibliotek open and under Kör passet. It sits after the admin group and before «Visa tips igen». The DOM has exactly one `a[href^="mailto:"]` and it is inside `footer` |
| 2 | PENDING-real · local PASS | The href decodes to To `drevmok@gmail.com`, subject «Tyck till om Träningsplaneraren» and the body exactly as in the microcopy. åäö are UTF-8 escapes, there is no `+`, and the line breaks are `%0D%0A` (15 of them) |
| 3 | **PASS** | The last body line is «Version: Slice 35». `SLICE_NUMBER = '35'` drives both that line and `footerSliceLabel` |
| 4 | PENDING-real · local PASS | The link is a real `<a>` with no `target`/`rel` and no `window.open`/`location` in the code. Headless follows it as a navigation to the mailto |
| 5 | PENDING-real | Android needs a real device. Same anchor and same href |
| 6 | PENDING-real · local PASS | After a tap, one grey line (rgb 120,113,108) shows on its own row. The address can be selected (`user-select: text`). A second tap still shows only one line |
| 7 | **PASS** | «Kopiera adressen» puts the address on the clipboard and shows «Kopierad» in `role="status"`, which reverts after about 2 s. With the API missing or denied there is no error and no visible change |
| 8 | **PASS** | After a reload the line is gone, and nothing is persisted |
| 9 | PENDING-real · local PASS | Offline with the page loaded, the tap still follows the mailto and shows the line with 0 errors. The app has **no service worker** on main either, so an offline cold reload fails the same way as before (no regression) |
| 10 | **PASS** | The tap makes 0 network requests and adds no ls/ss/IDB/cookie keys. The feedback code has no fetch/beacon/storage |
| 11 | **PASS** | No dialog, toast or banner on load or after any flow |
| 12 | **PASS** | At 390 px, for logged out («Logga in som admin» visible), admin («Admin · Logga ut»), not-admin and with the fallback line: scrollWidth 390, nothing split, rightmost item ≤ 369 px, and 0 overlapping controls |
| 13 | PENDING-real · local PASS | Tab reaches the link after 4 presses and the focus ring is visible. Enter follows the mailto. The aria-label is «Tyck till om appen via e-post». «Kopierad» is `role="status"` (see C2) |
| 14 | **PASS** | gzip -9 of all JS+CSS goes from 213 408 to 213 915 B, which is **+507 B**, under the < 512 B limit. Both numbers are in `SLICE35-SHIPPED.md`/PR |
| 15 | **PASS** | Build is green. `bun test src` gives 143 pass / 0 fail (139 before plus 4 new href-builder/footer tests). oxlint exits 0 with only the 3 pre-existing warnings |
| 16 | **PASS** | Footer reads «Träningsplaneraren · Slice 35». Kör passet still shows «Nästa: …». The footer is hidden in print. Admin login and logout states render. `#dela=` works. Strings in `blockMeta.ts` match the microcopy word for word. The diff touches no Slice 31–34 file |

## Decoded mailto

```
To:      drevmok@gmail.com
Subject: Tyck till om Träningsplaneraren
Body (CRLF):
Hej,

Här är vad jag tycker om Träningsplaneraren.

Vad fungerade bra?


Vad var krångligt?


Vad saknade du?


Tack för att du tar dig tid.

Version: Slice 35
```

The href is 390 characters long:
`mailto:drevmok@gmail.com?subject=Tyck%20till%20om%20Tr%C3%A4ningsplaneraren&body=Hej%2C%0D%0A%0D%0AH%C3%A4r%20%C3%A4r%20vad%20jag%20tycker%20om%20Tr%C3%A4ningsplaneraren.%0D%0A%0D%0AVad%20fungerade%20bra%3F%0D%0A%0D%0A%0D%0AVad%20var%20kr%C3%A5ngligt%3F%0D%0A%0D%0A%0D%0AVad%20saknade%20du%3F%0D%0A%0D%0A%0D%0ATack%20f%C3%B6r%20att%20du%20tar%20dig%20tid.%0D%0A%0D%0AVersion%3A%20Slice%2035`

It contains no personal data. The version line is the only context, as HANDOFF §6 requires.

## Strings seen on screen

- Link: «Tyck till», aria-label «Tyck till om appen via e-post»
- Fallback: «Hittar du ingen e-postapp? Skriv till drevmok@gmail.com» + «Kopiera adressen» → «Kopierad»
- Home footer: `Tyck till · Uppdatera appen`
- Planner, coach: `Träningsplaneraren · Slice 35 · Tyck till · Visa tips igen · Uppdatera appen`
- Bank build, logged out: `Träningsplaneraren · Slice 35 · Logga in som admin · Tyck till · Visa tips igen · Uppdatera appen`
- Admin: `Träningsplaneraren · Slice 35 · Admin · Logga ut · Tyck till · Visa tips igen · Uppdatera appen`
- Not admin: `… · Du är inloggad men inte admin. · Logga ut · Tyck till · …`

## Bundle (gzip of `dist/assets`, main `7a2a813` vs `d0ed438`)

| Measure | main | branch | Δ |
| --- | --- | --- | --- |
| gzip -9, all JS+CSS (**the AC/HANDOFF §8 measure**) | 213 408 | 213 915 | **+507** (< 512, PASS) |
| gzip -9, eager (index js + css + jsx-runtime) | 151 181 | 151 696 | +515 |
| gzip -6 (default), all JS+CSS | 214 026 | 214 474 | +448 |
| brotli q11 (node zlib), all JS+CSS | 182 601 | 183 082 | +481 |

## Findings

1. All of the code-side ACs pass at 390×844. The decoded mailto matches the microcopy byte for byte, including CRLF and the blank lines.
2. The bundle passes AC14 as worded, at +507 B against < 512 B (5 B to spare). The **eager** subset grew +515 B, which would be over 512 B, but the AC and HANDOFF §8 specify all JS+CSS with gzip -9. With gzip default or brotli the growth is smaller still.
3. Coaches don't load supabase-js. The plain build requests only index js/css and jsx-runtime, and the `dist-*.js` (supabase) chunk is never fetched. Tapping «Tyck till» makes no request.
4. The scope is clean. `git diff --stat 7a2a813..d0ed438` covers only App.tsx (+2), FooterFeedback.tsx, feedback.ts(+test), blockMeta.ts, export.css (+14), docs/pack and verifier files.
5. Secret grep found no real `sb_secret_…` values or JWTs in the repo, `app/dist`, the bank build or `.github`. The only matches are the placeholder text in docs.
6. Tap target: «Tyck till» is 73.5 × 40 px. The spec asks for the same look as its siblings (12 px + 4 px padding) and sets no 44 px requirement, so this is not an AC failure.
7. Offline: the app has no service worker on main or on the branch. With the page already loaded, the link works offline. A cold offline reload fails exactly as before.

## Concerns (non-blocking)

- C1: The 512 B budget has only 5 B left. Slice 36 should expect to need a new budget or cuts.
- C2: The `role="status"` span is mounted together with its text. Some screen readers (notably VoiceOver) don't announce a live region that is inserted already filled. The real-device AC13 check should confirm that «Kopierad» is spoken. If it isn't, keep an empty status span mounted.
- C3: `.app-footer > * { white-space: nowrap }` now applies to every footer child. This is fine at 390 px in every state tested, but it's a global rule on the footer.
- C4: The tap target is 40 px tall, under the 44 px guideline. The spec doesn't require 44 px.

## Ready to merge: **YES** (headless). Then do the real-device checks for AC 2, 4, 5, 6, 9 and 13.

Screenshots: `verifier/slice-35-screenshots/s35v_*.png` (best: `s35v_fallback_line.png`, `s35v_admin_footer_390.png`).
