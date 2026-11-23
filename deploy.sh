#!/usr/bin/env bash
# Build the dashboard and copy it into Home Assistant's www folder.
# Served at: http://<board-ip>:8123/local/dashboard/index.html
set -euo pipefail
cd "$(dirname "$0")"

WWW_DIR="${HA_WWW:-$HOME/homeassistant/config/www}"
TARGET="$WWW_DIR/dashboard"

npm run build

# Safety net: /local/ is served WITHOUT authentication, so the token must never be in the bundle.
if [ -f .env.development.local ]; then
  tok=$(grep -E '^VITE_HA_TOKEN=' .env.development.local | cut -d= -f2- | tr -d "\"' " || true)
  if [ -n "$tok" ] && grep -rqF "$tok" dist; then
    echo "ERROR: access token found in dist/ - refusing to deploy." >&2
    exit 1
  fi
fi

# config/ is owned by root (the HA container runs as root), hence sudo.
sudo mkdir -p "$TARGET"
sudo find "$TARGET" -mindepth 1 -delete
sudo cp -r dist/. "$TARGET/"

ip=$(hostname -I | awk '{print $1}')
echo
echo "Deployed -> http://${ip}:8123/local/dashboard/index.html"
