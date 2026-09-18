'use client'

import clsx from 'clsx'
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

  // Hovering a floor narrows the counter to that floor; the facade label names the floor.
  const available = hoveredFloor != null ? (model.availableByFloor.get(hoveredFloor) ?? 0) : model.totalAvailable

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
        {/* Hidden (not removed) while a floor is hovered so the facade doesn't jump. */}
        <p className={clsx('ul-3d-chip ul-3d-building-hint', hoveredFloor != null && 'ul-3d-building-hint-hidden')}>
          {labels.hoverToSelectFloor}
        </p>
        <div className="ul-3d-building-map">
          <BuildingMap
            building={model.building}
            activeFloor={hoveredFloor}
            onHover={setHoveredFloor}
            onSelect={onSelectFloor}
          />
        </div>
        <p className="ul-3d-building-total" aria-live="polite">
          <span className="ul-legend-dot ul-legend-dot-available" aria-hidden="true" />
          {available} {labels.availableApartments}
        </p>
      </div>
    </div>
  )
}
