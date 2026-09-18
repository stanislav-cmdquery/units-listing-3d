'use client'

import { useUnitsListingConfig } from '../../../../context/UnitsListingContext'
import './BottomActions.css'

type Props = {
  onBookTour: () => void
  floorPlanHref?: string | null
}

export function BottomActions({ onBookTour, floorPlanHref }: Props) {
  const { labels } = useUnitsListingConfig()

  return (
    <>
      <div
        className="ul-bottom-actions-book-tour"
        onClick={onBookTour}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onBookTour()
          }
        }}
        role="button"
        tabIndex={0}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M1.5 14H14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path
            d="M3.5 14V2.5C3.5 2.36739 3.55268 2.24021 3.64645 2.14645C3.74021 2.05268 3.86739 2 4 2H12C12.1326 2 12.2598 2.05268 12.3536 2.14645C12.4473 2.24021 12.5 2.36739 12.5 2.5V14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9.75 8.75C10.1642 8.75 10.5 8.41421 10.5 8C10.5 7.58579 10.1642 7.25 9.75 7.25C9.33579 7.25 9 7.58579 9 8C9 8.41421 9.33579 8.75 9.75 8.75Z"
            fill="currentColor"
          />
        </svg>
        <div className="ul-bottom-actions-text">{labels.bookTour}</div>
      </div>

      {floorPlanHref && (
        <div className="ul-bottom-actions-floor-plans">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4.66699 6.66666L8.00033 9.99999L11.3337 6.66666"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M8 10V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <a href={floorPlanHref} target="_blank" rel="noopener noreferrer" className="ul-bottom-actions-text">
            Floor plans
          </a>
        </div>
      )}
    </>
  )
}
