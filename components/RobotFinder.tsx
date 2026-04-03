'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

type Robot = {
  id: string
  manufacturer: string
  model: string
  max_payload_kg: number
  max_reach_mm: number
  axes: number
  j5_offset_mm: number
  repeatability_mm: number
  m4_max_nm: number
  m5_max_nm: number
  m6_max_nm: number
  i4_max_kgm2: number
  i5_max_kgm2: number
  i6_max_kgm2: number
}

type Result = {
  robot: Robot
  payloadPct: number
  m4pct: number
  m5pct: number
  m6pct: number
  i4pct: number
  i5pct: number
  i6pct: number
  maxPct: number
  approved: 'OK' | 'WARN' | 'NO'
}

function statusColor(pct: number) {
  if (pct > 100) return 'text-red-500'
  if (pct > 90) return 'text-orange-500'
  return 'text-green-600'
}

function statusBadge(approved: string) {
  if (approved === 'OK') return 'bg-green-50 border-green-200 text-green-700'
  if (approved === 'WARN') return 'bg-orange-50 border-orange-200 text-orange-600'
  return 'bg-red-50 border-red-200 text-red-600'
}

export default function RobotFinder() {
  const [mass, setMass] = useState('')
  const [x, setX] = useState('')
  const [y, setY] = useState('')
  const [z, setZ] = useState('')
  const [ix, setIx] = useState('')
  const [iy, setIy] = useState('')
  const [iz, setIz] = useState('')
  const [minReach, setMinReach] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [searched, setSearched] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleFind() {
    setLoading(true)
    setSearched(false)

    const m = parseFloat(mass) || 0
    const cx = (parseFloat(x) || 0) / 1000
    const cy = (parseFloat(y) || 0) / 1000
    const cz = (parseFloat(z) || 0) / 1000
    const iix = parseFloat(ix) || 0
    const iiy = parseFloat(iy) || 0
    const iiz = parseFloat(iz) || 0
    const reach = parseFloat(minReach) || 0
    const g = 9.81

    const { data } = await supabase.from('robots').select('*').order('manufacturer')
    const robots: Robot[] = data || []

    const results: Result[] = []

    for (const robot of robots) {
      if (robot.max_payload_kg < m) continue
      if (reach > 0 && robot.max_reach_mm < reach) continue

      const j5 = (robot.j5_offset_mm || 0) / 1000

      const m4 = m * g * Math.sqrt(cx ** 2 + cy ** 2 + (cz + j5) ** 2)
      const m5 = m * g * Math.sqrt(cx ** 2 + cy ** 2 + (cz + j5) ** 2)
      const m6 = m * g * Math.sqrt(cx ** 2 + cy ** 2)

      const i4 = iiy + m * (cy ** 2 + (cz + j5) ** 2)
      const i5 = iix + m * (cx ** 2 + (cz + j5) ** 2)
      const i6 = iiz + m * (cx ** 2 + cy ** 2)

      const payloadPct = (m / robot.max_payload_kg) * 100
      const m4pct = robot.m4_max_nm ? (m4 / robot.m4_max_nm) * 100 : 0
      const m5pct = robot.m5_max_nm ? (m5 / robot.m5_max_nm) * 100 : 0
      const m6pct = robot.m6_max_nm ? (m6 / robot.m6_max_nm) * 100 : 0
      const i4pct = robot.i4_max_kgm2 ? (i4 / robot.i4_max_kgm2) * 100 : 0
      const i5pct = robot.i5_max_kgm2 ? (i5 / robot.i5_max_kgm2) * 100 : 0
      const i6pct = robot.i6_max_kgm2 ? (i6 / robot.i6_max_kgm2) * 100 : 0

      const maxPct = Math.max(payloadPct, m4pct, m5pct, m6pct, i4pct, i5pct, i6pct)

      const approved = maxPct > 100 ? 'NO' : maxPct > 90 ? 'WARN' : 'OK'

      results.push({ robot, payloadPct, m4pct, m5pct, m6pct, i4pct, i5pct, i6pct, maxPct, approved })
    }

    // Sort: OK first
        const filtered = results.filter(r => r.approved === 'OK')
        filtered.sort((a, b) => a.maxPct - b.maxPct)
        setResults(filtered)
    setSearched(true)
    setLoading(false)
  }

  const Field = ({ label, unit, value, onChange }: {
    label: string, unit: string, value: string, onChange: (v: string) => void
  }) => (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">{label} <span className="text-gray-400">({unit})</span></label>
      <input
        type="number"
        step="any"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900"
        placeholder="0"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )

  return (
    <div className="p-8 flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-medium text-gray-900">Robot Finder</h2>
        <p className="text-sm text-gray-400 mt-1">Enter your payload requirements and find suitable robots</p>
      </div>

      {/* Input */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="grid grid-cols-4 gap-4 mb-4">
          <Field label="Payload Mass" unit="kg" value={mass} onChange={setMass} />
          <Field label="Min. Reach" unit="mm" value={minReach} onChange={setMinReach} />
        </div>

        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Center of Gravity (mm)</p>
        <div className="grid grid-cols-4 gap-4 mb-4">
        <Field label="X" unit="mm" value={x} onChange={setX} />
        <Field label="Y" unit="mm" value={y} onChange={setY} />
        <Field label="Z" unit="mm" value={z} onChange={setZ} />
        </div>

        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Payload Inertia (kg·m²)</p>
        <div className="grid grid-cols-4 gap-4 mb-5">
          <Field label="Ix" unit="kg·m²" value={ix} onChange={setIx} />
          <Field label="Iy" unit="kg·m²" value={iy} onChange={setIy} />
          <Field label="Iz" unit="kg·m²" value={iz} onChange={setIz} />
        </div>

        <button
          onClick={handleFind}
          disabled={loading || !mass}
          className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-all"
        >
          {loading ? 'Searching...' : 'Find Robots'}
        </button>
      </div>

      {/* Results */}
      {searched && (
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">
            {results.length === 0 ? 'No robots found' : `${results.length} robots found`}
          </p>

          {results.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <td className="px-4 py-3 text-xs text-gray-400 uppercase tracking-wider">Robot</td>
                    <td className="px-4 py-3 text-xs text-gray-400 uppercase tracking-wider text-right">Payload</td>
                    <td className="px-4 py-3 text-xs text-gray-400 uppercase tracking-wider text-right">Reach</td>
                    <td className="px-4 py-3 text-xs text-gray-400 uppercase tracking-wider text-right">J4 Mom.</td>
                    <td className="px-4 py-3 text-xs text-gray-400 uppercase tracking-wider text-right">J5 Mom.</td>
                    <td className="px-4 py-3 text-xs text-gray-400 uppercase tracking-wider text-right">J6 Mom.</td>
                    <td className="px-4 py-3 text-xs text-gray-400 uppercase tracking-wider text-right">J4 In.</td>
                    <td className="px-4 py-3 text-xs text-gray-400 uppercase tracking-wider text-right">J5 In.</td>
                    <td className="px-4 py-3 text-xs text-gray-400 uppercase tracking-wider text-right">J6 In.</td>
                    <td className="px-4 py-3 text-xs text-gray-400 uppercase tracking-wider text-right">Result</td>
                  </tr>
                </thead>
                <tbody>
                  {results.map(({ robot, payloadPct, m4pct, m5pct, m6pct, i4pct, i5pct, i6pct, approved }) => (
                    <tr key={robot.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{robot.model}</div>
                        <div className="text-xs text-gray-400">{robot.manufacturer}</div>
                      </td>
                      <td className={`px-4 py-3 text-right font-medium ${statusColor(payloadPct)}`}>
                        {payloadPct.toFixed(0)}%
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500">{robot.max_reach_mm} mm</td>
                      <td className={`px-4 py-3 text-right font-medium ${statusColor(m4pct)}`}>{m4pct.toFixed(0)}%</td>
                      <td className={`px-4 py-3 text-right font-medium ${statusColor(m5pct)}`}>{m5pct.toFixed(0)}%</td>
                      <td className={`px-4 py-3 text-right font-medium ${statusColor(m6pct)}`}>{m6pct.toFixed(0)}%</td>
                      <td className={`px-4 py-3 text-right font-medium ${statusColor(i4pct)}`}>{i4pct.toFixed(0)}%</td>
                      <td className={`px-4 py-3 text-right font-medium ${statusColor(i5pct)}`}>{i5pct.toFixed(0)}%</td>
                      <td className={`px-4 py-3 text-right font-medium ${statusColor(i6pct)}`}>{i6pct.toFixed(0)}%</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full border ${statusBadge(approved)}`}>
                          {approved}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}