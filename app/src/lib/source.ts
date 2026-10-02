import type { ActivitySource } from '../types'

export const SOURCE_URL_MAX = 300
export const SOURCE_CREATOR_MAX = 80
export const SOURCE_TITLE_MAX = 120
export const SOURCE_SECONDS_MAX = 86400

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function httpsUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const url = value.trim()
  if (!url.startsWith('https://') || url.length > SOURCE_URL_MAX) return null
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' || !parsed.hostname) return null
  } catch {
    return null
  }
  return url
}

/** https link + a creator name, or nothing. Title and start time are optional extras. */
export function sanitizeSource(raw: unknown): ActivitySource | undefined {
  if (!raw || typeof raw !== 'object') return undefined
  const r = raw as Record<string, unknown>
  const url = httpsUrl(r.url)
  const creator = text(r.creator, SOURCE_CREATOR_MAX)
  if (!url || !creator) return undefined
  const source: ActivitySource = { url, creator }
  const title = text(r.title, SOURCE_TITLE_MAX)
  if (title) source.title = title
  const start = r.startSeconds
  if (
    typeof start === 'number' &&
    Number.isInteger(start) &&
    start >= 0 &&
    start <= SOURCE_SECONDS_MAX
  ) {
    source.startSeconds = start
  }
  return source
}

/** 50 → "0:50", 3725 → "1:02:05" */
export function formatSourceTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const ss = String(s).padStart(2, '0')
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${ss}`
  return `${m}:${ss}`
}

/**
 * Slice 30 (D1, AC 5/29) — the quiet coach-only meta in the detail:
 * the Källa line and the Behöver granskas badge (+ hint/button).
 * Never on Golvklart (`floor`); Biblioteket, Passbyggaren and
 * Hallöversikt edit mode keep them.
 */
export function detailCoachMeta(
  activity: { own?: boolean; needsCoachReview?: boolean; source?: unknown },
  floor = false,
): { showSource: boolean; showReview: boolean } {
  if (floor) return { showSource: false, showReview: false }
  return {
    showSource: sanitizeSource(activity.source) !== undefined,
    showReview: activity.own === true && activity.needsCoachReview === true,
  }
}
