import clsx from 'clsx'
import type { CSSProperties, PropsWithChildren } from 'react'

import './CopyHoverInfo.css'

type Props = {
  className?: string
  style?: CSSProperties
} & PropsWithChildren

export function CopyHoverInfo({ className, style, children }: Props) {
  return (
    <div className={clsx('ul-copy-hover-root', className)} style={style}>
      {children}
      <div className="ul-copy-hover-arrow">
        <svg xmlns="http://www.w3.org/2000/svg" width="15.6" height="11.7" viewBox="0 0 12 9" fill="none">
          <path d="M6 7L1 1L11 1L6 7Z" fill="#272625" />
        </svg>
      </div>
    </div>
  )
}
