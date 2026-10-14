# Clash Lara V10.8 — LMCP-S1 review and hardening

## Scope
Local engineering review inspired by LMCP-S1, not execution of the Lara Nexus official LMCP runtime. LMCP-S2 policy upgrades are staged for later offline evaluation, not self-modifying in production.

## Changes
- Snapshot/rollback of in-memory database for failed POST operations, reducing divergence after persistence failures.
- File-size cap on JSON database, configurable `CLASH_MAX_DB_BYTES` (default 8 MiB).
- fsync file and parent directory after atomic rename (platform permitting).
- Per-IP/per-username exponential login backoff, with bounded memory.
- Health endpoint identifies fixed LMCP policy version and storage footprint.

## Remaining risks / Red Team
- JSON is not transactional multi-process storage. Single-process serialization only. Migrate to SQLite with WAL and real transactions.
- Time remains host-monotonic, not independently attested online. Add trusted time synchronization.
- No HTTPS/TLS: bind to loopback and use a trusted reverse proxy before remote access.
- In-process sessions reset on restart, and password rotations need explicit account workflow.
- Device not tested on physical Tab S7; no thermal/battery/sleep reliability claims.
- LS2/LMCP official runtimes not available in this package.

## Commands
`node --check tab_s7_server.js` and `node test_v107.js` plus legacy tests.
