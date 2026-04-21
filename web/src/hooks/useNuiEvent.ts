import { useEffect } from 'react'

export function useNuiEvent<T = unknown>(
  action: string,
  handler: (data: T) => void
) {
  useEffect(() => {
    const listener = (event: MessageEvent) => {
      const { action: incomingAction, data } = event.data || {}

      if (incomingAction === action) {
        handler(data)
      }
    }

    window.addEventListener('message', listener)
    return () => window.removeEventListener('message', listener)
  }, [action, handler])
}