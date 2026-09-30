import { BLOCK_BUDGETS, BLOCK_LABELS, BLOCK_ORDER } from '../data/blockMeta'
import {
  activitiesFromShareOwn,
  activityToShareOwn,
  ownActivitiesForIds,
  setEphemeralOwn,
  type ShareOwn,
} from './ownActivities'
import { withComputedTotal } from './session'
import type {
  BlockType,
  HallPlacement,
  HallTemplateId,
  Session,
  SessionBlock,
  StationEquipmentSlot,
} from '../types'

const PREFIX_RAW = 'j.'
const PREFIX_ZIP = 'z.'

export interface ShareItem {
  id: string
  activityId: string
  durationMinutes: number
  note: string
  order: number
  stationEquipment?: StationEquipmentSlot[]
}

export interface ShareBlock {
  type: BlockType
  durationMinutes: number
  items: ShareItem[]
}

export interface SharePass {
  v: 1
  title: string
  notes: string
  hallTemplateId?: HallTemplateId
  hallShowFlow?: boolean
  hallPlacements?: HallPlacement[]
  blocks: ShareBlock[]
  /** Own drills referenced by this pass. Absent on older links. */
  own?: ShareOwn[]
}

export function sessionToShare(session: Session): SharePass {
  const ids = new Set<string>()
  for (const block of session.blocks) {
    for (const item of block.items) ids.add(item.activityId)
  }
  const own = ownActivitiesForIds(ids).map(activityToShareOwn)
  return {
    v: 1,
    title: session.title,
    notes: session.notes ?? '',
    hallTemplateId: session.hallTemplateId,
    hallShowFlow: session.hallShowFlow,
    hallPlacements: session.hallPlacements,
    blocks: session.blocks.map((block) => ({
      type: block.type,
      durationMinutes: block.durationMinutes,
      items: block.items.map((item) => ({
        id: item.id,
        activityId: item.activityId,
        durationMinutes: item.durationMinutes,
        note: item.note ?? '',
        order: item.order,
        ...(item.stationEquipment
          ? { stationEquipment: item.stationEquipment }
          : {}),
      })),
    })),
    ...(own.length > 0 ? { own } : {}),
  }
}

function sessionFromSharePass(pass: SharePass): Session {
  setEphemeralOwn(activitiesFromShareOwn(pass.own))
  return shareToSession(pass)
}

export function shareToSession(pass: SharePass): Session {
  const byType = new Map(pass.blocks.map((block) => [block.type, block]))
  const blocks: SessionBlock[] = BLOCK_ORDER.map((type) => {
    const found = byType.get(type)
    return {
      id: `block-${type}`,
      type,
      title: BLOCK_LABELS[type],
      durationMinutes: found?.durationMinutes ?? BLOCK_BUDGETS[type],
      coachNote: '',
      items: (found?.items ?? []).map((item) => ({
        id: item.id,
        activityId: item.activityId,
        durationMinutes: item.durationMinutes,
        note: item.note ?? '',
        order: item.order,
        ...(item.stationEquipment
          ? { stationEquipment: item.stationEquipment }
          : {}),
      })),
    }
  })

  return withComputedTotal({
    id: 'shared',
    title: pass.title || 'Delat pass',
    notes: pass.notes ?? '',
    totalMinutes: 0,
    blocks,
    hallTemplateId: pass.hallTemplateId,
    hallPlacements: pass.hallPlacements,
    hallShowFlow: pass.hallShowFlow,
  })
}

function bytesToB64url(bytes: Uint8Array): string {
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlToBytes(value: string): Uint8Array {
  const pad = value.length % 4 === 0 ? '' : '='.repeat(4 - (value.length % 4))
  const b64 = value.replace(/-/g, '+').replace(/_/g, '/') + pad
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function deflate(text: string): Promise<Uint8Array | null> {
  if (typeof CompressionStream === 'undefined') return null
  const stream = new Blob([new TextEncoder().encode(text)])
    .stream()
    .pipeThrough(new CompressionStream('deflate-raw'))
  const buf = await new Response(stream).arrayBuffer()
  return new Uint8Array(buf)
}

async function inflate(bytes: Uint8Array): Promise<string | null> {
  if (typeof DecompressionStream === 'undefined') return null
  const copy = new Uint8Array(bytes)
  const stream = new Blob([copy])
    .stream()
    .pipeThrough(new DecompressionStream('deflate-raw'))
  return new Response(stream).text()
}

function parseShare(json: string): Session | null {
  try {
    const pass = JSON.parse(json) as SharePass
    if (pass?.v !== 1 || !Array.isArray(pass.blocks)) return null
    return sessionFromSharePass(pass)
  } catch {
    return null
  }
}

export async function encodeShare(session: Session): Promise<string> {
  const json = JSON.stringify(sessionToShare(session))
  const zipped = await deflate(json)
  if (zipped && zipped.length + 2 < json.length) {
    return PREFIX_ZIP + bytesToB64url(zipped)
  }
  return PREFIX_RAW + bytesToB64url(new TextEncoder().encode(json))
}

export async function decodeShare(token: string): Promise<Session | null> {
  try {
    if (token.startsWith(PREFIX_ZIP)) {
      const text = await inflate(b64urlToBytes(token.slice(PREFIX_ZIP.length)))
      return text ? parseShare(text) : null
    }
    if (token.startsWith(PREFIX_RAW)) {
      const json = new TextDecoder().decode(
        b64urlToBytes(token.slice(PREFIX_RAW.length)),
      )
      return parseShare(json)
    }
    return parseShare(decodeURIComponent(token))
  } catch {
    return null
  }
}

export function shareHash(token: string): string {
  return `#dela=${token}`
}

export function shareUrl(token: string): string {
  const url = new URL(window.location.href)
  url.hash = shareHash(token)
  return url.toString()
}

export function shareTokenFromHash(hash: string): string | null {
  const marker = '#dela='
  if (!hash.startsWith(marker)) return null
  const token = hash.slice(marker.length)
  return token.length > 0 ? token : null
}

/** SharePass JSON, or a full session that can be slimmed to one. */
export function sessionFromPassJson(text: string): Session | null {
  try {
    const data = JSON.parse(text) as { v?: number; blocks?: unknown }
    if (!data || typeof data !== 'object' || !Array.isArray(data.blocks)) return null
    if (data.v === 1) return sessionFromSharePass(data as SharePass)
    return sessionFromSharePass(sessionToShare(data as Session))
  } catch {
    return null
  }
}

/** URL with #dela=, a z./j. token, or pass JSON. */
export async function sessionFromTransfer(text: string): Promise<Session | null> {
  const trimmed = text.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('{')) return sessionFromPassJson(trimmed)
  const marker = '#dela='
  const at = trimmed.indexOf(marker)
  if (at >= 0) {
    const raw = trimmed.slice(at + marker.length).split(/[\s&]/)[0]
    if (!raw) return null
    try {
      return await decodeShare(decodeURIComponent(raw))
    } catch {
      return decodeShare(raw)
    }
  }
  return decodeShare(trimmed)
}

export function passFileName(title: string): string {
  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
  return `${slug || 'pass'}.json`
}

export function downloadPassFile(session: Session): void {
  const json = JSON.stringify(sessionToShare(session), null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = passFileName(session.title)
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export async function copyText(value: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(value)
  } catch {
    const input = document.createElement('textarea')
    input.value = value
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    input.remove()
  }
}

