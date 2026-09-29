import { useState } from 'react'
import { createPortal } from 'react-dom'
import { BLOCK_LABELS, BLOCK_ORDER, UI } from '../data/blockMeta'
import { getActivityById } from '../data/seedActivities'
import { useBodyPrint } from '../lib/bodyPrint'
import { stationCards } from '../lib/stationCards'
import type { Session } from '../types'
import { HallCanvas } from './HallCanvas'
import { PassPrint } from './PassPrint'
import { enterPresentation, StationDeck } from './StationDeck'

interface Props {
  session: Session
}

export function SharePass({ session }: Props) {
  const cards = stationCards(session)
  const [deck, setDeck] = useState(false)
  const [printMode, setPrintMode] = useState<'stations' | 'pass' | null>(null)

  useBodyPrint(printMode, () => setPrintMode(null))

  function leave() {
    window.location.hash = ''
  }

  return (
    <div className="share-pass">
      <p className="share-banner" role="status">
        {UI.shareBanner}
      </p>
      <header className="share-head">
        <h1>{session.title}</h1>
        <p>{session.totalMinutes} min</p>
      </header>
      <div className="share-actions no-print">
        <button
          type="button"
          className="btn-primary"
          disabled={cards.length === 0}
          onClick={() => {
            enterPresentation()
            setDeck(true)
          }}
        >
          {UI.exportFullscreen}
        </button>
        <button
          type="button"
          className="btn-secondary"
          disabled={cards.length === 0}
          onClick={() => setPrintMode('stations')}
        >
          {UI.printStations}
        </button>
        <button type="button" className="btn-secondary" onClick={() => setPrintMode('pass')}>
          {UI.exportPrintPass}
        </button>
        <button type="button" className="btn-text" onClick={leave}>
          {UI.shareExit}
        </button>
      </div>

      <section>
        <h2>{UI.sessionBuilder}</h2>
        <ol className="pass-timeline">
          {BLOCK_ORDER.map((type) => {
            const block = session.blocks.find((b) => b.type === type)
            if (!block || block.items.length === 0) return null
            return (
              <li key={type}>
                <h3>
                  {BLOCK_LABELS[type]} · {block.durationMinutes} min
                </h3>
                <ul>
                  {[...block.items]
                    .sort((a, b) => a.order - b.order)
                    .map((item) => (
                      <li key={item.id}>
                        <span>{getActivityById(item.activityId)?.title ?? item.activityId}</span>
                        <span>{item.durationMinutes} min</span>
                      </li>
                    ))}
                </ul>
              </li>
            )
          })}
        </ol>
      </section>

      <section className="share-map">
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
        </section>

      {deck && <StationDeck cards={cards} onClose={() => setDeck(false)} />}
      {printMode &&
        createPortal(<PassPrint session={session} mode={printMode} />, document.body)}
    </div>
  )
}
