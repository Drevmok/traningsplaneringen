import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { UI } from '../data/blockMeta'
import { useBodyPrint } from '../lib/bodyPrint'
import { saveSessionAsTemplate } from '../lib/savedTemplates'
import {
  copyText,
  downloadPassFile,
  encodeShare,
  sessionFromTransfer,
  shareUrl,
} from '../lib/sharePass'
import { qrSvg } from '../lib/qrSvg'
import { stationCards } from '../lib/stationCards'
import type { Session } from '../types'
import { PassPrint } from './PassPrint'
import { ReplaceDraftConfirm } from './ReplaceDraftConfirm'
import { enterPresentation, StationDeck } from './StationDeck'

interface Props {
  session: Session
  onClose: () => void
  onImport: (session: Session) => void
  onTemplateSaved: () => void
}

type PrintMode = 'stations' | 'pass' | null

export function ExportSheet({ session, onClose, onImport, onTemplateSaved }: Props) {
  const [url, setUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [qr, setQr] = useState<string | null>(null)
  const [qrFailed, setQrFailed] = useState(false)
  const [printMode, setPrintMode] = useState<PrintMode>(null)
  const [deck, setDeck] = useState(false)
  const [templateNote, setTemplateNote] = useState<string | null>(null)
  const [receiveError, setReceiveError] = useState<string | null>(null)
  const [pendingImport, setPendingImport] = useState<Session | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)
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
    await copyText(url)
    setCopied(true)
  }

  function saveTemplate() {
    saveSessionAsTemplate(session)
    onTemplateSaved()
    setTemplateNote(UI.savedAsTemplate)
  }

  async function onFile(file: File) {
    const text = await file.text()
    const next = await sessionFromTransfer(text)
    if (!next) {
      setReceiveError(UI.receiveBad)
      return
    }
    setReceiveError(null)
    setPendingImport(next)
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
            {cards.length === 0 ? (
              <p className="muted">{UI.stationCardsEmpty}</p>
            ) : (
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-primary"
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
                  onClick={() => setPrintMode('stations')}
                >
                  {UI.printStations}
                </button>
              </div>
            )}
          </section>

          <section className="export-block">
            <h3>{UI.exportShareLink}</h3>
            <p>{UI.exportShareHint}</p>
            <div className="modal-actions">
              <button type="button" className="btn-primary" disabled={!url} onClick={() => void copy()}>
                {copied ? UI.exportCopied : UI.exportCopy}
              </button>
              <button type="button" className="btn-secondary" onClick={() => downloadPassFile(session)}>
                {UI.downloadFile}
              </button>
            </div>
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
            <div className="modal-actions">
              <label className="btn-secondary receive-file">
                {UI.importFile}
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json,.json"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    e.target.value = ''
                    if (file) void onFile(file)
                  }}
                />
              </label>
              <button type="button" className="btn-secondary" onClick={saveTemplate}>
                {UI.saveAsTemplate}
              </button>
            </div>
            {templateNote && <p className="muted">{templateNote}</p>}
            {receiveError && (
              <p className="muted" role="alert">
                {receiveError}
              </p>
            )}
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
      {pendingImport && (
        <ReplaceDraftConfirm
          onCancel={() => setPendingImport(null)}
          onConfirm={() => {
            const next = pendingImport
            setPendingImport(null)
            onImport(next)
          }}
        />
      )}
      {deck && <StationDeck cards={cards} onClose={() => setDeck(false)} />}
      {printMode &&
        createPortal(<PassPrint session={session} mode={printMode} />, document.body)}
    </>
  )
}
