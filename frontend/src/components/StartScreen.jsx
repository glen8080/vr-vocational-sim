import { useStore } from '../store'
import Icon from './Icon'

export default function StartScreen() {
  const scenarios = useStore((s) => s.scenarios)
  const start = useStore((s) => s.start)
  const connError = useStore((s) => s.connError)
  const loading = useStore((s) => s.loading)

  return (
    <div className="start">
      <div className="start-inner">
        <div className="hero">
          <h1>TradeSim — psychomotor skills training with an AI coach</h1>
          <p>
            Expensive consumables, live hazards and one instructor for thirty students are the three
            things that cap practice time in vocational education. TradeSim gives every student
            unlimited repetitions on a procedurally-graded virtual job: a real-time coach watches
            <em> method</em>, not just outcome, and scores safety, sequence and efficiency against
            the same rubric an assessor would use.
          </p>
        </div>

        {connError && <div className="banner-err">{connError}</div>}

        <div className="cards" style={{ marginTop: 22 }}>
          {scenarios.map((s) => (
            <div className="card" key={s.id}>
              <div className="trade">{s.trade}</div>
              <h3>{s.title}</h3>
              <div className="blurb">{s.blurb}</div>
              <div className="facts">
                <span>{s.steps.length} graded steps</span>
                <span>par {Math.round(s.parTimeS / 60)} min</span>
              </div>
              <div className="stds">
                {(s.standards || []).map((t) => <span key={t}>{t}</span>)}
              </div>
              <button
                className="btn primary"
                disabled={loading}
                onClick={() => start(s.id)}
                style={{ alignSelf: 'flex-start', marginTop: 4 }}
              >
                <Icon name="target" size={13} /> Start attempt
              </button>
            </div>
          ))}
          {scenarios.length === 0 && !connError && (
            <div className="card"><h3>Loading scenarios…</h3></div>
          )}
        </div>

        <div className="legend">
          <div className="l">
            <h4>Immediate, causal feedback</h4>
            <p>Every action is answered with what happened, why it matters, and what to do next —
              referenced to the standard (NFPA 70E, OSHA 1910.147, NEC, IPC).</p>
          </div>
          <div className="l">
            <h4>Escalating hints</h4>
            <p>Level 1 is an orienting question, level 2 a specific instruction, level 3 a worked
              example. The coach also intervenes when you stall — sooner if your mastery estimate
              is low.</p>
          </div>
          <div className="l">
            <h4>Safety outranks speed</h4>
            <p>A critical breach caps the overall grade no matter how fast you finish. Efficiency
              is 25% of the score; a fast unsafe attempt is a failed attempt.</p>
          </div>
          <div className="l">
            <h4>Exam mode</h4>
            <p>Turn off the interaction rings in the toolbelt to assess recall of procedure rather
              than the ability to find the next glowing hotspot.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
