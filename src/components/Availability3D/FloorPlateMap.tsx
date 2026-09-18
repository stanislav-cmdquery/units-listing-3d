'use client'

import clsx from 'clsx'
import { useRef, useState, type FocusEvent, type KeyboardEvent, type PointerEvent } from 'react'

import { useUnitsListingConfig } from '../../context/UnitsListingContext'
import type { FloorPlate, SlotStatus } from '../../types/building'
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

/** Anchor point in root coordinates: the pointer, or the slot's top-center for keyboard focus. */
type Tooltip = { status: SlotStatus; x: number; y: number }

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

  const hints: Record<SlotStatus, string> = {
    available: labels.hintAvailable,
    notMatching: labels.hintNotMatching,
    unavailable: labels.hintNotAvailable,
  }

  const toRootPoint = (clientX: number, clientY: number) => {
    const rect = rootRef.current?.getBoundingClientRect()
    return rect ? { x: clientX - rect.left, y: clientY - rect.top } : null
  }

  const followPointer = (status: SlotStatus, e: PointerEvent) => {
    const point = toRootPoint(e.clientX, e.clientY)
    if (point) setTooltip({ status, ...point })
  }

  const anchorToSlot = (status: SlotStatus, e: FocusEvent<SVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const point = toRootPoint(rect.left + rect.width / 2, rect.top)
    if (point) setTooltip({ status, ...point })
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
              onPointerMove={(e) => followPointer(status, e)}
              onPointerLeave={() => setTooltip(null)}
              onFocus={(e) => anchorToSlot(status, e)}
              onBlur={() => setTooltip(null)}
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
          {hints[tooltip.status]}
        </div>
      )}
    </div>
  )
}
