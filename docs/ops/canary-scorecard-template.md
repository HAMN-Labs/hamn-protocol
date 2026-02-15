# Canary Scorecard Template

Статус: active  
Дата: 2026-02-16  
Task: HAMN-047

## Release Context

- Release version/tag:
- Commit SHA:
- Canary window (UTC):
- Scorecard owner:

## Gate Summary

| Gate | Status (PASS/WARN/FAIL) | Evidence Link / Artifact | Owner | Notes |
|---|---|---|---|---|
| Deployment integrity |  |  |  | |
| Stylus parity checks |  |  |  | |
| Query correctness |  |  |  | |
| Rewards flow correctness |  |  |  | |
| Error budget / SLO |  |  |  | |
| Security alerts |  |  |  | |
| Rollback readiness |  |  |  | |

## Metrics Snapshot

| Metric | Target | Observed | Status | Source |
|---|---|---|---|---|
| Query success rate | >= 99.0% |  |  | |
| P95 query latency | <= threshold |  |  | |
| Stylus verifier error rate | <= threshold |  |  | |
| Tx revert rate (registry/distributor) | <= threshold |  |  | |
| Incidents Sev1/Sev2 | 0 |  |  | |
| Legacy fallback traffic share | 0% baseline |  |  | |

## Decision

- Final canary decision: `PROMOTE` / `HOLD` / `ROLLBACK`
- Decision timestamp (UTC):
- Decision owners:
- Follow-up actions:

## Sign-Off

- Protocol owner:
- Security owner:
- Ops owner:
