import { useEffect, useMemo, useState } from 'react'
import { DEFAULT_TARGET_MINUTES, UI } from '../data/blockMeta'
import {
  isTipDismissed,
  TIP_BUILDER_EMPTY,
  type CoachTipsStateV1,
} from '../lib/coachTips'
import { getActivityById } from '../data/seedActivities'
import { countSessionItems } from '../lib/hall'
import {
  addItemToBlock,
  cloneTemplate,
  getTemplateById,
  moveItemToBlock,
  moveItemWithinBlock,
  removeItem,
  saveDraft,
  updateItemDuration,
  withComputedTotal,
} from '../lib/session'
import type {
  Activity,
  BlockType,
  MismatchWarning,
  Session,
  SideTab,
} from '../types'
import { CoachTipStrip } from './CoachTipStrip'
import { ActivityDetail } from './ActivityDetail'
import { BlockCard } from './BlockCard'
import { LibraryPanel } from './LibraryPanel'
import { TemplateConfirm } from './TemplateConfirm'

interface Props {
  session: Session
  onChange: (session: Session) => void
  onHome: () => void
  onOpenHall: () => void
  initialTemplatePicker?: boolean
  tips: CoachTipsStateV1
  onDismissTip: (tipId: string) => void
  onBuilderMounted?: () => void
}

const NARROW_MQ = '(max-width: 768px)'

