import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { HallBoard } from './components/HallBoard'
import { Home } from './components/Home'
import type { PlanResult } from './components/HomeWizard'
import { SessionBuilder } from './components/SessionBuilder'
import { SharePass } from './components/SharePass'
import { FooterFeedback } from './components/FooterFeedback'
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
  setSessionLength,
  withComputedTotal,
} from './lib/session'
import { composeWizardSession } from './lib/wizard'
import { applyMall } from './lib/mallApply'
import { armMallUndo } from './lib/undoCarry'
import { trySaveDraft } from './lib/autosave'
import { useAutosave } from './lib/useAutosave'
import { useBank } from './lib/useBank'
import { adminAvailable } from './lib/admin/state'
import { useAdmin } from './lib/admin/useAdmin'

// Slice 32: login sheet + sign-out live in lazy chunks (coach main chunk stays small).
const AdminLoginSheet = lazy(() => import('./components/AdminLoginSheet').then((m) => ({ default: m.AdminLoginSheet })))
const signOutAdmin = () => import('./lib/admin/session').then((m) => m.signOutAdmin())
// Slice 47 C1: the Admin view rides in the lazy admin code too.
const AdminArea = lazy(() => import('./components/AdminArea'))
import { decodeShare, shareTokenFromHash } from './lib/sharePass'
import { applyUpdate, fetchRemoteBuild, isNewerBuild, localBuild } from './lib/appUpdate'
import type { Session } from './types'
import './App.css'
import './tips.css'
import './export.css'
import { markFresh, noteChange } from './lib/freshPass'
const markFreshed = <T extends Parameters<typeof markFresh>[0]>(s: T): T => (markFresh(s), s)

type View = 'home' | 'builder' | 'hall' | 'admin'

