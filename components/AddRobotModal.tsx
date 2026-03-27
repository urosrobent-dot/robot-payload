'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

type Props = {
  onClose: () => void
  onAdded: () => void
}

export default function AddRobotModal({ onClose, onAdded }: Props) {
  const [form, setForm] = useState({
    manufacturer: '',
    model: '',
    max_payload_kg: '',
    max_reach_mm: '',
    axes: '6',
  })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!form.manufacturer || !form.model || !form.max_payload_kg || !form.max_reach_mm) return
    setSaving(true)
    await supabase.from('robots').insert({
      manufacturer: form.manufacturer,
      model: form.model,
      max_payload_kg: parseFloat(form.max_payload_kg),
      max_reach_mm: parseFloat(form.max_reach_mm),
      axes: parseInt(form.axes),
    })
    setSaving(false)
    onAdded()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-96 shadow-xl">
        <h2 className="text-base font-medium text-gray-900 mb-4">Dodaj robota</h2>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Proizvajalec</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 text-gray-900"
              placeholder="npr. KUKA, ABB, Fanuc"
              value={form.manufacturer}
              onChange={e => setForm({ ...form, manufacturer: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Model</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 text-gray-900"
              placeholder="npr. KR 8 R1620"
              value={form.model}
              onChange={e => setForm({ ...form, model: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Max. payload (kg)</label>
              <input
                type="number"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900"
                placeholder="npr. 8"
                value={form.max_payload_kg}
                onChange={e => setForm({ ...form, max_payload_kg: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Max. doseg (mm)</label>
              <input
                type="number"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900"
                placeholder="npr. 1620"
                value={form.max_reach_mm}
                onChange={e => setForm({ ...form, max_reach_mm: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Število osi</label>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900"
              value={form.axes}
              onChange={e => setForm({ ...form, axes: e.target.value })}
            >
              <option value="4">4</option>
              <option value="6">6</option>
              <option value="7">7</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-500 text-sm font-medium py-2 rounded-lg hover:bg-gray-50"
          >
            Prekliči
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-orange-600 text-white text-sm font-medium py-2 rounded-lg disabled:opacity-50"
          >
            {saving ? 'Shranjujem...' : 'Shrani'}
          </button>
        </div>
      </div>
    </div>
  )
}