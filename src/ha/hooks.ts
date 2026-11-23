import { useCallback, useEffect, useState } from 'react'
import { callService, type HassEntity, type HassServiceTarget, type MessageBase } from 'home-assistant-js-websocket'
import { useHass } from './HassProvider'

/** Live state of one entity (undefined until loaded / if it doesn't exist). */
export function useEntity(entityId: string): HassEntity | undefined {
  return useHass().entities[entityId]
}

/** All entities in a domain, e.g. useEntitiesByDomain('person'). */
export function useEntitiesByDomain(domain: string): HassEntity[] {
  const { entities } = useHass()
  return Object.values(entities).filter((e) => e.entity_id.startsWith(`${domain}.`))
}

/** Returns a function to call an HA service, e.g. call('light', 'toggle', {}, { entity_id: 'light.stue' }). */
export function useCallService() {
  const { connection } = useHass()
  return useCallback(
    (domain: string, service: string, data?: object, target?: HassServiceTarget) => {
      if (!connection) return Promise.reject(new Error('Not connected'))
      return callService(connection, domain, service, data, target)
    },
    [connection],
  )
}

/**
 * Generic WebSocket subscription (forecasts, todo items, ...). Re-subscribes automatically after reconnects.
 * Pass null to skip subscribing.
 */
export function useSubscription<T>(message: MessageBase | null): T | undefined {
  const { connection } = useHass()
  const [data, setData] = useState<T>()
  const key = message ? JSON.stringify(message) : null

  useEffect(() => {
    if (!connection || !message) return
    let cancelled = false
    let unsub: (() => Promise<void>) | undefined

    connection
      .subscribeMessage<T>((d) => setData(d), message, { resubscribe: true })
      .then((u) => {
        if (cancelled) u()
        else unsub = u
      })
      .catch((err) => console.error('Subscription failed', message, err))

    return () => {
      cancelled = true
      unsub?.().catch(() => {})
    }
    // key captures message content; message object identity changes every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection, key])

  return data
}
