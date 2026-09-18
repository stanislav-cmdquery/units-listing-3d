import type { ComponentType } from 'react'

export interface CopyIconComponentProps {
  className?: string
}

export type CopyIconComponent = ComponentType<CopyIconComponentProps>

export const DefaultCopyIcon: CopyIconComponent = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={className}
  >
    <path
      d="M13.125 13.125H16.875V3.125H6.875V6.875"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.125 6.875H3.125V16.875H13.125V6.875Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
