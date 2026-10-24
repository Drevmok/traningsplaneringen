#!/usr/bin/env bash
# Slice 50 (B1): install the verify toolchain ONCE per box. Idempotent: a second run installs nothing.
#   bash verifier/tools/install-once.sh
# Fixed versions below. Everything lands in $TPV_HOME (default /home/box/tp-verify); Postgres 17 via apt
# only if initdb is missing. No npm ci here (each worktree does its own).
set -euo pipefail
TPV_HOME=${TPV_HOME:-/home/box/tp-verify}
GOTRUE_VERSION=v2.197.0
POSTGREST_VERSION=v12.2.3
PGBIN=${PGBIN:-/usr/lib/postgresql/17/bin}
BIN="$TPV_HOME/bin"; mkdir -p "$BIN"
did=0
if [ ! -x "$PGBIN/initdb" ]; then
  echo "install: postgresql-17 (apt)"; sudo apt-get update -qq && sudo apt-get install -y -qq postgresql-17 >/dev/null; did=1
else echo "ok: postgres 17 ($PGBIN)"; fi
if [ "$(cat "$BIN/gotrue/VERSION" 2>/dev/null)" != "$GOTRUE_VERSION" ] || [ ! -x "$BIN/gotrue/auth" ]; then
  echo "install: GoTrue $GOTRUE_VERSION"; rm -rf "$BIN/gotrue"; mkdir -p "$BIN/gotrue"
  curl -fsSL "https://github.com/supabase/auth/releases/download/$GOTRUE_VERSION/auth-$GOTRUE_VERSION-x86.tar.gz" | tar -xz -C "$BIN/gotrue"
  echo "$GOTRUE_VERSION" > "$BIN/gotrue/VERSION"; did=1
else echo "ok: GoTrue $GOTRUE_VERSION"; fi
if [ "$(cat "$BIN/postgrest.VERSION" 2>/dev/null)" != "$POSTGREST_VERSION" ] || [ ! -x "$BIN/postgrest" ]; then
  echo "install: PostgREST $POSTGREST_VERSION"
  curl -fsSL "https://github.com/PostgREST/postgrest/releases/download/$POSTGREST_VERSION/postgrest-$POSTGREST_VERSION-linux-static-x64.tar.xz" | tar -xJ -C "$BIN"
  echo "$POSTGREST_VERSION" > "$BIN/postgrest.VERSION"; did=1
else echo "ok: PostgREST $POSTGREST_VERSION"; fi
. "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"   # Slice 51 (F1): pw_ok = the same check as Doctor
if ! pw_ok; then
  echo "install: Playwright $PW_VERSION chromium-headless-shell (revision $PW_REV)"; npx -y "playwright@$PW_VERSION" install chromium-headless-shell; did=1   # Slice 52 D1: pinned
  pw_ok || echo "install-once: chromium_headless_shell or /usr/bin/google-chrome still missing" >&2
else echo "ok: Playwright Chromium ($(echo "chromium_headless_shell-$PW_REV"))"; fi
mkdir -p "$TPV_HOME/main" "$TPV_HOME/weekly"
[ $did = 1 ] && echo "install-once: installed" || echo "install-once: nothing to install"
