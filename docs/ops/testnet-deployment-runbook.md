# Testnet Deployment Runbook (Phase 5)

Статус: draft
Дата: 2026-02-16
Task: HAMN-035

## Purpose

Стандартизировать безопасный деплой Stylus-related изменений в Arbitrum testnet до canary/mainnet.

## Preconditions

- Утвержден `stylus-boundary-v1`.
- Текущий commit прошел:
  - `make test`
  - `cd stylus-engine && cargo test`
- Назначены роли:
  - deploy operator
  - reviewer/approver
  - incident responder

## Inputs

- RPC endpoint testnet
- deploy private key/multisig signer
- contract artifacts / ABI hashes
- expected addresses (registry/distributor/stylus verifier)

## Step-by-Step

1. Preflight checks
- Проверить актуальный git commit/tag.
- Проверить env vars и chain id.
- Сверить ABI checksum и expected bytecode hash.

2. Deploy contracts/modules
- Выполнить deployment script по runbook-командам.
- Зафиксировать tx hashes и deployed addresses.

3. Post-deploy configuration
- Прописать адреса в SDK env/config.
- Если включен stylus mode, установить `stylusVerifierAddress`.

4. Smoke verification
- Выполнить checklist (см. ниже).
- Зафиксировать результат и артефакты (tx receipts/logs).

5. Rollback decision
- Если smoke не пройден, активировать freeze/rollback процедуру.
- Если smoke пройден, пометить deployment как stable on testnet.

## Smoke Checklist

- [ ] `health` Memory Node отвечает 200.
- [ ] `query` возвращает корректный top-k.
- [ ] `registerPattern` проходит на testnet.
- [ ] `recordUsage` обновляет usage/reputation ожидаемо.
- [ ] `depositRewards` и `claimRewards` работают.
- [ ] stylus-enabled flow возвращает валидный verification output.
- [ ] parity sample: off-chain math и stylus reference совпадают на test vectors.

## Artifacts to Store

- deployment timestamp and operator
- contract addresses and tx hashes
- smoke logs
- incidents (if any) + resolution notes

## Failure Handling

- Severity High: inconsistent state, failed reward accounting, invalid verifier outputs.
- Action: stop rollout, freeze privileged operations, open incident report.

## Exit Criteria

- Smoke checklist complete.
- No high-severity issues unresolved.
- Addresses/config recorded in deployment ledger.
