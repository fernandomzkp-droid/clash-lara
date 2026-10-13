#!/usr/bin/env bash
set -euo pipefail
project_dir="$(cd "$(dirname "$0")/.." && pwd)"
cd "$project_dir"
command -v java >/dev/null || { echo 'Instale JDK 17 ou 21.'; exit 1; }
command -v gradle >/dev/null || { echo 'Instale Gradle 8.9 ou use o workflow GitHub Actions incluído.'; exit 1; }
if [ -z "${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}" ] && [ ! -f android/local.properties ]; then
  echo 'Informe ANDROID_HOME com o SDK Android 35 ou abra android/ no Android Studio.'
  exit 1
fi
npm run prepare:all
npm test
gradle -p android --no-daemon assembleDebug
mkdir -p entrega
cp android/app/build/outputs/apk/debug/app-debug.apk entrega/Clash-Lara-Beta.apk
sha256sum entrega/Clash-Lara-Beta.apk
