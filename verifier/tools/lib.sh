# Slice 51 (F1): shared shell helpers for verifier/tools. Source it: . "$HERE/lib.sh"
# pw_ok: the headless shell Playwright actually launches (chromium_headless_shell-*) AND /usr/bin/google-chrome exist.
# (install-once used to look for chromium* only, so a missing headless shell passed there but BLOCKED in Doctor.)
pw_ok() { ls -d "$HOME"/.cache/ms-playwright/chromium_headless_shell-* >/dev/null 2>&1 && [ -x /usr/bin/google-chrome ]; }
