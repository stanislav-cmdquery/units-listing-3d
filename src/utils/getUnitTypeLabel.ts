export function getUnitTypeLabel(beds: number): string {
  if (beds === 0) return 'Studio'
  return `${beds} Bedroom`
}
