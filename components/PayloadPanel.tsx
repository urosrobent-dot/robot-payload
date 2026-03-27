'use client'

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

type Robot = {
  id: string
  manufacturer: string
  model: string
  max_payload_kg: number
  max_reach_mm: number
  axes: number
}

type Props = {
  robot: Robot
}

export default function PayloadPanel({ robot }: Props) {
  const [mass, setMass] = useState(0)
  const [lx, setLx] = useState(0)
  const [ly, setLy] = useState(0)
  const [lz, setLz] = useState(0)

  const massPercent = Math.round((mass / robot.max_payload_kg) * 100)
  const distance = Math.round(Math.sqrt(lx ** 2 + ly ** 2 + lz ** 2))
  const torque = Math.round((mass * distance) / 1000 * 10) / 10

  const axisData = [
    { name: 'A1', obremenitev: Math.round(massPercent * 0.9) },
    { name: 'A2', obremenitev: Math.round(massPercent * 1.0) },
    { name: 'A3', obremenitev: Math.round(massPercent * 0.85) },
    { name: 'A4', obremenitev: Math.round(massPercent * 0.7) },
    { name: 'A5', obremenitev: Math.round(massPercent * 0.75) },
    { name: 'A6', obremenitev: Math.round(massPercent * 0.6) },
  ]

  const status = massPercent > 100 ? 'Prekoračeno' : massPercent > 80 ? 'Opozorilo' : 'OK'
  const statusColor = massPercent > 100 ? 'text-red-500' : massPercent > 80 ? 'text-orange-500' : 'text-green-600'
  const statusBg = massPercent > 100 ? 'bg-red-50' : massPercent > 80 ? 'bg-orange-50' : 'bg-green-50'

  return (
    <div className="p-8 flex flex-col gap-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium text-gray-900">{robot.manufacturer} {robot.model}</h2>
          <p className="text-sm text-gray-400 mt-1">{robot.axes}-osni robot · max. {robot.max_payload_kg} kg · doseg {robot.max_reach_mm} mm</p>
        </div>
        <span className={`text-sm font-medium px-3 py-1 rounded-full ${statusBg} ${statusColor}`}>
          {status}
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-xs text-gray-400 mb-1">Masa bremena</p>
          <p className="text-2xl font-medium text-gray-900">{mass} <span className="text-sm text-gray-400">kg</span></p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-xs text-gray-400 mb-1">Izkoriščenost</p>
          <p className={`text-2xl font-medium ${statusColor}`}>{massPercent} <span className="text-sm">%</span></p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-xs text-gray-400 mb-1">Navor</p>
          <p className="text-2xl font-medium text-gray-900">{torque} <span className="text-sm text-gray-400">Nm</span></p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Input */}
        <div className="bg-white rounded-xl p-5 border border-gray-200 flex flex-col gap-4">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Podatki bremena</p>
          {[
            { label: 'Masa', unit: 'kg', val: mass, set: setMass, max: robot.max_payload_kg * 1.5 },
            { label: 'Offset Lx', unit: 'mm', val: lx, set: setLx, max: 500 },
            { label: 'Offset Ly', unit: 'mm', val: ly, set: setLy, max: 500 },
            { label: 'Offset Lz', unit: 'mm', val: lz, set: setLz, max: 500 },
          ].map(({ label, unit, val, set, max }) => (
            <div key={label}>
              <div className="flex justify-between mb-1">
                <label className="text-xs text-gray-500">{label}</label>
                <span className="text-xs font-medium text-gray-900">{val} {unit}</span>
              </div>
              <input
                type="range"
                min={0}
                max={max}
                step={label === 'Masa' ? 0.1 : 1}
                value={val}
                onChange={e => set(parseFloat(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-4">Obremenitev osi (%)</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={axisData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 120]} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(val) => [`${val}%`, 'Obremenitev']} />
              <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="4 4" />
              <Bar dataKey="obremenitev" fill="#ea580c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}