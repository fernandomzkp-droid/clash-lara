# Clash Lara — Beta Visual 0.9.1 (25/10/2026)

## O que mudou de verdade
- Tela inicial ganhou retrato vetorial do herói renderizado pelo catálogo interno de armaduras (classe, elemento, aura), substituindo a apresentação estática.
- Ações principais do menu agrupadas: começar batalha, explorar mundo, abrir salão; ferramentas de treino e ajuda em área própria.
- Oficina de personagem reorganizada em visual ao vivo, seleção de elemento/modelo/aura/perfil de qualidade, treino temporal com barra de progresso, voz offline e backup/importação de save.
- Movimento decorativo discreto e desativação de animações para quem prefere movimento reduzido.
- Versão alterada de 0.9.0 para 0.9.1-beta.1; Android versionCode 10 e versionName 0.9.1-visual-beta, mantendo applicationId com.lara.runeclash.beta2.
- Adicionados testes automatizados para elementos da nova interface, prévia de personagem e capturas de tela da tela inicial e da oficina.
- Preservadas correções anteriores de rollback de save e empacotamento de APK + fonte.

## Mudanças deliberadamente NÃO realizadas
- Não há novos monstros, mundo 3D, sprites pintados à mão ou reescrita do combate.
- Nenhuma mudança no algoritmo de dano, economia, Bluetooth, Wi-Fi, contas ou trainer core.
- Não há evidência de testes físicos desta versão; GitHub Actions valida build, regras e navegador móvel headless, mas não homologação de aparelhos.
- 20.800 combinações de aparências são variações SVG paramétricas, não 20.800 ilustrações únicas.

## Instalação e preservação
- NÃO desinstale uma beta com progresso importante sem exportar e guardar o save.
- ApplicationId permanece o da 0.9. Compatibilidade de atualização in-place exige a mesma chave de assinatura; a compilação usa keystore de debug cacheada que pode expirar.
- A beta antiga 0.8 tem applicationId distinto e NÃO migra saves automaticamente.
- Ao abrir o novo APK, consulte o menu inicial. Em «TREINO POR TEMPO · VISUAIS · VOZES» está a nova oficina.
- Dentro do artefato CI, os arquivos menu-visual-0.9.1.png e oficina-visual-0.9.1.png mostram a versão testada no navegador.

## Ordem de prioridades futuras
P0: testes físicos em dois smartphones + Tab S7, backup/importação em aparelhos, Bluetooth/hotspot, falhas/reconexão, acessibilidade real.
P1: gameplay gestual rico com telegraph/cast/projétil/colisão e animações de impacto sincronizadas.
P1: personagens/armaduras finais e revisão artística por classe.
P2: sistema competitivo autoritativo para economia, inventário e progressão.
P3: multiplayer persistente, iOS e Windows com distribuição validada.

## Evidência
Código e PR: https://github.com/fernandomzkp-droid/clash-lara/pull/4
Fonte canônica de cliente: game/www/
Pipeline: .github/workflows/android-beta.yml
Use o run final de main após merge como referência definitiva de fonte, commit e APK.