export function SessionBuilder({
  session,
  onChange,
  onHome,
  onOpenHall,
  initialTemplatePicker = false,
  tips,
  onDismissTip,
  onBuilderMounted,
}: Props) {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(
    session.blocks[0]?.id ?? null,
  )
  const [sideTab, setSideTab] = useState<SideTab>(
    initialTemplatePicker ? 'templates' : 'library',
  )
  const [panelOpen, setPanelOpen] = useState(initialTemplatePicker)
  const [isNarrow, setIsNarrow] = useState(false)
  const [filterBlockType, setFilterBlockType] = useState<BlockType | 'all'>(
    'all',
  )
  const [detailActivity, setDetailActivity] = useState<Activity | null>(null)
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(
    null,
  )
  const [mismatch, setMismatch] = useState<MismatchWarning | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [exportHint, setExportHint] = useState(false)
  const [showFirstVisitTip] = useState(() => !tips.builderFirstVisitSeen)

  const selectedBlock = useMemo(
    () => session.blocks.find((b) => b.id === selectedBlockId) ?? null,
    [session, selectedBlockId],
  )

  const pendingTemplate = pendingTemplateId
    ? getTemplateById(pendingTemplateId)
    : undefined

  useEffect(() => {
    const mq = window.matchMedia(NARROW_MQ)
    const sync = () => setIsNarrow(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    onBuilderMounted?.()
  }, [onBuilderMounted])

  useEffect(() => {
    if (!panelOpen || !isNarrow) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [panelOpen, isNarrow])

  function showToast(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2200)
  }

  function openPanel(tab: SideTab) {
    setSideTab(tab)
    setPanelOpen(true)
  }

  function closePanel() {
    setPanelOpen(false)
  }

  function openAddForBlock(blockId: string) {
    const block = session.blocks.find((b) => b.id === blockId)
    if (!block) return
    setSelectedBlockId(blockId)
    setFilterBlockType(block.type)
    openPanel('library')
  }

  function handleSelectActivity(activity: Activity) {
    setDetailActivity(activity)
  }

  function handleAddFromDetail(duration: number) {
    if (!detailActivity || !selectedBlock) {
      showToast('Välj ett block först')
      setDetailActivity(null)
      return
    }
    const dest = selectedBlock
    const next = addItemToBlock(
      session,
      dest.id,
      detailActivity.id,
      duration,
    )
    onChange(next)
    if (detailActivity.blockType !== dest.type) {
      setMismatch({
        blockId: dest.id,
        intendedBlockType: detailActivity.blockType,
        activityTitle: detailActivity.title,
      })
    }
    setDetailActivity(null)
  }

  function handleMoveToBlock(fromBlockId: string, itemId: string, toType: BlockType) {
    const toBlock = session.blocks.find((b) => b.type === toType)
    if (!toBlock) return
    const fromBlock = session.blocks.find((b) => b.id === fromBlockId)
    const item = fromBlock?.items.find((i) => i.id === itemId)
    const activity = item ? getActivityById(item.activityId) : undefined
    const next = moveItemToBlock(session, fromBlockId, toBlock.id, itemId)
    onChange(next)
    if (activity && activity.blockType !== toType) {
      setMismatch({
        blockId: toBlock.id,
        intendedBlockType: activity.blockType,
        activityTitle: activity.title,
      })
    }
  }

  function handleSave() {
    saveDraft(session)
    showToast(UI.savedToast)
  }

  function handleConfirmTemplate() {
    if (!pendingTemplate) return
    const cloned = cloneTemplate(pendingTemplate)
    onChange(cloned)
    setSelectedBlockId(cloned.blocks[0]?.id ?? null)
    setPendingTemplateId(null)
    setMismatch(null)
    openPanel('library')
  }

  function handleTitle(title: string) {
    onChange(withComputedTotal({ ...session, title }))
  }

  return (
    <div className="builder">
      <header className="builder-top">
        <button type="button" className="btn-text back" onClick={onHome}>
          ← {UI.backHome}
        </button>
        <div className="builder-title-row">
          <input
            className="title-input"
            value={session.title}
            onChange={(e) => handleTitle(e.target.value)}
            aria-label="Passets titel"
          />
          <span className="total-badge" title={UI.totalTime}>
            {session.totalMinutes} / {DEFAULT_TARGET_MINUTES} min
          </span>
        </div>
        <p className="topbar-help">{UI.topBarHelp}</p>
        {!isTipDismissed(tips, TIP_BUILDER_EMPTY) &&
          (countSessionItems(session) < 1 || showFirstVisitTip) && (
            <CoachTipStrip
              tipId={TIP_BUILDER_EMPTY}
              className="builder-coach-tip"
              text={UI.tipBuilderEmpty}
              onDismiss={onDismissTip}
            />
          )}
        <div className="builder-actions">
          <button type="button" className="btn-secondary" onClick={handleSave}>
            {UI.saveDraft}
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => openPanel('templates')}
          >
            {UI.useTemplate}
          </button>
          <button
            type="button"
            className="btn-secondary"
            disabled={countSessionItems(session) < 1}
            title={
              countSessionItems(session) < 1 ? UI.hallCtaDisabled : undefined
            }
            aria-describedby={
              countSessionItems(session) < 1 ? 'hall-cta-hint' : undefined
            }
            onClick={onOpenHall}
          >
            {UI.hallOverview}
          </button>
          {countSessionItems(session) < 1 && (
            <span id="hall-cta-hint" className="sr-only">
              {UI.hallCtaDisabled}
            </span>
          )}
          <div className="export-wrap">
            <button
              type="button"
              className="btn-secondary"
              disabled
              onMouseEnter={() => setExportHint(true)}
              onMouseLeave={() => setExportHint(false)}
              onFocus={() => setExportHint(true)}
              onBlur={() => setExportHint(false)}
              title={UI.comingSoon}
            >
              {UI.export}
            </button>
            {exportHint && (
              <span className="export-tooltip">{UI.comingSoon}</span>
            )}
          </div>
        </div>
      </header>

      <div className="builder-main">
        <div className="blocks-column">
          <p className="builder-label">{UI.sessionBuilder}</p>
          {session.blocks.map((block) => (
            <BlockCard
              key={block.id}
              block={block}
              selected={block.id === selectedBlockId}
              mismatch={mismatch ?? undefined}
              onSelect={() => {
                setSelectedBlockId(block.id)
                openPanel('tips')
              }}
              onAdd={() => openAddForBlock(block.id)}
              onBrowse={() => openAddForBlock(block.id)}
              onDismissMismatch={() => setMismatch(null)}
              onRemoveItem={(itemId) =>
                onChange(removeItem(session, block.id, itemId))
              }
              onMoveItem={(itemId, dir) =>
                onChange(moveItemWithinBlock(session, block.id, itemId, dir))
              }
              onMoveItemToBlock={(itemId, toType) =>
                handleMoveToBlock(block.id, itemId, toType)
              }
              onDurationChange={(itemId, minutes) =>
                onChange(
                  updateItemDuration(session, block.id, itemId, minutes),
                )
              }
            />
          ))}
        </div>

        <div className={`side-panel-slot${panelOpen ? ' is-open' : ''}`}>
          <button
            type="button"
            className="sheet-backdrop"
            aria-label={UI.close}
            onClick={closePanel}
          />
          <div
            className="side-panel-frame"
            role={isNarrow && panelOpen ? 'dialog' : undefined}
            aria-modal={isNarrow && panelOpen ? true : undefined}
            aria-label={
              isNarrow && panelOpen
                ? sideTab === 'library'
                  ? UI.library
                  : sideTab === 'tips'
                    ? UI.tips
                    : UI.templates
                : undefined
            }
          >
            <div className="sheet-chrome">
              <button
                type="button"
                className="btn-secondary sheet-close"
                onClick={closePanel}
              >
                {UI.close}
              </button>
            </div>
            <LibraryPanel
              tab={sideTab}
              onTabChange={(tab) => {
                setSideTab(tab)
                setPanelOpen(true)
              }}
              filterBlockType={filterBlockType}
              onFilterChange={setFilterBlockType}
              selectedBlockType={selectedBlock?.type ?? null}
              onSelectActivity={handleSelectActivity}
              onPickTemplate={(id) => setPendingTemplateId(id)}
            />
          </div>
        </div>
      </div>

      {detailActivity && (
        <ActivityDetail
          activity={detailActivity}
          onAdd={handleAddFromDetail}
          onClose={() => setDetailActivity(null)}
          tips={tips}
          onDismissTip={onDismissTip}
        />
      )}

      {pendingTemplate && (
        <TemplateConfirm
          template={pendingTemplate}
          onConfirm={handleConfirmTemplate}
          onCancel={() => setPendingTemplateId(null)}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
