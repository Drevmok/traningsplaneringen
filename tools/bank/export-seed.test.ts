/** Slice 32 — the chunked seed parts stay in sync with the generator and under 16 000 bytes. */
import { describe, expect, it } from 'bun:test'
import { mkdtempSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const here = import.meta.dir
const committed = join(here, 'out', 'parts')

function gen(args: string[]): string {
  const dir = mkdtempSync(join(tmpdir(), 'parts-'))
  const p = Bun.spawnSync(['bun', join(here, 'export-seed.ts'), ...args, '--out-dir', dir])
  expect(p.exitCode).toBe(0)
  return dir
}

describe('export-seed --chunked', () => {
  it('committed parts equal a fresh run, each ≤ 16 000 bytes, own begin/commit', () => {
    const dir = gen(['--chunked'])
    const names = readdirSync(dir).sort()
    expect(readdirSync(committed).filter((n) => n.endsWith('.sql')).sort()).toEqual(names)
    for (const n of names) {
      const text = readFileSync(join(dir, n), 'utf8')
      expect(readFileSync(join(committed, n), 'utf8')).toBe(text)
      expect(statSync(join(dir, n)).size).toBeLessThanOrEqual(16000)
      expect(text).toContain('\nbegin;\n')
      expect(text).toContain('\ncommit;\n')
    }
    const last = readFileSync(join(dir, names.at(-1)!), 'utf8')
    expect(last).toContain('update public.exercises set progression_of')
    expect(last).toContain('ovningar_publicerade')
    for (const n of names.slice(0, -1)) expect(readFileSync(join(dir, n), 'utf8')).not.toMatch(/'[a-z]+-[a-z0-9-]+', null, false/) // links nulled
  })
  it('--new-only never updates existing rows and fills only empty links', () => {
    const dir = gen(['--new-only', '--chunked'])
    const all = readdirSync(dir).map((n) => readFileSync(join(dir, n), 'utf8')).join('\n')
    expect(all).not.toContain('do update')
    expect(all).toContain('on conflict (id) do nothing')
    for (const line of all.split('\n').filter((l) => l.startsWith('update '))) expect(line).toMatch(/ is null;$/)
  })
  it('single-file output is unchanged by the chunked mode', () => {
    const p = Bun.spawnSync(['bun', join(here, 'export-seed.ts')])
    expect(p.stdout.toString()).toBe(readFileSync(join(here, 'out', 'bank-seed.sql'), 'utf8'))
  })
})
