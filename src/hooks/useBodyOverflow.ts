import { useEffect } from 'react'

export function useBodyOverflow(isOpen: boolean) {
  useEffect(() => {
    const isClient = typeof window !== 'undefined'

    if (isClient) {
      if (isOpen) {
        document.body.style.overflow = 'hidden'
        document.body.style.height = '100svh'
      }

      if (!isOpen) {
        document.body.style.overflow = ''
        document.body.style.height = ''
      }
    }

    return () => {
      if (isClient) {
        document.body.style.overflow = ''
        document.body.style.height = ''
      }
    }
  }, [isOpen])
}
