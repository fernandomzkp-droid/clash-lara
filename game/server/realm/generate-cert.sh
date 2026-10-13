#!/usr/bin/env bash
set -euo pipefail
# Only run on the host machine. Never ship the generated private key.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
OUT="$ROOT/private"; mkdir -p "$OUT"; chmod 700 "$OUT"
IP="${LAN_IP:-127.0.0.1}"
if ! [[ "$IP" =~ ^[0-9]{1,3}(\.[0-9]{1,3}){3}$ ]]; then echo "LAN_IP must be an IPv4 address" >&2; exit 1; fi
openssl req -x509 -newkey rsa:3072 -sha256 -nodes -days 14 -keyout "$OUT/lan-key.pem" -out "$OUT/lan-cert.pem" -subj "/CN=lara-rune-local" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1,IP:$IP" >/dev/null 2>&1
chmod 600 "$OUT/lan-key.pem" "$OUT/lan-cert.pem"
echo "Local HTTPS certificate generated at $OUT. Trust this certificate explicitly on each test device; never disable TLS verification in production."
openssl x509 -in "$OUT/lan-cert.pem" -noout -fingerprint -sha256
