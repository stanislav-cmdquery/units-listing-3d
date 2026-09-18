import type { ComponentType, ExoticComponent, HTMLAttributes, ReactNode } from 'react'

export interface MotionDivProps extends HTMLAttributes<HTMLDivElement> {
  initial?: unknown
  animate?: unknown
  exit?: unknown
  transition?: unknown
  layout?: boolean | string
  layoutId?: string
  whileHover?: unknown
  whileTap?: unknown
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MotionComponent = ComponentType<any> | ExoticComponent<any>

export interface MotionAdapter {
  div: MotionComponent
  AnimatePresence: MotionComponent
}

const StaticDiv: ComponentType<MotionDivProps> = ({
  initial: _i,
  animate: _a,
  exit: _e,
  transition: _t,
  layout: _l,
  layoutId: _li,
  whileHover: _wh,
  whileTap: _wt,
  ...rest
}) => <div {...rest} />

const PassThrough: ComponentType<{ children?: ReactNode; mode?: string }> = ({ children }) => <>{children}</>

export const defaultMotionAdapter: MotionAdapter = {
  div: StaticDiv,
  AnimatePresence: PassThrough,
}
