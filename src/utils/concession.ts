import type { UnitConcession } from '../types/unit'

export function formatConcession(
  concession: UnitConcession,
  labels: { concessionMonths: string; concessionWeeks: string },
): string {
  const label = concession.type === 'months' ? labels.concessionMonths : labels.concessionWeeks
  return `${concession.value} ${label}`
}
