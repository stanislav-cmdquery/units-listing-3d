import type { BuildingConfig } from '../../types/building'
import type { FloorIndex } from '../../utils/building'

/** Everything the 3D screens derive from the units + building config, computed once in Availability3D. */
export interface BuildingModel {
  building: BuildingConfig
  /** All units (any status) placed on their plate slots. */
  floorIndex: FloorIndex
  /** Ids of available units that pass the active filters. */
  matchingIds: ReadonlySet<string>
  /** Matching available units per floor. */
  availableByFloor: ReadonlyMap<number, number>
  totalAvailable: number
  floors: number[]
}
