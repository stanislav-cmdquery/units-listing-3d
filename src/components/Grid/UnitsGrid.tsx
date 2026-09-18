'use client'

import { useMemo } from 'react'

import type { Unit } from '../../types/unit'
import type { ViewMode } from '../../types/nav'
import { useUnitsListingConfig } from '../../context/UnitsListingContext'
import type { useUnitsFilter } from '../../hooks/useUnitsFilter'
import { FiltersDropdown } from '../Filters/FiltersDropdown'
import { UnitTypeFilter } from '../Filters/UnitTypeFilter'
import './UnitsGrid.css'

export type UnitsFilter = ReturnType<typeof useUnitsFilter>

type Props = {
  filter: UnitsFilter
  view: Exclude<ViewMode, '3d'>
  viewToggle: React.ReactNode
  isLoading: boolean
  isError: boolean
  onRetry?: () => void
  pageSize?: number
  header?: React.ReactNode
  showUnitTypeFilter?: boolean
  renderCard: (unit: Unit) => React.ReactNode
  renderSkeletons: () => React.ReactNode
  renderTable: (units: Unit[]) => React.ReactNode
}

export function UnitsGrid({
  filter,
  view,
  viewToggle,
  isLoading,
  isError,
  onRetry,
  pageSize,
  header,
  showUnitTypeFilter = false,
  renderCard,
  renderSkeletons,
  renderTable,
}: Props) {
  const config = useUnitsListingConfig()
  const limit = pageSize ?? config.pageSize
  const { labels } = config

  const {
    bathFilter,
    setBathFilter,
    priceMinStr,
    setPriceMinStr,
    priceMaxStr,
    setPriceMaxStr,
    outdoorFilter,
    toggleOutdoor,
    outdoorOptions,
    bathOptions,
    unitTypeFilter,
    toggleUnitType,
    clearUnitTypeFilter,
    unitTypeOptions,
    filteredUnits,
    hasActiveFilters,
    isDropdownActive,
    clearAll,
    clearDropdown,
  } = filter

  const limited = useMemo(() => filteredUnits.slice(0, limit), [filteredUnits, limit])

  const controls = (
    <>
      {header && <div className="ul-grid-header">{header}</div>}
      <div className="ul-grid-controls">
        <div className="ul-grid-controls-left">
          {viewToggle}
        </div>
        <div className="ul-grid-controls-right">
          {showUnitTypeFilter && (
            <UnitTypeFilter
              className="ul-grid-unit-type-filter"
              options={unitTypeOptions}
              value={unitTypeFilter}
              onToggle={toggleUnitType}
              onSelectAll={clearUnitTypeFilter}
              allLabel={labels.unitTypeAllLabel}
            />
          )}
          <FiltersDropdown
            bathOptions={bathOptions}
            bathFilter={bathFilter}
            priceMinStr={priceMinStr}
            priceMaxStr={priceMaxStr}
            outdoorOptions={outdoorOptions}
            outdoorFilter={outdoorFilter}
            onBathChange={setBathFilter}
            onPriceMinChange={setPriceMinStr}
            onPriceMaxChange={setPriceMaxStr}
            onToggleOutdoor={toggleOutdoor}
            onClear={clearDropdown}
            isActive={isDropdownActive}
          />
        </div>
      </div>
    </>
  )

  if (isLoading) {
    return (
      <div className="ul-grid-root">
        {controls}
        <div className="ul-grid-grid">{renderSkeletons()}</div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="ul-grid-root">
        {controls}
        <div className="ul-grid-error">
          {onRetry ? (
            <button type="button" className="ul-grid-error-retry" onClick={onRetry}>
              {labels.retry}
            </button>
          ) : (
            labels.retry
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="ul-grid-root">
      {controls}

      {limited.length === 0 ? (
        <div className="ul-grid-empty">
          <p className="ul-grid-empty-title">{labels.emptyTitle}</p>
          {hasActiveFilters && (
            <button type="button" className="ul-grid-empty-clear" onClick={clearAll}>
              {labels.clearFilters}
            </button>
          )}
        </div>
      ) : view === 'card' ? (
        <div className="ul-grid-grid">{limited.map(renderCard)}</div>
      ) : (
        renderTable(limited)
      )}
    </div>
  )
}
