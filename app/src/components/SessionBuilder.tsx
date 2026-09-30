import { useEffect, useMemo, useState } from 'react'
import { DEFAULT_TARGET_MINUTES, UI } from '../data/blockMeta'
import {
  isTipDismissed,
  TIP_BUILDER_EMPTY,
  type CoachTipsStateV1,
} from '../lib/coachTips'
import { getActivityById } from '../data/seedActivities'
import { countSessionItems } from '../lib/hall'
import { autoPlaceItems } from '../lib/hallSuggest'
import { loadOwnActivities, deleteOwnActivity } from '../lib/ownActivities'
import {
  addItemToBlock,
  adoptAsDraft,
  cloneTemplate,
  getTemplateById,
  loadDraft,
  moveItemWithinBlock,
  removeItem,
  saveDraft,
  updateItemDuration,
  withComputedTotal,
} from '../lib/session'
import {
  activityIdInTemplates,
  deleteSavedTemplate,
  loadSavedTemplates,
  savedTemplateToSession,
  saveSessionAsTemplate,
  startNewWeek,
} from '../lib/savedTemplates'
import { copyText, encodeShare, shareUrl } from '../lib/sharePass'
import type {
  Activity,
  BlockType,
  MismatchWarning,
  Session,
  SideTab,
} from '../types'
import { useBodyScrollLock } from '../lib/bodyScrollLock'
import { CoachTipStrip } from './CoachTipStrip'
import { ActivityDetail } from './ActivityDetail'
import { BlockCard } from './BlockCard'
import { LibraryPanel } from './LibraryPanel'
import { TemplateConfirm } from './TemplateConfirm'
import { ExportSheet } from './ExportSheet'
import { NewWeekConfirm } from './NewWeekConfirm'
import { OwnActivityForm } from './OwnActivityForm'
import { SaveTemplateDialog } from './SaveTemplateDialog'
import { enterPresentation } from './StationDeck'

