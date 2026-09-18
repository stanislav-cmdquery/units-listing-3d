export type SortKey = 'unit' | 'beds' | 'baths' | 'price'
export type SortDirection = 'asc' | 'desc'

export interface SortState {
  key: SortKey
  direction: SortDirection
}

export interface PriceRange {
  min: number
  max: number
}

export interface UnitsFilterState {
  bathFilter: number | 'all'
  priceMinStr: string
  priceMaxStr: string
  outdoorFilter: string[]
  unitTypeFilter: number[]
}

export interface UnitsFilterConfig {
  priceStep?: number
  defaultLimit?: number
}
