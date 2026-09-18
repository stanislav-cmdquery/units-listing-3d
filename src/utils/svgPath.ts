export type Bounds = { minX: number; minY: number; maxX: number; maxY: number }

/**
 * Bounding box of a path made of absolute commands (M, L, H, V, C, Z — what Figma exports).
 * Control points of curves are included, which is fine for placing labels next to a shape.
 */
export function getPathBounds(d: string): Bounds | null {
  const tokens = d.match(/[A-Za-z]|-?\d*\.?\d+(?:e-?\d+)?/g)
  if (!tokens) return null

  const xs: number[] = []
  const ys: number[] = []
  let command = ''
  let expectX = true

  for (const token of tokens) {
    if (/[A-Za-z]/.test(token)) {
      command = token
      expectX = true
      continue
    }
    const value = Number(token)
    if (command === 'H') xs.push(value)
    else if (command === 'V') ys.push(value)
    else {
      ;(expectX ? xs : ys).push(value)
      expectX = !expectX
    }
  }

  if (!xs.length || !ys.length) return null
  return { minX: Math.min(...xs), minY: Math.min(...ys), maxX: Math.max(...xs), maxY: Math.max(...ys) }
}

export function parseViewBox(viewBox: string): { x: number; y: number; width: number; height: number } {
  const [x = 0, y = 0, width = 1, height = 1] = viewBox.split(/[\s,]+/).map(Number)
  return { x, y, width, height }
}
