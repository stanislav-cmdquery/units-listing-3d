import { useEffect, useRef } from 'react'

export function useClickOutside(refs: React.RefObject<HTMLElement | null>[], callback: (e: MouseEvent) => void): void {
  // Keep callback current without re-registering the listener on every render
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    function handleClickOutside(evt: MouseEvent) {
      const isOutsideClick = refs?.every((ref) => {
        if (!ref.current) return true
        return !ref.current.contains(evt.target as Node)
      })

      if (isOutsideClick) callbackRef.current(evt)
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
    // refs contains stable React ref objects; callback is captured via callbackRef
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
