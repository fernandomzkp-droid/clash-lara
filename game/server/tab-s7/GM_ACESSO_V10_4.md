# Clash Lara V10.4 — Acesso por convite GM

## Inicialização local
Node 22+. Defina `CLASH_GM_PASSWORD` com senha forte (mínimo 16 caracteres) e opcionalmente `CLASH_GM_USERNAME`. Execute `node gm_access_server.js`. A conta GM é criada somente na primeira inicialização, no armazenamento privado do servidor. **Nunca coloque a senha GM no cliente, repositório ou ZIP.**

## API JSON
- POST `/api/gm/login`: `{ "username":"gm", "password":"..." }` → token Bearer (8 horas).
- POST `/api/gm/invites` (Bearer GM): `{ "hours":24,"count":1 }` → códigos de convite, mostrados uma vez.
- POST `/api/gm/register`: `{ "username":"jogador", "password":"senha de 12+ caracteres", "code":"CL-..." }` → cria conta PLAYER.
- POST `/api/gm/me` (Bearer): papel autenticado.
- POST `/api/gm/list` (Bearer GM): contas e convites sem segredos.
- POST `/api/gm/revoke` (Bearer GM): `{ "id":"id-do-convite" }`.
- GET `/api/gm/time`: relógio do servidor.

## Segurança
Convites aleatórios, hash SHA-256 no banco, uso único, expiração pelo relógio do servidor. Senhas com scrypt e salt individual. Tokens aleatórios armazenados como hash, sessões com prazo. Papel GM nunca é concedido por convite; nenhuma rota cria outro GM. Rate limit básico por IP. Arquivo `.gm_private.json` com permissão restrita; não distribuir.

## Limitações para produção
Serviço vinculado a 127.0.0.1 por padrão. Para expor na internet, adicionar HTTPS/TLS por proxy, proteção CSRF/cookies se usar autenticação por cookie, limite distribuído de tentativas, bloqueio progressivo, backups e logs persistentes, auditoria de segurança, rotação de senhas/tokens e integração com backend real. A versão demonstrativa não garante segurança de produção. O backend do treinador V10.3 é separado; integrar identidades com ele no Codex.
