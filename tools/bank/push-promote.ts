#!/usr/bin/env bun
/**
 * Slice 32 (E1) — push an approved promote.json into the shared bank as PENDING rows.
 *
 *   SUPABASE_PLANNER_BOT_KEY must be set in the box environment (secure input, never a file
 *   in the repo, never pasted in chat). URL: --url https://<ref>.supabase.co or SUPABASE_URL.
 *
 *   bun tools/bank/push-promote.ts import-trials/<videoId>/promote.json --dry-run
 *   bun tools/bank/push-promote.ts import-trials/<videoId>/promote.json
 *   bun tools/bank/push-promote.ts promote.json --replace tech-x   (only with Christoffer's OK)
 *
 * Inserts with status 'pending', needs_coach_review true, updated_by 'bot:planner'.
 * Existing id → skipped and reported unless --replace <id> (replace never changes status).
 * Never deletes (the database refuses it too). Never prints the key.
 */
import { readFileSync } from 'node:fs'
import { BOT_AUTHOR, checkKey, checkUrl, KEY_ENV, parseArgs, planPromote, replaceBody, scrub, type KnownRow } from './promote-lib.ts'
import { seedActivities } from '../../app/src/data/seedActivities.ts'

const USAGE = `Användning:
  SUPABASE_PLANNER_BOT_KEY=… (sätts säkert på boxen) \\
  bun tools/bank/push-promote.ts <promote.json> [--url https://<ref>.supabase.co] [--dry-run] [--replace <id>]…

  --dry-run      kontrollera och visa vad som skulle skrivas; skriver inget (fungerar utan nyckel)
  --replace <id> skriv över en befintlig rad (text) — bara med Christoffers OK; status ändras aldrig
  URL från --url eller SUPABASE_URL. Nyckeln läses bara från ${KEY_ENV}.`

/** Plain Swedish (no Docs microcopy exists for this line). */
export const NOTHING_NEW = 'Inget nytt: alla övningar i filen fanns redan i banken. Inget skrevs.'

export const KEY_DEAD = 'Nyckeln fungerar inte längre (borttagen eller fel). Be Christoffer skapa en ny planner-bot-nyckel och sätta den på boxen.'

type Fetch = typeof fetch

export interface RunResult {
  code: number
  inserted: string[]
  replaced: string[]
  skipped: string[]
}

