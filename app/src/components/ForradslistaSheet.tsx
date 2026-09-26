import { stationEquipmentLabelText, UI } from '../data/blockMeta'
import { useBodyScrollLock } from '../lib/bodyScrollLock'
import type { AggregatedEquipmentRow } from '../data/equipmentPieces'

interface Props {
  rows: AggregatedEquipmentRow[]
  eligibleSuggestedCount: number
  onClose: () => void
  onPointAtApplyAll: () => void
}

/** Slice 15 — read-only pass-wide Förrådslista bottom sheet. Slice 24 soft empty path. */
export function ForradslistaSheet({
  rows,
  eligibleSuggestedCount,
  onClose,
  onPointAtApplyAll,
}: Props) {
  useBodyScrollLock(true)

  const empty = rows.length === 0
  const showSoftPath = empty && eligibleSuggestedCount >= 1

  return (
    <div
      className="modal-backdrop forradslista-backdrop no-print"
      role="dialog"
      aria-modal="true"
      aria-labelledby="forradslista-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="modal forradslista-sheet">
        <header className="forradslista-header">
          <div className="forradslista-heading">
            <h2 id="forradslista-title">{UI.forradslistaTitle}</h2>
            {!empty && (
              <p className="forradslista-sub">{UI.forradslistaSub}</p>
            )}
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            aria-label={UI.forradslistaCloseAria}
          >
            {UI.forradslistaClose}
          </button>
        </header>

        {empty ? (
          <div className="forradslista-empty">
            <p>{UI.forradslistaEmpty}</p>
            {showSoftPath ? (
              <>
                <p className="muted">{UI.forradslistaEmptySoftHint}</p>
                <button
                  type="button"
                  className="btn-secondary hall-tap-target forradslista-soft-cta"
                  aria-label={UI.forradslistaPointApplyAllAria}
                  onClick={onPointAtApplyAll}
                >
                  {UI.forradslistaPointApplyAll}
                </button>
              </>
            ) : (
              <p className="muted">{UI.forradslistaEmptyHint}</p>
            )}
          </div>
        ) : (
          <ul className="forradslista-list">
            {rows.map((row) => (
              <li key={row.pieceId} className="forradslista-row">
                {stationEquipmentLabelText(row.labelSv, row.count)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
