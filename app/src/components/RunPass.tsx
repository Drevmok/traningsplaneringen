import { useEffect, useMemo, useRef, useState } from 'react'
import { UI } from '../data/blockMeta'
import { useBodyScrollLock } from '../lib/bodyScrollLock'
import {
  clockRemaining,
  formatRunClock,
  pauseClock,
  resumeClock,
  runSteps,
  startClock,
  type RunClock,
} from '../lib/runPass'
import type { Session } from '../types'

interface Props {
  session: Session
  onClose: () => void
}

export function RunPass({ session, onClose }: Props) {
  const steps = useMemo(() => runSteps(session), [session])
  const [clock, setClock] = useState<RunClock>(() =>
    startClock(0, steps[0]?.seconds ?? 0, Date.now()),
  )
  const [now, setNow] = useState(() => Date.now())
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const rootRef = useRef<HTMLDivElement>(null)

  const index = steps.length === 0 ? 0 : Math.min(clock.index, steps.length - 1)
  const step = steps[index]
  const left = clockRemaining({ ...clock, index }, now)
  const paused = clock.paused
  const last = index >= steps.length - 1

  useBodyScrollLock(true)

  useEffect(() => {
    rootRef.current?.focus()
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCloseRef.current()
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        setClock((c) => {
          const next = Math.min(steps.length - 1, c.index + 1)
          if (next === c.index) return c
          return startClock(next, steps[next]?.seconds ?? 0, Date.now())
        })
        setNow(Date.now())
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setClock((c) => {
          const next = Math.max(0, c.index - 1)
          if (next === c.index) return c
          return startClock(next, steps[next]?.seconds ?? 0, Date.now())
        })
        setNow(Date.now())
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [steps])

  useEffect(() => {
    if (clock.paused || Date.now() >= clock.deadline) return
    const id = window.setInterval(() => {
      const t = Date.now()
      setNow(t)
      if (t >= clock.deadline) window.clearInterval(id)
    }, 200)
    return () => window.clearInterval(id)
  }, [clock])

  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null
    let cancelled = false
    const nav = navigator as Navigator & {
      wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> }
    }

    async function acquire() {
      if (!nav.wakeLock || cancelled) return
      try {
        const next = await nav.wakeLock.request('screen')
        if (cancelled) {
          void next.release()
          return
        }
        lock = next
      } catch {
        // The hall still works if the browser refuses the lock.
      }
    }

    void acquire()
    function onVis() {
      if (document.visibilityState === 'visible') void acquire()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVis)
      void lock?.release().catch(() => {})
      if (document.fullscreenElement) {
        void document.exitFullscreen().catch(() => {})
      }
    }
  }, [])

  function go(nextIndex: number) {
    const i = Math.max(0, Math.min(steps.length - 1, nextIndex))
    const t = Date.now()
    setNow(t)
    setClock(startClock(i, steps[i]?.seconds ?? 0, t))
  }

  function toggleClock() {
    const t = Date.now()
    setNow(t)
    setClock((c) => (c.paused ? resumeClock(c, t) : pauseClock(c, t)))
  }

  if (!step) {
    return (
      <div className="run-pass" role="dialog" aria-modal="true" aria-label={UI.runPass}>
        <button type="button" className="btn-secondary" onClick={onClose}>
          {UI.runExit}
        </button>
      </div>
    )
  }

  const clockLabel = `${formatRunClock(left)}. ${
    left === 0 ? `${UI.runTimeUp}. ` : ''
  }${paused ? UI.runResume : UI.runPause}`

  return (
    <div
      className="run-pass"
      role="dialog"
      aria-modal="true"
      aria-label={UI.runPass}
      ref={rootRef}
      tabIndex={-1}
    >
      <div className="run-top">
        <p className="run-kicker">
          {index + 1} / {steps.length} · {step.blockLabel}
        </p>
        <button type="button" className="btn-secondary run-exit" onClick={onClose}>
          {UI.runExit}
        </button>
      </div>

      <h1>{step.title}</h1>
      {step.experienced && <p className="run-experienced">{UI.experiencedCoach}</p>}

      <button
        type="button"
        className={`run-clock${paused ? ' is-paused' : ''}`}
        aria-pressed={paused}
        aria-label={clockLabel}
        onClick={toggleClock}
      >
        {formatRunClock(left)}
      </button>
      {paused && left > 0 && <p className="run-status">{UI.runPaused}</p>}
      {left === 0 && (
        <p className="run-status run-timeup" role="status">
          {UI.runTimeUp}
        </p>
      )}

      <div className="run-script">
        {step.why && (
          <p>
            <span className="run-label">{UI.why}</span>
            {step.why}
          </p>
        )}
        {step.cue && (
          <p className="run-cue">
            <span className="run-label">{UI.howTo}</span>
            {step.cue}
          </p>
        )}
        {step.safety ? (
          <p className="run-safety">
            <span className="run-label">{UI.safety}</span>
            {step.safety}
          </p>
        ) : (
          step.watch && (
            <p>
              <span className="run-label">{UI.watchFor}</span>
              {step.watch}
            </p>
          )
        )}
      </div>

      <div className="run-nav">
        <button
          type="button"
          className="btn-secondary"
          disabled={index === 0}
          onClick={() => go(index - 1)}
        >
          {UI.runPrev}
        </button>
        <button
          type="button"
          className="btn-primary"
          disabled={last}
          onClick={() => go(index + 1)}
        >
          {last ? UI.runLast : UI.runNext}
        </button>
      </div>
    </div>
  )
}
