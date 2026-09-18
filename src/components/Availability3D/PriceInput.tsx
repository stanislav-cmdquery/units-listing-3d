'use client'

import { useRef, useState } from 'react'

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
  // Escape blurs the input, and the blur handler still sees the pre-Escape draft in its closure.
  const cancelRef = useRef(false)

  const commit = () => {
    const text = draft
    setDraft(null)
    if (cancelRef.current) {
      cancelRef.current = false
      return
    }
    // Needs at least one digit: a lone "$" must not commit 0. Cents are rounded, not glued on.
    if (text == null || !/\d/.test(text)) return
    const parsed = Math.round(parseFloat(text.replace(/[^0-9.]/g, '')))
    if (Number.isFinite(parsed)) onCommit(parsed)
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
            cancelRef.current = true
            e.currentTarget.blur()
          }
        }}
      />
    </label>
  )
}
