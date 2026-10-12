import { useEffect, useState } from 'react'
import { UI } from '../data/blockMeta'
import { lastChangedText } from '../lib/admin/adminFormat'
import { hideClubTemplate, loadClubAdmin, unhideClubTemplate, useClubAdmin, type ClubAdminRow, type ClubWriteResult } from '../lib/admin/clubWrite'
import { useClubTemplates, type ClubTemplate } from '../lib/clubStore'
import { AdminHideConfirm } from './AdminHideConfirm'
import { AdminStatusBadge } from './AdminStatusBadge'
import { ClubTemplateCard, ClubTemplatesSection } from './ClubTemplates'

interface Props {
  onPick: (t: ClubTemplate) => void
  onToast: (msg: string) => void
}

function toastFor(result: ClubWriteResult, ok: string): string {
  return result === 'ok' ? ok : result === 'offline' ? UI.clubOffline : UI.clubWriteFailed
}

/** Slice 36 — admin view of the club group (lazy chunk): Senast ändrad, Dölj för alla, hidden group. */
export default function ClubAdminSection({ onPick, onToast }: Props) {
  const admin = useClubAdmin()
  const club = useClubTemplates()
  const [hiding, setHiding] = useState<ClubAdminRow | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    void loadClubAdmin()
  }, [])

  if (!admin.loaded) return <ClubTemplatesSection club={club} onPick={onPick} />

  const visible = admin.rows.filter((r) => !r.hidden)
  const hidden = admin.rows.filter((r) => r.hidden)

  async function run(write: () => Promise<ClubWriteResult>, ok: string) {
    if (busy) return
    setBusy(true)
    const result = await write()
    setBusy(false)
    onToast(toastFor(result, ok))
  }

  const changed = (r: ClubAdminRow) => <p className="muted admin-last-changed">{lastChangedText(r.updatedAt, r.updatedBy)}</p>

  return (
    <section className="club-templates" aria-label={UI.clubTemplatesTitle}>
      <h3 className="template-group">{UI.clubTemplatesTitle}</h3>
      <p className="muted">{UI.clubTemplatesHint}</p>
      {visible.length === 0 ? (
        <p className="muted">{UI.clubTemplatesEmpty}</p>
      ) : (
        <ul className="template-list">
          {visible.map((r) => (
            <ClubTemplateCard
              key={r.id}
              template={r}
              onPick={onPick}
              extra={
                <>
                  {changed(r)}
                  <div className="template-saved-actions">
                    <button
                      type="button"
                      className="btn-text"
                      disabled={busy}
                      aria-label={UI.clubHideAria.replace('{title}', r.title)}
                      onClick={() => setHiding(r)}
                    >
                      {UI.adminHide}
                    </button>
                  </div>
                </>
              }
            />
          ))}
        </ul>
      )}
      {hidden.length > 0 && (
        <details className="club-hidden">
          <summary>{UI.clubHiddenTitle.replace('{n}', String(hidden.length))}</summary>
          <ul className="template-list">
            {hidden.map((r) => (
              <ClubTemplateCard
                key={r.id}
                template={r}
                onPick={onPick}
                badge={<AdminStatusBadge status="hidden" />}
                extra={
                  <>
                    {changed(r)}
                    <div className="template-saved-actions">
                      <button
                        type="button"
                        className="btn-text"
                        disabled={busy}
                        aria-label={UI.clubUnhideAria.replace('{title}', r.title)}
                        onClick={() => void run(() => unhideClubTemplate(r), UI.adminUnhidden)}
                      >
                        {UI.adminUnhide}
                      </button>
                    </div>
                  </>
                }
              />
            ))}
          </ul>
        </details>
      )}
      {hiding && (
        <AdminHideConfirm
          id={hiding.id}
          title={hiding.title}
          text={UI.clubHideConfirm}
          onCancel={() => setHiding(null)}
          onConfirm={() => {
            const row = hiding
            setHiding(null)
            void run(() => hideClubTemplate(row), UI.adminHidden)
          }}
        />
      )}
    </section>
  )
}
