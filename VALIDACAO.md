# Validação da beta0.9

Local: testes do núcleo do treinador, SQLite com migração/backup/crash,20800combinações visuais e80falas aprovados. Encontrado e corrigido overflow na normalização do nível9 do treinador. `npm test` para no transporte HTTP/TLS por EPERM de sockets neste ambiente, não por asserção de regra.

GitHub Actions executa a suíte integral, testes HTTP do Tab S7, teste de interface em Chromium móvel e compilação Android/assinatura. Consulte o resultado do commit da revisão antes de considerar o APK aprovado. Aparelhos reais, Bluetooth físico, hotspot e TTS instalado não estão validados por teste de navegador ou compilação.

Detalhes de escopo e recuperação: docs/etapas/HANDOFF.md.
