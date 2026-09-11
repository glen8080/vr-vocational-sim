import { useEffect, useState } from 'react'
import { useStore } from '../store'
import Icon from './Icon'

function fmt(s) {
  const m = Math.floor(s / 60)
  const ss = Math.floor(s % 60)
  return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
}

export default function HUD() {
  const state = useStore((s) => s.state)
  const report = useStore((s) => s.report)
  const reportOpen = useStore((s) => s.reportOpen)
  const openReport = useStore((s) => s.openReport)

  // Local clock seeded from the authoritative server elapsed time.
  const [now, setNow] = useState(0)
  const base = state?.elapsedS ?? 0
  useEffect(() => {
    const t0 = Date.now()
    setNow(base)
    const iv = setInterval(() => setNow(base + (Date.now() - t0) / 1000), 500)
    return () => clearInterval(iv)
  }, [base])

  if (!state) return <div className="header" />

  const v = state.violations
  const over = now > state.parS

  return (
    <div className="header">
      <div className="brand">
        <span className="mark">TS</span>
        <span>
          TradeSim
          <small>{state.scenario.trade} · AI coach</small>
        </span>
      </div>

      <div className="pill">{state.scenario.title}</div>

      <div className="spacer" />

      <div className="metric">
        <span className="k">Elapsed</span>
        <span className="v" style={{ color: over ? 'var(--warn)' : undefined }}>{fmt(now)}</span>
      </div>
      <div className="metric">
        <span className="k">Par</span>
        <span className="v small" style={{ color: 'var(--dim)' }}>{fmt(state.parS)}</span>
      </div>
      <div className="metric">
        <span className="k">Safety</span>
        <span className="v" style={{ color: state.safety >= 85 ? 'var(--ok)' : state.safety >= 60 ? 'var(--warn)' : 'var(--bad)' }}>
          {state.safety}
        </span>
      </div>
      <div className="metric">
        <span className="k">Efficiency</span>
        <span className="v">{state.efficiency}</span>
      </div>
      <div className="metric">
        <span className="k">Breaches</span>
        <span className="v" style={{ color: v.critical ? 'var(--crit)' : v.major ? 'var(--bad)' : v.minor ? 'var(--warn)' : 'var(--ok)' }}>
          {v.critical + v.major + v.minor}
        </span>
      </div>

      {report && !reportOpen && (
        <button className="btn primary" onClick={() => openReport()}>
          <Icon name="check" size={13} /> View report
        </button>
      )}
      {report && reportOpen && <div className="pill live"><i className="dot" />assessed</div>}
    </div>
  )
}
