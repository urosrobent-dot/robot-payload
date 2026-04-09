'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts'

type Robot = {
  max_payload_kg: number
  m5_max_nm: number
  m6_max_nm: number
  i5_max_kgm2: number
  i6_max_kgm2: number
  j5_offset_mm: number
}

type Props = {
  robot: Robot
  lx: number
  ly: number
  lz: number
  mass: number
}

function getMasses(maxPayload: number): number[] {
  let step: number
  if (maxPayload <= 10) step = 1
  else if (maxPayload <= 20) step = 2
  else if (maxPayload <= 50) step = 5
  else if (maxPayload <= 80) step = 10
  else if (maxPayload <= 200) step = 20
  else if (maxPayload <= 500) step = 50
  else step = 100

  const r = []
  for (let m = step; m <= maxPayload + 0.1; m += step) r.push(Math.round(m))
  return r
}

export default function PayloadDiagram({ robot, lx, ly, lz, mass }: Props) {
  const g = 9.81
  const a = (robot.j5_offset_mm || 0) / 1000
  const M45 = robot.m5_max_nm
  const J45 = robot.i5_max_kgm2
  const M6 = robot.m6_max_nm
  const J6 = robot.i6_max_kgm2

  const masses = getMasses(robot.max_payload_kg)
  const colors = ['#E24B4A', '#D85A30', '#BA7517', '#8B6914', '#639922', '#185FA5', '#1D9E75', '#7F77DD', '#5DCAA5', '#D4537E', '#0F6E56', '#3C3489', '#A32D2D', '#888780']

function getCurve(m: number) {
  const Lmax = Math.min(M45 / (m * g), Math.sqrt(J45 / m))
  const rmax = Math.min(M6 / (m * g), Math.sqrt(J6 / m))
  const points: { r: number, z: number }[] = []
  const N = 100

  for (let i = 0; i <= N; i++) {
    const r = (i / N) * rmax
    const inner = Lmax * Lmax - r * r
    if (inner < 0) break
    const z = Math.sqrt(inner) - a
    if (z < 0) break
    points.push({ r: Math.round(r * 1000), z: Math.round(z * 1000) })
  }

  // Vertical drop — rahlo povečujemo r za vsako točko
  if (points.length > 0) {
    const lastR = points[points.length - 1].r
    const lastZ = points[points.length - 1].z
    const dropSteps = 15
    for (let i = 1; i <= dropSteps; i++) {
      points.push({ 
        r: lastR + i * 0.01,  // minimalen offset
        z: Math.round(lastZ * (1 - i / dropSteps))
      })
    }
    points.push({ r: lastR + 0.16, z: 0 })
  }

  return points
}

  const curves = masses.map((m, i) => ({
    mass: m,
    points: getCurve(m),
    color: colors[i % colors.length]
  }))

  // Each curve has its own r values — merge all unique r values
  const allR = new Set<number>()
  curves.forEach(c => c.points.forEach(p => allR.add(p.r)))
  const sortedR = Array.from(allR).sort((a, b) => a - b)

  // For each r, find z for each curve using linear interpolation
  const chartData = sortedR.map(rVal => {
    const row: Record<string, number | undefined> = { r: rVal }
    curves.forEach(c => {
      const idx = c.points.findIndex(p => p.r >= rVal)
      if (idx === -1) return
      if (idx === 0) { row[`m${c.mass}`] = c.points[0].z; return }
      const p1 = c.points[idx - 1]
      const p2 = c.points[idx]
      if (p1.r === p2.r) {
        // Vertical segment — take lower z
        row[`m${c.mass}`] = Math.min(p1.z, p2.z)
      } else {
        const t = (rVal - p1.r) / (p2.r - p1.r)
        row[`m${c.mass}`] = Math.round(p1.z + t * (p2.z - p1.z))
      }
    })
    return row
  })

  const allPts = curves.flatMap(c => c.points)
  const maxR = allPts.length > 0 ? Math.ceil(Math.max(...allPts.map(p => p.r)) / 50) * 50 : 300
  const maxZ = allPts.length > 0 ? Math.ceil(Math.max(...allPts.map(p => p.z)) / 50) * 50 : 400

  const currentR = Math.round(Math.sqrt(lx ** 2 + ly ** 2))
  const currentZ = Math.round(lz)
  const currentMass = mass > 0 ? mass : null

  let isOk = false
  if (currentMass) {
    const Lmax = Math.min(M45 / (currentMass * g), Math.sqrt(J45 / currentMass))
    const rmax = Math.min(M6 / (currentMass * g), Math.sqrt(J6 / currentMass))
    const rM = currentR / 1000
    const inner = Lmax * Lmax - rM * rM
    const zLimit = inner > 0 ? (Math.sqrt(inner) - a) * 1000 : 0
    isOk = currentR <= rmax * 1000 && currentZ <= zLimit && currentZ >= 0
  }

let cogBetween = ''
let cogKg: number | null = null
if (currentMass) {
  const rM = currentR / 1000
  const zM = currentZ / 1000

  const limits = masses.map(m => {
    const Lmax = Math.min(M45 / (m * g), Math.sqrt(J45 / m))
    const rmax = Math.min(M6 / (m * g), Math.sqrt(J6 / m))
    const inner = Lmax * Lmax - rM * rM
    const zLimit = inner > 0 && rM <= rmax ? Math.sqrt(inner) - a : -1
    return { m, zLimit }
  })

  const inside = limits.filter(l => l.zLimit > 0 && zM <= l.zLimit)
  const outside = limits.filter(l => l.zLimit < 0 || zM > l.zLimit)

  if (inside.length === masses.length) {
    const smallest = limits[0]
    cogBetween = `≤ ${masses[0]} kg`
    cogKg = masses[0]
  } else if (inside.length === 0) {
    cogBetween = `> ${masses[masses.length - 1]} kg`
    cogKg = null
  } else {
    const maxInside = inside.reduce((a, b) => a.m > b.m ? a : b)
    const minOutside = outside.reduce((a, b) => a.m < b.m ? a : b)

    // Interpolacija
    const z1 = maxInside.zLimit  // z limit pri maxInside masi
    const z2 = minOutside.zLimit === -1 ? 0 : minOutside.zLimit  // z limit pri minOutside masi
    const m1 = maxInside.m
    const m2 = minOutside.m

    if (z1 !== z2) {
      const t = (zM - z1) / (z2 - z1)
      cogKg = Math.round((m1 + t * (m2 - m1)) * 10) / 10
    } else {
      cogKg = m1
    }

    cogBetween = `~ ${cogKg} kg (between ${maxInside.m} kg and ${minOutside.m} kg)`
  }
}

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-400 uppercase tracking-wider">Load Diagram</p>
        {currentMass && (
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
            isOk ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-600'
          }`}>
            CoG {isOk ? 'within limits' : 'exceeds limits'} — {currentMass} kg
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, bottom: 30, left: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="r"
            type="number"
            domain={[0, maxR]}
            label={{ value: 'X, Y (mm)', position: 'insideBottom', offset: -15, fontSize: 11 }}
            tick={{ fontSize: 10 }}
          />
          <YAxis
            domain={[0, maxZ]}
            label={{ value: 'Z (mm)', angle: -90, position: 'insideLeft', offset: 15, fontSize: 11 }}
            tick={{ fontSize: 10 }}
          />
          <Tooltip
            formatter={(val, name) => [`${val} mm`, String(name).replace('m', '') + ' kg']}
            labelFormatter={(l) => `X,Y: ${l} mm`}
            itemSorter={(item) => parseFloat(String(item.dataKey).replace('m', ''))}
          />
{curves.map((c, i) => (
  <Line
    key={c.mass}
    type="linear"
    dataKey={`m${c.mass}`}
    stroke={c.color}
    dot={false}
    strokeWidth={currentMass && Math.abs(c.mass - currentMass) < 0.1 ? 3 : 1.5}
    name={`m${c.mass}`}
    connectNulls={false}
    label={(props: any) => {
      const { points } = props
      if (!points || points.length === 0) return null
      // Poišči prvo veljavno točko (r=0, z=max)
      const firstValid = points.find((p: any) => p.value !== undefined && p.value !== null)
      if (!firstValid) return null
      return (
        <text
          x={firstValid.x + 4}
          y={firstValid.y - 4}
          fill={c.color}
          fontSize={10}
          fontWeight="500"
        >
          {`${c.mass}kg`}
        </text>
      )
    }}
  />
))}
{currentMass && (
  <ReferenceDot
    x={currentR}
    y={currentZ}
    r={6}
    fill={isOk ? '#639922' : '#E24B4A'}
    stroke="white"
    strokeWidth={1.5}
label={{ value: 'CoG', position: 'top', fontSize: 10, fill: isOk ? '#639922' : '#E24B4A' }}
  />
)}
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-3 flex gap-6 text-xs">
  {currentMass && (
    <>
      <div>
        <span className="text-gray-400">CoG position: </span>
        <span className="font-medium text-gray-700">X,Y = {currentR} mm &nbsp;|&nbsp; Z = {currentZ} mm</span>
      </div>
      <div>
        <span className="text-gray-400">Payload: </span>
        <span className={`font-medium ${isOk ? 'text-green-600' : 'text-red-500'}`}>{currentMass} kg — {isOk ? 'within limits' : 'exceeds limits'}</span>
{cogBetween && (
  <div>
    <span className="text-gray-400">CoG equivalent mass: </span>
    <span className="font-medium text-gray-700">{cogBetween}</span>
  </div>
)}
      </div>
    </>
  )}
  {!currentMass && <p className="text-gray-400">CoG point must be inside the curve for the selected payload mass.</p>}
</div>
    </div>
  )
}