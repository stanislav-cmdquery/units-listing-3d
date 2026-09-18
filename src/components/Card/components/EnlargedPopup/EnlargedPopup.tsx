'use client'

import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { useUnitsListingConfig } from '../../../../context/UnitsListingContext'
import type { Unit } from '../../../../types/unit'
import { formatUSD } from '../../../../utils/formatPrice'
import { BottomActions } from '../BottomActions/BottomActions'
import { ConcessionPopup } from '../ConcessionPopup/ConcessionPopup'
import { CopyButton } from '../CopyButton/CopyButton'
import { UnitParams } from '../UnitParams/UnitParams'
import './EnlargedPopup.css'

type Slide = { src: string; enlargedSrc?: string; kind: 'plan' | 'photo'; blurDataURL?: string }

function isPdf(src: string): boolean {
  return src.split('?')[0].toLowerCase().endsWith('.pdf')
}

type Props = {
  onClose: () => void
  unit: Unit
  id?: string
  unitNumber?: string
  beds: number
  baths: number
  priceNet: number | null
  priceGross: number | null
  concessionValue?: number | string | null
  concessionType?: 'months' | 'weeks' | null
  leaseTerm?: number | string | null
  floorPlanHref?: string | null
  slides: Slide[]
  slideIndex: number
  canPrev: boolean
  canNext: boolean
  onPrev: () => void
  onNext: () => void
}

