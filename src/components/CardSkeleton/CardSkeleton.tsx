import clsx from 'clsx'

import './CardSkeleton.css'

type Props = {
  className?: string
}

export function CardSkeleton({ className }: Props) {
  return (
    <div className={clsx('ul-skeleton-root', className)} aria-hidden="true">
      <div className="ul-skeleton-top">
        <div className="ul-skeleton-params">
          <div className={clsx('ul-skeleton-pill', 'ul-skeleton-unit-pill', 'ul-skeleton-shimmer')} />
          <div className={clsx('ul-skeleton-pill', 'ul-skeleton-icon-pill', 'ul-skeleton-shimmer')} />
          <div className={clsx('ul-skeleton-pill', 'ul-skeleton-icon-pill', 'ul-skeleton-shimmer')} />
        </div>
        <div className={clsx('ul-skeleton-price-pill', 'ul-skeleton-shimmer')} />
        <div className={clsx('ul-skeleton-copy-pill', 'ul-skeleton-shimmer')} />
      </div>

      <div className="ul-skeleton-center">
        <div className={clsx('ul-skeleton-center-inner', 'ul-skeleton-shimmer-soft')} />
      </div>

      <div className="ul-skeleton-bottom">
        <div className={clsx('ul-skeleton-action-pill', 'ul-skeleton-shimmer')} />
        <div className={clsx('ul-skeleton-action-pill', 'ul-skeleton-shimmer')} />
      </div>
    </div>
  )
}
