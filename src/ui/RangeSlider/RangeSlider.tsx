'use client'

import type { CSSProperties } from 'react'

import './RangeSlider.css'

type Props = {
  min: number
  max: number
  step: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  ariaLabelMin: string
  ariaLabelMax: string
}

export function RangeSlider({ min, max, step, value, onChange, ariaLabelMin, ariaLabelMax }: Props) {
  const span = max - min || 1
  const [low, high] = value
  const style = {
    '--ul-range-from': `${((low - min) / span) * 100}%`,
    '--ul-range-to': `${((high - min) / span) * 100}%`,
  } as CSSProperties

  return (
    <div className="ul-range-root" style={style}>
      <div className="ul-range-track" aria-hidden="true" />
      <input
        type="range"
        className="ul-range-input"
        min={min}
        max={max}
        step={step}
        value={low}
        aria-label={ariaLabelMin}
        onChange={(e) => onChange([Math.min(Number(e.target.value), high), high])}
      />
      <input
        type="range"
        className="ul-range-input"
        min={min}
        max={max}
        step={step}
        value={high}
        aria-label={ariaLabelMax}
        onChange={(e) => onChange([low, Math.max(Number(e.target.value), low)])}
      />
    </div>
  )
}
