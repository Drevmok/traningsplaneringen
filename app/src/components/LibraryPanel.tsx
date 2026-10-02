import { useMemo, useState } from 'react'
import {
  BLOCK_LABELS,
  BLOCK_ORDER,
  TIPS_TAB,
  UI,
} from '../data/blockMeta'
import { seedActivities } from '../data/seedActivities'
import { seedTemplates } from '../data/seedTemplates'
import { activityFitsOwned, loadOwnedEquipment, loadTonightFilter, ownsEveryPiece, saveTonightFilter } from '../lib/ownedEquipment'
import type { SavedTemplate } from '../lib/savedTemplates'
import type { Activity, BlockType, SideTab } from '../types'
import { ActivityCard } from './ActivityCard'
import { ActivityTip } from './ActivityTip'

interface Props {
  tab: SideTab
  onTabChange: (tab: SideTab) => void
  filterBlockType: BlockType | 'all'
  onFilterChange: (t: BlockType | 'all') => void
  selectedBlockType: BlockType | null
  blockActivities: Activity[]
  onSelectActivity: (activity: Activity) => void
  onReadActivity: (activity: Activity) => void
  onPickTemplate: (templateId: string) => void
  savedTemplates: SavedTemplate[]
  onPickSaved: (id: string) => void
  onCopySaved: (id: string) => void
  onDeleteSaved: (id: string) => void
  ownActivities: Activity[]
  onCreateOwn: () => void
  onImportOwn: () => void
  onEditOwn: (activity: Activity) => void
  onDeleteOwn: (activity: Activity) => void
  ownInUse: (activityId: string) => boolean
}

export function LibraryPanel({
  tab,
  onTabChange,
  filterBlockType,
  onFilterChange,
  selectedBlockType,
  blockActivities,
  onSelectActivity,
  onReadActivity,
  onPickTemplate,
  savedTemplates,
  onPickSaved,
  onCopySaved,
  onDeleteSaved,
  ownActivities,
  onCreateOwn,
  onImportOwn,
  onEditOwn,
  onDeleteOwn,
  ownInUse,
}: Props) {
  const [query, setQuery] = useState('')
  const [ownedIds] = useState(() => loadOwnedEquipment())
  const [tonightOnly, setTonightOnly] = useState(() => {
    const saved = loadTonightFilter()
    if (saved !== null) return saved
    return !ownsEveryPiece(ownedIds)
  })

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...ownActivities, ...seedActivities].filter((a) => {
      if (filterBlockType !== 'all' && a.blockType !== filterBlockType)
        return false
      if (tonightOnly && !activityFitsOwned(a, ownedIds)) return false
      if (!q) return true
      return (
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.tags.some((t) => t.includes(q))
      )
    })
  }, [query, filterBlockType, tonightOnly, ownedIds, ownActivities])

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
          <div className="library-own">
            <div className="library-own-actions">
              <button type="button" className="btn-secondary" onClick={onCreateOwn}>
                {UI.ownNew}
              </button>
              <button
                type="button"
                className="btn-secondary"
                aria-label={UI.ownImportAria}
                onClick={onImportOwn}
              >
                {UI.ownImport}
              </button>
            </div>
            <p className="muted">{UI.ownHint}</p>
          </div>
          <label className="library-tonight">
            <input
              type="checkbox"
              checked={tonightOnly}
              onChange={(e) => {
                setTonightOnly(e.target.checked)
                saveTonightFilter(e.target.checked)
              }}
            />
            <span>
              {UI.libraryTonight}
              <span className="library-tonight-hint">{UI.libraryTonightHint}</span>
            </span>
          </label>
          <div className="library-list">
            {filtered.length === 0 && (
              <p className="muted">{UI.noResults}</p>
            )}
            {filtered.map((a) => (
              <div key={a.id} className="library-entry">
                <ActivityCard activity={a} onSelect={onSelectActivity} />
                {a.own && (
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
      )}

      {tab === 'tips' && (
        <div className="side-body tips-body">
          {selectedBlockType ? (
            <>
              <h3>{BLOCK_LABELS[selectedBlockType]}</h3>
              <p className="tips-kicker">{UI.tipsBlockLead}</p>
              <p>{TIPS_TAB[selectedBlockType]}</p>
              <p className="tips-kicker">{UI.tipsExercisesLead}</p>
              {blockActivities.length === 0 ? (
                <p className="muted">{UI.tipsNoExercises}</p>
              ) : (
                <ul className="tips-exercise-list">
                  {blockActivities.map((activity) => (
                    <li key={activity.id} className="tips-exercise-card">
                      <p className="tips-exercise-title">{activity.title}</p>
                      <ActivityTip
                        activity={activity}
                        onOpen={() => onReadActivity(activity)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className="muted">{UI.selectBlockForTips}</p>
          )}
        </div>
      )}

      {tab === 'templates' && (
        <div className="side-body">
          {savedTemplates.length > 0 && (
            <>
              <h3 className="template-group">{UI.myTemplates}</h3>
              <ul className="template-list">
                {savedTemplates.map((template) => (
                  <li key={template.id} className="template-saved">
                    <button
                      type="button"
                      className="template-card"
                      onClick={() => onPickSaved(template.id)}
                    >
                      <strong>{template.title}</strong>
                      <span className="template-meta">{template.totalMinutes} min</span>
                    </button>
                    <div className="template-saved-actions">
                      <button
                        type="button"
                        className="btn-text"
                        onClick={() => onCopySaved(template.id)}
                      >
                        {UI.copyTemplateCode}
                      </button>
                      <button
                        type="button"
                        className="btn-text"
                        aria-label={`${UI.deleteTemplate} ${template.title}`}
                        onClick={() => onDeleteSaved(template.id)}
                      >
                        {UI.deleteTemplate}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="muted template-saved-hint">{UI.savedTemplatesHint}</p>
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
