# Canary Rollout Plan (Phase 5)

Статус: draft
Дата: 2026-02-16
Task: HAMN-036

## Objective

Провести контролируемый rollout stylus-enabled path перед mainnet go-live,
с четкими gate-критериями, метриками качества и rollback-процедурой.

## Rollout Stages

1. Stage C0: Internal dry-run
- Окружение: локальный/тестовый стек
- Цель: подтвердить корректность smoke, telemetry и alerting пайплайна

2. Stage C1: Testnet canary
- Окружение: Arbitrum testnet
- Трафик: ограниченный, synthetic + limited real-like
- Цель: проверить стабильность на реальной сети

3. Stage C2: Mainnet shadow/canary
- Окружение: mainnet
- Трафик: 1-5% stylus-enabled path (feature-gated)
- Цель: подтвердить SLO перед full rollout

4. Stage C3: Scale-up
- Трафик: 10% -> 25% -> 50% -> 100% (по результатам gate)

## Entry Criteria (per stage)

- Все обязательные CI checks green.
- Deployment runbook выполнен без critical warnings.
- Monitoring dashboards и alerts активны.
- Incident owner назначен и on-call доступен.

## Gate Metrics

## Reliability
- Tx success rate >= 99.5%
- Failed verification rate <= 0.5%
- No unresolved Sev-1 incidents

## Performance
- P95 verification latency within agreed budget
- No sustained degradation versus baseline legacy path > 10%

## Correctness
- Parity mismatch rate (off-chain vs stylus reference) = 0 for canary test vectors
- Reward anomaly alerts = 0 unresolved

## Security
- No open High/Critical findings from current threat model scope
- No unauthorized privileged operations detected

## Observation Window

- Minimum window per stage: 24h
- For C2 and above: 48h recommended
- Gate decision only after full observation window

## Rollback Criteria

Немедленный rollback/freeze если:
- Sev-1 incident triggered
- Tx success rate < 98.5% over 30 min
- Verified correctness mismatch in production path
- Reward distribution anomaly beyond threshold

## Rollback Actions

1. Disable stylus feature flag (fallback to legacy path).
2. Freeze sensitive owner operations if accounting integrity is uncertain.
3. Open incident and collect artifacts (tx hashes, logs, alerts timeline).
4. Publish internal postmortem and required fixes before retry.

## Roles

- Rollout owner: coordinates stage gates and final decision
- Security owner: validates security gate and incident severity
- Ops owner: monitors dashboards and executes rollback if needed
- Protocol owner: validates correctness and reward integrity

## Exit Criteria

- C2/C3 completed without blocking incidents.
- All gate metrics satisfied.
- Go/no-go recommendation prepared for mainnet full rollout.
