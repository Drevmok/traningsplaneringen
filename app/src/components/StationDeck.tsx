import { useEffect, useRef, useState } from 'react'
import { UI } from '../data/blockMeta'
import type { StationCardModel } from '../lib/stationCards'

interface Props {
  cards: StationCardModel[]
  onClose: () => void
}

/** Call from the click that opens the deck. Fullscreen from an effect is rejected. */
export function enterPresentation(): void {
  const root = document.documentElement
  if (document.fullscreenElement || !root.requestFullscreen) return
  void root.requestFullscreen().catch(() => {})
}

export function StationDeck({ cards, onClose }: Props) {
  const [index, setIndex] = useState(0)
  const card = cards[index]
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCloseRef.current()
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(cards.length - 1, i + 1))
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      if (document.fullscreenElement) {
        void document.exitFullscreen().catch(() => {})
      }
    }
  }, [cards.length])

  if (!card) return null

  return (
    <div className="station-deck" role="dialog" aria-modal="true" aria-label={UI.exportStations}>
      <p className="station-deck-count">
        {index + 1} / {cards.length}
      </p>
      <p className="station-deck-rank">{card.rank}</p>
      <h1>{card.title}</h1>
      <p className="station-deck-meta">
        {card.minutes} min
        {card.experienced ? ` · ${UI.experiencedCoach}` : ''}
      </p>
      {card.safety && <p className="station-deck-safety">{card.safety}</p>}
      {!card.safety && card.watch && <p>{card.watch}</p>}
      <div className="station-deck-nav">
        <button
          type="button"
          className="btn-secondary"
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
        >
          {UI.deckPrev}
        </button>
        <button type="button" className="btn-secondary" onClick={onClose}>
          {UI.close}
        </button>
        <button
          type="button"
          className="btn-primary"
          disabled={index === cards.length - 1}
          onClick={() => setIndex((i) => i + 1)}
        >
          {UI.deckNext}
        </button>
      </div>
    </div>
  )
}
