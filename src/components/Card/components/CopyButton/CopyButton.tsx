'use client'

import { useEffect, useRef, useState } from 'react'

import { Portal } from '../../../../ui/Portal/Portal'
import { useUnitsListingConfig } from '../../../../context/UnitsListingContext'
import { formatUSD } from '../../../../utils/formatPrice'
import { CopyHoverInfo } from '../CopyHoverInfo/CopyHoverInfo'
import './CopyButton.css'

type Props = {
  unitNumber?: string
  beds: number
  baths: number
  priceNet: number | null
  priceGross: number | null
}

const TOOLTIP_WIDTH = 132
const TOOLTIP_OFFSET = 56

function prepareInfoForCopy(info: Props): string {
  return `
Number: ${info.unitNumber},
Price: ${info.priceNet != null ? formatUSD(info.priceNet) : '-'},
Beds: ${info.beds === 0 ? 1 : info.beds},
Baths: ${info.baths === 0 ? 1 : info.baths}
`
}

export function CopyButton({ unitNumber, beds, baths, priceNet, priceGross }: Props) {
  const { CopyIconComponent } = useUnitsListingConfig()
  const rootRef = useRef<HTMLDivElement>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null)

  const updateTooltipPosition = () => {
    const rect = rootRef.current?.getBoundingClientRect()
    if (!rect) return
    setTooltipPosition({
      top: rect.top - TOOLTIP_OFFSET,
      left: rect.right - TOOLTIP_WIDTH,
    })
  }

  useEffect(() => {
    if (!tooltipPosition) return
    updateTooltipPosition()
    window.addEventListener('scroll', updateTooltipPosition, true)
    window.addEventListener('resize', updateTooltipPosition)
    return () => {
      window.removeEventListener('scroll', updateTooltipPosition, true)
      window.removeEventListener('resize', updateTooltipPosition)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tooltipPosition !== null])

  return (
    <div
      ref={rootRef}
      className="ul-copy-btn-root"
      onMouseEnter={updateTooltipPosition}
      onMouseLeave={() => setTooltipPosition(null)}
      onClick={() => {
        navigator.clipboard.writeText(prepareInfoForCopy({ unitNumber, beds, baths, priceNet, priceGross }))
      }}
    >
      <CopyIconComponent />

      {tooltipPosition && (
        <Portal>
          <CopyHoverInfo
            className="ul-copy-btn-info"
            style={{ top: tooltipPosition.top, left: tooltipPosition.left }}
          >
            Copy to clipboard
          </CopyHoverInfo>
        </Portal>
      )}
    </div>
  )
}
