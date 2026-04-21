type Props = {
  heading: number
  street1?: string
  street2?: string
}

function normalizeHeading(value: number) {
  const n = value % 360
  return n < 0 ? n + 360 : n
}

export default function VehicleCompass({ heading, street1 = '', street2 = '' }: Props) {
  const h = normalizeHeading(heading)
  const viewBox = `${h - 90} 0 180 8`

  return (
    <div
      style={{
        width: '26rem',
        pointerEvents: 'none',
        userSelect: 'none'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: '0.6rem',
          padding: '0.25rem 0.75rem 0.35rem',
          background:
            'linear-gradient(90deg, rgba(25,25,25,0) 0%, rgba(25,25,25,0.35) 10%, rgba(25,25,25,0.60) 50%, rgba(25,25,25,0.35) 90%, rgba(25,25,25,0) 100%)'
        }}
      >
        <div
          style={{
            width: '7.5rem',
            overflow: 'hidden',
            textAlign: 'left',
            color: 'rgba(255,255,255,0.9)',
            fontSize: '0.78rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis'
          }}
        >
          {street1}
        </div>

        <div
          style={{
            position: 'relative',
            width: '11.25rem',
            display: 'flex',
            justifyContent: 'center',
            padding: '0 1.1rem'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              width: 8,
              height: 8,
              backgroundColor: '#d9d9d9',
              transform: 'rotate(45deg)',
              boxShadow: '0 0 12px #d9d9d9'
            }}
          />

          <svg
            viewBox={viewBox}
            style={{
              width: '11.25rem',
              height: '1.9rem',
              color: 'white',
              overflow: 'hidden'
            }}
          >
            <text x="0" y="5.2" fill="white" textAnchor="middle" fontSize="12">N</text>
            <text x="360" y="5.2" fill="white" textAnchor="middle" fontSize="12">N</text>

            <text x="-45" y="5.2" fill="#d6d6d6" textAnchor="middle" fontSize="10">NW</text>
            <text x="315" y="5.2" fill="#d6d6d6" textAnchor="middle" fontSize="10">NW</text>

            <text x="45" y="5.2" fill="#d6d6d6" textAnchor="middle" fontSize="10">NE</text>
            <text x="405" y="5.2" fill="#d6d6d6" textAnchor="middle" fontSize="10">NE</text>

            <text x="90" y="5.2" fill="white" textAnchor="middle" fontSize="12">E</text>
            <text x="135" y="5.2" fill="#d6d6d6" textAnchor="middle" fontSize="10">SE</text>
            <text x="180" y="5.2" fill="white" textAnchor="middle" fontSize="12">S</text>
            <text x="225" y="5.2" fill="#d6d6d6" textAnchor="middle" fontSize="10">SW</text>
            <text x="270" y="5.2" fill="white" textAnchor="middle" fontSize="12">W</text>
          </svg>
        </div>

        <div
          style={{
            width: '7.5rem',
            overflow: 'hidden',
            textAlign: 'right',
            color: 'rgba(255,255,255,0.9)',
            fontSize: '0.78rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis'
          }}
        >
          {street2}
        </div>
      </div>
    </div>
  )
}