'use client'

import { useUnitsListingConfig } from '../../context/UnitsListingContext'
import { Pills } from '../../ui/Pills'
import { getSectionsForFloor } from '../../utils/building'
import { RangeSlider } from '../../ui/RangeSlider'
import type { UnitsFilter } from '../Grid/UnitsGrid'
import type { BuildingModel } from './model'
import { PriceInput } from './PriceInput'

type Props = {
  model: BuildingModel
  filter: UnitsFilter
  floor: number | null
  onFloorChange: (floor: number) => void
  /** Building sections; omitted where the section switcher lives elsewhere (mobile). */
  section?: string | null
  onSectionChange?: (section: string | null) => void
  showClear?: boolean
}

type AnyOr<T> = 'any' | T

export function FloorFilters({
  model,
  filter,
  floor,
  onFloorChange,
  section,
  onSectionChange,
  showClear = true,
}: Props) {
  const { labels, priceStep } = useUnitsListingConfig()
  const { priceBounds } = filter
  // Upper floors can drop a section entirely, so the picker follows the floor rather than the building.
  const sections = floor != null ? getSectionsForFloor(model.building, floor) : model.building.sections
  const hasPriceRange = priceBounds.max > priceBounds.min

  const bedsValue: AnyOr<number> = filter.unitTypeFilter.length === 1 ? filter.unitTypeFilter[0] : 'any'
  const priceLow = filter.priceMinStr !== '' ? Number(filter.priceMinStr) : priceBounds.min
  const priceHigh = filter.priceMaxStr !== '' ? Number(filter.priceMaxStr) : priceBounds.max

  // A thumb resting on its bound means "no limit", so the filter stays inactive.
  const handlePriceChange = ([low, high]: [number, number]) => {
    filter.setPriceMinStr(low <= priceBounds.min ? '' : String(low))
    filter.setPriceMaxStr(high >= priceBounds.max ? '' : String(high))
  }

  return (
    <div className="ul-3d-filters">
      {onSectionChange && sections.length > 1 && (
        <div className="ul-3d-field">
          <p className="ul-3d-field-label">{labels.selectBuilding}</p>
          <Pills
            label={labels.selectBuilding}
            className="ul-3d-section-pills"
            options={sections.map((s) => ({ value: s.id, label: s.label }))}
            value={section ?? null}
            // Toggle: clicking the selected building clears the emphasis.
            onChange={(id) => onSectionChange(id === section ? null : id)}
          />
        </div>
      )}

      <div className="ul-3d-field">
        <p className="ul-3d-field-label">{labels.selectFloor}</p>
        <Pills
          label={labels.selectFloor}
          className="ul-3d-floor-pills"
          options={model.floors.map((f) => ({ value: f, label: f }))}
          value={floor}
          onChange={onFloorChange}
        />
      </div>

      {filter.unitTypeOptions.length > 0 && (
        <div className="ul-3d-field">
          <p className="ul-3d-field-label">{labels.bedsLabel}</p>
          <Pills<AnyOr<number>>
            label={labels.bedsLabel}
            options={[
              { value: 'any', label: labels.anyLabel },
              ...filter.unitTypeOptions.map((beds) => ({
                value: beds,
                label: beds === 0 ? labels.studioLabel : beds,
              })),
            ]}
            value={bedsValue}
            onChange={(v) => filter.selectUnitType(v === 'any' ? null : v)}
          />
        </div>
      )}

      {filter.bathOptions.length > 0 && (
        <div className="ul-3d-field">
          <p className="ul-3d-field-label">{labels.bathroomsLabel}</p>
          <Pills<AnyOr<number>>
            label={labels.bathroomsLabel}
            options={[
              { value: 'any', label: labels.anyLabel },
              ...filter.bathOptions.map((baths) => ({ value: baths, label: baths })),
            ]}
            value={filter.bathFilter === 'all' ? 'any' : filter.bathFilter}
            onChange={(v) => filter.setBathFilter(v === 'any' ? 'all' : v)}
          />
        </div>
      )}

      {hasPriceRange && (
        <div className="ul-3d-field ul-3d-field-price">
          <p className="ul-3d-field-label">{labels.priceRangeLabel}</p>
          <RangeSlider
            min={priceBounds.min}
            max={priceBounds.max}
            step={priceStep}
            value={[priceLow, priceHigh]}
            onChange={handlePriceChange}
            ariaLabelMin={labels.minimum}
            ariaLabelMax={labels.maximum}
          />
          <div className="ul-3d-price-values">
            <PriceInput
              label={labels.minimum}
              value={priceLow}
              onCommit={(v) => handlePriceChange([Math.min(Math.max(v, priceBounds.min), priceHigh), priceHigh])}
            />
            <PriceInput
              label={labels.maximum}
              value={priceHigh}
              align="end"
              onCommit={(v) => handlePriceChange([priceLow, Math.max(Math.min(v, priceBounds.max), priceLow)])}
            />
          </div>
        </div>
      )}

      {showClear && (
        <button
          type="button"
          className="ul-3d-clear"
          onClick={filter.clearAll}
          disabled={!filter.hasActiveFilters}
        >
          {labels.clearAllFilters}
        </button>
      )}
    </div>
  )
}
