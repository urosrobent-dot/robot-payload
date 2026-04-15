'use client'

import { supabase } from '@/lib/supabase'
import { useState } from 'react'
import EditRobotModal from '@/components/EditRobotModal'
import PayloadChecker from '@/components/PayloadChecker'

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
  image_url?: string | null
}

type PayloadState = {
  mass: string
  j3: string
  x: string
  y: string
  z: string
  ix: string
  iy: string
  iz: string
}

type Props = {
  robot: Robot
  onDeleted: () => void
  onEdit: () => void
  onUpdated: () => void
  isAdmin: boolean
  payloadState: PayloadState
  onPayloadStateChange: (s: PayloadState) => void
}

export default function RobotDetail({ robot, onDeleted, onEdit, onUpdated, isAdmin, payloadState, onPayloadStateChange }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [view, setView] = useState<'specs' | 'checker'>('specs')

  async function handleDelete() {
    setDeleting(true)
    await supabase.from('robots').delete().eq('id', robot.id)
    setDeleting(false)
    onDeleted()
  }

  return (
    <div className="p-8 flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-6">
          {robot.image_url && (
            <img
              src={robot.image_url}
              alt={robot.model}
              className="w-48 h-48 object-contain rounded-xl border border-gray-200 bg-gray-50"
            />
          )}
          <div>
            <h2 className="text-xl font-medium text-gray-900">{robot.manufacturer} {robot.model}</h2>
            <p className="text-sm text-gray-400 mt-1">{robot.axes}-axis robot</p>
          </div>
        </div>

        {isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={() => setView('specs')}
              className={`px-4 py-2 text-sm font-medium rounded-lg border ${view === 'specs' ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              Specifications
            </button>
            <button
              onClick={() => setView('checker')}
              className={`px-4 py-2 text-sm font-medium rounded-lg border ${view === 'checker' ? 'bg-sky-800 text-white border-sky-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              Payload Checker
            </button>
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
            >
              Edit
            </button>
            <button
              onClick={() => setConfirming(true)}
              className="px-4 py-2 text-sm font-medium bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 text-red-600"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Specs view */}
      {view === 'specs' && (
        <>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Basic Specifications</p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'J6 Max Payload', value: robot.max_payload_kg, unit: 'kg' },
                { label: 'Max Reach', value: robot.max_reach_mm, unit: 'mm' },
                { label: 'Repeatability', value: robot.repeatability_mm, unit: 'mm' },
                { label: 'J5 Offset', value: robot.j5_offset_mm, unit: 'mm' },
                { label: 'Axes', value: robot.axes, unit: '' },
              ].map(({ label, value, unit }) => (
                <div key={label} className="bg-white rounded-xl p-4 border border-gray-200">
                  <p className="text-xs text-gray-400 mb-1">{label}</p>
                  <p className="text-xl font-medium text-gray-900">{value ?? '—'} <span className="text-sm text-gray-400">{unit}</span></p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Max Moments</p>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {[
                  { label: 'Axis 4', value: robot.m4_max_nm },
                  { label: 'Axis 5', value: robot.m5_max_nm },
                  { label: 'Axis 6', value: robot.m6_max_nm },
                ].map(({ label, value }, i, arr) => (
                  <div key={label} className={`flex justify-between px-4 py-3 ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className="text-sm font-medium text-gray-900">{value ?? '—'} <span className="text-gray-400">Nm</span></span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Max Inertias</p>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {[
                  { label: 'Axis 4', value: robot.i4_max_kgm2 },
                  { label: 'Axis 5', value: robot.i5_max_kgm2 },
                  { label: 'Axis 6', value: robot.i6_max_kgm2 },
                ].map(({ label, value }, i, arr) => (
                  <div key={label} className={`flex justify-between px-4 py-3 ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className="text-sm font-medium text-gray-900">{value ?? '—'} <span className="text-gray-400">kg·m²</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Payload Checker view */}
      {view === 'checker' && (
        <PayloadChecker
          robot={robot}
          state={payloadState}
          onStateChange={onPayloadStateChange}
        />
      )}

      {/* Delete confirmation */}
      {confirming && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-80 shadow-xl">
            <h3 className="text-base font-medium text-gray-900 mb-2">Delete Robot</h3>
            <p className="text-sm text-gray-500 mb-5">Are you sure you want to delete <span className="font-medium text-gray-900">{robot.manufacturer} {robot.model}</span>? This cannot be undone.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirming(false)}
                className="flex-1 border border-gray-200 text-gray-500 text-sm font-medium py-2 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-500 text-white text-sm font-medium py-2 rounded-lg disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {editing && (
        <EditRobotModal
          robot={robot}
          onClose={() => setEditing(false)}
          onSaved={() => { setEditing(false); onUpdated() }}
        />
      )}
    </div>
  )
}