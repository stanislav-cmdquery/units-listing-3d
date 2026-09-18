'use client'

import clsx from 'clsx'
import type { CSSProperties } from 'react'
import { useMemo, useState } from 'react'

import { useUnitsListingConfig } from '../../context/UnitsListingContext'
import type { Unit } from '../../types/unit'
import { formatUSD } from '../../utils/formatPrice'
import { BottomActions } from './components/BottomActions/BottomActions'
import { ConcessionPopup } from './components/ConcessionPopup/ConcessionPopup'
import { CopyButton } from './components/CopyButton/CopyButton'
import { EnlargedPopup } from './components/EnlargedPopup/EnlargedPopup'
import { UnitParams } from './components/UnitParams/UnitParams'
import './UnitCard.css'

type Slide = { src: string; enlargedSrc?: string; kind: 'plan' | 'photo'; blurDataURL?: string }

function EnlargeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path d="M15 3H21V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 21H3V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 3L14 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 21L10 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PriceInfoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
    >
      <g clipPath="url(#uc-price-info)">
        <path
          d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.5 7.5C7.63261 7.5 7.75979 7.55268 7.85355 7.64645C7.94732 7.74021 8 7.86739 8 8V10.5C8 10.6326 8.05268 10.7598 8.14645 10.8536C8.24021 10.9473 8.36739 11 8.5 11"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.75 6C8.16421 6 8.5 5.66421 8.5 5.25C8.5 4.83579 8.16421 4.5 7.75 4.5C7.33579 4.5 7 4.83579 7 5.25C7 5.66421 7.33579 6 7.75 6Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id="uc-price-info">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

function getClassNameByBeds(beds: number) {
  if (beds === 0) return 'ul-card-beds-0'
  if (beds === 1) return 'ul-card-beds-1'
  if (beds === 2) return 'ul-card-beds-2'
  return 'ul-card-beds-many'
}

type Props = {
  unit: Unit
  className?: string
}

