# Post-Deploy Verification Template

Статус: active
Дата: 2026-02-16
Task: HAMN-040

## Files

- Script: `docs/ops/post-deploy-verification-template.sh`
- Purpose: быстрые проверки после деплоя (RPC, health, deployed bytecode, optional e2e smoke)

## Required Env

- `ANVIL_RPC`
- `MEMORY_NODE_URL`
- `REGISTRY_ADDR`
- `DISTRIBUTOR_ADDR`

## Optional Env

- `STYLUS_VERIFIER_ADDRESS` (для Phase 5 mainnet/canary считать required)
- `EXPECT_CHAIN_ID` (hex, e.g. `0xa4b1`)
- `RUN_E2E_SMOKE=1`

## Example

```bash
export ANVIL_RPC=https://arb1.example
export MEMORY_NODE_URL=https://memory-node.example
export REGISTRY_ADDR=0x...
export DISTRIBUTOR_ADDR=0x...
export STYLUS_VERIFIER_ADDRESS=0x...
export EXPECT_CHAIN_ID=0xa4b1
export RUN_E2E_SMOKE=1

bash docs/ops/post-deploy-verification-template.sh
```

## Expected Output

- `[PASS]` по health/RPC/contract-code проверкам
- optional `[PASS] make e2e-smoke completed` если включен `RUN_E2E_SMOKE`

## Notes

- Скрипт intentionally fail-fast (`set -euo pipefail`).
- Для Stylus-first rollout baseline-сценарий: smoke в SDK `mode=stylus`, legacy только для incident fallback.
- Для mainnet используйте его вместе с:
  - `docs/ops/mainnet-go-no-go-checklist.md`
  - `docs/ops/mainnet-deployment-ledger-template.md`
