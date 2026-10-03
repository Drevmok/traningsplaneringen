/**
 * Slice 32 (E1) — pure parts of the bot write script (unit-tested, no network).
 * See push-promote.ts for the CLI and slice-31/content/bot-writes.md for the flow.
 */
import type { Activity, BlockType } from '../../app/src/types.ts'
import { BANK_ID_RE, rowToEntry, type BankRow } from '../../app/src/lib/bankRow.ts'
import { parseExerciseFile } from '../../app/src/lib/ownImport.ts'

export const KEY_ENV = 'SUPABASE_PLANNER_BOT_KEY'
export const BOT_AUTHOR = 'bot:planner'
export const MAX_EXERCISES = 100

export const BLOCK_PREFIX: Record<BlockType, string> = {
  gathering: 'gather',
  warmup: 'warm',
  techniques: 'tech',
  strength: 'strength',
  fun_and_games: 'fun',
}

export interface CliArgs {
  file: string | null
  url: string | null
  dryRun: boolean
  replace: string[]
  help: boolean
  errors: string[]
}

export function parseArgs(argv: readonly string[]): CliArgs {
  const out: CliArgs = { file: null, url: null, dryRun: false, replace: [], help: false, errors: [] }
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i]
    if (a === '--dry-run') out.dryRun = true
    else if (a === '--help' || a === '-h') out.help = true
    else if (a === '--url') out.url = argv[++i] ?? null
    else if (a.startsWith('--url=')) out.url = a.slice(6)
    else if (a === '--replace') {
      const id = argv[++i]
      if (id && !id.startsWith('--')) out.replace.push(id)
      else out.errors.push('--replace behöver ett id (t.ex. --replace tech-formhopp-over-block)')
    } else if (a.startsWith('--replace=')) out.replace.push(a.slice(10))
    else if (a.startsWith('--')) out.errors.push(`Okänd flagga: ${a}`)
    else if (out.file === null) out.file = a
    else out.errors.push(`En fil i taget (fick även ${a})`)
  }
  return out
}

/** https only; plain http allowed for 127.0.0.1 / localhost (local stand-in tests). */
export function checkUrl(raw: string | null | undefined): { ok: true; url: string } | { ok: false; why: string } {
  const url = String(raw ?? '').trim().replace(/\/+$/, '')
  if (!url) return { ok: false, why: 'Ingen bank-URL. Ange --url https://<ref>.supabase.co eller SUPABASE_URL.' }
  if (/^https:\/\/[a-z0-9.-]+(:\d+)?$/i.test(url)) return { ok: true, url }
  if (/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/i.test(url)) return { ok: true, url }
  return { ok: false, why: 'Bank-URL:en måste vara https://<ref>.supabase.co (http bara för 127.0.0.1/localhost).' }
}

function jwtRole(key: string): string | null {
  const parts = key.split('.')
  if (parts.length !== 3 || !key.startsWith('eyJ')) return null
  try {
    const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'))
    return typeof payload?.role === 'string' ? payload.role : ''
  } catch {
    return ''
  }
}

/**
 * The bot needs the dedicated secret key. Refuses keys meant for browsers (they could never
 * write pending rows, and using them would hide a setup mistake). Never echoes the key.
 */
export function checkKey(raw: string | undefined): { ok: true; key: string } | { ok: false; why: string } {
  const key = String(raw ?? '').trim()
  if (!key) return { ok: false, why: `Ingen nyckel: miljövariabeln ${KEY_ENV} är inte satt på boxen.` }
  if (/\s/.test(key)) return { ok: false, why: `${KEY_ENV} innehåller mellanslag eller radbrytning — kontrollera värdet.` }
  if (key.startsWith('sb_publishable_')) {
    return { ok: false, why: `${KEY_ENV} är den publika nyckeln (sb_publishable_…). Boten behöver sin egen hemliga nyckel (planner-bot).` }
  }
  const role = jwtRole(key)
  if (role !== null && role !== 'service_role') {
    return { ok: false, why: `${KEY_ENV} är en ${role || 'okänd'}-nyckel. Boten behöver sin egen hemliga nyckel (planner-bot).` }
  }
  return { ok: true, key }
}

