import { BLOCK_LABELS, BLOCK_ORDER, stationEquipmentLabelText, UI } from '../data/blockMeta'
import { aggregateStationEquipment } from '../data/equipmentPieces'
import { getActivityById } from '../data/seedActivities'
import { listSessionItems, placeableItems, stationRanks } from '../lib/hall'
import { HallCanvas } from './HallCanvas'
import { StationSketch } from './StationSketch'
import { stationCards } from '../lib/stationCards'
import type { Session } from '../types'

interface Props {
  session: Session
}

/** Slice 44 C1: the pass print carries the station card fields (rank, Erfaren ledare, sketch, Se upp för, Säkerhet, Redskap). */
export function PassPrint({ session }: Props) {
  const cards = stationCards(session)
  const cardById = new Map(placeableItems(session).map((item, i) => [item.id, cards[i]]))
  // Verifier F1: numbers come from the hall (placed Teknik only); unplaced stations stay unnumbered.
  const ranks = stationRanks(session)
  const rows = aggregateStationEquipment(listSessionItems(session))

  return (
    <div className="print-host pass-sheet">
      <header className="pass-sheet-head">
        <h1>{session.title}</h1>
        <p>
          {session.totalMinutes} min
        </p>
      </header>
      <ol className="pass-timeline">
        {BLOCK_ORDER.map((type) => {
          const block = session.blocks.find((b) => b.type === type)
          if (!block || block.items.length === 0) return null
          const items = [...block.items].sort((a, b) => a.order - b.order)
          return (
            <li key={type}>
              <h2>
                {BLOCK_LABELS[type]} · {block.items.reduce((sum, item) => sum + item.durationMinutes, 0)} min
              </h2>
              <ul>
                {items.map((item) => {
                  const activity = getActivityById(item.activityId)
                  const card = cardById.get(item.id)
                  if (!card) {
                    return (
                      <li key={item.id}>
                        <span>{activity?.title ?? item.activityId}</span>
                        <span>{item.durationMinutes} min</span>
                      </li>
                    )
                  }
                  return (
                    <li key={item.id} className="pass-station">
                      <span>
                        {ranks.has(item.id) ? `${ranks.get(item.id)}. ` : ''}
                        {card.title}
                        {card.experienced ? ` · ${UI.experiencedCoach}` : ''}
                      </span>
                      <span>{item.durationMinutes} min</span>
                      <div className="pass-station-body">
                        {card.equipmentSlots && card.equipmentSlots.length > 0 && (
                          <StationSketch slots={card.equipmentSlots} layout={card.equipmentLayout} />
                        )}
                        {card.watch && (
                          <p>
                            <strong>{UI.watchFor}. </strong>
                            {card.watch}
                          </p>
                        )}
                        {card.safety && (
                          <p className="pass-station-safety">
                            <strong>{UI.safety}. </strong>
                            {card.safety}
                          </p>
                        )}
                        {card.equipment && (
                          <p>
                            <strong>{UI.stationEquipmentHeading}. </strong>
                            {card.equipment}
                          </p>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </li>
          )
        })}
      </ol>
      <div className="pass-sheet-map">
        <h2>{UI.hallOverview}</h2>
        <HallCanvas
          session={session}
          hallMode="floor"
          placeModeItemId={null}
          selectedItemId={null}
          viewZoom={1}
          onPlaceAt={() => {}}
          onChipClick={() => {}}
          onRemovePlacement={() => {}}
        />
      </div>
      {rows.length > 0 && (
        <section className="pass-sheet-gear">
          <h2>{UI.forradslistaPrintHeading}</h2>
          <ul>
            {rows.map((row) => (
              <li key={row.pieceId}>
                {stationEquipmentLabelText(row.labelSv, row.count)}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
