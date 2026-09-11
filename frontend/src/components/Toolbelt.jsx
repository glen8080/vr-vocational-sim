import { useStore } from '../store'
import { getGroups, TOOL_HINTS } from '../toolbelt'
import Icon from './Icon'

export default function Toolbelt() {
  const state = useStore((s) => s.state)
  const tool = useStore((s) => s.selectedTool)
  const wire = useStore((s) => s.selectedWire)
  const setTool = useStore((s) => s.setTool)
  const setWire = useStore((s) => s.setWire)
  const act = useStore((s) => s.act)
  const show = useStore((s) => s.showAffordances)
  const toggleAffordances = useStore((s) => s.toggleAffordances)

  if (!state) return null
  const groups = getGroups(state.scenario.id, state.flags)

  return (
    <div className="toolbelt">
      {groups.map((g) => (
        <div className="tb-group" key={g.id}>
          <div className="gl">{g.label}</div>
          <div className="tb-items">
            {g.items.map((it) => {
              const selected = it.tool ? tool === it.tool : it.wire ? wire === it.wire : false
              const cls = `tool ${selected ? 'sel' : ''} ${it.done && !it.tool && !it.wire ? 'done' : ''}`
              return (
                <button
                  key={it.id}
                  className={cls}
                  title={it.tool ? TOOL_HINTS[it.tool] : it.label}
                  onClick={() => {
                    if (it.tool) setTool(it.tool)
                    else if (it.wire) setWire(it.wire)
                    else act(it.action)
                  }}
                >
                  {it.done && !it.wire && <span className="ck">✓</span>}
                  {it.wire
                    ? <span className="wire-swatch" style={{ background: it.swatch, border: '1px solid rgba(255,255,255,.25)', marginTop: 6, marginBottom: 4 }} />
                    : <Icon name={it.icon} size={26} className="ic" />}
                  <span className="nm">{it.label}</span>
                  {it.wire && <span className="nm" style={{ color: 'var(--dim)', fontWeight: 500 }}>{it.note2}</span>}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      <div className="tb-group" style={{ marginLeft: 'auto' }}>
        <div className="gl">View</div>
        <div className="tb-items">
          <button className="tool" onClick={() => toggleAffordances()} title="Hide interaction rings for assessment">
            <Icon name={show ? 'eye' : 'target'} size={26} className="ic" />
            <span className="nm">{show ? 'Rings on' : 'Exam mode'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
