'use client'

import { useState } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts'

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

type Props = {
  robot: Robot
}

type Results = {
  payloadPct: number
  actualJ5Offset: number
  m4: number; m5: number; m6: number
  m4pct: number; m5pct: number; m6pct: number
  i4: number; i5: number; i6: number
  i4pct: number; i5pct: number; i6pct: number
  cl4pct: number; cl5pct: number; cl6pct: number
  payloadStatus: 'OK' | 'WARN' | 'OVER'
  momentStatus: 'OK' | 'WARN' | 'OVER'
  inertiaStatus: 'OK' | 'WARN' | 'OVER'
  clStatus: 'OK' | 'WARN' | 'OVER'
  approved: 'OK' | 'WARN' | 'NO'
}

function status(pct: number): 'OK' | 'WARN' | 'OVER' {
  if (pct > 100) return 'OVER'
  if (pct > 90) return 'WARN'
  return 'OK'
}

function worstStatus(...statuses: ('OK' | 'WARN' | 'OVER')[]): 'OK' | 'WARN' | 'OVER' {
  if (statuses.includes('OVER')) return 'OVER'
  if (statuses.includes('WARN')) return 'WARN'
  return 'OK'
}

function statusColor(s: string) {
  if (s === 'OVER') return 'text-red-600'
  if (s === 'WARN') return 'text-orange-500'
  return 'text-green-600'
}

function statusBg(s: string) {
  if (s === 'OVER') return 'bg-red-50 border-red-200 text-red-600'
  if (s === 'WARN') return 'bg-orange-50 border-orange-200 text-orange-500'
  return 'bg-green-50 border-green-200 text-green-600'
}

function Field({ label, unit, value, onChange }: {
  label: string, unit: string, value: string, onChange: (v: string) => void
}) {
  return (
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
}

function LoadDiagram({ title, momentActual, momentMax, inertiaActual, inertiaMax }: {
  title: string
  momentActual: number
  momentMax: number
  inertiaActual: number
  inertiaMax: number
}) {
  const warnM = Math.round(momentMax * 0.9 * 1000) / 1000
  const warnI = Math.round(inertiaMax * 0.9 * 1000) / 1000
  const axisMaxM = Math.round(momentMax * 1.2 * 1000) / 1000
  const axisMaxI = Math.round(inertiaMax * 1.2 * 1000) / 1000

  const specPoint = [{ x: 0, y: 0 }]
  const actualPoint = [{ x: Math.round(inertiaActual * 1000) / 1000, y: Math.round(momentActual * 1000) / 1000 }]
  const specDot = [{ x: inertiaMax * 0.02, y: momentMax * 0.95 }]

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">{title}</p>
      <ResponsiveContainer width="100%" height={200}>
        <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

          {/* OK zone — green */}
          <ReferenceArea x1={0} x2={warnI} y1={0} y2={warnM} fill="#dcfce7" fillOpacity={0.5} />

          {/* WARN zone — yellow */}
          <ReferenceArea x1={0} x2={inertiaMax} y1={0} y2={momentMax} fill="#fef9c3" fillOpacity={0.5} />

          {/* OVER zone — red (full background) */}
          <ReferenceArea x1={0} x2={axisMaxI} y1={0} y2={axisMaxM} fill="#fee2e2" fillOpacity={0.4} />

          {/* Max lines */}
          <ReferenceLine x={inertiaMax} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1} />
          <ReferenceLine y={momentMax} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1} />

          {/* Warn lines */}
          {/* Warn lines */}
          <ReferenceLine x={warnI} stroke="#eab308" strokeDasharray="4 4" strokeWidth={1.5} />
          <ReferenceLine y={warnM} stroke="#eab308" strokeDasharray="4 4" strokeWidth={1.5} />

          <XAxis
            type="number"
            dataKey="x"
            domain={[0, axisMaxI]}
            tickCount={5}
            tick={{ fontSize: 10 }}
            label={{ value: 'kg·m²', position: 'insideBottom', offset: -10, fontSize: 10 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            domain={[0, axisMaxM]}
            tickCount={5}
            tick={{ fontSize: 10 }}
            label={{ value: 'Nm', angle: -90, position: 'insideLeft', fontSize: 10 }}
          />
          <Tooltip
            formatter={(val, name) => [
              typeof val === 'number' ? val.toFixed(3) : val,
              name === 'x' ? 'Inertia' : 'Moment'
            ]}
          />

          {/* Spec point — green square */}
          <Scatter
            data={specDot}
            fill="#16a34a"
            shape={(props: any) => {
              const { cx, cy } = props
              return <rect x={cx - 6} y={cy - 6} width={12} height={12} fill="#16a34a" />
            }}
          />

          {/* Actual point — red circle */}
          <Scatter
            data={actualPoint}
            fill="#ef4444"
            shape={(props: any) => {
              const { cx, cy } = props
              return <circle cx={cx} cy={cy} r={6} fill="#ef4444" />
            }}
          />
        </ScatterChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex gap-4 mt-2 justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-green-600 rounded-sm" />
          <span className="text-xs text-gray-400">Specification</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <span className="text-xs text-gray-400">Actual value</span>
        </div>
      </div>
    </div>
  )
}

