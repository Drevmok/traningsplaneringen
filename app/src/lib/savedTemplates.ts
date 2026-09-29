import type { Session } from '../types'
import { sessionToShare, shareToSession, type SharePass } from './sharePass'

const KEY = 'gymnastics-planner-templates-v1'
const MAX_TEMPLATES = 8

export interface SavedTemplate {
  id: string
  title: string
  totalMinutes: number
  savedAt: string
  pass: SharePass
}

export function loadSavedTemplates(): SavedTemplate[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SavedTemplate[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item) => item && item.pass?.v === 1 && typeof item.id === 'string',
    )
  } catch {
    return []
  }
}

function writeTemplates(list: SavedTemplate[]): void {
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function saveSessionAsTemplate(session: Session): SavedTemplate {
  const next: SavedTemplate = {
    id: `mall-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    title: session.title || 'Mall',
    totalMinutes: session.totalMinutes,
    savedAt: new Date().toISOString(),
    pass: sessionToShare(session),
  }
  writeTemplates([next, ...loadSavedTemplates()].slice(0, MAX_TEMPLATES))
  return next
}

export function deleteSavedTemplate(id: string): SavedTemplate[] {
  const list = loadSavedTemplates().filter((item) => item.id !== id)
  writeTemplates(list)
  return list
}

export function savedTemplateToSession(template: SavedTemplate): Session {
  return shareToSession(template.pass)
}
