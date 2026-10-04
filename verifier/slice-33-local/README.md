# Slice 33 local stand-in

The Slice 32 stand-in (`../slice-32-local`, real GoTrue + PostgREST + PG17 behind a Supabase-like gateway, SMTP sink)
with its own dir and ports, and the login mail from `slice-33/content/setup-christoffer.md` 12c
(`magic-link.html`, subject `Din kod till Träningsplaneraren: {{ .Token }}`, OTP length 6, expiry 3600 s).

| Script | Does |
|---|---|
| `up.sh` | setup + start + users (`admin@test.local` on the admin list, `nonadmin@test.local`) in `/tmp/s33` |
| `down.sh` | stops only the processes started from that dir |
| `env.sh` | dir `/tmp/s33`, gateway 54640, pg 54641, PostgREST 54642, GoTrue 54643, SMTP 54645, preview 4196 (override any via env) |

Mails land as JSON (`to`, `subject`, `links`, `body`) in `/tmp/s33/mail/`; the code is in the subject and body.
Smoke: `node verifier/slice-33-builder-smoke.mjs` (bank build preview on :4196, plain build on :4195; run on a fresh `up.sh`).
Never point any of this at the real project.
