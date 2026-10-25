# Clash Lara — Beta RPG 0.9.2 (25/10/2026)

## Alterações de gameplay

- NPCs do mapa: diálogo modal corrigido, opção **CONVERSAR COM NPC**, ferreiro, mercador e guia acessíveis; novos NPCs nas seis regiões.
- Mapa: deslocamento ao NPC, marcador de destino, botão de vila, viagem por portal para regiões desbloqueadas e melhoria de terrenos.
- Criaturas: 21 arquétipos com características, HP e cadências; visual procedural novo por família (bestas, espectros, voadores e humanoides).
- Combos: cinco desenhos acessíveis (→ ↑ ↓ ← ○), **sem zigue-zague de raio**. Magia elétrica permanece em habilidades com gestos simples. 32 combos básicos, incluindo cinco combos de seis gestos com teto total de **4 segundos** e intervalo máximo de 1,25 segundo.
- Itens: dez famílias de sets por quatro evoluções (Mortal, Arch, Celestial, SubCelestial), cinco peças por set e armas: 240 novos templates; buffs reais com três/cinco peças compatíveis, aplicados à arena e à raid solo.
- Forja: ascensão da peça +9 com recursos, preservação da peça equipada, bloqueio de craft direto de tiers superiores e interface de seleção.
- Arte: silhuetas e efeitos procedurais próprios. Nomes históricos Melpômene, Potâmides, Dríade e Urânia são referências ao WYD, sem uso dos seus arquivos de textura, modelos ou áudio.
- `0.9.2-beta.1` / Android `versionCode 11` / `com.lara.runeclash.beta2`.

## Verificação e limites

`npm test` passou localmente em Node 22, incluindo testes de gestos, combos, 13 slots, buffs, restrição de crafting e ascensão de itens. A automação do navegador móvel exercita o NPC mercador e a forja. CI do GitHub será o critério de compilação do APK. **Não houve teste em celulares reais**, Bluetooth físico, Wi-Fi entre aparelhos nem certificação do Tab S7 nesta rodada.

Ainda não são implementados: mundo MMORPG persistente, centenas de animações 3D, armaduras com modelos idênticos ao WYD, habilidades de todas as classes exclusivas e PvP global. O Clash Lara continua um RPG **2D**.

## Referências

[WYD Global — Dragon Forge](https://wydglobal.raidhut.com/en/noticias/updates/1661-episode-vii)

[Guia histórico de sets WYD](https://wydmaster.wordpress.com/2013/12/09/criando-set-celestial/)
