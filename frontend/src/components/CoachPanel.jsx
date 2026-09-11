import { useEffect, useRef } from 'react'
import { useStore } from '../store'
import Icon from './Icon'

const SEV_LABEL = {
  ok: 'confirmed', info: 'coach', hint: 'hint',
  minor: 'minor', major: 'major', critical: 'critical breach',
}

export default function CoachPanel() {
  const log = useStore((s) => s.coachLog)
  const hint = useStore((s) => s.hint)
  const reset = useStore((s) => s.reset)
  const connected = useStore((s) => s.connected)
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (el) el.scrollTop = el.scrollHeight
  }, [log.length])

  return (
    <div className="col right">
      <div className="section-title">
        <span>AI Coach</span>
        <span className={`pill ${connected ? 'live' : 'down'}`}>
          <i className="dot" />{connected ? 'live' : 'offline'}
        </span>
      </div>

      <div className="coach" ref={ref}>
        {log.length === 0 && (
          <div className="msg info">
            <div className="mhead"><span className="sev">coach</span><span className="t">Connecting…</span></div>
            <div className="body">Waiting for the coach service.</div>
          </div>
        )}
        {log.map((m) => (
          <div key={m.id} className={`msg ${m.severity}`}>
            <div className="mhead">
              <span className="sev">{SEV_LABEL[m.severity] || m.severity}</span>
              <span className="t">{m.title}</span>
            </div>
            <div className="body">{m.body}</div>
            {(m.why || m.hint) && (
              <div className="meta">
                {m.why && <div><b>Why:</b> {m.why}</div>}
                {m.hint && <div style={{ marginTop: 4 }}><b>Next:</b> {m.hint}</div>}
              </div>
            )}
            {m.reference && <span className="ref">{m.reference}</span>}
          </div>
        ))}
      </div>

      <div className="coach-foot">
        <button className="btn" onClick={() => hint()}>
          <Icon name="question" size={13} /> Ask for a hint
        </button>
        <button className="btn ghost" onClick={() => reset()}>
          <Icon name="refresh" size={13} /> Restart
        </button>
      </div>
    </div>
  )
}