/** Remove any copy of the key from text before it is printed (server messages, errors). */
export function scrub(text: string, key: string | null): string {
  if (!key) return text
  return text.split(key).join('[nyckel]')
}

export interface KnownRow {
  id: string
  block_type: string
  sort_order: number
  title?: string
  status?: string
}

export interface PlannedRow {
  row: Omit<BankRow, 'status'> & { status: 'pending'; updated_by: string }
  fileId: string
  title: string
  exists: boolean
  replace: boolean
  notes: string[]
}

export interface Plan {
  ok: boolean
  problems: string[]
  rows: PlannedRow[]
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

/**
 * promote.json (schema v1 + seedId) → bank rows, all-or-nothing: any problem → nothing is planned.
 * Same sanitizing as the in-app import (parseExerciseFile), then bank rules on top.
 */
export function planPromote(text: string, known: readonly KnownRow[], replace: readonly string[] = []): Plan {
  const problems: string[] = []
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return { ok: false, problems: ['Filen är inte giltig JSON.'], rows: [] }
  }
  const list = isRecord(data) && Array.isArray(data.exercises) ? data.exercises : null
  if (!list) return { ok: false, problems: ['Filen saknar "exercises" (schema v1).'], rows: [] }
  if (list.length > MAX_EXERCISES) {
    return { ok: false, problems: [`Filen har ${list.length} övningar — max ${MAX_EXERCISES} per körning.`], rows: [] }
  }
  const seeds = known.map((k) => ({ id: k.id, title: k.title ?? '' }) as Activity)
  const parsed = parseExerciseFile(text, { own: [], seeds })
  if (!parsed.ok) {
    const why = { bad: 'Filen är inte en övningsfil (format/schemaVersion).', newer: 'Filen är från en nyare version.', empty: 'Filen innehåller inga övningar.', isPass: 'Det här är en passfil, inte en övningsfil.' }
    return { ok: false, problems: [why[parsed.reason]], rows: [] }
  }

  const knownIds = new Set(known.map((k) => k.id))
  const maxSort = new Map<string, number>()
  for (const k of known) maxSort.set(k.block_type, Math.max(maxSort.get(k.block_type) ?? 0, k.sort_order))

  // file id (own-…) → seedId, for links between rows in the same file
  const seedIdOf = new Map<string, string>()
  const seenSeed = new Set<string>()
  list.forEach((raw, i) => {
    const r = isRecord(raw) ? raw : {}
    const label = `Övning ${i + 1}${typeof r.title === 'string' ? ` (${r.title})` : ''}`
    const seedId = typeof r.seedId === 'string' ? r.seedId.trim() : ''
    const block = r.blockType as BlockType
    if (!seedId) problems.push(`${label}: saknar seedId.`)
    else if (!BANK_ID_RE.test(seedId)) problems.push(`${label}: seedId "${seedId}" har fel form (gather-/warm-/tech-/strength-/fun- + a-z0-9-).`)
    else if (BLOCK_PREFIX[block] && !seedId.startsWith(`${BLOCK_PREFIX[block]}-`)) problems.push(`${label}: seedId "${seedId}" ska börja med ${BLOCK_PREFIX[block]}- för blocket.`)
    else if (seenSeed.has(seedId)) problems.push(`${label}: seedId "${seedId}" finns två gånger i filen.`)
    if (seedId) seenSeed.add(seedId)
    if (typeof r.id === 'string' && seedId) seedIdOf.set(r.id, seedId)
  })
  parsed.rows.forEach((row) => {
    if (row.state === 'invalid' || !row.activity) {
      const why = row.notes.map((n) => (n.kind === 'missing' ? `saknar ${n.fields.join(', ')}` : n.kind)).join('; ') || 'ogiltig'
      problems.push(`Övning ${row.index + 1} (${row.title || '?'}): kan inte importeras — ${why}.`)
    }
  })
  for (const id of replace) if (!seenSeed.has(id)) problems.push(`--replace ${id}: id:t finns inte i filen.`)
  if (problems.length) return { ok: false, problems, rows: [] }

