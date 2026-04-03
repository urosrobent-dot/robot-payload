'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

type Props = {
  onClose: () => void
  onAdded: () => void
}

type FieldProps = {
  label: string
  unit?: string
  placeholder?: string
  value: string
  onChange: (val: string) => void
}

function Field({ label, unit, placeholder, value, onChange }: FieldProps) {
  return (
    <div>
      <label className="text-xs text-gray-500 mb-1 block">
        {label}{unit && <span className="text-gray-400 ml-1">({unit})</span>}
      </label>
      <input
        type="number"
        step="any"
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900"
        placeholder={placeholder || '0'}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

export default function AddRobotModal({ onClose, onAdded }: Props) {
  const [form, setForm] = useState({
    manufacturer: '',
    model: '',
    max_payload_kg: '',
    max_reach_mm: '',
    axes: '6',
    j5_offset_mm: '',
    repeatability_mm: '',
    m4_max_nm: '',
    m5_max_nm: '',
    m6_max_nm: '',
    i4_max_kgm2: '',
    i5_max_kgm2: '',
    i6_max_kgm2: '',
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))
  const num = (val: string) => val === '' ? null : parseFloat(val)

async function handleSave() {
    const newErrors: string[] = []
    if (!form.manufacturer) newErrors.push('Manufacturer is required')
    if (!form.model) newErrors.push('Model is required')
    if (!form.max_payload_kg) newErrors.push('J6 Max Payload is required')
    if (!form.max_reach_mm) newErrors.push('Max Reach is required')
    if (!form.j5_offset_mm) newErrors.push('J5 Offset is required')
    if (!form.m4_max_nm) newErrors.push('Axis 4 Max Moment is required')
    if (!form.m5_max_nm) newErrors.push('Axis 5 Max Moment is required')
    if (!form.m6_max_nm) newErrors.push('Axis 6 Max Moment is required')
    if (!form.i4_max_kgm2) newErrors.push('Axis 4 Max Inertia is required')
    if (!form.i5_max_kgm2) newErrors.push('Axis 5 Max Inertia is required')
    if (!form.i6_max_kgm2) newErrors.push('Axis 6 Max Inertia is required')

    if (newErrors.length > 0) {
      setErrors(newErrors)
      return
    }

    setSaving(true)
const { data, error } = await (supabase.from('robots') as any).insert({
      manufacturer: form.manufacturer,
      model: form.model,
      max_payload_kg: num(form.max_payload_kg),
      max_reach_mm: num(form.max_reach_mm),
      axes: parseInt(form.axes),
      j5_offset_mm: num(form.j5_offset_mm),
      repeatability_mm: num(form.repeatability_mm),
      m4_max_nm: num(form.m4_max_nm),
      m5_max_nm: num(form.m5_max_nm),
      m6_max_nm: num(form.m6_max_nm),
      i4_max_kgm2: num(form.i4_max_kgm2),
      i5_max_kgm2: num(form.i5_max_kgm2),
      i6_max_kgm2: num(form.i6_max_kgm2),
    })
    console.log('data:', data)
    console.log('error:', error)
    setSaving(false)
    onAdded()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[560px] max-h-[90vh] overflow-y-auto shadow-xl">
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-5">
            <p className="text-xs font-medium text-red-600 mb-1">Please fix the following errors:</p>
            <ul className="list-disc list-inside">
              {errors.map((e, i) => (
                <li key={i} className="text-xs text-red-500">{e}</li>
              ))}
            </ul>
          </div>
)}

        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Basic Information</p>
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Manufacturer</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900"
              placeholder="e.g. KUKA, ABB, Fanuc"
              value={form.manufacturer}
              onChange={e => set('manufacturer', e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Model</label>
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900"
              placeholder="e.g. CR-15iA"
              value={form.model}
              onChange={e => set('model', e.target.value)}
            />
          </div>
          <Field label="J6 Max Payload" unit="kg" placeholder="e.g. 15" value={form.max_payload_kg} onChange={v => set('max_payload_kg', v)} />
          <Field label="Max Reach" unit="mm" placeholder="e.g. 1620" value={form.max_reach_mm} onChange={v => set('max_reach_mm', v)} />
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Number of Axes</label>
            <select
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900"
              value={form.axes}
              onChange={e => set('axes', e.target.value)}
            >
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
            </select>
          </div>
          <Field label="J5 Offset" unit="mm" placeholder="e.g. 75" value={form.j5_offset_mm} onChange={v => set('j5_offset_mm', v)} />
          <Field label="Repeatability" unit="mm" placeholder="e.g. 0.02" value={form.repeatability_mm} onChange={v => set('repeatability_mm', v)} />
        </div>

        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Max Moments</p>
        <div className="grid grid-cols-3 gap-3 mb-5">
          <Field label="Axis 4" unit="Nm" placeholder="e.g. 26" value={form.m4_max_nm} onChange={v => set('m4_max_nm', v)} />
          <Field label="Axis 5" unit="Nm" placeholder="e.g. 26" value={form.m5_max_nm} onChange={v => set('m5_max_nm', v)} />
          <Field label="Axis 6" unit="Nm" placeholder="e.g. 11" value={form.m6_max_nm} onChange={v => set('m6_max_nm', v)} />
        </div>

        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Max Inertias</p>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Field label="Axis 4" unit="kg·m²" placeholder="e.g. 0.9" value={form.i4_max_kgm2} onChange={v => set('i4_max_kgm2', v)} />
          <Field label="Axis 5" unit="kg·m²" placeholder="e.g. 0.9" value={form.i5_max_kgm2} onChange={v => set('i5_max_kgm2', v)} />
          <Field label="Axis 6" unit="kg·m²" placeholder="e.g. 0.3" value={form.i6_max_kgm2} onChange={v => set('i6_max_kgm2', v)} />
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-500 text-sm font-medium py-2 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-sky-800 text-white text-sm font-medium py-2 rounded-lg disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Robot'}
          </button>
        </div>
      </div>
    </div>
  )
}