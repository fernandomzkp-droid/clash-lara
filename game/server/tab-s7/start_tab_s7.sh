#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
: "${CLASH_GM_PASSWORD:?Defina CLASH_GM_PASSWORD no ambiente antes de iniciar}"
export HOST="${HOST:-127.0.0.1}"
export PORT="${PORT:-8787}"
if command -v termux-wake-lock >/dev/null 2>&1; then termux-wake-lock; fi
exec node tab_s7_server.js
