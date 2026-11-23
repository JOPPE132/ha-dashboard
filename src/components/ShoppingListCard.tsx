import { useState, type FormEvent } from 'react'
import {
  mdiCartOutline,
  mdiCheckboxBlankCircleOutline,
  mdiCheckCircle,
  mdiDeleteSweepOutline,
  mdiPlus,
} from '@mdi/js'
import { config } from '../config'
import { useCallService, useSubscription } from '../ha/hooks'
import { Card } from './Card'
import { Icon } from './Icon'

interface TodoItem {
  uid: string
  summary: string
  status: 'needs_action' | 'completed'
}

export function ShoppingListCard() {
  const entityId = config.shoppingListEntity
  const call = useCallService()
  const [text, setText] = useState('')
  const data = useSubscription<{ items: TodoItem[] }>({ type: 'todo/item/subscribe', entity_id: entityId })

  const items = data?.items ?? []
  const open = items.filter((i) => i.status === 'needs_action')
  const done = items.filter((i) => i.status === 'completed')

  const toggle = (item: TodoItem) =>
    call(
      'todo',
      'update_item',
      { item: item.uid, status: item.status === 'completed' ? 'needs_action' : 'completed' },
      { entity_id: entityId },
    )

  const add = (e: FormEvent) => {
    e.preventDefault()
    const value = text.trim()
    if (!value) return
    call('todo', 'add_item', { item: value }, { entity_id: entityId }).then(() => setText(''))
  }

  const clearDone = () => call('todo', 'remove_completed_items', {}, { entity_id: entityId })

  return (
    <Card
      title="Shopping list"
      icon={mdiCartOutline}
      className="shopping"
      actions={
        done.length > 0 && (
          <button className="icon-button" onClick={clearDone} aria-label="Remove completed items">
            <Icon path={mdiDeleteSweepOutline} />
          </button>
        )
      }
    >
      <form className="add-item" onSubmit={add}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add item…" enterKeyHint="done" />
        <button type="submit" className="icon-button" aria-label="Add">
          <Icon path={mdiPlus} />
        </button>
      </form>

      <ul className="todo-list">
        {[...open, ...done].map((item) => (
          <li key={item.uid}>
            <button className={`todo-item ${item.status}`} onClick={() => toggle(item)}>
              <Icon path={item.status === 'completed' ? mdiCheckCircle : mdiCheckboxBlankCircleOutline} />
              <span>{item.summary}</span>
            </button>
          </li>
        ))}
        {data && items.length === 0 && <li className="muted">The list is empty</li>}
      </ul>
    </Card>
  )
}
