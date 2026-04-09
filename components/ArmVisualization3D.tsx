'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Line, Text } from '@react-three/drei'
import * as THREE from 'three'

type Props = {
  lx: number
  ly: number
  lz: number
  j5OffsetMm: number
  mass: number
  ix: number
  iy: number
  iz: number
}

function Scene({ lx, ly, lz, j5OffsetMm, mass, ix, iy, iz }: Props) {
  const scale = 0.005

  const lxS = lx * scale
  const lyS = ly * scale
  const lzS = lz * scale
  const j5S = j5OffsetMm * scale

  // Flange is at origin (0,0,0)
  // CoG is at (lx, lz, -ly) in Three.js coords (Y=up, Z=toward viewer)
  const cofg: [number, number, number] = [lxS, lzS, -lyS]

  // Inertia ellipsoid radii
  const maxR = 0.4
  const minR = 0.05
  const erx = Math.max(Math.min(Math.sqrt(ix / Math.max(mass, 0.1)) * 2, maxR), minR)
  const ery = Math.max(Math.min(Math.sqrt(iy / Math.max(mass, 0.1)) * 2, maxR), minR)
  const erz = Math.max(Math.min(Math.sqrt(iz / Math.max(mass, 0.1)) * 2, maxR), minR)

  const dist = Math.sqrt(lxS ** 2 + lyS ** 2 + (lzS + j5S) ** 2)
  const maxDist = 0.5 * scale * 1000
  const pct = (dist / maxDist) * 100
  const cofgColor = pct > 100 ? '#E24B4A' : pct > 90 ? '#BA7517' : '#639922'

  // Axis arrow helper
  function Axis({ dir, color, label }: { dir: [number, number, number], color: string, label: string }) {
    const end = dir.map((v) => v * 0.25) as [number, number, number]
    const labelPos = dir.map((v) => v * 0.3) as [number, number, number]
    return (
      <>
        <Line points={[[0, 0, 0], end]} color={color} lineWidth={2} />
        <mesh position={end}>
          <coneGeometry args={[0.008, 0.03, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
        <Text position={labelPos} fontSize={0.04} color={color} anchorX="center" anchorY="middle">
          {label}
        </Text>
      </>
    )
  }

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[2, 3, 2]} intensity={0.6} />

      {/* Coordinate axes */}
      <Axis dir={[1, 0, 0]} color="#E24B4A" label="+X" />
      <Axis dir={[0, 1, 0]} color="#378ADD" label="+Z" />
      <Axis dir={[0, 0, 1]} color="#1D9E75" label="+Y" />

      {/* Dashed box outline around CoG area */}
      <Line
        points={[
          [0, 0, 0], [lxS, 0, 0],
          [lxS, 0, 0], [lxS, lzS, 0],
          [lxS, lzS, 0], [0, lzS, 0],
          [0, lzS, 0], [0, 0, 0],
        ]}
        color="#D3D1C7"
        lineWidth={1}
        dashed
        dashScale={20}
        dashSize={0.5}
        gapSize={0.3}
      />
      <Line
        points={[
          [0, 0, -lyS], [lxS, 0, -lyS],
          [lxS, 0, -lyS], [lxS, lzS, -lyS],
          [lxS, lzS, -lyS], [0, lzS, -lyS],
          [0, lzS, -lyS], [0, 0, -lyS],
        ]}
        color="#D3D1C7"
        lineWidth={1}
        dashed
        dashScale={20}
        dashSize={0.5}
        gapSize={0.3}
      />
      <Line
        points={[
          [0, 0, 0], [0, 0, -lyS],
          [lxS, 0, 0], [lxS, 0, -lyS],
          [lxS, lzS, 0], [lxS, lzS, -lyS],
          [0, lzS, 0], [0, lzS, -lyS],
        ]}
        color="#D3D1C7"
        lineWidth={1}
        dashed
        dashScale={20}
        dashSize={0.5}
        gapSize={0.3}
      />

      {/* Lx, Ly, Lz dimension lines */}
      <Line points={[[0, 0, 0], [lxS, 0, 0]]} color="#E24B4A" lineWidth={1.5} />
      <Line points={[[0, 0, 0], [0, 0, -lyS]]} color="#1D9E75" lineWidth={1.5} />
      <Line points={[[0, 0, 0], [0, lzS, 0]]} color="#378ADD" lineWidth={1.5} />

      {/* Labels */}
      <Text position={[lxS / 2, -0.04, 0]} fontSize={0.035} color="#E24B4A" anchorX="center">
        Lx: {lx}mm
      </Text>
      <Text position={[0, -0.04, -lyS / 2]} fontSize={0.035} color="#1D9E75" anchorX="center">
        Ly: {ly}mm
      </Text>
      <Text position={[-0.06, lzS / 2, 0]} fontSize={0.035} color="#378ADD" anchorX="center">
        Lz: {lz}mm
      </Text>

      {/* Line from origin to CoG */}
      <Line points={[[0, 0, 0], cofg]} color={cofgColor} lineWidth={1.5} dashed dashScale={20} dashSize={0.5} gapSize={0.3} />

      {/* Flange at origin */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.015, 32]} />
        <meshStandardMaterial color="#888780" />
      </mesh>
      <mesh position={[0, 0.015, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.02, 32]} />
        <meshStandardMaterial color="#5F5E5A" />
      </mesh>
      <Text position={[0.1, 0.02, 0]} fontSize={0.035} color="#5F5E5A" anchorX="left">
        Flange
      </Text>

      {/* CoG sphere */}
      <mesh position={cofg}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial color={cofgColor} />
      </mesh>
      <Text position={[cofg[0] + 0.04, cofg[1] + 0.04, cofg[2]]} fontSize={0.035} color={cofgColor} anchorX="left">
        CoG
      </Text>
{/* Inertia ellipsoid */}
      <mesh position={cofg} scale={[erx, ery, erz]}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial color="#639922" transparent opacity={0.15} wireframe={false} />
      </mesh>
      <mesh position={cofg} scale={[erx, ery, erz]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshBasicMaterial color="#639922" wireframe transparent opacity={0.3} />
      </mesh>
     <OrbitControls enablePan={true} minDistance={0.3} maxDistance={3} />
    </>
  )
}

export default function ArmVisualization3D({ lx, ly, lz, j5OffsetMm, mass, ix, iy, iz }: Props) {
  const actualJ5 = Math.sqrt((lx / 1000) ** 2 + (ly / 1000) ** 2 + ((lz + j5OffsetMm) / 1000) ** 2)
  const pct = (actualJ5 / 0.5) * 100
  const s = pct > 100 ? 'over' : pct > 90 ? 'warn' : 'ok'
  const label = s === 'ok' ? 'OK' : s === 'warn' ? 'WARN' : 'OVER'
  const cls = s === 'ok' ? 'bg-green-50 border-green-200 text-green-700' : s === 'warn' ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-red-50 border-red-200 text-red-600'

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">CoG Visualization</p>
      <div style={{ height: '320px' }}>
       <Canvas camera={{ position: [0.6, 0.5, 0.8], fov: 45 }}>
          <Scene lx={lx} ly={ly} lz={lz} j5OffsetMm={j5OffsetMm} mass={mass} ix={ix} iy={iy} iz={iz} />
        </Canvas>
      </div>
      <div className="mt-2">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${cls}`}>
          Actual J5 offset: {(actualJ5 * 1000).toFixed(0)}mm — {label}
        </span>
        <span className="text-xs text-gray-400 ml-3">Drag to rotate</span>
      </div>
    </div>
  )
}