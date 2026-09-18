'use client'

import clsx from 'clsx'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

import { useBodyOverflow } from '../../hooks/useBodyOverflow'
import { formatUSD } from '../../utils/formatPrice'
import './FiltersModal.css'

export type FiltersModalFilters = {
  beds: number[]
  priceMin: number
  priceMax: number
}

export type FiltersModalProps = {
  onClose: () => void
  bedOptions: number[]
  priceBounds: { min: number; max: number }
  value: FiltersModalFilters
  onApply: (next: FiltersModalFilters) => void
  priceStep?: number
}

function getBedLabel(beds: number) {
  if (beds === 0) return 'Studio'
  if (beds === 1) return '1BR'
  return `${beds}BR`
}

function clampPrice(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function FiltersModal({
  onClose,
  bedOptions,
  priceBounds,
  value,
  onApply,
  priceStep = 50,
}: FiltersModalProps) {
  const [draftBeds, setDraftBeds] = useState<number[]>(value.beds)
  const [draftMin, setDraftMin] = useState<number>(value.priceMin)
  const [draftMax, setDraftMax] = useState<number>(value.priceMax)

  useBodyOverflow(true)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const toggleBed = useCallback((bed: number) => {
    setDraftBeds((prev) => (prev.includes(bed) ? prev.filter((b) => b !== bed) : [...prev, bed].sort((a, b) => a - b)))
  }, [])

  const handleMinChange = useCallback(
    (next: number) => {
      const clamped = clampPrice(next, priceBounds.min, priceBounds.max)
      setDraftMin(Math.min(clamped, draftMax))
    },
    [priceBounds.min, priceBounds.max, draftMax]
  )

  const handleMaxChange = useCallback(
    (next: number) => {
      const clamped = clampPrice(next, priceBounds.min, priceBounds.max)
      setDraftMax(Math.max(clamped, draftMin))
    },
    [priceBounds.min, priceBounds.max, draftMin]
  )

  const handleReset = useCallback(() => {
    setDraftBeds([])
    setDraftMin(priceBounds.min)
    setDraftMax(priceBounds.max)
  }, [priceBounds.min, priceBounds.max])

  const handleApply = useCallback(() => {
    onApply({ beds: draftBeds, priceMin: draftMin, priceMax: draftMax })
  }, [draftBeds, draftMin, draftMax, onApply])

  const range = priceBounds.max - priceBounds.min
  const minPercent = useMemo(
    () => (range > 0 ? ((draftMin - priceBounds.min) / range) * 100 : 0),
    [draftMin, priceBounds.min, range]
  )
  const maxPercent = useMemo(
    () => (range > 0 ? ((draftMax - priceBounds.min) / range) * 100 : 100),
    [draftMax, priceBounds.min, range]
  )

  if (typeof document === 'undefined') return null

  const sliderDisabled = range <= 0

  return createPortal(
    <div className="ul-filters-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Filter units">
      <div className="ul-filters-modal-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="ul-filters-modal-close-button" onClick={onClose} aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <div className="ul-filters-modal-header">
          <h2 className="ul-filters-modal-title">Refine your search.</h2>
          <p className="ul-filters-modal-subtitle">Adjust the filters below to find your perfect home.</p>
        </div>

        <div className="ul-filters-modal-body">
          <section className="ul-filters-modal-section">
            <div className="ul-filters-modal-section-head">
              <div className="ul-filters-modal-label">Bedrooms</div>
              {draftBeds.length > 0 && (
                <button type="button" className="ul-filters-modal-section-clear" onClick={() => setDraftBeds([])}>
                  Clear
                </button>
              )}
            </div>
            {bedOptions.length > 0 ? (
              <div className="ul-filters-modal-chip-group" role="group" aria-label="Filter by bedrooms">
                {bedOptions.map((bed) => {
                  const selected = draftBeds.includes(bed)
                  return (
                    <button
                      key={bed}
                      type="button"
                      className={clsx('ul-filters-modal-chip', selected && 'ul-filters-modal-chip-selected')}
                      onClick={() => toggleBed(bed)}
                      aria-pressed={selected}
                    >
                      {getBedLabel(bed)}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="ul-filters-modal-empty">No bedroom options available.</div>
            )}
          </section>

          <section className="ul-filters-modal-section">
            <div className="ul-filters-modal-section-head">
              <div className="ul-filters-modal-label">Monthly Rent</div>
              {(draftMin !== priceBounds.min || draftMax !== priceBounds.max) && !sliderDisabled && (
                <button
                  type="button"
                  className="ul-filters-modal-section-clear"
                  onClick={() => {
                    setDraftMin(priceBounds.min)
                    setDraftMax(priceBounds.max)
                  }}
                >
                  Clear
                </button>
              )}
            </div>

            <div className="ul-filters-modal-price-row">
              <div className="ul-filters-modal-price-chip">
                <span className="ul-filters-modal-price-chip-label">Min</span>
                <span className="ul-filters-modal-price-chip-value">{formatUSD(draftMin)}</span>
              </div>
              <div className="ul-filters-modal-price-chip-divider" aria-hidden="true" />
              <div className="ul-filters-modal-price-chip">
                <span className="ul-filters-modal-price-chip-label">Max</span>
                <span className="ul-filters-modal-price-chip-value">{formatUSD(draftMax)}</span>
              </div>
            </div>

            <div className={clsx('ul-filters-modal-slider', sliderDisabled && 'ul-filters-modal-slider-disabled')}>
              <div className="ul-filters-modal-slider-track" aria-hidden="true" />
              <div
                className="ul-filters-modal-slider-range"
                style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
                aria-hidden="true"
              />
              <input
                type="range"
                className={clsx('ul-filters-modal-slider-input', 'ul-filters-modal-slider-input-min')}
                min={priceBounds.min}
                max={priceBounds.max}
                step={priceStep}
                value={draftMin}
                onChange={(e) => handleMinChange(Number(e.target.value))}
                disabled={sliderDisabled}
                aria-label="Minimum monthly rent"
              />
              <input
                type="range"
                className={clsx('ul-filters-modal-slider-input', 'ul-filters-modal-slider-input-max')}
                min={priceBounds.min}
                max={priceBounds.max}
                step={priceStep}
                value={draftMax}
                onChange={(e) => handleMaxChange(Number(e.target.value))}
                disabled={sliderDisabled}
                aria-label="Maximum monthly rent"
              />
            </div>

            <div className="ul-filters-modal-slider-bounds">
              <span>{formatUSD(priceBounds.min)}</span>
              <span>{formatUSD(priceBounds.max)}</span>
            </div>
          </section>
        </div>

        <div className="ul-filters-modal-footer">
          <button type="button" className="ul-filters-modal-reset-button" onClick={handleReset}>
            Reset
          </button>
          <button type="button" className="ul-filters-modal-apply-button" onClick={handleApply}>
            Apply filters
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
