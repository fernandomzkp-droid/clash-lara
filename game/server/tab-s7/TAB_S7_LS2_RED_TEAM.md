# Clash Lara V10.5 — LS2 / LMCP / Full Red Team (metodologia)

## Escopo efetivamente implementado
- Servidor Node.js unificado de autenticação GM e treinador por conta, armazenamento privado com rename atômico, limite de tentativas por IP e sessões com expiração.
- Progresso calculado pelo servidor usando relógio monotônico ancorado no relógio do host; desvio >30 segundos bloqueia a operação.
- Reinício pausa treinos: tempo fora do ar não é creditado; treinador offline HTML antigo permanece apenas legado, não validado.
- Scripts Termux e Termux:Boot com wake lock; interface mínima para contas e treino.

## Red Team — limitações e bloqueios
1. **Sem hora externa atestada**: relógio do tablet pode ser alterado ANTES de iniciar; relógio monotônico protege somente o processo em execução. NTP e fonte confiável ainda exigem implementação operacional.
2. **HTTP**: somente loopback ou LAN confiável; senha/token em texto claro na LAN. Para acesso remoto, HTTPS real, reverse proxy e firewall obrigatórios.
3. **JSON em disco**: não há transação de banco, backup automático ou locking multiprocesso. Use um único processo; migrar para SQLite com transações antes de produção.
4. **Sem verificação de suspensão Android**: monotonicidade não prova que CPU esteve ativa. Não creditar tempo de processos desligados; suspensão requer teste real no Tab S7.
5. **Não há combate PvP autoritativo**: o servidor implementa autenticação/treino, não engine de combate.
6. **Códigos GM**: GM único no bootstrap; senha do ambiente deve ser forte, guardada fora do repositório. Não expor .clash_private.json.
7. **Rate limiting por IP**: adequado só para protótipo; precisa proteção persistente e por conta para internet.
8. **Sessões**: persistidas; remover expirada periodicamente e adicionar revogação global e MFA para produção.
9. **Não publicar porta diretamente na internet**. Termux:Boot e wake lock não garantem uptime 24/7; bateria/temperatura e energia devem ser monitoradas.

## LS2 / LMCP
Auditoria por checklist e testes automatizados locais, NÃO execução dos runtimes oficiais LS2/LMCP. Critério para aprovação Alpha: login, convites, isolamento de treino, reinício sem XP extra, rejeição de operações não autenticadas e smoke HTTP. Nenhuma certificação de segurança de produção.
