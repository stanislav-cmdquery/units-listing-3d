import { useCallback, useMemo, useState } from 'react'

import type { Unit } from '../types/unit'

export type BathFilter = number | 'all'
export type OutdoorFilter = string[]
export type UnitTypeFilterValue = number[]

function computePriceBounds(units: Unit[], step = 50): { min: number; max: number } {
  const prices = units.map((u) => u.price.net).filter((p): p is number => p != null && p > 0)
  if (!prices.length) return { min: 0, max: 0 }
  return {
    min: Math.floor(Math.min(...prices) / step) * step,
    max: Math.ceil(Math.max(...prices) / step) * step,
  }
}

export function useUnitsFilter(units: Unit[], priceStep = 50) {
  const [bathFilter, setBathFilter] = useState<BathFilter>('all')
  const [priceMinStr, setPriceMinStr] = useState('')
  const [priceMaxStr, setPriceMaxStr] = useState('')
  const [outdoorFilter, setOutdoorFilter] = useState<OutdoorFilter>([])
  const [unitTypeFilter, setUnitTypeFilter] = useState<UnitTypeFilterValue>([])

  const priceBounds = useMemo(() => computePriceBounds(units, priceStep), [units, priceStep])

  const bathOptions = useMemo(
    () => Array.from(new Set(units.map((u) => u.baths))).sort((a, b) => a - b),
    [units]
  )

  // Exclude '' so blank outdoor values never become invisible pill buttons
  const outdoorOptions = useMemo(
    () =>
      Array.from(
        new Set(units.map((u) => u.outdoor).filter((v): v is string => v != null && v !== 'none' && v !== ''))
      ).sort(),
    [units]
  )

  // Derive active selection by intersecting with available options
  const activeOutdoorFilter = useMemo(
    () => outdoorFilter.filter((v) => outdoorOptions.includes(v)),
    [outdoorFilter, outdoorOptions]
  )

  const unitTypeOptions = useMemo(
    () => Array.from(new Set(units.map((u) => u.beds))).sort((a, b) => a - b),
    [units]
  )

  const activeUnitTypeFilter = useMemo(
    () => unitTypeFilter.filter((v) => unitTypeOptions.includes(v)),
    [unitTypeFilter, unitTypeOptions]
  )

  const filteredUnits = useMemo(() => {
    const parsedMin = priceMinStr !== '' ? Number(priceMinStr) : null
    const parsedMax = priceMaxStr !== '' ? Number(priceMaxStr) : null

    return units.filter((unit) => {
      if (bathFilter !== 'all' && unit.baths !== bathFilter) return false
      if (activeOutdoorFilter.length > 0 && !activeOutdoorFilter.includes(unit.outdoor ?? '')) return false
      if (activeUnitTypeFilter.length > 0 && !activeUnitTypeFilter.includes(unit.beds)) return false
      if (parsedMin !== null && (unit.price.net == null || unit.price.net < parsedMin)) return false
      if (parsedMax !== null && (unit.price.net == null || unit.price.net > parsedMax)) return false
      return true
    })
  }, [units, bathFilter, activeOutdoorFilter, activeUnitTypeFilter, priceMinStr, priceMaxStr])

  // isDropdownActive reflects only the filters inside the FiltersDropdown popup
  // (bath/price/outdoor); the unit-type filter lives outside it and styles its own buttons.
  const isDropdownActive =
    bathFilter !== 'all' || priceMinStr !== '' || priceMaxStr !== '' || activeOutdoorFilter.length > 0
  const hasActiveFilters = isDropdownActive || activeUnitTypeFilter.length > 0

  const clearDropdown = () => {
    setBathFilter('all')
    setPriceMinStr('')
    setPriceMaxStr('')
    setOutdoorFilter([])
  }
  const clearAll = () => {
    clearDropdown()
    setUnitTypeFilter([])
  }

  const toggleOutdoor = useCallback((v: string) => {
    setOutdoorFilter((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]))
  }, [])

  const toggleUnitType = useCallback((beds: number) => {
    setUnitTypeFilter((prev) => (prev.includes(beds) ? prev.filter((b) => b !== beds) : [...prev, beds]))
  }, [])

  const clearUnitTypeFilter = useCallback(() => setUnitTypeFilter([]), [])

  // Single-select variant used by the 3D view; shares state with the multi-select pills.
  const selectUnitType = useCallback((beds: number | null) => setUnitTypeFilter(beds == null ? [] : [beds]), [])

  return {
    bathFilter,
    setBathFilter,
    priceMinStr,
    setPriceMinStr,
    priceMaxStr,
    setPriceMaxStr,
    outdoorFilter: activeOutdoorFilter,
    toggleOutdoor,
    unitTypeFilter: activeUnitTypeFilter,
    toggleUnitType,
    clearUnitTypeFilter,
    selectUnitType,
    priceBounds,
    bathOptions,
    outdoorOptions,
    unitTypeOptions,
    filteredUnits,
    hasActiveFilters,
    isDropdownActive,
    clearAll,
    clearDropdown,
  }
}
