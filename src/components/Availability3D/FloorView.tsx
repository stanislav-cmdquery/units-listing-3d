'use client'

import { useUnitsListingConfig } from '../../context/UnitsListingContext'
import { DESKTOP_QUERY, useMediaQuery } from '../../hooks/useMediaQuery'
import { Pills } from '../../ui/Pills'
import { getOrdinal, getPlateForFloor } from '../../utils/building'
import type { UnitsFilter } from '../Grid/UnitsGrid'
import { BackButton } from './BackButton'
import { FiltersSheet } from './FiltersSheet'
import { FloorFilters } from './FloorFilters'
import { FloorPlateMap } from './FloorPlateMap'
import type { BuildingModel } from './model'
import { StatusLegend } from './StatusLegend'

type Props = {
  model: BuildingModel
  filter: UnitsFilter
  floor: number
  section: string | null
  onFloorChange: (floor: number) => void
  onSectionChange: (section: string | null) => void
  onSelectUnit: (unitNumber: string) => void
  onBack: () => void
}

export function FloorView({
  model,
  filter,
  floor,
  section,
  onFloorChange,
  onSectionChange,
  onSelectUnit,
  onBack,
}: Props) {
  const { labels } = useUnitsListingConfig()
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const plate = getPlateForFloor(model.building, floor)
  const { sections } = model.building
  // Mobile always shows a single section of the plate; default to the first one.
  const mobileSection = section ?? sections[0]?.id ?? null

  return (
    <div className="ul-3d-split">
      <aside className="ul-3d-split-aside ul-3d-desktop-only">
        <FloorFilters
          model={model}
          filter={filter}
          floor={floor}
          onFloorChange={onFloorChange}
          section={section}
          onSectionChange={onSectionChange}
        />
      </aside>

      <div className="ul-3d-split-main ul-3d-floor-main">
        <BackButton label={labels.returnToBuilding} onClick={onBack} />

        {sections.length > 1 && (
          <div className="ul-3d-field ul-3d-mobile-only">
            <p className="ul-3d-field-label">{labels.selectBuilding}</p>
            <Pills
              label={labels.selectBuilding}
              scroll
              options={sections.map((s) => ({ value: s.id, label: s.label }))}
              value={mobileSection}
              onChange={onSectionChange}
            />
          </div>
        )}

        <div className="ul-3d-floor-stage">
          {plate ? (
            <FloorPlateMap
              model={model}
              plate={plate}
              floor={floor}
              activeSection={isDesktop ? section : null}
              cropSection={isDesktop ? null : mobileSection}
              onSelectUnit={onSelectUnit}
            />
          ) : (
            <p className="ul-3d-empty">{labels.emptyTitle}</p>
          )}
          <p className="ul-3d-chip ul-3d-mobile-only">
            {getOrdinal(floor)} {labels.floorSuffix}
          </p>
        </div>

        <StatusLegend />
      </div>

      <div className="ul-3d-mobile-only ul-3d-sheet-dock">
        <FiltersSheet resultsCount={model.availableByFloor.get(floor) ?? 0} onClear={filter.clearAll}>
          <FloorFilters model={model} filter={filter} floor={floor} onFloorChange={onFloorChange} showClear={false} />
        </FiltersSheet>
      </div>
    </div>
  )
}
