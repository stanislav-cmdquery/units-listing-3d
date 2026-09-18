'use client'

import { useState } from 'react'

import { useUnitsListingConfig } from '../../context/UnitsListingContext'
import type { FloorPlate } from '../../types/building'
import type { Unit } from '../../types/unit'
import { BackButton } from './BackButton'
import { FloorPlateMap } from './FloorPlateMap'
import { CloseIcon, ShareIcon } from './icons'
import type { BuildingModel } from './model'
import { SharePopup } from './SharePopup'
import { StatusLegend } from './StatusLegend'
import { UnitFooter } from './UnitFooter'
import { UnitMedia } from './UnitMedia'

type Props = {
  model: BuildingModel
  plate: FloorPlate
  floor: number
  unit: Unit
  getShareUrl: (unit: Unit) => string
  onSelectUnit: (unitNumber: string) => void
  onBack: () => void
}

export function UnitView({ model, plate, floor, unit, getShareUrl, onSelectUnit, onBack }: Props) {
  const { labels } = useUnitsListingConfig()
  const [shareOpen, setShareOpen] = useState(false)

  return (
    <div className="ul-3d-split ul-3d-unit">
      <div className="ul-3d-unit-plan">
        <div className="ul-3d-unit-topbar">
          <BackButton label={labels.returnToFloor} onClick={onBack} />
          <button
            type="button"
            className="ul-3d-icon-btn ul-3d-mobile-only"
            onClick={() => setShareOpen(true)}
            aria-label={labels.shareUnit}
          >
            <ShareIcon />
          </button>
        </div>
        <div className="ul-3d-unit-plate ul-3d-desktop-only">
          <FloorPlateMap
            model={model}
            plate={plate}
            floor={floor}
            selectedUnit={unit.unitNumber}
            onSelectUnit={onSelectUnit}
          />
        </div>
        <div className="ul-3d-desktop-only">
          <StatusLegend />
        </div>
      </div>

      <div className="ul-3d-unit-details">
        <button type="button" className="ul-3d-icon-btn ul-3d-unit-close ul-3d-desktop-only" onClick={onBack} aria-label={labels.close}>
          <CloseIcon />
        </button>
        <UnitMedia key={unit.id} unit={unit} />
        <UnitFooter unit={unit} onShare={() => setShareOpen(true)} />
      </div>

      {shareOpen && <SharePopup url={getShareUrl(unit)} title={`Unit ${unit.unitNumber}`} onClose={() => setShareOpen(false)} />}
    </div>
  )
}
