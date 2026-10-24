// Slice 51 (D1/E1): shared by every script in smoke-map.json.
// KARANTAN = smoke-map.json → "karantan".ids (SMOKE_MAP overrides the map path). A FAIL on such an id prints
// «KARANTÄN-FAIL [id]», is pushed with karantan: true and does not make the exit code ≠ 0.
// Exit: process.exitCode = results.some((r) => !r.ok && !r.karantan) ? 1 : 0 (set by each script after its summary).
import { readFileSync } from 'node:fs'

let ids = []
try {
  ids = JSON.parse(readFileSync(process.env.SMOKE_MAP ?? new URL('../smoke-map.json', import.meta.url), 'utf8')).karantan?.ids ?? []
} catch {
  ids = []
}
export const KARANTAN = ids
