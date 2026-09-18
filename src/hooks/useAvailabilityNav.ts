import { useCallback, useState } from 'react'

import type { AvailabilityNav, NavChangeMeta } from '../types/nav'

export const DEFAULT_NAV: AvailabilityNav = { view: 'card', floor: null, section: null, unit: null }

type Options = {
  nav?: AvailabilityNav
  defaultNav?: Partial<AvailabilityNav>
  onNavChange?: (nav: AvailabilityNav, meta: NavChangeMeta) => void
}

/** Controlled when `nav` is passed, otherwise keeps its own state and still reports changes. */
export function useAvailabilityNav({ nav, defaultNav, onNavChange }: Options) {
  const [innerNav, setInnerNav] = useState<AvailabilityNav>(() => ({ ...DEFAULT_NAV, ...defaultNav }))
  const current = nav ?? innerNav

  const setNav = useCallback(
    (patch: Partial<AvailabilityNav>, meta: NavChangeMeta = { push: false }) => {
      const next = { ...current, ...patch }
      if (!nav) setInnerNav(next)
      onNavChange?.(next, meta)
    },
    [current, nav, onNavChange]
  )

  return [current, setNav] as const
}
