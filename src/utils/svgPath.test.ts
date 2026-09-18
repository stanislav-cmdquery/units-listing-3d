import { describe, expect, it } from 'vitest'

import { getPathBounds, parseViewBox } from './svgPath'

describe('getPathBounds', () => {
  it('handles M/L/H/V/Z paths', () => {
    expect(getPathBounds('M632.5 608.5V636.5L78.4 637L23.5 612V587L78.4 610.5L632.5 608.5Z')).toEqual({
      minX: 23.5,
      minY: 587,
      maxX: 632.5,
      maxY: 637,
    })
  })

  it('handles compact H/V rectangles', () => {
    expect(getPathBounds('M186.494 57.3008H31.1602V143.401H186.494V57.3008Z')).toEqual({
      minX: 31.1602,
      minY: 57.3008,
      maxX: 186.494,
      maxY: 143.401,
    })
  })

  it('returns null for empty input', () => {
    expect(getPathBounds('')).toBeNull()
  })
})

describe('parseViewBox', () => {
  it('parses space and comma separated values', () => {
    expect(parseViewBox('20 28 1040 322')).toEqual({ x: 20, y: 28, width: 1040, height: 322 })
    expect(parseViewBox('0,0,652,715')).toEqual({ x: 0, y: 0, width: 652, height: 715 })
  })
})
