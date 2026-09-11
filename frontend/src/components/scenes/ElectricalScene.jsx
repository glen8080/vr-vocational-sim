import { Bench, Hotspot, Lights, Pipe, Receptacle, Room, Tag, ToolProp } from './parts'

/* ------------------------------------------------------------ layout */

const PANEL = [-2.3, 1.55, -3.02]
const BAY = [1.75, 0, -2.5]
const BENCH = [3.25, 0, -0.85]

const BREAKERS = [
  { id: 'ckt12', x: -0.165, label: 'CKT-12', tag: 'Lighting' },
  { id: 'ckt14', x: 0.0, label: 'CKT-14', tag: 'Kitchen' },
  { id: 'ckt16', x: 0.165, label: 'CKT-16', tag: 'HVAC' },
]

const CONDUCTORS = [
  { id: 'black_line', color: '#151515', x: -0.095, label: 'Hot feed' },
  { id: 'black_load', color: '#242424', x: -0.032, label: 'Switch leg' },
  { id: 'white_neutral', color: '#ededed', x: 0.032, label: 'Neutral' },
  { id: 'bare_ground', color: '#c98b52', x: 0.095, label: 'Ground' },
]

const TERMINALS = [
  { id: 'load', pos: [0.046, 1.408, 0.052], color: '#f6c344', label: 'LOAD terminal', sub: 'brass — to the luminaire' },
  { id: 'line', pos: [0.046, 1.296, 0.052], color: '#f6c344', label: 'LINE terminal', sub: 'brass — from the panel' },
  { id: 'ground', pos: [-0.046, 1.29, 0.052], color: '#4ade80', label: 'Ground screw', sub: 'green — equipment ground' },
  { id: 'neutral_nut', pos: [-0.052, 1.462, 0.0], color: '#e0a33c', label: 'Neutral pigtail', sub: 'wire nut — not switched' },
]

/* ------------------------------------------------------------ pieces */

function Panel({ f, act, tool, show }) {
  const open = !!f.panel_open
  const off = !!f.breaker_off

  const breakerAction = (id) => (tool === 'lock' ? (f.locked ? 'remove:lockout' : 'apply:lockout') : `toggle:breaker:${id}`)

  return (
    <group position={PANEL}>
      {/* enclosure */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.66, 0.9, 0.14]} />
        <meshStandardMaterial color="#49535f" metalness={0.55} roughness={0.5} />
      </mesh>
      {/* interior */}
      <mesh position={[0, 0, 0.075]}>
        <boxGeometry args={[0.56, 0.8, 0.02]} />
        <meshStandardMaterial color="#0d1219" roughness={0.95} />
      </mesh>
      {/* busbar + feed */}
      <mesh position={[0, -0.3, 0.085]}>
        <boxGeometry args={[0.5, 0.05, 0.02]} />
        <meshStandardMaterial color="#b07a3c" metalness={0.9} roughness={0.3} />
      </mesh>
      <Pipe points={[[0, -0.34, 0.09], [0, -0.55, 0.06], [0, -0.9, 0.03]]} radius={0.012} color="#1a1a1a" metalness={0.2} roughness={0.8} />

      {BREAKERS.map((b) => {
        const isTarget = b.id === 'ckt12'
        const thisOff = isTarget && off
        return (
          <group key={b.id} position={[b.x, -0.02, 0.1]}>
            <mesh castShadow>
              <boxGeometry args={[0.13, 0.32, 0.075]} />
              <meshStandardMaterial color={isTarget ? '#2d3644' : '#232b36'} roughness={0.6} metalness={0.2} />
            </mesh>
            {/* toggle */}
            <mesh position={[0, thisOff ? -0.07 : 0.07, 0.05]} rotation={[thisOff ? -0.28 : 0.28, 0, 0]} castShadow>
              <boxGeometry args={[0.055, 0.11, 0.035]} />
              <meshStandardMaterial color={thisOff ? '#3f8f5f' : '#d13b3b'} roughness={0.5} />
            </mesh>
            {isTarget && f.locked && (
              <group position={[0, 0.02, 0.085]}>
                <mesh castShadow>
                  <boxGeometry args={[0.055, 0.05, 0.018]} />
                  <meshStandardMaterial color="#d13b3b" roughness={0.5} metalness={0.3} />
                </mesh>
                <mesh position={[0, 0.038, 0]}>
                  <torusGeometry args={[0.019, 0.0055, 8, 16, Math.PI]} />
                  <meshStandardMaterial color="#c9d2dd" metalness={0.9} roughness={0.25} />
                </mesh>
              </group>
            )}
            {open && (
              <Hotspot
                position={[0, 0.02, 0.1]}
                label={tool === 'lock' ? (f.locked ? 'Remove lockout/tagout' : 'Apply lockout/tagout') : `${b.label} — ${off && isTarget ? 'OFF' : 'ON'}`}
                sub={tool === 'lock' ? 'lock device' : 'throw the breaker'}
                color={tool === 'lock' ? '#f87171' : isTarget ? '#38bdf8' : '#94a3b8'}
                onSelect={() => act(breakerAction(b.id))}
                visible={show}
                size={0.055}
              />
            )}
            {open && <Tag position={[0, -0.2, 0.11]} text={b.label} color={isTarget ? '#7dd3fc' : '#64748b'} />}
          </group>
        )
      })}

      {/* door */}
      <group position={[-0.33, 0, 0.075]} rotation-y={open ? -2.0 : 0}>
        <mesh position={[0.33, 0, 0]} castShadow>
          <boxGeometry args={[0.66, 0.9, 0.016]} />
          <meshStandardMaterial color="#414b57" metalness={0.5} roughness={0.55} />
        </mesh>
        {/* as-built schedule card */}
        <mesh position={[0.48, 0.24, 0.012]}>
          <planeGeometry args={[0.22, 0.14]} />
          <meshStandardMaterial color="#f4f1e8" roughness={0.9} />
        </mesh>
        <Tag position={[0.48, 0.24, 0.02]} text="CKT-12 LIGHTING" color="#334155" />
        {show && (
          <Hotspot
            position={[0.48, 0.24, 0.05]}
            label="As-built schedule"
            sub="identify the circuit"
            color="#a78bfa"
            size={0.045}
            onSelect={() => act('inspect:schedule')}
          />
        )}
        {show && (
          <Hotspot
            position={[0.08, -0.2, 0.05]}
            label={open ? 'Close panel door' : 'Open panel door'}
            color="#38bdf8"
            size={0.05}
            onSelect={() => act(open ? 'close:panel' : 'open:panel')}
          />
        )}
      </group>

      <Tag position={[0, 0.56, 0.09]} text="120/240V PANEL" color="#94a3b8" />
    </group>
  )
}

