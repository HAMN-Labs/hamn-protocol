# Release Dependency & Owner Map Template

Статус: active  
Дата: 2026-02-16  
Task: HAMN-046

## Purpose

Единый артефакт перед релизом, который фиксирует:
- критические зависимости release scope;
- владельцев и backup-владельцев;
- gate-критерии по каждой зависимости;
- fallback/rollback действие.

## Release Context

- Release version/tag:
- Commit SHA:
- Deployment window (UTC):
- Rollout owner:

## Dependency Map

| Component / Dependency | Owner | Backup Owner | Criticality (H/M/L) | Pre-Release Check | Runtime Signal | Fallback / Rollback Action |
|---|---|---|---|---|---|---|
| Stylus verifier contract |  |  | H | bytecode hash + parity passed | verifier mismatch / revert spikes | freeze writes + rollback to previous verified address |
| PatternRegistry contract |  |  | H | address + ABI hash verified | tx revert rate, event gaps | pause deployment sequence, investigate state |
| RewardDistributor contract |  |  | H | funded + code hash verified | claim/deposit failures | freeze rewards ops, execute rollback plan |
| Memory Node API |  |  | H | `/health` + `/params` pass | availability/latency degradation | route traffic to standby node |
| SDK config rollout (`mode=stylus`) |  |  | H | config diff approved | legacy traffic share > threshold | force config rollback, incident review |
| Monitoring & alerts |  |  | M | dashboards + thresholds reviewed | missing/late alerts | switch to manual watch and restore alerts |
| Multisig signer availability |  |  | H | signer confirmation recorded | signer unavailable in window | move window / NO-GO decision |

## Acceptance Gates

- [ ] Все зависимости `Criticality=H` имеют заполненных `Owner` и `Backup Owner`.
- [ ] Для каждой зависимости определены `Pre-Release Check` и `Runtime Signal`.
- [ ] Для каждой `H` зависимости описано `Fallback / Rollback Action`.
- [ ] Артефакт приложен к release PR и проверен на go/no-go review.

## Notes

- Рекомендуется использовать совместно с:
  - `docs/process/release-signoff-matrix.md`
  - `docs/process/release-readiness-review-checklist-template.md`
  - `docs/ops/mainnet-go-no-go-checklist.md`
