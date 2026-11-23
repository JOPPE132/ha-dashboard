import { mdiEmailOutline } from '@mdi/js'
import { useEntitiesByDomain } from '../ha/hooks'
import { Card } from './Card'

export function EmailCard() {
  const accounts = useEntitiesByDomain('sensor').filter((e) => e.entity_id.startsWith('sensor.imap_'))

  return (
    <Card title="Email" icon={mdiEmailOutline} className="email">
      {accounts.length === 0 ? (
        <p className="muted">Add the IMAP integration in Home Assistant to show unread email.</p>
      ) : (
        <ul className="email-list">
          {accounts.map((a) => {
            const count = Number(a.state)
            return (
              <li key={a.entity_id}>
                <span>{String(a.attributes.friendly_name ?? a.entity_id)}</span>
                <span className={`email-count ${count > 0 ? 'has-unread' : ''}`}>
                  {Number.isFinite(count) ? count : '–'}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
