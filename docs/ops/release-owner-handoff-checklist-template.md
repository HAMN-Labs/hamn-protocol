# Release Owner Handoff Checklist Template

Статус: active  
Дата: 2026-02-16  
Task: HAMN-048

## Context

- Release version/tag:
- Commit SHA:
- Handoff type: `pre-deploy` / `post-deploy`
- Outgoing owner:
- Incoming owner:
- Handoff time (UTC):

## Pre-Deploy Handoff

- [ ] Deployment plan reviewed (`ordered tx sequence`, `addresses`, `window`).
- [ ] Runbooks confirmed:
  - [ ] `docs/ops/testnet-deployment-runbook.md`
  - [ ] `docs/ops/canary-rollout-plan.md`
  - [ ] `docs/ops/mainnet-go-no-go-checklist.md`
- [ ] Stylus-first policy acknowledged (`mode=stylus`, legacy emergency-only).
- [ ] Required env/secrets validated (RPC, signer access, verifier address).
- [ ] Monitoring dashboards/alerts verified and linked.
- [ ] Incident commander + on-call chain confirmed.

## Post-Deploy Handoff

- [ ] Deployment ledger updated (addresses, tx hashes, owners).
- [ ] Post-deploy verification completed and artifacts attached.
- [ ] Canary scorecard attached (if release stage includes canary).
- [ ] Known issues / temporary mitigations documented.
- [ ] Rollback readiness status confirmed.
- [ ] External/internal communications delivered (if required).

## Open Risks & Follow-Ups

| Risk / Follow-up | Severity | Owner | ETA | Status |
|---|---|---|---|---|
|  |  |  |  |  |

## Sign-Off

- Outgoing owner:
- Incoming owner:
- Protocol owner:
- Ops owner:
