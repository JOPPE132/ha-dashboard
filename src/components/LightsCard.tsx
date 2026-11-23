import { mdiLightbulbGroup } from '@mdi/js'
import type { HassEntity } from 'home-assistant-js-websocket'
import { useCallService, useEntitiesByDomain } from '../ha/hooks'
import { Card } from './Card'
import { LightTile } from './LightTile'

interface Room {
  id: string
  name: string
  group?: HassEntity // the Hue room entity, used for one-tap "all on/off"
  lights: HassEntity[]
}

const byName = (a: HassEntity, b: HassEntity) =>
  String(a.attributes.friendly_name).localeCompare(String(b.attributes.friendly_name))

/**
 * Groups lights by Hue room. The Hue integration exposes each room as a light entity with
 * is_hue_group: true, hue_type: 'room' and its members in attributes.entity_id.
 * Lights outside any Hue room (e.g. non-Hue lights added later) go under "Other".
 */
function groupIntoRooms(all: HassEntity[]): Room[] {
  const isHueGroup = (e: HassEntity) => e.attributes.is_hue_group === true
  const groups = all.filter((e) => isHueGroup(e) && e.attributes.hue_type === 'room')
  const lights = all.filter((e) => !isHueGroup(e))
  const lightById = new Map(lights.map((l) => [l.entity_id, l]))
  const assigned = new Set<string>()

  const rooms: Room[] = groups.map((g) => {
    const members = ((g.attributes.entity_id as string[] | undefined) ?? [])
      .map((id) => lightById.get(id))
      .filter((l): l is HassEntity => !!l)
    members.forEach((m) => assigned.add(m.entity_id))
    return { id: g.entity_id, name: String(g.attributes.friendly_name ?? g.entity_id), group: g, lights: members.sort(byName) }
  })
  rooms.sort((a, b) => a.name.localeCompare(b.name))

  const rest = lights.filter((l) => !assigned.has(l.entity_id))
  if (rest.length) rooms.push({ id: 'other', name: rooms.length ? 'Other' : 'Lights', lights: rest.sort(byName) })
  return rooms
}

function RoomSection({ room }: { room: Room }) {
  const call = useCallService()
  const onCount = room.lights.filter((l) => l.state === 'on').length
  const anyOn = onCount > 0

  const toggleRoom = () => {
    // Prefer the Hue room entity: one command to the bridge, all bulbs switch in sync.
    const target = room.group ? room.group.entity_id : room.lights.map((l) => l.entity_id)
    call('light', anyOn ? 'turn_off' : 'turn_on', {}, { entity_id: target })
  }

  return (
    <div className="room">
      <div className="room-header">
        <div>
          <h3>{room.name}</h3>
          <span className="muted">
            {onCount === 0 ? 'All off' : `${onCount} of ${room.lights.length} on`}
          </span>
        </div>
        <button className={`switch ${anyOn ? 'on' : ''}`} role="switch" aria-checked={anyOn} onClick={toggleRoom}>
          <span className="switch-thumb" />
        </button>
      </div>
      <div className="light-grid">
        {room.lights.map((l) => (
          <LightTile key={l.entity_id} light={l} />
        ))}
      </div>
    </div>
  )
}

export function LightsCard() {
  const rooms = groupIntoRooms(useEntitiesByDomain('light'))

  return (
    <Card title="Lights" icon={mdiLightbulbGroup} className="lights">
      {rooms.length === 0 ? (
        <p className="muted">
          No lights yet. Add the Philips Hue integration in Home Assistant (Settings → Devices & services).
        </p>
      ) : (
        <div className="rooms">
          {rooms.map((r) => (
            <RoomSection key={r.id} room={r} />
          ))}
        </div>
      )}
    </Card>
  )
}
