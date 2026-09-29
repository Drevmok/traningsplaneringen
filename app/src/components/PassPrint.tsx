import { BLOCK_LABELS, BLOCK_ORDER, stationEquipmentLabelText, UI } from '../data/blockMeta'
import { aggregateStationEquipment } from '../data/equipmentPieces'
import { getActivityById } from '../data/seedActivities'
import { listSessionItems } from '../lib/hall'
import { HallCanvas } from './HallCanvas'
import { stationCards } from '../lib/stationCards'
import type { Session } from '../types'

interface Props {
  session: Session
  mode: 'stations' | 'pass'
}

export function PassPrint({ session, mode }: Props) {
  const cards = stationCards(session)

  if (mode === 'stations') {
    return (
      <div className="print-host">
        {cards.length === 0 ? (
          <p className="station-sheet-empty">{UI.stationCardsEmpty}</p>
        ) : (
          cards.map((card) => (
            <article key={card.rank} className="station-sheet">
              <p className="station-sheet-rank">{card.rank}</p>
              <h1>{card.title}</h1>
              <p className="station-sheet-meta">
                {card.blockLabel} · {card.minutes} min
                {card.experienced ? ` · ${UI.experiencedCoach}` : ''}
              </p>
              {card.watch && (
                <p>
                  <strong>{UI.watchFor}. </strong>
                  {card.watch}
                </p>
              )}
              {card.safety && (
                <p className="station-sheet-safety">
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
            </article>
          ))
        )}
      </div>
    )
  }

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
                {BLOCK_LABELS[type]} · {block.durationMinutes} min
              </h2>
              <ul>
                {items.map((item) => {
                  const activity = getActivityById(item.activityId)
                  return (
                    <li key={item.id}>
                      <span>{activity?.title ?? item.activityId}</span>
                      <span>{item.durationMinutes} min</span>
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
          onDragOverCanvas={() => {}}
          draggingId={null}
          setDraggingId={() => {}}
          allUnplaced={false}
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
