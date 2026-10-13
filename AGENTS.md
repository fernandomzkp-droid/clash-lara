# Codex — Clash Lara beta 0.8

- Fonte canônica do jogo: `game/www/`; não editar HTMLs gerados em Android, iOS ou Windows.
- Rodar `npm run prepare:all` antes do build; também gera `android/app/src/main/assets/host.html`.
- O usuário pediu explicitamente anfitrião no próprio celular, personagem compartilhado entre solo e sala de amigos, Bluetooth e Wi-Fi/hotspot sem computador. Essa autorização substitui as limitações da versão V7 que exigiam Node separado e separação das economias.
- `phone-realm.js` é o motor das salas nativas, com autoridade de combate no anfitrião. Saves offline são aceitos e sanitizados para cooperação; não alegar antitrapaça inviolável.
- `PhoneLan.java` usa TLS com pin do certificado trocado no convite; não ignorar validação TLS. `PhoneBluetooth.java` usa RFCOMM seguro com pareamento do Android.
- `MainActivity.java` só carrega conteúdo local e usa ponte de JSON para os transportes nativos.
- `npm test` é obrigatório para regras. Validação Android real requer SDK e aparelhos/emuladores. Relatar exatamente testes que não puderem executar.
- Compilação reproduzível em `.github/workflows/android-beta.yml` e `tools/build-android.sh`. Não confundir sintaxe Java validada com APK compilado.
