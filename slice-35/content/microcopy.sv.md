# Slice 35 — microcopy (Swedish): «Tyck till»

**Status:** LOCKED 2026-10-11. Words are Docs final.  
**Owner:** Docs owns the words. Builder ships the keys in `UI` (`app/src/data/blockMeta.ts`), next to `footerSliceLabel` and `adminLoginLink`.  
**Tone:** du, short, quiet chrome (Slice 22). No exclamation marks. No tech words in the UI.

**ny** = new key. **ändrad** = same key, new text.

| Key | Svenska | Where / when |
|---|---|---|
| `feedbackLink` **ny** | Tyck till | Footer link, every view |
| `feedbackLinkAria` **ny** | Tyck till om appen via e-post | `aria-label` on the link |
| `feedbackMailSubject` **ny** | Tyck till om Träningsplaneraren | Mail subject |
| `feedbackMailBodyLines` **ny** | see below | Mail body, joined with `\r\n` |
| `feedbackMailVersion` **ny** | Version: Slice {n} | Last line of the body, `{n}` = same number as in `footerSliceLabel` |
| `feedbackFallback` **ny** | Hittar du ingen e-postapp? Skriv till {email} | One grey line under the footer after a tap; `{email}` = drevmok@gmail.com, selectable |
| `feedbackCopy` **ny** | Kopiera adressen | Small text button after the fallback line |
| `feedbackCopied` **ny** | Kopierad | Replaces the button text ~2 s after a successful copy (`role="status"`). On failure: nothing |
| `footerSliceLabel` **ändrad** | Träningsplaneraren · Slice 35 | Footer |

## Mail body (verbatim)

`feedbackMailBodyLines` (each line is one array element; empty = blank line):

```
Hej,

Här är vad jag tycker om Träningsplaneraren.

Vad fungerade bra?


Vad var krångligt?


Vad saknade du?


Tack för att du tar dig tid.

Version: Slice 35
```

(The last line is `feedbackMailVersion` with `{n}` = 35, added after one blank line.)

## Not allowed

No exclamation marks, no "feedback", "formulär", "betyg", "mejlklient", "mailto". No popups, banners or reminders asking for feedback.
