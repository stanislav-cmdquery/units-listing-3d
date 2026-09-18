export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function computePriceBounds(
  prices: (number | null)[],
  step = 50,
): { min: number; max: number } {
  const valid = prices.filter((p): p is number => p !== null && p > 0)
  if (!valid.length) return { min: 0, max: 0 }
  const min = Math.floor(Math.min(...valid) / step) * step
  const max = Math.ceil(Math.max(...valid) / step) * step
  return { min, max }
}
