import { useMemo, useState } from 'react'
import {
  BLOCK_LABELS,
  BLOCK_ORDER,
  TIPS_TAB,
  UI,
} from '../data/blockMeta'
import { seedActivities } from '../data/seedActivities'
import { seedTemplates } from '../data/seedTemplates'
import type { Activity, BlockType, SideTab } from '../types'
import { ActivityCard } from './ActivityCard'

interface Props {
  tab: SideTab
  onTabChange: (tab: SideTab) => void
  filterBlockType: BlockType | 'all'
  onFilterChange: (t: BlockType | 'all') => void
  selectedBlockType: BlockType | null
  onSelectActivity: (activity: Activity) => void
  onPickTemplate: (templateId: string) => void
}

export function LibraryPanel({
  tab,
  onTabChange,
  filterBlockType,
  onFilterChange,
  selectedBlockType,
  onSelectActivity,
  onPickTemplate,
}: Props) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return seedActivities.filter((a) => {
      if (filterBlockType !== 'all' && a.blockType !== filterBlockType)
        return false
      if (!q) return true
      return (
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.tags.some((t) => t.includes(q))
      )
    })
  }, [query, filterBlockType])

  return (
    <aside className="side-panel">
      <div className="side-tabs" role="tablist">
        {(
          [
            ['library', UI.library],
            ['tips', UI.tips],
            ['templates', UI.templates],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={tab === id ? 'active' : ''}
            onClick={() => onTabChange(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'library' && (
        <div className="side-body">
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
              <ActivityCard
                key={a.id}
                activity={a}
                onSelect={onSelectActivity}
              />
            ))}
          </div>
        </div>
      )}

      {tab === 'tips' && (
        <div className="side-body tips-body">
          {selectedBlockType ? (
            <>
              <h3>{BLOCK_LABELS[selectedBlockType]}</h3>
              <p>{TIPS_TAB[selectedBlockType]}</p>
            </>
          ) : (
            <p className="muted">{UI.selectBlockForTips}</p>
          )}
        </div>
      )}

      {tab === 'templates' && (
        <div className="side-body">
          <ul className="template-list">
            {seedTemplates.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  className="template-card"
                  onClick={() => onPickTemplate(t.id)}
                >
                  <strong>{t.title}</strong>
                  <span>{t.description}</span>
                  <span className="template-meta">
                    ~{t.totalMinutes} min · Trygg för nya tränare
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  )
}
