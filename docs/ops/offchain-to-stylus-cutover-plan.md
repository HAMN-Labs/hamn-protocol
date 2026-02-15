# Off-chain to Stylus Cutover & Freeze Plan

Статус: active
Дата: 2026-02-16
Task: HAMN-054

## Objective

Безопасно переключить primary execution path с off-chain logic на Stylus path,
с контролируемым freeze legacy логики и возможностью быстрого rollback.

## Scope

- Primary path switch: SDK/ops routing -> stylus-first.
- Legacy path freeze: запрет функциональных изменений (только hotfix fallback).
- Stage-based cutover with explicit gates and rollback triggers.

## Preconditions

- `HAMN-051`, `HAMN-052`, `HAMN-053` completed.
- Parity harness and vectors are green.
- Runbooks and sign-off matrix are available.

## Cutover Stages

## C0: Readiness Freeze (Preparation)

Actions:
- Freeze new feature work in legacy off-chain path.
- Merge only migration-critical fixes.
- Validate CI + parity + smoke.

Gate to C1:
- All mandatory CI checks green.
- No open P0/P1 issues in migration scope.

## C1: Shadow / Dual Verification

Actions:
- Execute stylus path in parallel (non-authoritative).
- Compare outputs vs legacy through parity harness.
- Collect mismatch report.

Gate to C2:
- Mismatch rate within accepted threshold (target: 0 for critical vectors).
- No Sev-1/Sev-2 incidents during observation window.

## C2: Controlled Primary Switch (Canary)

Actions:
- Enable stylus-first for limited traffic slice.
- Keep legacy fallback enabled.
- Monitor gate metrics continuously.

Gate to C3:
- Tx success rate and latency within SLO.
- No unresolved correctness anomalies.

## C3: Full Primary Switch

Actions:
- Raise stylus-first routing to 100%.
- Retain legacy fallback flag only for emergency.
- Lock legacy logic branch for non-emergency merges.

Gate to C4:
- Stable operation over defined observation window.
- Go/no-go owners confirm post-cutover health.

## C4: Legacy Freeze (Operational)

Actions:
- Legacy path set to frozen state (maintenance-only).
- Any legacy change requires explicit exception approval.
- Start decommission planning (HAMN-056).

## Freeze Policy

Legacy freeze means:
- No feature additions.
- No behavior-changing refactors.
- Only emergency fixes for security/stability.
- Mandatory owner approvals for exceptions:
  - Protocol Owner
  - Security Owner
  - Ops Owner

## Rollback Triggers

Immediate rollback to legacy fallback if any:
- Sev-1 incident.
- Correctness/parity mismatch on critical path.
- Sustained SLO breach beyond threshold window.
- Reward accounting anomaly.

## Rollback Procedure

1. Toggle routing to legacy fallback.
2. Announce incident and freeze further cutover steps.
3. Capture evidence (logs, tx hashes, mismatch reports).
4. Run post-incident template and define corrective actions.

## Required Artifacts

- `docs/ops/canary-rollout-plan.md`
- `docs/ops/mainnet-go-no-go-checklist.md`
- `docs/ops/mainnet-deployment-ledger-template.md`
- `docs/ops/post-deploy-verification-template.md`
- `docs/ops/incident-postmortem-template.md`
- `docs/process/release-signoff-matrix.md`

## Ownership

- Cutover owner: coordinates stage transitions.
- Protocol owner: validates correctness/parity gates.
- Security owner: validates risk/security gates.
- Ops owner: validates SLO/monitoring and executes rollback if needed.

## Exit Criteria

- Stylus path is stable as primary route.
- Legacy path is frozen under maintenance-only policy.
- All cutover artifacts logged and signed off.
