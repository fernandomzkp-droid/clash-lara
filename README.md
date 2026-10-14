# Clash Lara — beta Android 0.9, integração das etapas

A beta0.8 teve APK compilado e assinatura verificada no GitHub. Esta revisão integra treinador offline, aparência vetorial de20modelos por classe/8elementos/13brilhos,80falas com TTS offline disponível no aparelho, qualidade gráfica e exportação/importação de save. O novo servidor Tab S7 opcional usa SQLite e APIv1. Veja [handoff das etapas](docs/etapas/HANDOFF.md) para testes, contrato e partes pendentes.

**Instalação0.9:** aplicativo separado **Clash Lara Etapas** (`com.lara.runeclash.beta2`). A chave temporária da0.8 não está disponível para assinar uma atualização compatível. O aplicativo anterior e seus dados ficam preservados; mundos da0.8 não migram automaticamente. Não desinstale a0.8 para manter seu progresso. Todos os amigos devem instalar a mesma nova beta. O workflow guarda a chave de debug em cache para próximas compilações desta beta, mas cache pode expirar: para distribuição definitiva é necessária chave de release guardada pelo proprietário.

No menu: **TREINO POR TEMPO · VISUAIS · VOZES**. Escolha classe e inicie treino, escolha visual e ative falas. Treino0→1=1h, depois10h,100h etc., separado do XP de combate. Aparências não dão atributos grátis. **EXPORTAR SAVE** copia o texto no Android; guarde-o e cole em **IMPORTAR SAVE** nesta beta para transferir entre instalações compatíveis.

Teste Bluetooth/Wi-Fi físico e desempenho no Tab S7 continuam pendentes. Não há resultado oficial LS2/LMCP.

## O que foi implementado no código

- Hospedagem no próprio Android: CRIAR SALA → Bluetooth ou Wi-Fi/hotspot. Nenhum computador é necessário para jogar depois de instalado o APK.
- Bluetooth Classic RFCOMM entre celulares pareados, com até 4 convidados configurados. Compatibilidade e limites reais dependem do aparelho e precisam de teste físico.
- Wi-Fi/hotspot: convite com IP privado e identidade do certificado; até 8 jogadores por sala. O anfitrião mantém o app aberto. A internet não participa do transporte do jogo.
- Uma origem local única no WebView: o mesmo personagem, equipamentos e níveis entram e saem da sala. Não desinstale nem apague dados do aplicativo para preservar o save.
- Raid compartilhada e X1. O anfitrião calcula dano, aplica recargas, bloqueia rajadas de spam e deduplica operações. O X1 usa atributos normalizados, preservando o personagem para cooperação.
- Dez classes com XP independente e níveis 1–99. Combate solo, encontros e raids concedem XP.
- Mundo 96×64 (antes 24×16), com seis regiões, minimapa, câmera suave e deslocamento até regiões. Toque nos monstros do mapa para aproximar-se e combater no modo solo.
- Nove silhuetas de monstros com texturas procedurais e comportamentos de combate; seis chefes; 78 peças temáticas novas nas 13 posições de equipamento, além das 26 originais. Efeitos de runas e aparências de armadura desenhados localmente, sem downloads.

Bluetooth e Wi-Fi usam o mesmo motor de sala. A configuração do servidor Node antigo permanece para PC, mas NÃO é necessária para as salas nativas do Android. Clãs, mercado, forja e exploração de mobs comuns continuam locais nesta beta; a cooperação online usa a raid e o X1. Saia da sala para mudar classe/equipamentos.

## Gerar o APK sem computador próprio

1. Crie um repositório privado no GitHub e envie o **conteúdo desta pasta**, incluindo `.github/workflows/android-beta.yml`.
2. Abra **Actions → Gerar APK beta Android → Run workflow**. O fluxo também executa em um push para `main`.
3. Quando terminar com sucesso, baixe o artefato **Clash-Lara-Beta-APK**, extraia e instale `Clash-Lara-Etapas-Beta.apk`.
4. Envie esse APK aos amigos como documento pelo WhatsApp.

Esse workflow foi executado com sucesso no run 38473290429. Ele necessita disponibilidade do GitHub Actions na sua conta. O APK usa assinatura de debug para testes; recompilações com outra chave não atualizam uma instalação existente. Guarde a mesma chave de assinatura para atualizações que preservem dados.

Alternativa: JDK 17/21 + SDK Android 35 + Gradle 8.9; execute `tools/build-android.sh`, ou abra `android/` no Android Studio, depois de `npm run prepare:all`.

## Jogar por Bluetooth

1. Instalem o mesmo APK nos Androids (Android 8 ou mais recente).
2. Pareiem os celulares nas configurações de Bluetooth.
3. Anfitrião: **CRIAR SALA → Bluetooth**. Permita dispositivos próximos se o Android pedir.
4. Amigos: **ENTRAR → Bluetooth → celular do anfitrião**.
5. No mundo, abram uma raid pelo botão de chefe ou desafiem um jogador para X1.
6. Usem **SOLO → SALVAR E SAIR**. O anfitrião sair encerra a sala.

## Jogar por Wi-Fi/hotspot

Conectem todos ao mesmo Wi-Fi ou ao hotspot do anfitrião. Ele usa **CRIAR SALA → Wi-Fi**, copia o **CONVITE**, e os outros usam **ENTRAR → Wi-Fi** e colam o código. Se houver várias interfaces de rede, escolham o IP da rede em uso. Redes com isolamento de clientes podem impedir a conexão.

## Jogo solo em HTML

`game/LARA_RUNE_CLASH_OFFLINE.html` é um arquivo independente do jogo solo. Pode ser aberto em navegador que permita JavaScript e armazenamento em arquivos locais; não fornece Bluetooth/Wi-Fi nativo. A compatibilidade visual desta revisão não foi verificada em navegador neste ambiente, pois ele também bloqueou a abertura do navegador de testes.

## Limites da beta

- Código nativo compilado; ainda depende de testes em dois aparelhos. Não há garantia de funcionamento Bluetooth/Wi-Fi antes dessa validação.
- A sala confia no personagem offline importado para cooperação entre amigos. Sanitização e rate limit não detectam toda edição de saves, bots lentos ou adulteração do celular anfitrião.
- Recompensas já recebidas por snapshot são salvas no aparelho. Fechar forçadamente o anfitrião antes da sincronização pode perder a última recompensa ainda não recebida; não há servidor permanente nem recuperação em nuvem.
- Não há serviço de hospedagem em segundo plano. Mantenha o jogo do anfitrião aberto e a conexão ativa.

Fonte canônica: `game/www/`. Execute `npm run prepare:all` para regenerar HTMLs e o motor incorporado ao Android. Não edite os assets gerados diretamente.
