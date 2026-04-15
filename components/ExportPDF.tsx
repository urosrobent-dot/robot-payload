'use client'

import { jsPDF } from 'jspdf'
import { toPng } from 'html-to-image'

type Robot = {
  manufacturer: string
  model: string
  max_payload_kg: number
  max_reach_mm: number
  axes: number
  j5_offset_mm: number
  m4_max_nm: number
  m5_max_nm: number
  m6_max_nm: number
  i4_max_kgm2: number
  i5_max_kgm2: number
  i6_max_kgm2: number
}

type Results = {
  payloadPct: number
  actualJ5Offset: number
  m4: number
  m5: number
  m6: number
  m4pct: number
  m5pct: number
  m6pct: number
  i4: number
  i5: number
  i6: number
  i4pct: number
  i5pct: number
  i6pct: number
  cl4pct: number
  cl5pct: number
  cl6pct: number
  payloadStatus: 'OK' | 'WARN' | 'OVER'
  momentStatus: 'OK' | 'WARN' | 'OVER'
  inertiaStatus: 'OK' | 'WARN' | 'OVER'
  clStatus: 'OK' | 'WARN' | 'OVER'
  approved: 'OK' | 'WARN' | 'NO'
}

type Props = {
  robot: Robot
  results: Results
  inputs: {
    mass: string
    x: string
    y: string
    z: string
    ix: string
    iy: string
    iz: string
  }
  diagramElement?: HTMLDivElement | null
}

function statusColor(s: string): [number, number, number] {
  if (s === 'OVER') return [220, 38, 38]
  if (s === 'WARN') return [234, 88, 12]
  return [22, 163, 74]
}

