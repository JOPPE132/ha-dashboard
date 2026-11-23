import type { ReactNode } from 'react'
import { Icon } from './Icon'

interface Props {
  title?: string
  icon?: string
  className?: string
  actions?: ReactNode
  children: ReactNode
}

export function Card({ title, icon, className = '', actions, children }: Props) {
  return (
    <section className={`card ${className}`}>
      {title && (
        <header className="card-header">
          {icon && <Icon path={icon} size={22} />}
          <h2>{title}</h2>
          {actions && <div className="card-actions">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  )
}
