# Release Sign-Off Matrix

Статус: active
Дата: 2026-02-16
Task: HAMN-041

## Purpose

Зафиксировать обязательные approve-роли и критерии sign-off для перехода:
- testnet -> canary
- canary -> mainnet go/no-go
- mainnet go-live

## Required Roles

- **Protocol Owner**: корректность модели, compatibility, release scope.
- **Security Owner**: закрытие security gate, приемлемый уровень residual risk.
- **Ops Owner**: readiness мониторинга, runbooks, rollback readiness.
- **Optional Governance Approver**: требуется для high-impact релизов.

## Sign-Off Matrix

| Stage | Protocol Owner | Security Owner | Ops Owner | Governance | Notes |
|---|---|---|---|---|---|
| Testnet deployment approval | Required | Required | Required | Optional | Перед первым внешним rollout |
| Canary start (C1/C2) | Required | Required | Required | Optional | Перед включением feature flag |
| Canary scale-up (10% -> 25% -> 50% -> 100%) | Required | Required | Required | Optional | На каждый gate перехода |
| Mainnet GO decision | Required | Required | Required | Required* | `*` для high-impact или policy-triggered релизов |
| Emergency rollback decision | Required | Required | Required | Optional | Может выполняться ускоренно |

## Approval Criteria by Role

## Protocol Owner

- Boundary/version compatibility checked.
- Parity checks passed.
- Release scope соответствует утвержденному плану.

## Security Owner

- No open Critical/High findings in release scope.
- Threat model changes reviewed.
- Residual risks documented and accepted.

## Ops Owner

- Dashboards/alerts validated.
- On-call assigned.
- Rollback plan tested or rehearsed.

## Governance (when required)

- Change control policy satisfied.
- Multisig availability confirmed.

## Evidence Required

- Links to CI runs.
- Relevant checklists:
  - `docs/ops/mainnet-go-no-go-checklist.md`
  - `docs/ops/mainnet-deployment-ledger-template.md`
  - `docs/ops/post-deploy-verification-template.md`
- Incident/risk notes (if any).

## Recording Sign-Off

Рекомендуемый формат записи:

```text
Stage: <stage>
Release: <tag/sha>
Protocol Owner: <name> (approved at <UTC>)
Security Owner: <name> (approved at <UTC>)
Ops Owner: <name> (approved at <UTC>)
Governance: <name or N/A>
Decision: GO / NO-GO
Notes: <optional>
```
