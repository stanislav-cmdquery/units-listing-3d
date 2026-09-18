'use client'

import clsx from 'clsx'
import type { ReactNode } from 'react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { useUnitsListingConfig } from '../../context/UnitsListingContext'
import { useClickOutside } from '../../hooks/useClickOutside'
import './Tooltip.css'

type Coords = { top: number; centerX: number }

type Props = {
  content: ReactNode
  children: ReactNode
  trigger?: 'hover' | 'click'
  className?: string
  rootClassName?: string
}

export function Tooltip({ content, children, trigger = 'hover', className, rootClassName }: Props) {
  const { motion } = useUnitsListingConfig()
  const { div: MotionDiv, AnimatePresence } = motion
  const [isOpen, setIsOpen] = useState(false)
  const [coords, setCoords] = useState<Coords>({ top: 0, centerX: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const arrowRef = useRef<HTMLDivElement>(null)

  useClickOutside([triggerRef, tooltipRef], () => setIsOpen(false))

  const calcCoords = () => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setCoords({
      top: rect.top,
      centerX: rect.left + rect.width / 2,
    })
  }

  useEffect(() => {
    if (!isOpen) return
    calcCoords()
    window.addEventListener('scroll', calcCoords, true)
    window.addEventListener('resize', calcCoords)
    return () => {
      window.removeEventListener('scroll', calcCoords, true)
      window.removeEventListener('resize', calcCoords)
    }
  }, [isOpen])

  useLayoutEffect(() => {
    if (!isOpen || !tooltipRef.current || !arrowRef.current) return
    const MARGIN = 8
    const w = tooltipRef.current.offsetWidth
    const ideal = coords.centerX - w / 2
    const clamped = Math.max(MARGIN, Math.min(window.innerWidth - w - MARGIN, ideal))
    tooltipRef.current.style.left = `${clamped}px`
    tooltipRef.current.style.transform = 'translateY(calc(-100% - 12px))'
    arrowRef.current.style.left = `${coords.centerX - clamped}px`
    arrowRef.current.style.transform = 'none'
  }, [isOpen, coords])

  const handleMouseEnter = () => {
    if (trigger === 'hover') setIsOpen(true)
  }

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (trigger !== 'hover') return
    const related = e.relatedTarget as Node | null
    if (related && tooltipRef.current?.contains(related)) return
    setIsOpen(false)
  }

  const handleClick = () => {
    if (trigger === 'click') setIsOpen((v) => !v)
  }

  const handleTooltipMouseLeave = (e: React.MouseEvent) => {
    if (trigger !== 'hover') return
    const related = e.relatedTarget as Node | null
    if (related && triggerRef.current?.contains(related)) return
    setIsOpen(false)
  }

  const tooltipStyle = {
    left: coords.centerX,
    top: coords.top,
  }

  return (
    <div ref={triggerRef} className={clsx('ul-tooltip-root', rootClassName)}>
      <div
        className={className}
        style={{ cursor: 'help' }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <div
                ref={tooltipRef}
                className="ul-tooltip-positioner"
                style={tooltipStyle}
                onMouseLeave={handleTooltipMouseLeave}
              >
                <MotionDiv
                  className="ul-tooltip-box"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                >
                  {trigger === 'click' && (
                    <button
                      type="button"
                      className="ul-tooltip-close"
                      onClick={() => setIsOpen(false)}
                      aria-label="Close tooltip"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 11 11" fill="none">
                        <path
                          d="M9.75 9.75L0.75 0.75"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M0.75 9.75L9.75 0.75"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}

                  <div className={trigger === 'click' ? 'ul-tooltip-content-with-close' : 'ul-tooltip-content'}>
                    {content}
                  </div>

                  <div ref={arrowRef} className="ul-tooltip-arrow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="8" viewBox="0 0 16 8" fill="none">
                      <path d="M8 8L0 0L16 0L8 8Z" fill="currentColor" />
                    </svg>
                  </div>
                </MotionDiv>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  )
}