export function UnitCard({ unit, className }: Props) {
  const config = useUnitsListingConfig()
  const { ImageComponent, motion: motionAdapter, onBookTour, renderBookTourModal } = config
  const MotionDiv = motionAdapter.div

  const { id, unitNumber, beds, baths, price, images, floorPlan, floorPlanUrl, concession, leaseTerm } = unit
  const priceNet = price.net
  const priceGross = price.gross

  const [showEnlarged, setShowEnlarged] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [showBookModal, setShowBookModal] = useState(false)
  const [slideIndex, setSlideIndex] = useState(0)
  const [aspect, setAspect] = useState(4 / 3)
  const [loadedSrcs, setLoadedSrcs] = useState<Set<string>>(() => new Set())

  const slides = useMemo<Slide[]>(() => {
    const list: Slide[] = []
    if (floorPlan) {
      list.push({ src: floorPlan.src, enlargedSrc: floorPlan.original, kind: 'plan', blurDataURL: floorPlan.blurDataURL })
    }
    if (images?.length) {
      for (const img of images) {
        if (img.src) list.push({ src: img.src, enlargedSrc: img.original, kind: 'photo', blurDataURL: img.blurDataURL })
      }
    }
    return list
  }, [floorPlan, images])

  const total = slides.length
  const safeIndex = Math.min(slideIndex, Math.max(0, total - 1))
  const canPrev = safeIndex > 0
  const canNext = safeIndex < total - 1

  const goTo = (idx: number) => setSlideIndex(Math.max(0, Math.min(total - 1, idx)))
  const goPrev = () => canPrev && goTo(slideIndex - 1)
  const goNext = () => canNext && goTo(slideIndex + 1)

  const concessionNum =
    concession != null && concession.value !== '' ? Number(concession.value) : null
  const hasConcession =
    concession != null &&
    concessionNum != null &&
    Number.isFinite(concessionNum) &&
    concessionNum > 0

  const handleBookTour = () => {
    if (renderBookTourModal || onBookTour) {
      setShowBookModal(true)
      onBookTour?.(unit)
    }
  }

  return (
    <MotionDiv className={clsx('ul-card-root', className, getClassNameByBeds(beds), showPopup && 'ul-card-info-open', total === 0 && 'ul-card-no-media')}>
      <div className="ul-card-top">
        <UnitParams unitNumber={unitNumber} beds={beds} baths={baths} />

        {priceNet != null ? (
          <button
            type="button"
            className="ul-card-price-net"
            onClick={() => setShowPopup((prev) => !prev)}
            aria-expanded={showPopup}
            aria-label="Show concession details"
          >
            {formatUSD(priceNet)} <PriceInfoIcon className="ul-card-price-info-icon" />
          </button>
        ) : priceGross != null ? (
          <span className="ul-card-price-net">{formatUSD(priceGross)}</span>
        ) : (
          <span className={clsx('ul-card-price-net', 'ul-card-on-request')}>On request</span>
        )}

        <CopyButton unitNumber={unitNumber} beds={beds} baths={baths} priceNet={priceNet} priceGross={priceGross} />
      </div>

      <div className={clsx('ul-card-center', total > 1 && 'ul-card-has-gallery')} style={{ '--aspect': aspect } as CSSProperties}>
        {total === 0 && <div className="ul-card-empty">Floor plan not available</div>}

        {slides[safeIndex] && (
          <>
            {!loadedSrcs.has(slides[safeIndex].src) && !slides[safeIndex].blurDataURL && (
              <div className="ul-card-image-skeleton ul-skeleton-shimmer" aria-hidden="true" />
            )}
            <ImageComponent
              src={slides[safeIndex].src}
              alt={slides[safeIndex].kind === 'plan' ? 'Floor plan' : 'Photo'}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1440px) 33vw, 25vw"
              className="ul-card-image"
              blurDataURL={slides[safeIndex].blurDataURL}
              onLoad={(e: React.SyntheticEvent<HTMLImageElement>) => {
                const src = slides[safeIndex].src
                setLoadedSrcs((prev) => (prev.has(src) ? prev : new Set(prev).add(src)))
                if (safeIndex !== 0) return
                const img = e.currentTarget
                if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                  setAspect(img.naturalWidth / img.naturalHeight)
                }
              }}
            />
          </>
        )}

        {total > 1 && (
          <>
            <button
              type="button"
              className={clsx('ul-card-nav-button', 'ul-card-nav-prev')}
              onClick={goPrev}
              disabled={!canPrev}
              aria-label="Previous image"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M12.5 15L7.5 10L12.5 5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              className={clsx('ul-card-nav-button', 'ul-card-nav-next')}
              onClick={goNext}
              disabled={!canNext}
              aria-label="Next image"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M7.5 5L12.5 10L7.5 15"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="ul-card-dots">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={clsx('ul-card-dot', i === safeIndex && 'ul-card-dot-active')}
                  onClick={() => goTo(i)}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {showPopup && (
          <ConcessionPopup
            priceNet={priceNet}
            priceGross={priceGross}
            concessionValue={concession?.value}
            concessionType={concession?.type}
            leaseTerm={leaseTerm}
            hasConcession={hasConcession}
            onClose={() => setShowPopup(false)}
          />
        )}

        <button
          type="button"
          className="ul-card-enlarge-button"
          aria-label="Enlarge"
          onClick={() => setShowEnlarged(true)}
        >
          <span className="ul-card-enlarge-text">Open full size</span>
          <EnlargeIcon className="ul-card-enlarge-icon" />
        </button>
      </div>

      <div className="ul-card-bottom">
        <BottomActions onBookTour={handleBookTour} floorPlanHref={floorPlanUrl} />
      </div>

      {showBookModal && renderBookTourModal != null && (
        renderBookTourModal({ unit, close: () => setShowBookModal(false) })
      )}

      {showEnlarged && (
        <EnlargedPopup
          onClose={() => setShowEnlarged(false)}
          unit={unit}
          id={id}
          unitNumber={unitNumber}
          beds={beds}
          baths={baths}
          priceNet={priceNet}
          priceGross={priceGross}
          concessionValue={concession?.value}
          concessionType={concession?.type}
          leaseTerm={leaseTerm}
          floorPlanHref={floorPlanUrl}
          slides={slides}
          slideIndex={safeIndex}
          canPrev={canPrev}
          canNext={canNext}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}
    </MotionDiv>
  )
}
