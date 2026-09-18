import type { AvailabilityNav, ViewMode } from '../types/nav'

const VIEWS: ViewMode[] = ['3d', 'card', 'list']

type SearchParamsLike = { get(name: string): string | null }

/** Reads nav from URL search params (`?view=3d&floor=3&section=A&unit=304A`). Missing keys stay unset. */
export function navFromSearchParams(params: SearchParamsLike): Partial<AvailabilityNav> {
  const nav: Partial<AvailabilityNav> = {}
  const view = params.get('view')
  if (view && (VIEWS as string[]).includes(view)) nav.view = view as ViewMode
  const floor = Number(params.get('floor'))
  if (params.get('floor') && Number.isInteger(floor) && floor > 0) nav.floor = floor
  const section = params.get('section')
  if (section) nav.section = section
  const unit = params.get('unit')
  if (unit) nav.unit = unit
  return nav
}

/** Writes nav into a copy of `base`, dropping the 3D-only keys outside the 3D view. */
export function navToSearchParams(nav: AvailabilityNav, base?: URLSearchParams | string): URLSearchParams {
  const params = new URLSearchParams(base)
  for (const key of ['view', 'floor', 'section', 'unit']) params.delete(key)
  params.set('view', nav.view)
  if (nav.view === '3d') {
    if (nav.floor != null) params.set('floor', String(nav.floor))
    if (nav.section) params.set('section', nav.section)
    if (nav.unit) params.set('unit', nav.unit)
  }
  return params
}
