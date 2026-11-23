import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  createConnection,
  createLongLivedTokenAuth,
  subscribeEntities,
  ERR_INVALID_AUTH,
  type Connection,
  type HassEntities,
} from 'home-assistant-js-websocket'

export type HassStatus = 'connecting' | 'connected' | 'reconnecting' | 'auth-error' | 'error'

interface HassContextValue {
  connection: Connection | null
  entities: HassEntities
  status: HassStatus
}

const HassContext = createContext<HassContextValue | null>(null)

interface Props {
  token: string
  onAuthError: () => void
  children: ReactNode
}

export function HassProvider({ token, onAuthError, children }: Props) {
  const [connection, setConnection] = useState<Connection | null>(null)
  const [entities, setEntities] = useState<HassEntities>({})
  const [status, setStatus] = useState<HassStatus>('connecting')

  useEffect(() => {
    let cancelled = false
    let conn: Connection | undefined
    let unsubEntities: (() => void) | undefined

    // Same origin in both modes: Vite proxies /api in dev, HA serves the app itself in production.
    const auth = createLongLivedTokenAuth(window.location.origin, token)

    createConnection({ auth })
      .then((c) => {
        if (cancelled) {
          c.close()
          return
        }
        conn = c
        c.addEventListener('ready', () => setStatus('connected'))
        c.addEventListener('disconnected', () => setStatus('reconnecting'))
        c.addEventListener('reconnect-error', (_c, err) => {
          if (err === ERR_INVALID_AUTH) onAuthError()
          else setStatus('error')
        })
        unsubEntities = subscribeEntities(c, setEntities)
        setConnection(c)
        setStatus('connected')
      })
      .catch((err) => {
        if (cancelled) return
        if (err === ERR_INVALID_AUTH) {
          setStatus('auth-error')
          onAuthError()
        } else {
          setStatus('error')
        }
      })

    return () => {
      cancelled = true
      unsubEntities?.()
      conn?.close()
    }
    // onAuthError intentionally excluded: reconnecting on every parent render would be wrong.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  return <HassContext.Provider value={{ connection, entities, status }}>{children}</HassContext.Provider>
}

export function useHass(): HassContextValue {
  const ctx = useContext(HassContext)
  if (!ctx) throw new Error('useHass must be used inside <HassProvider>')
  return ctx
}
