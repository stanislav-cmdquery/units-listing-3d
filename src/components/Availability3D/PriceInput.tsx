'use client'

import { useState } from 'react'

import { formatUSD } from '../../utils/formatPrice'

type Props = {
  label: string
  value: number
  /** Parsed value on commit (blur / Enter); the caller clamps it. */
  onCommit: (value: number) => void
  align?: 'start' | 'end'
}

// Shows "$1,200"; while focused it's free text, committed on blur or Enter (as in the-carroll).
export function PriceInput({ label, value, onCommit, align = 'start' }: Props) {
  const [draft, setDraft] = useState<string | null>(null)

  const commit = () => {
    if (draft == null) return
    const parsed = Number(draft.replace(/[^0-9]/g, ''))
    setDraft(null)
    if (draft.trim() !== '' && Number.isFinite(parsed)) onCommit(parsed)
  }

  return (
    <label className={align === 'end' ? 'ul-3d-price-value ul-3d-price-value-end' : 'ul-3d-price-value'}>
      <span className="ul-3d-price-caption">{label}</span>
      <input
        className="ul-pill ul-3d-price-input"
        type="text"
        inputMode="numeric"
        value={draft ?? formatUSD(value)}
        onFocus={(e) => {
          setDraft(formatUSD(value))
          e.currentTarget.select()
        }}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
          if (e.key === 'Escape') {
            setDraft(null)
            e.currentTarget.blur()
          }
        }}
      />
    </label>
  )
}
