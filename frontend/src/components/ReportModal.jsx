import { useStore } from '../store'
import Icon from './Icon'

const colFor = (s) => (s >= 85 ? 'var(--ok)' : s >= 65 ? 'var(--warn)' : 'var(--bad)')

export default function ReportModal() {
  const report = useStore((s) => s.report)
  const open = useStore((s) => s.reportOpen)
  const dismiss = useStore((s) => s.dismissReport)
  const reset = useStore((s) => s.reset)
  if (!report || !open) return null

  const { scores, band, dimensions, feedforward, counts, timing, steps, violations } = report

  const download = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `competency-${report.scenarioId}-${Date.now()}.json`
    a.click()
  }

  return (
    <div className="modal-bg">
      <div className="modal">
        <header>
          <Icon name="check" size={20} />
          <div>
            <h2>Competency report</h2>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{report.scenarioTitle}</div>
          </div>
          <div className="spacer" />
          <button className="btn ghost" onClick={download}>Export JSON</button>
          <button className="btn" onClick={dismiss}>Close</button>
        </header>

        <div className="body">
          <div className="score-grid">
            <div className="score overall">
              <div className="k">Overall</div>
              <div className="v">{scores.overall}</div>
            </div>
            <div className="score">
              <div className="k">Safety</div>
              <div className="v" style={{ color: colFor(scores.safety) }}>{scores.safety}</div>
            </div>
            <div className="score">
              <div className="k">Efficiency</div>
              <div className="v" style={{ color: colFor(scores.efficiency) }}>{scores.efficiency}</div>
            </div>
            <div className="score">
              <div className="k">Completion</div>
              <div className="v" style={{ color: colFor(scores.completion) }}>{scores.completion}</div>
            </div>
          </div>

          <div
            className="band"
            style={{
              borderColor: scores.overall >= 78 ? 'rgba(52,211,153,.4)' : scores.overall >= 62 ? 'rgba(251,191,36,.4)' : 'rgba(248,113,113,.4)',
              background: scores.overall >= 78 ? 'rgba(52,211,153,.07)' : scores.overall >= 62 ? 'rgba(251,191,36,.07)' : 'rgba(248,113,113,.07)',
            }}
          >
            <div className="lv">{band.level}</div>
            <div className="nt">{band.note}</div>
            {report.safetyCeilingApplied && (
              <div className="nt" style={{ color: 'var(--bad)', marginTop: 6 }}>
                A critical safety breach was recorded — the overall grade is capped regardless of speed.
              </div>
            )}
          </div>

          {report.narrative && <div className="narrative">{report.narrative}</div>}

          <div className="two-col">
            <div>
              <div className="sub-h">Competency profile</div>
              {dimensions.map((d) => (
                <div className="radar-row" key={d.dimension}>
                  <div>
                    <div className="lbl">{d.dimension}</div>
                    <div className="track">
                      <i style={{ width: `${d.score}%`, background: colFor(d.score) }} />
                    </div>
                  </div>
                  <div className="num" style={{ color: colFor(d.score) }}>{d.score}</div>
                </div>
              ))}

              <div className="sub-h" style={{ marginTop: 18 }}>Attempt data</div>
              <div className="kv"><span>Time</span><b>{Math.round(timing.elapsedS)}s</b><span>vs par {timing.parS}s ({timing.vsParPct > 0 ? '+' : ''}{timing.vsParPct}%)</span></div>
              <div className="kv"><span>Actions</span><b>{counts.actions}</b><span>· hints {counts.hintsUsed} · rework {counts.rework}</span></div>
              <div className="kv"><span>Breaches</span><b style={{ color: counts.critical ? 'var(--crit)' : undefined }}>{counts.critical} critical</b>
                <span>· {counts.major} major · {counts.minor} minor</span></div>
              <div className="kv" style={{ marginTop: 6 }}>
                {(report.standards || []).map((s) => (
                  <span key={s} style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--violet)', border: '1px solid rgba(167,139,250,.25)', padding: '1px 6px', borderRadius: 5, marginRight: 4 }}>{s}</span>
                ))}
              </div>
            </div>

            <div>
              <div className="sub-h">Priority remediation</div>
              {feedforward.length === 0 && (
                <div className="ff" style={{ borderLeftColor: 'var(--ok)' }}>
                  <div className="t">No remediation required</div>
                  <div className="a">Clean run — correct sequence, no breaches. Ready for sign-off on this task.</div>
                </div>
              )}
              {feedforward.map((f, i) => (
                <div className={`ff ${f.severity}`} key={i}>
                  <div className="t">{f.title}</div>
                  <div className="a">{f.action}</div>
                  {f.why && <div className="w">{f.why}</div>}
                </div>
              ))}

              <div className="sub-h" style={{ marginTop: 18 }}>Procedure checklist</div>
              <div style={{ maxHeight: 190, overflowY: 'auto' }}>
                {steps.map((s, i) => (
                  <div className="kv" key={s.id}>
                    <span style={{ color: s.status === 'complete' ? 'var(--ok)' : 'var(--bad)', width: 14 }}>{s.status === 'complete' ? '✓' : '✕'}</span>
                    <span style={{ color: s.status === 'complete' ? 'var(--muted)' : 'var(--text)' }}>{i + 1}. {s.title}</span>
                  </div>
                ))}
              </div>

              {violations.length > 0 && (
                <>
                  <div className="sub-h" style={{ marginTop: 16 }}>Recorded breaches ({violations.length})</div>
                  <div style={{ maxHeight: 130, overflowY: 'auto' }}>
                    {violations.map((v, i) => (
                      <div className="kv" key={i}>
                        <span style={{
                          color: v.severity === 'critical' ? 'var(--crit)' : v.severity === 'major' ? 'var(--bad)' : 'var(--warn)',
                          fontFamily: 'var(--mono)', fontSize: 10, width: 58, flexShrink: 0,
                        }}>{v.severity}</span>
                        <span>{v.title}{v.reference ? ` — ${v.reference}` : ''}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
            <button className="btn primary" onClick={() => { dismiss(); reset(); }}>Run it again</button>
            <button className="btn" onClick={download}>Download for the record</button>
          </div>
        </div>
      </div>
    </div>
  )
}
