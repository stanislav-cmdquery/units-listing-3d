'use client'

import clsx from 'clsx'
import { useMemo, type CSSProperties } from 'react'

import { useUnitsListingConfig } from '../../context/UnitsListingContext'
import type { BuildingConfig } from '../../types/building'
import { getOrdinal } from '../../utils/building'
import { getPathBounds, parseViewBox } from '../../utils/svgPath'

type Props = {
  building: BuildingConfig
  activeFloor: number | null
  onHover: (floor: number | null) => void
  onSelect: (floor: number) => void
}

export function BuildingMap({ building, activeFloor, onHover, onSelect }: Props) {
  const { ImageComponent, labels } = useUnitsListingConfig()
  const box = parseViewBox(building.viewBox)

  // The floor label sits just right of the building, level with the floor band.
  const labelPositions = useMemo(() => {
    const positions = new Map<number, { left: string; top: string }>()
    for (const { floor, d } of building.floors) {
      const bounds = getPathBounds(d)
      if (!bounds) continue
      positions.set(floor, {
        left: `${((bounds.maxX - box.x) / box.width) * 100}%`,
        top: `${(((bounds.minY + bounds.maxY) / 2 - box.y) / box.height) * 100}%`,
      })
    }
    return positions
  }, [building.floors, box.x, box.y, box.width, box.height])

  const label = activeFloor != null ? labelPositions.get(activeFloor) : undefined

  return (
    <div className="ul-bmap-root" style={{ '--ul-bmap-ratio': box.width / box.height } as CSSProperties}>
      <ImageComponent
        src={building.image.src}
        alt={building.image.alt ?? ''}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="ul-bmap-image"
        blurDataURL={building.image.blurDataURL}
      />
      {/* Pointer-only shortcut: keyboard and screen reader users pick floors via the pills. */}
      <svg className="ul-bmap-svg" viewBox={building.viewBox} aria-hidden="true" onMouseLeave={() => onHover(null)}>
        {building.floors.map(({ floor, d }) => (
          <path
            key={floor}
            d={d}
            className={clsx('ul-bmap-floor', activeFloor === floor && 'ul-bmap-floor-active')}
            onMouseEnter={() => onHover(floor)}
            onClick={() => onSelect(floor)}
          />
        ))}
      </svg>
      {activeFloor != null && label && (
        <span className="ul-bmap-label" style={label} aria-hidden="true">
          {labels.floorLabel.replace('{floor}', getOrdinal(activeFloor))}
        </span>
      )}
    </div>
  )
}
