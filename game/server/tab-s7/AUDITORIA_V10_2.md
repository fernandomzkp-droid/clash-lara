# Clash Lara V10.2 — correção e revalidação

- Corrigida precisão numérica: o nível máximo demonstrativo foi reduzido de 12 para 9 porque os custos exponenciais em milissegundos ultrapassavam `Number.MAX_SAFE_INTEGER`. A regra ×10 foi preservada; o limite é técnico, não de design. Para progressão acima do nível 9, Codex deve usar tempo inteiro BigInt/decimal e contrato de persistência versionado.
- Normalização de timestamps e progresso para inteiros seguros.
- Nova operação `startSelected` para troca explícita de classe ativa; selecionar classe apenas para inspecionar continua sem trocar o treinamento.
- Alerta em conflito de outra aba via evento `storage`, com bloqueio da interface conflitante. Isso não é mutex seguro, e ainda existe corrida entre gravações simultâneas.
- Mantidos limites de sete dias por intervalo; salto maior perde o excedente e gera aviso. Isso evita ganho ilimitado por um único salto, mas não impede fraude repetida.
- Persistência local não é confiável para rankings/PvP. Usar servidor autoritativo para recompensas competitivas.
- Sem acesso ao runtime oficial LS2/LMCP; esta é revisão local e testes reproduzíveis.
- Não foram validados multiplayer, jogo original, animações ou builds da árvore Nexus.
