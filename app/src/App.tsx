import { useCallback, useState } from 'react'
import { HallBoard } from './components/HallBoard'
import { Home } from './components/Home'
import type { KomIgangAction } from './components/KomIgangCard'
import { SessionBuilder } from './components/SessionBuilder'
import { UI } from './data/blockMeta'
import {
  anyTipsHidden,
  dismissChecklist,
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
import { countSessionItems, listSessionItems } from './lib/hall'
import {
  createBlankSession,
  hasDraft,
  loadDraft,
  withComputedTotal,
} from './lib/session'
import type { Session } from './types'
import './App.css'

type View = 'home' | 'builder' | 'hall'

export default function App() {
  const [view, setView] = useState<View>('home')
  const [session, setSession] = useState<Session>(() => createBlankSession())
  const [openTemplates, setOpenTemplates] = useState(false)
  const [hallStartFloor, setHallStartFloor] = useState(false)
  const [tips, setTips] = useState<CoachTipsStateV1>(() => loadCoachTips())
  const [footerTipsMsg, setFooterTipsMsg] = useState<string | null>(null)

  const draft = loadDraft()
  const draftItemCount = draft ? countSessionItems(draft) : 0
  const liveItemCount =
    view === 'home' ? draftItemCount : countSessionItems(session)
  const canOpenHall = liveItemCount >= 1
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

  function goContinue() {
    const loaded = loadDraft()
    if (!loaded) return
    patchTips(markChooseOrBuild)
    setSession(withComputedTotal(loaded))
    setOpenTemplates(false)
    setHallStartFloor(false)
    setView('builder')
  }

  function openBuilderFromChecklist() {
    const loaded = loadDraft()
    patchTips(markChooseOrBuild)
    if (loaded) {
      setSession(withComputedTotal(loaded))
    } else {
      setSession(createBlankSession())
    }
    setOpenTemplates(false)
    setHallStartFloor(false)
    setView('builder')
  }

  function openHallFromHome(): boolean {
    const loaded = loadDraft()
    if (!loaded || countSessionItems(loaded) < 1) return false
    patchTips((prev) => markOpenedHall(markChooseOrBuild(prev)))
    setSession(withComputedTotal(loaded))
    setHallStartFloor(false)
    setView('hall')
    return true
  }

  function openGolvklartFromHome(): boolean {
    const loaded = loadDraft()
    if (!loaded || countSessionItems(loaded) < 1) return false
    patchTips((prev) =>
      markOpenedGolvklart(markOpenedHall(markChooseOrBuild(prev))),
    )
    setSession(withComputedTotal(loaded))
    setHallStartFloor(true)
    setView('hall')
    return true
  }

  function handleChecklistStepDone(action: KomIgangAction) {
    if (action === 'chooseOrBuild') {
      patchTips(markChooseOrBuild)
    }
  }

  function handleDismissChecklist() {
    patchTips(dismissChecklist)
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

  return (
    <div className="app-shell">
      {view === 'home' ? (
        <Home
          tips={syncedTips}
          itemCount={draftItemCount}
          canOpenHall={canOpenHall}
          onNew={goNew}
          onTemplate={goTemplate}
          onContinue={goContinue}
          onOpenBuilder={openBuilderFromChecklist}
          onOpenHall={openHallFromHome}
          onOpenGolvklart={openGolvklartFromHome}
          onDismissChecklist={handleDismissChecklist}
          onShowTipsAgain={handleShowTipsAgain}
          onChecklistStepDone={handleChecklistStepDone}
        />
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
        />
      ) : (
        <SessionBuilder
          key={session.id + (openTemplates ? '-tmpl' : '')}
          session={session}
          onChange={setSession}
          onHome={() => setView('home')}
          onOpenHall={handleOpenHallFromBuilder}
          initialTemplatePicker={openTemplates}
          tips={syncedTips}
          onDismissTip={handleDismissTip}
          onBuilderMounted={handleBuilderMounted}
        />
      )}
      <footer className="app-footer no-print">
        <span>
          {UI.footerSliceLabel}
        </span>
        <span className="app-footer-sep" aria-hidden>
          ·
        </span>
        <button
          type="button"
          className="btn-text visa-tips-igen footer-visa-tips"
          onClick={handleFooterShowTipsAgain}
        >
          {UI.visaTipsIgen}
        </button>
        {footerTipsMsg && (
          <span className="visa-tips-feedback" role="status">
            {footerTipsMsg}
          </span>
        )}
      </footer>
    </div>
  )
}
