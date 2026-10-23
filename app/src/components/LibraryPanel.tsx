import { useMemo, useState } from 'react'
import { BLOCK_LABELS, BLOCK_ORDER, UI } from '../data/blockMeta'
import { useBank } from '../lib/useBank'
import { useAdmin, useAdminBank } from '../lib/admin/useAdmin'
import { AdminStatusBadge } from './AdminStatusBadge'
import type { Activity, BlockType } from '../types'
import { ActivityCard } from './ActivityCard'

/** Slice 47 A1: Lägg till övning is Biblioteket only — no tabs, no own buttons, no «ikväll», no admin bar. */
interface Props {
  filterBlockType: BlockType | 'all'
  onFilterChange: (t: BlockType | 'all') => void
  onSelectActivity: (activity: Activity) => void
  ownActivities: Activity[]
  /** Omitted in the hall's «Lägg till station» sheet: no own-drill edit/delete there. */
  onEditOwn?: (activity: Activity) => void
  onDeleteOwn?: (activity: Activity) => void
  ownInUse?: (activityId: string) => boolean
}

export function LibraryPanel({
  filterBlockType,
  onFilterChange,
  onSelectActivity,
  ownActivities,
  onEditOwn,
  onDeleteOwn,
  ownInUse,
}: Props) {
  const [query, setQuery] = useState('')
  const bank = useBank()
  // Admin badges on cards stay (Slice 32); the pending/review/hidden lists live in Admin (Slice 47 C1).
  const admin = useAdmin()
  const adminBank = useAdminBank()
  const isAdmin = admin.state === 'admin' && adminBank.loaded

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...ownActivities, ...bank.activities].filter((a) => {
      if (filterBlockType !== 'all' && a.blockType !== filterBlockType)
        return false
      if (!q) return true
      return (
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.tags.some((t) => t.includes(q))
      )
    })
  }, [query, filterBlockType, ownActivities, bank.activities])

  function adminBadgesFor(a: Activity) {
    if (!isAdmin || a.own) return undefined
    const entry = adminBank.byId.get(a.id)
    if (!entry) return undefined
    return (
      <>
        {(entry.status === 'pending' || entry.status === 'hidden') && <AdminStatusBadge status={entry.status} />}
        {entry.needsReview && <span className="review-badge">{UI.ownNeedsReview}</span>}
      </>
    )
  }

  return (
    <aside className="side-panel">
      <div className="side-body">
        {bank.status === 'stale' && <p className="bank-stale">{UI.bankStale}</p>}
        <input
          className="search-input"
          type="search"
          placeholder={UI.search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label={UI.search}
        />
        <label className="filter-row">
          <span>{UI.filters}</span>
          <select
            value={filterBlockType}
            onChange={(e) =>
              onFilterChange(e.target.value as BlockType | 'all')
            }
          >
            <option value="all">{UI.filterAll}</option>
            {BLOCK_ORDER.map((t) => (
              <option key={t} value={t}>
                {BLOCK_LABELS[t]}
              </option>
            ))}
          </select>
        </label>
        <div className="library-list">
          {filtered.length === 0 && (
            <p className="muted">{UI.noResults}</p>
          )}
          {filtered.map((a) => (
            <div key={a.id} className="library-entry">
              <ActivityCard activity={a} onSelect={onSelectActivity} adminBadges={adminBadgesFor(a)} />
              {a.own && onEditOwn && onDeleteOwn && ownInUse && (
                <div className="own-card-actions">
                  <button type="button" className="btn-text" onClick={() => onEditOwn(a)}>
                    {UI.ownEditAction}
                  </button>
                  <button
                    type="button"
                    className="btn-text"
                    disabled={ownInUse(a.id)}
                    title={ownInUse(a.id) ? UI.ownInUse : undefined}
                    onClick={() => onDeleteOwn(a)}
                  >
                    {UI.ownDelete}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
