type Props = {
  enabled: boolean
  width: number
  className?: string
  hideWhenEnabled?: boolean
  enabledOpacity?: number
  disabledOpacity?: number
}

export default function SeatbeltIcon({
  enabled,
  width,
  className,
  hideWhenEnabled = false,
  enabledOpacity = 1,
  disabledOpacity = 0.45
}: Props) {
  return (
    <img
      hidden={hideWhenEnabled && enabled}
      width={width}
      className={className}
      src="images/icons/seatbelt.svg"
      alt="seatbelt"
      style={{
        opacity: enabled ? enabledOpacity : disabledOpacity,
        transform: enabled ? 'none' : 'rotate(-12deg) scale(0.96)',
        transition: 'all 180ms ease',
        filter: enabled
          ? 'drop-shadow(0 0 6px rgba(87,230,130,.35)) brightness(0) saturate(100%) invert(79%) sepia(19%) saturate(1173%) hue-rotate(78deg) brightness(96%) contrast(92%)'
          : 'drop-shadow(0 0 6px rgba(255,52,52,.25)) brightness(0) saturate(100%) invert(28%) sepia(97%) saturate(3540%) hue-rotate(343deg) brightness(102%) contrast(101%)'
      }}
    />
  )
}