export default function ExportPDF({ robot, results, inputs, diagramElement }: Props) {
  async function generate() {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    const W = 210
    const H = 297
    const margin = 15
    const bottomMargin = 18
    let y = margin

    const darkGray: [number, number, number] = [30, 30, 30]
    const midGray: [number, number, number] = [100, 100, 100]
    const lightGray: [number, number, number] = [240, 240, 240]
    const borderGray: [number, number, number] = [200, 200, 200]
    const blue: [number, number, number] = [24, 95, 165]

    function addFooter() {
      doc.setFillColor(...lightGray)
      doc.rect(0, 285, W, 12, 'F')
      doc.setTextColor(...midGray)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.text('IRPC — Industrial Robot Payload Checker', margin, 292)
      doc.text(
        'This report is generated automatically. Verify all values before use.',
        W - margin,
        292,
        { align: 'right' }
      )
    }

    function ensureSpace(requiredHeight: number) {
      if (y + requiredHeight > H - bottomMargin) {
        addFooter()
        doc.addPage()
        y = margin
      }
    }

    doc.setFillColor(...blue)
    doc.rect(0, 0, W, 22, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('IRPC — Industrial Robot Payload Checker', margin, 14)

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(
      `Report generated: ${new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })}`,
      W - margin,
      14,
      { align: 'right' }
    )

    y = 32

    doc.setTextColor(...darkGray)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text(`${robot.manufacturer} ${robot.model}`, margin, y)

    y += 6
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...midGray)
    doc.text(
      `${robot.axes}-axis robot   |   Max payload: ${robot.max_payload_kg} kg   |   Max reach: ${robot.max_reach_mm} mm`,
      margin,
      y
    )

    y += 10

    const approvedColor: [number, number, number] =
      results.approved === 'OK'
        ? [22, 163, 74]
        : results.approved === 'WARN'
          ? [234, 88, 12]
          : [220, 38, 38]

    const approvedText =
      results.approved === 'OK'
        ? 'APPROVED'
        : results.approved === 'WARN'
          ? 'WARNING'
          : 'NOT APPROVED'

    const badgeWidth = approvedText === 'NOT APPROVED' ? 44 : 36
    const badgeX = margin
    const badgeY = y - 4

    doc.setFillColor(...approvedColor)
    doc.roundedRect(badgeX, badgeY, badgeWidth, 8, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text(approvedText, badgeX + badgeWidth / 2, y + 1.8, { align: 'center' })

    y += 16

    doc.setDrawColor(...borderGray)
    doc.setLineWidth(0.3)
    doc.line(margin, y, W - margin, y)
    y += 8

    const col1x = margin
    const col2x = W / 2 + 5
    const colW = W / 2 - margin - 5

    doc.setTextColor(...blue)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('PAYLOAD INPUT DATA', col1x, y)

    doc.setTextColor(...midGray)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')

    const inputRows: [string, string][] = [
      ['J6 Payload Mass', `${inputs.mass || '0'} kg`],
      ['CoG X', `${inputs.x || '0'} mm`],
      ['CoG Y', `${inputs.y || '0'} mm`],
      ['CoG Z', `${inputs.z || '0'} mm`],
      ['Inertia Ix', `${inputs.ix || '0'} kg·m2`],
      ['Inertia Iy', `${inputs.iy || '0'} kg·m2`],
      ['Inertia Iz', `${inputs.iz || '0'} kg·m2`],
      ['Actual J5 Offset', `${(results.actualJ5Offset * 1000).toFixed(1)} mm`],
    ]

    let iy2 = y + 6
    inputRows.forEach(([label, value]) => {
      doc.setTextColor(...midGray)
      doc.text(label, col1x, iy2)
      doc.setTextColor(...darkGray)
      doc.setFont('helvetica', 'bold')
      doc.text(value, col1x + colW, iy2, { align: 'right' })
      doc.setFont('helvetica', 'normal')
      iy2 += 6
    })

    doc.setTextColor(...blue)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('SUMMARY RESULTS', col2x, y)

    const summaryRows: [string, string][] = [
      ['Payload', results.payloadStatus],
      ['Moments', results.momentStatus],
      ['Combined Loads', results.clStatus],
      ['Inertias', results.inertiaStatus],
    ]

    let sy = y + 6
    summaryRows.forEach(([label, s]) => {
      doc.setTextColor(...midGray)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(label, col2x, sy)

      const sc = statusColor(s)
      doc.setTextColor(...sc)
      doc.setFont('helvetica', 'bold')
      doc.text(s, col2x + colW, sy, { align: 'right' })
      doc.setFont('helvetica', 'normal')
      sy += 6
    })

    y = Math.max(iy2, sy) + 8

    doc.setDrawColor(...borderGray)
    doc.line(margin, y, W - margin, y)
    y += 8

    doc.setTextColor(...blue)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('DETAILED RESULTS', margin, y)
    y += 6

    doc.setFillColor(...lightGray)
    doc.rect(margin, y - 4, W - margin * 2, 7, 'F')
    doc.setTextColor(...midGray)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')

    const cols = [margin, 75, 115, 140, 165]
    doc.text('Parameter', cols[0], y)
    doc.text('Spec', cols[1], y)
    doc.text('Actual', cols[2], y)
    doc.text('%', cols[3], y)
    doc.text('Status', cols[4], y)
    y += 6

    const detailRows: [string, string, string, string, string][] = [
      ['J6 Payload', `${robot.max_payload_kg} kg`, `${parseFloat(inputs.mass) || 0} kg`, results.payloadPct.toFixed(1), results.payloadStatus],
      ['Axis 4 Moment', `${robot.m4_max_nm} Nm`, `${results.m4.toFixed(2)} Nm`, results.m4pct.toFixed(1), results.m4pct > 100 ? 'OVER' : results.m4pct > 90 ? 'WARN' : 'OK'],
      ['Axis 5 Moment', `${robot.m5_max_nm} Nm`, `${results.m5.toFixed(2)} Nm`, results.m5pct.toFixed(1), results.m5pct > 100 ? 'OVER' : results.m5pct > 90 ? 'WARN' : 'OK'],
      ['Axis 6 Moment', `${robot.m6_max_nm} Nm`, `${results.m6.toFixed(2)} Nm`, results.m6pct.toFixed(1), results.m6pct > 100 ? 'OVER' : results.m6pct > 90 ? 'WARN' : 'OK'],
      ['Axis 4 Inertia', `${robot.i4_max_kgm2} kg·m2`, `${results.i4.toFixed(3)} kg·m2`, results.i4pct.toFixed(1), results.i4pct > 100 ? 'OVER' : results.i4pct > 90 ? 'WARN' : 'OK'],
      ['Axis 5 Inertia', `${robot.i5_max_kgm2} kg·m2`, `${results.i5.toFixed(3)} kg·m2`, results.i5pct.toFixed(1), results.i5pct > 100 ? 'OVER' : results.i5pct > 90 ? 'WARN' : 'OK'],
      ['Axis 6 Inertia', `${robot.i6_max_kgm2} kg·m2`, `${results.i6.toFixed(3)} kg·m2`, results.i6pct.toFixed(1), results.i6pct > 100 ? 'OVER' : results.i6pct > 90 ? 'WARN' : 'OK'],
      ['Combined Load A4', '100 %', `${results.cl4pct.toFixed(1)} %`, results.cl4pct.toFixed(1), results.cl4pct > 100 ? 'OVER' : results.cl4pct > 90 ? 'WARN' : 'OK'],
      ['Combined Load A5', '100 %', `${results.cl5pct.toFixed(1)} %`, results.cl5pct.toFixed(1), results.cl5pct > 100 ? 'OVER' : results.cl5pct > 90 ? 'WARN' : 'OK'],
      ['Combined Load A6', '100 %', `${results.cl6pct.toFixed(1)} %`, results.cl6pct.toFixed(1), results.cl6pct > 100 ? 'OVER' : results.cl6pct > 90 ? 'WARN' : 'OK'],
    ]

    detailRows.forEach((row, idx) => {
      ensureSpace(8)

      if (idx % 2 === 0) {
        doc.setFillColor(250, 250, 250)
        doc.rect(margin, y - 4, W - margin * 2, 6.5, 'F')
      }

      doc.setTextColor(...darkGray)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(row[0], cols[0], y)

      doc.setTextColor(...midGray)
      doc.text(row[1], cols[1], y)
      doc.text(row[2], cols[2], y)
      doc.text(row[3], cols[3], y)

      const sc = statusColor(row[4])
      doc.setTextColor(...sc)
      doc.setFont('helvetica', 'bold')
      doc.text(row[4], cols[4], y)
      doc.setFont('helvetica', 'normal')

      y += 6.5
    })

    y += 8

    ensureSpace(20)
    doc.setDrawColor(...borderGray)
    doc.line(margin, y, W - margin, y)
    y += 8

    doc.setTextColor(...blue)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('LOAD DIAGRAM', margin, y)
    y += 4

    if (diagramElement) {
      try {
        const imgData = await toPng(diagramElement, {
          cacheBust: true,
          pixelRatio: 2,
          backgroundColor: '#ffffff',
        })

        const imgProps = doc.getImageProperties(imgData)
        const imgW = W - margin * 2
        const imgH = (imgProps.height * imgW) / imgProps.width

        ensureSpace(imgH + 8)
        doc.addImage(imgData, 'PNG', margin, y, imgW, imgH)
        y += imgH + 8
      } catch (e) {
        console.error('Failed to export load diagram:', e)
        doc.setFontSize(8)
        doc.setTextColor(...midGray)
        doc.text('Load diagram could not be exported.', margin, y + 4)
        y += 10
      }
    } else {
      doc.setFontSize(8)
      doc.setTextColor(...midGray)
      doc.text('Load diagram reference is not available.', margin, y + 4)
      y += 10
    }

    ensureSpace(45)
    doc.setDrawColor(...borderGray)
    doc.line(margin, y, W - margin, y)
    y += 8

    doc.setTextColor(...blue)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('ROBOT SPECIFICATIONS', margin, y)
    y += 6

    const specRows: [string, string, string, string][] = [
      ['Max Payload', `${robot.max_payload_kg} kg`, 'Max Reach', `${robot.max_reach_mm} mm`],
      ['J5 Offset', `${robot.j5_offset_mm} mm`, 'Axes', `${robot.axes}`],
      ['Max Moment A4', `${robot.m4_max_nm} Nm`, 'Max Inertia A4', `${robot.i4_max_kgm2} kg·m2`],
      ['Max Moment A5', `${robot.m5_max_nm} Nm`, 'Max Inertia A5', `${robot.i5_max_kgm2} kg·m2`],
      ['Max Moment A6', `${robot.m6_max_nm} Nm`, 'Max Inertia A6', `${robot.i6_max_kgm2} kg·m2`],
    ]

    specRows.forEach(([l1, v1, l2, v2]) => {
      ensureSpace(8)

      doc.setTextColor(...midGray)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.text(l1, col1x, y)

      doc.setTextColor(...darkGray)
      doc.setFont('helvetica', 'bold')
      doc.text(v1, col1x + colW, y, { align: 'right' })

      doc.setTextColor(...midGray)
      doc.setFont('helvetica', 'normal')
      doc.text(l2, col2x, y)

      doc.setTextColor(...darkGray)
      doc.setFont('helvetica', 'bold')
      doc.text(v2, col2x + colW, y, { align: 'right' })

      doc.setFont('helvetica', 'normal')
      y += 6
    })

    addFooter()

    const filename = `IRPC_${robot.manufacturer}_${robot.model}_${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`.replace(/[/\\]/g, '-')

    doc.save(filename)
  }

  return (
    <button
      onClick={generate}
      className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-all"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <line x1="9" y1="15" x2="15" y2="15" />
      </svg>
      Export PDF
    </button>
  )
}