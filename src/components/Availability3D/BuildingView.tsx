'use client'

import { useState, type ReactNode } from 'react'

import { useUnitsListingConfig } from '../../context/UnitsListingContext'
import { Pills } from '../../ui/Pills'
import { getOrdinal } from '../../utils/building'
import { BuildingMap } from './BuildingMap'
import type { BuildingModel } from './model'

type Props = {
  model: BuildingModel
  header?: ReactNode
  viewToggle: ReactNode
  onSelectFloor: (floor: number) => void
}

export function BuildingView({ model, header, viewToggle, onSelectFloor }: Props) {
  const { labels } = useUnitsListingConfig()
  const [hoveredFloor, setHoveredFloor] = useState<number | null>(null)

  const hint =
    hoveredFloor != null
      ? `${getOrdinal(hoveredFloor)} ${labels.floorSuffix} · ${model.availableByFloor.get(hoveredFloor) ?? 0} ${labels.statusAvailable.toLowerCase()}`
      : labels.hoverToSelectFloor

  return (
    <div className="ul-3d-building">
      <div className="ul-3d-building-aside">
        {header && <div className="ul-3d-header">{header}</div>}
        {viewToggle}
        <div className="ul-3d-field ul-3d-building-floors">
          <p className="ul-3d-field-label">{labels.selectFloor}</p>
          <Pills
            label={labels.selectFloor}
            options={model.floors.map((floor) => ({
              value: floor,
              label: floor,
              ariaLabel: `${getOrdinal(floor)} ${labels.floorSuffix}, ${model.availableByFloor.get(floor) ?? 0} ${labels.statusAvailable.toLowerCase()}`,
            }))}
            value={null}
            highlighted={hoveredFloor}
            onChange={onSelectFloor}
            onHover={setHoveredFloor}
            className="ul-3d-floor-pills"
          />
        </div>
      </div>

      <div className="ul-3d-building-stage">
        <p className="ul-3d-chip ul-3d-building-hint" aria-live="polite">
          {hint}
        </p>
        <BuildingMap
          building={model.building}
          activeFloor={hoveredFloor}
          onHover={setHoveredFloor}
          onSelect={onSelectFloor}
        />
        <p className="ul-3d-building-total">
          <span className="ul-legend-dot ul-legend-dot-available" aria-hidden="true" />
          {model.totalAvailable} {labels.availableApartments}
        </p>
      </div>
    </div>
  )
}
