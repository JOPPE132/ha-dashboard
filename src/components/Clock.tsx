import { useEffect, useState } from 'react'
import { config } from '../config'

export function Clock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    // Tick on the minute boundary, then every minute.
    let interval: number | undefined
    const timeout = window.setTimeout(() => {
      setNow(new Date())
      interval = window.setInterval(() => setNow(new Date()), 60_000)
    }, 60_000 - (Date.now() % 60_000))
    return () => {
      window.clearTimeout(timeout)
      window.clearInterval(interval)
    }
  }, [])

  return (
    <div className="clock">
      <div className="clock-time">
        {now.toLocaleTimeString(config.locale, { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="clock-date">
        {now.toLocaleDateString(config.locale, { weekday: 'long', day: 'numeric', month: 'long' })}
      </div>
    </div>
  )
}
