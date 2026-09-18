import type { ComponentType, ImgHTMLAttributes } from 'react'

export interface ImageComponentProps {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  className?: string
  sizes?: string
  priority?: boolean
  blurDataURL?: string
  style?: ImgHTMLAttributes<HTMLImageElement>['style']
  onLoad?: ImgHTMLAttributes<HTMLImageElement>['onLoad']
}

export type ImageComponent = ComponentType<ImageComponentProps>

export const DefaultImage: ImageComponent = ({
  src,
  alt,
  width,
  height,
  fill,
  className,
  priority,
  blurDataURL,
  style,
  onLoad,
}) => (
  <img
    src={src}
    alt={alt}
    width={width}
    height={height}
    className={className}
    style={{
      ...(fill ? { position: 'absolute', inset: 0, width: '100%', height: '100%' } : undefined),
      ...(blurDataURL
        ? {
            backgroundImage: `url(${blurDataURL})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }
        : undefined),
      ...style,
    }}
    loading={priority ? 'eager' : 'lazy'}
    onLoad={onLoad}
  />
)
