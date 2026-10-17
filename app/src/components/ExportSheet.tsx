import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { UI } from '../data/blockMeta'
import { usePassPrint } from '../lib/bodyPrint'
import { copyText, encodeShare, shareUrl } from '../lib/sharePass'
import type { Session } from '../types'
import { PassPrint } from './PassPrint'

interface Props {
  session: Session
  onClose: () => void
}

/** Slice 44 E1: «Dela» = Kopiera länk + Skriv ut passet. */
export function ExportSheet({ session, onClose }: Props) {
  const [url, setUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [copyFailed, setCopyFailed] = useState(false)
  const resetTimer = useRef<number | undefined>(undefined)
  const pp = usePassPrint()

  useEffect(() => {
    let cancel = false
    void encodeShare(session)
      .then((token) => { if (!cancel) setUrl(shareUrl(token)) })
      .catch(() => { if (!cancel) setUrl(null) })
    return () => { cancel = true }
  }, [session])

  useEffect(() => () => window.clearTimeout(resetTimer.current), [])

  async function copy() {
    if (!url) return
    const ok = await copyText(url)
    setCopyFailed(!ok)
    setCopied(ok)
    window.clearTimeout(resetTimer.current)
    if (ok) resetTimer.current = window.setTimeout(() => setCopied(false), 3000)
  }

  return (
    <>
      <div
        className="modal-backdrop modal-backdrop--compact export-sheet-backdrop"
        role="dialog"
        aria-modal="true"
        aria-label={UI.export}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <div className="modal modal--compact export-sheet">
          <button type="button" className="modal-close" onClick={onClose} aria-label={UI.close}>
            ×
          </button>
          <h2>{UI.export}</h2>

          <section className="export-block">
            <h3>{UI.exportShareLink}</h3>
            <p>{UI.exportShareHint}</p>
            <button type="button" className="btn-primary" disabled={!url} onClick={() => void copy()}>
              {copied ? UI.exportCopied : UI.exportCopy}
            </button>
            {copyFailed && url && (
              <>
                <p className="muted" role="status">{UI.exportCopyManual}</p>
                <input
                  className="export-url"
                  readOnly
                  value={url}
                  aria-label={UI.exportShareLink}
                  onFocus={(e) => e.currentTarget.select()}
                />
              </>
            )}
          </section>

          <section className="export-block">
            <h3>{UI.exportPrintPass}</h3>
            <p>{UI.exportPrintPassHint}</p>
            <button type="button" className="btn-secondary" onClick={pp.print}>
              {UI.exportPrintPass}
            </button>
            {pp.stalled && <p className="muted" role="status">{UI.printStalled}</p>}
          </section>
        </div>
      </div>
      {pp.armed && createPortal(<PassPrint session={session} />, document.body)}
    </>
  )
}
