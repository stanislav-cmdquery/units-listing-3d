'use client'

import clsx from 'clsx'
import type { ReactNode } from 'react'

import type { ViewMode } from '../../types/nav'
import './ViewToggle.css'

/** @deprecated Use `ViewMode`. */
export type View = ViewMode

type Props = {
  view: ViewMode
  onChange: (view: ViewMode) => void
  views?: ViewMode[]
  label3d?: string
  labelCards?: string
  labelList?: string
}

const ICON_PROPS = {
  className: 'ul-view-toggle-icon',
  xmlns: 'http://www.w3.org/2000/svg',
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

const ICONS: Record<ViewMode, ReactNode> = {
  '3d': (
    <svg {...ICON_PROPS}>
      <path d="M1.5 20.25H22.5" />
      <path d="M13.5 20.25V3.75C13.5 3.55109 13.421 3.36032 13.2803 3.21967C13.1397 3.07902 12.9489 3 12.75 3H3.75C3.55109 3 3.36032 3.07902 3.21967 3.21967C3.07902 3.36032 3 3.55109 3 3.75V20.25" />
      <path d="M21 20.25V9.75C21 9.55109 20.921 9.36032 20.7803 9.21967C20.6397 9.07902 20.4489 9 20.25 9H13.5" />
      <path d="M6 6.75H9" />
      <path d="M7.5 12.75H10.5" />
      <path d="M6 16.5H9" />
      <path d="M16.5 16.5H18" />
      <path d="M16.5 12.75H18" />
    </svg>
  ),
  card: (
    <svg {...ICON_PROPS}>
      <path d="M18.75 4.5H5.25C4.83579 4.5 4.5 4.83579 4.5 5.25V18.75C4.5 19.1642 4.83579 19.5 5.25 19.5H18.75C19.1642 19.5 19.5 19.1642 19.5 18.75V5.25C19.5 4.83579 19.1642 4.5 18.75 4.5Z" />
      <path d="M12 4.5V19.5" />
      <path d="M4.5 12H19.5" />
    </svg>
  ),
  list: (
    <svg {...ICON_PROPS}>
      <path d="M8.25 6H20.25" />
      <path d="M8.25 12H20.25" />
      <path d="M8.25 18H20.25" />
      <path
        d="M4.125 6.9375C4.64277 6.9375 5.0625 6.51777 5.0625 6C5.0625 5.48223 4.64277 5.0625 4.125 5.0625C3.60723 5.0625 3.1875 5.48223 3.1875 6C3.1875 6.51777 3.60723 6.9375 4.125 6.9375Z"
        fill="currentColor"
        stroke="none"
      />
      <path
        d="M4.125 12.9375C4.64277 12.9375 5.0625 12.5178 5.0625 12C5.0625 11.4822 4.64277 11.0625 4.125 11.0625C3.60723 11.0625 3.1875 11.4822 3.1875 12C3.1875 12.5178 3.60723 12.9375 4.125 12.9375Z"
        fill="currentColor"
        stroke="none"
      />
      <path
        d="M4.125 18.9375C4.64277 18.9375 5.0625 18.5178 5.0625 18C5.0625 17.4822 4.64277 17.0625 4.125 17.0625C3.60723 17.0625 3.1875 17.4822 3.1875 18C3.1875 18.5178 3.60723 18.9375 4.125 18.9375Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  ),
}

export function ViewToggle({
  view,
  onChange,
  views = ['card', 'list'],
  label3d = '3D',
  labelCards = 'Cards',
  labelList = 'List',
}: Props) {
  const labels: Record<ViewMode, string> = { '3d': label3d, card: labelCards, list: labelList }
  // With three options the labels don't fit on mobile, so the design shows icons only there.
  const iconsOnlyOnMobile = views.length > 2

  return (
    <div
      className={clsx('ul-view-toggle-root', iconsOnlyOnMobile && 'ul-view-toggle-root-compact')}
      role="group"
      aria-label="Switch units view"
    >
      {views.map((v) => (
        <button
          key={v}
          type="button"
          className={clsx('ul-view-toggle-btn', view === v && 'ul-view-toggle-btn-active')}
          onClick={() => onChange(v)}
          aria-pressed={view === v}
          aria-label={labels[v]}
        >
          {ICONS[v]}
          <span className="ul-view-toggle-label">{labels[v]}</span>
        </button>
      ))}
    </div>
  )
}