function SwitchBay({ f, act, tool, wire, show, toast }) {
  const coverOff = !!f.cover_off
  const out = !!f.switch_out
  const landed = Object.keys(f.wires || {}).length
  const lit = !f.breaker_off
  const wires = f.wires || {}

  const deviceAction = () => {
    if (!coverOff) return 'remove:cover'
    if (!out) return 'remove:switch'
    return 'restore:cover'
  }

  return (
    <group position={BAY} rotation={[0, -0.3, 0]}>
      {/* stud wall */}
      <mesh position={[0, 1.3, -0.08]} receiveShadow castShadow>
        <boxGeometry args={[1.6, 2.6, 0.14]} />
        <meshStandardMaterial color="#cfc6b4" roughness={0.96} />
      </mesh>
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} position={[x, 1.3, 0.005]}>
          <boxGeometry args={[0.1, 2.6, 0.02]} />
          <meshStandardMaterial color="#a89b86" roughness={0.95} />
        </mesh>
      ))}

      {/* device box */}
      <mesh position={[0, 1.35, 0.02]}>
        <boxGeometry args={[0.14, 0.22, 0.09]} />
        <meshStandardMaterial color="#69747f" metalness={0.6} roughness={0.45} />
      </mesh>

      {/* incoming cables */}
      <Pipe points={[[-0.03, 1.22, 0.0], [-0.05, 1.0, -0.01], [-0.04, 0.62, -0.02]]} radius={0.016} color="#2a2a2a" metalness={0.15} roughness={0.85} />

      {/* cover plate */}
      {!coverOff && (
        <mesh position={[0, 1.35, 0.075]} castShadow>
          <boxGeometry args={[0.18, 0.26, 0.01]} />
          <meshStandardMaterial color="#f1ece2" roughness={0.55} />
        </mesh>
      )}

      {/* old switch */}
      {coverOff && !out && (
        <group position={[0, 1.35, 0.045]}>
          <mesh castShadow>
            <boxGeometry args={[0.1, 0.16, 0.05]} />
            <meshStandardMaterial color="#2a2f36" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.04, 0.03]} rotation={[0.3, 0, 0]} castShadow>
            <boxGeometry args={[0.05, 0.07, 0.025]} />
            <meshStandardMaterial color="#f0ece2" roughness={0.6} />
          </mesh>
        </group>
      )}

      {/* new device + terminals */}
      {out && (
        <group position={[0, 1.35, 0.03]}>
          <mesh castShadow>
            <boxGeometry args={[0.1, 0.17, 0.04]} />
            <meshStandardMaterial color="#1f242b" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.035, 0.028]} rotation={[0.32, 0, 0]} castShadow>
            <boxGeometry args={[0.05, 0.075, 0.022]} />
            <meshStandardMaterial color="#f0ece2" roughness={0.6} />
          </mesh>
          {/* yoke */}
          <mesh position={[0, 0, 0.001]}>
            <boxGeometry args={[0.115, 0.185, 0.012]} />
            <meshStandardMaterial color="#b9c2ce" metalness={0.9} roughness={0.3} />
          </mesh>
          {TERMINALS.filter((t) => t.id !== 'neutral_nut').map((t) => (
            <mesh key={t.id} position={[t.pos[0], t.pos[1] - 1.35, 0.028]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.011, 0.011, 0.012, 12]} />
              <meshStandardMaterial color={t.color} metalness={0.85} roughness={0.3} />
            </mesh>
          ))}
          {/* wire nut in the back of the box */}
          <mesh position={[-0.052, 0.112, -0.03]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.016, 0.02, 0.035, 12]} />
            <meshStandardMaterial color="#e0a33c" roughness={0.7} />
          </mesh>
        </group>
      )}

      {/* free conductor ends, once the old device is out */}
      {out && CONDUCTORS.map((c) => {
        const stripped = (f.stripped || []).includes(c.id)
        const done = wires[c.id] !== undefined
        const sx = c.x * 2.1
        return (
          <group key={c.id}>
            <Pipe
              points={[[sx * 0.25, 1.22, 0.0], [sx * 0.8, 1.16, 0.05], [sx, 1.13, 0.1]]}
              radius={0.008}
              color={c.color}
              metalness={0.3}
              roughness={0.7}
              segments={16}
            />
            {stripped && (
              <mesh position={[sx, 1.13, 0.1]}>
                <cylinderGeometry args={[0.008, 0.008, 0.022, 10]} />
                <meshStandardMaterial color={c.id === 'bare_ground' ? '#d9a066' : '#f5c86a'} metalness={0.95} roughness={0.25} />
              </mesh>
            )}
            {show && !done && (
              <Hotspot
                position={[sx, 1.13, 0.115]}
                label={stripped ? `${c.label} — prepared` : `Strip ${c.label}`}
                sub={stripped ? '' : 'select the wire stripper'}
                color={stripped ? '#34d399' : '#fbbf24'}
                size={0.032}
                onSelect={() => {
                  if (tool !== 'stripper') return toast('Select the wire stripper, then click a conductor.')
                  act(`strip:${c.id}`)
                }}
              />
            )}
          </group>
        )
      })}

      {/* terminal targets */}
      {out && TERMINALS.map((t) => (
        <Hotspot
          key={t.id}
          position={t.pos}
          label={t.label}
          sub={wire ? `land the selected conductor here` : t.sub}
          color={wire ? '#38bdf8' : '#64748b'}
          size={0.032}
          visible={show}
          onSelect={() => {
            if (!wire) return toast('Select a conductor in the toolbelt first.')
            act(`connect:${wire}@${t.id}`)
          }}
        />
      ))}

      {/* torque + function test + cover */}
      {show && (
        <Hotspot
          position={[0, 1.35, 0.12]}
          label={
            !coverOff ? (tool === 'tester' ? 'Test for voltage' : 'Remove cover plate')
              : !out ? 'Remove the old switch'
                : 'Reinstall the cover plate'
          }
          sub={
            !coverOff ? (tool === 'tester' ? 'non-contact tester at the box' : 'screwdriver')
              : !out ? 'screwdriver' : 'once all conductors are terminated'
          }
          color={!coverOff && tool === 'tester' ? '#fbbf24' : '#38bdf8'}
          size={0.05}
          onSelect={() => {
            if (!coverOff && tool === 'tester') return act('use:tester@switchbox')
            if (out && landed >= 4 && !f.tightened && tool === 'screwdriver') return act('tighten:terminals')
            act(deviceAction())
          }}
        />
      )}

      {show && out && landed >= 4 && !f.tightened && (
        <Hotspot
          position={[0.0, 1.24, 0.11]}
          label="Torque all terminals"
          sub="screwdriver — to listed value"
          color="#fbbf24"
          size={0.038}
          onSelect={() => {
            if (tool !== 'screwdriver') return toast('Select the screwdriver.')
            act('tighten:terminals')
          }}
        />
      )}

      {show && f.cover_on && f.breaker_on && (
        <Hotspot
          position={[0, 1.4, 0.11]}
          label="Operate the switch"
          sub="functional test"
          color="#a78bfa"
          size={0.045}
          onSelect={() => act('flip:switch')}
        />
      )}

      {/* luminaire */}
      <group position={[0, 2.55, 0.32]}>
        <Pipe points={[[0, 0.55, 0], [0, 0.2, 0]]} radius={0.008} color="#1c1c1c" metalness={0.2} roughness={0.9} segments={8} />
        <mesh position={[0, 0.12, 0]} rotation={[Math.PI, 0, 0]} castShadow>
          <coneGeometry args={[0.17, 0.16, 24, 1, true]} />
          <meshStandardMaterial color="#8d97a4" metalness={0.6} roughness={0.4} side={2} />
        </mesh>
        <mesh position={[0, 0.06, 0]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial
            color={lit ? '#fff6d8' : '#3a4150'}
            emissive={lit ? '#ffd98a' : '#000000'}
            emissiveIntensity={lit ? 1.6 : 0}
            roughness={0.3}
          />
        </mesh>
        {lit && <pointLight position={[0, 0.02, 0]} intensity={6} distance={5} decay={2} color="#ffd89a" />}
      </group>

      <Tag position={[0, 1.62, 0.1]} text="UTILITY LUMINAIRE SWITCH" color="#94a3b8" />
    </group>
  )
}

