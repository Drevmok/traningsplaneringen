import { useEffect, useState } from 'react'
import { adminImportDoneText, UI } from '../data/blockMeta'
import { useAdminBank } from '../lib/admin/useAdmin'
import type { AdminEntry } from '../lib/admin/state'
import { ActivityCard } from './ActivityCard'
import { ActivityDetail } from './ActivityDetail'
import AdminBankForm from './AdminBankForm'
import { AdminDetailPanel } from './AdminDetailPanel'
import { AdminStatusBadge } from './AdminStatusBadge'
import ClubAdminSection from './ClubAdminSection'
import OwnImportSheet from './OwnImportSheet'


type ListId = 'pending' | 'review' | 'hidden'
const LISTS: ReadonlyArray<readonly [ListId, string, (e: AdminEntry) => boolean]> = [
  ['pending', UI.adminFilterPending, (e) => e.status === 'pending'],
  ['review', UI.adminFilterReview, (e) => e.status === 'published' && e.needsReview],
  ['hidden', UI.adminFilterHidden, (e) => e.status === 'hidden'],
]

function badges(e: AdminEntry) {
  return (
    <>
      {(e.status === 'pending' || e.status === 'hidden') && <AdminStatusBadge status={e.status} />}
      {e.needsReview && <span className="review-badge">{UI.ownNeedsReview}</span>}
    </>
  )
}

/**
 * Slice 47 C1 — the Admin view (lazy chunk, admins only): the Slice 32 lists, «Ny egen övning» and
 * «Importera övningar» (new pending bank rows, D2: any admin may Godkänn), then «Föreningens mallar».
 */
export default function AdminArea({ onBack }: { onBack: () => void }) {
  const bank = useAdminBank()
  const [openId, setOpenId] = useState<string | null>(null)
  const [form, setForm] = useState<{ mode: 'new' } | { mode: 'edit'; id: string } | null>(null)
  const [importOpen, setImportOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 2200)
    return () => window.clearTimeout(timer)
  }, [toast])

  const lists = LISTS.map(([id, label, test]) => [id, label, bank.entries.filter(test)] as const).filter(([, , rows]) => rows.length > 0)
  const open = openId ? bank.byId.get(openId) : undefined

  return (
    <div className="admin-area">
      <header className="admin-area-top">
        <button type="button" className="btn-text back" onClick={onBack}>
          ← {UI.wizardBack}
        </button>
        <h1>{UI.adminArea}</h1>
      </header>

      <section className="admin-area-section" aria-label={UI.adminArea}>
        {bank.loaded && lists.length === 0 && <p className="muted">{UI.adminAreaEmpty}</p>}
        {lists.map(([id, label, rows]) => (
          <div key={id} className="admin-area-list">
            <h2>{label.replace('{n}', String(rows.length))}</h2>
            <div className="library-list">
              {rows.map((e) => (
                <div key={e.activity.id} className="library-entry">
                  <ActivityCard activity={e.activity} onSelect={() => setOpenId(e.activity.id)} adminBadges={badges(e)} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="admin-area-section">
        <button type="button" className="btn-secondary" onClick={() => setForm({ mode: 'new' })}>
          {UI.ownNew}
        </button>
        <p className="muted">{UI.adminNewHint}</p>
        <button type="button" className="btn-secondary" aria-label={UI.ownImportAria} onClick={() => setImportOpen(true)}>
          {UI.ownImport}
        </button>
        <p className="muted">{UI.adminImportHint}</p>
      </section>

      <section className="admin-area-section">
        <ClubAdminSection onToast={setToast} />
      </section>

      {open && (
        <ActivityDetail
          activity={open.activity}
          onClose={() => setOpenId(null)}
          adminBadges={badges(open)}
          adminSlot={<AdminDetailPanel id={open.activity.id} onToast={setToast} onEdit={() => setForm({ mode: 'edit', id: open.activity.id })} />}
        />
      )}
      {form && (
          <AdminBankForm
            mode={form.mode}
            id={form.mode === 'edit' ? form.id : undefined}
            onCancel={() => setForm(null)}
            onSaved={() => {
              setToast(form.mode === 'new' ? UI.adminNewSaved : UI.adminSaved)
              setForm(null)
            }}
          />
      )}
      {importOpen && (
        <OwnImportSheet
          onClose={() => setImportOpen(false)}
          onImported={(n) => {
            setImportOpen(false)
            setToast(adminImportDoneText(n))
          }}
        />
      )}
      {toast && (
        <div className="toast" role="status">
          <span>{toast}</span>
        </div>
      )}
    </div>
  )
}