export async function run(
  argv: readonly string[],
  env: Record<string, string | undefined>,
  fetchImpl: Fetch = fetch,
  log: (line: string) => void = (l) => console.log(l),
): Promise<RunResult> {
  const result: RunResult = { code: 1, inserted: [], replaced: [], skipped: [] }
  const args = parseArgs(argv)
  if (args.help) {
    log(USAGE)
    return { ...result, code: 0 }
  }
  if (args.errors.length || !args.file) {
    for (const e of args.errors) log(`Fel: ${e}`)
    if (!args.file) log('Fel: ange promote.json.')
    log(USAGE)
    return result
  }
  let text: string
  try {
    text = readFileSync(args.file, 'utf8')
  } catch {
    log(`Fel: kan inte läsa ${args.file}`)
    return result
  }

  const keyCheck = env[KEY_ENV] !== undefined || !args.dryRun ? checkKey(env[KEY_ENV]) : null
  if (keyCheck && !keyCheck.ok) {
    log(`Fel: ${keyCheck.why}`)
    return result
  }
  const key = keyCheck?.ok ? keyCheck.key : null
  let base: string | null = null
  if (key) {
    const u = checkUrl(args.url ?? env.SUPABASE_URL)
    if (!u.ok) {
      log(`Fel: ${u.why}`)
      return result
    }
    base = u.url
  }

  const headers = (extra: Record<string, string> = {}): Record<string, string> => {
    const h: Record<string, string> = { apikey: key as string, 'Content-Type': 'application/json', ...extra }
    // Legacy JWT keys also need the Authorization header; new secret keys go in apikey only.
    if ((key as string).startsWith('eyJ')) h.Authorization = `Bearer ${key}`
    return h
  }
  const say = (s: string) => log(scrub(s, key))
  const bodyText = async (res: Response) => {
    try {
      return scrub((await res.text()).slice(0, 300), key)
    } catch {
      return ''
    }
  }

  // Which ids exist already (all statuses) + last sort order per block.
  let known: KnownRow[]
  if (base) {
    let res: Response
    try {
      res = await fetchImpl(`${base}/rest/v1/exercises?select=id,block_type,sort_order,title,status`, { headers: headers() })
    } catch (e) {
      say(`Fel: når inte banken (${(e as Error).message}).`)
      return result
    }
    if (res.status === 401 || res.status === 403) {
      say(`Fel: ${KEY_DEAD} (HTTP ${res.status})`)
      return result
    }
    if (!res.ok) {
      say(`Fel: banken svarade ${res.status}: ${await bodyText(res)}`)
      return result
    }
    known = (await res.json()) as KnownRow[]
  } else {
    known = seedActivities.map((a, i) => ({ id: a.id, block_type: a.blockType, sort_order: (i + 1) * 10, title: a.title }))
    say(`(torrkörning utan ${KEY_ENV}: jämför mot appens inbyggda bank, inte databasen)`)
  }

  const plan = planPromote(text, known, args.replace)
  if (!plan.ok) {
    say('Inget skrevs. Rätta filen först:')
    for (const p of plan.problems) say(`  - ${p}`)
    return result
  }

  for (const p of plan.rows) {
    const action = p.exists ? (p.replace ? 'ERSÄTT (text, status orörd)' : 'FINNS REDAN — hoppas över') : 'NY (pending)'
    say(`${p.row.id}  ${action}  «${p.title}»  ${p.row.block_type} · ${p.row.duration_minutes_default} min · sort ${p.row.sort_order}`)
    for (const n of p.notes) say(`    · ${n}`)
  }
  if (args.dryRun) {
    say(`Torrkörning: ${plan.rows.filter((r) => !r.exists).length} nya, ${plan.rows.filter((r) => r.exists && r.replace).length} ersätts, ${plan.rows.filter((r) => r.exists && !r.replace).length} hoppas över. Inget skrevs.`)
    return { ...result, code: 0 }
  }

  for (const p of plan.rows) {
    if (p.exists && !p.replace) {
      result.skipped.push(p.row.id)
      continue
    }
    try {
      const res = p.exists
        ? await fetchImpl(`${base}/rest/v1/exercises?id=eq.${encodeURIComponent(p.row.id)}`, {
            method: 'PATCH',
            headers: headers({ Prefer: 'return=representation' }),
            body: JSON.stringify(replaceBody(p.row)),
          })
        : await fetchImpl(`${base}/rest/v1/exercises`, {
            method: 'POST',
            headers: headers({ Prefer: 'return=representation' }),
            body: JSON.stringify(p.row),
          })
      if (res.status === 401 || res.status === 403) {
        say(`Fel: ${KEY_DEAD} (HTTP ${res.status})`)
        return result
      }
      if (res.status === 409) {
        say(`${p.row.id}: finns redan — hoppas över (ingen överskrivning).`)
        result.skipped.push(p.row.id)
        continue
      }
      if (!res.ok) {
        say(`Fel: ${p.row.id}: banken svarade ${res.status}: ${await bodyText(res)}`)
        return result
      }
      const back = (await res.json()) as { id: string; status: string; updated_by: string }[]
      if (!Array.isArray(back) || back.length !== 1) {
        say(`Fel: ${p.row.id}: oväntat svar (${Array.isArray(back) ? back.length : '?'} rader).`)
        return result
      }
      if (!p.exists && (back[0].status !== 'pending' || back[0].updated_by !== BOT_AUTHOR)) {
        say(`Varning: ${p.row.id} sparades med status ${back[0].status} / ${back[0].updated_by}.`)
      }
      ;(p.exists ? result.replaced : result.inserted).push(p.row.id)
    } catch (e) {
      say(`Fel: ${p.row.id}: når inte banken (${(e as Error).message}).`)
      return result
    }
  }
  if (result.inserted.length) say(`Nya (pending): ${result.inserted.join(', ')}`)
  if (result.replaced.length) say(`Ersatta: ${result.replaced.join(', ')}`)
  if (result.skipped.length) say(`Hoppades över (fanns redan): ${result.skipped.join(', ')}`)
  if (result.inserted.length === 0 && result.replaced.length === 0) {
    // C5: every row was skipped → nothing new waits in the app.
    say(NOTHING_NEW)
  } else {
    say('Väntar på godkännande i appen (Logga in som admin → Biblioteket → Väntar på godkännande).')
  }
  return { ...result, code: 0 }
}

if (import.meta.main) {
  const r = await run(process.argv.slice(2), process.env)
  process.exit(r.code)
}
