'use client'

import { useState } from 'react'

import { useUnitsListingConfig } from '../../context/UnitsListingContext'
import type { Unit } from '../../types/unit'
import { formatUSD } from '../../utils/formatPrice'
import { BathtubIcon, BedIcon, DownloadIcon, ShareIcon } from './icons'

type Props = {
  unit: Unit
  onShare: () => void
}

function getConcessionNote(unit: Unit, labels: ReturnType<typeof useUnitsListingConfig>['labels']): string | null {
  const { concession, leaseTerm } = unit
  const value = concession ? Number(concession.value) : NaN
  if (!concession || !Number.isFinite(value) || value <= 0) return null
  const concessionText = `${value}-${concession.type === 'months' ? 'month' : 'week'}`
  const term = leaseTerm != null && leaseTerm !== '' ? String(leaseTerm) : null
  return term
    ? labels.netEffectiveNote.replace('{concession}', concessionText).replace('{term}', term)
    : labels.netEffectiveNoteNoTerm.replace('{concession}', concessionText)
}

export function UnitFooter({ unit, onShare }: Props) {
  const { labels, onBookTour, renderBookTourModal } = useUnitsListingConfig()
  const [bookTourOpen, setBookTourOpen] = useState(false)
  const note = getConcessionNote(unit, labels)
  const { net, gross } = unit.price
  const showGross = note != null && gross != null && net != null && gross > net

  const handleBookTour = () => {
    if (renderBookTourModal) setBookTourOpen(true)
    onBookTour?.(unit)
  }

  return (
    <div className="ul-3d-footer">
      <div className="ul-3d-footer-bar">
        <div className="ul-3d-footer-params">
          <span>{unit.unitNumber}</span>
          <span className="ul-3d-footer-param" title={unit.beds === 0 ? labels.studioLabel : `${unit.beds} ${labels.bedsLabel}`}>
            {unit.beds === 0 ? labels.studioLabel : unit.beds}
            <BedIcon />
          </span>
          <span className="ul-3d-footer-param" title={`${unit.baths} ${labels.bathroomsLabel}`}>
            {unit.baths}
            <BathtubIcon />
          </span>
        </div>

        <p className="ul-3d-footer-price">
          {net == null && gross == null ? (
            'On request'
          ) : (
            <>
              {showGross && <s className="ul-3d-footer-price-gross">{formatUSD(gross)}</s>}
              <span>
                {formatUSD(net ?? gross ?? 0)}
                {note && '*'}
              </span>
            </>
          )}
        </p>

        <div className="ul-3d-footer-actions">
          {unit.floorPlanUrl && (
            <a
              className="ul-3d-footer-action"
              href={unit.floorPlanUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              aria-label={labels.downloadFloorplan}
            >
              <DownloadIcon />
              <span className="ul-3d-link ul-3d-mobile-only">{labels.floorplan}</span>
            </a>
          )}
          <button
            type="button"
            className="ul-3d-footer-action ul-3d-desktop-only"
            onClick={onShare}
            aria-label={labels.shareUnit}
          >
            <ShareIcon />
          </button>
          <button type="button" className="ul-3d-footer-action ul-3d-link" onClick={handleBookTour}>
            {labels.bookTour}
          </button>
        </div>
      </div>

      {note && <p className="ul-3d-footer-note">{note}</p>}

      {bookTourOpen && renderBookTourModal?.({ unit, close: () => setBookTourOpen(false) })}
    </div>
  )
}
