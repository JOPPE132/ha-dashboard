import { mdiAccountGroup } from '@mdi/js'
import { useEntitiesByDomain } from '../ha/hooks'
import { Card } from './Card'

function stateLabel(state: string): string {
  if (state === 'home') return 'Home'
  if (state === 'not_home') return 'Away'
  if (state === 'unknown' || state === 'unavailable') return 'Unknown'
  return state // a named zone, e.g. "Work"
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function PresenceCard() {
  const people = useEntitiesByDomain('person')

  return (
    <Card title="People" icon={mdiAccountGroup} className="presence">
      {people.length === 0 && <p className="muted">No people configured</p>}
      <ul className="people">
        {people.map((p) => {
          const name = String(p.attributes.friendly_name ?? p.entity_id)
          const picture = p.attributes.entity_picture as string | undefined
          return (
            <li key={p.entity_id} className={`person ${p.state === 'home' ? 'is-home' : ''}`}>
              <div className="avatar">{picture ? <img src={picture} alt="" /> : initials(name)}</div>
              <div>
                <div>{name}</div>
                <div className="muted">{stateLabel(p.state)}</div>
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
