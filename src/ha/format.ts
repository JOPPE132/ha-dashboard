import { config } from '../config'

export function formatTime(value: string | Date | undefined): string {
  if (!value) return '–'
  const d = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return '–'
  return d.toLocaleTimeString(config.locale, { hour: '2-digit', minute: '2-digit' })
}

export function formatWeekday(value: string): string {
  return new Date(value).toLocaleDateString(config.locale, { weekday: 'short' })
}

export function round(value: unknown): string {
  const n = Number(value)
  return Number.isFinite(n) ? String(Math.round(n)) : '–'
}
