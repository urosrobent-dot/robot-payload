'use client'

import { useEffect, useRef } from 'react'

type Props = {
  lx: number
  ly: number
  lz: number
  j5OffsetMm: number
}

export default function ArmVisualization({ lx, ly, lz, j5OffsetMm }: Props) {
  const groupRef = useRef<SVGGElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    draw()
  }, [lx, ly, lz, j5OffsetMm])

  function draw() {
    const g = groupRef.current
    if (!g) return
    g.innerHTML = ''

    const SCALE = 0.22
    const j5OffPx = j5OffsetMm * SCALE
    const armLenPx = 400 * SCALE

    function el(tag: string, attrs: Record<string, string | number>) {
      const e = document.createElementNS('http://www.w3.org/2000/svg', tag)
      for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v))
      g!.appendChild(e)
      return e
    }

    function txt(x: number, y: number, text: string, color: string, anchor = 'middle', size = 10) {
      const t = el('text', { x, y, 'font-size': size, fill: color, 'font-family': 'var(--font-sans)', 'text-anchor': anchor })
      t.textContent = text
      return t
    }

    const actualJ5 = Math.sqrt((lx / 1000) ** 2 + (ly / 1000) ** 2 + ((lz + j5OffsetMm) / 1000) ** 2)
    const pct = (actualJ5 / 0.5) * 100
    const s = pct > 100 ? 'over' : pct > 90 ? 'warn' : 'ok'
    const cofgColor = s === 'ok' ? '#639922' : s === 'warn' ? '#BA7517' : '#E24B4A'

    const armColor = '#444441'
    const j5Color = '#185FA5'

    function drawArm(cx: number, cy: number, showLabels: boolean) {
      const j4x = cx, j4y = cy
      const j5x = cx, j5y = cy - armLenPx
      const fx = cx, fy = cy - armLenPx - j5OffPx

      // Ground
      el('rect', { x: cx - 25, y: cy + 6, width: 50, height: 5, rx: 2, fill: '#B4B2A9' })
      for (let i = 0; i < 6; i++) {
        el('line', { x1: cx - 22 + i * 9, y1: cy + 11, x2: cx - 26 + i * 9, y2: cy + 18, stroke: '#B4B2A9', 'stroke-width': 1 })
      }

      // Base
      el('rect', { x: cx - 14, y: cy - 8, width: 28, height: 16, rx: 3, fill: '#D3D1C7', stroke: armColor, 'stroke-width': 1 })

      // Lower arm (J4 to J5)
      el('line', { x1: j4x, y1: j4y - 8, x2: j5x, y2: j5y, stroke: armColor, 'stroke-width': 8, 'stroke-linecap': 'round' })

      // J5 offset link
      el('line', { x1: j5x, y1: j5y, x2: fx, y2: fy, stroke: j5Color, 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.9 })

      // J4 joint
      el('circle', { cx: j4x, cy: j4y, r: 8, fill: '#D3D1C7', stroke: armColor, 'stroke-width': 1.5 })
      el('circle', { cx: j4x, cy: j4y, r: 3, fill: armColor })
      txt(j4x - 18, j4y + 3, 'J4', '#5F5E5A', 'end', 9)

      // J5 joint
      el('circle', { cx: j5x, cy: j5y, r: 7, fill: '#D3D1C7', stroke: j5Color, 'stroke-width': 1.5 })
      el('circle', { cx: j5x, cy: j5y, r: 2.5, fill: j5Color })
      txt(j5x - 16, j5y + 3, 'J5', j5Color, 'end', 9)

      // Flange
      el('rect', { x: fx - 9, y: fy - 4, width: 18, height: 8, rx: 2, fill: '#D3D1C7', stroke: armColor, 'stroke-width': 1.2 })
      txt(fx + 14, fy + 3, 'Flange', '#5F5E5A', 'start', 9)

      if (showLabels && j5OffsetMm > 0) {
        el('line', { x1: fx + 16, y1: j5y, x2: fx + 16, y2: fy, stroke: j5Color, 'stroke-width': 0.5, opacity: 0.5, 'stroke-dasharray': '2 2', 'marker-end': 'url(#arr3)', 'marker-start': 'url(#arr3)' })
        txt(fx + 30, (j5y + fy) / 2 + 3, `${j5OffsetMm}mm`, j5Color, 'start', 9)
      }

      return { fx, fy }
    }

    // ---- SIDE VIEW ----
    const { fx, fy } = drawArm(160, 340, true)
    const cofgSvX = fx + lx * SCALE
    const cofgSvY = fy - lz * SCALE

    if (Math.abs(lz) > 2) {
      el('line', { x1: fx - 18, y1: fy, x2: fx - 18, y2: cofgSvY, stroke: '#888780', 'stroke-width': 0.5, 'stroke-dasharray': '3 2', opacity: 0.5, 'marker-end': 'url(#arr3)' })
      txt(fx - 22, (fy + cofgSvY) / 2 + 3, `Lz: ${lz}`, '#888780', 'end', 9)
    }
    if (Math.abs(lx) > 2) {
      el('line', { x1: fx, y1: cofgSvY + 16, x2: cofgSvX, y2: cofgSvY + 16, stroke: '#888780', 'stroke-width': 0.5, 'stroke-dasharray': '3 2', opacity: 0.5, 'marker-end': 'url(#arr3)' })
      txt((fx + cofgSvX) / 2, cofgSvY + 27, `Lx: ${lx}`, '#888780', 'middle', 9)
    }

    el('line', { x1: fx, y1: fy, x2: cofgSvX, y2: cofgSvY, stroke: '#B4B2A9', 'stroke-width': 0.8, 'stroke-dasharray': '3 3', opacity: 0.7 })
    el('circle', { cx: cofgSvX, cy: cofgSvY, r: 5, fill: cofgColor, opacity: 0.9 })
    el('circle', { cx: cofgSvX, cy: cofgSvY, r: 9, fill: 'none', stroke: cofgColor, 'stroke-width': 0.8, opacity: 0.4 })
    txt(cofgSvX + 12, cofgSvY - 8, 'CoG', cofgColor, 'start', 9)

    // ---- FRONT VIEW ----
    const { fx: ffx, fy: ffy } = drawArm(500, 340, false)
    const cofgFvX = ffx + ly * SCALE
    const cofgFvY = ffy - lz * SCALE

    if (Math.abs(ly) > 2) {
      el('line', { x1: ffx, y1: cofgFvY + 16, x2: cofgFvX, y2: cofgFvY + 16, stroke: '#1D9E75', 'stroke-width': 0.5, 'stroke-dasharray': '3 2', opacity: 0.5, 'marker-end': 'url(#arr3)' })
      txt((ffx + cofgFvX) / 2, cofgFvY + 27, `Ly: ${ly}`, '#0F6E56', 'middle', 9)
    }

    el('line', { x1: ffx, y1: ffy, x2: cofgFvX, y2: cofgFvY, stroke: '#B4B2A9', 'stroke-width': 0.8, 'stroke-dasharray': '3 3', opacity: 0.7 })
    el('circle', { cx: cofgFvX, cy: cofgFvY, r: 5, fill: cofgColor, opacity: 0.9 })
    el('circle', { cx: cofgFvX, cy: cofgFvY, r: 9, fill: 'none', stroke: cofgColor, 'stroke-width': 0.8, opacity: 0.4 })

    // Labels
    txt(160, 16, 'Side view (X–Z)', '#888780', 'middle', 10)
    txt(500, 16, 'Front view (Y–Z)', '#888780', 'middle', 10)
    el('line', { x1: 340, y1: 8, x2: 340, y2: 380, stroke: '#D3D1C7', 'stroke-width': 0.5, 'stroke-dasharray': '4 4' })

    if (statusRef.current) {
      const label = s === 'ok' ? 'OK' : s === 'warn' ? 'WARN' : 'OVER'
      const cls = s === 'ok' ? 'bg-green-50 border-green-200 text-green-700' : s === 'warn' ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-red-50 border-red-200 text-red-600'
      statusRef.current.innerHTML = `<span class="text-xs font-medium px-2.5 py-1 rounded-full border ${cls}">Actual J5 offset: ${(actualJ5 * 1000).toFixed(0)}mm — ${label}</span>`
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Arm Visualization</p>
      <svg width="100%" viewBox="0 0 680 390">
        <defs>
          <marker id="arr3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </marker>
        </defs>
        <g ref={groupRef} />
      </svg>
      <div ref={statusRef} className="mt-2" />
    </div>
  )
}