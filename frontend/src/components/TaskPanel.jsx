import { useEffect, useRef } from 'react'
import { useStore } from '../store'

function SafetyBar({ value }) {
  const cls = value >= 85 ? '' : value >= 60 ? 'warn' : 'bad'
  return (
    <div className="progress-wrap" style={{ padding: '0 0 10px' }}>
      <div className="section-title" style={{ padding: '0 0 6px' }}>
        <span>Safety standing</span>
        <span style={{ color: value >= 85 ? 'var(--ok)' : value >= 60 ? 'var(--warn)' : 'var(--bad)' }}>{value}</span>
      </div>
      <div className={`bar safety ${cls}`}><i style={{ width: `${value}%` }} /></div>
    </div>
  )
}

export default function TaskPanel() {
  const state = useStore((s) => s.state)
  const scroll = useRef(null)
  const activeId = state?.activeStep

  useEffect(() => {
    const el = scroll.current?.querySelector('.task.active')
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [activeId])

  if (!state) return <div className="col left" />

  const { steps, progress, safety, efficiency, mastery } = state

  return (
    <div className="col left">
      <div className="section-title">
        <span>Procedure</span>
        <span>{state.scenario.trade}</span>
      </div>

      <div className="progress-wrap">
        <div className="bar"><i style={{ width: `${progress}%` }} /></div>
      </div>

      <div className="tasks" ref={scroll}>
        {steps.map((s, i) => (
          <div key={s.id} className={`task ${s.status}`}>
            <div className="idx">{s.status === 'complete' ? '✓' : i + 1}</div>
            <div className="t">{s.title}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '6px 14px 0' }}>
        <SafetyBar value={safety} />
      </div>

      <div className="section-title" style={{ paddingBottom: 4 }}>
        <span>Coach's model of you</span>
      </div>
      <div className="mastery">
        {Object.entries(mastery || {}).map(([k, v]) => (
          <div className="mrow" key={k}>
            <div>
              <div className="lbl">{k}</div>
              <div className="track"><i style={{ width: `${v * 100}%`, background: v > 0.6 ? 'var(--accent)' : v > 0.35 ? 'var(--warn)' : 'var(--bad)' }} /></div>
            </div>
            <div className="num">{Math.round(v * 100)}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 14px 12px', display: 'flex', gap: 14 }}>
        <div className="metric">
          <span className="k">Efficiency</span>
          <span className="v small">{efficiency}</span>
        </div>
        <div className="metric">
          <span className="k">Hints</span>
          <span className="v small">{state.hintsUsed}</span>
        </div>
        <div className="metric">
          <span className="k">Rework</span>
          <span className="v small">{state.rework}</span>
        </div>
      </div>
    </div>
  )
}
