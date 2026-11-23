# ha-dashboard

Custom React wall-tablet dashboard for Home Assistant (no Lovelace / marketplace cards).

Stack: Vite + React + TypeScript + [`home-assistant-js-websocket`](https://github.com/home-assistant/home-assistant-js-websocket) + `@mdi/js` icons.

## Setup (once)

```bash
# Node 22 LTS via nvm (Debian's nodejs 18 is too old for Vite 7)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.41.0/install.sh | bash
source ~/.bashrc
nvm install 22

cd ~/ha-dashboard
npm install
cp .env.example .env.development.local   # then paste your token into VITE_HA_TOKEN
```

Token: HA → click your user (bottom left) → **Security** → **Long-lived access tokens** → *Create token*.

## Develop

```bash
npm run dev
```

Open `http://<board-ip>:5173` on your PC or the tablet. Vite proxies `/api` (REST + WebSocket) to HA,
so no CORS config is needed. Edits hot-reload instantly.

## Deploy to the tablet

```bash
npm run deploy      # builds and copies dist/ to ~/homeassistant/config/www/dashboard (uses sudo)
```

Open `http://<board-ip>:8123/local/dashboard/index.html` on the tablet. The first time, paste the token;
it's stored in the tablet browser's localStorage. The token is **never** compiled into the build, because
`/local/` is readable without login by anyone on the LAN (`deploy.sh` checks this before copying).

Tablet tips: use a kiosk browser (e.g. Fully Kiosk Browser) to keep the screen on and run full-screen,
or "Add to home screen" in Chrome/Safari.

## Structure

```
src/
  config.ts              entity IDs + locale - edit when you add integrations
  ha/HassProvider.tsx    WebSocket connection, live entity states, connection status
  ha/hooks.ts            useEntity, useEntitiesByDomain, useCallService, useSubscription
  ha/token.ts            token from .env (dev) or localStorage (tablet)
  components/            Clock, WeatherCard, SunCard, PresenceCard, ShoppingListCard, ...
```

### Adding a card

```tsx
const light = useEntity('light.stue')
const call = useCallService()
<button onClick={() => call('light', 'toggle', {}, { entity_id: 'light.stue' })}>
  {light?.state}
</button>
```
