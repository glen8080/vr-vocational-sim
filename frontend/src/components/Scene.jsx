import { useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import ElectricalScene from './scenes/ElectricalScene'
import PlumbingScene from './scenes/PlumbingScene'
import { useStore } from '../store'
import { Bench, Lights, Room } from './scenes/parts'

export const PRESETS = {
  'electrical-switch': {
    Overview: { pos: [0.6, 3.0, 5.6], target: [0.6, 1.3, -1.6] },
    Panel: { pos: [-1.7, 1.85, -0.4], target: [-2.3, 1.55, -3.0] },
    'Switch box': { pos: [2.35, 1.7, -0.4], target: [1.75, 1.35, -2.5] },
    Bench: { pos: [3.9, 2.4, 2.0], target: [3.25, 0.95, -0.85] },
  },
  'plumbing-ptrap': {
    Overview: { pos: [3.0, 2.2, 3.4], target: [0.1, 0.8, -1.7] },
    'Sink top': { pos: [0.5, 1.6, 0.7], target: [0, 0.95, -1.9] },
    'Under sink': { pos: [0.6, 0.68, -0.55], target: [0, 0.5, -1.9] },
    Bench: { pos: [3.2, 2.0, 1.3], target: [2.6, 0.95, -0.6] },
  },
}


function CameraRig({ preset, goal }) {
  const { camera } = useThree()
  const controls = useRef()
  const anim = useRef(true)
  const goalPos = useRef(new THREE.Vector3())
  const goalTgt = useRef(new THREE.Vector3())

  useEffect(() => { anim.current = true }, [preset])

  useFrame((_, dt) => {
    if (!anim.current || !controls.current) return
    const k = 1 - Math.pow(0.0015, Math.min(dt, 0.05))
    camera.position.lerp(goalPos.current, k)
    controls.current.target.lerp(goalTgt.current, k)
    controls.current.update()
    if (camera.position.distanceTo(goalPos.current) < 0.03) anim.current = false
  })

  goalPos.current.set(...goal.pos)
  goalTgt.current.set(...goal.target)

  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      minDistance={0.8}
      maxDistance={9}
      minPolarAngle={0.15}
      maxPolarAngle={Math.PI / 2.05}
      onStart={() => { anim.current = false }}
    />
  )
}

export default function Scene() {
  const state = useStore((s) => s.state)
  const act = useStore((s) => s.act)
  const toast = useStore((s) => s.toast)
  const tool = useStore((s) => s.selectedTool)
  const wire = useStore((s) => s.selectedWire)
  const show = useStore((s) => s.showAffordances)
  const preset = useStore((s) => s.cameraPreset)
  const setCamera = useStore((s) => s.setCamera)
  const alarm = useStore((s) => s.alarm)

  const id = state?.scenario?.id
  const f = state?.flags || {}
  const views = PRESETS[id] || PRESETS['electrical-switch']

  return (
    <div className="canvas-wrap">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true }}
        camera={{ fov: 48, position: [1.6, 3.4, 6.2], near: 0.05, far: 60 }}
        onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping }}
      >
        <color attach="background" args={['#080d15']} />
        <fog attach="fog" args={['#080d15', 9, 22]} />
        {id === 'plumbing-ptrap' ? (
          <PlumbingScene f={f} act={act} tool={tool} show={show} toast={toast} />
        ) : (
          <ElectricalScene f={f} act={act} tool={tool} wire={wire} show={show} toast={toast} />
        )}
        <CameraRig preset={preset} goal={views[preset] || views.Overview} />
      </Canvas>

      <div className="canvas-overlay">
        {alarm > 0 && <div className="alarm" key={alarm} />}

        <div className="cam-bar">
          {Object.keys(views).map((v) => (
            <button
              key={v}
              className={`btn tiny ${preset === v ? 'primary' : ''}`}
              onClick={() => setCamera(v)}
            >
              {v}
            </button>
          ))}
        </div>

        {toast && <div className="hint-banner"><b>{toast}</b></div>}
        {!toast && (
          <div className="hint-banner">
            <b>Drag</b> to orbit · <b>Scroll</b> to zoom · click a glowing ring to act
          </div>
        )}
      </div>
    </div>
  )
}
