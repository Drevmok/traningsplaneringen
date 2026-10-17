import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { ownImportDoneText, PASS_LENGTHS, UI, type PassLength } from '../data/blockMeta'
import {
  isTipDismissed,
  TIP_BUILDER_EMPTY,
  type CoachTipsStateV1,
} from '../lib/coachTips'
import { getActivityById } from '../data/seedActivities'
import { countSessionItems } from '../lib/hall'
import { coachStationCount, isFreshPass, markFresh } from '../lib/freshPass'
import { autoPlaceItems } from '../lib/hallSuggest'
import { restoreDraft, trySaveDraft } from '../lib/autosave'
import type { SaveStatus } from '../lib/useAutosave'
import { loadOwnActivities, deleteOwnActivity, markOwnReviewed } from '../lib/ownActivities'
import {
  addItemToBlock,
  adoptAsDraft,
  getTemplateById,
  loadDraft,
  passLengthOf,
  removeItem,
  saveDraft,
  setSessionLength,
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
import { clubPayload, type ClubTemplate } from '../lib/clubTemplates'
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
import { OwnImportSheet } from './OwnImportSheet'
import { SaveTemplateDialog } from './SaveTemplateDialog'
import { enterPresentation } from '../lib/presentation'
import { unlockRunSignal } from '../lib/runSignal'
import { AdminStatusBadge } from './AdminStatusBadge'
import { carry, type CarriedToast } from '../lib/undoCarry'
import { applyMall } from '../lib/mallApply'
import { useAdmin, useAdminBank } from '../lib/admin/useAdmin'

// Slice 32 — the bank form is admin-only: its own chunk, loaded when «Ändra i banken» is tapped.
const AdminBankForm = lazy(() => import('./AdminBankForm'))
type Toast = CarriedToast
const samePass = (a: Session, b: Session) => JSON.stringify(a) === JSON.stringify(b)
/** Slice 39: pass ids that already got the «kunde inte sparas» toast (once per pass). */
const failToasted = new Set<string>()

const ClubAdminSection = lazy(() => import('./AdminDetailPanel').then((m) => ({ default: m.ClubAdminSection })))
const ClubPublishDialog = lazy(() => import('./AdminDetailPanel').then((m) => ({ default: m.ClubPublishDialog })))
const AdminDetailPanel = lazy(() => import('./AdminDetailPanel').then((m) => ({ default: m.AdminDetailPanel })))

interface Props {
  session: Session
  onChange: (session: Session) => void
  onHome: () => void
  onOpenHall: () => void
  onRun: () => void
  tips: CoachTipsStateV1
  onDismissTip: (tipId: string) => void
  onBuilderMounted?: () => void
  /** Slice 39: autosave state from App. */
  saveStatus?: SaveStatus
}

const NARROW_MQ = '(max-width: 768px)'

export function SessionBuilder({
  session,
  onChange,
  onHome,
  onOpenHall,
  onRun,
  tips,
  onDismissTip,
  onBuilderMounted,
  saveStatus = 'idle',
}: Props) {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(
    session.blocks[0]?.id ?? null,
  )
  const [sideTab, setSideTab] = useState<SideTab>('library')
  const [panelOpen, setPanelOpen] = useState(false)
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
  const [toast, setToast] = useState<Toast | null>(() => {
    // Slice 41: an undo only survives the mall remount (it rides on the carried toast).
    if (!carry.toast?.undo) carry.undo = null
    return carry.toast
  })
  const [toastHeld, setToastHeld] = useState(false)
  const undoBtn = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    carry.toast = null
  }, [])
  useEffect(() => {
    if (!toast || toastHeld) return
    const timer = window.setTimeout(() => closeToast(), toast.undo ? 5000 : 2200)
    return () => window.clearTimeout(timer)
  }, [toast, toastHeld])
  useEffect(() => {
    if (toast?.focus) undoBtn.current?.focus()
  }, [toast])
  // Slice 41: any other change to the pass ends the undo.
  useEffect(() => {
    if (carry.undo && session !== carry.undo.after && !samePass(session, carry.undo.after)) {
      carry.undo = null
      setToast((t) => (t?.undo ? null : t))
    }
  }, [session])
  const [showExport, setShowExport] = useState(false)
  const [savedTemplates, setSavedTemplates] = useState(() => loadSavedTemplates())
  const [pendingSavedId, setPendingSavedId] = useState<string | null>(null)
  const [pendingClub, setPendingClub] = useState<ClubTemplate | null>(null)
  const [showClubPublish, setShowClubPublish] = useState(false)
  const [ownActivities, setOwnActivities] = useState(() => loadOwnActivities())
  const [ownEdit, setOwnEdit] = useState<Activity | 'new' | null>(null)
  const [ownImportOpen, setOwnImportOpen] = useState(false)
  const [showSaveTemplate, setShowSaveTemplate] = useState(false)
  const [showNewWeek, setShowNewWeek] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [bankEditId, setBankEditId] = useState<string | null>(null)
  const admin = useAdmin()
  const adminBank = useAdminBank()
  // Admin mode, bank rows only: the detail shows the admin copy (live after a write), and only
  // published rows may be added to a pass — pending and hidden never.
  const detailEntry =
    admin.state === 'admin' && detailActivity && !detailActivity.own
      ? adminBank.byId.get(detailActivity.id)
      : undefined
  const detailShown = detailEntry ? detailEntry.activity : detailActivity
  const detailCanAdd = !detailEntry || detailEntry.status === 'published'

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

  useEffect(() => {
    if (saveStatus !== 'failed' || failToasted.has(session.id)) return
    failToasted.add(session.id)
    showToast(UI.autosaveFailedToast)
    // showToast is stable enough for a once-per-pass toast; session.id gates it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveStatus, session.id])

  function showToast(msg: string) {
    setToast({ text: msg })
  }

  function closeToast() {
    setToast((t) => {
      if (t?.undo) carry.undo = null
      return null
    })
    setToastHeld(false)
  }

  function undoToast(focus: boolean, text: string = UI.clubTemplateApplied): Toast {
    return { text, undo: true, focus }
  }

  /** Slice 41 (A1/B1): put the whole pass back as it was before × or Använd mall. */
  function runUndo() {
    const u = carry.undo
    carry.undo = null
    setToastHeld(false)
    if (!u || (session !== u.after && !samePass(session, u.after))) {
      setToast(null)
      return
    }
    const saved = restoreDraft(u.before)
    setSelectedBlockId(u.blockId ?? u.before.blocks[0]?.id ?? null)
    const done = saved ? { text: UI.undoDone } : null
    if (u.before.id !== session.id) carry.toast = done
    setToast(done)
    onChange(u.before)
  }

  function armUndo(after: Session, blockId: string | null) {
    carry.undo = { before: session, after, blockId }
  }

  function handleRemoveItem(blockId: string, itemId: string) {
    const focus = !!document.activeElement?.classList.contains('item-remove')
    const after = removeItem(session, blockId, itemId)
    armUndo(after, blockId)
    onChange(after)
    setToast(undoToast(focus, UI.undoRemoved))
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
    setDetailReadOnly(false)
    setDetailActivity(activity)
  }

  function handleOpenInPass(activity: Activity) {
    setDetailReadOnly(true)
    setDetailActivity(activity)
  }

  function handleAddFromDetail(duration: number) {
    if (!detailCanAdd) return
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

  function handleMarkReviewed(activity: Activity) {
    const next = markOwnReviewed(activity.id)
    setOwnActivities(next)
    const updated = next.find((item) => item.id === activity.id)
    if (updated) setDetailActivity(updated)
    showToast(UI.ownReviewedToast)
  }

  function handleOwnImported(count: number) {
    setOwnActivities(loadOwnActivities())
    setOwnImportOpen(false)
    showToast(ownImportDoneText(count))
  }

  /** Slice 42 B1: a fresh pass is replaced at once (Ångra is the safety net); otherwise ask. */
  function pick<T>(set: (v: T) => void, v: T | undefined, run: (v: T) => void) {
    if (v) (isFreshPass(session) ? run : set)(v)
  }

  function handleConfirmTemplate(tpl = pendingTemplate) {
    if (!tpl) return
    const cloned = applyMall({ kind: 'builtin', item: tpl })
    setSelectedBlockId(cloned.blocks[0]?.id ?? null)
    setPendingTemplateId(null)
    setMismatch(null)
    // Slice 39 C1: a built-in mall is saved the moment it is applied.
    trySaveDraft(cloned)
    markFresh(cloned)
    armUndo(cloned, null)
    carry.toast = undoToast(true)
    onChange(cloned)
    closePanel()
  }

  function handleConfirmSaved(tpl = pendingSaved) {
    if (!tpl) return
    const next = adoptAsDraft(applyMall({ kind: 'saved', item: tpl }))
    markFresh(next)
    setSelectedBlockId(next.blocks[0]?.id ?? null)
    setPendingSavedId(null)
    setMismatch(null)
    armUndo(next, null)
    carry.toast = undoToast(true)
    onChange(next)
    closePanel()
  }

  // Slice 36 (E1): the coach's own pass — fresh ids, no link back to the row. Slice 37 (A1):
  // Teknik is placed on apply (club data itself still carries no placements).
  function handleConfirmClub(tpl = pendingClub) {
    if (!tpl) return
    const next = adoptAsDraft(applyMall({ kind: 'club', item: tpl }))
    markFresh(next)
    setSelectedBlockId(next.blocks[0]?.id ?? null)
    setPendingClub(null)
    setMismatch(null)
    armUndo(next, null)
    carry.toast = undoToast(true)
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
        {admin.state === 'admin' && (
          <button
            type="button"
            className="btn-secondary"
            disabled={!hasItems}
            title={!hasItems ? UI.runPassDisabled : undefined}
            onClick={() => setShowClubPublish(true)}
          >
            {UI.clubPublish}
          </button>
        )}
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
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              // Slice 45 follow-up: the Dela bottom sheet would sit under the toast; end it like a timeout (expires undo).
              closeToast()
              setShowExport(true)
            }}
          >
            {UI.export}
          </button>
        )}
      </>
    )
  }

  return (
    <div className="builder">
      <header className="builder-top">
        <button type="button" className="btn-text back" onClick={onHome} aria-label={UI.backHome}>
          <span className="back-long">← {UI.backHome}</span>
          <span className="back-short" aria-hidden="true">←</span>
        </button>
        <div className="builder-title-row">
          <input
            className="title-input"
            value={session.title}
            onChange={(e) => handleTitle(e.target.value)}
            aria-label="Passets titel"
          />
          <div className="pass-length" role="group" aria-label={UI.passLength}>
            <span
              className={`pass-length-filled${
                session.totalMinutes > passLengthOf(session) ? ' is-over' : ''
              }`}
            >
              {session.totalMinutes} /
            </span>
            {PASS_LENGTHS.map((minutes) => (
              <button
                key={minutes}
                type="button"
                aria-pressed={passLengthOf(session) === minutes}
                className={passLengthOf(session) === minutes ? 'is-on' : ''}
                onClick={() =>
                  onChange(setSessionLength(session, minutes as PassLength))
                }
              >
                {minutes}
              </button>
            ))}
            <span className="pass-length-unit">{UI.passLengthMinutes}</span>
          </div>
        </div>
        <p className="topbar-help">{UI.topBarHelp}</p>
        {!isTipDismissed(tips, TIP_BUILDER_EMPTY) &&
          coachStationCount(session) < 1 && (
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
                // Slice 41 AC8: Kör passet is an overlay — builder stays mounted, so expire undo here.
                carry.undo = null
                setToast((t) => (t?.undo ? null : t))
                setToastHeld(false)
                unlockRunSignal()
                enterPresentation()
                onRun()
              }}
            >
              {UI.runPass}
            </button>
          )}
          <button
            type="button"
            className="btn-secondary builder-hall"
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
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={countSessionItems(session) < 1}
                    onClick={onOpenHall}
                  >
                    {UI.hallOverview}
                  </button>
                  {renderPassExtras()}
                </div>
              </>
            )}
          </div>
          {saveStatus !== 'idle' && (
            <span className={`save-status${saveStatus === 'failed' ? ' save-status-failed' : ''}`}>
              {saveStatus === 'failed' ? UI.autosaveFailed : UI.autosaveSaved}
            </span>
          )}
        </div>
      </header>

      <div className="builder-main">
        <div className="blocks-column">
          <p className="builder-label">{UI.sessionBuilder}</p>
          {session.blocks.map((block) => (
            <BlockCard
              key={block.id}
              block={block}
              mismatch={mismatch ?? undefined}
              onAdd={() => openAddForBlock(block.id)}
              onBrowse={() => openAddForBlock(block.id)}
              onDismissMismatch={() => setMismatch(null)}
              onRemoveItem={(itemId) => handleRemoveItem(block.id, itemId)}
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
              blockActivities={(selectedBlock?.items ?? [])
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((item) => getActivityById(item.activityId))
                .filter((activity): activity is Activity => Boolean(activity))}
              onSelectActivity={handleSelectActivity}
              onReadActivity={handleOpenInPass}
              onPickTemplate={(id) => pick(setPendingTemplateId, id, (v) => handleConfirmTemplate(getTemplateById(v)))}
              savedTemplates={savedTemplates}
              onPickSaved={(id) => pick(setPendingSavedId, id, (v) => handleConfirmSaved(savedTemplates.find((t) => t.id === v)))}
              onCopySaved={(id) => void handleCopySaved(id)}
              onDeleteSaved={handleDeleteSaved}
              onPickClub={(c) => pick(setPendingClub, c, handleConfirmClub)}
              clubAdminSlot={
                admin.state === 'admin' ? (
                  <Suspense fallback={null}>
                    <ClubAdminSection onPick={(c) => pick(setPendingClub, c, handleConfirmClub)} onToast={showToast} />
                  </Suspense>
                ) : undefined
              }
              ownActivities={ownActivities}
              onCreateOwn={() => setOwnEdit('new')}
              onImportOwn={() => setOwnImportOpen(true)}
              onEditOwn={(activity) => setOwnEdit(activity)}
              onDeleteOwn={handleDeleteOwn}
              ownInUse={ownInUse}
            />
          </div>
        </div>
      </div>

      {detailActivity && detailShown && (
        <ActivityDetail
          activity={detailShown}
          onAdd={detailReadOnly || !detailCanAdd ? undefined : handleAddFromDetail}
          adminBadges={
            detailEntry ? (
              <>
                {(detailEntry.status === 'pending' || detailEntry.status === 'hidden') && (
                  <AdminStatusBadge status={detailEntry.status} />
                )}
                {detailEntry.needsReview && <span className="review-badge">{UI.ownNeedsReview}</span>}
              </>
            ) : undefined
          }
          adminSlot={
            detailEntry && !detailReadOnly ? (
              <Suspense fallback={null}>
                <AdminDetailPanel
                  id={detailEntry.activity.id}
                  onToast={showToast}
                  onEdit={() => setBankEditId(detailEntry.activity.id)}
                />
              </Suspense>
            ) : undefined
          }
          readOnly={detailReadOnly}
          onClose={() => setDetailActivity(null)}
          tips={tips}
          onDismissTip={onDismissTip}
          onMarkReviewed={
            detailActivity.own && detailActivity.needsCoachReview
              ? () => handleMarkReviewed(detailActivity)
              : undefined
          }
        />
      )}

      {pendingTemplate && (
        <TemplateConfirm
          template={pendingTemplate}
          onConfirm={() => handleConfirmTemplate()}
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
          onConfirm={() => handleConfirmSaved()}
          onCancel={() => setPendingSavedId(null)}
        />
      )}

      {pendingClub && (
        <TemplateConfirm
          template={{
            id: pendingClub.id,
            title: pendingClub.title,
            description: '',
            targetLevel: 'beginner',
            totalMinutes: pendingClub.totalMinutes,
            blocks: [],
          }}
          onConfirm={() => handleConfirmClub()}
          onCancel={() => setPendingClub(null)}
        />
      )}

      {showClubPublish && admin.state === 'admin' && (
        <Suspense fallback={null}>
          <ClubPublishDialog
            initialTitle={session.title}
            draft={{ totalMinutes: session.totalMinutes, payload: (title) => clubPayload(session, title) }}
            onCancel={() => setShowClubPublish(false)}
            onDone={(msg) => {
              setShowClubPublish(false)
              showToast(msg)
            }}
          />
        </Suspense>
      )}

      {toast && (
        <div
          className="toast"
          role="status"
          onFocus={(e) => setToastHeld(e.target.matches(':focus-visible'))}
          onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setToastHeld(false) }}
          onKeyDown={(e) => { if (e.key === 'Escape') closeToast() }}
        >
          <span>{toast.text}</span>
          {toast.undo && (
            <>
              <span aria-hidden="true"> · </span>
              <button ref={undoBtn} type="button" className="toast-action" onClick={runUndo}>
                {UI.undoAction}
              </button>
            </>
          )}
        </div>
      )}
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
      {bankEditId && admin.state === 'admin' && (
        <Suspense fallback={null}>
          <AdminBankForm
            id={bankEditId}
            onCancel={() => setBankEditId(null)}
            onSaved={() => {
              setBankEditId(null)
              showToast(UI.adminSaved)
            }}
          />
        </Suspense>
      )}
      {ownImportOpen && (
        <OwnImportSheet
          onImported={handleOwnImported}
          onClose={() => setOwnImportOpen(false)}
        />
      )}
      {showExport && (
        <ExportSheet
          session={session}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  )
}
