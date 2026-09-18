export type ViewMode = '3d' | 'card' | 'list'

/**
 * Where the user is inside the listing. In the 3D view the step is derived from the fields:
 * `unit` set -> unit view, `floor` set -> floor view, otherwise the building view.
 */
export interface AvailabilityNav {
  view: ViewMode
  floor: number | null
  /** Selected building section; on mobile it picks which part of the floor plate is shown. */
  section: string | null
  /** `Unit.unitNumber` of the opened unit. */
  unit: string | null
}

export interface NavChangeMeta {
  /** True for step transitions (building -> floor -> unit) that deserve a history entry. */
  push: boolean
}
