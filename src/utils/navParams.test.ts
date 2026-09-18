import { describe, expect, it } from 'vitest'

import { navFromSearchParams, navToSearchParams } from './navParams'

describe('navFromSearchParams', () => {
  it('parses a unit deep link', () => {
    expect(navFromSearchParams(new URLSearchParams('view=3d&floor=3&unit=304A'))).toEqual({
      view: '3d',
      floor: 3,
      unit: '304A',
    })
  })

  it('ignores invalid values', () => {
    expect(navFromSearchParams(new URLSearchParams('view=grid&floor=abc&floor=0'))).toEqual({})
    expect(navFromSearchParams(new URLSearchParams('floor=-2'))).toEqual({})
  })
})

describe('navToSearchParams', () => {
  it('keeps unrelated params and writes 3D keys', () => {
    const params = navToSearchParams({ view: '3d', floor: 12, section: 'A', unit: null }, 'utm=x&unit=old')
    expect(params.toString()).toBe('utm=x&view=3d&floor=12&section=A')
  })

  it('drops 3D-only keys for other views', () => {
    const params = navToSearchParams({ view: 'list', floor: 3, section: null, unit: '304A' })
    expect(params.toString()).toBe('view=list')
  })

  it('round-trips', () => {
    const nav = { view: '3d' as const, floor: 3, section: null, unit: '304A' }
    expect(navFromSearchParams(navToSearchParams(nav))).toEqual({ view: '3d', floor: 3, unit: '304A' })
  })
})
