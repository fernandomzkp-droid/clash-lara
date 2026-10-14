# LS2 + revisão adversarial V10.7

Revisão técnica inspirada nos critérios LS2; **não** é execução do runtime LS2 oficial.

## Correções
- Fila de mutações limitada a 64 requisições pendentes, mitigando consumo ilimitado de memória no Tab S7.
- Timeouts de socket, headers e corpo configurados; limite de cabeçalhos e reutilização de conexões.
- POST aceita somente application/json; Content-Length excessivo é rejeitado antes de alocar o corpo.
- Cabeçalhos defensivos nas respostas JSON.
- Testes de regressão de autenticação, códigos GM e entradas inválidas.

## Pendências críticas
- Sem TLS nativo: manter HOST=127.0.0.1, não expor porta pública sem proxy HTTPS.
- Banco JSON não transacional e sem recuperação de corrupção: migrar para SQLite com WAL.
- Sem relógio externo atestado, sem NTP confiável, sem proteção contra root.
- Termux não garante execução 24/7 em background.
- Teste de carga e estabilidade no Tab S7 real não executado.
- Não há runtime LS2 oficial conectado nem jogo completo testado.
