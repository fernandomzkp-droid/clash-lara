# Clash Lara — beta Android 0.8, código-fonte

**Estado desta entrega:** código alterado e testes de domínio executados. APK ainda NÃO compilado. Bluetooth/Wi-Fi nativos ainda NÃO testados em celulares. O ambiente de edição não tinha SDK Android nem Gradle, e os pedidos de download não chegaram a executar. Não considere esta entrega um APK pronto.

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
3. Quando terminar com sucesso, baixe o artefato **Clash-Lara-Beta-APK**, extraia e instale `Clash-Lara-Beta.apk`.
4. Envie esse APK aos amigos como documento pelo WhatsApp.

Esse workflow foi incluído, mas não foi executado nesta sessão. Ele necessita disponibilidade do GitHub Actions na sua conta. O APK usa assinatura de debug para testes; recompilações com outra chave não atualizam uma instalação existente. Guarde a mesma chave de assinatura para atualizações que preservem dados.

Alternativa: JDK 17/21 + SDK Android 35 + Gradle 8.9; execute `tools/build-android.sh`, ou abra `android/` no Android Studio, depois de `npm run prepare:all`.

## Jogar por Bluetooth, depois de compilar

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

- Código nativo ainda depende de compilação e testes em dois aparelhos. Não há garantia de funcionamento Bluetooth/Wi-Fi antes dessa validação.
- A sala confia no personagem offline importado para cooperação entre amigos. Sanitização e rate limit não detectam toda edição de saves, bots lentos ou adulteração do celular anfitrião.
- Recompensas já recebidas por snapshot são salvas no aparelho. Fechar forçadamente o anfitrião antes da sincronização pode perder a última recompensa ainda não recebida; não há servidor permanente nem recuperação em nuvem.
- Não há serviço de hospedagem em segundo plano. Mantenha o jogo do anfitrião aberto e a conexão ativa.

Fonte canônica: `game/www/`. Execute `npm run prepare:all` para regenerar HTMLs e o motor incorporado ao Android. Não edite os assets gerados diretamente.
