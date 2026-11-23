import { mdiWeatherSunsetDown, mdiWeatherSunsetUp } from '@mdi/js'
import { config } from '../config'
import { useEntity } from '../ha/hooks'
import { formatTime } from '../ha/format'
import { Card } from './Card'
import { Icon } from './Icon'

export function SunCard() {
  const rising = useEntity(config.sunriseEntity)
  const setting = useEntity(config.sunsetEntity)

  return (
    <Card className="sun">
      <div className="sun-row">
        <div className="sun-item">
          <Icon path={mdiWeatherSunsetUp} size={40} />
          <div>
            <div className="muted">Sunrise</div>
            <div className="big">{formatTime(rising?.state)}</div>
          </div>
        </div>
        <div className="sun-item">
          <Icon path={mdiWeatherSunsetDown} size={40} />
          <div>
            <div className="muted">Sunset</div>
            <div className="big">{formatTime(setting?.state)}</div>
          </div>
        </div>
      </div>
    </Card>
  )
}