export default function App() {
  // Slice 31 — fresh bank data re-renders the tree in place (no remount, sheets and input kept).
  useBank()
  const [rawView, setView] = useState<View>('home')
  const [session, setSession] = useState<Session>(() => createBlankSession())
  // Slice 42: the first edit of a mall / wizard / Tomt pass ends «fresh» (also Hallöversikt edits).
  useEffect(() => noteChange(session), [session])
  const [hallStartFloor, setHallStartFloor] = useState(false)
  const [tips, setTips] = useState<CoachTipsStateV1>(() => loadCoachTips())
  const [footerTipsMsg, setFooterTipsMsg] = useState<string | null>(null)
  const [shared, setShared] = useState<Session | null>(null)
  const [shareError, setShareError] = useState(false)
  const [runSession, setRunSession] = useState<Session | null>(null)
  const [remoteBuild, setRemoteBuild] = useState<string | null>(null)
  const admin = useAdmin()
  // Slice 47 C1: where «Tillbaka» in Admin goes; leaving admin (Logga ut, expiry) goes there too.
  const [adminFrom, setAdminFrom] = useState<'home' | 'builder'>('home')
  // Not admin any more while the Admin view is open (expiry) → show where you came from.
  const view: View = rawView === 'admin' && admin.state !== 'admin' && admin.state !== 'checking' ? adminFrom : rawView
  const adminView = view === 'admin' && admin.state === 'admin'
  // Slice 39 A1: autosave while the pass is on screen (builder / hall).
  const autosave = useAutosave(session, !shared && (view === 'builder' || view === 'hall'))
  // Slice 32/33 — footer admin link / state + the login sheet (opened only from the footer link).
  const [loginOpen, setLoginOpen] = useState(false)
  const showLogin = loginOpen
  // Slice 33 — after a code login, focus moves to the footer «Logga ut» (screen readers hear the new state).
  const focusLogoutRef = useRef(false)
  const logoutRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!focusLogoutRef.current || loginOpen || admin.state === 'none' || admin.state === 'checking') return
    logoutRef.current?.focus()
    focusLogoutRef.current = false
  }, [loginOpen, admin.state])
  const updateReady = isNewerBuild(localBuild(), remoteBuild)
  function openAdmin(from: 'home' | 'builder') {
    if (from === 'builder') autosave.flush()
    setAdminFrom(from)
    setView('admin')
  }

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

  /** Slice 46: where each Planera pass path lands — always Passbyggaren. */
  function finishPlan(plan: PlanResult) {
    patchTips(markChooseOrBuild)
    setHallStartFloor(false)
    if (plan.path === 'questions') {
      const next = composeWizardSession(plan.answers)
      saveDraft(next)
      markFresh(next)
      setSession(next)
    } else if (plan.path === 'empty') {
      // As Tomt pass before: not written until the first change.
      setSession(markFreshed(setSessionLength({ ...createBlankSession(), hallTemplateId: plan.hallTemplateId }, plan.targetMinutes)))
    } else {
      // As Använd mall in the Mallar tab: saved on apply, fresh, «Mallen är i Passbyggaren. · Ångra».
      const mall = applyMall(plan.pick, plan.hallTemplateId, plan.targetMinutes)
      let next = mall
      if (plan.pick.kind === 'builtin') trySaveDraft(mall)
      else next = adoptAsDraft(mall)
      markFresh(next)
      armMallUndo({ ...createBlankSession(), hallTemplateId: plan.hallTemplateId }, next, UI.clubTemplateApplied)
      setSession(next)
    }
    setView('builder')
  }

  function goContinue() {
    const loaded = loadDraft()
    if (!loaded) return
    patchTips(markChooseOrBuild)
    setSession(withComputedTotal(loaded))
    setHallStartFloor(false)
    setView('builder')
  }

  function openRunFromBuilder() {
    if (countSessionItems(session) < 1) return
    autosave.flush()
    setRunSession(session)
  }

  function openRunFromShare() {
    if (!shared || countSessionItems(shared) < 1) return
    setRunSession(shared)
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
    autosave.flush()
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

  function receiveSession(next: Session) {
    const adopted = adoptAsDraft(next)
    patchTips(markChooseOrBuild)
    setSession(adopted)
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
    setHallStartFloor(floor)
    setView(floor ? 'hall' : 'builder')
    setShared(null)
    if (window.location.hash) window.location.hash = ''
  }

  /** Slice 46 E1: footer rows — separators only inside a row, never at a row end. */
  function footerRows(kind: 'home' | 'app' | 'shared') {
    const home = kind !== 'app'
    const sep = (
      <span className="app-footer-sep" aria-hidden>
        ·
      </span>
    )
    return (
      <>
        <FooterFeedback
          after={
            <>
              {!home && (
                <>
                  {sep}
                  <button type="button" className="btn-text visa-tips-igen footer-visa-tips" onClick={handleFooterShowTipsAgain}>
                    {UI.visaTipsIgen}
                  </button>
                </>
              )}
              {sep}
              <button type="button" className="btn-text visa-tips-igen footer-update" onClick={() => applyUpdate(remoteBuild)}>
                {UI.updateApp}
              </button>
            </>
          }
        />
        {!home && footerTipsMsg && (
          <span className="visa-tips-feedback" role="status">
            {footerTipsMsg}
          </span>
        )}
        {adminAvailable() && admin.state !== 'checking' && (
          <div className="app-footer-row footer-admin">
            {admin.state === 'none' && (
              <button type="button" className="btn-text visa-tips-igen footer-admin-login" onClick={() => setLoginOpen(true)}>
                {UI.adminLoginLink}
              </button>
            )}
            {admin.state === 'admin' &&
              (kind === 'shared' ? (
                <span className="footer-admin-badge">{UI.adminBadge}</span>
              ) : (
                <button
                  type="button"
                  className="btn-text visa-tips-igen footer-admin-open"
                  aria-label={UI.adminAreaOpenAria}
                  onClick={() => openAdmin(view === 'builder' || view === 'hall' ? 'builder' : view === 'admin' ? adminFrom : 'home')}
                >
                  {UI.adminBadge}
                </button>
              ))}
            {admin.state === 'notAdmin' && <span className="footer-admin-not">{UI.adminNotAdmin}</span>}
            {admin.state !== 'none' && (
              <>
                {sep}
                <button ref={logoutRef} type="button" className="btn-text visa-tips-igen footer-admin-logout" onClick={() => {
                    // Slice 47 AC23: Logga ut in Admin lands where you came from.
                    if (rawView === 'admin') setView(adminFrom)
                    void signOutAdmin()
                  }}>
                  {UI.adminLogout}
                </button>
              </>
            )}
          </div>
        )}
        {kind !== 'shared' && <p className={home ? 'app-footer-note' : 'app-footer-slice'}>{home ? UI.draftHonestyBodyShort : UI.footerSliceLabel}</p>}
      </>
    )
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
          <Home onContinue={goContinue} onPlan={finishPlan} onReceive={receiveSession} foot={footerRows('home')} />
        </>
      ) : view === 'admin' ? (
        adminView ? (
          <Suspense fallback={null}>
            <AdminArea onBack={() => setView(adminFrom)} />
          </Suspense>
        ) : null
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
          initialFloor={hallStartFloor}
          onEnterGolvklart={handleEnterGolvklart}
          saveStatus={autosave.status}
        />
      ) : (
        <SessionBuilder
          key={session.id}
          session={session}
          onChange={setSession}
          onHome={() => {
            autosave.flush()
            setView('home')
          }}
          saveStatus={autosave.status}
          onOpenHall={handleOpenHallFromBuilder}
          onRun={openRunFromBuilder}
          tips={syncedTips}
          onDismissTip={handleDismissTip}
          onBuilderMounted={handleBuilderMounted}
          onOpenAdmin={() => openAdmin('builder')}
        />
      )}
      {(shared || view !== 'home') && <footer className="app-footer no-print">{footerRows(shared ? 'shared' : 'app')}</footer>}
      {showLogin && (
        <Suspense fallback={null}>
          <AdminLoginSheet
            onClose={() => setLoginOpen(false)}
            onLoggedIn={() => {
              setLoginOpen(false)
              focusLogoutRef.current = true
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
