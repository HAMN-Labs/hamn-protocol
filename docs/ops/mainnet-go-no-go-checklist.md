# Mainnet Go/No-Go Checklist

Статус: draft
Дата: 2026-02-16
Task: HAMN-037

## Release Identity

- Release version/tag:
- Commit SHA:
- Planned deployment window (UTC):
- Rollout owner:

## Technical Readiness

- [ ] All required CI workflows green (`e2e`, `stylus-engine`, tests).
- [ ] Canary rollout stage complete and accepted.
- [ ] No open High/Critical issues in security scope.
- [ ] Parity checks passed for boundary test vectors.
- [ ] Contracts/artifacts hashes verified.
- [ ] Stylus path validated as primary serving path for release scope.
- [ ] Legacy path (if enabled) marked as emergency-only fallback with owner approval.

## Operational Readiness

- [ ] On-call rotation assigned for deployment window.
- [ ] Monitoring dashboards available and reviewed.
- [ ] Alert thresholds validated on testnet/canary.
- [ ] Rollback/freeze runbook reviewed by ops + protocol owners.

## Governance / Change Control

- [ ] Required approvers signed off (Protocol/Security/Ops).
- [ ] Multisig signers available during deployment window.
- [ ] Communication plan prepared (internal/external if needed).

## Deployment Plan

- [ ] Ordered transaction sequence documented.
- [ ] Expected addresses documented.
- [ ] Post-deploy smoke commands prepared.
- [ ] Stylus verifier address and SDK `mode=stylus` rollout config documented.

## Go/No-Go Criteria

GO only if all boxes above are checked.
If any critical checkbox is unchecked -> NO-GO.

## Final Decision

- Decision: GO / NO-GO
- Decision time (UTC):
- Decision owners:
- Notes:
