import { mdiWaterPercent, mdiWeatherWindy, mdiUmbrellaOutline } from '@mdi/js'
import { config } from '../config'
import { useEntity, useSubscription } from '../ha/hooks'
import { formatWeekday, round } from '../ha/format'
import { Card } from './Card'
import { Icon } from './Icon'
import { weatherCondition } from './weatherIcons'

interface ForecastItem {
  datetime: string
  condition?: string
  temperature?: number
  templow?: number
  precipitation?: number
}

interface ForecastEvent {
  type: 'daily' | 'hourly' | 'twice_daily'
  forecast: ForecastItem[] | null
}

export function WeatherCard() {
  const weather = useEntity(config.weatherEntity)
  const forecast = useSubscription<ForecastEvent>({
    type: 'weather/subscribe_forecast',
    entity_id: config.weatherEntity,
    forecast_type: 'daily',
  })

  if (!weather) {
    return (
      <Card className="weather">
        <p className="muted">Loading weather…</p>
      </Card>
    )
  }

  const a = weather.attributes
  const current = weatherCondition(weather.state)
  const days = (forecast?.forecast ?? []).slice(0, config.forecastDays)
  const today = days[0]

  return (
    <Card className="weather">
      <div className="weather-now">
        <Icon path={current.icon} size="7rem" className="weather-icon" />
        <div>
          <div className="weather-temp">
            {round(a.temperature)}
            <span className="unit">{a.temperature_unit ?? '°C'}</span>
          </div>
          <div className="weather-label">{current.label}</div>
          {today && (
            <div className="muted">
              {round(today.templow)}° / {round(today.temperature)}°
            </div>
          )}
        </div>
      </div>

      <div className="weather-details">
        <span>
          <Icon path={mdiWaterPercent} /> {round(a.humidity)} %
        </span>
        <span>
          <Icon path={mdiWeatherWindy} /> {round(a.wind_speed)} {a.wind_speed_unit ?? ''}
        </span>
        {today?.precipitation !== undefined && (
          <span>
            <Icon path={mdiUmbrellaOutline} /> {today.precipitation} {a.precipitation_unit ?? 'mm'}
          </span>
        )}
      </div>

      {days.length > 0 && (
        <div className="forecast">
          {days.map((d) => {
            const c = weatherCondition(d.condition)
            return (
              <div key={d.datetime} className="forecast-day">
                <div className="muted">{formatWeekday(d.datetime)}</div>
                <Icon path={c.icon} size={36} />
                <div className="forecast-hi">{round(d.temperature)}°</div>
                <div className="muted">{round(d.templow)}°</div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
