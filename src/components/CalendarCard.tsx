import { useEffect, useState } from 'react'
import { mdiCalendarMonthOutline } from '@mdi/js'
import { config } from '../config'
import { useCallService, useEntitiesByDomain } from '../ha/hooks'
import { formatTime } from '../ha/format'
import { Card } from './Card'

interface CalendarEvent {
  start: string
  end: string
  summary: string
  location?: string
}

interface AgendaItem extends CalendarEvent {
  key: string
  calendar: string
  allDay: boolean
  startDate: Date
}

interface GetEventsResult {
  response: Record<string, { events: CalendarEvent[] }>
}

const REFRESH_MS = 5 * 60_000
const DAY_MS = 86_400_000

const parseStart = (value: string) => (value.length === 10 ? new Date(`${value}T00:00:00`) : new Date(value))

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

function dayLabel(d: Date): string {
  const diff = Math.round((startOfDay(d).getTime() - startOfDay(new Date()).getTime()) / DAY_MS)
  if (diff <= 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  return d.toLocaleDateString(config.locale, { weekday: 'long', day: 'numeric', month: 'short' })
}

function groupByDay(items: AgendaItem[]): [string, AgendaItem[]][] {
  const groups = new Map<string, AgendaItem[]>()
  for (const item of items) {
    const label = dayLabel(item.startDate)
    groups.set(label, [...(groups.get(label) ?? []), item])
  }
  return [...groups]
}

export function CalendarCard() {
  const call = useCallService()
  const calendars = useEntitiesByDomain('calendar')
  const [items, setItems] = useState<AgendaItem[]>()

  const ids = calendars.map((c) => c.entity_id).sort()
  const names = Object.fromEntries(calendars.map((c) => [c.entity_id, String(c.attributes.friendly_name ?? c.entity_id)]))
  const changeKey = calendars
    .map((c) => `${c.entity_id}:${c.last_changed}`)
    .sort()
    .join()

  useEffect(() => {
    if (ids.length === 0) return
    let cancelled = false

    const load = () => {
      const end = new Date(startOfDay(new Date()).getTime() + config.calendarDays * DAY_MS)
      call('calendar', 'get_events', { end_date_time: end.toISOString() }, { entity_id: ids }, true)
        .then((result) => {
          if (cancelled) return
          const response = (result as GetEventsResult).response
          const all = Object.entries(response).flatMap(([entityId, { events }]) =>
            events.map((e, i) => ({
              ...e,
              key: `${entityId}-${e.start}-${i}`,
              calendar: names[entityId] ?? entityId,
              allDay: e.start.length === 10,
              startDate: parseStart(e.start),
            })),
          )
          setItems(all.sort((a, b) => a.startDate.getTime() - b.startDate.getTime()))
        })
        .catch((err) => console.error('Calendar fetch failed', err))
    }

    load()
    const interval = window.setInterval(load, REFRESH_MS)
    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call, changeKey])

  const showCalendarName = calendars.length > 1

  return (
    <Card title="Calendar" icon={mdiCalendarMonthOutline} className="calendar">
      {calendars.length === 0 ? (
        <p className="muted">No calendars yet. Add Google Calendar (or another calendar) in Home Assistant.</p>
      ) : !items ? (
        <p className="muted">Loading…</p>
      ) : items.length === 0 ? (
        <p className="muted">Nothing in the next {config.calendarDays} days</p>
      ) : (
        <div className="agenda">
          {groupByDay(items).map(([label, dayItems]) => (
            <div key={label} className="agenda-day">
              <h3>{label}</h3>
              <ul>
                {dayItems.map((e) => (
                  <li key={e.key} className="agenda-item">
                    <span className="agenda-time muted">{e.allDay ? 'All day' : formatTime(e.start)}</span>
                    <span className="agenda-text">
                      <span>{e.summary}</span>
                      {showCalendarName && <span className="muted agenda-sub">{e.calendar}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
