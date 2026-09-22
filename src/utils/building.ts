import type { BuildingConfig, BuildingSection, FloorPlate, SlotStatus, UnitLocation } from '../types/building'
import type { Unit } from '../types/unit'

// The slot is the last two digits plus an optional letter suffix; everything before it is the floor.
// `304A` -> floor 3, slot `04A`; `1204A` -> floor 12, slot `04A`.
const UNIT_NUMBER_RE = /^(\d+?)(\d{2}[A-Z]*)$/

export function defaultResolveUnit(unit: Unit): UnitLocation | null {
  const match = unit.unitNumber.trim().toUpperCase().match(UNIT_NUMBER_RE)
  if (!match) return null
  const floor = unit.floor ?? Number(match[1])
  if (!Number.isFinite(floor)) return null
  return { floor, slot: match[2] }
}

export function resolveUnitLocation(config: BuildingConfig, unit: Unit): UnitLocation | null {
  return (config.resolveUnit ?? defaultResolveUnit)(unit)
}

export function formatSlotUnitNumber(config: BuildingConfig, floor: number, slot: string): string {
  return config.formatUnitNumber ? config.formatUnitNumber(floor, slot) : `${floor}${slot}`
}

export function isUnitAvailable(unit: Unit): boolean {
  return unit.status == null || unit.status === 'available'
}

/**
 * The sections that exist on a floor, in the order `BuildingConfig.sections` lists them. Plates may
 * narrow the list — upper floors can drop a section entirely — and carry their own pan boxes.
 */
export function getSectionsForFloor(config: BuildingConfig, floor: number): BuildingSection[] {
  const plate = getPlateForFloor(config, floor)
  // No plate means no units to pick a section from, e.g. a retail level.
  if (!plate) return []
  if (!plate.sections) return config.sections
  const onPlate = new Map(plate.sections.map((section) => [section.id, section]))
  return config.sections.flatMap((section) => {
    const override = onPlate.get(section.id)
    if (!override) return []
    // The label stays with the building: a section is the same wing whichever floor you are on.
    return [{ ...section, viewBox: override.viewBox ?? section.viewBox }]
  })
}

export function getPlateForFloor(config: BuildingConfig, floor: number): FloorPlate | null {
  return config.plates.find((plate) => plate.floors.includes(floor)) ?? null
}

/** floor -> slot -> unit. Units that can't be placed on a plate are skipped. */
export type FloorIndex = Map<number, Map<string, Unit>>

export function buildFloorIndex(config: BuildingConfig, units: Unit[]): FloorIndex {
  const index: FloorIndex = new Map()
  for (const unit of units) {
    const location = resolveUnitLocation(config, unit)
    if (!location) continue
    let slots = index.get(location.floor)
    if (!slots) {
      slots = new Map()
      index.set(location.floor, slots)
    }
    slots.set(location.slot, unit)
  }
  return index
}

/**
 * `matchingIds` holds ids of available units that pass the active filters.
 * A slot without a unit, or with a leased/off-market one, is unavailable.
 */
export function getSlotStatus(unit: Unit | undefined, matchingIds: ReadonlySet<string>): SlotStatus {
  if (!unit || !isUnitAvailable(unit)) return 'unavailable'
  return matchingIds.has(unit.id) ? 'available' : 'notMatching'
}

/** Where the unit is drawn, or null when its floor has no plate or the plate has no such slot. */
export function placeUnit(config: BuildingConfig, unit: Unit): UnitLocation | null {
  const location = resolveUnitLocation(config, unit)
  if (!location) return null
  const plate = getPlateForFloor(config, location.floor)
  return plate?.slots.some((s) => s.slot === location.slot) ? location : null
}

/** Counts only units that are actually drawn on a plate, so the facade totals match the floor plates. */
export function countUnitsByFloor(config: BuildingConfig, units: Unit[]): Map<number, number> {
  const counts = new Map<number, number>()
  for (const unit of units) {
    const location = placeUnit(config, unit)
    if (!location) continue
    counts.set(location.floor, (counts.get(location.floor) ?? 0) + 1)
  }
  return counts
}

export function getOrdinal(n: number): string {
  const tens = n % 100
  if (tens >= 11 && tens <= 13) return `${n}th`
  switch (n % 10) {
    case 1:
      return `${n}st`
    case 2:
      return `${n}nd`
    case 3:
      return `${n}rd`
    default:
      return `${n}th`
  }
}
