import { mdiFlashOutline } from '@mdi/js'
import type { HassEntity } from 'home-assistant-js-websocket'
import { config } from '../config'
import { useEntitiesByDomain } from '../ha/hooks'
import { Card } from './Card'

function toOre(entity: HassEntity | undefined): number | undefined {
  if (!entity) return undefined
  const value = Number(entity.state)
  if (entity.state.trim() === '' || !Number.isFinite(value)) return undefined
  const unit = String(entity.attributes.unit_of_measurement ?? '')
  const perKwh = unit.includes('MWh') ? value / 1000 : value
  const spotOre = unit.toLowerCase().startsWith('øre') ? perKwh : perKwh * 100
  return spotOre * (1 + config.power.vat) + config.power.markupOre
}

const fmt = (ore: number | undefined) =>
  ore === undefined ? '–' : ore.toLocaleString(config.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function PowerPriceCard() {
  const sensors = useEntitiesByDomain('sensor')
  const byId = new Map(sensors.map((s) => [s.entity_id, s]))
  const current = sensors.find((s) => /^sensor\.nord_pool_.*_current_price$/.test(s.entity_id))
  const prefix = current?.entity_id.replace(/_current_price$/, '')

  const now = toOre(current)
  const next = toOre(byId.get(`${prefix}_next_price`))
  const low = toOre(byId.get(`${prefix}_lowest_price`))
  const high = toOre(byId.get(`${prefix}_highest_price`))
  const avg = toOre(byId.get(`${prefix}_daily_average`))
  const level = now === undefined || avg === undefined ? '' : now <= avg ? 'cheap' : 'expensive'

  return (
    <Card title="Strømpris" icon={mdiFlashOutline} className="power">
      {!current ? (
        <p className="muted">Add the Nord Pool integration in Home Assistant (NOK, your price area).</p>
      ) : (
        <div className="power-row">
          <div className={`power-now ${level}`}>
            <span className="big">{fmt(now)}</span>
            <span className="muted"> øre/kWh</span>
          </div>
          <div className="power-stats muted">
            {next !== undefined && <span>Next: {fmt(next)}</span>}
            {low !== undefined && high !== undefined && (
              <span>
                Today: {fmt(low)} – {fmt(high)}
              </span>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
