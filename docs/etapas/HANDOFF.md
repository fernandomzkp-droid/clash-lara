# Integração das etapas — beta 0.9

## Etapa 1: serviço opcional Tab S7

Node >=22.13 (SQLite nativo). `CLASH_GM_PASSWORD` obrigatório, mínimo16 caracteres. `CLASH_GM_USERNAME` opcional (padrão gm), `CLASH_DB` aponta o JSON legado, `HOST` padrão127.0.0.1, `PORT` padrão8787. Para a LAN, escolha explicitamente o endereço privado do tablet. Execute `npm run tab:host`. O painel HTTP é destinado a LAN confiável; não publicar na internet. Nenhuma conta extra foi criada nesta entrega.

O serviço usa `<CLASH_DB>.sqlite`, WAL, synchronous FULL, revisão contra escrita concorrente e mutações serializadas. Migra JSON existente uma vez e preserva `.pre-sqlite.bak`. O banco inicial contém só o GM configurado. Reinício invalida tokens e pausa treino sem conceder tempo desligado. Rate limit:30 POST/min/IP, fila64, login com espera progressiva. Métricas públicas aproximadas em `/api/v1/host-vitals`; não medem temperatura/bateria/FPS.

Contrato v1, JSON, Bearer de8h. GET `/api/v1/health`, `/time`, `/host-vitals`; POST `/api/v1/login`, `/register`, `/logout`, `/invites`, `/invites/revoke`, `/trainer`, `/player`, `/classes`. Sufixos antigos `/api/...` continuam compatíveis. Trainer aceita action status/select/start/pause e className nas dez classes. Conta e tempo são do servidor. Convite só pode ser consumido uma vez. `/equipment` e `/combat/events` autenticados devolvem501: não há backend competitivo completo. Não recebe XP arbitrário ou save offline. Painel continua em `/`.

Backup consistente: com serviço parado, abra Store usando o mesmo caminho JSON e chame `.backup('/caminho/novo.sqlite')`, depois `.close()`. Restauração: pare o processo, preserve banco/WAL/SHM atuais, restaure backup verificado como `<CLASH_DB>.sqlite` sem WAL/SHM antigos, reinicie. Rollback de software: use o JSON `.pre-sqlite.bak` com a versão anterior, sabendo que alterações posteriores à migração não estão nele. Não remover arquivos durante execução. Corrupção não é convertida silenciosamente em conta vazia.

Não houve execução oficial de LS2/LMCP, que não vêm nos arquivos. Testes automatizados de persistência cobrem migração, crash SIGKILL antes de commit, concorrência de revisões e recuperação de backup. Testes HTTP cobrem convites concorrentes, reinício e isolamento de contas. Homologação no Tab S7 físico pendente.

## Etapa 2: cliente Android

Treinador offline independente do nível de combate:1h,10h,100h... por nível, teto9, até7dias de crédito por abertura. Uma classe ativa. Save local; horário do dispositivo não atesta progresso competitivo. Sala Bluetooth/Wi-Fi mantém níveis de combate da beta anterior, e não mistura contas do Tab S7.

Catálogo de200modelos vetoriais parametrizados ×8elementos ×13níveis visuais (20800combinações), não20800sprites desenhados. Aparência é cosmética e não concede equipamento.80falas originais com TTS local e cooldown; disponibilidade/timbre dependem do Android. Perfis Eco/Equilibrado/Alto e movimento reduzido. Referências PNG dos ZIPs não são sprites finais e não são embarcadas.

Ficam pendentes do projeto maior:2400talentos, arena10×10, bots adaptativos, integração competitiva do treinador com equipamentos/combate e redesenho de todos os golpes para telegraph/cast/projétil/colisão. O combate existente é preservado nesta integração, sem prometer essas mecânicas.
