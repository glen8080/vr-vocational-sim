import { Bench, Hotspot, Lights, Pipe, Room, Tag, ToolProp } from './parts'

const CABINET = [0, 0, -1.9]

const PARTS = [
  { id: 'wall_arm', label: 'Wall arm + flange', pos: [0, 0.5, -2.14] },
  { id: 'j_bend', label: 'J-bend', pos: [0, 0.5, -1.85] },
  { id: 'trap_arm', label: 'Trap arm', pos: [0, 0.52, -1.66] },
]

const CHROME = { color: '#cdd7e2', metalness: 0.92, roughness: 0.22 }
const OLD = { color: '#7f8a7a', metalness: 0.5, roughness: 0.75 }

export default function PlumbingScene({ f, act, tool, show, toast }) {
  const fitted = f.fitted || []
  const removed = !!f.old_removed
  const flowing = !f.supply_closed && f.faucet_open
  const leaking = f.leak_checked && f.leak_free === false

  const fittedHas = (id) => fitted.includes(id)

  return (
    <>
      <Lights />
      <Room />

      <group position={CABINET}>
        {/* counter + cabinet shell (cutaway front) */}
        <mesh position={[0, 0.93, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.9, 0.06, 0.72]} />
          <meshStandardMaterial color="#2f3a49" roughness={0.6} />
        </mesh>
        {[-0.9, 0.9].map((x) => (
          <mesh key={x} position={[x, 0.45, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.05, 0.9, 0.72]} />
            <meshStandardMaterial color="#26303d" roughness={0.8} />
          </mesh>
        ))}
        <mesh position={[0, 0.45, -0.36]} receiveShadow>
          <boxGeometry args={[1.9, 0.9, 0.05]} />
          <meshStandardMaterial color="#202834" roughness={0.9} />
        </mesh>

        {/* basin */}
        <mesh position={[0, 0.84, 0]} castShadow>
          <cylinderGeometry args={[0.24, 0.2, 0.18, 28, 1, true]} />
          <meshStandardMaterial color="#dbe3ec" metalness={0.85} roughness={0.25} side={2} />
        </mesh>
        <mesh position={[0, 0.76, 0]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.2, 28]} />
          <meshStandardMaterial color="#aeb9c6" metalness={0.85} roughness={0.3} />
        </mesh>

        {/* faucet */}
        <Pipe
          points={[[0, 0.96, -0.28], [0, 1.3, -0.28], [0, 1.34, -0.14], [0, 1.2, -0.06]]}
          radius={0.019} {...CHROME} segments={24}
        />
        <mesh position={[0, 1.22, -0.26]} castShadow>
          <boxGeometry args={[0.03, 0.012, 0.12]} />
          <meshStandardMaterial color="#cdd7e2" metalness={0.9} roughness={0.25} />
        </mesh>

        {/* tailpiece */}
        <mesh position={[0, 0.66, 0]} castShadow>
          <cylinderGeometry args={[0.026, 0.026, 0.2, 16]} />
          <meshStandardMaterial {...CHROME} />
        </mesh>

        {/* angle stop + supply riser */}
        <group position={[-0.42, 0.5, -0.3]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.032, 0.032, 0.1, 16]} />
            <meshStandardMaterial {...CHROME} />
          </mesh>
          <mesh position={[0, 0.07, 0.05]} rotation={[0, f.supply_closed ? 0 : 1.2, 0]} castShadow>
            <boxGeometry args={[0.09, 0.014, 0.014]} />
            <meshStandardMaterial color={f.supply_closed ? '#d13b3b' : '#3f8f5f'} roughness={0.5} />
          </mesh>
        </group>
        <Pipe points={[[-0.42, 0.56, -0.3], [-0.42, 0.9, -0.3], [-0.2, 0.95, -0.3], [0, 0.96, -0.28]]} radius={0.012} {...CHROME} segments={24} />

        {/* ---------------- drainage ---------------- */}
        {!removed && (
          <group>
            <Pipe
              points={[[0, 0.58, 0], [0, 0.46, 0], [0, 0.41, 0.04], [0, 0.46, 0.08], [0, 0.5, 0.1], [0, 0.5, -0.3]]}
              radius={0.028} {...OLD} segments={40}
            />
            <mesh position={[0, 0.44, 0.04]}>
              <sphereGeometry args={[0.02, 12, 12]} />
              <meshStandardMaterial color="#4fbf8a" emissive="#2f9e6a" emissiveIntensity={0.6} roughness={0.4} />
            </mesh>
            {show && (
              <Hotspot position={[0, 0.44, 0.04]} label="Corroded joint — leaking" sub="this is the fault"
                color="#f87171" size={0.04} onSelect={() => toast('This is the failed joint you are replacing.')} />
            )}
          </group>
        )}

        {removed && (
          <group>
            {/* wall flange + arm stub */}
            {fittedHas('wall_arm') && (
              <>
                <mesh position={[0, 0.5, -0.33]} rotation-x={Math.PI / 2}>
                  <cylinderGeometry args={[0.045, 0.045, 0.012, 20]} />
                  <meshStandardMaterial {...CHROME} />
                </mesh>
                <Pipe points={[[0, 0.5, -0.33], [0, 0.5, -0.14]]} radius={0.027} {...CHROME} segments={12} />
              </>
            )}
            {/* J-bend */}
            {fittedHas('j_bend') && (
              <Pipe
                points={[[0, 0.58, 0], [0, 0.47, 0], [0, 0.42, 0.04], [0, 0.47, 0.08], [0, 0.53, 0.08]]}
                radius={0.027} {...CHROME} segments={40}
              />
            )}
            {/* trap arm back to the wall */}
            {fittedHas('trap_arm') && (
              <Pipe points={[[0, 0.53, 0.08], [0, 0.52, -0.05], [0, 0.5, -0.33]]} radius={0.027} {...CHROME} segments={30} />
            )}
            {/* slip nuts */}
            {fittedHas('j_bend') && (
              <>
                <mesh position={[0, 0.575, 0]} rotation-x={Math.PI / 2}>
                  <cylinderGeometry args={[0.036, 0.036, 0.028, 16]} />
                  <meshStandardMaterial color="#e6ebf2" metalness={0.8} roughness={0.3} />
                </mesh>
                <mesh position={[0, 0.53, 0.08]} rotation-x={Math.PI / 2}>
                  <cylinderGeometry args={[0.036, 0.036, 0.028, 16]} />
                  <meshStandardMaterial color="#e6ebf2" metalness={0.8} roughness={0.3} />
                </mesh>
              </>
            )}
          </group>
        )}

        {/* water + leak visuals */}
        {flowing && (
          <mesh position={[0, 1.06, -0.06]}>
            <cylinderGeometry args={[0.008, 0.008, 0.28, 8, 1, true]} />
            <meshStandardMaterial color="#8fd3ff" transparent opacity={0.55} roughness={0.1} side={2} />
          </mesh>
        )}
        {leaking && (
          <mesh position={[0.03, 0.44, 0.05]}>
            <sphereGeometry args={[0.016, 10, 10]} />
            <meshStandardMaterial color="#8fd3ff" transparent opacity={0.7} roughness={0.1} />
          </mesh>
        )}

        {/* ---------------- hotspots ---------------- */}
        {show && (
          <>
            <Hotspot position={[-0.42, 0.58, -0.28]} label={f.supply_closed ? 'Open angle stop' : 'Close angle stop'}
              sub="isolate the supply" color={f.supply_closed ? '#34d399' : '#f87171'} size={0.04}
              onSelect={() => act(f.supply_closed ? 'open:supply_valve' : 'close:supply_valve')} />

            <Hotspot position={[0, 1.3, -0.24]} label={f.faucet_open ? 'Close faucet' : 'Open faucet'}
              sub="vents the waste line" color="#38bdf8" size={0.04}
              onSelect={() => act(f.faucet_open ? 'close:faucet' : 'open:faucet')} />

            {!f.bucket_placed && (
              <Hotspot position={[0, 0.28, 0.42]} label="Place bucket" sub="contain trap water"
                color="#fbbf24" size={0.05} onSelect={() => act('place:bucket')} />
            )}
            {f.bucket_placed && show && (
              <Hotspot position={[0, 0.14, 0.42]} label="Remove bucket" sub="after a dry leak test"
                color="#a78bfa" size={0.05} onSelect={() => act('remove:bucket')} />
            )}

            {!removed && (
              <>
                <Hotspot position={[0, 0.575, 0.0]} label="Loosen slip nuts" sub="by hand first"
                  color="#38bdf8" size={0.038} onSelect={() => act('loosen:slip_nuts')} />
                {f.nuts_loosened && (
                  <Hotspot position={[0, 0.46, 0.05]} label="Remove old trap" color="#38bdf8" size={0.045}
                    onSelect={() => act('remove:old_trap')} />
                )}
              </>
            )}

            {removed && (
              <>
                <Hotspot position={[0, 0.62, 0.0]} label="Inspect tailpiece" sub="clean the sealing surface"
                  color={f.inspected ? '#34d399' : '#38bdf8'} size={0.038} onSelect={() => act('inspect:tailpiece')} />

                {PARTS.map((p) => (!fittedHas(p.id) ? (
                  <Hotspot key={p.id} position={p.pos} label={`Dry-fit ${p.label}`}
                    color="#38bdf8" size={0.045} onSelect={() => act(`fit:${p.id}`)} />
                ) : null))}

                {fitted.length >= 3 && !f.aligned && (
                  <Hotspot position={[0, 0.44, 0.05]} label="Check alignment" sub="square + 2–4in seal depth"
                    color="#fbbf24" size={0.045} onSelect={() => act('check:alignment')} />
                )}
                {f.aligned && !f.hand_tight && (
                  <Hotspot position={[0, 0.575, 0.0]} label="Hand-tighten slip nuts"
                    color="#38bdf8" size={0.045} onSelect={() => act('tighten:hand')} />
                )}
                {f.hand_tight && f.wrench_turns < 1 && (
                  <Hotspot position={[0, 0.53, 0.08]} label="Quarter turn with the wrench"
                    sub="select the wrench" color="#fbbf24" size={0.045}
                    onSelect={() => {
                      if (tool !== 'wrench') return toast('Select the wrench in the toolbelt.')
                      act('tighten:wrench')
                    }} />
                )}
                {f.hand_tight && f.wrench_turns >= 1 && (
                  <Hotspot position={[0, 0.53, 0.08]} label="Another turn?" sub="wrench"
                    color="#f87171" size={0.04}
                    onSelect={() => {
                      if (tool !== 'wrench') return toast('Select the wrench.')
                      act('tighten:wrench')
                    }} />
                )}

                {f.wrench_turns >= 1 && f.supply_open && (
                  <Hotspot position={[0, 0.46, 0.14]} label="Leak check" sub="watch both joints under flow"
                    color="#a78bfa" size={0.05} onSelect={() => act('test:leak_check')} />
                )}
              </>
            )}
          </>
        )}

        <Tag position={[0, 1.05, 0]} text="KITCHEN SINK — 1.5in P-TRAP" color="#94a3b8" />
      </group>

      {/* bucket on the floor */}
      {f.bucket_placed && (
        <group position={[0, 0, -1.48]}>
          <ToolProp position={[0, 0, 0]} kind="bucket" scale={1.1} />
        </group>
      )}

      <Bench position={[2.6, 0, -0.6]} rotation={[0, -0.5, 0]} />
      <group position={[2.6, 0, -0.6]} rotation={[0, -0.5, 0]}>
        <ToolProp position={[-0.7, 0.96, 0.05]} kind="glasses" />
        <ToolProp position={[-0.32, 0.95, 0.0]} kind="gloves" rotation={[0, 0.4, 0]} />
        <ToolProp position={[0.15, 0.95, 0.02]} kind="wrench" />
        <ToolProp position={[0.55, 0.95, 0.06]} kind="pipes" />
        {show && (
          <>
            <Hotspot position={[-0.7, 1.01, 0.05]} label="Eye protection" color={f.ppe_glasses ? '#34d399' : '#38bdf8'}
              size={0.045} onSelect={() => act('equip:glasses')} />
            <Hotspot position={[-0.32, 1.0, 0.0]} label="Gloves" color={f.ppe_gloves ? '#34d399' : '#38bdf8'}
              size={0.045} onSelect={() => act('equip:gloves')} />
            <Hotspot position={[0.15, 1.0, 0.02]} label="Wrench" sub="select instrument"
              color={tool === 'wrench' ? '#f6c344' : '#38bdf8'} size={0.045}
              onSelect={() => act('__select_tool:wrench')} />
            <Hotspot position={[0.55, 1.0, 0.06]} label="Replacement trap kit" color="#94a3b8" size={0.05}
              onSelect={() => toast('Use the dry-fit hotspots on the assembly.')} />
          </>
        )}
      </group>
    </>
  )
}
