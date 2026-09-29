import { BLOCK_BUDGETS, BLOCK_LABELS, BLOCK_ORDER } from '../data/blockMeta'
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
}

export function sessionToShare(session: Session): SharePass {
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
  }
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
    return shareToSession(pass)
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
