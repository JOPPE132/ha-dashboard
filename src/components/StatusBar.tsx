import { mdiCog } from '@mdi/js'
import { useHass } from '../ha/HassProvider'
import { Icon } from './Icon'

const labels = {
  connecting: 'Connecting…',
  connected: 'Connected',
  reconnecting: 'Reconnecting…',
  'auth-error': 'Invalid token',
  error: 'Cannot reach Home Assistant',
} as const

export function StatusBar({ onResetToken }: { onResetToken: () => void }) {
  const { status } = useHass()

  return (
    <div className="status-bar">
      <span className={`status-dot status-${status}`} title={labels[status]} />
      {status !== 'connected' && <span className="muted">{labels[status]}</span>}
      <button
        className="icon-button"
        aria-label="Settings"
        onClick={() => {
          if (window.confirm('Remove the saved access token from this device?')) onResetToken()
        }}
      >
        <Icon path={mdiCog} />
      </button>
    </div>
  )
}
