import { useUnitsListingConfig } from '../../context/UnitsListingContext'

export function StatusLegend() {
  const { labels } = useUnitsListingConfig()
  const items = [
    { key: 'available', label: labels.statusAvailable },
    { key: 'not-matching', label: labels.statusNotMatching },
    { key: 'unavailable', label: labels.statusNotAvailable },
  ]

  return (
    <ul className="ul-legend-root">
      {items.map((item) => (
        <li key={item.key} className="ul-legend-item">
          <span className={`ul-legend-dot ul-legend-dot-${item.key}`} aria-hidden="true" />
          {item.label}
        </li>
      ))}
    </ul>
  )
}
