'use client'

import { useEffect, useMemo, useRef, type ReactNode } from 'react'

import { useUnitsListingConfig } from '../../context/UnitsListingContext'
import type { BuildingConfig } from '../../types/building'
import type { AvailabilityNav, NavChangeMeta } from '../../types/nav'
import type { Unit } from '../../types/unit'
import { buildFloorIndex, countUnitsByFloor, getPlateForFloor, isUnitAvailable, placeUnit } from '../../utils/building'
import { navToSearchParams } from '../../utils/navParams'
import type { UnitsFilter } from '../Grid/UnitsGrid'
import { BuildingView } from './BuildingView'
import { FloorView } from './FloorView'
import type { BuildingModel } from './model'
import { UnitView } from './UnitView'
import './Availability3D.css'

type Props = {
  building: BuildingConfig
  /** All units, any status: leased ones are still drawn on the plates. */
  units: Unit[]
  filter: UnitsFilter
  nav: AvailabilityNav
  setNav: (patch: Partial<AvailabilityNav>, meta?: NavChangeMeta) => void
  header?: ReactNode
  viewToggle: ReactNode
  isError: boolean
  onRetry?: () => void
  getUnitShareUrl?: (unit: Unit) => string
}

export function Availability3D({
  building,
  units,
  filter,
  nav,
  setNav,
  header,
  viewToggle,
  isError,
  onRetry,
  getUnitShareUrl,
}: Props) {
  const { labels, motion } = useUnitsListingConfig()

  const model = useMemo<BuildingModel>(() => {
    const matching = filter.filteredUnits
    const availableByFloor = countUnitsByFloor(building, matching)
    return {
      building,
      floorIndex: buildFloorIndex(building, units),
      matchingIds: new Set(matching.map((u) => u.id)),
      availableByFloor,
      totalAvailable: [...availableByFloor.values()].reduce((sum, n) => sum + n, 0),
      floors: building.floors.map((f) => f.floor).sort((a, b) => a - b),
    }
  }, [building, units, filter.filteredUnits])

  // Units that can't be drawn silently disappear from the 3D view; make that visible while developing.
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return
    const unplaced = units.filter((u) => isUnitAvailable(u) && !placeUnit(building, u)).map((u) => u.unitNumber)
    if (unplaced.length) {
      console.warn(
        `[units-listing-3d] ${unplaced.length} available unit(s) have no slot on the floor plates and are hidden in the 3D view: ${unplaced.join(', ')}. Check building.resolveUnit and the plate slots.`
      )
    }
  }, [building, units])

  const floor = nav.floor != null && model.floors.includes(nav.floor) ? nav.floor : null
  const plate = floor != null ? getPlateForFloor(building, floor) : null

  // A deep link to a unit that is gone or leased falls back to its floor.
  const unit = useMemo(() => {
    if (floor == null || !nav.unit) return null
    const found = units.find((u) => u.unitNumber === nav.unit)
    return found && isUnitAvailable(found) ? found : null
  }, [floor, nav.unit, units])

  // Only read when the share popup opens, i.e. on the client.
  const getShareUrl = (target: Unit) => {
    if (getUnitShareUrl) return getUnitShareUrl(target)
    const params = navToSearchParams({ ...nav, view: '3d', floor, unit: target.unitNumber }, window.location.search)
    return `${window.location.origin}${window.location.pathname}?${params}`
  }

  const selectFloor = (next: number) => setNav({ floor: next, unit: null }, { push: true })
  const selectUnit = (unitNumber: string) => setNav({ unit: unitNumber }, { push: nav.unit == null })

  const step = unit && plate ? 'unit' : floor != null ? 'floor' : 'building'

  const backToFloor = () => setNav({ unit: null }, { push: true })
  const backToBuilding = () => setNav({ floor: null, unit: null }, { push: true })

  // Coming back to the building starts a fresh search: filters picked on the floor no longer apply.
  const prevStepRef = useRef(step)
  const clearFiltersRef = useRef(filter.clearAll)
  clearFiltersRef.current = filter.clearAll
  useEffect(() => {
    if (step === 'building' && prevStepRef.current !== 'building') clearFiltersRef.current()
    prevStepRef.current = step
  }, [step])

  // Escape acts like the "Return to ..." link of the current step. Registered once on mount, so it runs
  // before any overlay's own Escape handler and can see that a dialog is still open.
  const escapeRef = useRef<(() => void) | null>(null)
  escapeRef.current = step === 'unit' ? backToFloor : step === 'floor' ? backToBuilding : null
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented || !escapeRef.current) return
      if (document.querySelector('[aria-modal="true"]')) return
      const target = e.target as HTMLElement | null
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return
      escapeRef.current()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  if (isError) {
    return (
      <div className="ul-grid-error">
        {onRetry ? (
          <button type="button" className="ul-grid-error-retry" onClick={onRetry}>
            {labels.retry}
          </button>
        ) : (
          labels.retry
        )}
      </div>
    )
  }

  const MotionDiv = motion.div
  const AnimatePresence = motion.AnimatePresence

  return (
    <div className="ul-3d-root">
      <AnimatePresence mode="wait" initial={false}>
        <MotionDiv
          key={step}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {step === 'unit' && unit && plate && floor != null ? (
            <UnitView
              model={model}
              plate={plate}
              floor={floor}
              unit={unit}
              getShareUrl={getShareUrl}
              onSelectUnit={selectUnit}
              onBack={backToFloor}
            />
          ) : step === 'floor' && floor != null ? (
            <FloorView
              model={model}
              filter={filter}
              floor={floor}
              section={nav.section}
              onFloorChange={(next) => setNav({ floor: next, unit: null })}
              onSectionChange={(section) => setNav({ section })}
              onSelectUnit={selectUnit}
              onBack={backToBuilding}
            />
          ) : (
            <BuildingView model={model} header={header} viewToggle={viewToggle} onSelectFloor={selectFloor} />
          )}
        </MotionDiv>
      </AnimatePresence>
    </div>
  )
}
