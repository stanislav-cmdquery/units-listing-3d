'use client'

import { useEffect, useState, type ReactNode } from 'react'

import { useUnitsListingConfig } from '../../context/UnitsListingContext'
import { useBodyOverflow } from '../../hooks/useBodyOverflow'
import { CloseIcon, FunnelIcon, PlusIcon } from './icons'

type Props = {
  resultsCount: number
  onClear: () => void
  children: ReactNode
}

/** Mobile-only: sticky "Filters" bar that expands into a bottom sheet. */
export function FiltersSheet({ resultsCount, onClear, children }: Props) {
  const { labels } = useUnitsListingConfig()
  const [open, setOpen] = useState(false)
  useBodyOverflow(open)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <>
      <button type="button" className="ul-3d-sheet-bar" onClick={() => setOpen(true)} aria-expanded={open}>
        <span className="ul-3d-sheet-bar-label">
          <FunnelIcon />
          {labels.filtersTitle}
        </span>
        <PlusIcon />
      </button>

      {open && (
        <div className="ul-3d-sheet-overlay" onClick={() => setOpen(false)}>
          <div
            className="ul-3d-sheet"
            role="dialog"
            aria-modal="true"
            aria-label={labels.filtersTitle}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ul-3d-sheet-header">
              <p className="ul-3d-sheet-title">{labels.filtersTitle}</p>
              <button type="button" className="ul-3d-icon-btn" onClick={() => setOpen(false)} aria-label={labels.close}>
                <CloseIcon />
              </button>
            </div>
            <div className="ul-3d-sheet-body">{children}</div>
            <div className="ul-3d-sheet-footer">
              <button type="button" className="ul-3d-sheet-clear" onClick={onClear}>
                {labels.clearAllFilters}
              </button>
              <button type="button" className="ul-3d-sheet-apply" onClick={() => setOpen(false)}>
                {labels.showResults.replace('{count}', String(resultsCount))}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
