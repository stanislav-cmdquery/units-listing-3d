'use client'

import clsx from 'clsx'

import { getUnitTypeLabel } from '../../utils/getUnitTypeLabel'
import './UnitTypeFilter.css'

type Props = {
  options: number[]
  value: number[]
  onToggle: (beds: number) => void
  onSelectAll: () => void
  allLabel: string
  className?: string
}

export function UnitTypeFilter({ options, value, onToggle, onSelectAll, allLabel, className }: Props) {
  if (options.length === 0) return null

  const isAllActive = value.length === 0

  return (
    <div className={clsx('ul-unit-type-filter-root', className)}>
      <button
        type="button"
        className={clsx('ul-unit-type-filter-item', isAllActive && 'ul-unit-type-filter-item-active')}
        aria-pressed={isAllActive}
        onClick={onSelectAll}
      >
        {allLabel}
      </button>
      {options.map((beds) => {
        const active = value.includes(beds)
        return (
          <button
            key={beds}
            type="button"
            className={clsx('ul-unit-type-filter-item', active && 'ul-unit-type-filter-item-active')}
            aria-pressed={active}
            onClick={() => onToggle(beds)}
          >
            {getUnitTypeLabel(beds)}
          </button>
        )
      })}
    </div>
  )
}