  const linkTarget = (id: string | undefined): string | null => {
    if (!id) return null
    const mapped = seedIdOf.get(id) ?? id
    return knownIds.has(mapped) || seenSeed.has(mapped) ? mapped : null
  }

  const rows: PlannedRow[] = []
  parsed.rows.forEach((pr, i) => {
    const raw = list[i] as Record<string, unknown>
    const a = pr.activity as Activity
    const seedId = String(raw.seedId).trim()
    const notes: string[] = []
    for (const n of pr.notes) {
      if (n.kind === 'unknownPiece') notes.push(`okänt redskap borttaget: ${n.pieces.join(', ')}`)
      else if (n.kind === 'clipped' || n.kind === 'steps') notes.push('text förkortad')
      else if (n.kind === 'notTeknik') notes.push('redskap bara på Teknik — borttagna')
      else if (n.kind === 'source') notes.push('källa borttagen (bara https)')
    }
    const newCoachOk = raw.newCoachOk === true
    let tags = a.tags.filter((t) => t !== 'egen' && t !== 'new-coach-ok')
    if (newCoachOk) tags = [...tags.slice(0, 7), 'new-coach-ok']
    const rawProg = typeof raw.progressionOf === 'string' ? raw.progressionOf : undefined
    const rawReg = typeof raw.regressionOf === 'string' ? raw.regressionOf : undefined
    const progression = linkTarget(rawProg)
    const regression = linkTarget(rawReg)
    if (rawProg && !progression) notes.push(`länk progressionOf "${rawProg}" borttagen (finns inte i banken)`)
    if (rawReg && !regression) notes.push(`länk regressionOf "${rawReg}" borttagen (finns inte i banken)`)
    const next = (maxSort.get(a.blockType) ?? 0) + 10
    maxSort.set(a.blockType, next)
    const row: PlannedRow['row'] = {
      id: seedId,
      block_type: a.blockType,
      title: a.title,
      duration_minutes_default: a.durationMinutesDefault,
      summary: a.summary,
      how_to: a.howTo,
      watch_for: a.watchFor,
      watch_for_required: true,
      safety_line: a.safetyLine?.trim() ? a.safetyLine : null,
      visual_key: seedId,
      difficulty: a.difficulty,
      tags,
      default_station_equipment: a.blockType === 'techniques' && a.defaultStationEquipment?.length ? a.defaultStationEquipment : null,
      legacy_equipment: null,
      progression_of: progression,
      regression_of: regression,
      experienced_coach_only: a.experiencedCoachOnly === true,
      new_coach_ok: newCoachOk,
      needs_coach_review: true,
      source: a.source ?? null,
      status: 'pending',
      sort_order: next,
      updated_by: BOT_AUTHOR,
    }
    // Same guard the app uses when it reads the row back (as if approved).
    if (!rowToEntry({ ...row, status: 'published' })) problems.push(`${seedId}: raden skulle inte gå att visa i appen.`)
    rows.push({ row, fileId: typeof raw.id === 'string' ? raw.id : '', title: a.title, exists: knownIds.has(seedId), replace: replace.includes(seedId), notes })
  })
  if (problems.length) return { ok: false, problems, rows: [] }
  return { ok: true, problems: [], rows }
}

/** Body for --replace: new text, back to needs review; never status, id or sort order. */
export function replaceBody(row: PlannedRow['row']): Record<string, unknown> {
  const { status: _s, id: _id, sort_order: _o, ...rest } = row
  return rest
}
