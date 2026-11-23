import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { mdiLightbulb, mdiLightbulbOffOutline } from '@mdi/js'
import type { HassEntity } from 'home-assistant-js-websocket'
import { useCallService } from '../ha/hooks'
import { Icon } from './Icon'

const toPct = (brightness: unknown) => Math.max(1, Math.round((Number(brightness) / 255) * 100))

/** Bulb colour for the tile glow: actual RGB if the light reports one, otherwise warm white. */
function glowColor(light: HassEntity): string {
  const rgb = light.attributes.rgb_color as [number, number, number] | undefined
  return rgb ? `rgb(${rgb.join(',')})` : 'rgb(255, 196, 120)'
}

export function LightTile({ light }: { light: HassEntity }) {
  const call = useCallService()
  const isOn = light.state === 'on'
  const unavailable = light.state === 'unavailable'
  const supportsBrightness = ((light.attributes.supported_color_modes as string[] | undefined) ?? []).some(
    (m) => m !== 'onoff',
  )

  // Local slider value while dragging, so the thumb doesn't jump back while HA catches up.
  const [dragPct, setDragPct] = useState<number | null>(null)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const pct = dragPct ?? (isOn ? toPct(light.attributes.brightness) : 0)
  const name = String(light.attributes.friendly_name ?? light.entity_id)

  const toggle = () => {
    if (!unavailable) call('light', 'toggle', {}, { entity_id: light.entity_id })
  }

  const setBrightness = (value: number) => {
    setDragPct(value)
    window.clearTimeout(timer.current)
    // Debounce: send at most every 250 ms while dragging.
    timer.current = window.setTimeout(() => {
      call('light', 'turn_on', { brightness_pct: value }, { entity_id: light.entity_id }).finally(() =>
        setDragPct(null),
      )
    }, 250)
  }

  return (
    <div
      className={`light-tile ${isOn ? 'on' : ''} ${unavailable ? 'unavailable' : ''}`}
      style={isOn ? ({ '--glow': glowColor(light) } as CSSProperties) : undefined}
    >
      <button className="light-toggle" onClick={toggle} disabled={unavailable}>
        <Icon path={isOn ? mdiLightbulb : mdiLightbulbOffOutline} size={34} className="light-icon" />
        <span className="light-name">{name}</span>
        <span className="muted">{unavailable ? 'Unavailable' : isOn ? `${pct} %` : 'Off'}</span>
      </button>
      {supportsBrightness && !unavailable && (
        <input
          type="range"
          className="light-slider"
          min={1}
          max={100}
          value={pct || 1}
          aria-label={`${name} brightness`}
          onChange={(e) => setBrightness(Number(e.target.value))}
        />
      )}
    </div>
  )
}
