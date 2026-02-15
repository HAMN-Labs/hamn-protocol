# BACKLOG

Обновлено: 2026-02-16

## In Progress

| ID | Task | Area | Priority | Status | Owner | Notes |
|---|---|---|---|---|---|---|
| HAMN-016 | Вынести адреса локального деплоя в документированную `.env` схему | SDK | P2 | in-progress | codex | Сделать единый env-шаблон для e2e/dev |

## Next

| ID | Task | Area | Priority | Status | Owner | Notes |
|---|---|---|---|---|---|---|
| HAMN-020 | Добавить CI job для E2E (anvil + memory node + sdk e2e) | CI | P2 | next | unassigned | Закрыть риск отсутствия сквозной проверки |

## Planned

| ID | Task | Area | Priority | Status | Owner | Notes |
|---|---|---|---|---|---|-plan (gates, metrics, rollback criteria) | Ops | P2 | planned | unassigned | M4 |--|
| HAMN-036 | Canary rollout 
| HAMN-037 | Mainnet deployment checklist + go/no-go template | Ops/Governance | P1 | planned | unassigned | M5 |
| HAMN-021 | Добавить policy для автообновления process docs в PR checklist | Process | P3 | planned | unassigned | Усилить дисциплину обновления backlog/changelog |

## Done

| ID | Task | Area | Priority | Status | Owner | Notes |
|---|---|---|---|---|---|---|
| HAMN-010 | Добавить `GET /params` в core-engine | Core | P1 | done | codex | API синхронизирован с SDK |
| HAMN-011 | Добавить `Makefile` с локальным workflow | DX | P1 | done | codex | `make help`, `make test`, `make e2e` |
| HAMN-012 | Обновить root/contracts README под реальное состояние проекта | Docs | P2 | done | codex | Убраны шаблонные/устаревшие секции |
| HAMN-013 | Организовать единый dev-process в `docs/` | Process | P1 | done | codex | Созданы backlog/sprint/changelog/decisions/risks |
| HAMN-014 | Добавить верификацию `GET /params` интеграционным тестом | Core/SKD | P1 | done | codex | Добавлены проверки в unit (`MemoryClient`) и e2e script |
| HAMN-015 | Добавить make-таргет для полного E2E smoke (с проверкой health) | DX | P2 | done | codex | Добавлен `make e2e-smoke` с preflight health checks |
| HAMN-019 | Сконсолидировать legacy `doc/` в `docs/` + редиректы | Docs | P2 | done | codex | История перенесена в `docs/INTEGRATION_HISTORY.md` |
| HAMN-022 | Добавить `make process-check` | DX/Process | P1 | done | codex | Проверка обновления process docs при code changes |
| HAMN-030 | Phase 5 planning: Stylus Integration & Mainnet deployment | Protocol | P1 | done | codex | Создан master plan `docs/PHASE5_STYLUS_MAINNET_PLAN.md` |
| HAMN-031 | Stylus boundary spec v1 (data model + deterministic math) | Architecture | P1 | done | codex | Создан spec `docs/specs/stylus-boundary-v1.md` |
| HAMN-032 | Создать `stylus-engine/` skeleton + базовый CI pipeline | Core/CI | P1 | done | codex | Создан `stylus-engine` + `.github/workflows/stylus-engine.yml` |
| HAMN-033 | SDK dual mode: `legacy` / `stylus` (feature flag) | SDK | P1 | done | codex | Добавлены `mode` + валидация stylusVerifierAddress + тесты |
| HAMN-034 | Security threat model для Stylus + contract interactions | Security | P1 | done | codex | Создан `docs/security/stylus-threat-model-v1.md` |
| HAMN-035 | Testnet deployment runbook + smoke checklist | Ops | P2 | done | codex | Создан `docs/ops/testnet-deployment-runbook.md` |

## Icebox

| ID | Task | Area | Priority | Status | Owner | Notes |
|---|---|---|---|---|---|---|
| HAMN-018 | Привести `doc/` и `docs/` к единой структуре | Docs | P3 | idea | unassigned | В основном закрыто, следить за регрессией дублирования |
