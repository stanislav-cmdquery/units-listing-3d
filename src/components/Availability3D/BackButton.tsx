import { ArrowLeftIcon } from './icons'

type Props = {
  label: string
  onClick: () => void
}

export function BackButton({ label, onClick }: Props) {
  return (
    <button type="button" className="ul-3d-back" onClick={onClick}>
      <ArrowLeftIcon />
      <span className="ul-3d-link">{label}</span>
    </button>
  )
}
