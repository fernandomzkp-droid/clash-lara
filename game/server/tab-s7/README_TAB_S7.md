# Clash Lara V10.5 — Host Samsung Tab S7 (Alpha)

1. Instale Termux e Node.js (`pkg update && pkg install nodejs-lts`).
2. Extraia este ZIP em diretório privado do Termux, **não em armazenamento compartilhado**.
3. Configure `export CLASH_GM_PASSWORD='uma senha exclusiva com pelo menos 16 caracteres'`.
4. Execute `bash start_tab_s7.sh`; abra `http://127.0.0.1:8787` no tablet.
5. Para LAN confiável: `HOST=0.0.0.0 bash start_tab_s7.sh`, somente em Wi-Fi privado; **HTTP transmite credenciais sem criptografia**. Não encaminhe a porta para a internet.
6. Para início automático: salve `export CLASH_GM_PASSWORD='...'` em `~/.clash-lara-env`, aplique `chmod 600 ~/.clash-lara-env`, rode `bash install_termux_boot.sh` e abra Termux:Boot uma vez.
7. No Android, habilite bateria sem restrições para Termux e Termux:Boot e permita notificações. Wake lock consome bateria; teste aquecimento.

**Não habilitei nada remotamente no tablet:** a instalação e as permissões dependem de execução no aparelho. Não é um APK. O relógio é monotônico local, não uma autoridade de horário externo certificada. Consulte TAB_S7_LS2_RED_TEAM.md.