interface Props {
  session: Session
  onChange: (session: Session) => void
  onHome: () => void
  onOpenHall: () => void
  onRun: () => void
  initialTemplatePicker?: boolean
  /** Slice 20 C1 — clear App openTemplates after mall picker consumed. */
  onInitialTemplateConsumed?: () => void
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
  onRun,
  initialTemplatePicker = false,
  onInitialTemplateConsumed,
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
  const [detailReadOnly, setDetailReadOnly] = useState(false)
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(
    null,
  )
  const [mismatch, setMismatch] = useState<MismatchWarning | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [showExport, setShowExport] = useState(false)
  const [savedTemplates, setSavedTemplates] = useState(() => loadSavedTemplates())
  const [pendingSavedId, setPendingSavedId] = useState<string | null>(null)
  const [showFirstVisitTip] = useState(() => !tips.builderFirstVisitSeen)
  const [ownActivities, setOwnActivities] = useState(() => loadOwnActivities())
  const [ownEdit, setOwnEdit] = useState<Activity | 'new' | null>(null)
  const [showSaveTemplate, setShowSaveTemplate] = useState(false)
  const [showNewWeek, setShowNewWeek] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)

  const selectedBlock = useMemo(
    () => session.blocks.find((b) => b.id === selectedBlockId) ?? null,
    [session, selectedBlockId],
  )

  const pendingTemplate = pendingTemplateId
    ? getTemplateById(pendingTemplateId)
    : undefined
  const pendingSaved = pendingSavedId
    ? savedTemplates.find((item) => item.id === pendingSavedId)
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

  useBodyScrollLock(panelOpen && isNarrow)

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
    if (initialTemplatePicker) {
      onInitialTemplateConsumed?.()
    }
  }

  function openAddForBlock(blockId: string) {
    const block = session.blocks.find((b) => b.id === blockId)
    if (!block) return
    setSelectedBlockId(blockId)
    setFilterBlockType(block.type)
    openPanel('library')
  }

  function handleSelectActivity(activity: Activity) {
    setDetailReadOnly(false)
    setDetailActivity(activity)
  }

  function handleOpenInPass(activity: Activity) {
    setDetailReadOnly(true)
    setDetailActivity(activity)
  }

  function handleAddFromDetail(duration: number) {
    if (!detailActivity || !selectedBlock) {
      showToast('Välj ett block först')
      setDetailActivity(null)
      return
    }
    const dest = selectedBlock
    const before = new Set(session.blocks.flatMap((block) => block.items.map((item) => item.id)))
    const addedSession = addItemToBlock(
      session,
      dest.id,
      detailActivity.id,
      duration,
    )
    const added = new Set(
      addedSession.blocks
        .flatMap((block) => block.items.map((item) => item.id))
        .filter((id) => !before.has(id)),
    )
    const next = autoPlaceItems(addedSession, added)
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

  function handleSave() {
    saveDraft(session)
    showToast(UI.savedToast)
  }

  function handleSaveTemplate(title: string) {
    saveSessionAsTemplate(session, title)
    setSavedTemplates(loadSavedTemplates())
    setShowSaveTemplate(false)
    showToast(UI.ownTemplateSaved)
  }

  function handleNewWeek() {
    const started = startNewWeek(session)
    saveDraft(started.session)
    setShowNewWeek(false)
    onChange(started.session)
  }

  function ownInUse(activityId: string): boolean {
    const used = (source: typeof session) =>
      source.blocks.some((block) =>
        block.items.some((item) => item.activityId === activityId),
      )
    if (used(session)) return true
    const draft = loadDraft()
    if (draft && used(draft)) return true
    return activityIdInTemplates(activityId)
  }

  function handleDeleteOwn(activity: Activity) {
    if (ownInUse(activity.id)) return
    setOwnActivities(deleteOwnActivity(activity.id))
    showToast(UI.ownDeleted)
  }

  function handleConfirmTemplate() {
    if (!pendingTemplate) return
    const cloned = cloneTemplate(pendingTemplate)
    setSelectedBlockId(cloned.blocks[0]?.id ?? null)
    setPendingTemplateId(null)
    setMismatch(null)
    // Slice 20 C1 — clear one-shot flag before remount key; close sheet (not library).
    onInitialTemplateConsumed?.()
    onChange(cloned)
    closePanel()
  }

  function handleConfirmSaved() {
    if (!pendingSaved) return
    const next = adoptAsDraft(savedTemplateToSession(pendingSaved))
    setSelectedBlockId(next.blocks[0]?.id ?? null)
    setPendingSavedId(null)
    setMismatch(null)
    onChange(next)
    closePanel()
  }

  function handleDeleteSaved(id: string) {
    setSavedTemplates(deleteSavedTemplate(id))
  }

  async function handleCopySaved(id: string) {
    const template = savedTemplates.find((item) => item.id === id)
    if (!template) return
    const token = await encodeShare(savedTemplateToSession(template))
    await copyText(shareUrl(token))
    showToast(UI.templateCodeCopied)
  }

  function handleImported(next: Session) {
    const adopted = adoptAsDraft(next)
    setSelectedBlockId(adopted.blocks[0]?.id ?? null)
    setMismatch(null)
    onChange(adopted)
    setShowExport(false)
    showToast(UI.importDone)
  }

  function handleTitle(title: string) {
    onChange(withComputedTotal({ ...session, title }))
  }

  const hasItems = countSessionItems(session) >= 1

  function renderPassExtras() {
    return (
      <>
        <button
          type="button"
          className="btn-secondary"
          disabled={!hasItems}
          title={!hasItems ? UI.runPassDisabled : undefined}
          onClick={() => setShowSaveTemplate(true)}
        >
          {UI.saveOwnTemplate}
        </button>
        <button
          type="button"
          className="btn-secondary"
          disabled={!hasItems}
          title={!hasItems ? UI.runPassDisabled : undefined}
          aria-label={UI.newWeekAria}
          onClick={() => setShowNewWeek(true)}
        >
          {UI.newWeek}
        </button>
        <button
          type="button"
          className={hasItems ? 'btn-secondary' : 'btn-primary'}
          onClick={() => openPanel('templates')}
        >
          {UI.useTemplate}
        </button>
        {hasItems && (
          <button type="button" className="btn-secondary" onClick={() => setShowExport(true)}>
            {UI.export}
          </button>
        )}
      </>
    )
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
          {countSessionItems(session) >= 1 && (
            <button
              type="button"
              className="btn-primary"
              aria-label={UI.runPassAria}
              onClick={() => {
                enterPresentation()
                onRun()
              }}
            >
              {UI.runPass}
            </button>
          )}
          <button type="button" className="btn-secondary" onClick={handleSave}>
            {UI.saveDraft}
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
          <div className="builder-extra">{renderPassExtras()}</div>
          <div className="more-menu">
            <button
              type="button"
              className="btn-secondary"
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              aria-label={UI.moreAria}
              onClick={() => setMoreOpen((open) => !open)}
            >
              {UI.more}
            </button>
            {moreOpen && (
              <>
                <button
                  type="button"
                  className="more-backdrop"
                  aria-label={UI.close}
                  onClick={() => setMoreOpen(false)}
                />
                <div className="more-menu-panel" role="menu" onClick={() => setMoreOpen(false)}>
                  {renderPassExtras()}
                </div>
              </>
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
              onSelect={() => setSelectedBlockId(block.id)}
              onAdd={() => openAddForBlock(block.id)}
              onBrowse={() => openAddForBlock(block.id)}
              onDismissMismatch={() => setMismatch(null)}
              onRemoveItem={(itemId) =>
                onChange(removeItem(session, block.id, itemId))
              }
              onMoveItem={(itemId, dir) =>
                onChange(moveItemWithinBlock(session, block.id, itemId, dir))
              }
              onDurationChange={(itemId, minutes) =>
                onChange(
                  updateItemDuration(session, block.id, itemId, minutes),
                )
              }
              onOpenActivity={handleOpenInPass}
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
              blockActivities={(selectedBlock?.items ?? [])
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((item) => getActivityById(item.activityId))
                .filter((activity): activity is Activity => Boolean(activity))}
              onSelectActivity={handleSelectActivity}
              onReadActivity={handleOpenInPass}
              onPickTemplate={(id) => setPendingTemplateId(id)}
              savedTemplates={savedTemplates}
              onPickSaved={(id) => setPendingSavedId(id)}
              onCopySaved={(id) => void handleCopySaved(id)}
              onDeleteSaved={handleDeleteSaved}
              ownActivities={ownActivities}
              onCreateOwn={() => setOwnEdit('new')}
              onEditOwn={(activity) => setOwnEdit(activity)}
              onDeleteOwn={handleDeleteOwn}
              ownInUse={ownInUse}
            />
          </div>
        </div>
      </div>

      {detailActivity && (
        <ActivityDetail
          activity={detailActivity}
          onAdd={detailReadOnly ? undefined : handleAddFromDetail}
          readOnly={detailReadOnly}
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

      {pendingSaved && (
        <TemplateConfirm
          template={{
            id: pendingSaved.id,
            title: pendingSaved.title,
            description: '',
            targetLevel: 'beginner',
            totalMinutes: pendingSaved.totalMinutes,
            blocks: [],
          }}
          onConfirm={handleConfirmSaved}
          onCancel={() => setPendingSavedId(null)}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
      {showSaveTemplate && (
        <SaveTemplateDialog
          initialTitle={session.title}
          onCancel={() => setShowSaveTemplate(false)}
          onSave={handleSaveTemplate}
        />
      )}
      {showNewWeek && (
        <NewWeekConfirm
          onCancel={() => setShowNewWeek(false)}
          onConfirm={handleNewWeek}
        />
      )}
      {ownEdit && (
        <OwnActivityForm
          initial={ownEdit === 'new' ? null : ownEdit}
          blockType={selectedBlock?.type ?? 'techniques'}
          onCancel={() => setOwnEdit(null)}
          onSaved={() => {
            setOwnActivities(loadOwnActivities())
            setOwnEdit(null)
            showToast(UI.ownSaved)
          }}
        />
      )}
      {showExport && (
        <ExportSheet
          session={session}
          onClose={() => setShowExport(false)}
          onImport={handleImported}
          onTemplateSaved={() => setSavedTemplates(loadSavedTemplates())}
        />
      )}
    </div>
  )
}
