import type { Unit } from '../types/unit'

// Shape mirrors SeeClickRent's Building Units API:
// https://seeclickrent.com/developers/building-units-api
//
// Notes that matter for consumers:
// - `floor_plan` is `null` when the unit has no plan uploaded.
// - `floor_plan.original` may be a PDF (no rasterisable preview) — in that
//   case `floor_plan.thumbnail` is `null`. Anything that wants to render the
//   floor plan as an image must use `thumbnail` and fall back to skipping it.
// - `monthly_rent_gross` / `monthly_rent_net` are `null` when the unit has
//   `price_advertised: false`.
// - `square_feet` is sometimes the literal string `"N/A"`.

export type ScrAttachment = {
  original: string
  thumbnail: string | null
}

export type ScrUnit = {
  id: number
  building_id: number
  floor: number | null
  unit: string
  bed: number
  bath: number
  exposure: string | null
  status: string
  monthly_rent_gross: number | null
  monthly_rent_net: number | null
  square_feet: number | string
  weeks_free: number | string | null
  months_free: number | null
  lease_term: number | string | null
  floor_plan: ScrAttachment | null
  images: ScrAttachment[]
  price_advertised: boolean
  date_available?: string | null
  created_at: string
  updated_at: string
}

export function mapScrUnit(raw: ScrUnit): Unit {
  return {
    id: String(raw.id),
    unitNumber: raw.unit,
    floor: raw.floor,
    status: raw.status,
    buildingId: raw.building_id,
    beds: raw.bed,
    baths: raw.bath,
    price: {
      net: raw.monthly_rent_net,
      gross: raw.monthly_rent_gross,
    },
    images: raw.images.map((img) => ({
      src: img.thumbnail ?? img.original,
      original: img.original,
      alt: `Unit ${raw.unit} photo`,
    })),
    floorPlan: raw.floor_plan?.thumbnail
      ? { src: raw.floor_plan.thumbnail, original: raw.floor_plan.original, alt: 'Floor plan' }
      : null,
    floorPlanUrl: raw.floor_plan?.original ?? null,
    concession: raw.months_free
      ? { type: 'months', value: raw.months_free }
      : raw.weeks_free != null
        ? { type: 'weeks', value: raw.weeks_free }
        : null,
    leaseTerm: raw.lease_term,
    outdoor: null,
  }
}
