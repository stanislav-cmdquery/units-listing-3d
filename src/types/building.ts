import type { ComponentType } from 'react'

import type { Unit, UnitImage } from './unit'

/** Clickable floor band drawn over the building render, in `BuildingConfig.viewBox` coordinates. */
export interface BuildingFloor {
  floor: number
  d: string
}

/** A building (wing) that shares the floor plate, e.g. "372 Livingston". */
export interface BuildingSection {
  id: string
  label: string
  /**
   * This section's area on the floor plate, in `FloorPlate.viewBox` coordinates. On mobile the plate is
   * scaled so the widest section fills the screen, and the pan centers the picked section.
   */
  viewBox?: string
}

/** One section of `BuildingConfig.sections` as it falls on a single plate. */
export interface PlateSection {
  id: string
  /** This section's area on this plate, in `FloorPlate.viewBox` coordinates. */
  viewBox?: string
  label?: string
}

/** A unit position on a floor plate. The same slot repeats on every floor that uses the plate. */
export interface FloorPlateSlot {
  /** Unit number without the floor prefix, e.g. `04A` for unit `304A`. */
  slot: string
  section: string
  /** SVG path of the unit outline, in `FloorPlate.viewBox` coordinates. */
  d: string
  /** Top-center of the label block (unit number above the unit type), in plate coordinates. */
  labelX: number
  labelY: number
  /** Shrinks the label for narrow slots. */
  labelScale?: number
  /** Static unit type shown on the plate even when the unit is missing from the data, e.g. `2-Bed`. */
  typeLabel: string
}

export interface FloorPlate {
  id: string
  floors: number[]
  viewBox: string
  /**
   * Sections as they fall on this plate, when the plates differ in shape from floor to floor.
   * Overrides `BuildingConfig.sections` for the mobile pan and the section pickers; sections left
   * out here have no units on this floor. Falls back to `BuildingConfig.sections`.
   */
  sections?: PlateSection[]
  /** Static part of the plate (walls, balconies, cores, captions). Unit slots are drawn on top by the package. */
  Base: ComponentType
  slots: FloorPlateSlot[]
}

export interface UnitLocation {
  floor: number
  slot: string
}

export interface BuildingConfig {
  image: UnitImage
  /** Coordinate space of `floors[].d`; should match the render's intrinsic size. */
  viewBox: string
  floors: BuildingFloor[]
  sections: BuildingSection[]
  plates: FloorPlate[]
  /** Maps a unit from the data source to its plate slot. Defaults to parsing `unitNumber`. */
  resolveUnit?: (unit: Unit) => UnitLocation | null
  /** Builds the unit number shown on a slot that has no unit in the data. Defaults to `${floor}${slot}`. */
  formatUnitNumber?: (floor: number, slot: string) => string
}

export type SlotStatus = 'available' | 'notMatching' | 'unavailable'
