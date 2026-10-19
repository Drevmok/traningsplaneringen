/** Schema v1 envelope (slice-30/content/import-schema.md). Small on purpose: Hämta ett pass only needs isExerciseFile. */
export const EXERCISE_FORMAT = 'traningsplaneraren.ovningar'
export const EXERCISE_SCHEMA_VERSION = 1

/** Accepts a raw JSON paste or a ```json block copied from a chat. */
export function stripFence(text: string): string {
  const trimmed = text.trim()
  const fenced = /^```[a-zA-Z]*[^\S\n]*\n([\s\S]*?)\n?```\s*$/.exec(trimmed)
  return fenced ? fenced[1].trim() : trimmed
}

export function parseJson(text: string): unknown {
  try {
    return JSON.parse(stripFence(text)) as unknown
  } catch {
    return undefined
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

/** Home → Hämta ett pass: an exercise file belongs under Admin (Slice 47). */
export function isExerciseFile(text: string): boolean {
  const data = parseJson(text)
  return isRecord(data) && data.format === EXERCISE_FORMAT
}
