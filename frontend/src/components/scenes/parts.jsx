import { useState } from 'react'
import { Billboard, ContactShadows, Grid, Html } from '@react-three/drei'
import * as THREE from 'three'

/** ---------------------------------------------------------------- shared */

export function Lights() {
  return (
    <>
      <ambientLight intensity={0.55} color="#cfe3ff" />
      <hemisphereLight args={['#8fb6e0', '#1a2230', 0.5]} />
      <directionalLight
        position={[4, 7, 5]} intensity={1.5} color="#ffffff"
        castShadow shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-9} shadow-camera-right={9}
        shadow-camera-top={9} shadow-camera-bottom={-9}
        shadow-bias={-0.0004}
      />
      <pointLight position={[-2, 2.2, 2]} intensity={12} distance={10} decay={2} color="#9fd0ff" />
      <pointLight position={[3, 2.0, -0.5]} intensity={10} distance={9} decay={2} color="#ffd7a8" />
    </>
  )
}

export function Room() {
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow position-y={0}>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial color="#141c28" roughness={0.92} metalness={0.05} />
      </mesh>
      <Grid
        position={[0, 0.002, 0]}
        args={[24, 24]}
        cellSize={0.5} cellThickness={0.6} cellColor="#1e2b3c"
        sectionSize={2} sectionThickness={1.1} sectionColor="#2b4258"
        fadeDistance={20} fadeStrength={1.4} followCamera={false} infiniteGrid
      />
      <mesh position={[0, 2, -3.2]} receiveShadow>
        <boxGeometry args={[16, 4, 0.16]} />
        <meshStandardMaterial color="#1b2534" roughness={0.95} />
      </mesh>
      <mesh position={[-5.2, 2, 0.6]} rotation-y={Math.PI / 2} receiveShadow>
        <boxGeometry args={[9, 4, 0.16]} />
        <meshStandardMaterial color="#18212e" roughness={0.95} />
      </mesh>
      <ContactShadows position={[0, 0.012, 0]} opacity={0.5} scale={16} blur={2.4} far={5} resolution={1024} color="#000000" />
    </group>
  )
}

export function Bench({ position = [2.1, 0, -0.6], rotation = [0, -0.35, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.08, 1.0]} />
        <meshStandardMaterial color="#7a5230" roughness={0.75} />
      </mesh>
      {[[-1.08, -0.42], [1.08, -0.42], [-1.08, 0.42], [1.08, 0.42]].map(([x, z]) => (
        <mesh key={`${x}|${z}`} position={[x, 0.44, z]} castShadow>
          <boxGeometry args={[0.08, 0.88, 0.08]} />
          <meshStandardMaterial color="#2b3342" roughness={0.5} metalness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[2.2, 0.05, 0.85]} />
        <meshStandardMaterial color="#3a4453" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.55, -0.45]} castShadow>
        <boxGeometry args={[2.4, 0.9, 0.05]} />
        <meshStandardMaterial color="#232c3a" roughness={0.9} />
      </mesh>
    </group>
  )
}

/** Tube along a polyline — conduit, pipework and cable. */
export function Pipe({
  points, radius = 0.03, color = '#b9c6d6',
  metalness = 0.85, roughness = 0.35, segments = 48,
}) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)))
  const geo = new THREE.TubeGeometry(curve, segments, radius, 12, false)
  return (
    <mesh geometry={geo} castShadow>
      <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
    </mesh>
  )
}

export function Receptacle({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <boxGeometry args={[0.14, 0.14, 0.02]} />
        <meshStandardMaterial color="#e8e4da" roughness={0.6} />
      </mesh>
      <mesh position={[-0.022, 0.012, 0.014]}>
        <boxGeometry args={[0.018, 0.03, 0.006]} />
        <meshStandardMaterial color="#1b1b1b" roughness={0.9} />
      </mesh>
      <mesh position={[0.022, 0.012, 0.014]}>
        <boxGeometry args={[0.018, 0.03, 0.006]} />
        <meshStandardMaterial color="#1b1b1b" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.028, 0.013]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.012, 0.012, 0.006, 16]} />
        <meshStandardMaterial color="#1b1b1b" roughness={0.9} />
      </mesh>
    </group>
  )
}

/**
 * Clickable affordance. Hidden in exam mode so assessment measures recall of
 * procedure rather than the ability to hunt for glowing rings.
 */
export function Hotspot({
  position, label, sub, color = '#38bdf8', size = 0.075,
  onSelect, visible = true, ringOnly = false,
}) {
  const [hover, setHover] = useState(false)
  if (!visible) return null

  const over = (e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = 'pointer' }
  const out = (e) => { e.stopPropagation(); setHover(false); document.body.style.cursor = 'auto' }
  const click = (e) => { e.stopPropagation(); document.body.style.cursor = 'auto'; onSelect?.() }

  return (
    <group position={position}>
      <Billboard>
        <mesh onPointerOver={over} onPointerOut={out} onClick={click}>
          <ringGeometry args={[size * (hover ? 1.15 : 0.85), size * (hover ? 1.8 : 1.35), 32]} />
          <meshBasicMaterial color={color} transparent opacity={hover ? 1 : 0.6} side={THREE.DoubleSide} depthTest={false} renderOrder={999} />
        </mesh>
        {!ringOnly && (
          <mesh onPointerOver={over} onPointerOut={out} onClick={click}>
            <circleGeometry args={[size * 0.38, 20]} />
            <meshBasicMaterial color={color} transparent opacity={hover ? 0.95 : 0.48} depthTest={false} renderOrder={999} />
          </mesh>
        )}
      </Billboard>
      {hover && (
        <Html center distanceFactor={6} zIndexRange={[50, 0]} style={{ pointerEvents: 'none' }}>
          <div className="hotspot-label">
            {label}
            {sub && <span className="sub">{sub}</span>}
          </div>
        </Html>
      )}
    </group>
  )
}

