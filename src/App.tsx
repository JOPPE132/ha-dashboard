import { useState } from 'react'
import { HassProvider } from './ha/HassProvider'
import { clearToken, getToken, saveToken } from './ha/token'
import { Clock } from './components/Clock'
import { StatusBar } from './components/StatusBar'
import { WeatherCard } from './components/WeatherCard'
import { SunCard } from './components/SunCard'
import { PresenceCard } from './components/PresenceCard'
import { ShoppingListCard } from './components/ShoppingListCard'
import { TokenSetup } from './components/TokenSetup'
import { LightsCard } from './components/LightsCard'
import { TemperatureCard } from './components/TemperatureCard'
import { CalendarCard } from './components/CalendarCard'
import { EmailCard } from './components/EmailCard'
import { PowerPriceCard } from './components/PowerPriceCard'

export default function App() {
  const [token, setToken] = useState<string | null>(getToken)
  const [authError, setAuthError] = useState<string>()

  const reset = (message?: string) => {
    clearToken()
    setAuthError(message)
    setToken(null)
  }

  if (!token) {
    return (
      <TokenSetup
        error={authError}
        onSave={(t) => {
          saveToken(t)
          setAuthError(undefined)
          setToken(t)
        }}
      />
    )
  }

  return (
    <HassProvider token={token} onAuthError={() => reset('Home Assistant rejected the token. Paste a valid one.')}>
      <main className="dashboard">
        <header className="top">
          <Clock />
          <StatusBar onResetToken={() => reset()} />
        </header>
        <div className="col col-main">
          <WeatherCard />
          <SunCard />
          <PowerPriceCard />
          <TemperatureCard />
          <EmailCard />
        </div>
        <div className="col col-lights">
          <LightsCard />
        </div>
        <div className="col col-side">
          <PresenceCard />
          <CalendarCard />
          <ShoppingListCard />
        </div>
      </main>
    </HassProvider>
  )
}
