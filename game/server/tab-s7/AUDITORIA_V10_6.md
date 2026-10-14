# Clash Lara V10.6 — Revisão corretiva LS2 / Red Team (local)

Correções verificáveis:
- Serialização de operações POST para evitar reutilização concorrente de convites.
- Invalidação de sessões após reinício do servidor.
- Persistência atômica com fsync no arquivo temporário (ainda não é banco transacional).
- Limite de usuários, convites e sessões para evitar crescimento ilimitado.
- Limite de corpo HTTP contado em bytes, não caracteres.
- Limpeza de tentativas de acesso expiradas.

Limitações pendentes: sem HTTPS embutido, sem SQLite, sem fonte de horário online atestada, sem teste no Tab S7 real, sem recuperação transacional entre múltiplos processos, sem disponibilidade garantida com Android em suspensão. NÃO publicar porta na internet.

A análise LS2 / Red Team foi uma revisão de engenharia e testes locais; os runtimes oficiais não foram executados.