export default function PayloadChecker({ robot }: Props) {
  const [mass, setMass] = useState('')
  const [j3, setJ3] = useState('')
  const [x, setX] = useState('')
  const [y, setY] = useState('')
  const [z, setZ] = useState('')
  const [ix, setIx] = useState('')
  const [iy, setIy] = useState('')
  const [iz, setIz] = useState('')
  const [results, setResults] = useState<Results | null>(null)

  function calculate() {
    const m = parseFloat(mass) || 0
    const cx = parseFloat(x) || 0
    const cy = parseFloat(y) || 0
    const cz = parseFloat(z) || 0
    const iix = parseFloat(ix) || 0
    const iiy = parseFloat(iy) || 0
    const iiz = parseFloat(iz) || 0
    const j5 = (robot.j5_offset_mm || 0) / 1000
    const g = 9.81

    // Actual J5 offset
    const actualJ5Offset = Math.sqrt(cx ** 2 + cy ** 2 + (cz + j5) ** 2)

    const m4 = m * g * Math.sqrt(cx ** 2 + cy ** 2 + (cz + j5) ** 2)
    const m5 = m * g * Math.sqrt(cx ** 2 + cy ** 2 + (cz + j5) ** 2)
    const m6 = m * g * Math.sqrt(cx ** 2 + cy ** 2)

    const i4 = iiy + m * (cx ** 2 + cy ** 2 + (cz + j5) ** 2)
    const i5 = iix + m * (cx ** 2 + cy ** 2 + (cz + j5) ** 2)
    const i6 = iiz + m * (cx ** 2 + cy ** 2)

    // Percentages
    const payloadPct = (m / robot.max_payload_kg) * 100
    const m4pct = (m4 / robot.m4_max_nm) * 100
    const m5pct = (m5 / robot.m5_max_nm) * 100
    const m6pct = (m6 / robot.m6_max_nm) * 100
    const i4pct = (i4 / robot.i4_max_kgm2) * 100
    const i5pct = (i5 / robot.i5_max_kgm2) * 100
    const i6pct = (i6 / robot.i6_max_kgm2) * 100

    // Combined load
    const cl4pct = (m4 / robot.m4_max_nm + i4 / robot.i4_max_kgm2) / 2 * 100
    const cl5pct = (m5 / robot.m5_max_nm + i5 / robot.i5_max_kgm2) / 2 * 100
    const cl6pct = (m6 / robot.m6_max_nm + i6 / robot.i6_max_kgm2) / 2 * 100

    const payloadStatus = status(payloadPct)
    const momentStatus = worstStatus(status(m4pct), status(m5pct), status(m6pct))
    const inertiaStatus = worstStatus(status(i4pct), status(i5pct), status(i6pct))
    const clStatus = worstStatus(status(cl4pct), status(cl5pct), status(cl6pct))

    const overall = worstStatus(payloadStatus, momentStatus, inertiaStatus, clStatus)
    const approved = overall === 'OVER' ? 'NO' : overall === 'WARN' ? 'WARN' : 'OK'

    setResults({
      payloadPct, actualJ5Offset,
      m4, m5, m6, m4pct, m5pct, m6pct,
      i4, i5, i6, i4pct, i5pct, i6pct,
      cl4pct, cl5pct, cl6pct,
      payloadStatus, momentStatus, inertiaStatus, clStatus,
      approved
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Payload Input Data</p>

          <Field label="J6 Payload Mass" unit="kg" value={mass} onChange={setMass} />
          <Field label="J3 Arm Load" unit="kg" value={j3} onChange={setJ3} />

          <p className="text-xs text-gray-400 uppercase tracking-wider pt-2">Center of Gravity (m)</p>
          <div className="grid grid-cols-3 gap-3">
            <Field label="X" unit="m" value={x} onChange={setX} />
            <Field label="Y" unit="m" value={y} onChange={setY} />
            <Field label="Z" unit="m" value={z} onChange={setZ} />
          </div>

          <p className="text-xs text-gray-400 uppercase tracking-wider pt-2">Payload Inertia (kg·m²)</p>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Ix" unit="kg·m²" value={ix} onChange={setIx} />
            <Field label="Iy" unit="kg·m²" value={iy} onChange={setIy} />
            <Field label="Iz" unit="kg·m²" value={iz} onChange={setIz} />
          </div>

          <button
            onClick={calculate}
            className="w-full bg-sky-800 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-sky-950 mt-2"
          >
            Calculate
          </button>
        </div>

        {/* Results */}
        <div className="flex flex-col gap-4">
          {results ? (
            <>
              {/* Summary */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Summary Results</p>
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'Payload', s: results.payloadStatus },
                    { label: 'Moments', s: results.momentStatus },
                    { label: 'Combined Loads', s: results.clStatus },
                    { label: 'Inertias', s: results.inertiaStatus },
                  ].map(({ label, s }) => (
                    <div key={label} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                      <span className="text-sm text-gray-600">{label}</span>
                      <span className={`text-sm font-medium ${statusColor(s)}`}>{s}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-medium text-gray-900">Approved</span>
                    <span className={`text-sm font-medium px-3 py-1 rounded-full border ${statusBg(results.approved === 'NO' ? 'OVER' : results.approved)}`}>
                      {results.approved}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detailed results */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Detailed Results</p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 border-b border-gray-100">
                      <td className="pb-2">Parameter</td>
                      <td className="pb-2 text-right">Spec</td>
                      <td className="pb-2 text-right">Actual</td>
                      <td className="pb-2 text-right">%</td>
                      <td className="pb-2 text-right">Status</td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-50">
                      <td className="py-1.5 text-gray-600">J6 Payload</td>
                      <td className="py-1.5 text-right text-gray-500">{robot.max_payload_kg} kg</td>
                      <td className="py-1.5 text-right text-gray-900">{parseFloat(mass) || 0} kg</td>
                      <td className="py-1.5 text-right text-gray-900">{results.payloadPct.toFixed(1)}</td>
                      <td className={`py-1.5 text-right font-medium ${statusColor(results.payloadStatus)}`}>{results.payloadStatus}</td>
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="py-1.5 text-gray-600">Actual J5 Offset</td>
                      <td className="py-1.5 text-right text-gray-500">—</td>
                      <td className="py-1.5 text-right text-gray-900">{results.actualJ5Offset.toFixed(3)} m</td>
                      <td className="py-1.5 text-right text-gray-500">—</td>
                      <td className="py-1.5 text-right text-gray-500">—</td>
                    </tr>
                    {[
                      { label: 'Axis 4 Moment', spec: robot.m4_max_nm, actual: results.m4, pct: results.m4pct, unit: 'Nm' },
                      { label: 'Axis 5 Moment', spec: robot.m5_max_nm, actual: results.m5, pct: results.m5pct, unit: 'Nm' },
                      { label: 'Axis 6 Moment', spec: robot.m6_max_nm, actual: results.m6, pct: results.m6pct, unit: 'Nm' },
                      { label: 'Axis 4 Inertia', spec: robot.i4_max_kgm2, actual: results.i4, pct: results.i4pct, unit: 'kg·m²' },
                      { label: 'Axis 5 Inertia', spec: robot.i5_max_kgm2, actual: results.i5, pct: results.i5pct, unit: 'kg·m²' },
                      { label: 'Axis 6 Inertia', spec: robot.i6_max_kgm2, actual: results.i6, pct: results.i6pct, unit: 'kg·m²' },
                      { label: 'Combined Load A4', spec: 100, actual: results.cl4pct, pct: results.cl4pct, unit: '%' },
                      { label: 'Combined Load A5', spec: 100, actual: results.cl5pct, pct: results.cl5pct, unit: '%' },
                      { label: 'Combined Load A6', spec: 100, actual: results.cl6pct, pct: results.cl6pct, unit: '%' },
                    ].map(({ label, spec, actual, pct, unit }) => (
                      <tr key={label} className="border-b border-gray-50">
                        <td className="py-1.5 text-gray-600">{label}</td>
                        <td className="py-1.5 text-right text-gray-500">{spec} {unit}</td>
                        <td className="py-1.5 text-right text-gray-900">{actual.toFixed(3)}</td>
                        <td className="py-1.5 text-right text-gray-900">{pct.toFixed(1)}</td>
                        <td className={`py-1.5 text-right font-medium ${statusColor(status(pct))}`}>{status(pct)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-8 flex items-center justify-center h-full">
              <p className="text-sm text-gray-400">Enter payload data and click Calculate</p>
            </div>
          )}
        </div>
      </div>

      {/* Load Diagrams */}
      {results && (
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Load Diagrams</p>
          <div className="grid grid-cols-3 gap-4">
            <LoadDiagram
              title="Axis 4 (J4)"
              momentActual={results.m4}
              momentMax={robot.m4_max_nm}
              inertiaActual={results.i4}
              inertiaMax={robot.i4_max_kgm2}
            />
            <LoadDiagram
              title="Axis 5 (J5)"
              momentActual={results.m5}
              momentMax={robot.m5_max_nm}
              inertiaActual={results.i5}
              inertiaMax={robot.i5_max_kgm2}
            />
            <LoadDiagram
              title="Axis 6 (J6)"
              momentActual={results.m6}
              momentMax={robot.m6_max_nm}
              inertiaActual={results.i6}
              inertiaMax={robot.i6_max_kgm2}
            />
          </div>
        </div>
      )}
    </div>
  )
}