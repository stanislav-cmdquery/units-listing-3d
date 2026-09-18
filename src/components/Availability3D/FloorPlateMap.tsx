'use client'

import clsx from 'clsx'
import { useRef, useState, type KeyboardEvent } from 'react'

import { useUnitsListingConfig } from '../../context/UnitsListingContext'
import type { FloorPlate, FloorPlateSlot, SlotStatus } from '../../types/building'
import type { Unit } from '../../types/unit'
import { formatSlotUnitNumber, getOrdinal, getSlotStatus } from '../../utils/building'
import type { BuildingModel } from './model'

type Props = {
  model: BuildingModel
  plate: FloorPlate
  floor: number
  selectedUnit?: string | null
  /** Section to emphasize; slots of other sections are dimmed. */
  activeSection?: string | null
  /** Crop the plate to this section's viewBox (mobile). */
  cropSection?: string | null
  onSelectUnit: (unitNumber: string) => void
  className?: string
}

type Tooltip = { slot: FloorPlateSlot; unitNumber: string; x: number; y: number }

// Label block geometry in plate units: the number sits on top, the unit type below it.
const NUMBER_BASELINE = 15
const TYPE_BASELINE = 33

export function FloorPlateMap({
  model,
  plate,
  floor,
  selectedUnit,
  activeSection,
  cropSection,
  onSelectUnit,
  className,
}: Props) {
  const { labels } = useUnitsListingConfig()
  const rootRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<Tooltip | null>(null)
  const slotUnits = model.floorIndex.get(floor)
  const Base = plate.Base

  const viewBox = (cropSection && model.building.sections.find((s) => s.id === cropSection)?.viewBox) || plate.viewBox

  const statusLabels: Record<SlotStatus, string> = {
    available: labels.statusAvailable,
    notMatching: labels.statusNotMatching,
    unavailable: labels.statusNotAvailable,
  }

  const showTooltip = (slot: FloorPlateSlot, unitNumber: string, target: SVGElement) => {
    const root = rootRef.current
    if (!root) return
    const rootRect = root.getBoundingClientRect()
    const rect = target.getBoundingClientRect()
    setTooltip({ slot, unitNumber, x: rect.left + rect.width / 2 - rootRect.left, y: rect.top - rootRect.top })
  }

  return (
    <div ref={rootRef} className={clsx('ul-plate-root', className)}>
      <svg className="ul-plate-svg" viewBox={viewBox} role="group" aria-label={`${getOrdinal(floor)} ${labels.floorSuffix}`}>
        <Base />
        {plate.slots.map((slot) => {
          const unit: Unit | undefined = slotUnits?.get(slot.slot)
          const status = getSlotStatus(unit, model.matchingIds)
          const unitNumber = unit?.unitNumber ?? formatSlotUnitNumber(model.building, floor, slot.slot)
          const interactive = status !== 'unavailable'
          const selected = selectedUnit != null && selectedUnit === unitNumber
          const dimmed = activeSection != null && slot.section !== activeSection

          const activate = () => interactive && onSelectUnit(unitNumber)
          const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              activate()
            }
          }

          return (
            <g
              key={slot.slot}
              className={clsx(
                'ul-plate-slot',
                `ul-plate-slot-${status}`,
                interactive && 'ul-plate-slot-interactive',
                selected && 'ul-plate-slot-selected',
                dimmed && 'ul-plate-slot-dimmed'
              )}
              role={interactive ? 'button' : 'img'}
              tabIndex={0}
              aria-label={`${unitNumber}, ${slot.typeLabel}, ${statusLabels[status]}`}
              aria-pressed={interactive ? selected : undefined}
              onClick={activate}
              onKeyDown={interactive ? onKeyDown : undefined}
              onMouseEnter={status === 'unavailable' ? (e) => showTooltip(slot, unitNumber, e.currentTarget) : undefined}
              onMouseLeave={status === 'unavailable' ? () => setTooltip(null) : undefined}
              onFocus={status === 'unavailable' ? (e) => showTooltip(slot, unitNumber, e.currentTarget) : undefined}
              onBlur={status === 'unavailable' ? () => setTooltip(null) : undefined}
            >
              <path className="ul-plate-slot-shape" d={slot.d} />
              <g
                className="ul-plate-slot-label"
                transform={`translate(${slot.labelX} ${slot.labelY})${slot.labelScale ? ` scale(${slot.labelScale})` : ''}`}
                aria-hidden="true"
              >
                <text className="ul-plate-slot-number" y={NUMBER_BASELINE} textAnchor="middle">
                  {unitNumber}
                </text>
                <text className="ul-plate-slot-type" y={TYPE_BASELINE} textAnchor="middle">
                  {slot.typeLabel}
                </text>
              </g>
            </g>
          )
        })}
      </svg>

      {tooltip && (
        <div className="ul-plate-tooltip" role="tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          <span className="ul-plate-tooltip-title">
            {tooltip.unitNumber} · {tooltip.slot.typeLabel}
          </span>
          <span>{labels.statusNotAvailable}</span>
        </div>
      )}
    </div>
  )
}
