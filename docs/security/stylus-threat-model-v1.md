# Stylus Threat Model v1

Статус: draft
Дата: 2026-02-16
Task: HAMN-034

## Scope

Компоненты:
- off-chain `core-engine` (candidate retrieval)
- SDK (`legacy`/`stylus` mode switching)
- on-chain Stylus verification module (planned)
- Solidity settlement contracts (`PatternRegistry`, `RewardDistributor`)

## Security Objectives

- Детерминированность расчета score/reward weight.
- Невозможность подмены/искажения входов в verification pipeline.
- Защита средств в staking/reward контурах.
- Контролируемый rollout/rollback для mainnet.

## Assets

- Stake пользователей в `PatternRegistry`.
- Reward pool в `RewardDistributor`.
- Достоверность score/freshness/reputation сигналов.
- Integrity конфигурации SDK mode (`legacy` vs `stylus`).

## Trust Boundaries

1. Off-chain node -> on-chain verifier.
2. SDK client -> RPC provider.
3. Owner/admin operations -> contract state.
4. Deployment pipeline -> mainnet contracts.

## Threats and Mitigations

## T1: Input spoofing from off-chain to on-chain verifier

Risk:
- злоумышленник подает crafted verification input для повышения rewards.

Mitigations:
- canonical input schema (`docs/specs/stylus-boundary-v1.md`);
- strict range checks + reason codes on-chain;
- (next) signed payload policy for node-originated verification messages.

## T2: Arithmetic divergence (off-chain Rust vs Stylus)

Risk:
- разные результаты math => спорное начисление наград и potential griefing.

Mitigations:
- fixed-point only (`SCALE=1_000_000`), no float;
- parity test vectors (golden + boundary + monotonicity);
- versioned math params and explicit migration policy.

## T3: Reward inflation due to edge-case parameters

Risk:
- экстремальные `usage_count`, `lambda`, `dt` вызывают аномальный reward weight.

Mitigations:
- input caps (`range checks`);
- saturating math and overflow-safe ops;
- canary monitoring: reward anomaly alerts.

## T4: Privileged misuse (owner-only functions)

Risk:
- неправильные owner действия (slash/accrue/deploy config changes).

Mitigations:
- multisig owner for production;
- staged governance for sensitive operations;
- runbook with go/no-go controls and peer sign-off.

## T5: Mode confusion in SDK clients

Risk:
- клиент думает, что работает в `stylus`, но фактически использует legacy flow.

Mitigations:
- explicit `mode` in config;
- hard validation: `stylus` mode requires verifier address;
- runtime observability tags by mode.

## T6: Upgrade/deployment misconfiguration

Risk:
- неправильные адреса, ABI mismatch, broken adapters.

Mitigations:
- deployment checklist with preflight checks;
- smoke suite after deploy;
- rollback/freeze procedure.

## Security Test Requirements

- Unit tests for input validation codes.
- Property tests for monotonicity and range invariants.
- Differential parity tests: off-chain vs stylus-engine reference.
- Rehearsal deployment on testnet with monitoring enabled.

## Residual Risks

- Signed-payload scheme еще не утверждена.
- Нет внешнего аудита для Stylus path (обязательно до mainnet gate).

## Exit Gate for HAMN-034

- Threat model document approved.
- Каждая критичная угроза имеет owner и mitigation ticket.
- Security checklist linked to canary/mainnet runbooks.
