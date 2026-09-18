import { useEffect } from 'react'

import { useBodyOverflow } from '../../hooks/useBodyOverflow'

/** Locks page scroll and closes on Escape while an overlay is mounted. */
export function useOverlay(onClose: () => void) {
  useBodyOverflow(true)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])
}
