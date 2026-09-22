'use client'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { useUnitsListingConfig } from '../../context/UnitsListingContext'

/**
 * Portalled UI (lightbox, filters modal, tooltips) mounts on document.body, outside
 * the themed `.ul-root` subtree, so it would otherwise fall back to the package's
 * default tokens and ignore the host's `theme`/`themeVars`. Re-apply them on a
 * `display: contents` wrapper, which passes the variables down by inheritance
 * without adding a box of its own.
 */
export function Portal({ children }: { children: ReactNode }) {
  const { themeStyle } = useUnitsListingConfig()

  if (typeof document === 'undefined') return null

  return createPortal(
    <div className="ul-root ul-portal-root" style={themeStyle}>
      {children}
    </div>,
    document.body
  )
}
