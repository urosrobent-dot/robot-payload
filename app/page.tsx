'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AddRobotModal from '@/components/AddRobotModal'
import RobotDetail from '@/components/RobotDetail'
import PayloadChecker from '@/components/PayloadChecker'
import RobotFinder from '@/components/RobotFinder'

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

type Section = 'library' | 'checker' | 'finder'

export default function Home() {
  const router = useRouter()
  const [robots, setRobots] = useState<Robot[]>([])
  const [selected, setSelected] = useState<Robot | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [section, setSection] = useState<Section>('library')
  const [isAdmin, setIsAdmin] = useState(false)
  const [payloadState, setPayloadState] = useState<PayloadState>({
  mass: '', j3: '', x: '', y: '', z: '', ix: '', iy: '', iz: ''
})

useEffect(() => {
    fetchRobots()
    checkSession()
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push('/landing')
      }
    })
  }, [])

  async function checkSession() {
    const { data } = await supabase.auth.getSession()
    setIsAdmin(!!data.session)
  }

  async function fetchRobots() {
    const { data } = await supabase.from('robots').select('*').order('manufacturer')
    setRobots(data || [])
    setLoading(false)
  }

  async function handleUpdated() {
    const { data } = await supabase.from('robots').select('*').order('manufacturer')
    const updated = data || []
    setRobots(updated)
    const fresh = updated.find((r: Robot) => r.id === selected?.id) ?? null
    setSelected(fresh)
  }

async function handleLogout() {
  await supabase.auth.signOut()
  router.push('/landing')
}

  const manufacturers = [...new Set(robots.map(r => r.manufacturer))]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
<div className="p-4 border-b border-gray-200">
  <img src="/logo.png" alt="IRPC" className="h-10 w-auto" />
</div>

        {/* Section tabs */}
       <div className="p-3 border-b border-gray-200 flex gap-2">
  <button
    onClick={() => setSection('library')}
    className={`flex-1 py-1.5 text-xs font-medium rounded-lg ${
      section === 'library'
        ? 'bg-gray-900 text-white'
        : 'text-gray-500 hover:bg-gray-50'
    }`}
  >
    Robot Library
  </button>
  <button
    onClick={() => setSection('checker')}
    className={`flex-1 py-1.5 text-xs font-medium rounded-lg ${
      section === 'checker'
        ? 'bg-blue-500 text-white'
        : 'text-gray-500 hover:bg-gray-50'
    }`}
  >
    Payload Checker
  </button>
  <button
  onClick={() => { setSection('finder'); setSelected(null) }}
  className={`flex-1 py-1.5 text-xs font-medium rounded-lg ${
    section === 'finder'
      ? 'bg-blue-500 text-white'
      : 'text-gray-500 hover:bg-gray-50'
  }`}
>
  Finder
</button>
</div>

        {/* Robot list */}
        <div className="flex-1 overflow-y-auto py-2">
          {loading ? (
            <p className="text-xs text-gray-400 p-4">Loading...</p>
          ) : robots.length === 0 ? (
            <p className="text-xs text-gray-400 p-4">No robots in database.</p>
          ) : (
            manufacturers.map(mfr => (
              <div key={mfr}>
                <p className="text-xs text-gray-400 uppercase tracking-wider px-4 pt-4 pb-1">{mfr}</p>
                {robots.filter(r => r.manufacturer === mfr).map(robot => (
                  <div
                    key={robot.id}
                    onClick={() => { setSelected(robot); if (section === 'finder') setSection('checker') }}
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

        {/* Bottom bar */}
        <div className="p-4 border-t border-gray-200 flex flex-col gap-2">
          {isAdmin && section === 'library' && (
            <button
              onClick={() => setShowModal(true)}
              className="w-full bg-sky-800 text-white text-sm font-medium py-2 rounded-lg hover:bg-sky-950"
            >
              + Add Robot
            </button>
          )}
        {isAdmin ? (
          <button
            onClick={handleLogout}
            className="w-full border border-gray-200 text-gray-500 text-xs font-medium py-1.5 rounded-lg hover:bg-gray-50"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => router.push('/landing')}
            className="w-full border border-gray-200 text-gray-400 text-xs font-medium py-1.5 rounded-lg hover:bg-gray-50"
          >
            Login
          </button>
        )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {section === 'finder' ? (
  <RobotFinder />
) : selected ? (
  section === 'library' ? (
    <RobotDetail
      robot={selected}
      onDeleted={() => { setSelected(null); fetchRobots() }}
      onEdit={() => {}}
      onUpdated={handleUpdated}
      isAdmin={isAdmin}
    />
  ) : (
  <div className="p-8 flex flex-col gap-6">
  <div>
    <h2 className="text-xl font-medium text-gray-900">Payload Checker</h2>
    <p className="text-sm text-gray-400 mt-1">{selected.manufacturer} {selected.model}</p>
  </div>
  <PayloadChecker robot={selected} state={payloadState} onStateChange={setPayloadState} />
</div>
  )
) : (
  <div className="flex-1 flex items-center justify-center">
    <div className="text-center text-gray-400">
      <p className="text-lg font-medium">
        {section === 'library' ? 'Select a robot' : 'Select a robot to check payload'}
      </p>
      <p className="text-sm mt-1">
        {section === 'library' ? 'or add a new one' : 'from the list on the left'}
      </p>
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