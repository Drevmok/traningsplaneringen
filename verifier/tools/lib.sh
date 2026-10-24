# Slice 51 (F1): shared shell helpers for verifier/tools. Source it: . "$HERE/lib.sh"
# Slice 52 (D1): Playwright pinned to the revision the box runs (playwright-core 1.63.0-alpha-2026-08-31 → chromium 1243).
PW_VERSION=1.63.0-alpha-2026-08-31
PW_REV=1243
# pw_ok: the pinned headless shell (chromium_headless_shell-$PW_REV) AND /usr/bin/google-chrome exist.
pw_ok() { [ -d "$HOME/.cache/ms-playwright/chromium_headless_shell-$PW_REV" ] && [ -x /usr/bin/google-chrome ]; }
# Slice 52 (F1): baseline_ok <file> [<smoke-map>]: one «<script> exit=» line per smoke-map key (not "karantan"), a
# «netlog:» line and no «syntax error». Prints what is missing on stderr; returns 1 when the file is not usable.
baseline_ok() {
  local f=$1 map=${2:-${SMOKE_MAP:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/smoke-map.json}} bad=0 s
  [ -f "$f" ] || { echo "baseline_ok: $f saknas" >&2; return 1; }
  for s in $(node -e 'console.log(Object.keys(require(process.argv[1])).filter((k) => k !== "karantan").join(" "))' "$map"); do
    grep -q "^$s exit=" "$f" || { echo "baseline_ok: rad saknas: $s exit=" >&2; bad=1; }
  done
  grep -q '^netlog:' "$f" || { echo "baseline_ok: netlog-raden saknas" >&2; bad=1; }
  grep -q 'syntax error' "$f" && { echo "baseline_ok: «syntax error» i filen" >&2; bad=1; }
  return $bad
}
