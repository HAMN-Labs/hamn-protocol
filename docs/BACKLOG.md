# BACKLOG

Обновлено: 2026-02-16

## In Progress

| ID | Task | Area | Priority | Status | Owner | Notes |
|---|---|---|---|---|---|---|
| HAMN-040 | Добавить post-deploy verification script template | Ops/QA | P3 | in-progress | codex | Сформировать reusable шаблон smoke/parity post-deploy проверки |

## Next

| ID | Task | Area | Priority | Status | Owner | Notes |
|---|---|---|---|---|---|---|
| HAMN-041 | Добавить release sign-off matrix (Protocol/Security/Ops) | Governance | P3 | next | unassigned | Формализовать обязательные approve роли |

## Planned

| ID | Task | Area | Priority | Status | Owner | Notes |
|---|---|---|---|---|---|---|
| HAMN-042 | Добавить incident postmortem template для rollout инцидентов | Ops | P3 | planned | unassigned | Единый формат RCA после canary/mainnet |

## Done

| ID | Task | Area | Priority | Status | Owner | Notes |
|---|---|---|---|---|---|---|
| HAMN-010 | Добавить `GET /params` в core-engine | Core | P1 | done | codex | API синхронизирован с SDK |
| HAMN-011 | Добавить `Makefile` с локальным workflow | DX | P1 | done | codex | `make help`, `make test`, `make e2e` |
| HAMN-012 | Обновить root/contracts README под реальное состояние проекта | Docs | P2 | done | codex | Убраны шаблонные/устаревшие секции |
| HAMN-013 | Организовать единый dev-process в `docs/` | Process | P1 | done | codex | Созданы backlog/sprint/changelog/decisions/risks |
| HAMN-014 | Добавить верификацию `GET /params` интеграционным тестом | Core/SKD | P1 | done | codex | Добавлены проверки в unit (`MemoryClient`) и e2e script |
| HAMN-015 | Добавить make-таргет для полного E2E smoke (с проверкой health) | DX | P2 | done | codex | Добавлен `make e2e-smoke` с preflight health checks |
| HAMN-016 | Вынести адреса локального деплоя в документированную `.env` схему | SDK | P2 | done | codex | Добавлен `.env.example` + Makefile читает `.env` |
| HAMN-019 | Сконсолидировать legacy `doc/` в `docs/` + редиректы | Docs | P2 | done | codex | История перенесена в `docs/INTEGRATION_HISTORY.md` |
| HAMN-020 | Добавить CI job для E2E (anvil + memory node + sdk e2e) | CI | P2 | done | codex | Добавлен `.github/workflows/e2e.yml` |
| HAMN-021 | Добавить policy для автообновления process docs в PR checklist | Process | P3 | done | codex | Добавлены `.github/PULL_REQUEST_TEMPLATE.md` и `docs/process/PR_POLICY.md` |
| HAMN-022 | Добавить `make process-check` | DX/Process | P1 | done | codex | Проверка обновления process docs при code changes |
| HAMN-030 | Phase 5 planning: Stylus Integration & Mainnet deployment | Protocol | P1 | done | codex | Создан master plan `docs/PHASE5_STYLUS_MAINNET_PLAN.md` |
| HAMN-031 | Stylus boundary spec v1 (data model + deterministic math) | Architecture | P1 | done | codex | Создан spec `docs/specs/stylus-boundary-v1.md` |
| HAMN-032 | Создать `stylus-engine/` skeleton + базовый CI pipeline | Core/CI | P1 | done | codex | Создан `stylus-engine` + `.github/workflows/stylus-engine.yml` |
| HAMN-033 | SDK dual mode: `legacy` / `stylus` (feature flag) | SDK | P1 | done | codex | Добавлены `mode` + валидация stylusVerifierAddress + тесты |
| HAMN-034 | Security threat model для Stylus + contract interactions | Security | P1 | done | codex | Создан `docs/security/stylus-threat-model-v1.md` |
| HAMN-035 | Testnet deployment runbook + smoke checklist | Ops | P2 | done | codex | Создан `docs/ops/testnet-deployment-runbook.md` |
| HAMN-036 | Canary rollout plan (gates, metrics, rollback criteria) | Ops | P2 | done | codex | Создан `docs/ops/canary-rollout-plan.md` |
| HAMN-037 | Mainnet deployment checklist + go/no-go template | Ops/Governance | P1 | done | codex | Созданы `docs/ops/mainnet-go-no-go-checklist.md` и `docs/ops/mainnet-go-no-go-template.md` |
| HAMN-038 | Добавить parity test-vectors JSON для stylus-boundary-v1 | Core/QA | P2 | done | codex | Создан `docs/specs/test-vectors/stylus-boundary-v1.json` + test `stylus-engine/tests/parity_vectors.rs` |
| HAMN-039 | Добавить mainnet deployment ledger template (addresses/tx hashes/owners) | Ops | P2 | done | codex | Создан `docs/ops/mainnet-deployment-ledger-template.md` |

## Icebox

| ID | Task | Area | Priority | Status | Owner | Notes |
|---|---|---|---|---|---|---|
| HAMN-018 | Привести `doc/` и `docs/` к единой структуре | Docs | P3 | idea | unassigned | В основном закрыто, следить за регрессией дублирования |