export function EnlargedPopup({
  onClose,
  unit,
  unitNumber,
  beds,
  baths,
  priceNet,
  priceGross,
  concessionValue,
  concessionType,
  leaseTerm,
  floorPlanHref,
  slides,
  slideIndex,
  canPrev,
  canNext,
  onPrev,
  onNext,
}: Props) {
  const { motion: motionAdapter, onBookTour, renderBookTourModal } = useUnitsListingConfig()
  const MotionDiv = motionAdapter.div
  const [showPriceInfo, setShowPriceInfo] = useState(false)
  const [showBookModal, setShowBookModal] = useState(false)
  const [loadedSrcs, setLoadedSrcs] = useState<Set<string>>(() => new Set())
  const touchStartX = useRef<number | null>(null)

  const concessionNum =
    concessionValue != null && concessionValue !== '' ? Number(concessionValue) : null
  const hasConcession =
    concessionType != null &&
    concessionNum != null &&
    Number.isFinite(concessionNum) &&
    concessionNum > 0

  const hasCarousel = slides.length > 1

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const { ImageComponent } = useUnitsListingConfig()

  const handleBookTour = () => {
    if (renderBookTourModal || onBookTour) {
      setShowBookModal(true)
      onBookTour?.(unit)
    }
  }

  return createPortal(
    <div className="ul-enlarged-overlay" onClick={onClose}>
      <div className="ul-enlarged-popup" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="ul-enlarged-mobile-close" onClick={onClose} aria-label="Close enlarged view">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
            <path
              d="M12 36L36 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M36 36L12 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="ul-enlarged-top">
          <div className="ul-enlarged-top-left">
            <UnitParams unitNumber={unitNumber} beds={beds} baths={baths} />

            {priceNet != null ? (
              <button
                type="button"
                className="ul-enlarged-price-net"
                onClick={() => setShowPriceInfo((p) => !p)}
                aria-expanded={showPriceInfo}
                aria-label="Show concession details"
              >
                {formatUSD(priceNet)}
                {hasConcession && '*'}
              </button>
            ) : priceGross != null ? (
              <span className="ul-enlarged-price-net">{formatUSD(priceGross)}</span>
            ) : (
              <span className="ul-enlarged-price-net">On request</span>
            )}

            <CopyButton unitNumber={unitNumber} beds={beds} baths={baths} priceNet={priceNet} priceGross={priceGross} />
          </div>

          <button type="button" className="ul-enlarged-close-btn" onClick={onClose} aria-label="Close enlarged view">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M6.5 19.5L19.5 6.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M19.5 19.5L6.5 6.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div
          className="ul-enlarged-center"
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0].clientX
          }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return
            const delta = touchStartX.current - e.changedTouches[0].clientX
            if (Math.abs(delta) > 50) {
              delta > 0 ? onNext() : onPrev()
            }
            touchStartX.current = null
          }}
        >
          <MotionDiv
            className="ul-enlarged-track"
            animate={{ x: `${-slideIndex * 100}%` }}
            transition={{ type: 'spring', stiffness: 260, damping: 32, mass: 0.6 } as object}
          >
            {slides.map((slide, idx) => {
              const displaySrc = slide.enlargedSrc ?? slide.src
              const pdf = slide.kind === 'plan' && isPdf(displaySrc)
              return (
                <div key={idx} className="ul-enlarged-slide" aria-hidden={idx !== slideIndex}>
                  {pdf ? (
                    <div className="ul-enlarged-pdf-placeholder">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="64"
                        height="64"
                        viewBox="0 0 64 64"
                        fill="none"
                        aria-hidden="true"
                      >
                        <rect x="8" y="4" width="40" height="52" rx="3" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M36 4v16h16" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                        <text
                          x="32"
                          y="42"
                          textAnchor="middle"
                          fill="currentColor"
                          fontSize="11"
                          fontWeight="600"
                          fontFamily="inherit"
                          letterSpacing="1"
                        >
                          PDF
                        </text>
                      </svg>
                      <span className="ul-enlarged-pdf-label">Floor plan</span>
                      <a
                        href={displaySrc}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="ul-enlarged-pdf-download"
                      >
                        Download PDF
                      </a>
                    </div>
                  ) : (
                    <>
                      {!loadedSrcs.has(displaySrc) && !slide.blurDataURL && (
                        <div className="ul-enlarged-image-skeleton ul-skeleton-shimmer" aria-hidden="true" />
                      )}
                      <ImageComponent
                        src={displaySrc}
                        alt={slide.kind === 'plan' ? 'Floor plan' : `Unit photo ${idx}`}
                        fill
                        sizes="900px"
                        className={clsx('ul-enlarged-image', idx === 0 && 'ul-enlarged-floor-plan-image')}
                        blurDataURL={slide.blurDataURL}
                        onLoad={() =>
                          setLoadedSrcs((prev) => (prev.has(displaySrc) ? prev : new Set(prev).add(displaySrc)))
                        }
                      />
                    </>
                  )}
                </div>
              )
            })}
          </MotionDiv>

          {showPriceInfo && (
            <ConcessionPopup
              priceNet={priceNet}
              priceGross={priceGross}
              concessionValue={concessionValue}
              concessionType={concessionType}
              leaseTerm={leaseTerm}
              hasConcession={hasConcession}
              onClose={() => setShowPriceInfo(false)}
            />
          )}
        </div>

        {hasCarousel && (
          <div className="ul-enlarged-mobile-nav">
            <button
              type="button"
              className="ul-enlarged-mobile-nav-btn"
              onClick={onPrev}
              disabled={!canPrev}
              aria-label="Previous image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path
                  d="M31.6665 20L8.33317 20"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M20 31.667L8.33334 20.0003L20 8.33366"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              className="ul-enlarged-mobile-nav-btn"
              onClick={onNext}
              disabled={!canNext}
              aria-label="Next image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path
                  d="M8.3335 20H31.6668"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M20 8.33301L31.6667 19.9997L20 31.6663"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}

        <div className="ul-enlarged-bottom">
          <div className="ul-enlarged-bottom-left">
            <BottomActions onBookTour={handleBookTour} floorPlanHref={floorPlanHref} />
          </div>

          {hasCarousel && (
            <div className="ul-enlarged-nav-row">
              <button
                type="button"
                className="ul-enlarged-nav-btn"
                onClick={onPrev}
                disabled={!canPrev}
                aria-label="Previous image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M19 12L5 12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 19L5 12L12 5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button type="button" className="ul-enlarged-nav-btn" onClick={onNext} disabled={!canNext} aria-label="Next image">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12H19"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 5L19 12L12 19"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {showBookModal &&
          renderBookTourModal != null &&
          renderBookTourModal({ unit, close: () => setShowBookModal(false) })}
      </div>
    </div>,
    document.body
  )
}