/* ------------------------------------------------------------ scene */

export default function ElectricalScene({ f, act, tool, wire, show, toast }) {
  return (
    <>
      <Lights />
      <Room />
      <Panel f={f} act={act} tool={tool} show={show} />
      <SwitchBay f={f} act={act} tool={tool} wire={wire} show={show} toast={toast} />

      <Bench position={BENCH} rotation={[0, -0.45, 0]} />

      {/* bench props */}
      <group position={BENCH} rotation={[0, -0.45, 0]}>
        <ToolProp position={[-0.82, 0.96, 0.06]} kind="glasses" />
        <ToolProp position={[-0.44, 0.95, 0.02]} kind="gloves" rotation={[0, 0.5, 0]} />
        <ToolProp position={[0.0, 0.99, 0.08]} kind="tester" rotation={[Math.PI / 2, 0, 0]} />
        <ToolProp position={[0.36, 0.95, -0.02]} kind="screwdriver" rotation={[0, 0.3, 0]} />
        <ToolProp position={[0.66, 0.95, 0.06]} kind="stripper" rotation={[0, -0.4, 0]} />
        <ToolProp position={[0.94, 0.95, 0.0]} kind="lock" />

        {/* known-live source for proving the tester */}
        <group position={[-0.85, 0.9, 0.42]}>
          <mesh castShadow>
            <boxGeometry args={[0.2, 0.14, 0.09]} />
            <meshStandardMaterial color="#4b5563" metalness={0.5} roughness={0.5} />
          </mesh>
          <Receptacle position={[0, 0, 0.048]} />
        </group>

        {show && (
          <>
            <Hotspot position={[-0.82, 1.02, 0.06]} label="Safety glasses" sub="don PPE"
              color={f.ppe_glasses ? '#34d399' : '#38bdf8'} size={0.045}
              onSelect={() => act('equip:glasses')} />
            <Hotspot position={[-0.44, 1.0, 0.02]} label="Insulating gloves" sub="don PPE"
              color={f.ppe_gloves ? '#34d399' : '#38bdf8'} size={0.045}
              onSelect={() => act('equip:gloves')} />
            <Hotspot position={[0.0, 1.06, 0.08]} label="Voltage tester" sub="select instrument"
              color={tool === 'tester' ? '#f6c344' : '#38bdf8'} size={0.045}
              onSelect={() => act('__select_tool:tester')} />
            <Hotspot position={[0.36, 1.0, -0.02]} label="Screwdriver" sub="select instrument"
              color={tool === 'screwdriver' ? '#f6c344' : '#38bdf8'} size={0.045}
              onSelect={() => act('__select_tool:screwdriver')} />
            <Hotspot position={[0.66, 1.0, 0.06]} label="Wire stripper" sub="select instrument"
              color={tool === 'stripper' ? '#f6c344' : '#38bdf8'} size={0.045}
              onSelect={() => act('__select_tool:stripper')} />
            <Hotspot position={[0.94, 1.0, 0.0]} label="Lockout / tagout" sub="select device"
              color={tool === 'lock' ? '#f6c344' : '#38bdf8'} size={0.045}
              onSelect={() => act('__select_tool:lock')} />
            <Hotspot position={[-0.85, 0.9, 0.55]} label="Known-live receptacle" sub="prove the tester here"
              color="#f87171" size={0.05}
              onSelect={() => {
                if (tool !== 'tester') return toast('Select the voltage tester first.')
                act('use:tester@known_source')
              }} />
          </>
        )}

        <Tag position={[0.0, 1.16, 0.08]} text="BENCH" color="#64748b" />
        <Tag position={[-0.85, 1.06, 0.42]} text="KNOWN LIVE" color="#f87171" />
      </group>
    </>
  )
}
