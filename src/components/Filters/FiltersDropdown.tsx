'use client'

import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'

import { useClickOutside } from '../../hooks/useClickOutside'
import { ButtonGroup } from '../../ui/ButtonGroup/ButtonGroup'
import type { BathFilter, OutdoorFilter } from '../../hooks/useUnitsFilter'
import { ArrowDown } from './ArrowDown'
import './FiltersDropdown.css'

function capitalise(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

type Props = {
  bathOptions: number[]
  bathFilter: BathFilter
  priceMinStr: string
  priceMaxStr: string
  outdoorOptions: string[]
  outdoorFilter: OutdoorFilter
  onBathChange: (bath: BathFilter) => void
  onPriceMinChange: (v: string) => void
  onPriceMaxChange: (v: string) => void
  onToggleOutdoor: (v: string) => void
  onClear: () => void
  isActive: boolean
}

function getBathLabel(bath: number): string {
  return bath >= 3 ? `${bath}+` : `${bath}`
}

export function FiltersDropdown({
  bathOptions,
  bathFilter,
  priceMinStr,
  priceMaxStr,
  outdoorOptions,
  outdoorFilter,
  onBathChange,
  onPriceMinChange,
  onPriceMaxChange,
  onToggleOutdoor,
  onClear,
  isActive,
}: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useClickOutside([rootRef], () => setIsOpen(false))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keyup', onKey)
    return () => document.removeEventListener('keyup', onKey)
  }, [])

  const bathButtonOptions: { value: BathFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    ...bathOptions.map((b) => ({ value: b as BathFilter, label: getBathLabel(b) })),
  ]

  const handleClear = () => {
    onClear()
    setIsOpen(false)
  }

  return (
    <div ref={rootRef} className="ul-filters-root">
      <button
        type="button"
        className={clsx('ul-filters-trigger', isActive && 'ul-filters-trigger-active')}
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-label="Open filters"
      >
        Filters
        <ArrowDown className={clsx('ul-filters-arrow-down', isOpen && 'ul-filters-arrow-down-active')} />
      </button>

      {isOpen && (
        <div className="ul-filters-panel">
          <div className="ul-filters-section">
            <div className="ul-filters-section-label">Bathrooms</div>
            <ButtonGroup
              options={bathButtonOptions}
              value={bathFilter}
              onChange={onBathChange}
              className="ul-filters-bath-group"
            />
          </div>

          <div className="ul-filters-section">
            <div className="ul-filters-section-label">Price</div>
            <div className="ul-filters-price-row">
              <div className="ul-filters-price-input-wrapper">
                <span className="ul-filters-price-prefix" aria-hidden="true">
                  $
                </span>
                <input
                  type="number"
                  className="ul-filters-price-input"
                  placeholder="Min"
                  value={priceMinStr}
                  onChange={(e) => onPriceMinChange(e.target.value)}
                  min={0}
                  aria-label="Minimum price"
                />
              </div>
              <div className="ul-filters-price-separator" aria-hidden="true" />
              <div className="ul-filters-price-input-wrapper">
                <span className="ul-filters-price-prefix" aria-hidden="true">
                  $
                </span>
                <input
                  type="number"
                  className="ul-filters-price-input"
                  placeholder="Max"
                  value={priceMaxStr}
                  onChange={(e) => onPriceMaxChange(e.target.value)}
                  min={0}
                  aria-label="Maximum price"
                />
              </div>
            </div>
          </div>

          {outdoorOptions.length > 0 && (
            <div className="ul-filters-section">
              <div className="ul-filters-section-label">Outdoor Space</div>
              <div className="ul-filters-outdoor-group">
                {outdoorOptions.map((v) => {
                  const active = outdoorFilter.includes(v)
                  return (
                    <button
                      key={v}
                      type="button"
                      className={clsx('ul-filters-outdoor-item', active && 'ul-filters-outdoor-item-active')}
                      aria-pressed={active}
                      onClick={() => onToggleOutdoor(v)}
                    >
                      {capitalise(v)}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <button type="button" className="ul-filters-clear-btn" onClick={handleClear}>
            Clear
          </button>
        </div>
      )}
    </div>
  )
}
