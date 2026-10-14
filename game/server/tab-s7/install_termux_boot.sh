#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail
# Run only after setting a secure GM password in ~/.clash-lara-env (chmod 600).
ROOT="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$HOME/.termux/boot"
cat > "$HOME/.termux/boot/start-clash-lara" <<EOF
#!/data/data/com.termux/files/usr/bin/bash
set -e
source "\$HOME/.clash-lara-env"
cd "$ROOT"
termux-wake-lock
exec node tab_s7_server.js >> "\$HOME/clash-lara.log" 2>&1
EOF
chmod 700 "$HOME/.termux/boot/start-clash-lara"
echo 'Boot script installed. Open Termux:Boot once. Configure Android battery settings manually.'
