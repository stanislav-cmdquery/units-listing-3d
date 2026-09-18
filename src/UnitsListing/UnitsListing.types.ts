import type { CSSProperties, ReactNode } from 'react'
import type { Unit } from '../types/unit'
import type { BuildingConfig } from '../types/building'
import type { AvailabilityNav, NavChangeMeta, ViewMode } from '../types/nav'
import type { UnitsListingTheme, UnitsListingThemeVars } from '../types/theme'
import type { UnitsListingLabels } from '../context/UnitsListingContext'
import type { ImageComponent } from '../adapters/image'
import type { CopyIconComponent } from '../adapters/copyIcon'
import type { MotionAdapter } from '../adapters/motion'

export type { ViewMode }

export interface UnitsListingProps {
  units: Unit[]
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
  /** Enables the 3D view. Without it only the card and list views are offered. */
  building?: BuildingConfig
  /** Views offered by the toggle, in order. Defaults to `['3d', 'card', 'list']` with a building, else `['card', 'list']`. */
  views?: ViewMode[]
  defaultView?: ViewMode
  /** Controlled navigation state (view, floor, section, unit). */
  nav?: AvailabilityNav
  /** Initial navigation state when uncontrolled, e.g. parsed from the URL on first render. */
  defaultNav?: Partial<AvailabilityNav>
  onNavChange?: (nav: AvailabilityNav, meta: NavChangeMeta) => void
  /** Link put into the share popup. Defaults to the current URL with the unit's nav params. */
  getUnitShareUrl?: (unit: Unit) => string
  showUnitTypeFilter?: boolean
  pageSize?: number
  skeletonCount?: number
  priceStep?: number
  labels?: Partial<UnitsListingLabels>
  theme?: UnitsListingTheme
  themeVars?: UnitsListingThemeVars
  className?: string
  style?: CSSProperties
  header?: ReactNode
  ImageComponent?: ImageComponent
  CopyIconComponent?: CopyIconComponent
  motion?: MotionAdapter
  onBookTour?: (unit: Unit) => void
  renderBookTourModal?: (ctx: { unit: Unit; close: () => void }) => ReactNode
}
