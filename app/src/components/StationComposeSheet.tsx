import { useEffect, useMemo, useState } from 'react'
import {
  composeTitleWithName,
  stationEquipmentLabelText,
  UI,
} from '../data/blockMeta'
import {
  EQUIPMENT_PIECES,
  STATION_EQUIPMENT_MAX_COUNT,
  STATION_EQUIPMENT_MAX_SLOTS,
  equipmentIconId,
  getEquipmentPiece,
  sanitizeStationEquipment,
} from '../data/equipmentPieces'
import { VisualIcon } from '../icons'
import type { StationEquipmentSlot } from '../types'

interface Props {
  activityTitle: string
  /** Current saved value — undefined = unset (seed draft may be passed as initialDraft) */
  initialSlots: StationEquipmentSlot[]
  onSave: (slots: StationEquipmentSlot[]) => void
  onClose: () => void
}

function cloneSlots(slots: StationEquipmentSlot[]): StationEquipmentSlot[] {
  return slots.map((s) => ({ pieceId: s.pieceId, count: s.count }))
}

function sameRecipe(
  a: StationEquipmentSlot[],
  b: StationEquipmentSlot[],
): boolean {
  if (a.length !== b.length) return false
  return a.every(
    (s, i) => s.pieceId === b[i]?.pieceId && s.count === b[i]?.count,
  )
}

export function StationComposeSheet({
  activityTitle,
  initialSlots,
  onSave,
  onClose,
}: Props) {
  const baseline = useMemo(
    () => sanitizeStationEquipment(initialSlots) ?? [],
    [initialSlots],
  )
  const [recipe, setRecipe] = useState<StationEquipmentSlot[]>(() =>
    cloneSlots(baseline),
  )

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const dirty = !sameRecipe(recipe, baseline)
  const atMaxSlots = recipe.length >= STATION_EQUIPMENT_MAX_SLOTS

  function addPiece(pieceId: string) {
    setRecipe((prev) => {
      const idx = prev.findIndex((s) => s.pieceId === pieceId)
      if (idx >= 0) {
        const next = cloneSlots(prev)
        next[idx] = {
          pieceId,
          count: Math.min(STATION_EQUIPMENT_MAX_COUNT, next[idx].count + 1),
        }
        return next
      }
      if (prev.length >= STATION_EQUIPMENT_MAX_SLOTS) return prev
      return [...prev, { pieceId, count: 1 }]
    })
  }

  function bump(pieceId: string, delta: number) {
    setRecipe((prev) => {
      const next: StationEquipmentSlot[] = []
      for (const s of prev) {
        if (s.pieceId !== pieceId) {
          next.push(s)
          continue
        }
        const count = s.count + delta
        if (count < 1) continue
        next.push({
          pieceId,
          count: Math.min(STATION_EQUIPMENT_MAX_COUNT, count),
        })
      }
      return next
    })
  }

  function removePiece(pieceId: string) {
    setRecipe((prev) => prev.filter((s) => s.pieceId !== pieceId))
  }

  function handleClose() {
    if (dirty) {
      const ok = window.confirm(
        'Du har osparade ändringar. Stäng utan att spara?',
      )
      if (!ok) return
    }
    onClose()
  }

  function handleDone() {
    onSave(sanitizeStationEquipment(recipe) ?? [])
  }

  return (
    <div
      className="modal-backdrop station-compose-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="station-compose-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      <div className="modal station-compose-sheet">
        <header className="station-compose-header">
          <h2 id="station-compose-title">
            {composeTitleWithName(activityTitle)}
          </h2>
          <div className="station-compose-header-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClose}
              aria-label={UI.composeCloseAria}
            >
              {UI.composeClose}
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleDone}
            >
              {UI.composeDone}
            </button>
          </div>
        </header>

        <section className="station-compose-recipe" aria-labelledby="compose-recipe-h">
          <h3 id="compose-recipe-h">{UI.composeRecipeHeading}</h3>
          {recipe.length === 0 ? (
            <div className="station-compose-empty">
              <p>{UI.composeEmptyRecipe}</p>
              <p className="muted">{UI.composeEmptyRecipeHint}</p>
            </div>
          ) : (
            <ul className="station-compose-recipe-list">
              {recipe.map((s) => {
                const piece = getEquipmentPiece(s.pieceId)
                const label = piece?.labelSv ?? s.pieceId
                return (
                  <li key={s.pieceId} className="station-compose-recipe-row">
                    <VisualIcon
                      iconId={equipmentIconId(piece?.visualKey)}
                      size="item"
                      className="station-compose-piece-icon"
                    />
                    <span className="station-compose-recipe-label">
                      {stationEquipmentLabelText(label, s.count)}
                    </span>
                    <div className="station-compose-stepper">
                      <button
                        type="button"
                        className="btn-secondary station-compose-step"
                        aria-label={UI.composeDecrease}
                        onClick={() => bump(s.pieceId, -1)}
                      >
                        −
                      </button>
                      <span className="station-compose-count" aria-hidden>
                        {s.count}
                      </span>
                      <button
                        type="button"
                        className="btn-secondary station-compose-step"
                        aria-label={UI.composeIncrease}
                        disabled={s.count >= STATION_EQUIPMENT_MAX_COUNT}
                        onClick={() => bump(s.pieceId, 1)}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="btn-text station-compose-remove"
                        aria-label={UI.composeRemovePiece.replace(
                          '{label}',
                          label,
                        )}
                        onClick={() => removePiece(s.pieceId)}
                      >
                        ×
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
          {atMaxSlots && (
            <p className="station-compose-max" role="status">
              {UI.composeMaxReached}
            </p>
          )}
        </section>

        <section className="station-compose-library" aria-labelledby="compose-lib-h">
          <h3 id="compose-lib-h">{UI.composeLibraryHeading}</h3>
          <ul className="station-compose-library-grid">
            {EQUIPMENT_PIECES.map((piece) => {
              const inRecipe = recipe.some((s) => s.pieceId === piece.id)
              const disabled = !inRecipe && atMaxSlots
              return (
                <li key={piece.id}>
                  <button
                    type="button"
                    className={`station-compose-library-btn${inRecipe ? ' is-in-recipe' : ''}`}
                    disabled={disabled}
                    aria-label={UI.composeAddPiece.replace(
                      '{label}',
                      piece.labelSv,
                    )}
                    onClick={() => addPiece(piece.id)}
                  >
                    <VisualIcon
                      iconId={equipmentIconId(piece.visualKey)}
                      size="card"
                      className="station-compose-piece-icon"
                    />
                    <span>{piece.labelSv}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </div>
  )
}
