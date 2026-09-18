'use client'

import clsx from 'clsx'
import type { ReactNode } from 'react'

import './Pills.css'

export type PillOption<T> = {
  value: T
  label: ReactNode
  ariaLabel?: string
  disabled?: boolean
}

type Props<T> = {
  options: PillOption<T>[]
  value: T | null
  /** Visually emphasized without being selected, e.g. the floor hovered on the building map. */
  highlighted?: T | null
  onChange: (value: T) => void
  onHover?: (value: T | null) => void
  label?: string
  className?: string
  /** Lay pills out in a single horizontally scrolling row instead of wrapping. */
  scroll?: boolean
}

export function Pills<T extends string | number>({
  options,
  value,
  highlighted = null,
  onChange,
  onHover,
  label,
  className,
  scroll = false,
}: Props<T>) {
  return (
    <div
      className={clsx('ul-pills-root', scroll && 'ul-pills-scroll', className)}
      role="group"
      aria-label={label}
      onMouseLeave={onHover ? () => onHover(null) : undefined}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            className={clsx('ul-pill', (active || option.value === highlighted) && 'ul-pill-active')}
            aria-pressed={active}
            aria-label={option.ariaLabel}
            disabled={option.disabled}
            onClick={(e) => {
              // In a scrolling row, bring a partly hidden pill fully on screen.
              if (scroll) e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
              onChange(option.value)
            }}
            onMouseEnter={onHover ? () => onHover(option.value) : undefined}
            onFocus={onHover ? () => onHover(option.value) : undefined}
            onBlur={onHover ? () => onHover(null) : undefined}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
