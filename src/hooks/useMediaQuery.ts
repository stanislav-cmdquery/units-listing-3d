import { useCallback, useSyncExternalStore } from 'react'

/** SSR renders the mobile (false) branch; the real value lands on hydration. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    [query]
  )
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  )
}

export const DESKTOP_QUERY = '(min-width: 768px)'
