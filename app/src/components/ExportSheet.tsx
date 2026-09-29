import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { UI } from '../data/blockMeta'
import { useBodyPrint } from '../lib/bodyPrint'
import { encodeShare, shareUrl } from '../lib/sharePass'
import { qrSvg } from '../lib/qrSvg'
import { stationCards } from '../lib/stationCards'
import type { Session } from '../types'
import { PassPrint } from './PassPrint'
import { enterPresentation, StationDeck } from './StationDeck'

interface Props {
  session: Session
  onClose: () => void
}

type PrintMode = 'stations' | 'pass' | null

export function ExportSheet({ session, onClose }: Props) {
  const [url, setUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [qr, setQr] = useState<string | null>(null)
  const [qrFailed, setQrFailed] = useState(false)
  const [printMode, setPrintMode] = useState<PrintMode>(null)
  const [deck, setDeck] = useState(false)
  const cards = stationCards(session)

  useBodyPrint(printMode, () => setPrintMode(null))

  useEffect(() => {
    let cancel = false
    void encodeShare(session)
      .then((token) => {
        if (cancel) return
        const next = shareUrl(token)
        setUrl(next)
        try {
          setQr(qrSvg(next))
          setQrFailed(false)
        } catch {
          setQr(null)
          setQrFailed(true)
        }
      })
      .catch(() => {
        if (!cancel) setUrl(null)
      })
    return () => {
      cancel = true
    }
  }, [session])

  async function copy() {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const input = document.createElement('textarea')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      input.remove()
    }
    setCopied(true)
  }

  return (
    <>
      <div
        className="modal-backdrop export-sheet-backdrop"
        role="dialog"
        aria-modal="true"
        aria-label={UI.export}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <div className="modal export-sheet">
          <button type="button" className="modal-close" onClick={onClose} aria-label={UI.close}>
            ×
          </button>
          <h2>{UI.export}</h2>

          <section className="export-block">
            <h3>{UI.exportStations}</h3>
            <p>{UI.exportStationsHint}</p>
            <div className="modal-actions">
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
            </div>
            {cards.length === 0 && <p className="muted">{UI.stationCardsEmpty}</p>}
          </section>

          <section className="export-block">
            <h3>{UI.exportShareLink}</h3>
            <p>{UI.exportShareHint}</p>
            <button type="button" className="btn-primary" disabled={!url} onClick={() => void copy()}>
              {copied ? UI.exportCopied : UI.exportCopy}
            </button>
            {url && (
              <textarea
                className="export-url"
                readOnly
                rows={3}
                value={url}
                aria-label={UI.exportShareLink}
                onFocus={(e) => e.currentTarget.select()}
              />
            )}
            {qr && (
              <div
                className="share-qr"
                aria-label={UI.exportQr}
                dangerouslySetInnerHTML={{ __html: qr }}
              />
            )}
            {qrFailed && <p className="muted">{UI.exportQrLong}</p>}
          </section>

          <section className="export-block">
            <h3>{UI.exportPrintPass}</h3>
            <p>{UI.exportPrintPassHint}</p>
            <button type="button" className="btn-secondary" onClick={() => setPrintMode('pass')}>
              {UI.exportPrintPass}
            </button>
          </section>
        </div>
      </div>
      {deck && <StationDeck cards={cards} onClose={() => setDeck(false)} />}
      {printMode &&
        createPortal(<PassPrint session={session} mode={printMode} />, document.body)}
    </>
  )
}
