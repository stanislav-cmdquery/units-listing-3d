'use client'

import clsx from 'clsx'

import { useUnitsListingConfig } from '../../context/UnitsListingContext'
import type { BuildingConfig } from '../../types/building'

type Props = {
  building: BuildingConfig
  activeFloor: number | null
  onHover: (floor: number | null) => void
  onSelect: (floor: number) => void
}

export function BuildingMap({ building, activeFloor, onHover, onSelect }: Props) {
  const { ImageComponent } = useUnitsListingConfig()
  const [, , vbWidth, vbHeight] = building.viewBox.split(/[\s,]+/).map(Number)

  return (
    <div className="ul-bmap-root" style={{ aspectRatio: `${vbWidth} / ${vbHeight}` }}>
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
    </div>
  )
}
