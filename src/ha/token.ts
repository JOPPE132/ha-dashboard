// Token resolution:
//  - dev (`npm run dev`): VITE_HA_TOKEN from .env.development.local
//  - production (served from HA /local/): entered once on the tablet, kept in that browser's localStorage.
// The production bundle never contains a token, because /local/ is publicly readable on the LAN.
const KEY = 'ha-dashboard-token'

export function getToken(): string | null {
  if (import.meta.env.DEV && import.meta.env.VITE_HA_TOKEN) return import.meta.env.VITE_HA_TOKEN
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function saveToken(token: string): void {
  try {
    localStorage.setItem(KEY, token)
  } catch {
    // storage unavailable (private mode) - token lives only for this session
  }
}

export function clearToken(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // ignore
  }
}
