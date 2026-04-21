import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  children: React.ReactNode
}

export default function ShadowVehicleHud({ children }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const [mountNode, setMountNode] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!hostRef.current) return

    const shadow = hostRef.current.shadowRoot ?? hostRef.current.attachShadow({ mode: 'open' })

    shadow.innerHTML = ''

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = './orhud.css'

    const root = document.createElement('div')
    root.style.position = 'relative'
    root.style.display = 'inline-block'
    root.style.pointerEvents = 'none'

    shadow.appendChild(link)
    shadow.appendChild(root)

    setMountNode(root)
  }, [])

  const portal = useMemo(() => {
    if (!mountNode) return null
    return createPortal(children, mountNode)
  }, [children, mountNode])

  return (
    <div
      ref={hostRef}
      style={{
        display: 'inline-block',
        position: 'relative',
        pointerEvents: 'none'
      }}
    >
      {portal}
    </div>
  )
}