/** Static annotation rendered as DOM (avoids fetching a remote webfont). */
export function Tag({ position, text, color = '#8ea3bd' }) {
  return (
    <Html position={position} center distanceFactor={7} style={{ pointerEvents: 'none' }}>
      <div className="tag3d" style={{ color }}>{text}</div>
    </Html>
  )
}

/** A tool resting on the bench — stylised but readable at a glance. */
export function ToolProp({ position, kind, rotation = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {kind === 'glasses' && (
        <group>
          <mesh castShadow>
            <torusGeometry args={[0.035, 0.007, 8, 20]} />
            <meshStandardMaterial color="#7fe3ff" transparent opacity={0.75} metalness={0.2} roughness={0.15} />
          </mesh>
          <mesh position={[0.075, 0, 0]} castShadow>
            <torusGeometry args={[0.035, 0.007, 8, 20]} />
            <meshStandardMaterial color="#7fe3ff" transparent opacity={0.75} metalness={0.2} roughness={0.15} />
          </mesh>
          <mesh position={[0.037, 0, 0]}>
            <boxGeometry args={[0.03, 0.006, 0.006]} />
            <meshStandardMaterial color="#2b3a4a" roughness={0.5} />
          </mesh>
        </group>
      )}

      {kind === 'gloves' && (
        <group>
          <mesh rotation={[0, 0, 0.22]} castShadow>
            <boxGeometry args={[0.13, 0.05, 0.075]} />
            <meshStandardMaterial color="#1f2b3a" roughness={0.85} />
          </mesh>
          <mesh position={[0.082, 0.012, 0]} rotation={[0, 0, 0.22]} castShadow>
            <boxGeometry args={[0.055, 0.032, 0.062]} />
            <meshStandardMaterial color="#26384c" roughness={0.85} />
          </mesh>
        </group>
      )}

      {kind === 'tester' && (
        <group>
          <mesh castShadow>
            <boxGeometry args={[0.048, 0.13, 0.022]} />
            <meshStandardMaterial color="#f2c14e" metalness={0.3} roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.085, 0]} castShadow>
            <boxGeometry args={[0.012, 0.05, 0.012]} />
            <meshStandardMaterial color="#c9d3e0" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.032, 0.012]}>
            <boxGeometry args={[0.032, 0.022, 0.004]} />
            <meshStandardMaterial color="#0b1a12" roughness={0.2} emissive="#22c55e" emissiveIntensity={0.5} />
          </mesh>
        </group>
      )}

      {kind === 'screwdriver' && (
        <group rotation={[0, 0, Math.PI / 2]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.017, 0.017, 0.09, 14]} />
            <meshStandardMaterial color="#e0653a" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.088, 0]} castShadow>
            <cylinderGeometry args={[0.005, 0.005, 0.09, 10]} />
            <meshStandardMaterial color="#c9d3e0" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>
      )}

      {kind === 'stripper' && (
        <group rotation={[0, 0, Math.PI / 2]}>
          <mesh castShadow rotation={[0.18, 0, 0]}>
            <boxGeometry args={[0.014, 0.11, 0.02]} />
            <meshStandardMaterial color="#8f2f2f" roughness={0.5} metalness={0.5} />
          </mesh>
          <mesh castShadow rotation={[-0.18, 0, 0]}>
            <boxGeometry args={[0.014, 0.11, 0.02]} />
            <meshStandardMaterial color="#2f3d4f" roughness={0.5} metalness={0.6} />
          </mesh>
        </group>
      )}

      {kind === 'lock' && (
        <group>
          <mesh position={[0, 0.022, 0]} castShadow>
            <boxGeometry args={[0.06, 0.055, 0.02]} />
            <meshStandardMaterial color="#d13b3b" roughness={0.55} metalness={0.3} />
          </mesh>
          <mesh position={[0, 0.062, 0]}>
            <torusGeometry args={[0.021, 0.006, 8, 18, Math.PI]} />
            <meshStandardMaterial color="#b9c2ce" metalness={0.9} roughness={0.25} />
          </mesh>
        </group>
      )}

      {kind === 'wrench' && (
        <group rotation={[0, 0, 0.4]}>
          <mesh castShadow>
            <boxGeometry args={[0.018, 0.16, 0.008]} />
            <meshStandardMaterial color="#b6c0cd" metalness={0.85} roughness={0.28} />
          </mesh>
          <mesh position={[0, 0.088, 0]} castShadow>
            <cylinderGeometry args={[0.026, 0.026, 0.008, 6]} />
            <meshStandardMaterial color="#b6c0cd" metalness={0.85} roughness={0.28} />
          </mesh>
        </group>
      )}

      {kind === 'bucket' && (
        <group>
          <mesh castShadow position={[0, 0.055, 0]}>
            <cylinderGeometry args={[0.085, 0.065, 0.11, 20, 1, true]} />
            <meshStandardMaterial color="#e0a33c" roughness={0.6} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0.004, 0]}>
            <cylinderGeometry args={[0.065, 0.065, 0.008, 20]} />
            <meshStandardMaterial color="#c98f2e" roughness={0.6} />
          </mesh>
        </group>
      )}

      {kind === 'pipes' && (
        <group>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[i * 0.05 - 0.05, 0.016 + i * 0.028, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.016, 0.016, 0.19, 14]} />
              <meshStandardMaterial color="#c98b52" metalness={0.85} roughness={0.3} />
            </mesh>
          ))}
        </group>
      )}

      {kind === 'none' && null}
    </group>
  )
}
