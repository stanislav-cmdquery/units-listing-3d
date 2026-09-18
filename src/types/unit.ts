export interface UnitImage {
  src: string
  /** Full-resolution version of the image, used in the enlarged/lightbox view. Falls back to `src` if omitted. */
  original?: string
  alt?: string
  width?: number
  height?: number
  blurDataURL?: string
}

export interface UnitPrice {
  net: number | null
  gross: number | null
  currency?: string
}

export interface UnitConcession {
  type: 'months' | 'weeks'
  value: number | string
}

export type UnitStatus = 'available' | 'rented' | 'not_available'

export interface Unit {
  id: string
  unitNumber: string
  /** Floor number as reported by the data source. Falls back to parsing `unitNumber` when omitted. */
  floor?: number | null
  /** Leasing status. Units without a status are treated as available. */
  status?: UnitStatus | (string & {}) | null
  buildingId?: string | number | null
  beds: number
  baths: number
  price: UnitPrice
  images?: UnitImage[]
  floorPlan?: UnitImage | null
  floorPlanUrl?: string | null
  concession?: UnitConcession | null
  leaseTerm?: number | string | null
  outdoor?: string | null
  meta?: Record<string, unknown>
}
