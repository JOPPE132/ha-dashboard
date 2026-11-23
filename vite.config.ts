import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  // HA_URL has no VITE_ prefix, so it is only visible here, never in the browser bundle.
  const env = loadEnv(mode, '.', '')
  const haUrl = env.HA_URL || 'http://localhost:8123'

  return {
    plugins: [react()],
    // Production build is served by Home Assistant from config/www/dashboard -> /local/dashboard/
    base: command === 'build' ? '/local/dashboard/' : '/',
    server: {
      host: true, // reachable from the tablet on the LAN during development
      port: 5173,
      // Proxy HA's REST + WebSocket API so the browser sees a single origin (no CORS config needed).
      proxy: {
        '/api': { target: haUrl, ws: true, changeOrigin: true },
      },
    },
  }
})
