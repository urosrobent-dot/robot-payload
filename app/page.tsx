'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AddRobotModal from '@/components/AddRobotModal'
import PayloadPanel from '@/components/PayloadPanel'

type Robot = {
  id: string
  manufacturer: string
  model: string
  max_payload_kg: number
  max_reach_mm: number
  axes: number
}

export default function Home() {
  const [robots, setRobots] = useState<Robot[]>([])
  const [selected, setSelected] = useState<Robot | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchRobots()
  }, [])

  async function fetchRobots() {
    const { data } = await supabase.from('robots').select('*').order('manufacturer')
    setRobots(data || [])
    setLoading(false)
  }

  const manufacturers = [...new Set(robots.map(r => r.manufacturer))]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-60 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-sm font-medium uppercase tracking-widest">RoboPayload</h1>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {loading ? (
            <p className="text-xs text-gray-400 p-4">Nalagam...</p>
          ) : (
            manufacturers.map(mfr => (
              <div key={mfr}>
                <p className="text-xs text-gray-400 uppercase tracking-wider px-4 pt-4 pb-1">{mfr}</p>
                {robots.filter(r => r.manufacturer === mfr).map(robot => (
                  <div
                    key={robot.id}
                    onClick={() => setSelected(robot)}
                    className={`px-4 py-2 text-sm cursor-pointer border-l-2 ${
                      selected?.id === robot.id
                        ? 'border-orange-500 bg-gray-50 text-gray-900 font-medium'
                        : 'border-transparent text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {robot.model}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
        <div className="p-4">
          <button
            onClick={() => setShowModal(true)}
            className="w-full bg-orange-600 text-white text-sm font-medium py-2 rounded-lg"
          >
            + Dodaj robota
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {selected ? (
           <PayloadPanel robot={selected} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <p className="text-lg font-medium">Izberi robota</p>
              <p className="text-sm mt-1">ali dodaj novega</p>
            </div>
          </div>
        )}
      </div>
        {showModal && (
         <AddRobotModal
          onClose={() => setShowModal(false)}
          onAdded={fetchRobots}
         />
       )}
    </div>
  )
}