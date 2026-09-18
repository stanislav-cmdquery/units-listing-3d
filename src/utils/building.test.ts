import { describe, expect, it } from 'vitest'

import type { BuildingConfig, FloorPlateSlot } from '../types/building'
import type { Unit } from '../types/unit'
import {
  buildFloorIndex,
  countUnitsByFloor,
  defaultResolveUnit,
  formatSlotUnitNumber,
  getOrdinal,
  getPlateForFloor,
  getSlotStatus,
  isUnitAvailable,
  placeUnit,
} from './building'

function unit(partial: Partial<Unit> & { id: string; unitNumber: string }): Unit {
  return { beds: 1, baths: 1, price: { net: 2000, gross: 2000 }, ...partial }
}

function slot(id: string): FloorPlateSlot {
  return { slot: id, section: id.slice(-1), d: 'M0 0H1V1Z', labelX: 0, labelY: 0, typeLabel: '1-Bed' }
}

const config: BuildingConfig = {
  image: { src: '/building.png' },
  viewBox: '0 0 100 100',
  floors: [],
  sections: [],
  plates: [
    { id: 'low', floors: [1, 2, 3], viewBox: '0 0 10 10', Base: () => null, slots: [slot('01A'), slot('02B')] },
    { id: 'high', floors: [16, 17], viewBox: '0 0 10 10', Base: () => null, slots: [slot('01A')] },
  ],
}

describe('defaultResolveUnit', () => {
  it('splits a single-digit floor from the slot', () => {
    expect(defaultResolveUnit(unit({ id: '1', unitNumber: '304A' }))).toEqual({ floor: 3, slot: '04A' })
  })

  it('handles two-digit floors', () => {
    expect(defaultResolveUnit(unit({ id: '1', unitNumber: '1204A' }))).toEqual({ floor: 12, slot: '04A' })
    expect(defaultResolveUnit(unit({ id: '1', unitNumber: '2401' }))).toEqual({ floor: 24, slot: '01' })
  })

  it('normalizes case and whitespace', () => {
    expect(defaultResolveUnit(unit({ id: '1', unitNumber: ' 305c ' }))).toEqual({ floor: 3, slot: '05C' })
  })

  it('prefers the explicit floor field', () => {
    expect(defaultResolveUnit(unit({ id: '1', unitNumber: '304A', floor: 7 }))).toEqual({ floor: 7, slot: '04A' })
  })

  it('returns null for numbers it cannot parse', () => {
    expect(defaultResolveUnit(unit({ id: '1', unitNumber: 'PH-A' }))).toBeNull()
    expect(defaultResolveUnit(unit({ id: '1', unitNumber: '04' }))).toBeNull()
  })

  it('is overridden by config.resolveUnit', () => {
    const custom: BuildingConfig = { ...config, resolveUnit: () => ({ floor: 9, slot: 'X' }) }
    const index = buildFloorIndex(custom, [unit({ id: '1', unitNumber: '304A' })])
    expect(index.get(9)?.get('X')?.id).toBe('1')
  })
})

describe('isUnitAvailable', () => {
  it('treats a missing status as available', () => {
    expect(isUnitAvailable(unit({ id: '1', unitNumber: '301A' }))).toBe(true)
    expect(isUnitAvailable(unit({ id: '1', unitNumber: '301A', status: null }))).toBe(true)
  })

  it('rejects leased and off-market units', () => {
    expect(isUnitAvailable(unit({ id: '1', unitNumber: '301A', status: 'rented' }))).toBe(false)
    expect(isUnitAvailable(unit({ id: '1', unitNumber: '301A', status: 'not_available' }))).toBe(false)
  })
})

describe('getSlotStatus', () => {
  const available = unit({ id: 'a', unitNumber: '301A', status: 'available' })
  const rented = unit({ id: 'r', unitNumber: '302A', status: 'rented' })

  it('is unavailable without a unit or for a leased one', () => {
    expect(getSlotStatus(undefined, new Set(['a']))).toBe('unavailable')
    expect(getSlotStatus(rented, new Set(['r']))).toBe('unavailable')
  })

  it('separates matching and not matching available units', () => {
    expect(getSlotStatus(available, new Set(['a']))).toBe('available')
    expect(getSlotStatus(available, new Set())).toBe('notMatching')
  })
})

describe('floor helpers', () => {
  const units = [
    unit({ id: '1', unitNumber: '301A' }),
    unit({ id: '2', unitNumber: '302B' }),
    unit({ id: '3', unitNumber: '1601A' }),
    unit({ id: '4', unitNumber: 'garage' }),
  ]

  it('indexes units by floor and slot', () => {
    const index = buildFloorIndex(config, units)
    expect(index.get(3)?.get('01A')?.id).toBe('1')
    expect(index.get(3)?.get('02B')?.id).toBe('2')
    expect(index.get(16)?.get('01A')?.id).toBe('3')
  })

  it('counts units per floor and skips unplaceable ones', () => {
    const counts = countUnitsByFloor(config, units)
    expect(counts.get(3)).toBe(2)
    expect(counts.get(16)).toBe(1)
    expect([...counts.values()].reduce((a, b) => a + b, 0)).toBe(3)
  })

  it('does not count units whose slot is missing on the plate', () => {
    const offPlate = [unit({ id: 'x', unitNumber: '2404' }), unit({ id: 'y', unitNumber: '304A' }), unit({ id: 'z', unitNumber: '1001A' })]
    expect(placeUnit(config, offPlate[0])).toBeNull() // slot 04 is not on the plate
    expect(placeUnit(config, offPlate[1])).toBeNull() // slot 04A is not on the plate
    expect(placeUnit(config, offPlate[2])).toBeNull() // floor 10 has no plate
    expect(countUnitsByFloor(config, offPlate).size).toBe(0)
  })

  it('finds the plate for a floor', () => {
    expect(getPlateForFloor(config, 2)?.id).toBe('low')
    expect(getPlateForFloor(config, 17)?.id).toBe('high')
    expect(getPlateForFloor(config, 10)).toBeNull()
  })

  it('formats slot unit numbers', () => {
    expect(formatSlotUnitNumber(config, 12, '04A')).toBe('1204A')
    expect(formatSlotUnitNumber({ ...config, formatUnitNumber: (f, s) => `${s}-${f}` }, 3, '04A')).toBe('04A-3')
  })
})

describe('getOrdinal', () => {
  it.each([
    [1, '1st'],
    [2, '2nd'],
    [3, '3rd'],
    [4, '4th'],
    [11, '11th'],
    [12, '12th'],
    [13, '13th'],
    [21, '21st'],
    [22, '22nd'],
    [23, '23rd'],
  ])('%i -> %s', (n, expected) => {
    expect(getOrdinal(n)).toBe(expected)
  })
})
