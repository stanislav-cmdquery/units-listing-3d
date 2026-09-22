'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ComponentProps } from 'react'

import type { FloorPlate } from '../../types/building'
import { parseViewBox } from '../../utils/svgPath'
import { FloorPlateMap } from './FloorPlateMap'
import type { BuildingModel } from './model'

type Props = {
  model: BuildingModel
  plate: FloorPlate
  floor: number
  section: string | null
  onSectionChange: (section: string) => void
  onSelectUnit: ComponentProps<typeof FloorPlateMap>['onSelectUnit']
}

// Delay after the last scroll event before the centered section is picked; also swallows the
// intermediate events of a programmatic smooth scroll.
const SCROLL_SETTLE_MS = 150

/**
 * Mobile: the whole plate, scaled so the widest section fills the screen width, panned by dragging
 * (native horizontal scroll). The section pills and the pan position follow each other.
 */
export function PlatePan({ model, plate, floor, section, onSectionChange, onSelectUnit }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState<number | null>(null)
  // Section the pan position currently shows, so a pill change caused by panning doesn't scroll back.
  const shownSectionRef = useRef<string | null>(null)
  // Track width the current pan position was computed for; a resize (rotation, toolbar) re-centers.
  const centeredWidthRef = useRef<number | null>(null)
  // The parent passes a fresh callback each render; re-subscribing would drop a pending settle timer.
  const onSectionChangeRef = useRef(onSectionChange)
  onSectionChangeRef.current = onSectionChange

  const plateBox = parseViewBox(plate.viewBox)
  const sectionBoxes = useMemo(
    () =>
      (plate.sections ?? model.building.sections).flatMap((s) =>
        s.viewBox ? [{ id: s.id, box: parseViewBox(s.viewBox) }] : []
      ),
    [plate.sections, model.building.sections]
  )
  const widestSection = Math.max(...sectionBoxes.map((s) => s.box.width), 0) || plateBox.width

  // Plate width in px: one section per screen width, but never taller than the space available.
  useLayoutEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const fit = () => {
      const byWidth = (scroller.clientWidth * plateBox.width) / widestSection
      const byHeight = (scroller.clientHeight * plateBox.width) / plateBox.height
      setWidth(Math.round(scroller.clientHeight > 0 ? Math.min(byWidth, byHeight) : byWidth))
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(scroller)
    return () => observer.disconnect()
  }, [plateBox.width, plateBox.height, widestSection])

  // Plate x -> scroll offset of that point; the track starts after the scroller's left gutter.
  const toPx = (x: number) => {
    const scroller = scrollerRef.current
    if (width == null || !scroller) return 0
    const gutter = parseFloat(getComputedStyle(scroller).paddingLeft) || 0
    return gutter + ((x - plateBox.x) / plateBox.width) * width
  }

  // Pill tapped, first render or resized: center that section.
  useEffect(() => {
    const scroller = scrollerRef.current
    const target = sectionBoxes.find((s) => s.id === section)
    if (!scroller || !target || width == null) return
    const resized = centeredWidthRef.current !== width
    if (shownSectionRef.current === section && !resized) return
    // Animate only a pill change; first render and resizes jump straight there.
    const smooth = shownSectionRef.current != null && !resized
    shownSectionRef.current = section
    centeredWidthRef.current = width
    const center = toPx(target.box.x + target.box.width / 2)
    scroller.scrollTo({ left: center - scroller.clientWidth / 2, behavior: smooth ? 'smooth' : 'auto' })
    // toPx only depends on width and the plate box, both covered.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, sectionBoxes, width])

  // Panned: highlight the section closest to the screen center.
  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller || width == null || !sectionBoxes.length) return
    let timer: ReturnType<typeof setTimeout> | undefined
    const onScroll = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        const center = scroller.scrollLeft + scroller.clientWidth / 2
        let closest = sectionBoxes[0]
        let distance = Infinity
        for (const s of sectionBoxes) {
          const d = Math.abs(toPx(s.box.x + s.box.width / 2) - center)
          if (d < distance) {
            distance = d
            closest = s
          }
        }
        if (closest.id !== shownSectionRef.current) {
          shownSectionRef.current = closest.id
          onSectionChangeRef.current(closest.id)
        }
      }, SCROLL_SETTLE_MS)
    }
    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      clearTimeout(timer)
      scroller.removeEventListener('scroll', onScroll)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionBoxes, width])

  return (
    <div ref={scrollerRef} className="ul-3d-plate-pan">
      <div className="ul-3d-plate-pan-track" style={width != null ? { width } : undefined}>
        <FloorPlateMap model={model} plate={plate} floor={floor} onSelectUnit={onSelectUnit} />
      </div>
    </div>
  )
}
