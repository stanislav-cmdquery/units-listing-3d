'use client'

import clsx from 'clsx'
import { useState } from 'react'

import { useUnitsListingConfig } from '../../context/UnitsListingContext'
import type { Unit, UnitImage } from '../../types/unit'
import { CaretIcon, CloseIcon } from './icons'
import { useOverlay } from './useOverlay'

type Slide = { image: UnitImage; alt: string }

export function getUnitSlides(unit: Unit): Slide[] {
  const slides: Slide[] = []
  if (unit.floorPlan) slides.push({ image: unit.floorPlan, alt: `Unit ${unit.unitNumber} floor plan` })
  for (const image of unit.images ?? []) {
    if (image.src) slides.push({ image, alt: image.alt ?? `Unit ${unit.unitNumber} photo` })
  }
  return slides
}

type Props = {
  unit: Unit
}

export function UnitMedia({ unit }: Props) {
  const { ImageComponent, labels } = useUnitsListingConfig()
  const slides = getUnitSlides(unit)
  const [index, setIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const current = slides[Math.min(index, slides.length - 1)]

  if (!current) return <div className="ul-3d-media ul-3d-media-empty">Floor plan not available</div>

  const hasGallery = slides.length > 1
  const go = (delta: number) => setIndex((i) => (i + delta + slides.length) % slides.length)

  return (
    <div className="ul-3d-media">
      <button
        type="button"
        className="ul-3d-media-frame"
        onClick={() => setLightboxOpen(true)}
        aria-label={current.alt}
      >
        <ImageComponent
          key={current.image.src}
          src={current.image.src}
          alt={current.alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="ul-3d-media-image"
          blurDataURL={current.image.blurDataURL}
        />
      </button>

      {hasGallery && (
        <>
          <button type="button" className="ul-3d-media-nav ul-3d-media-prev" onClick={() => go(-1)} aria-label={labels.previous}>
            <CaretIcon direction="left" />
          </button>
          <button type="button" className="ul-3d-media-nav ul-3d-media-next" onClick={() => go(1)} aria-label={labels.next}>
            <CaretIcon direction="right" />
          </button>
        </>
      )}

      {lightboxOpen && (
        <Lightbox
          slide={current}
          hasGallery={hasGallery}
          onPrev={() => go(-1)}
          onNext={() => go(1)}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  )
}

type LightboxProps = {
  slide: Slide
  hasGallery: boolean
  onPrev: () => void
  onNext: () => void
  onClose: () => void
}

function Lightbox({ slide, hasGallery, onPrev, onNext, onClose }: LightboxProps) {
  const { ImageComponent, labels } = useUnitsListingConfig()
  useOverlay(onClose)

  return (
    <div className="ul-3d-overlay" onClick={onClose}>
      <div
        className="ul-3d-lightbox"
        role="dialog"
        aria-modal="true"
        aria-label={slide.alt}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="ul-3d-icon-btn ul-3d-lightbox-close" onClick={onClose} aria-label={labels.close}>
          <CloseIcon />
        </button>
        <div className="ul-3d-lightbox-frame">
          <ImageComponent
            key={slide.image.src}
            src={slide.image.original ?? slide.image.src}
            alt={slide.alt}
            fill
            sizes="100vw"
            className="ul-3d-media-image"
          />
        </div>
        {hasGallery && (
          <>
            <button type="button" className={clsx('ul-3d-media-nav', 'ul-3d-media-prev')} onClick={onPrev} aria-label={labels.previous}>
              <CaretIcon direction="left" />
            </button>
            <button type="button" className={clsx('ul-3d-media-nav', 'ul-3d-media-next')} onClick={onNext} aria-label={labels.next}>
              <CaretIcon direction="right" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
