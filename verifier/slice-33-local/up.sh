#!/usr/bin/env bash
# Fresh Slice 33 stand-in: setup + start + users (admin@test.local, nonadmin@test.local).
set -euo pipefail
. "$(cd "$(dirname "$0")" && pwd)/env.sh"
bash "$L32/setup.sh" && bash "$L32/start.sh" && bash "$L32/users.sh"
