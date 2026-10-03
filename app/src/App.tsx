import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { HallBoard } from './components/HallBoard'
import { Home } from './components/Home'
import type { WizardFinishAnswers } from './components/HomeWizard'
import { SessionBuilder } from './components/SessionBuilder'
import { SharePass } from './components/SharePass'
import { RunPass } from './components/RunPass'
import { UI } from './data/blockMeta'
import {
  anyTipsHidden,
  dismissTip,
  loadCoachTips,
  markBuilderVisited,
  markChooseOrBuild,
  markOpenedGolvklart,
  markOpenedHall,
  resetTipsVisibility,
  syncChecklistHeuristics,
  type CoachTipsStateV1,
} from './lib/coachTips'
import { countPlaceableItems, countSessionItems, listSessionItems } from './lib/hall'
import {
  adoptAsDraft,
  createBlankSession,
  hasDraft,
  loadDraft,
  saveDraft,
  withComputedTotal,
} from './lib/session'
import { composeWizardSession } from './lib/wizard'
import { useBank } from './lib/useBank'
import { acknowledgeLinkFailed, adminAvailable } from './lib/admin/state'
import { useAdmin } from './lib/admin/useAdmin'

// Slice 32: login sheet + sign-out live in lazy chunks (coach main chunk stays small).
const AdminLoginSheet = lazy(() => import('./components/AdminLoginSheet').then((m) => ({ default: m.AdminLoginSheet })))
const signOutAdmin = () => import('./lib/admin/session').then((m) => m.signOutAdmin())
import { decodeShare, shareTokenFromHash } from './lib/sharePass'
import { applyUpdate, fetchRemoteBuild, isNewerBuild, localBuild } from './lib/appUpdate'
import type { Session } from './types'
import './App.css'
import './tips.css'
import './export.css'

type View = 'home' | 'builder' | 'hall'

