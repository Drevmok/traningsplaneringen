// Slice 40 golden fixture: one Teknik station per suggested zone + 3 open + 2 vault (11 stations).
// Zones are forced via saved redskap so the fixture does not depend on seed drill defaults.
import { BLOCK_BUDGETS, BLOCK_LABELS, BLOCK_ORDER } from '../data/blockMeta.ts'
import type { HallTemplateId, Session, SessionBlock } from '../types.ts'

const PIECES: [string, string][] = [
  ['g-vault', 'eq-satsbrada'],
  ['g-trampett', 'eq-trampett'],
  ['g-tumbling', 'eq-tumblingmatta'],
  ['g-mattberg', 'eq-mattberg'],
  ['g-mats', 'eq-kilmatta'],
  ['g-open-1', 'eq-kon'],
  ['g-open-2', 'eq-kon'],
  ['g-open-3', 'eq-skumblock'],
  ['g-open-4', 'eq-rockring'],
  ['g-vault-2', 'eq-satsbrada'],
  ['g-vault-3', 'eq-satsbrada'],
]

export function goldenSession(hallTemplateId: HallTemplateId): Session {
  const blocks: SessionBlock[] = BLOCK_ORDER.map((type) => ({
    id: `block-${type}`,
    type,
    title: BLOCK_LABELS[type],
    durationMinutes: BLOCK_BUDGETS[type],
    coachNote: '',
    items:
      type === 'techniques'
        ? PIECES.map(([id, pieceId], order) => ({
            id,
            activityId: 'tech-ljushopp-satsbrada',
            durationMinutes: 5,
            note: '',
            order,
            stationEquipment: [{ pieceId, count: 1 }],
          }))
        : type === 'warmup'
          ? [{ id: 'g-warm', activityId: 'warm-jogg', durationMinutes: 5, note: '', order: 0 }]
          : [],
  }))
  return { id: 'golden', title: 'Golden', totalMinutes: 60, notes: '', blocks, hallTemplateId, hallPlacements: [] } as Session
}
