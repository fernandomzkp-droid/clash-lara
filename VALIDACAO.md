# Validação desta revisão

## Executado com sucesso

- `npm run prepare:all`: HTML independente e assets das plataformas regenerados a partir de `game/www`.
- Dez suítes locais: motor, regras, sequências, interface lógica, RPG, mundo, servidor legado, persistência, novo motor de sala no celular e política Windows.
- Nova suíte `game/tests-v7/test-phone.js`: dois jogadores reais simulados no motor, importação de equipamento/XP offline, dano do anfitrião, cooldown, idempotência, raid compartilhada, recompensa, reconexão, níveis por classe e pausa por spam.
- Verificação de sintaxe dos scripts JavaScript.
- Parser Java do JDK: três fontes nativas sem erros de sintaxe. Isso não resolve tipos Android nem compila APK.

## Não concluído / bloqueado

- `npm test` completo foi executado, mas a suíte HTTPS `test-transport.js` parou com `listen EPERM` ao abrir socket local neste ambiente. As demais suítes foram executadas individualmente e passaram.
- Teste visual com Chromium/Playwright: navegador não iniciou devido à restrição de sockets (`setsockopt: Operation not permitted`).
- Compilação Android: SDK e Gradle ausentes; downloads não executados/concluídos nas tentativas de permissão. Nenhum APK foi gerado.
- Bluetooth RFCOMM, TLS com certificado AndroidKeyStore, interface Android e multiplayer em aparelhos físicos: não testados.
- Workflow GitHub Actions incluído, porém não executado. Nenhum repositório apareceu na consulta à conexão GitHub desta sessão.

Arquivos de código-fonte não devem ser apresentados como APK pronto ou multiplayer validado em aparelhos.