export default function App() {
  // Slice 31 — fresh bank data re-renders the tree in place (no remount, sheets and input kept).
  useBank()
  const [view, setView] = useState<View>('home')
  const [session, setSession] = useState<Session>(() => createBlankSession())
  const [openTemplates, setOpenTemplates] = useState(false)
  const [hallStartFloor, setHallStartFloor] = useState(false)
  const [tips, setTips] = useState<CoachTipsStateV1>(() => loadCoachTips())
  const [footerTipsMsg, setFooterTipsMsg] = useState<string | null>(null)
  const [shared, setShared] = useState<Session | null>(null)
  const [shareError, setShareError] = useState(false)
  const [runSession, setRunSession] = useState<Session | null>(null)
  const [remoteBuild, setRemoteBuild] = useState<string | null>(null)
  // Slice 32 — footer admin link / state + the login sheet (opens by itself after a bad link).
  const admin = useAdmin()
  const [loginOpen, setLoginOpen] = useState(false)
  const showLogin = loginOpen || admin.linkFailed
  const updateReady = isNewerBuild(localBuild(), remoteBuild)

  useEffect(() => {
    let seq = 0
    async function readHash() {
      const id = ++seq
      const token = shareTokenFromHash(window.location.hash)
      if (!token) {
        if (id === seq) {
          setShared(null)
          setShareError(false)
        }
        return
      }
      const next = await decodeShare(token)
      if (id !== seq) return
      if (next) {
        setShared(next)
        setShareError(false)
      } else {
        setShared(null)
        setShareError(true)
      }
    }
    void readHash()
    window.addEventListener('hashchange', readHash)
    return () => {
      seq += 1
      window.removeEventListener('hashchange', readHash)
    }
  }, [])

  useEffect(() => {
    let cancel = false
    async function check() {
      const next = await fetchRemoteBuild(import.meta.env.BASE_URL)
      if (!cancel) setRemoteBuild(next)
    }
    void check()
    function onVisible() {
      if (document.visibilityState === 'visible') void check()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancel = true
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  const draft = loadDraft()
  const liveItemCount =
    view === 'home' ? (draft ? countSessionItems(draft) : 0) : countSessionItems(session)
  const placementCount =
    view === 'home'
      ? (draft?.hallPlacements?.length ?? 0)
      : (session.hallPlacements?.length ?? 0)

  // Slice 16 — any non-empty saved stationEquipment (not förslag alone, not [])
  const sourceForCompose = view === 'home' ? draft : session
  const hasComposedEquipment = Boolean(
    sourceForCompose &&
      listSessionItems(sourceForCompose).some(
        (item) =>
          Array.isArray(item.stationEquipment) &&
          item.stationEquipment.length > 0,
      ),
  )

  // Auto-progress checklist from draft/session heuristics (data-model §4).
  // Adjust state during render when heuristics change (React-recommended pattern).
  // Slice 22 A1 compact is set only on successful placeAt (not placementCount sync),
  // so Visa tips igen can clear hallHintsCompact without being immediately re-set.
  const syncedTips = syncChecklistHeuristics(tips, {
    hasDraft: hasDraft(),
    itemCount: liveItemCount,
    placementCount,
    hasComposedEquipment,
  })
  if (syncedTips !== tips) {
    setTips(syncedTips)
  }

  function patchTips(
    updater: (prev: CoachTipsStateV1) => CoachTipsStateV1,
  ): void {
    setTips((prev) => updater(prev))
  }

  function goNew() {
    patchTips(markChooseOrBuild)
    setSession(createBlankSession())
    setOpenTemplates(false)
    setHallStartFloor(false)
    setView('builder')
  }

  function goTemplate() {
    patchTips(markChooseOrBuild)
    setSession(createBlankSession())
    setOpenTemplates(true)
    setHallStartFloor(false)
    setView('builder')
  }

  function goWizardFinish(answers: WizardFinishAnswers) {
    patchTips(markChooseOrBuild)
    const next = composeWizardSession(answers)
    setSession(next)
    saveDraft(next)
    setOpenTemplates(false)
    setHallStartFloor(false)
    setView('builder')
  }

  function goContinue() {
    const loaded = loadDraft()
    if (!loaded) return
    patchTips(markChooseOrBuild)
    setSession(withComputedTotal(loaded))
    setOpenTemplates(false)
    setHallStartFloor(false)
    setView('builder')
  }

  function openRunFromBuilder() {
    if (countSessionItems(session) < 1) return
    setRunSession(session)
  }

  function openRunFromShare() {
    if (!shared || countSessionItems(shared) < 1) return
    setRunSession(shared)
  }

  function handleTipsUpdate(
    updater: (prev: CoachTipsStateV1) => CoachTipsStateV1,
  ) {
    patchTips(updater)
  }

  function handleShowTipsAgain(): 'restored' | 'already' {
    if (!anyTipsHidden(syncedTips)) return 'already'
    patchTips(resetTipsVisibility)
    return 'restored'
  }

  function handleFooterShowTipsAgain() {
    const result = handleShowTipsAgain()
    setFooterTipsMsg(
      result === 'restored' ? UI.visaTipsIgenDone : UI.visaTipsIgenAlready,
    )
    window.setTimeout(() => setFooterTipsMsg(null), 2200)
  }

  const handleDismissTip = useCallback((tipId: string) => {
    patchTips((prev) => dismissTip(prev, tipId))
  }, [])

  function handleOpenHallFromBuilder() {
    patchTips(markOpenedHall)
    setHallStartFloor(false)
    setView('hall')
  }

  const handleEnterGolvklart = useCallback(() => {
    patchTips(markOpenedGolvklart)
  }, [])

  const handleBuilderMounted = useCallback(() => {
    patchTips(markBuilderVisited)
  }, [])

  /** Slice 20 C1 — one-shot Starta från mall flag; clear after apply or sheet close. */
  const handleInitialTemplateConsumed = useCallback(() => {
    setOpenTemplates(false)
  }, [])

  function receiveSession(next: Session) {
    const adopted = adoptAsDraft(next)
    patchTips(markChooseOrBuild)
    setSession(adopted)
    setOpenTemplates(false)
    setHallStartFloor(false)
    setShared(null)
    setView('builder')
    if (window.location.hash) window.location.hash = ''
  }

  function saveShared(run: boolean) {
    if (!shared) return
    const adopted = adoptAsDraft(shared)
    const floor = run && countPlaceableItems(adopted) > 0
    patchTips((prev) =>
      floor
        ? markOpenedGolvklart(markOpenedHall(markChooseOrBuild(prev)))
        : markChooseOrBuild(prev),
    )
    setSession(adopted)
    setOpenTemplates(false)
    setHallStartFloor(floor)
    setView(floor ? 'hall' : 'builder')
    setShared(null)
    if (window.location.hash) window.location.hash = ''
  }

  return (
    <div className="app-shell">
      {updateReady && (
        <div className="app-update no-print" role="status">
          <p>{UI.updateReady}</p>
          <button type="button" className="btn-primary" onClick={() => applyUpdate(remoteBuild)}>
            {UI.updateNow}
          </button>
        </div>
      )}
      {shared ? (
        <SharePass session={shared} onSave={saveShared} onRun={openRunFromShare} />
      ) : view === 'home' ? (
        <>
          {shareError && (
            <p className="share-banner" role="alert">
              {UI.shareBad}
            </p>
          )}
          <Home
            onNew={goNew}
            onTemplate={goTemplate}
            onContinue={goContinue}
            onWizardFinish={goWizardFinish}
            onReceive={receiveSession}
          />
        </>
      ) : view === 'hall' ? (
        <HallBoard
          session={session}
          onChange={setSession}
          onBack={() => {
            setHallStartFloor(false)
            setView('builder')
          }}
          tips={syncedTips}
          onDismissTip={handleDismissTip}
          onTips={handleTipsUpdate}
          initialFloor={hallStartFloor}
          onEnterGolvklart={handleEnterGolvklart}
        />
      ) : (
        <SessionBuilder
          key={session.id + (openTemplates ? '-tmpl' : '')}
          session={session}
          onChange={setSession}
          onHome={() => setView('home')}
          onOpenHall={handleOpenHallFromBuilder}
          onRun={openRunFromBuilder}
          initialTemplatePicker={openTemplates}
          onInitialTemplateConsumed={handleInitialTemplateConsumed}
          tips={syncedTips}
          onDismissTip={handleDismissTip}
          onBuilderMounted={handleBuilderMounted}
        />
      )}
      <footer className="app-footer no-print">
        {view !== 'home' && (
          <>
            <span>{UI.footerSliceLabel}</span>
            <span className="app-footer-sep" aria-hidden>
              ·
            </span>
          </>
        )}
        {adminAvailable() && admin.state !== 'checking' && (
          <span className="footer-admin">
            {admin.state === 'none' && (
              <button type="button" className="btn-text visa-tips-igen footer-admin-login" onClick={() => setLoginOpen(true)}>
                {UI.adminLoginLink}
              </button>
            )}
            {admin.state === 'admin' && <span className="footer-admin-badge">{UI.adminBadge}</span>}
            {admin.state === 'notAdmin' && <span className="footer-admin-not">{UI.adminNotAdmin}</span>}
            {admin.state !== 'none' && (
              <>
                <span className="app-footer-sep" aria-hidden>
                  ·
                </span>
                <button type="button" className="btn-text visa-tips-igen footer-admin-logout" onClick={() => void signOutAdmin()}>
                  {UI.adminLogout}
                </button>
              </>
            )}
            <span className="app-footer-sep" aria-hidden>
              ·
            </span>
          </span>
        )}
        {view !== 'home' && (
          <>
            <button
              type="button"
              className="btn-text visa-tips-igen footer-visa-tips"
              onClick={handleFooterShowTipsAgain}
            >
              {UI.visaTipsIgen}
            </button>
            <span className="app-footer-sep" aria-hidden>
              ·
            </span>
          </>
        )}
        <button
          type="button"
          className="btn-text visa-tips-igen footer-update"
          onClick={() => applyUpdate(remoteBuild)}
        >
          {UI.updateApp}
        </button>
        {footerTipsMsg && (
          <span className="visa-tips-feedback" role="status">
            {footerTipsMsg}
          </span>
        )}
      </footer>
      {showLogin && (
        <Suspense fallback={null}>
          <AdminLoginSheet
            linkFailed={admin.linkFailed}
            onClose={() => {
              setLoginOpen(false)
              acknowledgeLinkFailed()
            }}
          />
        </Suspense>
      )}
      {runSession && (
        <RunPass session={runSession} onClose={() => setRunSession(null)} />
      )}
    </div>
  )
}
