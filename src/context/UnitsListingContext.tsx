'use client'
import { createContext, useContext, type ReactNode } from 'react'
import type { ImageComponent } from '../adapters/image'
import type { MotionAdapter } from '../adapters/motion'
import type { CopyIconComponent } from '../adapters/copyIcon'
import { DefaultImage } from '../adapters/image'
import { defaultMotionAdapter } from '../adapters/motion'
import { DefaultCopyIcon } from '../adapters/copyIcon'

export interface UnitsListingLabels {
  filtersTitle: string
  bathLabel: string
  priceLabel: string
  outdoorLabel: string
  unitTypeAllLabel: string
  bookTour: string
  copyLink: string
  emptyTitle: string
  emptySubtitle: string
  concessionMonths: string
  concessionWeeks: string
  viewCard: string
  viewList: string
  clearFilters: string
  retry: string
  view3d: string
  selectFloor: string
  selectBuilding: string
  hoverToSelectFloor: string
  /** Suffix after the count, e.g. "345 Available Apartments". */
  availableApartments: string
  floorSuffix: string
  returnToBuilding: string
  returnToFloor: string
  statusAvailable: string
  statusNotMatching: string
  statusNotAvailable: string
  bedsLabel: string
  bathroomsLabel: string
  priceRangeLabel: string
  minimum: string
  maximum: string
  anyLabel: string
  studioLabel: string
  clearAllFilters: string
  showResults: string
  shareTitle: string
  shareVia: string
  orCopyLink: string
  copyLinkButton: string
  linkCopied: string
  shareUnit: string
  floorplan: string
  downloadFloorplan: string
  close: string
  previous: string
  next: string
  /** `{concession}` -> e.g. "1-month", `{term}` -> lease term in months. */
  netEffectiveNote: string
  netEffectiveNoteNoTerm: string
  /** Floor plate hover hints; `\n` breaks the line as in the design. */
  hintAvailable: string
  hintNotMatching: string
  hintNotAvailable: string
  /** Label next to the hovered floor on the facade; `{floor}` -> "3rd". */
  floorLabel: string
}

export const defaultLabels: UnitsListingLabels = {
  filtersTitle: 'Filters',
  bathLabel: 'Baths',
  priceLabel: 'Price',
  outdoorLabel: 'Outdoor',
  unitTypeAllLabel: 'All',
  bookTour: 'Book Tour',
  copyLink: 'Copy',
  emptyTitle: 'No units available',
  emptySubtitle: 'Try adjusting your filters',
  concessionMonths: 'Months Free',
  concessionWeeks: 'Weeks Free',
  viewCard: 'Cards',
  viewList: 'List',
  clearFilters: 'Clear',
  retry: 'Try again',
  view3d: '3D',
  selectFloor: 'Select Floor',
  selectBuilding: 'Select Building',
  hoverToSelectFloor: 'Hover to select floor',
  availableApartments: 'Available Apartments',
  floorSuffix: 'floor',
  returnToBuilding: 'Return to building',
  returnToFloor: 'Return to floor',
  statusAvailable: 'Available',
  statusNotMatching: 'Not matching preferences',
  statusNotAvailable: 'Not Available',
  bedsLabel: 'Beds',
  bathroomsLabel: 'Bathrooms',
  priceRangeLabel: 'Price Range',
  minimum: 'Minimum',
  maximum: 'Maximum',
  anyLabel: 'Any',
  studioLabel: 'Studio',
  clearAllFilters: 'Clear Filters',
  showResults: 'Show {count} results',
  shareTitle: 'Share this unit',
  shareVia: 'Share this link via',
  orCopyLink: 'Or copy link',
  copyLinkButton: 'Copy link',
  linkCopied: 'Link copied',
  shareUnit: 'Share unit',
  floorplan: 'Floorplan',
  downloadFloorplan: 'Download floor plan',
  close: 'Close',
  previous: 'Previous',
  next: 'Next',
  netEffectiveNote: '*Net effective cost with {concession} free when you sign a {term}-month lease',
  netEffectiveNoteNoTerm: '*Net effective cost with {concession} free',
  hintAvailable: 'Available. Click to see more details.',
  hintNotMatching: 'Not matching. Try adjusting your\nfilters to see more options.',
  hintNotAvailable: 'At the moment is not available.\nTry to choose other apartment',
  floorLabel: '{floor} Floor',
}

export interface UnitsListingConfig {
  labels: UnitsListingLabels
  ImageComponent: ImageComponent
  CopyIconComponent: CopyIconComponent
  motion: MotionAdapter
  pageSize: number
  skeletonCount: number
  priceStep: number
  onBookTour?: (unit: import('../types/unit').Unit) => void
  renderBookTourModal?: (ctx: { unit: import('../types/unit').Unit; close: () => void }) => ReactNode
}

export interface UnitsListingConfigInput {
  labels?: Partial<UnitsListingLabels>
  ImageComponent?: ImageComponent
  CopyIconComponent?: CopyIconComponent
  motion?: MotionAdapter
  pageSize?: number
  skeletonCount?: number
  priceStep?: number
  onBookTour?: (unit: import('../types/unit').Unit) => void
  renderBookTourModal?: (ctx: { unit: import('../types/unit').Unit; close: () => void }) => ReactNode
}

const UnitsListingContext = createContext<UnitsListingConfig>({
  labels: defaultLabels,
  ImageComponent: DefaultImage,
  CopyIconComponent: DefaultCopyIcon,
  motion: defaultMotionAdapter,
  pageSize: 25,
  skeletonCount: 10,
  priceStep: 50,
})

export function UnitsListingProvider({
  children,
  value,
}: {
  children: ReactNode
  value: UnitsListingConfigInput
}) {
  const merged: UnitsListingConfig = {
    labels: { ...defaultLabels, ...value.labels },
    ImageComponent: value.ImageComponent ?? DefaultImage,
    CopyIconComponent: value.CopyIconComponent ?? DefaultCopyIcon,
    motion: value.motion ?? defaultMotionAdapter,
    pageSize: value.pageSize ?? 25,
    skeletonCount: value.skeletonCount ?? 10,
    priceStep: value.priceStep ?? 50,
    onBookTour: value.onBookTour,
    renderBookTourModal: value.renderBookTourModal,
  }
  return (
    <UnitsListingContext.Provider value={merged}>
      {children}
    </UnitsListingContext.Provider>
  )
}

export function useUnitsListingConfig(): UnitsListingConfig {
  return useContext(UnitsListingContext)
}
