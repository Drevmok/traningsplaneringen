# Slice 35 — verification checklist

Viewport **390×844 portrait** unless noted. Strings: [`content/microcopy.sv.md`](./content/microcopy.sv.md).

| AC | Check | Pass |
|---|---|---|
| AC1 | «Tyck till» is in the footer on every view (home, planner, hall, run, bibliotek), placed after the admin group and before «Visa tips igen». Exactly one `a[href^="mailto:"]` in the DOM, inside `footer`, nowhere else. | ☐ |
| AC2 | Tap opens the mail app with To `drevmok@gmail.com`, subject «Tyck till om Träningsplaneraren», body exactly as microcopy; åäö intact (no `Ã¥`, `%C3`, `+`); line breaks and blank lines intact. | ☐ |
| AC3 | Last body line reads «Version: Slice 35» and matches the footer label number. | ☐ |
| AC4 | iPhone, installed home-screen PWA (standalone): link opens Mail (or default mail app); the app stays in place when you return. Element is a real `<a>`, no `window.open`. | ☐ |
| AC5 | Android, installed PWA: link opens Gmail / chooser with the same To, subject, body. | ☐ |
| AC6 | After a tap, one grey line appears: «Hittar du ingen e-postapp? Skriv till drevmok@gmail.com»; the address can be long-pressed/selected. Device with no mail app: nothing else happens, line visible. | ☐ |
| AC7 | «Kopiera adressen» copies the address and shows «Kopierad» ~2 s. With Clipboard API denied/missing (e.g. http, old browser): no error, no crash, address still selectable. | ☐ |
| AC8 | Fallback line is not saved: reload → gone; reappears only after another tap. | ☐ |
| AC9 | Offline (airplane mode, installed PWA): app works as before; tapping «Tyck till» still opens the mail app with the prefilled mail. | ☐ |
| AC10 | DevTools: tapping makes **no** network request; no new localStorage/sessionStorage/IndexedDB/cookie keys; no analytics code. | ☐ |
| AC11 | No popups, banners, modals, badges or reminders about feedback, at any time. | ☐ |
| AC12 | Footer at 390 px: no horizontal scroll, no item split mid-word, «Logga in som admin» visible; wraps cleanly if needed. Also check admin states (Admin · Logga ut). | ☐ |
| AC13 | Keyboard: Tab reaches «Tyck till», visible focus, Enter opens mail. Screen reader (VoiceOver/TalkBack): announced as link «Tyck till om appen via e-post». «Kopierad» announced via `role="status"`. | ☐ |
| AC14 | Bundle: JS+CSS gzip total grows < 512 bytes, main @ `7a2a813` vs branch, both numbers in the PR (HANDOFF §8). | ☐ |
| AC15 | `npm run build`, lint and tests green; href-builder unit test passes (decodes to exact strings). | ☐ |
| AC16 | Earlier slices unaffected: admin login (32/33), Kör passet tone + «Nästa: …» (34), Visa tips igen, Uppdatera appen, print/export (footer hidden), offline bank (31). Strings verbatim from microcopy; footer reads «Träningsplaneraren · Slice 35». | ☐ |
