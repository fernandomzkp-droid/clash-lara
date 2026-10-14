# V10.3 — Relógio online sincronizado

- Execute `node trainer_online_server.js` e abra `http://127.0.0.1:8787`.
- O servidor consulta o cabeçalho HTTPS Date de uma fonte remota, com margem aproximada de 1 segundo; sincroniza a cada 60 segundos. Não é NTP de alta precisão e não serve para janelas de combate de 0,2 s.
- O servidor, não o navegador, calcula tempo e progresso. O cliente não pode enviar XP ou timestamps.
- Sem referência online, a API recusa novos pedidos de treino validado; o progresso não deve ser promovido ao multiplayer.
- IMPORTANTE: se o processo permanecer parado, a versão local pode creditar tempo decorrido ao reiniciar. Para crédito competitivo real, o Codex deve migrar para sessões com leases, identidade autenticada, banco transacional e verificação de uptime, não apenas diferença de timestamps.
- O relógio do host ainda pode sofrer alterações entre consultas; não há certificação criptográfica do tempo. HTTPS Date é uma referência aproximada.
- Somente localhost; não expor a porta na internet. Para multiplayer, implementar HTTPS, autenticação, rate limit, storage transacional e auditoria.
- O treinador offline V10.2 permanece independente, sem crédito online automático.
