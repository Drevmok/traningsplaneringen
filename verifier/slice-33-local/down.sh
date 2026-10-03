#!/usr/bin/env bash
# Stop only this Slice 33 stand-in (by dir, see ../slice-32-local/README.md).
. "$(cd "$(dirname "$0")" && pwd)/env.sh"
bash "$L32/stop.sh"
