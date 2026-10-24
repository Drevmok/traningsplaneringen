#!/usr/bin/env node
// Slice 50 (AC17): every selector in a «Stabila väljare» table must exist in app/src (class/id/attr by grep)
// or be role + visible Swedish label («…», grepped as text). Exit 1 on any miss.
import { readdirSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const REPO = join(dirname(fileURLToPath(import.meta.url)), '..', '..'), FD = join(REPO, 'verify-traningsplaneraren', 'features')
const rg = (pat) => { try { return execFileSync('rg', ['-l', '--glob', '!*.test.ts', '-e', pat, join(REPO, 'app', 'src')], { encoding: 'utf8' }).trim().split('\n').filter(Boolean) } catch { return [] } }
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
let bad = 0, n = 0
for (const f of readdirSync(FD).filter((x) => x.endsWith('.md')).sort()) {
  const s = readFileSync(join(FD, f), 'utf8'), i = s.indexOf('**Stabila väljare**')
  if (i < 0) { console.log(`FAIL ${f}: no «Stabila väljare» section`); bad++; continue }
  for (const row of s.slice(i).split('\n').filter((l) => /^\| .+ \| `/.test(l))) {
    const sel = row.match(/\| `([^`]+)` \|/)[1]; n++
    const label = sel.match(/«(.+)»/)
    const toks = label ? [['text', label[1]]] : [
      ...[...sel.matchAll(/\.([A-Za-z][\w-]*)/g)].map((m) => ['class', m[1]]),
      ...[...sel.matchAll(/#([A-Za-z][\w-]*)/g)].map((m) => ['id', m[1]]),
      ...[...sel.matchAll(/\[(role|type|aria-label)=("?)([^\]"]+)\2\]/g)].map((m) => ['attr', `${m[1]}="${m[3]}"`])]
    const miss = toks.filter(([k, v]) => !rg(k === 'text' || k === 'attr' ? esc(v) : k === 'id' ? `["'\`]${esc(v)}["'\`]|id="${esc(v)}"` : `\\b${esc(v)}\\b`).length)
    if (miss.length || !toks.length) { bad++; console.log(`FAIL ${f}: ${sel} (${miss.map((m) => m[1]).join(', ') || 'no tokens'})`) } else console.log(`PASS ${f}: ${sel}`)
  }
}
console.log(`${bad ? 'AC17 FAIL' : 'AC17 PASS'}: ${n} selectors, ${bad} missing`)
process.exit(bad ? 1 : 0)
