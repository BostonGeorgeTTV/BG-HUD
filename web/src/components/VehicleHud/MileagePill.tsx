import React from 'react'

type Props = {
  mileage: number
  unit?: 'kilometers' | 'miles'
  mileageUnit?: 'kilometers' | 'miles'
  className?: string
  style?: React.CSSProperties
  accent?: string
  compact?: boolean
}

export default function MileagePill({ mileage, unit, mileageUnit, className = '', style, accent = 'rgba(255,255,255,.22)', compact = false }: Props) {
  const value = Number.isFinite(mileage) ? mileage : 0
  const resolvedUnit = mileageUnit ?? unit ?? 'kilometers'
  const u = resolvedUnit === 'miles' ? 'MI' : 'KM'

  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        gap: compact ? 6 : 8,
        padding: compact ? '5px 8px' : '6px 10px',
        borderRadius: 8,
        background: 'rgba(8, 8, 10, 0.72)',
        border: '1px solid rgba(255,255,255,.12)',
        boxShadow: `0 4px 18px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.04)`,
        /* backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)', */
        ...style,
      }}
    >
      <span
        style={{
          width: compact ? 3 : 4,
          alignSelf: 'stretch',
          borderRadius: 999,
          background: accent,
          boxShadow: `0 0 8px ${accent}`,
          opacity: 0.95,
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{ fontSize: compact ? 8 : 9, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,.62)' }}>ODO</span>
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginTop: 2 }}>
          <span style={{ fontSize: compact ? 12 : 13, fontWeight: 800, color: 'white' }}>{value.toFixed(1)}</span>
          <span style={{ fontSize: compact ? 9 : 10, fontWeight: 800, color: 'rgba(255,255,255,.7)' }}>{u}</span>
        </span>
      </div>
    </div>
  )
}
