import { mdiThermometer } from '@mdi/js'
import type { HassEntity } from 'home-assistant-js-websocket'
import { config } from '../config'
import { useEntitiesByDomain } from '../ha/hooks'
import { Card } from './Card'

const isTemperature = (e: HassEntity) =>
  e.attributes.device_class === 'temperature' && e.state.trim() !== '' && Number.isFinite(Number(e.state))

const displayName = (e: HassEntity) =>
  String(e.attributes.friendly_name ?? e.entity_id).replace(/\s+(temperature|temperatur)$/i, '')

export function TemperatureCard() {
  const sensors = useEntitiesByDomain('sensor')
    .filter(isTemperature)
    .sort((a, b) => displayName(a).localeCompare(displayName(b)))

  return (
    <Card title="Temperature" icon={mdiThermometer} className="temperature">
      {sensors.length === 0 ? (
        <p className="muted">No temperature sensors yet. Hue motion sensors report temperature.</p>
      ) : (
        <div className="temp-grid">
          {sensors.map((s) => (
            <div key={s.entity_id} className="temp-tile">
              <span className="muted">{displayName(s)}</span>
              <span className="big">
                {Number(s.state).toLocaleString(config.locale, { maximumFractionDigits: 1 })}
                <span className="unit">{String(s.attributes.unit_of_measurement ?? '°C')}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
